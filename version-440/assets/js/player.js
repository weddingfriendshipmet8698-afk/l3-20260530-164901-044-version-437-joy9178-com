(function () {
    window.bindMoviePlayer = function (options) {
        var video = document.getElementById('movie-player');
        var layer = document.getElementById('player-layer');
        var url = options && options.url;
        var attached = false;
        var hls = null;

        function attach() {
            if (!video || !url || attached) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                return;
            }

            video.src = url;
        }

        function play() {
            if (!video) {
                return;
            }

            attach();
            video.controls = true;

            if (layer) {
                layer.classList.add('is-hidden');
            }

            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (layer) {
                    layer.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
