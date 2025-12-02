const http = require('http');

function get(path){
  return new Promise((resolve,reject)=>{
    http.get({ hostname:'127.0.0.1', port:8080, path }, res=>{ let body=''; res.on('data', c=> body+=c); res.on('end', ()=> resolve({status:res.statusCode, body})); }).on('error', reject);
  });
}

function post(path, data){
  return new Promise((resolve,reject)=>{
    const d = JSON.stringify(data);
    const opts = { hostname:'127.0.0.1', port:8080, path, method:'POST', headers:{ 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(d) } };
    const req = http.request(opts, res=>{ let body=''; res.on('data', c=> body+=c); res.on('end', ()=> resolve({status:res.statusCode, body})); });
    req.on('error', reject); req.write(d); req.end();
  });
}

(async ()=>{
  try{
    const r = await get('/api/units?lang=es');
    if(r.status!==200){ console.error('units failed', r.status); process.exit(1); }
    const j = JSON.parse(r.body);
    if(!Array.isArray(j.units) || j.units.length===0){ console.error('units empty'); process.exit(2); }
    // test progress complete
    const save = await post('/api/progress/complete', { id:'unit-test-id', lang:'es', unitId:j.units[0].id, awardXP:50 });
    if(save.status!==200){ console.error('progress complete failed', save.status); process.exit(3); }
    const sjson = JSON.parse(save.body);
    if(!(sjson.progress && sjson.progress.xp>=50)) { console.error('xp not awarded'); process.exit(4); }
    console.log('OK'); process.exit(0);
  }catch(e){ console.error('ERROR', e); process.exit(10); }
})();
