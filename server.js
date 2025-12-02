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

const port = process.env.PORT || 8080;
app.listen(port, ()=> console.log(`Server running on http://0.0.0.0:${port} — IA: ${AI_NAME}`));
