// Conexiones entre los botones de inicio, el minijuego y el sonido.
$('startBtn').addEventListener('click',openRegistration);$('pamBtn').addEventListener('click',()=>show('pamphlet'));
$('pamGameBtn').addEventListener('click',openRegistration);$('endPamBtn').addEventListener('click',()=>show('pamphlet'));
$('topHome').addEventListener('click',()=>show('home'));$('homeLogo').addEventListener('click',()=>show('home'));
$('homeLogo').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show('home');}});
$('pamHomeBtn').addEventListener('click',()=>show('home'));
$('restartBtn').addEventListener('click',openRegistration);$('replayBtn').addEventListener('click',openRegistration);$('nextBtn').addEventListener('click',next);
$('topHome').classList.add('hidden');

function openRegistration(){
  stopSound();
  $('playerName').value=playerName||'';
  $('entryError').classList.add('hidden');
  show('register');
  $('playerName').focus({preventScroll:true});
}
$('registerBack').addEventListener('click',()=>show('home'));
$('playerForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('playerName').value.trim();
  if(name.length<2||name.length>32){
    $('entryError').textContent='Escribe un nombre o apodo de 2 a 32 caracteres.';
    $('entryError').classList.remove('hidden');return;
  }
  $('entryError').classList.add('hidden');
  start(name);
});
