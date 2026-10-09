// Tiny canvas scenes use the games' original geometric graphics. They are visual
// previews, not a Python interpreter. Reduced motion shows a still frame.
export function drawPreview(canvas, gameIndex, time = 0) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const w = 480, h = 270;
  canvas.width = w;
  canvas.height = h;
  const c = context;
  const palette = ['#b5fb68','#bba0ff','#68ddf5','#71efb7','#f0a0cd','#8aacff','#ffc66b','#e2db8c'];
  c.fillStyle = ['#1a2927','#251e36','#152d3b','#16312f','#332039','#1b2445','#263848','#26382f'][gameIndex];
  c.fillRect(0,0,w,h);
  c.strokeStyle = '#ffffff0a';
  c.lineWidth=1;
  for(let x=0;x<w;x+=30){ c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke(); }
  for(let y=0;y<h;y+=30){ c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke(); }
  const rect = (x,y,width,height,colour) => { c.fillStyle=colour;c.fillRect(x,y,width,height); };
  const circle=(x,y,r,colour)=>{c.fillStyle=colour;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
  const diamond=(x,y,r,colour)=>{c.fillStyle=colour;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r,y);c.lineTo(x,y+r);c.lineTo(x-r,y);c.closePath();c.fill();};
  const accent = palette[gameIndex];
  const phase = time / 1000;
  const drift = Math.sin(phase)*24;
  c.shadowColor = accent;
  c.shadowBlur = 10;
  if(gameIndex===0){
    rect(183+drift,222,95,12,accent);
    [[120,35],[235,100],[342,52],[285,178]].forEach(([x,y],i)=>{const yy=(y+phase*32)%205;circle(x,yy,10,'#ffd366');circle(x,yy,5,'#e4a338');});
    c.shadowBlur=0;rect(0,246,w,2,'#3b6050');
  } else if(gameIndex===1){
    rect(220+drift,219,26,26,accent);
    [[96,58],[233,95],[352,35],[300,177]].forEach(([x,y])=>{rect(x,(y+phase*30)%205,26,26,'#ff888d');});
  } else if(gameIndex===2){
    rect(210+drift,225,44,18,accent);rect(227+drift,216,9,16,accent);
    [[100,72],[245,110],[360,58]].forEach(([x,y])=>{circle(x,y,18,'#ffa66e');circle(x,y,10,'#152d3b');circle(x,y,4,'#ffa66e');});
    rect(228+drift,170-(phase*70)%95,5,16,'#ffe3a5');rect(228+drift,211-(phase*70)%95,5,16,'#ffe3a5');
  } else if(gameIndex===3){
    c.shadowBlur=0;for(let y=12;y<260;y+=24)rect(238,y,3,12,'#4e6d63');
    c.shadowBlur=10;rect(40,90+drift,10,70,accent);rect(430,135-drift,10,70,'#f9d98b');circle(220+Math.sin(phase)*100,132+Math.cos(phase)*54,7,'#f8f7e8');
    c.font='24px monospace';c.fillStyle='#f8f7e8';c.fillText('02   01',182,38);
  } else if(gameIndex===4){
    for(let row=0;row<4;row++)for(let col=0;col<7;col++)if(!(row===3&&(col===3||col===4)))rect(39+col*59,39+row*25,52,16,['#f484a6','#f2a3c6','#b798ed','#88b9e7'][row]);
    rect(197+drift,237,85,9,accent);circle(252+drift,190-Math.abs(Math.sin(phase))*55,7,'#fff0d4');
    c.shadowBlur=0;c.strokeStyle='#fff0d44d';c.beginPath();c.moveTo(252+drift,190-Math.abs(Math.sin(phase))*55);c.lineTo(225+drift,214-Math.abs(Math.sin(phase))*55);c.stroke();
  } else if(gameIndex===5){
    for(let i=0;i<28;i++)circle((i*79)%480,(i*47)%270,1,'#52638c');
    for(let row=0;row<3;row++)for(let col=0;col<6;col++){rect(96+col*48+drift,45+row*32,23,17,'#ef9ad5');rect(101+col*48+drift,51+row*32,13,4,'#1b2445');}
    c.fillStyle=accent;c.beginPath();c.moveTo(240,218);c.lineTo(220,242);c.lineTo(260,242);c.closePath();c.fill();rect(238,185-(phase*60)%65,4,12,'#b9ffe7');
  } else if(gameIndex===6){
    c.shadowBlur=0;for(let i=0;i<10;i++)rect(i*56,160+(i%3)*16,40,110,'#304958');
    [[18,234,95],[136,191,95],[254,146,95],[373,100,90]].forEach(([x,y,width])=>{rect(x,y,width,10,'#709aab');rect(x,y,width,2,'#87d1d7');diamond(x+width/2,y-20,7,'#ffd266');});
    rect(170+Math.sin(phase)*10,156-Math.max(0,Math.sin(phase*2))*18,18,28,'#d5b3ff');rect(425,62,24,38,'#89f5b1');
  } else {
    c.shadowBlur=0;[[90,70,18,90],[212,155,110,18],[350,45,18,120],[180,210,18,60]].forEach(v=>rect(...v,'#5a7e69'));
    [[54,210],[154,98],[273,55],[407,130],[290,225],[428,218]].forEach(([x,y])=>diamond(x,y,8,'#ffd276'));
    rect(160+drift,185,22,22,'#ed8b82');rect(300-drift,94,22,22,'#ed8b82');rect(43+Math.sin(phase)*8,58,22,22,'#8fdded');
    c.strokeStyle=accent;c.lineWidth=4;c.strokeRect(418,28,32,32);
  }
  c.shadowBlur=0;
  const vignette=c.createLinearGradient(0,150,0,h);vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#0004');c.fillStyle=vignette;c.fillRect(0,0,w,h);
}

let animation = null;
export function animatePreviews() {
  if(animation) cancelAnimationFrame(animation);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvases=[...document.querySelectorAll('canvas[data-game]')];
  canvases.forEach(c=>drawPreview(c,Number(c.dataset.game),0));
  if(reduced || !canvases.length) return;
  let last=0;
  const tick=time=>{
    if(!document.hidden && time-last>80){canvases.forEach(c=>{if(c.isConnected)drawPreview(c,Number(c.dataset.game),time);});last=time;}
    animation=requestAnimationFrame(tick);
  };
  animation=requestAnimationFrame(tick);
}
