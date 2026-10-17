'use strict';
// Small, shared play systems. No services, accounts, timers or scores for the child.
const play={jump:0,gesture:0,returnRoom:'garden',returnX:600,marker:null,bubbles:0};
const saveKey='faya-wonder-world-v1';
const savedStateKeys=['watered','blocks','teddy','fruit','lamp','tv','fan','reclined','tableSet','muted','language'];
function savePlay(){try{const values={};for(const k of savedStateKeys)values[k]=state[k];localStorage.setItem(saveKey,JSON.stringify({version:1,room:state.room==='map'?play.returnRoom:state.room,state:values,outing}));}catch{}}
function restorePlay(){try{const data=JSON.parse(localStorage.getItem(saveKey));if(!data||data.version!==1)return;for(const k of savedStateKeys){const v=data.state?.[k];if(typeof v!==typeof state[k])continue;if(k==='teddy'&&!['chair','held','bed'].includes(v))continue;if(k==='language'&&!['en','ar'].includes(v))continue;if(typeof v==='number'&&(!Number.isInteger(v)||v<0||v>4))continue;state[k]=v;}for(const k of Object.keys(outing)){const v=data.outing?.[k],max={penguin:3,paint:3,train:2,story:2,tiles:2,market:3,boat:3,bell:99999,music:99999}[k];if(typeof v===typeof outing[k]&&(typeof v!=='number'||Number.isInteger(v)&&v>=0&&v<=max))outing[k]=v;}if(Object.hasOwn(destinations,data.room)&&data.room!=='map')state.room=data.room;}catch{}}
function fitWorld(){world.setAttribute('viewBox','0 0 1200 650');world.setAttribute('preserveAspectRatio','xMidYMid meet');}
function hop(){if(state.transition||state.room==='map')return;unlock();play.jump=.65;note(523,.13);}
function destinationMark(x){play.marker?.remove();play.marker=oval(x,557,20,6,'none',fx);play.marker.setAttribute('stroke','#fff5dc');play.marker.setAttribute('stroke-width',3);}
function bubbles(x,y){for(let i=0;i<8;i++){const n=oval(x+(i-4)*17,y-(i%3)*12,6+i%4*3,6+i%4*3,'#d5edf14d',fx);n.setAttribute('stroke',['#b6dce3','#d7b7df','#f2d6a7'][i%3]);n.setAttribute('stroke-width',2);if(!reduced&&n.animate)n.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${(i-4)*14}px,-100px)`,opacity:0}],{duration:1500+i*100,fill:'forwards'});setTimeout(()=>n.remove(),2400)}}
function extraPlay(){
 if(state.room==='garden'||state.room==='daycare')object('Blow bubbles · فقاعات',1020,421,63,91,g=>{rect(1035,458,30,47,'#b99ad0',8,g);rect(1034,450,32,12,'#e5c875',4,g);oval(1050,435,11,11,'none',g).setAttribute('stroke','#e5c875');path('M1050 446v14','none','#e5c875',4,g);},()=>{bubbles(1045,415);say('Bubbles float up, up, up!','فقاعات تطير إلى الأعلى!');});
 if(['garden','zoo','tunis','dc','johnson'].includes(state.room)){
 const g=node('g',{'pointer-events':'none',id:'butterfly'},fx);
 oval(-7,0,8,12,'#c59dd7',g);oval(7,0,8,12,'#ebbbd1',g);oval(0,2,2,9,'#8a709c',g);
 }
 if(state.room==='daycare'){
 // A friendly original playmate waves when Faya approaches.
 object('Wave to a friend · مرحباً',190,361,76,139,g=>{oval(229,493,25,6,'#bba489',g);path('M217 465v23m23-23v23','none','#8e7eaa',9,g);rect(210,422,38,48,'#8fb9ac',10,g);path('M210 433l-12 20m49-20 14-21','none','#bf8f70',8,g);oval(229,404,24,26,'#bf8f70',g);path('M205 400q-4-37 25-26 30-4 23 28-14-16-32-14Z','#5c4334','none',1,g);oval(220,405,2,3,'#4e3937',g);oval(238,405,2,3,'#4e3937',g);path('M221 417q8 6 15-1','none','#85564f',2,g);},()=>{play.gesture=1.1;say('Hello, friend! Shall we play?','مرحباً يا صديقي! هل نلعب معاً؟');sparkle(230,375);});
 }
}
const basePaint=paint;
paint=function(){basePaint();extraPlay();fitWorld();savePlay();};
const baseObject=object;
object=function(name,x,y,w,h,draw,action){const g=baseObject(name,x,y,w,h,draw,()=>{play.gesture=.65;play.marker?.remove();action();savePlay();});
 if(state.room!=='map'){const cue=oval(x+w-7,y+9,5,5,'#fff1bb',g);cue.setAttribute('class','play-cue');cue.setAttribute('pointer-events','none');}
 return g;
};
const baseSay=say;
say=function(en,ar){baseSay(en,ar);$('caption').classList.remove('quiet');clearTimeout(captionTimer);captionTimer=setTimeout(()=>$('caption').classList.add('quiet'),6500);};
const baseGo=go;
go=function(room,entry){if(state.transition)return;if(room==='map'){play.returnRoom=state.room;play.returnX=state.x;}play.jump=0;play.gesture=0;baseGo(room,entry);};
const baseTick=tick;
tick=function(t){const before=last;const dt=Math.min((t-before)/1000||0,.05);baseTick(t);if(play.jump>0){play.jump=Math.max(0,play.jump-dt);if(!reduced)actor.setAttribute('transform',`translate(${state.x} ${555-Math.sin(play.jump/.65*Math.PI)*43})`);}if(play.gesture>0){play.gesture=Math.max(0,play.gesture-dt);$('arms').setAttribute('transform',reduced?'':`rotate(${-Math.sin(play.gesture*9)*12} 0 -61)`);}else $('arms').setAttribute('transform','');const butterfly=$('butterfly');if(butterfly)butterfly.setAttribute('transform',`translate(${reduced?925:900+Math.sin(time*.6)*70} ${reduced?260:260+Math.cos(time*1.2)*30})`);if(play.marker&&Math.abs(state.target-state.x)<1){play.marker.remove();play.marker=null;}};
const baseStart=startGame;
startGame=function(){restorePlay();baseStart();$('roomName').textContent=destinations[state.room][0];$('sound').textContent=state.muted?'♪̸':'♫';$('sound').setAttribute('aria-pressed',String(state.muted));$('sound').setAttribute('aria-label',state.muted?'Unmute sound':'Mute sound');$('language').textContent=state.language==='ar'?'عربي / EN':'EN / عربي';actor.setAttribute('role','button');actor.setAttribute('tabindex','0');actor.setAttribute('aria-label','Tap Faya to hop · اضغطي على فايا لتقفز');actor.addEventListener('click',e=>{e.stopPropagation();hop()});actor.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();hop()}});$('english').textContent='Tap to walk. Touch the glowing dots to play.';$('arabic').textContent='اضغطي للمشي، والمسِي النقاط المضيئة للعب.';};
$('travel').onclick=()=>{unlock();if(!state.transition)go(state.room==='map'?play.returnRoom:'map',state.room==='map'?play.returnX:600)};
world.addEventListener('click',e=>{if(!state.transition&&state.room!=='map'&&!e.target.closest('.object')&&state.pending===null&&Math.abs(state.x-state.target)>1)destinationMark(state.target)});
for(const id of ['sound','language']){const original=$(id).onclick;$(id).onclick=()=>{original();savePlay()};}
window.addEventListener('resize',fitWorld);document.addEventListener('visibilitychange',()=>{if(document.hidden)savePlay()});window.addEventListener('pagehide',savePlay);
