import { GAMES } from './games.js';
import { QUESTION_BANK } from './questions.js';
import { TEACHER_PIN, QUESTIONS_PER_GATE } from './config.js';
import { cleanName, countdown, duration, LessonClock, makeGameState, pickQuestions, shuffle, sourceParts, unlockedIndex, validAnswer } from './core.js';
import { ArcadeSound } from './sound.js';
import { animatePreviews } from './previews.js';

const main = document.querySelector('#main');
const sound = new ArcadeSound();
const lesson = new LessonClock();
// The whole pupil session lives here. Nothing is written to browser storage.
const session = { name:'', startedAt:null, completedAt:null, teacher:false, history:[], games:GAMES.map(makeGameState), view:'start', selected:0, activeBlank:0, timeUp:false };
const sources = new Map();
let renderVersion = 0;
let lastFocus = null;
const escapeHTML = text => String(text).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const announce = text => { document.querySelector('#announcer').textContent = text; };
const preview = (index, className='') => `<div class="preview ${className}"><canvas data-game="${index}" role="img" aria-label="${escapeHTML(GAMES[index].title)} preview: ${escapeHTML(GAMES[index].description)}"></canvas></div>`;
const completedCount = () => session.games.filter(game=>game.played).length;

function effects(big=false) {
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer=document.querySelector('#effects');
  for(let i=0;i<(big?60:20);i++){
    const particle=document.createElement('i');
    particle.className='confetti';
    particle.style.cssText=`--x:${Math.random()*100}vw;--delay:${Math.random()*.3}s;--rotation:${Math.random()*720}deg;background:${['#b5fb68','#bba0ff','#68ddf5','#ffc66b'][i%4]}`;
    layer.append(particle);
    setTimeout(()=>particle.remove(),2500);
  }
}
function focusHeading() { main.querySelector('h1')?.focus({preventScroll:true}); main.scrollIntoView({behavior:'instant',block:'start'}); }
function notice() { return session.timeUp ? '<p class="time-up" role="status">Time’s up — finish your current challenge. You can keep building and playing.</p>' : ''; }
function progress() {
  const count=completedCount();
  return `<div class="progress-block"><div><span>YOUR BUILD COLLECTION</span><strong>${count}<span> / 8 played</span></strong></div><div class="progress-track" role="progressbar" aria-label="Games built and played" aria-valuemin="0" aria-valuemax="8" aria-valuenow="${count}">${GAMES.map((_,i)=>`<span class="${session.games[i].played?'filled':''}" aria-hidden="true"></span>`).join('')}</div></div>`;
}
function card(index) {
  const game=GAMES[index], state=session.games[index];
  const locked=!session.teacher && index>unlockedIndex(session.games);
  let label=locked?'LOCKED':state.played?'BUILT & PLAYED':state.codeComplete?'READY FOR THONNY':state.gatePassed?'REPAIR THE CODE':'UP NEXT';
  if(session.teacher) label='DEMO READY';
  if(session.view==='start') label=index===0?'YOUR FIRST BUILD':'LOCKED';
  const canOpen=session.view!=='start'&&!locked;
  const buttonLabel=state.codeComplete||session.teacher?'View program':state.gatePassed?'Continue repair':'Start challenge';
  return `<article class="game-card ${locked||session.view==='start'&&index>0?'locked':''} ${state.played?'played':''} ${canOpen&&!state.played?'current':''}" style="--accent:${game.colour}">
    <div class="card-image">${preview(index)}<span class="game-number">${String(index+1).padStart(2,'0')}</span><span class="card-state">${escapeHTML(label)}</span></div>
    <div class="card-body"><span class="eyebrow">${game.genre}</span><h3>${game.title}</h3><p>${locked||session.view==='start'?game.tease:game.description}</p><div class="card-tags">${game.features.map(feature=>`<span>${feature}</span>`).join('')}</div>
    ${canOpen?`<button type="button" class="card-button" data-open="${index}">${buttonLabel}<span aria-hidden="true">${state.played?'✓':'+'}</span></button>`:`<div class="locked-label"><span aria-hidden="true">◇</span> ${index===0?'Start your session to unlock':'Complete Game '+index+' to unlock'}</div>`}</div></article>`;
}
function libraryGrid() { return `<section class="collection" aria-labelledby="collection-title"><div class="section-heading"><h2 id="collection-title">The game collection</h2><span>8 BUILDS · ONE EPIC ARCADE</span></div><div class="game-grid">${GAMES.map((_,index)=>card(index)).join('')}</div></section>`; }
function attachCards() {
  main.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>openGame(Number(button.dataset.open))));
  animatePreviews();
}
function renderStart() {
  session.view='start'; renderVersion++;
  main.innerHTML=`<section class="start-hero"><div class="start-copy"><div class="pill"><span aria-hidden="true">✦</span> THE NATIONAL 5 PYGAME CHALLENGE</div><h1 tabindex="-1">YOUR CODE.<br><span>YOUR ARCADE.</span></h1><p class="intro">Eight games to build. A few questions to crack.<br>Start small. Finish with a whole adventure.</p>
    <form id="start-form" class="start-form"><label for="first-name">What’s your first name?</label><div class="name-row"><input id="first-name" name="firstName" type="text" maxlength="30" placeholder="First name" autocomplete="off" required aria-describedby="session-warning name-feedback"><button class="button primary" type="submit">Let’s build <span aria-hidden="true">▶</span></button></div><p id="name-feedback" class="feedback" role="status"></p></form>
    <p id="session-warning" class="session-warning"><span aria-hidden="true">◷</span><span>Your progress is not saved. If you close or refresh this page, you will need to start again.</span></p></div>
    <div class="hero-preview" style="--accent:#b5fb68"><div class="hero-preview-top"><span><span class="live-dot" aria-hidden="true"></span> YOUR FIRST MISSION</span><span>01 / 08</span></div>${preview(0,'hero-canvas')}<div class="hero-preview-bottom"><div><span class="eyebrow">START WITH SOMETHING SIMPLE</span><h2>Catch the Coin</h2><p>A catcher, falling coins, and your first ten points.</p></div><span class="coin-badge" aria-hidden="true">+</span></div></div></section>
    <section class="how-it-works" aria-labelledby="how-title"><h2 id="how-title">Your route to the next game</h2><ol><li>Answer Computing Science questions.</li><li>Unlock a Pygame game.</li><li>Repair its missing code.</li><li>Copy the program into Thonny.</li><li>Save, run and play it.</li><li>Come back and confirm it works.</li><li>Unlock the next game.</li></ol></section>${libraryGrid()}`;
  main.querySelector('#start-form').addEventListener('submit',event=>{
    event.preventDefault();
    const name=cleanName(main.querySelector('#first-name').value);
    if(!name){main.querySelector('#name-feedback').textContent='Enter your first name to start.';main.querySelector('#first-name').focus();return;}
    session.name=name;session.startedAt=Date.now();sound.activate();sound.play('unlock');renderLibrary();focusHeading();
  });
  attachCards();
}
function renderLibrary() {
  renderVersion++; session.view='library';
  const index=unlockedIndex(session.games);
  main.innerHTML=`${notice()}<section class="library-header"><div><span class="eyebrow">${session.teacher?'TEACHER DEMONSTRATION':`PLAYER: ${escapeHTML(session.name)}`}</span><h1 tabindex="-1">${session.teacher?'Every game. Ready to run.':session.completedAt?'Your arcade is complete.':'Choose your next build.'}</h1><p>${session.teacher?'All programs are open. Choose a game to demonstrate in Thonny.':'Revise. Repair. Run in Thonny. Come back for the next level.'}</p></div>${progress()}</section>
    ${!session.teacher&&!session.completedAt?`<div class="next-mission"><div><span class="mission-icon" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span>Your next mission<strong>${GAMES[index].title}</strong></span></div><button class="button primary" type="button" data-open="${index}">${session.games[index].codeComplete?'Open your program':session.games[index].gatePassed?'Continue code repair':'Enter challenge'}</button></div>`:''}
    ${session.completedAt?'<button type="button" id="show-celebration" class="button secondary">View completion celebration</button>':''}${libraryGrid()}`;
  main.querySelector('#show-celebration')?.addEventListener('click',()=>{renderCompletion();focusHeading();});
  attachCards();
}
async function getSource(game) {
  if(!sources.has(game.file)){
    const response=await fetch(new URL(`games/${game.file}`,document.baseURI));
    if(!response.ok) throw new Error('The program file could not be loaded.');
    const source=await response.text();
    if(!source.includes('import pygame')) throw new Error('The program file is missing or invalid.');
    sourceParts(source,game.blanks);
    sources.set(game.file,source);
  }
  return sources.get(game.file);
}
function gameHeader(index, stage) {
  const game=GAMES[index];
  return `${notice()}<button type="button" class="back-button" id="back-library">‹ Game collection</button><section class="challenge-header" style="--accent:${game.colour}"><div><span class="eyebrow">GAME ${String(index+1).padStart(2,'0')} / 08 · ${game.genre}</span><h1 tabindex="-1">${game.title}</h1><p>${game.briefing}</p><div class="control-label">${game.controls}</div></div>${preview(index,'challenge-preview')}</section><ol class="stage-track" aria-label="Challenge stages"><li class="${stage==='knowledge'?'active':'done'}">01 <span>Knowledge check</span></li><li class="${stage==='repair'?'active':stage==='program'?'done':''}">02 <span>Repair the code</span></li><li class="${stage==='program'?'active':''}">03 <span>Run & play</span></li></ol>`;
}
function attachBack() { main.querySelector('#back-library').addEventListener('click',()=>{renderLibrary();focusHeading();});animatePreviews(); }
async function openGame(index) {
  if(!session.teacher&&index>unlockedIndex(session.games))return;
  session.selected=index;session.activeBlank=0;
  const state=session.games[index];
  if(session.teacher||state.codeComplete) await renderProgram(index);
  else if(state.gatePassed) await renderRepair(index);
  else renderKnowledge(index);
  focusHeading();
}
function renderKnowledge(index) {
  renderVersion++; session.view='knowledge';
  const state=session.games[index];
  if(!state.gate)state.gate=pickQuestions(QUESTION_BANK,session.history,QUESTIONS_PER_GATE);
  main.innerHTML=`${gameHeader(index,'knowledge')}<section class="gate-panel"><div class="panel-heading"><div><span class="eyebrow">WARM UP YOUR COMPUTING BRAIN</span><h2>Two questions. Then we build.</h2></div><span class="attempt-badge">Attempt ${Math.min(3,state.gateAttempts+1)} / 3</span></div><p class="muted">Have a go. After three tries, you’ll get the answers and can keep going.</p><form id="gate-form">${state.gate.map((q,qi)=>`<fieldset class="question"><legend><span class="question-meta">${q.topic} · ${q.style}</span><span class="question-title">${qi+1}. ${escapeHTML(q.prompt)}</span></legend><div class="answer-grid">${q.options.map((option,oi)=>`<label class="answer-option"><input type="radio" name="question-${qi}" value="${oi}" ${state.answers[qi]===String(oi)?'checked':''} required><span class="option-letter" aria-hidden="true">${'ABCD'[oi]}</span><span>${escapeHTML(option)}</span></label>`).join('')}</div></fieldset>`).join('')}<p id="gate-feedback" class="feedback" role="status"></p><div id="gate-explanations"></div><button class="button primary" id="gate-check" type="submit">Check answers</button><button type="button" id="gate-continue" class="button primary" hidden>Continue to code repair</button></form></section>`;
  attachBack();
  const form=main.querySelector('#gate-form');
  form.addEventListener('change',event=>{
    if(event.target.name?.startsWith('question-'))state.answers[event.target.name.split('-')[1]]=event.target.value;
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();sound.activate();
    const data=new FormData(form);
    const correct=state.gate.every((q,qi)=>q.options[Number(data.get(`question-${qi}`))]===q.answer);
    const feedback=main.querySelector('#gate-feedback');
    if(correct){state.gatePassed=true;feedback.textContent='Nice work — your game is unlocked. Time to repair the code.';feedback.className='feedback success';sound.play('correct');effects();}
    else{
      state.gateAttempts++;sound.play('wrong');
      if(state.gateAttempts<3){feedback.textContent='Not quite — try again.';main.querySelector('.attempt-badge').textContent=`Attempt ${state.gateAttempts+1} / 3`;return;}
      state.gatePassed=true;feedback.textContent='Three tries — here are the answers. Read them, then have a go at the code.';
      main.querySelector('#gate-explanations').innerHTML=state.gate.map(q=>`<div class="answer-explanation"><strong>${escapeHTML(q.answer)}</strong><p>${escapeHTML(q.explanation)}</p></div>`).join('');
    }
    form.querySelectorAll('input').forEach(input=>input.disabled=true);
    main.querySelector('#gate-check').hidden=true;
    const next=main.querySelector('#gate-continue');next.hidden=false;next.focus();
  });
  main.querySelector('#gate-continue').addEventListener('click',async()=>{await renderRepair(index);focusHeading();});
}
function loading(index) {
  session.view='loading';const version=++renderVersion;
  main.innerHTML=`${gameHeader(index,'repair')}<div class="gate-panel" role="status">Loading your program…</div>`;attachBack();return version;
}
function loadError(index) {
  main.innerHTML=`${gameHeader(index,'repair')}<section class="gate-panel"><h2>The program couldn’t load</h2><p>Check your connection to this site and try again. Your progress is still here. For a local preview, use the web server described in the README.</p><button class="button primary" type="button" id="retry-load">Try again</button></section>`;
  attachBack();main.querySelector('#retry-load').addEventListener('click',()=>openGame(index));
}
async function renderRepair(index) {
  const version=loading(index);
  let source;try{source=await getSource(GAMES[index]);}catch{if(version===renderVersion)loadError(index);return;}
  if(version!==renderVersion)return;
  session.view='repair';const game=GAMES[index],state=session.games[index];
  if(!state.blanks.length)state.blanks=game.blanks.map(blank=>({misses:0,solved:false,value:'',options:shuffle(blank.options)}));
  const solved=state.blanks.filter(b=>b.solved).length;
  main.innerHTML=`${gameHeader(index,'repair')}<div class="repair-intro"><div><h2>Bring the code to life.</h2><p>Fill the numbered gaps. The Pygame setup and loops are already written for you.</p></div><strong id="blank-progress">${solved} / ${game.blanks.length} repaired</strong></div><div class="repair-layout"><section class="code-window" aria-label="Python program with missing pieces"><div class="code-toolbar"><span><span class="file-dot" aria-hidden="true"></span> ${game.file}</span><span>PYTHON / PYGAME</span></div><pre id="masked-code" class="code-content" tabindex="0" aria-label="Code preview; numbered gap buttons select a repair"></pre></section><section class="repair-panel" aria-label="Code repair"><div class="blank-tabs" aria-label="Choose a missing piece">${game.blanks.map((b,bi)=>`<button type="button" data-blank="${bi}" aria-label="Missing piece ${bi+1}${state.blanks[bi].solved?', repaired':''}" class="${state.blanks[bi].solved?'solved':''}">${bi+1}</button>`).join('')}</div><div id="blank-task"></div><div id="repair-success" hidden><span class="success-symbol" aria-hidden="true">✓</span><h2>Code repaired!</h2><p>Your complete program is ready. Next stop: Thonny.</p><button type="button" class="button primary" id="reveal-code">Get the full program</button></div></section></div>`;
  attachBack();
  main.querySelectorAll('[data-blank]').forEach(button=>button.addEventListener('click',()=>selectBlank(Number(button.dataset.blank),true)));
  main.querySelector('#reveal-code').addEventListener('click',async()=>{await renderProgram(index);focusHeading();});
  renderMasked(source,index);
  selectBlank(state.blanks.findIndex(b=>!b.solved));
}
function renderMasked(source,index) {
  const game=GAMES[index],state=session.games[index];
  main.querySelector('#masked-code').innerHTML=sourceParts(source,game.blanks).map(part=>part.blank===undefined?escapeHTML(part.text):state.blanks[part.blank].solved?`<span class="fixed-code">${escapeHTML(game.blanks[part.blank].answer)}</span>`:`<button type="button" class="code-gap" data-code-blank="${part.blank}" aria-label="Repair missing piece ${part.blank+1}">[ ${part.blank+1} ]</button>`).join('');
  main.querySelectorAll('[data-code-blank]').forEach(button=>button.addEventListener('click',()=>selectBlank(Number(button.dataset.codeBlank),true)));
}
function selectBlank(bi,focus=false) {
  const index=session.selected,game=GAMES[index],state=session.games[index];
  if(bi<0)return;
  session.activeBlank=bi;const blank=game.blanks[bi],result=state.blanks[bi];
  main.querySelectorAll('[data-blank]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.blank)===bi)));
  // Keep the selected gap visible inside the code pane without scrolling the
  // whole page away from the repair controls.
  const codePane=main.querySelector('#masked-code');
  const gap=codePane.querySelector(`[data-code-blank="${bi}"]`);
  codePane.querySelectorAll('.code-gap').forEach(button=>button.classList.toggle('active-gap',button===gap));
  if(gap){
    const delta=gap.getBoundingClientRect().top-codePane.getBoundingClientRect().top;
    codePane.scrollTop+=delta-100;
  }
  const panel=main.querySelector('#blank-task');
  panel.innerHTML=`<span class="eyebrow">MISSING PIECE ${bi+1} / ${game.blanks.length}</span><h3>${escapeHTML(blank.prompt)}</h3><pre class="code-context" aria-label="Line to repair">${escapeHTML(blank.find.split('\n')[0].replace(blank.answer, `[ ${bi+1} ]`))}</pre><p class="muted">${result.solved?'This piece is repaired.':`Type the missing ${blank.answer.length<=2?'value or operator':'Python expression'}. Don’t include the rest of the line.`}</p>
    ${result.solved?`<div class="solved-answer"><span aria-hidden="true">✓</span><code>${escapeHTML(blank.answer)}</code></div><button type="button" id="next-gap" class="button secondary">Find the next gap</button>`:`<form id="blank-form"><label for="code-answer">Your code</label><input id="code-answer" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" maxlength="120" value="${escapeHTML(result.value)}" aria-describedby="code-feedback code-hint" required><button class="button primary" type="submit">Check this piece</button></form><p id="code-feedback" class="feedback" role="status">${result.misses===1?'Not quite — try again.':result.misses>=2?'Try again, or use one of the options below.':''}</p><p id="code-hint" class="hint">${result.misses>=2?`Hint: ${escapeHTML(blank.hint)}`:''}</p>${result.misses>=2?`<fieldset class="code-options"><legend>Choose a possible repair</legend>${result.options.map((option,oi)=>`<label><input type="radio" name="code-choice" value="${oi}"><code>${escapeHTML(option)}</code></label>`).join('')}<button type="button" id="check-choice" class="button secondary">Check selected option</button></fieldset>`:''}`}`;
  if(result.solved){panel.querySelector('#next-gap').addEventListener('click',()=>selectBlank(state.blanks.findIndex(b=>!b.solved),true));}
  else{
    const input=panel.querySelector('#code-answer');
    input.addEventListener('input',()=>result.value=input.value);
    panel.querySelector('#blank-form').addEventListener('submit',event=>{event.preventDefault();checkBlank(input.value);});
    panel.querySelector('#check-choice')?.addEventListener('click',()=>{
      const chosen=panel.querySelector('input[name="code-choice"]:checked');
      if(!chosen){panel.querySelector('#code-feedback').textContent='Choose an option first.';return;}
      checkBlank(result.options[Number(chosen.value)]);
    });
    if(focus)input.focus();
  }
}
function checkBlank(value) {
  const index=session.selected,bi=session.activeBlank,game=GAMES[index],state=session.games[index],result=state.blanks[bi];
  sound.activate();
  if(!validAnswer(value,game.blanks[bi])){
    result.misses++;result.value=value;sound.play('wrong');selectBlank(bi,true);
    main.querySelector('#code-feedback').textContent=result.misses===1?'Not quite — try again. Check the line around the gap.':'Not quite. Use the hint and try an option below.';
    return;
  }
  result.solved=true;result.value=game.blanks[bi].answer;sound.play('correct');
  renderMasked(sources.get(game.file),index);
  const repaired=state.blanks.filter(b=>b.solved).length;
  main.querySelector('#blank-progress').textContent=`${repaired} / ${game.blanks.length} repaired`;
  const tab=main.querySelector(`[data-blank="${bi}"]`);tab.classList.add('solved');tab.setAttribute('aria-label',`Missing piece ${bi+1}, repaired`);
  announce(`Piece ${bi+1} repaired. ${repaired} of ${game.blanks.length} complete.`);
  if(repaired===game.blanks.length){
    state.codeComplete=true;sound.play('code');effects();main.querySelector('#blank-task').hidden=true;main.querySelector('.blank-tabs').hidden=true;
    main.querySelector('#repair-success').hidden=false;main.querySelector('#reveal-code').focus();
  }else selectBlank(state.blanks.findIndex(b=>!b.solved),true);
}
async function renderProgram(index) {
  const version=loading(index);
  let source;try{source=await getSource(GAMES[index]);}catch{if(version===renderVersion)loadError(index);return;}
  if(version!==renderVersion)return;
  session.view='program';const game=GAMES[index],state=session.games[index];
  main.innerHTML=`${gameHeader(index,'program')}<section class="program-ready"><div><span class="eyebrow">${session.teacher?'TEACHER DEMONSTRATION':state.played?'BACK IN YOUR COLLECTION':'CODE COMPLETE'}</span><h2>Your game is ready for Thonny.</h2><p>This is the full program. Copy everything, then play it on your computer.</p></div><button id="copy-code" class="button primary" type="button">Copy code <span aria-hidden="true">▣</span></button></section><p id="copy-feedback" class="feedback" role="status"></p><div class="run-layout"><section class="code-window full-program" aria-label="Complete Python program"><div class="code-toolbar"><span><span class="file-dot" aria-hidden="true"></span> ${game.file}</span><span>COMPLETE PROGRAM</span></div><pre class="code-content" tabindex="0"><code id="full-code"></code></pre></section><aside class="thonny-panel"><span class="eyebrow">TAKE IT OFF THE PAGE</span><h3>Run it. Play it.<br>Make it yours.</h3><ol><li>Open Thonny.</li><li>Paste the complete code into a new file.</li><li>Save it as <code>${game.file}</code> and press Run (F5).</li><li>Play your game. Try the controls shown above.</li><li>Return to this page when it works.</li></ol><p class="small-note">Pygame must be installed in Thonny’s Python environment. Ask your teacher if <code>import pygame</code> gives an error. Don’t name your file <code>pygame.py</code>.</p>
    ${session.teacher?'<div class="teacher-note">Demonstration mode: every complete program is available.</div>':state.played?'<div class="solved-answer">✓ Built and played. Enjoy another round!</div>':`<button id="confirm-played" type="button" class="button primary">${index===7?'It works — complete the challenge':'It works — unlock the next game'}</button><p class="small-note">Your call: only click after you’ve run and played it in Thonny.</p>`}</aside></div>`;
  main.querySelector('#full-code').textContent=source;
  attachBack();
  main.querySelector('#copy-code').addEventListener('click',()=>copyCode(source));
  main.querySelector('#confirm-played')?.addEventListener('click',()=>{
    if(state.played)return;state.played=true;sound.activate();
    if(completedCount()===8){session.completedAt=Date.now();lesson.freeze(new Date());updateTimer();sound.play('complete');renderCompletion();effects(true);}
    else{sound.play('unlock');renderLibrary();effects();const next=index+1;announce(`${GAMES[next].title} unlocked.`);main.querySelector(`[data-open="${next}"]`)?.closest('.game-card')?.classList.add('just-unlocked');}
    focusHeading();
  });
}
async function copyCode(source) {
  const feedback=main.querySelector('#copy-feedback');
  try{
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(source);}
    else{
      const field=document.createElement('textarea');field.value=source;field.className='clipboard-helper';document.body.append(field);field.select();
      const copied=document.execCommand('copy');field.remove();if(!copied)throw new Error('Copy unavailable');
    }
    if(feedback?.isConnected){feedback.textContent='Copied! Open Thonny, paste into a new file, then save and run.';feedback.className='feedback success';}
  }catch{
    if(!feedback?.isConnected)return;
    const code=main.querySelector('#full-code');
    const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(code);selection.removeAllRanges();selection.addRange(range);
    feedback.textContent='Your browser blocked automatic copy. The full program is selected: press Ctrl+C (Windows) or ⌘C (Mac), then paste into Thonny.';code.parentElement.focus();
  }
}
function renderCompletion() {
  renderVersion++;session.view='completion';
  main.innerHTML=`${notice()}<section class="completion-hero"><span class="pill">ALL EIGHT. ALL YOURS.</span><div class="completion-emblem" aria-hidden="true">8<span> / 8</span></div><h1 tabindex="-1">Challenge complete,<br><span>${escapeHTML(session.name)}!</span></h1><p>You’ve unlocked every game.<br>Now enjoy the games you’ve built.</p><div class="completion-stats"><span><strong>8</strong>GAMES BUILT & PLAYED</span><span><strong>${duration(session.completedAt-session.startedAt)}</strong>YOUR BUILD TIME</span></div><p class="muted">The building challenge is finished. The playing part is just getting started.</p><button type="button" id="back-collection" class="button primary">Explore your arcade</button></section>${libraryGrid()}`;
  main.querySelector('#back-collection').addEventListener('click',()=>{renderLibrary();focusHeading();});attachCards();
}
function updateTimer() {
  const result=lesson.read(new Date());
  const display=document.querySelector('#lesson-timer');
  if(result.expired&&!session.completedAt){
    session.timeUp=true;
    if(!main.querySelector('.time-up')){const banner=document.createElement('p');banner.className='time-up';banner.setAttribute('role','status');banner.textContent='Time’s up — finish your current challenge. You can keep building and playing.';main.prepend(banner);}
    announce('Time’s up — finish your current challenge. The app stays open.');
  }
  display.textContent=result.current?`Period ${result.current.number} • ${countdown(result.current.remaining)} remaining${result.frozen?' · frozen':''}`:'Outside lesson time';
  display.classList.toggle('urgent',Boolean(result.current&&result.current.remaining<=300));
}

// Hidden entry: Alt+Shift+T, or five quick clicks on the logo.
// The PIN is never placed in normal UI. Native dialog provides a focus trap.
const dialog=document.querySelector('#teacher-dialog');
function showTeacher() { if(dialog.open)return;lastFocus=document.activeElement;document.querySelector('#teacher-feedback').textContent='';document.querySelector('#teacher-pin').value='';dialog.showModal();document.querySelector('#teacher-pin').focus(); }
document.addEventListener('keydown',event=>{if(event.altKey&&event.shiftKey&&event.key.toLowerCase()==='t'){event.preventDefault();showTeacher();}});
let logoClicks=[];
document.querySelector('#home-link').addEventListener('click',event=>{
  event.preventDefault();const now=Date.now();logoClicks=logoClicks.filter(time=>now-time<2200);logoClicks.push(now);
  if(logoClicks.length>=5){logoClicks=[];showTeacher();}
  else if(session.name||session.teacher){renderLibrary();}
});
document.querySelector('#teacher-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{if(lastFocus?.isConnected)lastFocus.focus();});
document.querySelector('#teacher-form').addEventListener('submit',event=>{
  event.preventDefault();
  if(document.querySelector('#teacher-pin').value!==TEACHER_PIN){document.querySelector('#teacher-feedback').textContent='That PIN isn’t correct. Try again.';document.querySelector('#teacher-pin').select();return;}
  session.teacher=true;dialog.close();sound.activate();renderLibrary();focusHeading();announce('Teacher mode enabled. All eight programs are open.');
});
document.querySelector('#sound-toggle').addEventListener('click',()=>{
  sound.muted=!sound.muted;document.querySelector('#sound-toggle').setAttribute('aria-pressed',String(sound.muted));document.querySelector('#sound-toggle').setAttribute('aria-label',sound.muted?'Unmute sound':'Mute sound');document.querySelector('#sound-label').textContent=sound.muted?'Sound off':'Sound on';
  if(sound.muted&&sound.context)sound.context.suspend().catch(()=>{});
  else{sound.activate();sound.play('correct');}
});
document.addEventListener('pointerdown',()=>sound.activate(),{once:true});
document.addEventListener('keydown',()=>sound.activate(),{once:true});
document.addEventListener('visibilitychange',updateTimer);
setInterval(updateTimer,1000);
renderStart();updateTimer();
