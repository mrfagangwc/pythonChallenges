// Classic scripts can load from file://. Hosted pages use the maintainable
// module sources; double-clicked pages use their generated, self-contained copy.
(() => {
  const script = document.createElement('script');
  const offline = window.location.protocol === 'file:';
  const base = document.currentScript.src;
  script.src = new URL(offline ? 'offline.js' : 'app.js', base).href;
  if (!offline) script.type = 'module';

  function showProblem() {
    const status = document.querySelector('#boot-status');
    if (!status) return;
    status.querySelector('h1').textContent = 'Code Arcade couldn’t open';
    status.querySelector('p').textContent = 'Keep index.html and all its folders together, then reload. If you downloaded the upload ZIP, extract all of it first. Lesson time never blocks this activity.';
  }
  script.addEventListener('error', showProblem);
  script.addEventListener('load', () => {
    if (document.querySelector('#boot-status')) showProblem();
  });
  document.head.append(script);
})();
