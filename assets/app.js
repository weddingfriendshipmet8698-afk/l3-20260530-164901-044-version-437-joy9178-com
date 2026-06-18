(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var showSlide = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var yearButtons = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-year]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card'));
    var activeYear = 'all';
    var applyFilter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var title = card.getAttribute('data-title') || '';
        var year = card.getAttribute('data-year') || '';
        var region = (card.getAttribute('data-region') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var text = title + ' ' + region + ' ' + genre;
        var keywordOk = !keyword || text.indexOf(keyword) !== -1;
        var yearOk = activeYear === 'all' || year === activeYear;
        card.classList.toggle('hidden-card', !(keywordOk && yearOk));
      });
    };
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year') || 'all';
        yearButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  }

  var shortcut = document.querySelector('[data-play-shortcut]');
  if (shortcut) {
    shortcut.addEventListener('click', function (event) {
      var startButton = document.querySelector('.player-start');
      if (startButton) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(function () {
          startButton.click();
        }, 260);
      }
    });
  }

  var frame = document.querySelector('.player-frame');
  if (frame) {
    var video = frame.querySelector('video');
    var start = frame.querySelector('.player-start');
    var src = frame.getAttribute('data-src');
    var hls = null;
    var ready = false;
    var ensureSource = function () {
      if (!video || !src || ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        var message = document.createElement('div');
        message.className = 'player-message';
        message.textContent = '播放暂时不可用';
        frame.appendChild(message);
      }
    };
    var begin = function () {
      ensureSource();
      if (start) {
        start.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (start) {
            start.classList.remove('hidden');
          }
        });
      }
    };
    if (start && video) {
      start.addEventListener('click', begin);
      video.addEventListener('play', function () {
        start.classList.add('hidden');
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
