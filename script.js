/* ================================================
   TATÁÁH ARTS — JAVASCRIPT
   1. Toggle tema claro/escuro
   2. Menu hamburguer (mobile)
   3. Mini-galeria interna dos cards de produto
   4. Highlight automático da âncora ativa no scroll
   ================================================ */


/* ── 1. TEMA CLARO / ESCURO ── */
const THEME_KEY  = 'tataah.theme';
const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const themeBtn  = document.getElementById('themeToggle');
const setPressed = (isDark) => themeBtn.setAttribute('aria-pressed', String(isDark));
setPressed(savedTheme === 'dark');

themeBtn.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next   = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  setPressed(next === 'dark');
});


/* ── 2. MENU HAMBURGUER ── */
const menuToggle = document.getElementById('menuToggle');
const mainNav    = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

/* Fecha o menu ao clicar em qualquer link */
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});


/* ── 3. MINI-GALERIA INTERNA DOS CARDS ──

   Cada .pcard tem dentro:
     .pcard-slides > .pcard-slide (várias fotos)
     .pgal-btn.prev  /  .pgal-btn.next  (setas)
     .pgal-dots                          (bolinhas)

   Esta função inicializa a galeria de um card:
   - Cria as bolinhas dinamicamente
   - Botões prev/next trocam o slide ativo
   - Se só há 1 foto, esconde os controles
*/
function initMiniGallery(card) {
  const gallery = card.querySelector('.pcard-gallery');
  const slides  = card.querySelectorAll('.pcard-slide');
  const btnPrev = card.querySelector('.pgal-btn.prev');
  const btnNext = card.querySelector('.pgal-btn.next');
  const dotsBox = card.querySelector('.pgal-dots');

  /* Se tiver só 1 foto, marca o atributo e para */
  if (slides.length <= 1) {
    gallery.setAttribute('data-single', 'true');
    return;
  }

  let current = 0; // índice do slide visível

  /* Cria uma bolinha para cada slide */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('pgal-dot');
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `Foto ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(dot);
  });

  /* Navega para um índice específico */
  function goTo(index) {
    slides[current].classList.remove('active');
    dotsBox.children[current].classList.remove('active');

    current = Math.max(0, Math.min(index, slides.length - 1));

    slides[current].classList.add('active');
    dotsBox.children[current].classList.add('active');

    /* Desabilita setas nas extremidades */
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === slides.length - 1;
  }

  btnPrev.addEventListener('click', (e) => {
    e.stopPropagation(); /* evita propagar clique para o card */
    goTo(current - 1);
  });

  btnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    goTo(current + 1);
  });

  /* Suporte a swipe touch na galeria */
  let touchStartX = 0;
  gallery.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  gallery.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { /* mínimo 40px para ser considerado swipe */
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
    }
  });

  /* Estado inicial */
  goTo(0);
}

/* Inicializa a galeria em todos os cards da página */
document.querySelectorAll('.pcard').forEach(initMiniGallery);


/* ── 4. HIGHLIGHT DA ÂNCORA ATIVA AO ROLAR ──

   Usa IntersectionObserver para detectar qual
   bloco de categoria (.cat-block) está mais visível
   e marca o link de âncora correspondente com .active.
*/
const anchorLinks = document.querySelectorAll('.anchor-btn');
const catBlocks   = document.querySelectorAll('.cat-block');

/* Mapa id → link âncora para acesso rápido */
const anchorMap = {};
anchorLinks.forEach(link => {
  const id = link.getAttribute('href').replace('#', '');
  anchorMap[id] = link;
});

/* Observer: dispara quando um bloco entra/sai da viewport */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      /* Remove .active de todos os links */
      anchorLinks.forEach(l => l.classList.remove('active'));
      /* Adiciona .active no link correspondente ao bloco visível */
      const link = anchorMap[entry.target.id];
      if (link) link.classList.add('active');
    }
  });
}, {
  rootMargin: '-130px 0px -60% 0px', /* margem: compensa header + barra */
  threshold: 0
});

catBlocks.forEach(block => observer.observe(block));