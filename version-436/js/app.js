(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
      slide.setAttribute('aria-hidden', slideIndex === activeSlide ? 'false' : 'true');
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 6200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function applySearch() {
    if (!searchInput || !cards.length) {
      return;
    }

    var query = normalize(searchInput.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre')
      ].join(' '));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
    applySearch();
  }

  var sortButtons = Array.prototype.slice.call(document.querySelectorAll('[data-sort]'));

  sortButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var sortKey = button.getAttribute('data-sort');
      var grid = document.querySelector('[data-card-grid]');

      if (!grid) {
        return;
      }

      sortButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });

      var sortedCards = Array.prototype.slice.call(grid.querySelectorAll('[data-title]'));
      sortedCards.sort(function (a, b) {
        if (sortKey === 'views') {
          return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
        }
        if (sortKey === 'likes') {
          return Number(b.getAttribute('data-likes') || 0) - Number(a.getAttribute('data-likes') || 0);
        }
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });

      sortedCards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  });

  var playerShells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var status = shell.parentElement.querySelector('[data-player-status]');

    if (!video) {
      return;
    }

    var src = video.getAttribute('data-src');
    if (!src) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    shell.classList.add('is-playing');
    setStatus('视频加载中');

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setStatus('点击播放器继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus('当前线路正在重新连接');
            hls.destroy();
            video.src = src;
            video.play().catch(function () {
              setStatus('点击播放器继续播放');
            });
          }
        });
        video._hlsInstance = hls;
      } else {
        video.play().catch(function () {
          setStatus('点击播放器继续播放');
        });
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(function () {
        setStatus('点击播放器继续播放');
      });
    } else {
      video.src = src;
      video.play().catch(function () {
        setStatus('点击播放器继续播放');
      });
    }
  }

  playerShells.forEach(function (shell) {
    var button = shell.querySelector('.play-button');
    shell.addEventListener('click', function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
        return;
      }
      startPlayer(shell);
    });
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayer(shell);
      });
    }
  });
})();
