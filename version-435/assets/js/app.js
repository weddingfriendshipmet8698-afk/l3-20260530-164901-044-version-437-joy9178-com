(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll('[data-search-form]');

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();

        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var action = form.getAttribute('action') || 'search.html';
        var url = query ? action + '?q=' + encodeURIComponent(query) : action;

        window.location.href = url;
      });
    });
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initLocalFilters() {
    var inputs = document.querySelectorAll('[data-filter-input]');

    inputs.forEach(function (input) {
      var targetId = input.getAttribute('data-filter-target');
      var grid = targetId ? document.getElementById(targetId) : null;
      var emptyState = document.querySelector('[data-empty-state]');

      if (!grid) {
        return;
      }

      input.addEventListener('input', function () {
        var query = normalizeText(input.value);
        var cards = grid.querySelectorAll('.movie-card');
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalizeText(card.getAttribute('data-search'));
          var matched = !query || text.indexOf(query) !== -1;
          card.classList.toggle('is-hidden-card', !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      });
    });
  }

  function initVideoElement(video) {
    if (!video || video.dataset.ready === 'true') {
      return;
    }

    var source = video.getAttribute('data-src');

    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    video.dataset.ready = 'true';
  }

  function initPlayers() {
    var videos = document.querySelectorAll('.site-video');

    videos.forEach(function (video) {
      initVideoElement(video);

      var shell = video.closest('.video-shell');
      var playButton = shell ? shell.querySelector('.player-play-button') : null;

      if (playButton) {
        playButton.addEventListener('click', function () {
          initVideoElement(video);
          playButton.classList.add('is-hidden');

          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              playButton.classList.remove('is-hidden');
            });
          }
        });

        video.addEventListener('play', function () {
          playButton.classList.add('is-hidden');
        });

        video.addEventListener('pause', function () {
          playButton.classList.remove('is-hidden');
        });
      }
    });
  }

  function cardTemplate(movie) {
    return [
      '<a class="video-card movie-card" href="' + escapeHtml(movie.url) + '" data-search="' + escapeHtml(movie.searchText) + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-overlay"></span>',
      '    <span class="poster-play" aria-hidden="true">▶</span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <em>' + escapeHtml(movie.oneLine) + '</em>',
      '    <span class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.type) + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function renderSearchResults(query) {
    var data = window.MOVIE_SEARCH_DATA || [];
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var normalized = normalizeText(query);

    if (!results || !status) {
      return;
    }

    if (!normalized) {
      var firstBatch = data.slice(0, 24);
      results.innerHTML = firstBatch.map(cardTemplate).join('');
      status.textContent = '展示精选内容，输入关键词可继续筛选。';
      return;
    }

    var terms = normalized.split(/\s+/).filter(Boolean);
    var matched = data.filter(function (movie) {
      var text = normalizeText(movie.searchText);
      return terms.every(function (term) {
        return text.indexOf(term) !== -1;
      });
    });

    results.innerHTML = matched.slice(0, 120).map(cardTemplate).join('');
    status.textContent = matched.length ? '已找到匹配内容。' : '没有找到匹配的内容。';
  }

  function initSearchPage() {
    var form = document.querySelector('[data-live-search-form]');
    var input = document.querySelector('[data-live-search-input]');

    if (!form || !input || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var initialQuery = getSearchQuery();
    input.value = initialQuery;
    renderSearchResults(initialQuery);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', url);
      renderSearchResults(query);
    });

    input.addEventListener('input', function () {
      renderSearchResults(input.value);
    });
  }

  ready(function () {
    initMobileMenu();
    initSearchForms();
    initLocalFilters();
    initPlayers();
    initSearchPage();
  });
})();
