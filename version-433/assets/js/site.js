(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function bootNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobile = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobile) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobile.classList.toggle("is-open");
        });
    }

    function bootSearchForms() {
        all("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var action = form.getAttribute("action") || "search.html";
                var target = new URL(action, window.location.href);
                if (value) {
                    target.searchParams.set("q", value);
                }
                window.location.href = target.href;
            });
        });
    }

    function bootHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = all("[data-hero-slide]", slider);
        var dots = all("[data-hero-dot]", slider);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        show(0);
        start();
    }

    function bootFilters() {
        var panels = all("[data-filter-panel]");
        panels.forEach(function (panel) {
            var scopeSelector = panel.getAttribute("data-filter-panel");
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            var cards = all(".movie-card, .rank-row", scope || document);
            var searchInput = panel.querySelector("[data-filter-search]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var regionSelect = panel.querySelector("[data-filter-region]");
            var countNode = document.querySelector(panel.getAttribute("data-count-target") || "");
            var emptyNode = document.querySelector(panel.getAttribute("data-empty-target") || "");

            function apply() {
                var q = normalize(searchInput && searchInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var matched = true;
                    if (q && haystack.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (year && normalize(card.getAttribute("data-year")) !== year) {
                        matched = false;
                    }
                    if (region && normalize(card.getAttribute("data-region")).indexOf(region) === -1) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        shown += 1;
                    }
                });

                if (countNode) {
                    countNode.textContent = "当前显示 " + shown + " 部影片";
                }
                if (emptyNode) {
                    emptyNode.classList.toggle("is-visible", shown === 0);
                }
            }

            [searchInput, yearSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (query && searchInput) {
                searchInput.value = query;
            }
            apply();
        });
    }

    window.initVideoPlayer = function (src) {
        var video = document.getElementById("movie-player");
        if (!video || !src) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    video.src = src;
                }
            });
            return;
        }

        video.src = src;
    };

    function boot() {
        bootNavigation();
        bootSearchForms();
        bootHero();
        bootFilters();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
