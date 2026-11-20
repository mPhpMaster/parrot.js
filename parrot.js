// parrot.js — a pixel-art macaw that flies after your cursor (inspired by oneko.js)
// Self-contained: no images, no eval, no network — works on strict-CSP pages too.
(function parrot() {
  document.getElementById("parrot-js")?.remove();

  const PHRASES = ["السلام عليكم", "امواححح", "🎶", "Peace be upon you", "Mwahhh", "🎶"];
  const SPRITES = {"perch":["........KK......","........KyK.....",".........KyK....","......KKKYyK....",".....KYYYYYYK...",".....KYYYYEYYK..",".....KYYYOOYPPK.",".....KWYYOOYKPK.",".....KWWYYYKK...","....KWWWWWWK....","....KWWwWWWK....","...KWWwwWWWK....","...KWwwwWWK.....","..KGwKPKKPK.....",".KGGK.P..P......","KGK............."],"fly1":["................","......KK........",".....KWwK.......",".....KWWwK...KK.","......KWWwK.KyK.","......KWWWKKYYYK",".......KWWKYYEYK","....KKKKWWWYOOPK","..KKWWWWWWWWYKPK","KKGGWWWWWWWWKK..","KGGWWKKKWWWK....",".KGGK...KKK.....","..KK............","................","................","................"],"fly2":["................","................","................",".............KK.","............KyK.","...........KYYYK","..........KYYEYK","....KKKKKKWYOOPK","..KKWWWWWWWWYKPK","KKGGWWWwwWWWKK..","KGGWWKWWwwKK....",".KGGK.KWwwwK....","..KK...KWwwK....",".......KWwK.....","........KK......","................"],"blink":["........KK......","........KyK.....",".........KyK....","......KKKYyK....",".....KYYYYYYK...",".....KYYYYKYYK..",".....KYYYOOYPPK.",".....KWYYOOYKPK.",".....KWWYYYKK...","....KWWWWWWK....","....KWWwWWWK....","...KWWwwWWWK....","...KWwwwWWK.....","..KGwKPKKPK.....",".KGGK.P..P......","KGK............."],"talk":["........KK......","........KyK.....",".........KyK....","......KKKYyK....",".....KYYYYYYK...",".....KYYYYEYYK..",".....KYYYOOYPPK.",".....KWYYOOYKKK.",".....KWWYYYKKPK.","....KWWWWWWK.K..","....KWWwWWWK....","...KWWwwWWWK....","...KWwwwWWK.....","..KGwKPKKPK.....",".KGGK.P..P......","KGK............."],"bob":["................",".........KK.....",".........KyK....","..........KyK...",".......KKKYyK...","......KYYYYYYK..","......KYYYYEYYK.","......KYYYOOYPPK",".....KKWYYOOYKPK","....KWWWWWWK....","....KWWwWWWK....","...KWWwwWWWK....","...KWwwwWWK.....","..KGwKPKKPK.....",".KGGK.P..P......","KGK............."],"sleep":["................",".......KK.......",".......KyK......","........KyK.....",".....KKKYyK.....","....KYYYYYYK....","....KYYYYKYYK...","....KYYYOOYPPK..","....KWYYOOYKPK..","....KWWWWWWK....","....KWWwWWWK....","...KWWwwWWWK....","...KWwwwWWK.....","..KGwKPKKPK.....",".KGGK.P..P......","KGK............."],"alert":["..........K.....",".........KyK....",".........KyK....","......KKKYyK....",".....KYYYYYYK...",".....KYYYYEYYK..",".....KYYYOOYPPK.",".....KWYYOOYKPK.",".....KWWYYYKK...","....KWWWWWWK....","....KWWwWWWK....","...KWWwwWWWK....","...KWwwwWWK.....","..KGwKPKKPK.....",".KGGK.P..P......","KGK............."]};
  const PALETTE = {"K": "#4a4030", "W": "#fbf7e8", "w": "#e8dfbf", "Y": "#fbe36a", "y": "#f0cf3a", "O": "#f5893a", "E": "#b3202a", "P": "#f2b5a5", "G": "#efe2a0"};
  const SPEED = 12;          // px per frame
  const FRAME_MS = 100;

  const root = document.createElement("div");
  root.id = "parrot-js";
  root.ariaHidden = true;
  Object.assign(root.style, {
    position: "fixed", left: "0", top: "0", width: "32px", height: "32px",
    pointerEvents: "none", zIndex: 2147483647,
  });

  const canvas = document.createElement("canvas");
  canvas.width = 16; canvas.height = 16;
  Object.assign(canvas.style, { width: "32px", height: "32px", imageRendering: "pixelated", display: "block" });
  const ctx = canvas.getContext("2d");

  const bubble = document.createElement("div");
  Object.assign(bubble.style, {
    position: "absolute", bottom: "34px", left: "50%", transform: "translateX(-50%)",
    background: "#fff", color: "#111", border: "2px solid #1b1b1f", borderRadius: "8px",
    padding: "2px 6px", font: "bold 12px/1.3 system-ui, sans-serif", whiteSpace: "nowrap",
    display: "none", boxShadow: "2px 2px 0 rgba(0,0,0,.25)",
  });

  root.append(bubble, canvas);
  document.body.appendChild(root);

  let x = 32, y = 32, mouseX = 0, mouseY = 0;
  let facing = 1;            // 1 = right, -1 = left
  let frameCount = 0, idleTime = 0, idleAnim = null, idleFrame = 0, bubbleTimer = 0;

  function draw(name) {
    const rows = SPRITES[name];
    ctx.clearRect(0, 0, 16, 16);
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const p = rows[r][c];
        if (p === ".") continue;
        ctx.fillStyle = PALETTE[p];
        ctx.fillRect(facing === 1 ? c : 15 - c, r, 1, 1);
      }
    }
  }

  function say(text, frames = 15) {
    bubble.textContent = text;
    bubble.style.display = "block";
    bubbleTimer = frames;
  }

  function place() {
    root.style.transform = `translate(${x - 16}px, ${y - 16}px)`;
  }

  function idle() {
    idleTime++;
    if (idleTime > 10 && idleAnim === null && Math.random() < 1 / 120) {
      const options = ["dance", "talk", "sleep", "blink"];
      idleAnim = options[Math.floor(Math.random() * options.length)];
      idleFrame = 0;
      if (idleAnim === "talk") say(PHRASES[Math.floor(Math.random() * PHRASES.length)], 18);
    }

    switch (idleAnim) {
      case "dance":
        draw(idleFrame % 4 < 2 ? "bob" : "perch");
        if (idleFrame % 8 === 0) facing = -facing;
        if (idleFrame > 32) idleAnim = null;
        break;
      case "talk":
        draw(idleFrame % 3 === 0 ? "talk" : "perch");
        if (idleFrame > 14) idleAnim = null;
        break;
      case "sleep":
        draw(idleFrame < 6 ? "blink" : "sleep");
        if (idleFrame >= 6 && idleFrame % 10 === 6) say(idleFrame % 20 === 6 ? "z" : "z Z", 8);
        if (idleFrame > 200) idleAnim = null;
        break;
      case "blink":
        draw(idleFrame < 2 ? "blink" : "perch");
        if (idleFrame > 3) idleAnim = null;
        break;
      default:
        draw(Math.random() < 0.03 ? "blink" : "perch");
        return;
    }
    idleFrame++;
  }

  function frame() {
    frameCount++;
    if (bubbleTimer > 0 && --bubbleTimer === 0) bubble.style.display = "none";

    const dx = x - mouseX, dy = y - mouseY;
    const dist = Math.hypot(dx, dy);
    if (dist < 48) { idle(); return; }

    if (idleAnim === "sleep") { bubble.style.display = "none"; bubbleTimer = 0; }
    idleAnim = null; idleFrame = 0;

    if (idleTime > 1) {                       // startled before taking off
      if (idleTime > 5) say("!", 4);
      draw("alert");
      idleTime = Math.min(idleTime, 7) - 1;
      return;
    }

    if (Math.abs(dx / dist) > 0.2) facing = dx < 0 ? 1 : -1;
    draw(frameCount % 2 ? "fly1" : "fly2");

    x -= (dx / dist) * SPEED;
    y -= (dy / dist) * SPEED;
    x = Math.min(Math.max(16, x), innerWidth - 16);
    y = Math.min(Math.max(16, y), innerHeight - 16);
    place();
  }

  document.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });

  let last;
  function loop(t) {
    if (!root.isConnected) return;   // remove #parrot-js to stop it
    if (last === undefined) last = t;
    if (t - last > FRAME_MS) { last = t; frame(); }
    requestAnimationFrame(loop);
  }

  draw("perch"); place();
  requestAnimationFrame(loop);
})();
