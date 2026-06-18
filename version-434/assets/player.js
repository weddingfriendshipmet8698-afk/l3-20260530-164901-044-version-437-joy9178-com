(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.play-layer');
      var stream = box.getAttribute('data-stream');
      var hlsInstance = null;

      function attach() {
        if (!video || !stream || box.getAttribute('data-loaded') === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        box.setAttribute('data-loaded', '1');
      }

      function start() {
        attach();
        if (!video) {
          return;
        }
        video.setAttribute('controls', 'controls');
        if (button) {
          button.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (box.getAttribute('data-loaded') !== '1') {
            start();
          }
        });
        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
