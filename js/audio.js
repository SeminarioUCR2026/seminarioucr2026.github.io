// Estado compartido y reproducción de paisajes sonoros.
const $=id=>document.getElementById(id);
let dayIndex=0,stats={sleep:70,energy:70,focus:70},muted=false,playingSound=null,reviewed=false,quieted=false;
let fxTimers=[],fxInstances=[],soundRunToken=0,sceneLoopTimer=null;
const audio=$('ambienceAudio');
const partyMusicAudio=$('partyMusicAudio');
function baseVolume(){return 1.0;} // Máximo nivel del reproductor HTML; controla la salida desde las bocinas.
function show(screen){
  for(const el of document.querySelectorAll('.screen'))el.classList.toggle('active',el.id===screen);
  window.scrollTo({top:0,behavior:'instant'});
  if(screen!=='game')stopSound();
  $('topHome').classList.toggle('hidden',screen==='home');
}
function clearEffects(){
  ++soundRunToken;
  fxTimers.forEach(clearTimeout);fxTimers=[];
  if(sceneLoopTimer){clearTimeout(sceneLoopTimer);sceneLoopTimer=null;}
  for(const entry of fxInstances){entry.element.pause();entry.element.removeAttribute('src');}
  fxInstances=[];
}
function stopSound(){
  clearEffects(); audio.pause();audio.removeAttribute('src');audio.load();partyMusicAudio.pause();partyMusicAudio.removeAttribute('src');partyMusicAudio.load();playingSound=null;quieted=false;
}
function applySoundVolume(){
  const base=muted?0:baseVolume();
  audio.volume=base*(quieted?.18:1);
  partyMusicAudio.volume=Math.min(1,base*.95*(quieted?.18:1));
  for(const obj of fxInstances){obj.element.volume=Math.min(1,base*Math.max(.86,obj.level)*(quieted?.22:1));}
  $('wave').classList.toggle('active',!!playingSound&&!muted);
}
function notifySound(message){
  $('soundEvents').textContent=message;
  $('soundEvents').classList.toggle('active',!muted);
}
function setSound(kind){
  stopSound();playingSound=kind;
  if(!kind || !media[kind]){playingSound=null;applySoundVolume();return;}
  audio.src=media[kind];audio.loop=true;
  if(kind==='party' && media.partyMusic){partyMusicAudio.src=media.partyMusic;partyMusicAudio.loop=true;}
  applySoundVolume();
  if(!muted){audio.play().catch(()=>notifySound('⚠️ No se pudo reproducir el ambiente real; revisa tu conexión.'));
    if(kind==='party'&&media.partyMusic)partyMusicAudio.play().catch(()=>{});}
}
function playEffect(id,label,level=1){
  notifySound(muted?'🔇 '+label.replace(/^\S+\s*/, '')+' (sin sonido)':label);
  if(muted||!media[id])return;
  const one=new Audio(media[id]);one.preload='auto';one.playsInline=true;
  const entry={element:one,level};fxInstances.push(entry);
  one.volume=Math.min(1,baseVolume()*Math.max(.86,level)*(quieted?.22:1));
  one.addEventListener('ended',()=>{const i=fxInstances.indexOf(entry);if(i>=0)fxInstances.splice(i,1);one.removeAttribute('src');},{once:true});
  one.play().catch(()=>notifySound('⚠️ Grabación no disponible: revisa tu conexión.'));
}
function runSceneSounds(){
  clearEffects();
  if(!muted&&playingSound&&audio.paused)audio.play().catch(()=>{});
  if(!muted&&playingSound==='party'&&partyMusicAudio.paused)partyMusicAudio.play().catch(()=>{});
  const token=soundRunToken;
  const sounds=sceneSounds[dayIndex]||[];
  const cycleDuration=Math.max(9000,...sounds.map(s=>s.at+4200));
  notifySound('🎧 Escucha con atención: esta escena tiene sonidos propios y se repetirán hasta cambiar de día.');
  const playCycle=()=>{
    if(token!==soundRunToken)return;
    sounds.forEach(({at,id,label,level})=>{
      if(at===0){playEffect(id,label,level);}
      else {fxTimers.push(setTimeout(()=>{if(token===soundRunToken)playEffect(id,label,level);},at));}
    });
    sceneLoopTimer=setTimeout(()=>{if(token===soundRunToken)playCycle();},cycleDuration);
  };
  playCycle();
}
function silenceCorridor(){
  quieted=true;
  applySoundVolume();
  notifySound('🔉 El ruido exterior disminuye. El ambiente seguirá sonando, pero más suave.');
}
