// Simple server with an AI endpoint. By default replies are mocked locally.
// If OPENAI_API_KEY is set in environment, it will proxy to OpenAI's Chat Completion API.
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (global.fetch) ? global.fetch : require('node-fetch');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const AI_NAME = process.env.IA_NAME || 'EdusBot';

app.post('/api/ai', async (req, res) => {
  const { message } = req.body || {};
  if(!message) return res.status(400).json({ error: 'No message' });

  // If an OpenAI key is provided, forward the request (simple proxy). Otherwise return a mock reply.
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if(OPENAI_KEY){
    try{
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: `Eres ${AI_NAME}, un asistente útil y conciso.` },
            { role: 'user', content: message }
          ],
          max_tokens: 400,
        })
      });
      const data = await resp.json();
      const reply = data?.choices?.[0]?.message?.content || 'No hay respuesta.';
      return res.json({ reply });
    }catch(err){
      console.error('OpenAI proxy error:', err);
      return res.status(500).json({ reply: 'Error en el proveedor de IA.' });
    }
  }

  // Mock behavior: simple keyword responses or echo
  const msg = message.toLowerCase();
  let reply = '';
  if(msg.includes('hola') || msg.includes('buenas')) reply = `Hola — soy ${AI_NAME}. ¿Cómo puedo ayudarte hoy?`;
  else if(msg.includes('ayuda') || msg.includes('como') || msg.includes('cómo')) reply = `Puedo explicar temas, resolver ejercicios sencillos o guiarte para usar la app. Prueba: "Explícame la ley de Ohm".`;
  else if(msg.match(/\d+\s*\+\s*\d+/)){
    try{ reply = String(eval(msg)); }catch(e){ reply = "No pude calcular eso."; }
  }
  else reply = `Entiendo: "${message}" — (respuesta de ejemplo).`; 

  return res.json({ reply });
});

// Simple dictionary proxy using Wiktionary extracts per language
const fs = require('fs');
const path = require('path');
const cache = new Map();
app.get('/api/dict', async (req, res) => {
  const { lang = 'en', word } = req.query;
  if(!word) return res.status(400).json({ error: 'word required' });
  const key = `${lang}:${word.toLowerCase()}`;
  if(cache.has(key)) return res.json({ word, extract: cache.get(key) });
  try{
    const host = `${lang}.wiktionary.org`;
    const url = `https://${host}/w/api.php?action=query&prop=extracts&format=json&explaintext=1&redirects=1&titles=${encodeURIComponent(word)}`;
    const r = await fetch(url);
    const j = await r.json();
    const pages = j.query && j.query.pages;
    const firstKey = pages && Object.keys(pages)[0];
    let extract = '';
    if(firstKey && pages[firstKey].extract){
      extract = pages[firstKey].extract.split('\n').slice(0,6).join('\n');
    }
    if(!extract) extract = 'No se encontró definición en Wiktionary.';
    cache.set(key, extract);
    return res.json({ word, extract });
  }catch(err){
    console.error('dict error', err);
    return res.status(500).json({ error: 'dictionary lookup failed' });
  }
});

// Sync endpoints: save/load progress to a data folder (very simple, no auth)
const DATA_DIR = path.join(__dirname, 'data');
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

app.post('/api/sync/save', (req, res)=>{
  const { id, progress } = req.body || {};
  if(!id || !progress) return res.status(400).json({ error: 'id and progress required' });
  const file = path.join(DATA_DIR, `${id}.json`);
  try{
    fs.writeFileSync(file, JSON.stringify({ progress, savedAt: new Date().toISOString() }, null, 2));
    return res.json({ ok: true, id });
  }catch(e){ console.error(e); return res.status(500).json({ error: 'save failed' }); }
});

app.get('/api/sync/load', (req, res)=>{
  const id = req.query.id;
  if(!id) return res.status(400).json({ error: 'id required' });
  const file = path.join(DATA_DIR, `${id}.json`);
  if(!fs.existsSync(file)) return res.status(404).json({ error: 'not found' });
  try{
    const content = JSON.parse(fs.readFileSync(file,'utf8'));
    return res.json(content);
  }catch(e){ console.error(e); return res.status(500).json({ error: 'load failed' }); }
});

// Units / skills endpoint
app.get('/api/units', (req, res)=>{
  const lang = (req.query.lang||'es').toLowerCase();
  try{
    const unitsFile = path.join(DATA_DIR, 'units.json');
    if(!fs.existsSync(unitsFile)) return res.json({ units: [] });
    const units = JSON.parse(fs.readFileSync(unitsFile,'utf8'));
    return res.json({ units: units[lang] || [] });
  }catch(e){ console.error(e); return res.status(500).json({ error:'units_load_failed' }); }
});

// Mark lesson/unit completed (merges into saved progress file if id provided)
app.post('/api/progress/complete', (req, res)=>{
  const { id, lang, unitId, lessonId, awardXP } = req.body || {};
  if(!id) return res.status(400).json({ error:'id required' });
  const file = path.join(DATA_DIR, `${id}.json`);
  let content = { progress: {} };
  if(fs.existsSync(file)){
    try{ content = JSON.parse(fs.readFileSync(file,'utf8')); }catch(e){ console.error('read fail',e); }
  }
  content.progress = content.progress || {};
  content.progress[lang] = content.progress[lang] || { completedUnits: [], xp:0, streak:0 };
  const prog = content.progress[lang];
  prog.completedUnits = prog.completedUnits || [];
  if(unitId && !prog.completedUnits.includes(unitId)) prog.completedUnits.push(unitId);
  if(awardXP) prog.xp = (prog.xp||0) + awardXP;
  prog.lastUpdated = new Date().toISOString();
  try{ fs.writeFileSync(file, JSON.stringify(content, null, 2)); return res.json({ ok:true, progress: prog }); }
  catch(e){ console.error(e); return res.status(500).json({ error:'save_failed' }); }
});

// TTS endpoint: proxy to OpenAI TTS if OPENAI_API_KEY provided. Otherwise 501.
app.post('/api/tts', async (req, res)=>{
  const { text, lang='en' } = req.body || {};
  if(!text) return res.status(400).json({ error:'text required' });
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if(!OPENAI_KEY){
    return res.status(501).json({ error:'Server-side TTS not configured. Set OPENAI_API_KEY to enable.' });
  }
  try{
    // Example proxy to OpenAI audio/speech endpoint (model may vary). This returns binary audio data
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'alloy', input: text, language: lang })
    });
    if(!response.ok){ const t = await response.text(); console.error('tts err', t); return res.status(500).json({ error:'tts_failed' }); }
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type','audio/mpeg');
    return res.send(Buffer.from(arrayBuffer));
  }catch(err){ console.error('tts proxy error', err); return res.status(500).json({ error:'tts_error' }); }
});

const port = process.env.PORT || 8080;
app.listen(port, ()=> console.log(`Server running on http://0.0.0.0:${port} — IA: ${AI_NAME}`));
