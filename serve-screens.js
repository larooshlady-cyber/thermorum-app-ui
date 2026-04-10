const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8765;
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Serve static files (logo.svg etc)
  if (url.pathname !== '/' && url.pathname !== '/index.html') {
    const filePath = path.join(__dirname, url.pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const types = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  const screenId = url.searchParams.get('screen');

  if (!screenId) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(indexHtml);
    return;
  }

  // Inject script that immediately shows the requested screen and hides splash
  const injection = `
<script>
  // Run immediately after DOM
  document.addEventListener('DOMContentLoaded', function() {
    // Hide splash
    var splash = document.getElementById('splash');
    if (splash) splash.style.display = 'none';

    // Hide all screens
    document.querySelectorAll('.screen').forEach(function(s) {
      s.classList.remove('active');
      s.style.opacity = '0';
      s.style.pointerEvents = 'none';
    });

    // Show target screen
    var target = document.getElementById('${screenId}');
    if (target) {
      target.classList.add('active');
      target.style.opacity = '1';
      target.style.pointerEvents = 'all';
      target.style.zIndex = '5';
    }

    // Show tab bar for non-auth screens
    var authScreens = ['screen-welcome','screen-login','screen-register','screen-verify-phone','screen-google-picker','screen-order-success','screen-guest-prompt','screen-chat'];
    var tabBar = document.getElementById('tabBar');
    if (tabBar) {
      if (authScreens.indexOf('${screenId}') === -1) {
        tabBar.classList.remove('hidden');
      } else {
        tabBar.classList.add('hidden');
      }
    }
  });
</script>
</head>`;

  const modified = indexHtml.replace('</head>', injection);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(modified);
});

server.listen(PORT, () => {
  console.log(`Serving screens at http://localhost:${PORT}?screen=screen-home`);
});
