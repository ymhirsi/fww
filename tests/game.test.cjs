// Dependency-free logic integration harness; does not substitute for browser QA.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Element{
 constructor(tag='div'){this.tag=tag;this.attrs={};this.children=[];this.events={};this.hidden=false;this.style={};this.classList={add(){},remove(){}};}
 setAttribute(k,v){this.attrs[k]=v;if(k==='id')ids[v]=this}append(n){n.parent=this;this.children.push(n)}replaceChildren(){this.children=[]}get childNodes(){return this.children}
 addEventListener(k,f){const old=this.events[k];this.events[k]=old?e=>{old(e);f(e)}:f}remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this)}focus(){}click(){this.onclick?.()}
 set innerHTML(s){this.children=[];for(const m of s.matchAll(/id="([^"]+)"/g))ids[m[1]]=new Element()}
 querySelector(s){const label=s.match(/aria-label="([^"]+)"/)?.[1];return this.children.find(n=>n.attrs['aria-label']===label)}
 closest(s){return s==='.object'&&this.attrs.class==='object'?this:null}
}
const ids={};for(const m of fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g))ids[m[1]]=new Element();
const timers=[],frames=[],saved=new Map();
const context=vm.createContext({document:{getElementById:id=>ids[id],createElementNS:(_,t)=>new Element(t),createElement:t=>new Element(t),addEventListener(){},documentElement:{}},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},window:{addEventListener(){}},matchMedia:()=>({matches:false}),requestAnimationFrame:f=>frames.push(f),setTimeout:f=>{timers.push(f);return timers.length},clearTimeout(){},DOMPoint:class{constructor(x,y){this.x=x;this.y=y}matrixTransform(){return this}},console});
vm.runInContext(fs.readFileSync('game.js','utf8'),context);
vm.runInContext(fs.readFileSync('places.js','utf8'),context);
vm.runInContext(fs.readFileSync('play.js','utf8'),context);
vm.runInContext('startGame()',context);
const run=s=>vm.runInContext(s,context);
function tap(label){const g=ids.scene.querySelector(`[aria-label="${label}"]`);assert.ok(g,label);g.events.click({stopPropagation(){}});run('state.x=state.target;tick(last+16)')}
assert.equal(run('state.room'),'garden');assert.equal(ids.keys.children.length,13);
tap('Water the flowers · اسقي الزهور');assert.equal(run('state.watered'),true);
tap('Front door · الباب');assert.equal(run('state.transition'),true);while(timers.length)timers.shift()();assert.equal(run('state.room'),'living');
tap('Play the piano · البيانو');assert.equal(ids.piano.hidden,false);
tap('Bedroom');while(timers.length)timers.shift()();assert.equal(run('state.room'),'bedroom');
tap('Pick up Teddy · دبدوب');assert.equal(run('state.teddy'),'held');tap('Tuck Teddy into bed · السرير');assert.equal(run('state.teddy'),'bed');tap('Tuck Teddy into bed · السرير');assert.equal(run('state.teddy'),'held');
for(let i=0;i<5;i++)tap('Build with blocks · مكعبات');assert.equal(run('state.blocks'),0);
tap('Living room');while(timers.length)timers.shift()();tap('Kitchen');while(timers.length)timers.shift()();tap('Prepare fruit · الفاكهة');assert.equal(run('state.fruit'),1);
run('state.pending=()=>{throw Error("stale action")};state.x=300;state.target=300');ids.world.getScreenCTM=()=>({inverse:()=>({})});ids.world.events.click({target:ids.world,clientX:900,clientY:550});assert.equal(run('state.pending'),null);assert.equal(run('state.target'),900);
run('tick(last+50)');assert.ok(run('state.x>300&&state.x<=313'));
ids.language.onclick();assert.equal(run('state.language'),'ar');ids.sound.onclick();assert.equal(run('state.muted'),true);
console.log('PASS: startup, 13 piano keys, flower state, doors, piano, Teddy cycle, blocks cycle, fruit, cancelled action, bounded movement, language and mute.');
tap('Set the family table · الطاولة');assert.equal(run('state.tableSet'),true);
tap('Living room');while(timers.length)timers.shift()();
tap('Blue television light · التلفاز');assert.equal(run('state.tv'),true);
tap('Ceiling fan · المروحة');assert.equal(run('state.fan'),true);
tap('Recline the armchair · الكرسي');assert.equal(run('state.reclined'),true);
tap('Kitchen');while(timers.length)timers.shift()();assert.equal(run('state.tableSet'),true);
console.log('PASS: photo-inspired room interactions and retained table state.');

for(const [id,label,field] of [['zoo','Watch the elephant · الفيل','elephant'],['daycare','Paint a picture · نرسم','paint'],['tunis','Knock on the blue door · الباب الأزرق','door'],['dc','Float a paper boat · قارب','boat'],['johnson','Ring the depot bell · الجرس','bell']]){
 ids.travel.onclick();while(timers.length)timers.shift()();assert.equal(run('state.room'),'map');
 tap('Visit '+id);while(timers.length)timers.shift()();assert.equal(run('state.room'),id);
 tap(label);assert.ok(run('outing.'+field));assert.ok(ids.roomName.textContent);assert.ok(ids.arabic.textContent);
}
ids.travel.onclick();while(timers.length)timers.shift()();tap('Visit garden');while(timers.length)timers.shift()();assert.equal(run('state.room'),'garden');
console.log('PASS: all five travel destinations, interactions, bilingual arrivals and return home.');

run('state.room="daycare";paint()');tap('Blow bubbles · فقاعات');assert.ok(ids.effects.childNodes.length>0);
tap('Wave to a friend · مرحباً');assert.ok(run('play.gesture>0'));
run('hop();tick(last+50)');assert.ok(run('play.jump>0'));assert.ok(!ids.actor.attrs.transform.includes('555'));
run('state.room="tunis";state.x=440;state.target=440');ids.travel.onclick();while(timers.length)timers.shift()();ids.travel.onclick();while(timers.length)timers.shift()();assert.equal(run('state.room'),'tunis');assert.equal(run('state.x'),440);
run('state.watered=true;outing.story=2;savePlay();state.watered=false;outing.story=0;restorePlay()');assert.equal(run('state.watered'),true);assert.equal(run('outing.story'),2);
saved.set('faya-wonder-world-v1','{invalid');assert.doesNotThrow(()=>run('restorePlay()'));
saved.set('faya-wonder-world-v1',JSON.stringify({version:1,room:'not-a-room',state:{teddy:'bad',language:'xx'},outing:{story:900}}));run('restorePlay()');assert.equal(run('outing.story'),2);assert.equal(run('state.room'),'tunis');
assert.equal(ids.world.attrs.preserveAspectRatio,'xMidYMid meet');console.log('PASS: bubbles, friend, hop, map round trip, save/restore, invalid-save resilience and complete-stage framing.');
