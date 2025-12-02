// ----- Tabs -----
const TAB_NAMES = ["Inicio","Matemáticas","Química","Física","Idiomas"];
const tabsNav = document.getElementById("tabs");
const panels = [...document.querySelectorAll(".panel")];

TAB_NAMES.forEach(name=>{
  const b=document.createElement("button");
  b.className="tab-btn"+(name==="Inicio"?" active":"");
  b.textContent=name;
  b.onclick=()=>setTab(name);
  tabsNav.appendChild(b);
});
function setTab(name){
  [...tabsNav.children].forEach(b=>b.classList.toggle("active", b.textContent===name));
  panels.forEach(p=>p.classList.toggle("active", p.dataset.tab===name));
}

// ----- Matemáticas -----
const ops=["+","-","×","÷"];
let currentMath=null;

function newMath(){
  const a=Math.floor(Math.random()*20)+1;
  const b=Math.floor(Math.random()*20)+1;
  const op=ops[Math.floor(Math.random()*ops.length)];
  let ans;
  switch(op){
    case "+": ans=a+b; break;
    case "-": ans=a-b; break;
    case "×": ans=a*b; break;
    case "÷": ans=+(a/b).toFixed(2); break;
  }
  currentMath={a,b,op,ans};
  document.getElementById("mathProblem").textContent=`${a} ${op} ${b} = ?`;
  document.getElementById("mathAnswer").value="";
  document.getElementById("mathFeedback").textContent="";
}
function checkMath(){
  const val=parseFloat(document.getElementById("mathAnswer").value);
  if(isNaN(val)) { document.getElementById("mathFeedback").textContent="Ingresa un número."; return; }
  const ok=Math.abs(val-currentMath.ans)<0.01;
  document.getElementById("mathFeedback").textContent=ok?"Correcto ✅":"Incorrecto. Respuesta: "+currentMath.ans;
}
document.getElementById("mathCheck").onclick=checkMath;
document.getElementById("mathNext").onclick=newMath;
newMath();

// ----- Química -----
// Masa atómica (conjunto básico para pruebas)
const ELEMENTS = {
  H:1.008, He:4.0026,
  C:12.011, N:14.007, O:15.999,
  Na:22.990, Mg:24.305, Al:26.982, Si:28.085, P:30.974, S:32.06, Cl:35.45, K:39.098, Ca:40.078
};

// Mini tabla periódica: botones con alerta de masa
const elementsGrid=document.getElementById("elements");
Object.entries(ELEMENTS).forEach(([sym,mass])=>{
  const btn=document.createElement("button");
  btn.className="tab-btn";
  btn.textContent=sym;
  btn.title=`${sym} — ${mass} g/mol`;
  btn.onclick=()=>alert(`${sym} → masa atómica: ${mass} g/mol`);
  elementsGrid.appendChild(btn);
});

// Parser simple: Ej. "H2O", "CO2", "CaCl2", "C6H12O6"
function calcMolar(){
  const f=document.getElementById("chemFormula").value.trim();
  const out=document.getElementById("chemResult");
  if(!f){ out.textContent="Ingresa una fórmula."; return; }

  // Divide por fragmentos Elemento+cantidad: CaCl2 -> ["Ca","Cl2"]
  const parts = f.match(/[A-Z][a-z]?\d*/g);
  if(!parts){ out.textContent="Formato no soportado."; return; }

  let total=0;
  for(const token of parts){
    const sym = token.match(/[A-Za-z]+/)[0];
    const numMatch = token.match(/\d+/);
    const n = numMatch ? parseInt(numMatch[0],10) : 1;

    if(!ELEMENTS[sym]){ out.textContent=`Elemento no soportado: ${sym}`; return; }
    total += ELEMENTS[sym] * n;
  }
  out.textContent = `Masa molar de ${f} ≈ ${total.toFixed(3)} g/mol`;
}
document.getElementById("chemCalc").onclick=calcMolar;

// ----- Física -----
// Velocidad media: v = d / t
document.getElementById("velCalc").onclick=()=>{
  const d=parseFloat(document.getElementById("dist").value);
  const t=parseFloat(document.getElementById("time").value);
  const out=document.getElementById("velResult");
  if(isNaN(d)||isNaN(t)||t===0){ out.textContent="Valores inválidos."; return; }
  out.textContent=`v = ${(d/t).toFixed(3)} m/s`;
};

// Ley de Ohm: I = V / R
document.getElementById("ohmCalc").onclick=()=>{
  const V=parseFloat(document.getElementById("ohmV").value);
  const R=parseFloat(document.getElementById("ohmR").value);
  const out=document.getElementById("ohmResult");
  if(isNaN(V)||isNaN(R)||R===0){ out.textContent="Valores inválidos."; return; }
  out.textContent=`I = ${(V/R).toFixed(3)} A`;
};

// ----- Idiomas -----
// Tarjetas EN–ES–FR–TH–JP
const CARDS = [
  ["student","estudiante","étudiant","นักเรียน","学生"],
  ["teacher","docente","professeur","ครู","先生"],
  ["school","escuela","école","โรงเรียน","学校"],
  ["math","matemáticas","mathématiques","คณิตศาสตร์","数学"],
  ["chemistry","química","chimie","เคมี","化学"],
  ["physics","física","physique","ฟิสิกส์","物理"],
  ["computer","computadora","ordinateur","คอมพิวเตอร์","コンピュータ"],
  ["offline","sin conexión","hors ligne","ออฟไลน์","オフライン"],
  ["exercise","ejercicio","exercice","แบบฝึกหัด","練習"],
  ["answer","respuesta","réponse","คำตอบ","答え"]
];

let langState = { idx:0, mode:0 }; // mode: 0 ES, 1 FR, 2 TH, 3 JP

function showLangCard(){
  const [en] = CARDS[langState.idx];
  document.getElementById("langCard").textContent = en;
  document.getElementById("langAnswer").textContent = "";
}
function rotateTranslation(){
  const [en, es, fr, th, jp] = CARDS[langState.idx];
  const translations = [es, fr, th, jp];
  document.getElementById("langAnswer").textContent = translations[langState.mode];
  langState.mode = (langState.mode + 1) % 4;
}
function nextLangCard(){
  langState.idx = (langState.idx + 1) % CARDS.length;
  langState.mode = 0;
  showLangCard();
}
document.getElementById("langShow").onclick = rotateTranslation;
document.getElementById("langNext").onclick = nextLangCard;
showLangCard();

// Lista completa
const langList = document.getElementById("langList");
CARDS.forEach(([en, es, fr, th, jp])=>{
  const li = document.createElement("li");
  li.innerHTML = `<span class="mono">${en}</span><br>
  <b>ES:</b> ${es} | <b>FR:</b> ${fr} | <b>TH:</b> ${th} | <b>JP:</b> ${jp}`;
  langList.appendChild(li);
});

// ----- Asistente IA (Chat) -----
const AI_NAME = "EdusBot"; // nombre propio ligado a la app
document.getElementById('ai-name').textContent = AI_NAME;

const chatEl = document.getElementById('chat');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const clearBtn = document.getElementById('clearHistory');
const copyBtn = document.getElementById('copyHistory');

function appendMessage(who, text){
  const m = document.createElement('div');
  m.className = 'chat-msg ' + (who==='user'? 'user' : 'ai');
  m.innerHTML = `<strong>${who==='user'? 'Tú' : AI_NAME}:</strong> <span>${text}</span>`;
  chatEl.appendChild(m);
  chatEl.scrollTop = chatEl.scrollHeight;
  // persist
  try{
    const hist = JSON.parse(localStorage.getItem('eduskit_chat')||'[]');
    hist.push({who, text, ts: Date.now()});
    localStorage.setItem('eduskit_chat', JSON.stringify(hist));
  }catch(e){ console.warn('storage failed', e); }
}

async function sendToAI(text){
  appendMessage('user', text);
  appendMessage('ai', 'Pensando...');
  try{
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    // quitar el último 'Pensando...'
    const last = chatEl.querySelectorAll('.chat-msg.ai');
    if(last.length) last[last.length-1].remove();
    appendMessage('ai', data.reply || 'Lo siento, no tengo respuesta.');
  }catch(e){
    const last = chatEl.querySelectorAll('.chat-msg.ai');
    if(last.length) last[last.length-1].remove();
    appendMessage('ai', 'Error al conectar con el servidor.');
    console.error(e);
  }
}

chatSend.onclick = () => {
  const v = chatInput.value.trim();
  if(!v) return;
  chatInput.value = '';
  sendToAI(v);
};
chatInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') chatSend.click(); });

// Mensaje de bienvenida
function renderHistory(){
  chatEl.innerHTML = '';
  try{
    const hist = JSON.parse(localStorage.getItem('eduskit_chat')||'[]');
    hist.forEach(item=>{
      const who = item.who;
      const text = item.text;
      const m = document.createElement('div');
      m.className = 'chat-msg ' + (who==='user'? 'user' : 'ai');
      const time = new Date(item.ts).toLocaleTimeString();
      m.innerHTML = `<strong>${who==='user'? 'Tú' : AI_NAME} (${time}):</strong> <span>${text}</span>`;
      chatEl.appendChild(m);
    });
  }catch(e){ console.warn('read hist', e); }
  chatEl.scrollTop = chatEl.scrollHeight;
}

appendMessage('ai', `Hola — soy ${AI_NAME}. ¿En qué te ayudo hoy?`);
renderHistory();

// Clear & copy actions
clearBtn.onclick = ()=>{
  if(confirm('Borrar todo el historial de conversación?')){
    localStorage.removeItem('eduskit_chat');
    renderHistory();
    appendMessage('ai', `Historial borrado. ¿En qué te ayudo ahora?`);
  }
};

copyBtn.onclick = ()=>{
  try{
    const hist = JSON.parse(localStorage.getItem('eduskit_chat')||'[]');
    const text = hist.map(h=>`${h.who==='user'? 'Tú' : AI_NAME}: ${h.text}`).join('\n');
    navigator.clipboard.writeText(text || '');
    appendMessage('ai', 'Conversación copiada al portapapeles.');
  }catch(e){ appendMessage('ai', 'No se pudo copiar.'); console.error(e); }
};
