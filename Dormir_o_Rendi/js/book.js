/* Libro por imágenes. Todas las páginas y su orden se configuran en js/data/book-pages.js.
   Se usa un giro 3D real de la hoja, con anverso y reverso, sin librerías externas. */
let bookPosition = 1; // la portada ocupa el índice 0
let bookOpened = false;
let bookTurning = false;
let bookWasMobile = bookIsMobile();
let touchStart = null;
let lastSwipe = 0;
let bookTransitionTimer = null;

const BOOK_TURN_TIME = 950;
const BOOK_OPEN_TIME = 750;
const reducedBookMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function bookIsMobile() { return window.matchMedia('(max-width: 799px)').matches; }
function totalInteriorPages() { return Math.max(0, bookPages.length - 1); }
function visiblePerView() { return bookIsMobile() ? 1 : 2; }
function maxBookPosition() {
  const total = totalInteriorPages();
  if (total <= 1) return 1;
  return bookIsMobile() ? total : (total % 2 === 0 ? total - 1 : total);
}
function clampBookPosition(pos) { return Math.min(Math.max(1, pos), maxBookPosition()); }
function interiorPage(n) { return bookPages[n] || null; }
function pageCard(page) {
  if (!page) return '<div class="image-page placeholder-page" aria-hidden="true"></div>';
  return `<figure class="image-page"><img src="${page.src}" alt="${page.name}" draggable="false"></figure>`;
}
function setSpread(left, right) {
  $('bookSpread').innerHTML = pageCard(left) + (!bookIsMobile() ? pageCard(right) : '');
}
function setProgress() {
  const perView = visiblePerView();
  const ending = Math.min(bookPosition + perView - 1, totalInteriorPages());
  const first = interiorPage(bookPosition);
  $('bookChapter').textContent = first ? first.name.toUpperCase() : 'LIBRO';
  $('bookCount').textContent = perView === 1
    ? `Página ${bookPosition + 1} de ${bookPages.length}`
    : `Páginas ${bookPosition + 1}${ending > bookPosition ? '–' + (ending + 1) : ''} de ${bookPages.length}`;
  $('bookPrev').disabled = false;
  $('bookNext').disabled = ending >= totalInteriorPages();
  $('bookProgress').innerHTML = Array.from({ length: totalInteriorPages() }, (_, i) => {
    const n = i + 1;
    return `<b class="${n >= bookPosition && n <= ending ? 'current' : ''}" title="Página ${n}"></b>`;
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
  setSpread(interiorPage(bookPosition), interiorPage(bookPosition + 1));
  setProgress();
}
function cleanTurn() {
  const sheet = $('bookFrame').querySelector('.turn-sheet');
  if (sheet) sheet.remove();
  $('bookFrame').classList.remove('is-turning');
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
  }, reducedBookMotion() ? 40 : 520);
}
function makeTurnFace(page, side) {
  const el = document.createElement('div');
  el.className = `turn-face ${side}`;
  if (page) {
    const img = document.createElement('img');
    img.src = page.src;
    img.alt = '';
    img.draggable = false;
    el.appendChild(img);
  } else {
    el.classList.add('blank-face');
  }
  return el;
}
function turnBook(dir) {
  if (bookTurning || !$('pamphlet').classList.contains('active')) return;
  if (!bookOpened) { if (dir > 0) openBook(); return; }
  const per = visiblePerView();
  const next = bookPosition + per * (dir > 0 ? 1 : -1);
  if (next < 1) { closeBook(); return; }
  if (next > maxBookPosition()) return;
  const current = bookPosition;
  const mobile = bookIsMobile();
  const frame = $('bookFrame');
  const rect = frame.getBoundingClientRect();
  const pageElement = $('bookSpread').querySelector(mobile ? '.image-page:first-child' : dir > 0 ? '.image-page:nth-child(2)' : '.image-page:first-child');
  if (!pageElement) return;
  const pageRect = pageElement.getBoundingClientRect();
  const sheet = document.createElement('div');
  sheet.className = `turn-sheet ${dir > 0 ? 'turn-forward' : 'turn-backward'}`;
  sheet.style.top = `${pageRect.top - rect.top}px`;
  sheet.style.left = `${pageRect.left - rect.left}px`;
  sheet.style.width = `${pageRect.width}px`;
  sheet.style.height = `${pageRect.height}px`;

  let front, back, underLeft, underRight;
  if (mobile) {
    front = interiorPage(current);
    back = interiorPage(next);
    underLeft = interiorPage(next);
    underRight = null;
  } else if (dir > 0) {
    front = interiorPage(current + 1);    // hoja derecha que se levanta
    back = interiorPage(next);             // reverso de esa hoja
    underLeft = interiorPage(current);     // visible a la izquierda hasta finalizar
    underRight = interiorPage(next + 1);  // página que queda bajo la hoja
  } else {
    front = interiorPage(current);        // hoja izquierda que regresa
    back = interiorPage(next + 1);       // reverso que reaparece a la derecha
    underLeft = interiorPage(next);
    underRight = interiorPage(current + 1);
  }
  sheet.append(makeTurnFace(front, 'front'), makeTurnFace(back, 'back'));
  bookTurning = true;
  frame.classList.add('is-turning');
  setSpread(underLeft, underRight);
  frame.appendChild(sheet);
  if (reducedBookMotion()) {
    bookPosition = next;
    cleanTurn();
    renderBook();
    return;
  }
  // Reiniciar la animación al pasar páginas rápidamente.
  void sheet.offsetWidth;
  sheet.classList.add('animate-turn');
  const finish = () => {
    if (!bookTurning || !sheet.isConnected) return;
    bookPosition = next;
    cleanTurn();
    renderBook();
  };
  sheet.addEventListener('animationend', finish, { once: true });
  // Respaldo si un navegador suspende el evento de animación.
  bookTransitionTimer = setTimeout(finish, BOOK_TURN_TIME + 180);
}
function resetBook() {
  if (bookTransitionTimer) clearTimeout(bookTransitionTimer);
  cleanTurn();
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
  const mobile = bookIsMobile();
  if (mobile !== bookWasMobile) {
    bookWasMobile = mobile;
    if (bookTransitionTimer) clearTimeout(bookTransitionTimer);
    cleanTurn();
    $('bookScene').classList.remove('is-opening', 'is-closing');
    if (bookOpened) {
      $('closedBook').classList.add('hidden');
      $('flipbookStage').classList.remove('hidden');
      $('bookControls').classList.remove('is-hidden');
      $('bookInstruction').classList.remove('is-hidden');
      if (!mobile && bookPosition % 2 === 0) bookPosition--;
    }
    renderBook();
  }
});
$('pamBtn').addEventListener('click', resetBook);
$('endPamBtn').addEventListener('click', resetBook);
$('bookPrintGallery').innerHTML = bookPages.map(page => `<figure class="print-image-page"><img src="${page.src}" alt="${page.name}"></figure>`).join('');
renderBook();
