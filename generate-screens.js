const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const outDir = path.join(__dirname, 'screens');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Extract all screen IDs
const screenIds = [];
const re = /id="(screen-[^"]+)"/g;
let m;
while ((m = re.exec(html)) !== null) {
  screenIds.push(m[1]);
}

const authScreens = ['screen-welcome','screen-login','screen-register','screen-verify-phone','screen-google-picker','screen-order-success','screen-guest-prompt','screen-chat'];

for (const sid of screenIds) {
  const showTab = !authScreens.includes(sid);

  const script = `
<script>
(function(){
  var splash = document.getElementById('splash');
  if(splash) splash.style.display='none';
  document.querySelectorAll('.screen').forEach(function(s){
    s.classList.remove('active','fade-in','fade-out','slide-back-in','slide-back-out');
    s.style.opacity='0'; s.style.pointerEvents='none'; s.style.zIndex='1';
  });
  var t=document.getElementById('${sid}');
  if(t){t.classList.add('active');t.style.opacity='1';t.style.pointerEvents='all';t.style.zIndex='5';}
  var tb=document.getElementById('tabBar');
  if(tb){tb.classList.${showTab ? "remove" : "add"}('hidden');}
  // disable all animations for clean screenshot
  var style=document.createElement('style');
  style.textContent='*,*::before,*::after{animation:none!important;transition:none!important;}';
  document.head.appendChild(style);
})();
</script>
</body>`;

  const modified = html
    .replace('</body>', script)
    .replace('../logo.svg', 'logo.svg')
    .replace('logo.svg', '../logo.svg');

  fs.writeFileSync(path.join(outDir, sid + '.html'), modified);
  console.log('Generated:', sid + '.html');
}

console.log(`\nDone! ${screenIds.length} screens in ./screens/`);
