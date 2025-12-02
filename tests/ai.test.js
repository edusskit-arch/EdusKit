// Simple test script that POSTs to /api/ai and checks for a reply.
const http = require('http');

function send(msg){
  return new Promise((resolve, reject)=>{
    const data = JSON.stringify({ message: msg });
    const opts = {
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/ai',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = http.request(opts, res=>{
      let body='';
      res.on('data', c=> body+=c);
      res.on('end', ()=>{
        try{ const j=JSON.parse(body); resolve(j); }catch(e){ reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async function(){
  try{
    const r = await send('ping');
    if(r && (r.reply || r.answer)){
      console.log('OK - reply:', r.reply || r.answer);
      process.exit(0);
    }
    console.error('FAIL - no reply');
    process.exit(2);
  }catch(e){
    console.error('ERROR contacting /api/ai:', e.message || e);
    process.exit(3);
  }
})();
