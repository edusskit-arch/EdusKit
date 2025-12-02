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

const port = process.env.PORT || 8080;
app.listen(port, ()=> console.log(`Server running on http://0.0.0.0:${port} — IA: ${AI_NAME}`));
