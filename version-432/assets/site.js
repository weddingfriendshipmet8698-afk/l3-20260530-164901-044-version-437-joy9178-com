(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = qs('.mobile-toggle');
        var panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    }

    function setupHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('.hero-dot', slider);
        var prev = qs('.hero-prev', slider);
        var next = qs('.hero-next', slider);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function move(step) {
            show(index + step);
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                move(-1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                move(1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        restart();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilters() {
        var grids = qsa('[data-filterable="true"]');
        if (!grids.length) {
            return;
        }
        var input = qs('.page-search-input');
        var select = qs('.page-category-select');
        var noResults = qs('.no-results');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input && query) {
            input.value = query;
        }

        function apply() {
            var term = normalize(input && input.value);
            var category = normalize(select && select.value);
            var visible = 0;
            grids.forEach(function (grid) {
                qsa('.movie-card', grid).forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.category,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.tags
                    ].join(' '));
                    var matchTerm = !term || haystack.indexOf(term) !== -1;
                    var matchCategory = !category || normalize(card.dataset.category) === category;
                    var matched = matchTerm && matchCategory;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
            });
            if (noResults) {
                noResults.classList.toggle('show', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (select) {
            select.addEventListener('change', apply);
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
