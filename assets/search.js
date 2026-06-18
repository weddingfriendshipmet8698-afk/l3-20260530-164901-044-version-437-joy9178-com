(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var quickTags = document.querySelector('[data-quick-tags]');
  var movies = window.searchMovies || [];

  var renderCard = function (movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span>#' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a href="' + escapeHtml(movie.link) + '" class="card-link" aria-label="' + escapeHtml(movie.title) + '">' +
      '<div class="poster-wrap">' +
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<div class="poster-shade"><p>' + escapeHtml(movie.description) + '</p></div>' +
      '<span class="region-badge">' + escapeHtml(movie.category) + '</span>' +
      '</div>' +
      '<div class="card-body">' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.description) + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.score) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</a>' +
      '</article>';
  };

  var escapeHtml = function (text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  var search = function (keyword) {
    var query = String(keyword || '').trim().toLowerCase();
    if (!query) {
      return movies.slice(0, 24);
    }
    return movies.filter(function (movie) {
      var text = [
        movie.title,
        movie.description,
        movie.category,
        movie.year,
        movie.region,
        movie.genre,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return text.indexOf(query) !== -1;
    }).slice(0, 120);
  };

  var update = function (keyword) {
    var list = search(keyword);
    if (results) {
      results.innerHTML = list.map(renderCard).join('');
    }
    if (status) {
      status.textContent = keyword ? '搜索结果：' + list.length + ' 部' : '热门影片';
    }
  };

  if (input) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    update(initial);
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var keyword = input ? input.value : '';
      var url = new URL(window.location.href);
      if (keyword.trim()) {
        url.searchParams.set('q', keyword.trim());
      } else {
        url.searchParams.delete('q');
      }
      history.replaceState(null, '', url.toString());
      update(keyword);
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      update(input.value);
    });
  }

  if (quickTags) {
    quickTags.addEventListener('click', function (event) {
      if (event.target.tagName.toLowerCase() === 'button') {
        input.value = event.target.textContent;
        update(input.value);
      }
    });
  }
})();
