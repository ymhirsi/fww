// Dependency-free logic integration harness; does not substitute for browser QA.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Element{
 constructor(tag='div'){this.tag=tag;this.attrs={};this.children=[];this.events={};this.hidden=false;this.style={};this.classList={add(){},remove(){}};}
 setAttribute(k,v){this.attrs[k]=v}append(n){n.parent=this;this.children.push(n)}replaceChildren(){this.children=[]}get childNodes(){return this.children}
 addEventListener(k,f){this.events[k]=f}remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this)}focus(){}click(){this.onclick?.()}
 set innerHTML(s){this.children=[];for(const m of s.matchAll(/id="([^"]+)"/g))ids[m[1]]=new Element()}
 querySelector(s){const label=s.match(/aria-label="([^"]+)"/)?.[1];return this.children.find(n=>n.attrs['aria-label']===label)}
 closest(s){return s==='.object'&&this.attrs.class==='object'?this:null}
}
const ids={};for(const m of fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g))ids[m[1]]=new Element();
const timers=[],frames=[];
const context=vm.createContext({document:{getElementById:id=>ids[id],createElementNS:(_,t)=>new Element(t),createElement:t=>new Element(t),addEventListener(){},documentElement:{}},window:{},matchMedia:()=>({matches:false}),requestAnimationFrame:f=>frames.push(f),setTimeout:f=>{timers.push(f);return timers.length},clearTimeout(){},DOMPoint:class{constructor(x,y){this.x=x;this.y=y}matrixTransform(){return this}},console});
vm.runInContext(fs.readFileSync('game.js','utf8'),context);
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
