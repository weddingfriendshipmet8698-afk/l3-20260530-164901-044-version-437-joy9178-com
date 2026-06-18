(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      const open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('.hero-slider');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const thumbs = Array.from(hero.querySelectorAll('.hero-thumb'));
    const prev = hero.querySelector('.hero-prev');
    const next = hero.querySelector('.hero-next');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (item, idx) {
        item.classList.toggle('active', idx === current);
      });
      dots.forEach(function (item, idx) {
        item.classList.toggle('active', idx === current);
      });
      thumbs.forEach(function (item, idx) {
        item.classList.toggle('active', idx === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.concat(thumbs).forEach(function (item) {
      item.addEventListener('click', function () {
        const target = Number(item.getAttribute('data-slide-target'));
        show(target);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    show(0);
    play();
  }

  const filterPanels = Array.from(document.querySelectorAll('.filter-panel'));

  filterPanels.forEach(function (panel) {
    const input = panel.querySelector('.filter-input');
    const yearSelect = panel.querySelector('.filter-year');
    const empty = panel.querySelector('.empty-note');
    const grid = panel.nextElementSibling ? panel.nextElementSibling.querySelector('.movie-grid') : document.querySelector('.movie-grid');
    const cards = grid ? Array.from(grid.querySelectorAll('.searchable')) : [];

    if (!input || !cards.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (query && input.name === 'q') {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      const keyword = normalize(input.value);
      const selectedYear = yearSelect ? yearSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(card.getAttribute('data-search'));
        const year = String(card.getAttribute('data-year') || '');
        const keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        let yearMatch = true;

        if (selectedYear) {
          if (selectedYear === '1990') {
            yearMatch = /^199/.test(year);
          } else {
            yearMatch = year === selectedYear;
          }
        }

        const shouldShow = keywordMatch && yearMatch;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener('input', applyFilter);

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  });
})();
