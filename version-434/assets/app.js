(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', panel.classList.contains('open') ? 'true' : 'false');
    });
  }

  function setupFilters() {
    var input = document.querySelector('.filter-input');
    var buttons = bySelector('.filter-button');
    var cards = bySelector('.movie-card[data-search]');
    if (!cards.length) {
      return;
    }
    var active = 'all';

    function apply() {
      var keyword = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var valueMatch = active === 'all' || normalize(card.getAttribute('data-type')).indexOf(active) !== -1 || normalize(card.getAttribute('data-year')).indexOf(active) !== -1 || normalize(card.getAttribute('data-region')).indexOf(active) !== -1 || normalize(card.getAttribute('data-genre')).indexOf(active) !== -1;
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = valueMatch && keywordMatch ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = normalize(button.getAttribute('data-value') || 'all');
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  }

  function createResult(item) {
    var card = document.createElement('a');
    card.className = 'movie-card';
    card.href = item.url;
    card.innerHTML = [
      '<div class="movie-poster">',
      '<span class="badge-row"><span class="badge">' + escapeHtml(item.year) + '</span><span class="badge dark">' + escapeHtml(item.type) + '</span></span>',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '</div>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '</div>'
    ].join('');
    return card;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    var form = document.querySelector('[data-search-form]');
    if (!results || !input || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var current = params.get('q') || '';
    input.value = current;

    function render(query) {
      var keyword = normalize(query);
      var items = window.SEARCH_ITEMS;
      var matched = keyword ? items.filter(function (item) {
        return normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ')).indexOf(keyword) !== -1;
      }) : items.slice(0, 24);
      results.innerHTML = '';
      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有找到匹配的影片内容';
        results.appendChild(empty);
        return;
      }
      matched.slice(0, 120).forEach(function (item) {
        results.appendChild(createResult(item));
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        window.history.replaceState(null, '', nextUrl);
        render(query);
      });
    }

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(current);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupFilters();
    setupSearchPage();
  });
})();
