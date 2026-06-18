(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var heroTabs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
    var heroPanels = Array.prototype.slice.call(document.querySelectorAll('[data-hero-panel]'));
    var activeHero = 0;
    var heroTimer = null;

    function showHero(index) {
        if (!heroPanels.length) {
            return;
        }

        activeHero = index % heroPanels.length;
        heroPanels.forEach(function (panel, panelIndex) {
            panel.classList.toggle('is-active', panelIndex === activeHero);
        });
        heroTabs.forEach(function (tab, tabIndex) {
            tab.classList.toggle('is-active', tabIndex === activeHero);
        });
    }

    function startHeroTimer() {
        if (heroPanels.length < 2) {
            return;
        }

        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
            showHero(activeHero + 1);
        }, 5600);
    }

    heroTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var nextIndex = Number(tab.getAttribute('data-hero-target')) || 0;
            showHero(nextIndex);
            startHeroTimer();
        });
    });

    startHeroTimer();

    var searchInput = document.querySelector('.page-search-input');
    var sortSelect = document.querySelector('.sort-select');
    var filterGrid = document.querySelector('.filter-grid');
    var emptyState = document.querySelector('.empty-state');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
    var currentCategory = 'all';

    function getCards() {
        return Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : '');
        var visible = 0;

        getCards().forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year')
            ].join(' '));
            var categoryOk = currentCategory === 'all' || normalize(card.textContent).indexOf(normalize(currentCategory)) !== -1;
            var queryOk = !query || haystack.indexOf(query) !== -1;
            var show = categoryOk && queryOk;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    function sortCards(mode) {
        if (!filterGrid || !mode || mode === 'default') {
            return;
        }

        var cards = getCards();
        cards.sort(function (a, b) {
            if (mode === 'rating') {
                return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
            }
            if (mode === 'views') {
                return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
            }
            if (mode === 'year') {
                return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            }
            return 0;
        });
        cards.forEach(function (card) {
            filterGrid.appendChild(card);
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener('input', applyFilters);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortCards(sortSelect.value);
            applyFilters();
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            currentCategory = button.getAttribute('data-filter-category') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyFilters();
        });
    });

    applyFilters();
})();
