const http = require('http');

function post(path, data){
  return new Promise((resolve,reject)=>{
    const d = JSON.stringify(data);
    const opts = { hostname:'127.0.0.1', port:8080, path, method:'POST', headers:{ 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(d) } };
    const req = http.request(opts, res=>{ let body=''; res.on('data', c=> body+=c); res.on('end', ()=> resolve({status:res.statusCode, body})); });
    req.on('error', reject); req.write(d); req.end();
  });
}

function get(path){
  return new Promise((resolve,reject)=>{
    http.get({ hostname:'127.0.0.1', port:8080, path }, res=>{ let body=''; res.on('data', c=> body+=c); res.on('end', ()=> resolve({status:res.statusCode, body})); }).on('error', reject);
  });
}

(async ()=>{
  try{
    // test dict (GET)
    const r = await get('/api/dict?lang=en&word=student');
    if(r.status!==200) { console.error('dict failed', r.status); process.exit(1); }
    const j = JSON.parse(r.body);
    if(!j.extract) { console.error('no extract'); process.exit(2); }
    // test sync save/load
    const save = await post('/api/sync/save', { id:'test-id', progress:{ test:1 } });
    if(save.status!==200) { console.error('save failed'); process.exit(3); }
    const load = await get('/api/sync/load?id=test-id');
    if(load.status!==200) { console.error('load failed'); process.exit(4); }
    console.log('OK'); process.exit(0);
  }catch(e){ console.error('ERROR', e); process.exit(10); }
})();
