document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  var toggle = document.querySelector('.mobile-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = !body.classList.contains('nav-open');
      body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length) {
    var active = 0;
    var activate = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    var next = document.querySelector('.hero-next');
    var prev = document.querySelector('.hero-prev');
    if (next) {
      next.addEventListener('click', function () {
        activate(active + 1);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        activate(active - 1);
      });
    }
    window.setInterval(function () {
      activate(active + 1);
    }, 5200);
  }

  var runFilter = function (input, root) {
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var countNode = root.querySelector('.filter-count');
    var emptyNode = root.querySelector('.empty-state');
    var apply = function () {
      var query = (input.value || '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var show = !query || text.indexOf(query) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (countNode) {
        countNode.textContent = query ? '找到 ' + visible + ' 部影片' : '输入关键词筛选当前片库';
      }
      if (emptyNode) {
        emptyNode.classList.toggle('is-visible', visible === 0);
      }
    };
    input.addEventListener('input', apply);
    apply();
  };

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]')).forEach(function (area) {
    var input = area.querySelector('.local-filter, .global-search-input');
    if (input) {
      runFilter(input, area);
    }
  });

  var searchInput = document.querySelector('.global-search-input');
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
      searchInput.dispatchEvent(new Event('input'));
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-stream');
    var ready = false;
    var begin = function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (!ready && source) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          ready = true;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          ready = true;
        } else {
          video.src = source;
          ready = true;
        }
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };
    if (overlay) {
      overlay.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
  });
});
