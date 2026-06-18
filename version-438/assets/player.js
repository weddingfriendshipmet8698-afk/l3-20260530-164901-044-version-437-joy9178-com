(function () {
  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var posterLayer = player.querySelector('[data-poster-layer]');
    var playButton = player.querySelector('[data-play-button]');
    var source = video ? video.getAttribute('data-src') : '';
    var hls = null;
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            destroyHls();
            attached = false;
          }
        });
      }
    }

    function destroyHls() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    }

    function playVideo() {
      attachSource();
      video.controls = true;

      if (posterLayer) {
        posterLayer.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (posterLayer) {
            posterLayer.classList.remove('is-hidden');
          }
        });
      }
    }

    if (posterLayer) {
      posterLayer.addEventListener('click', playVideo);
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.stopPropagation();
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('ended', function () {
      if (posterLayer) {
        posterLayer.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', destroyHls);
  });
})();
