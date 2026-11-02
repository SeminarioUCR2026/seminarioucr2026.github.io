/* Libro por imágenes en modo hoja por hoja.
   La portada se abre aparte y luego se muestra una página por vez,
   con una transición suave para evitar el giro forzado de dos hojas. */
let bookPosition = 1; // la portada ocupa el índice 0
let bookOpened = false;
let bookTurning = false;
let touchStart = null;
let lastSwipe = 0;
let bookTransitionTimer = null;

const BOOK_TURN_TIME = 640;
const BOOK_OPEN_TIME = 560;
const reducedBookMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function totalInteriorPages() { return Math.max(0, bookPages.length - 1); }
function maxBookPosition() { return Math.max(1, totalInteriorPages()); }
function clampBookPosition(pos) { return Math.min(Math.max(1, pos), maxBookPosition()); }
function interiorPage(n) { return bookPages[n] || null; }
function pageCard(page) {
  if (!page) return '<div class="image-page placeholder-page" aria-hidden="true"></div>';
  return `<figure class="image-page"><img src="${page.src}" alt="${page.name}" draggable="false"></figure>`;
}
function setPage(page) {
  $('bookSpread').innerHTML = pageCard(page);
}
function setProgress() {
  const first = interiorPage(bookPosition);
  $('bookChapter').textContent = first ? first.name.toUpperCase() : 'LIBRO';
  $('bookCount').textContent = `Página ${bookPosition + 1} de ${bookPages.length}`;
  $('bookPrev').disabled = false;
  $('bookNext').disabled = bookPosition >= totalInteriorPages();
  $('bookProgress').innerHTML = Array.from({ length: totalInteriorPages() }, (_, i) => {
    const n = i + 1;
    return `<b class="${n === bookPosition ? 'current' : ''}" title="Página ${n + 1}"></b>`;
  }).join('');
}
function renderBook() {
  const cover = bookPages[0];
  if (cover) {
    $('closedBookImage').src = cover.src;
    $('closedBookImage').alt = cover.name || 'Portada del libro';
  }
  if (!bookOpened) {
    $('bookChapter').textContent = 'PORTADA';
    $('bookCount').textContent = 'Toca para abrir';
    return;
  }
  bookPosition = clampBookPosition(bookPosition);
  setPage(interiorPage(bookPosition));
  setProgress();
}
function clearTransition() {
  const overlay = $('bookFrame').querySelector('.single-page-turn');
  if (overlay) overlay.remove();
  $('bookFrame').classList.remove('is-animating');
  bookTurning = false;
  if (bookTransitionTimer) clearTimeout(bookTransitionTimer);
  bookTransitionTimer = null;
}
function openBook() {
  if (bookOpened || bookTurning) return;
  bookOpened = true;
  bookTurning = true;
  bookPosition = 1;
  renderBook();
  $('flipbookStage').classList.remove('hidden');
  $('bookScene').classList.add('is-opening');
  const done = () => {
    $('closedBook').classList.add('hidden');
    $('bookScene').classList.remove('is-opening');
    $('bookControls').classList.remove('is-hidden');
    $('bookInstruction').classList.remove('is-hidden');
    bookTurning = false;
    bookTransitionTimer = null;
  };
  bookTransitionTimer = setTimeout(done, reducedBookMotion() ? 40 : BOOK_OPEN_TIME);
}
function closeBook() {
  if (bookTurning || !bookOpened) return;
  bookTurning = true;
  $('closedBook').classList.remove('hidden');
  $('bookScene').classList.add('is-closing');
  $('bookControls').classList.add('is-hidden');
  $('bookInstruction').classList.add('is-hidden');
  bookTransitionTimer = setTimeout(() => {
    bookOpened = false;
    bookPosition = 1;
    $('flipbookStage').classList.add('hidden');
    $('bookScene').classList.remove('is-closing');
    bookTurning = false;
    bookTransitionTimer = null;
    renderBook();
  }, reducedBookMotion() ? 40 : 420);
}
// Se ve una sola página. La hoja actual se inclina ligeramente en 3D y
// descubre la siguiente por debajo: movimiento suave sin giros de 180 grados.
function animatePageChange(currentPage, nextPage, dir) {
  const frame = $('bookFrame');
  const overlay = document.createElement('div');
  overlay.className = `single-page-turn ${dir > 0 ? 'forward' : 'backward'}`;

  const paper = document.createElement('figure');
  paper.className = 'single-page-paper';
  const image = document.createElement('img');
  image.src = currentPage.src;
  image.alt = '';
  image.draggable = false;
  paper.appendChild(image);
  overlay.appendChild(paper);

  // La siguiente hoja queda debajo; no se duplica ni se abre otra al lado.
  setPage(nextPage);
  frame.classList.add('is-animating');
  frame.appendChild(overlay);
  if (!reducedBookMotion()) {
    void overlay.offsetWidth;
    overlay.classList.add('animate');
  }
}
function turnBook(dir) {
  if (bookTurning || !$('pamphlet').classList.contains('active')) return;
  if (!bookOpened) { if (dir > 0) openBook(); return; }
  const next = bookPosition + (dir > 0 ? 1 : -1);
  if (next < 1) { closeBook(); return; }
  if (next > maxBookPosition()) return;
  const currentPage = interiorPage(bookPosition);
  const nextPage = interiorPage(next);
  if (!currentPage || !nextPage) return;
  bookTurning = true;
  animatePageChange(currentPage, nextPage, dir);
  const finish = () => {
    bookPosition = next;
    clearTransition();
    renderBook();
  };
  bookTransitionTimer = setTimeout(finish, reducedBookMotion() ? 30 : BOOK_TURN_TIME);
}
function resetBook() {
  if (bookTransitionTimer) clearTimeout(bookTransitionTimer);
  clearTransition();
  bookOpened = false;
  bookPosition = 1;
  $('bookScene').classList.remove('is-opening', 'is-closing');
  $('closedBook').classList.remove('hidden');
  $('flipbookStage').classList.add('hidden');
  $('bookControls').classList.add('is-hidden');
  $('bookInstruction').classList.add('is-hidden');
  renderBook();
}
$('bookOpenButton').addEventListener('click', openBook);
$('bookPrev').addEventListener('click', () => turnBook(-1));
$('bookNext').addEventListener('click', () => turnBook(1));
$('bookClose').addEventListener('click', closeBook);
$('bookFrame').addEventListener('touchstart', e => {
  if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
$('bookFrame').addEventListener('touchend', e => {
  if (!touchStart || !e.changedTouches.length) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) {
    lastSwipe = Date.now();
    turnBook(dx < 0 ? 1 : -1);
  }
}, { passive: true });
$('bookFrame').addEventListener('click', e => {
  if (Date.now() - lastSwipe < 500 || bookTurning) return;
  const rect = $('bookFrame').getBoundingClientRect();
  turnBook(e.clientX > rect.left + rect.width / 2 ? 1 : -1);
});
document.addEventListener('keydown', e => {
  if (!$('pamphlet').classList.contains('active') || e.target.matches('input,textarea,select')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); turnBook(1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); turnBook(-1); }
  if (e.key === 'Escape' && bookOpened) { e.preventDefault(); closeBook(); }
});
window.addEventListener('resize', () => {
  if (bookTurning) clearTransition();
  if (bookOpened) {
    $('closedBook').classList.add('hidden');
    $('flipbookStage').classList.remove('hidden');
    $('bookControls').classList.remove('is-hidden');
    $('bookInstruction').classList.remove('is-hidden');
  }
  renderBook();
});
$('pamBtn').addEventListener('click', resetBook);
$('endPamBtn').addEventListener('click', resetBook);
$('bookPrintGallery').innerHTML = bookPages.map(page => `<figure class="print-image-page"><img src="${page.src}" alt="${page.name}"></figure>`).join('');
renderBook();
