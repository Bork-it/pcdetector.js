<script>
(function() {
  let score = 0;
  let checks = 0;

  function addCheck(condition, weight) {
    checks += weight;
    if (condition) score += weight;
  }

  // Heuristic: Blocked APIs (e.g., webcam/screen capture)
  addCheck(!('mediaDevices' in navigator), 10);
  addCheck(!('getDisplayMedia' in (navigator.mediaDevices || {})), 10);

  // Heuristic: Clipboard API access
  addCheck(!navigator.clipboard, 5);

  // Heuristic: Known parental control keywords in DOM
  const keywords = ['qustodio', 'bark', 'netnanny', 'familylink', 'securly', 'goguardian'];
  const domText = document.documentElement.innerHTML.toLowerCase();
  const hits = keywords.filter(k => domText.includes(k)).length;
  addCheck(hits > 0, hits * 15);

  // Heuristic: Blocked inline scripts via CSP
  try {
    const testScript = document.createElement('script');
    testScript.innerHTML = "console.log('test')";
    document.body.appendChild(testScript);
    addCheck(false, 0); // If it works, no penalty
  } catch (e) {
    addCheck(true, 15);
  }

  // Heuristic: JS slowdown / throttling
  const t0 = performance.now();
  for (let i = 0; i < 1e6; i++) {}
  const t1 = performance.now();
  addCheck(t1 - t0 > 200, 5);

  // Calculate %
  const probability = Math.min(100, Math.round((score / checks) * 100));
  let emoji = '🟩';
  if (probability > 75) emoji = '🟥';
  else if (probability > 50) emoji = '🟧';
  else if (probability > 25) emoji = '🟨';

  // Create detector bar
  const bar = document.createElement('div');
  bar.id = 'bork-detector';
  bar.textContent = `${emoji} Parental Controls Probability: ${probability}%`;
  Object.assign(bar.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    padding: '8px',
    backgroundColor: '#111',
    color: '#fff',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    textAlign: 'center',
    zIndex: '9999'
  });

  document.body.appendChild(bar);
})();
</script>
