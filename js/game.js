// Lógica del reto: consecuencias distintas, desgaste diario y un objetivo realmente difícil.
// Los porcentajes son PUNTOS del juego; no son resultados clínicos ni datos de la encuesta.
const INITIAL_STATS = Object.freeze({sleep:64, energy:65, focus:69});
const STAT_CAPS = Object.freeze({sleep:94, energy:89, focus:96});
const STAT_FLOORS = Object.freeze({sleep:10, energy:12, focus:15});
const DAILY_COSTS = [
  {sleep:-5,energy:-5,focus:-3},  // Lunes: cansancio de clases
  {sleep:-8,energy:-5,focus:-4},  // Martes: pasillo ruidoso
  {sleep:-4,energy:-3,focus:-5},  // Miércoles: examen
  {sleep:-9,energy:-6,focus:-6},  // Jueves: fiesta
  {sleep:-7,energy:-5,focus:-6},  // Viernes: fatiga acumulada
  {sleep:-3,energy:-3,focus:-4},  // Sábado: pendientes
  {sleep:-3,energy:-3,focus:-3}   // Domingo: próxima semana
];
// Variar el orden evita que la opción más favorable sea siempre la primera.
const CHOICE_ORDER = [[0,2,1],[1,0,2],[1,0,2],[1,0,2],[2,1,0],[2,0,1],[2,1,0]];
const WIN_THRESHOLD = 70;
let sleepDebt = 0;
let playerName = '';
let startedAt = 0;
let finishedAt = 0;
let finalReport = null;
let currentDecisionTrace = [];
const keys = ['sleep','energy','focus'];
function clampScore(key, value){return Math.max(STAT_FLOORS[key],Math.min(STAT_CAPS[key],Math.round(value)));}
function keepDistinct(){
  // Cada recurso tiene su cálculo, mínimos y máximos; al empatar, se ajusta
  // únicamente el punto más cercano disponible para mostrar tres estados distintos.
  const used=new Set();
  for(const key of keys){
    let value=stats[key];
    if(used.has(value)){
      for(let distance=1;distance<=5;distance++){
        const options=[value-distance,value+distance];
        const candidate=options.find(v=>v>=STAT_FLOORS[key]&&v<=STAT_CAPS[key]&&!used.has(v));
        if(candidate!==undefined){value=candidate;break;}
      }
    }
    stats[key]=value;used.add(value);
  }
}
function refreshStats(){
  for(const k of keys){
    $(k+'Value').textContent = stats[k]+'%';
    const mobileValue=$('mobile'+k[0].toUpperCase()+k.slice(1)+'Value');
    if(mobileValue)mobileValue.textContent=stats[k]+'%';
    $(k+'Bar').style.width = stats[k]+'%';
  }
}
function drawDots(){
  const el=$('dayDots');el.innerHTML='';
  const mobile=$('mobileDayDots');
  if(mobile)mobile.innerHTML='';
  sceneData.forEach((_,i)=>{const dot=document.createElement('div');dot.textContent=i+1;dot.className='dot '+(i<dayIndex?'completed':i===dayIndex?'current':'');dot.title=`Día ${i+1}`;el.appendChild(dot);if(mobile)mobile.appendChild(dot.cloneNode(true));});
}
function renderDay(){
  const obj=sceneData[dayIndex];reviewed=false;quieted=false;
  $('game-in-progress').classList.remove('hidden');$('game-over').classList.add('hidden');
  $('dayLabel').textContent=`DÍA ${dayIndex+1} DE 7 · ${obj.day}`;
  if($('mobileDayLabel'))$('mobileDayLabel').textContent=`${obj.day} · ${dayIndex+1} de 7`;
  $('dayTitle').textContent=obj.title;$('dayCopy').textContent=obj.copy;$('sceneIcon').textContent=obj.icon;
  $('sceneArt').className='scene-art '+(obj.sound==='party'?'party':obj.sound==='market'?'market':'calm')+(obj.image?' has-scene-image':'');
  const sceneImage=$('sceneImage');
  if(obj.image){sceneImage.src=obj.image;sceneImage.alt=obj.imageAlt||`Ilustración del ${obj.day.toLowerCase()}`;sceneImage.classList.remove('hidden');}
  else{sceneImage.classList.add('hidden');sceneImage.removeAttribute('src');sceneImage.alt='';}
  $('wallWindow').className='wall-window '+(obj.sound==='party'?'window-party':obj.sound==='market'?'window-market':'');
  const soundLabels={party:'🎵 Música de una fiesta afuera',market:'🗣️ Conversaciones como en un mercado',quiet:'🌙 Brisa suave y actividad a lo lejos'};
  $('soundDescription').textContent=soundLabels[obj.sound]||'⏰ Sonidos de la mañana';
  $('feedback').style.display='none';$('choices').classList.remove('hidden');$('choices').innerHTML='';
  const order=CHOICE_ORDER[dayIndex]||[0,1,2];
  order.forEach((j,i)=>{
    const c=obj.choices[j];const b=document.createElement('button');b.className='choice';
    b.innerHTML=`<span class="letter">${'ABC'[i]}</span><span><strong></strong><small></small></span>`;
    b.querySelector('strong').textContent=c.name;b.querySelector('small').textContent=c.detail;
    b.addEventListener('click',()=>choose(c,j));$('choices').appendChild(b);
  });
  drawDots();refreshStats();setSound(obj.sound);runSceneSounds();applySoundVolume();
}
function choose(c, choiceIndex){
  if(reviewed)return;
  reviewed=true;
  const before={...stats};const costs=DAILY_COSTS[dayIndex];
  // Las decisiones NO suman puntos gratis: todos los días hay un desgaste diferente.
  keys.forEach((k,i)=>{stats[k]=clampScore(k,stats[k]+costs[k]+c.d[i]);});
  // Una mala noche afecta también al día siguiente. El cansancio no desaparece de golpe.
  const additional=[];
  if(before.sleep<53){const lossEnergy=Math.min(5,sleepDebt+2), lossFocus=Math.min(4,sleepDebt+1);stats.energy=clampScore('energy',stats.energy-lossEnergy);stats.focus=clampScore('focus',stats.focus-lossFocus);additional.push('El poco descanso del día anterior también pasó factura.');}
  if(before.energy<45){stats.focus=clampScore('focus',stats.focus-3);additional.push('La energía baja dificultó concentrarte.');}
  sleepDebt=Math.max(0,Math.min(10,sleepDebt+(c.d[0]<=-12?2:c.d[0]<0?1:0)+(stats.sleep<53?1:0)-(c.d[0]>=9?1:0)));
  keepDistinct();refreshStats();
  currentDecisionTrace.push({day:sceneData[dayIndex].day, index:choiceIndex});
  $('choices').classList.add('hidden');$('feedback').style.display='block';
  $('feedbackTitle').textContent='💡 Consecuencias de tu decisión';
  const deltas=keys.map(k=>`${k==='sleep'?'🌙':k==='energy'?'⚡':'📚'} ${stats[k]-before[k]>=0?'+':''}${stats[k]-before[k]}`).join(' · ');
  $('feedbackText').textContent=`${c.reply}  Cambio neto: ${deltas}. ${additional.join(' ')}`;
  $('nextBtn').textContent=dayIndex===6?'Ver mi resultado →':'Siguiente día →';
  if(c.reduce)silenceCorridor();
  else if(c.partyJoin){quieted=false;applySoundVolume();playEffect('laughter','🎉 Te acercas y escuchas las risas de la fiesta.',1.1);}
  else notifySound('🎧 El sonido ambiental continúa hasta que avances de día.');
}
function next(){if(!reviewed)return;if(dayIndex<6){dayIndex++;renderDay();}else finish();}
function formatDuration(seconds){
  const minutes=Math.floor(seconds/60), remaining=seconds%60;
  return minutes>0?`${minutes} min ${String(remaining).padStart(2,'0')} s`:`${remaining} s`;
}
function finish(){
  if(finalReport)return;
  finishedAt=performance.now();stopSound();
  $('game-in-progress').classList.add('hidden');$('game-over').classList.remove('hidden');
  const avg=Math.round((stats.sleep+stats.energy+stats.focus)/3);
  const balanced=Math.min(stats.sleep,stats.energy,stats.focus);
  const won=balanced>=WIN_THRESHOLD && sleepDebt<=3;
  const close=balanced>=55 && sleepDebt<=5;
  let title,desc,icon;
  if(won){title='¡Superaste la semana!';icon='🏆';desc='Lograste cuidar el descanso, la energía y la concentración incluso con el desgaste de la vida universitaria. ¡Es una combinación difícil!';}
  else if(close){title='¡Casi logras el equilibrio!';icon='🌗';desc='Tuviste buenas decisiones, pero al menos un indicador quedó por debajo de la meta o acumulaste demasiado cansancio. ¡Inténtalo otra vez!';}
  else{title='Esta semana te ganó el cansancio';icon='🥱';desc='Las consecuencias se acumularon durante los siete días. Prueba otras decisiones: necesitas equilibrar estudio, descanso y convivencia.';}
  $('endingIcon').textContent=icon;$('endingTitle').textContent=title;$('endingDescription').textContent=desc;
  $('resultPills').replaceChildren();
  ['sleep','energy','focus'].forEach((k,i)=>{const pill=document.createElement('span');pill.textContent=`${['🌙 Descanso','⚡ Energía','📚 Concentración'][i]}: ${stats[k]}%`;$('resultPills').appendChild(pill);});
  const durationSeconds=Math.max(1,Math.round((finishedAt-startedAt)/1000));
  finalReport={name:playerName,durationSeconds,stats:{...stats},sleepDebt,score:avg,won,days:7};
  $('resultName').textContent=playerName;
  $('resultDuration').textContent=formatDuration(durationSeconds);
  $('resultDebt').textContent=String(sleepDebt);
  $('retrySendBtn').classList.add('hidden');
  submitDiscordReport(finalReport);
  window.scrollTo({top:0,behavior:'smooth'});
}
function start(name){
  playerName=name.trim();
  resetReportSending();
  dayIndex=0;stats={...INITIAL_STATS};sleepDebt=0;
  currentDecisionTrace=[];finalReport=null;finishedAt=0;startedAt=performance.now();
  $('sendStatus').textContent='Preparando los resultados…';
  show('game');renderDay();
}
