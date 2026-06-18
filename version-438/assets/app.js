(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var globalInput = document.querySelector('[data-global-search-input]');
  var searchGrid = document.querySelector('[data-search-grid]');

  if (globalInput && searchGrid) {
    var url = new URL(window.location.href);
    var initial = url.searchParams.get('q') || '';
    globalInput.value = initial;
    filterCards(searchGrid, initial);

    globalInput.addEventListener('input', function () {
      filterCards(searchGrid, globalInput.value);
    });

    document.querySelectorAll('[data-fill-query]').forEach(function (button) {
      button.addEventListener('click', function () {
        globalInput.value = button.getAttribute('data-fill-query') || '';
        filterCards(searchGrid, globalInput.value);
        globalInput.focus();
      });
    });
  }

  document.querySelectorAll('[data-local-search]').forEach(function (input) {
    var section = input.closest('.section-shell');
    var grid = section ? section.querySelector('[data-card-grid]') : null;

    if (!grid) {
      return;
    }

    input.addEventListener('input', function () {
      filterCards(grid, input.value);
    });
  });

  document.querySelectorAll('[data-sort-cards]').forEach(function (select) {
    var section = select.closest('.section-shell');
    var grid = section ? section.querySelector('[data-card-grid]') : null;

    if (!grid) {
      return;
    }

    select.addEventListener('change', function () {
      sortCards(grid, select.value);
    });
  });

  function filterCards(grid, query) {
    var normalized = String(query || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var matched = !normalized || haystack.indexOf(normalized) !== -1;
      card.style.display = matched ? '' : 'none';

      if (matched) {
        visibleCount += 1;
      }
    });

    var emptyState = grid.parentElement ? grid.parentElement.querySelector('[data-empty-state]') : null;

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  function sortCards(grid, mode) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    cards.sort(function (a, b) {
      if (mode === 'views') {
        return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
      }

      if (mode === 'year') {
        return String(b.getAttribute('data-year') || '').localeCompare(String(a.getAttribute('data-year') || ''), 'zh-Hans-CN');
      }

      if (mode === 'title') {
        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
      }

      return 0;
    });

    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  }
})();
