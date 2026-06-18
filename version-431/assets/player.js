import { H as Hls } from './hls.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach(function (shell) {
  const video = shell.querySelector('video');
  const button = shell.querySelector('.play-layer');
  const stream = video ? video.getAttribute('data-stream') : '';
  let hls = null;
  let attached = false;

  function attach() {
    if (!video || !stream || attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(stream);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal || !hls) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });

      return;
    }

    video.src = stream;
  }

  function revealButton() {
    if (button) {
      button.hidden = false;
      button.style.display = 'flex';
    }
    shell.classList.remove('is-playing');
  }

  function hideButton() {
    if (button) {
      button.hidden = true;
      button.style.display = 'none';
    }
    shell.classList.add('is-playing');
  }

  function start() {
    if (!video) {
      return;
    }

    attach();
    video.setAttribute('controls', 'controls');
    hideButton();

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        const retry = function () {
          video.play().catch(revealButton);
          video.removeEventListener('canplay', retry);
        };
        video.addEventListener('canplay', retry);
      });
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });

    video.addEventListener('play', hideButton);
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
