// Envio DIRECTO desde GitHub Pages mediante un formulario multipart/form-data.
// No se puede inspeccionar la respuesta de Discord en modo no-cors.
// Confirmar el mensaje manualmente en el canal de Discord.
let sendingReport=false;
let reportSent=false;
let activeSendController=null;
let sendSequence=0;
function resetReportSending(){
  sendSequence++;
  if(activeSendController)activeSendController.abort();
  activeSendController=null;
  sendingReport=false;
  reportSent=false;
  $('copyResultBtn').textContent='📋 Copiar resultado';
}
function discordPayload(r){
  const cleanName=String(r.name||'Anónimo').replace(/[\x00-\x1F\x7F]/g,' ').replace(/@/g,'＠').slice(0,32);
  const status=r.won?'🏆 Superó la semana':'🌧️ No superó la semana';
  const formatSeconds=typeof formatDuration==='function'?formatDuration(r.durationSeconds):String(r.durationSeconds)+' s';
  return {
    username:'Dormir o Rendir · UCR Grecia',
    allowed_mentions:{parse:[]},
    embeds:[{
      title:'🎮 Resultado · Sobrevive la semana',
      description:'Simulación educativa. No son datos clínicos ni resultados de la encuesta.',
      color:r.won?0x45c7ad:0xe6a263,
      fields:[
        {name:'👤 Nombre o apodo',value:cleanName||'Anónimo',inline:false},
        {name:'🏁 Resultado',value:status,inline:false},
        {name:'🌙 Descanso',value:String(r.stats.sleep)+'%',inline:true},
        {name:'⚡ Energía',value:String(r.stats.energy)+'%',inline:true},
        {name:'📚 Concentración',value:String(r.stats.focus)+'%',inline:true},
        {name:'💤 Deuda de sueño',value:String(r.sleepDebt),inline:true},
        {name:'📊 Promedio',value:String(r.score)+'%',inline:true},
        {name:'⏱️ Tiempo empleado',value:formatSeconds,inline:true}
      ],
      footer:{text:'Producto creativo · Seminario de Realidad Nacional I'}
    }]
  };
}
function getWebhookUrl(){
  const value=String(window.DISCORD_RESULTS_CONFIG?.webhookUrl||'').trim();
  if(!/^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(value)){
    throw new Error('El webhook no esta configurado o tiene un formato incorrecto. Revisa js/data/discord-config.js');
  }
  return value;
}
async function sendDirectDiscord(payload,signal){
  const url=getWebhookUrl();
  const form=new FormData();
  form.append('payload_json',JSON.stringify(payload));
  // multipart/form-data sin headers manuales: el navegador añade boundary.
  // no-cors permite intentar el POST sin preflight, pero la respuesta es opaca.
  await fetch(url,{
    method:'POST',
    mode:'no-cors',
    body:form,
    credentials:'omit',
    referrerPolicy:'no-referrer',
    redirect:'follow',
    cache:'no-store',
    signal
  });
  return {status:'intento-realizado-sin-confirmacion'};
}
async function submitDiscordReport(report){
  if(!report||sendingReport||reportSent)return;
  sendingReport=true;
  const controller=new AbortController();activeSendController=controller;
  const sequence=++sendSequence;
  const timeout=setTimeout(()=>controller.abort(),20000);
  try{
    await sendDirectDiscord(discordPayload(report),controller.signal);
    if(sequence!==sendSequence)return;
    reportSent=true;
  }catch(error){
    if(sequence===sendSequence){
      console.warn('No se pudo iniciar el envío automático del resultado.',error);
    }
  }finally{
    clearTimeout(timeout);
    if(sequence===sendSequence){sendingReport=false;activeSendController=null;}
  }
}
function copyFinalReport(){
  if(!finalReport)return;
  const r=finalReport;
  const txt=`Dormir o rendir — ${r.name}\nResultado: ${r.won?'Superó la semana':'No superó la semana'}\nDescanso: ${r.stats.sleep}%\nEnergía: ${r.stats.energy}%\nConcentración: ${r.stats.focus}%\nDeuda de sueño: ${r.sleepDebt}\nTiempo: ${formatDuration(r.durationSeconds)}`;
  if(navigator.clipboard?.writeText){navigator.clipboard.writeText(txt).then(()=>{ $('copyResultBtn').textContent='✓ Resultado copiado'; }).catch(()=>manualCopy(txt));}
  else manualCopy(txt);
}
function manualCopy(text){
  const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();$('copyResultBtn').textContent='✓ Resultado copiado';
}
$('copyResultBtn').addEventListener('click',copyFinalReport);
