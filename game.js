/* ===================================================================
   KINGDOM OF SHADOWS: BREAK THE CURSE - v3.0 Masterpiece Edition
   Spec-Driven (GSD), Iteratively Built (Ralph Loop), CodeRabbit Audited
   Features:
   - Procedural Dynamic Synth BGM (Zero external assets, 100% offline)
   - Hit-Stop Combat Juice (Hollow Knight style impact freeze)
   - Floating Combat Numbers (-15, CRIT! -70, +35 HP, BLOCKED!)
   - Breakable Treasure Chests & Health Potions
   - New Enemy Archetypes: Shadow Ranger (Archer) & Cursed Vanguard (Shield Knight)
   - Celestial Upgrade Shrine (RPG Relic Progression with Soul Gems)
   - Dual-Layer Health Bar Animations & Level Progress Tracker
   - Draggable Controls (BGMI/Free Fire style) + Active Powers
=================================================================== */

// ============================================================
// SOUND CONTROLLER & PROCEDURAL MUSIC ENGINE
// ============================================================
class SoundController {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.musicTimer = null;
    this.musicStep = 0;
    this.currentTrack = 1;
    this.musicGain = null;
  }

  init() {
    if (!this.ctx) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (A) {
        this.ctx = new A();
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  playTone(freq, type = 'sine', dur = 0.15, gainVal = 0.2, bend = 0) {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (bend) o.frequency.exponentialRampToValueAtTime(Math.max(10, freq + bend), this.ctx.currentTime + dur);
      g.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  }

  jump()          { this.init(); this.playTone(280,'square',0.12,0.18,220); setTimeout(()=>this.playTone(420,'sine',0.1,0.1,80),60); }
  slash()         { this.init(); this.playTone(480,'sawtooth',0.12,0.2,-320); }
  dash()          { this.init(); this.playTone(320,'sine',0.16,0.25,450); setTimeout(()=>this.playTone(620,'triangle',0.12,0.18,-220),50); }
  blast()         { this.init(); this.playTone(550,'sawtooth',0.15,0.25,-260); setTimeout(()=>this.playTone(180,'square',0.2,0.2,-80),55); }
  blastExplode()  { this.init(); this.playTone(130,'square',0.24,0.35,-70); setTimeout(()=>this.playTone(75,'sawtooth',0.32,0.3,-40),50); }
  shieldActivate(){ this.init(); [523,659,784,1046].forEach((n,i)=>setTimeout(()=>this.playTone(n,'sine',0.28,0.2),i*50)); }
  shieldBlocked() { this.init(); this.playTone(880,'triangle',0.14,0.3,220); setTimeout(()=>this.playTone(1200,'sine',0.12,0.25,-300),40); }
  enemyHit()      { this.init(); this.playTone(150,'sawtooth',0.15,0.25,-90); }
  enemyDie()      { this.init(); [200,160,120,80].forEach((n,i)=>setTimeout(()=>this.playTone(n,'sawtooth',0.1,0.2,-20),i*40)); }
  playerHurt()    { this.init(); this.playTone(120,'triangle',0.25,0.3,-50); }
  spikeHit()      { this.init(); this.playTone(100,'square',0.05,0.4,30); setTimeout(()=>this.playTone(70,'sawtooth',0.15,0.35,-20),50); }
  footstep()      { this.init(); this.playTone(55+Math.random()*15,'triangle',0.04,0.07,0); }
  crumble()       { this.init(); for(let i=0;i<4;i++) setTimeout(()=>this.playTone(70+Math.random()*50,'sawtooth',0.1,0.12,-30),i*70); }
  gemCollect()    { this.init(); [523,659,784,1047].forEach((n,i)=>setTimeout(()=>this.playTone(n,'sine',0.12,0.18),i*45)); }
  checkpoint()    { this.init(); [392,494,587].forEach((n,i)=>setTimeout(()=>this.playTone(n,'triangle',0.25,0.2),i*100)); }
  bossTeleport()  { this.init(); this.playTone(350,'sawtooth',0.25,0.25,-250); setTimeout(()=>this.playTone(700,'square',0.2,0.2,100),180); }
  comboHit(c)     { this.init(); this.playTone(Math.min(250+c*40,700),'sine',0.07,0.18,30); }
  cureVillager()  { this.init(); [440,554,659,880].forEach((n,i)=>setTimeout(()=>this.playTone(n,'triangle',0.35,0.22),i*90)); }
  altarIgnite()   { this.init(); [330,415,493,659].forEach((n,i)=>setTimeout(()=>this.playTone(n,'sine',0.4,0.25),i*80)); }
  bossRoar()      { this.init(); this.playTone(90,'sawtooth',0.6,0.35,-40); }
  victory()       { this.init(); [523.25,659.25,783.99,1046.5,1318.5].forEach((n,i)=>setTimeout(()=>this.playTone(n,'triangle',0.5,0.3),i*100)); }
  defeat()        { this.init(); [440,392,349,293,220].forEach((n,i)=>setTimeout(()=>this.playTone(n,'sawtooth',0.4,0.25),i*140)); }

  // New audio for additions
  chestHit()      { this.init(); this.playTone(200,'triangle',0.08,0.25,-50); }
  chestBreak()    { this.init(); [160,120,90,320,480].forEach((n,i)=>setTimeout(()=>this.playTone(n,'square',0.1,0.22,-30),i*50)); }
  heal()          { this.init(); [392,523,659,784].forEach((n,i)=>setTimeout(()=>this.playTone(n,'sine',0.22,0.22),i*60)); }
  upgrade()       { this.init(); [440,554,659,880,1108].forEach((n,i)=>setTimeout(()=>this.playTone(n,'triangle',0.3,0.25),i*80)); }
  archerShoot()   { this.init(); this.playTone(600,'triangle',0.12,0.2,-350); }
  shieldKnightBlock(){ this.init(); this.playTone(320,'square',0.1,0.35,-180); setTimeout(()=>this.playTone(850,'sine',0.14,0.2,-400),40); }

  // --- Procedural BGM Synthesizer ---
  startMusic(track = 1) {
    this.init();
    this.currentTrack = track;
    this.stopMusic();
    if (!this.musicEnabled || !this.ctx) return;

    this.musicStep = 0;
    const tempoInterval = track === 3 ? 140 : 165; // Faster for boss
    this.musicTimer = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;
      this._playMusicBeat();
      this.musicStep = (this.musicStep + 1) % 32;
    }, tempoInterval);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  _playMusicBeat() {
    if (!this.musicEnabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this.musicStep;

    try {
      if (this.currentTrack === 1) {
        // Level 1: Cursed Forest Melody (E Minor / Mystic)
        const bassNotes = [82.4, 82.4, 110.0, 98.0]; // E2, E2, A2, G2
        if (s % 8 === 0) {
          this._synthNote(bassNotes[Math.floor(s / 8)], 'triangle', 0.45, 0.08);
        }
        const melody = [329.6, 392.0, 493.8, 587.3, 493.8, 392.0, 440.0, 329.6];
        if (s % 2 === 0) {
          const note = melody[(s / 2) % melody.length];
          this._synthNote(note, 'sine', 0.22, 0.04);
        }
      } else if (this.currentTrack === 2) {
        // Level 2: Dark Catacombs (D Minor Pulse + Eerie Echo)
        const bass = [73.4, 73.4, 87.3, 65.4]; // D2, D2, F2, C2
        if (s % 4 === 0) {
          this._synthNote(bass[Math.floor(s / 8) % bass.length], 'sawtooth', 0.35, 0.07, -15);
        }
        const arps = [293.6, 349.2, 440.0, 523.2, 440.0, 349.2];
        if (s % 2 === 0) {
          this._synthNote(arps[s % arps.length], 'triangle', 0.18, 0.035);
        }
      } else {
        // Level 3: Gothic Clash with Malakor (Driving Combat Rhythm)
        const bossBass = [65.4, 65.4, 77.7, 58.2]; // C2, C2, Eb2, Bb1
        if (s % 2 === 0) {
          this._synthNote(bossBass[Math.floor(s / 8)], 'sawtooth', 0.25, 0.09, -20);
        }
        const lead = [523.2, 622.2, 783.9, 622.2, 587.3, 523.2, 698.4, 783.9];
        const lNote = lead[s % lead.length];
        this._synthNote(lNote, 'square', 0.15, 0.04);
      }
    } catch(e) {}
  }

  _synthNote(freq, type = 'sine', dur = 0.2, vol = 0.05, bend = 0) {
    if (!this.musicEnabled || !this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (bend) osc.frequency.linearRampToValueAtTime(Math.max(20, freq + bend), this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  }
}
const sounds = new SoundController();

// ============================================================
// DRAGGABLE CONTROLS (BGMI / Free Fire style)
// ============================================================
class DraggableControls {
  constructor() { this.storageKey = 'kos_ctrl_v3'; this.ox = 0; this.oy = 0; }

  getDefaults(cW, cH) {
    return {
      'btn-touch-left':     { left: 16,        top: cH - 82 },
      'btn-touch-right':    { left: 82,        top: cH - 82 },
      'btn-touch-dash':     { left: 148,       top: cH - 82 },
      'btn-touch-blast':    { left: cW - 200,  top: cH - 142 },
      'btn-touch-shield':   { left: cW - 130,  top: cH - 142 },
      'btn-touch-interact': { left: cW - 270,  top: cH - 72 },
      'btn-touch-jump':     { left: cW - 135,  top: cH - 82 },
      'btn-touch-attack':   { left: cW - 68,   top: cH - 74 },
    };
  }

  init() {
    const layer = document.getElementById('touch-controls');
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:25;';
    this.applyLayout();
    document.querySelectorAll('.t-btn').forEach(btn => {
      btn.style.pointerEvents = 'auto';
      this._setupDrag(btn);
    });
  }

  applyLayout() {
    const c = document.getElementById('game-container');
    const cW = c.offsetWidth || 960, cH = c.offsetHeight || 540;
    const defs = this.getDefaults(cW, cH);
    let saved = null;
    try { const r = localStorage.getItem(this.storageKey); if(r) saved = JSON.parse(r); } catch(e) {}
    document.querySelectorAll('.t-btn').forEach(btn => {
      btn.style.position = 'absolute'; btn.style.right = ''; btn.style.bottom = '';
      const pos = (saved && saved[btn.id]) ? saved[btn.id] : defs[btn.id];
      if (pos) { btn.style.left = pos.left + 'px'; btn.style.top = pos.top + 'px'; }
    });
  }

  _setupDrag(btn) {
    let timer = null, dragging = false, moved = false;
    const down = (e) => {
      moved = false;
      timer = setTimeout(() => {
        dragging = true; moved = false;
        try { btn.setPointerCapture(e.pointerId); } catch(_) {}
        btn.classList.add('dragging');
        const r = btn.getBoundingClientRect();
        this.ox = e.clientX - r.left; this.oy = e.clientY - r.top;
        this._hint('✋ Drag to reposition • Release to place');
      }, 420);
    };
    const move = (e) => {
      if (!dragging) return; moved = true;
      const cr = document.getElementById('game-container').getBoundingClientRect();
      const bW = btn.offsetWidth, bH = btn.offsetHeight;
      const x = Math.max(0, Math.min(cr.width - bW, e.clientX - cr.left - this.ox));
      const y = Math.max(0, Math.min(cr.height - bH, e.clientY - cr.top - this.oy));
      btn.style.left = x + 'px'; btn.style.top = y + 'px';
      e.preventDefault();
    };
    const up = (e) => {
      clearTimeout(timer);
      if (dragging) {
        dragging = false; btn.classList.remove('dragging'); this._hintHide();
        if (moved) { this._save(); e.stopImmediatePropagation(); }
      }
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointermove', move, { passive: false });
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
  }

  _save() {
    const l = {};
    document.querySelectorAll('.t-btn').forEach(b => { l[b.id] = { left: parseFloat(b.style.left)||0, top: parseFloat(b.style.top)||0 }; });
    try { localStorage.setItem(this.storageKey, JSON.stringify(l)); } catch(e) {}
  }

  reset() {
    try { localStorage.removeItem(this.storageKey); } catch(e) {}
    this.applyLayout();
    this._hint('✅ Controls reset to default!');
    setTimeout(() => this._hintHide(), 2200);
  }

  _hint(txt) {
    let el = document.getElementById('drag-hint');
    if (!el) { el = document.createElement('div'); el.id = 'drag-hint'; document.getElementById('game-container').appendChild(el); }
    el.textContent = txt; el.classList.remove('hidden');
  }
  _hintHide() { const el = document.getElementById('drag-hint'); if (el) el.classList.add('hidden'); }
}

// ============================================================
// FLOATING COMBAT TEXT (-15, CRIT! -70, +35 HP, BLOCKED!)
// ============================================================
class FloatingText {
  constructor(x, y, text, color = '#fbbf24', size = 15) {
    this.x = x + (Math.random() - 0.5) * 16;
    this.y = y - 8;
    this.text = text;
    this.color = color;
    this.size = size;
    this.life = 45;
    this.maxLife = 45;
    this.vy = -1.6;
  }
  update() {
    this.y += this.vy;
    this.vy *= 0.94;
    this.life--;
  }
  draw(ctx) {
    if (this.life <= 0) return;
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${this.size}px Outfit, sans-serif`;
    ctx.fillStyle = this.color;
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// ============================================================
// PARTICLE
// ============================================================
class Particle {
  constructor(x,y,vx,vy,color,size,life,type='glow') {
    this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.color=color;this.size=size;this.maxLife=life;this.life=life;this.type=type;
  }
  update() {
    this.x+=this.vx; this.y+=this.vy;
    if(this.type==='confetti'){this.vy+=0.08;this.vx*=0.98;}
    else if(this.type==='smoke'){this.vy-=0.03;this.size+=0.1;}
    else{this.vx*=0.95;this.vy*=0.95;}
    this.life--;
  }
  draw(ctx) {
    const a=Math.max(0,this.life/this.maxLife);
    ctx.save();ctx.globalAlpha=a;ctx.fillStyle=this.color;
    ctx.beginPath();ctx.arc(this.x,this.y,Math.max(0.1,this.size),0,Math.PI*2);ctx.fill();ctx.restore();
  }
}

// ============================================================
// SPIKE HAZARD
// ============================================================
class SpikeHazard {
  constructor(x,y,count=4) { this.x=x;this.y=y;this.count=count;this.w=count*16;this.h=16; }
  update(player) {
    if(player.x<this.x+this.w&&player.x+player.width>this.x&&player.y+player.height>this.y&&player.y<this.y+this.h)
      player.takeDamage(30,'spike');
  }
  draw(ctx) {
    ctx.save();
    for(let i=0;i<this.count;i++){
      const sx=this.x+i*16;
      ctx.fillStyle='#64748b';
      ctx.beginPath();ctx.moveTo(sx+2,this.y+this.h);ctx.lineTo(sx+8,this.y);ctx.lineTo(sx+14,this.y+this.h);ctx.closePath();ctx.fill();
      ctx.fillStyle='#94a3b8';
      ctx.beginPath();ctx.moveTo(sx+6,this.y+8);ctx.lineTo(sx+8,this.y+2);ctx.lineTo(sx+10,this.y+8);ctx.closePath();ctx.fill();
    }
    ctx.restore();
  }
}

// ============================================================
// GEM COLLECTIBLE
// ============================================================
class GemCollectible {
  constructor(x,y,value=100) { this.x=x;this.y=y;this.r=8;this.value=value;this.collected=false;this.bob=Math.random()*Math.PI*2; }
  update(player) {
    if(this.collected)return;
    const by=this.y+Math.sin(Date.now()*0.005+this.bob)*4;
    if(Math.hypot(this.x-(player.x+player.width/2),by-(player.y+player.height/2))<22){
      this.collected=true;
      game.gems += this.value;
      game.score += this.value;
      sounds.gemCollect();
      game.spawnFloatingText(this.x, by, `+${this.value} 💎`, '#67e8f9', 14);
      game.spawnSparks(this.x,this.y,'#fbbf24',14);
      game.updateHUD();
    }
  }
  draw(ctx) {
    if(this.collected)return;
    const by=this.y+Math.sin(Date.now()*0.005+this.bob)*4;
    ctx.save(); ctx.translate(this.x,by);
    ctx.fillStyle='#fbbf24'; ctx.shadowColor='#f59e0b'; ctx.shadowBlur=14;
    ctx.beginPath();ctx.moveTo(0,-this.r);ctx.lineTo(this.r*0.7,0);ctx.lineTo(0,this.r);ctx.lineTo(-this.r*0.7,0);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.beginPath();ctx.moveTo(-2,-this.r+2);ctx.lineTo(2,-this.r*0.3);ctx.lineTo(-3,-this.r*0.3);ctx.closePath();ctx.fill();
    ctx.restore();
  }
}

// ============================================================
// HEALTH POTION (💖 +35 HP Restore)
// ============================================================
class HealthPotion {
  constructor(x,y){
    this.x=x;this.y=y;this.collected=false;this.bob=Math.random()*Math.PI*2;
  }
  update(player){
    if(this.collected)return;
    const by=this.y+Math.sin(Date.now()*0.006+this.bob)*4;
    if(Math.hypot(this.x-(player.x+player.width/2),by-(player.y+player.height/2))<26){
      this.collected=true;
      const healed=Math.min(35,player.maxHealth-player.health);
      player.health=Math.min(player.maxHealth,player.health+35);
      sounds.heal();
      game.spawnFloatingText(this.x,by-8,`+${Math.ceil(healed)} HP 💖`,'#34d399',16);
      game.spawnSparks(this.x,this.y,'#34d399',18);
      game.updateHUD();
    }
  }
  draw(ctx){
    if(this.collected)return;
    const by=this.y+Math.sin(Date.now()*0.006+this.bob)*4;
    ctx.save();
    ctx.translate(this.x,by);
    ctx.font='18px Outfit';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.shadowColor='#34d399';
    ctx.shadowBlur=12;
    ctx.fillText('💖',0,0);
    ctx.restore();
  }
}

// ============================================================
// BREAKABLE TREASURE CHEST
// ============================================================
class TreasureChest {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 32;
    this.h = 24;
    this.hp = 2;
    this.opened = false;
    this.hitFlash = 0;
  }
  update(player) {
    if (this.opened) return;
    if (this.hitFlash > 0) this.hitFlash--;

    // Hit by blade attack
    if (player.isAttacking && player.attackTimer > 0) {
      const a = player.attackBox;
      if (a.x < this.x + this.w && a.x + a.width > this.x && a.y < this.y + this.h && a.y + a.height > this.y) {
        this.hit(game.getBladeDamage());
        player.isAttacking = false;
      }
    }
  }
  hit(dmg = 1) {
    if (this.opened) return;
    this.hp -= dmg;
    this.hitFlash = 8;
    sounds.chestHit();
    game.spawnSparks(this.x + this.w / 2, this.y + this.h / 2, '#fbbf24', 8);
    game.hitStop(2);
    if (this.hp <= 0) {
      this.opened = true;
      sounds.chestBreak();
      game.spawnFloatingText(this.x + this.w / 2, this.y, 'TREASURE! 💎', '#fbbf24', 16);
      game.spawnSparks(this.x + this.w / 2, this.y + this.h / 2, '#d97706', 22, 'smoke');
      // Drop gems
      for (let i = 0; i < 3; i++) {
        game.gems_items.push(new GemCollectible(this.x + (i - 1) * 18, this.y - 12 - i * 6, 120));
      }
      // Potion drop
      game.potions.push(new HealthPotion(this.x + this.w / 2, this.y - 14));
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.opened) {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 8, this.w, this.h - 8);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 8, 4, this.h - 8);
      ctx.fillRect(this.w - 4, 8, 4, this.h - 8);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -4, this.w + 4, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.fillRect(4, 8, this.w - 8, 4);
    } else {
      if (this.hitFlash > 0) ctx.fillStyle = '#ffffff';
      else ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, 4, this.h);
      ctx.fillRect(this.w - 4, 0, 4, this.h);
      ctx.fillRect(0, this.h / 2 - 2, this.w, 4);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(this.w / 2 - 3, this.h / 2 - 4, 6, 8);
    }
    ctx.restore();
  }
}

// ============================================================
// CHECKPOINT
// ============================================================
class Checkpoint {
  constructor(x,y){this.x=x;this.y=y;this.w=20;this.h=54;this.activated=false;}
  update(player){
    if(this.activated)return;
    if(Math.hypot((this.x+this.w/2)-(player.x+player.width/2),(this.y+this.h/2)-(player.y+player.height/2))<55){
      this.activated=true;
      game.lastCpX=this.x; game.lastCpY=this.y-player.height-5;
      sounds.checkpoint(); game.spawnSparks(this.x+this.w/2,this.y,'#34d399',20);
      game.spawnFloatingText(this.x + this.w/2, this.y, 'CHECKPOINT SAVED! 🚩', '#34d399', 14);
      game.showBanner('CHECKPOINT ACTIVATED!','Progress saved — respawn here if you fall');
    }
  }
  draw(ctx){
    ctx.save(); ctx.translate(this.x+this.w/2,this.y);
    ctx.fillStyle='#475569'; ctx.fillRect(-3,0,6,this.h);
    const wave=this.activated?Math.sin(Date.now()*0.01)*3:0;
    ctx.fillStyle=this.activated?'#34d399':'#94a3b8';
    ctx.shadowColor=this.activated?'#34d399':'transparent'; ctx.shadowBlur=this.activated?12:0;
    ctx.beginPath();ctx.moveTo(3,2);ctx.lineTo(22+wave,9);ctx.lineTo(3,18);ctx.closePath();ctx.fill();
    if(this.activated){ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.fillText('✓',8,14);}
    ctx.restore();
  }
}

// ============================================================
// STALACTITE (Level 2 ceiling hazard)
// ============================================================
class Stalactite {
  constructor(x,cy){this.x=x;this.startY=cy;this.y=cy;this.w=14;this.h=30;this.state='hanging';this.shakeTimer=0;this.shakeX=0;this.vy=0;this.dead=false;}
  update(player){
    if(this.dead)return;
    if(this.state==='hanging'){
      if(Math.abs((this.x+this.w/2)-(player.x+player.width/2))<130&&player.y<this.y+200){
        this.state='shaking';this.shakeTimer=60;
      }
    } else if(this.state==='shaking'){
      this.shakeTimer--;this.shakeX=Math.sin(this.shakeTimer*0.5)*2;
      if(this.shakeTimer<=0){this.state='falling';this.vy=1;}
    } else if(this.state==='falling'){
      this.vy+=0.4;this.y+=this.vy;
      if(player.x<this.x+this.w&&player.x+player.width>this.x&&player.y<this.y+this.h&&player.y+player.height>this.y){
        player.takeDamage(20);this.dead=true;game.spawnSparks(this.x+this.w/2,this.y,'#94a3b8',8);
      }
      if(this.y>510){this.dead=true;game.spawnSparks(this.x+this.w/2,this.y,'#94a3b8',6);game.shakeScreen(3);}
    }
  }
  draw(ctx){
    if(this.dead)return;
    const dx=this.x+(this.state==='shaking'?this.shakeX:0);
    ctx.save();
    ctx.fillStyle='#334155';ctx.shadowColor=this.state==='shaking'?'#ef4444':'transparent';ctx.shadowBlur=this.state==='shaking'?8:0;
    ctx.beginPath();ctx.moveTo(dx,this.startY);ctx.lineTo(dx+this.w,this.startY);ctx.lineTo(dx+this.w/2,this.y+this.h);ctx.closePath();ctx.fill();
    ctx.fillStyle='#475569';
    ctx.beginPath();ctx.moveTo(dx+3,this.startY);ctx.lineTo(dx+6,this.startY);ctx.lineTo(dx+this.w/2,this.y+this.h-8);ctx.closePath();ctx.fill();
    ctx.restore();
  }
}

// ============================================================
// PLAYER BLAST (Solar Catalyst Projectile)
// ============================================================
class PlayerBlast {
  constructor(x, y, dir) {
    this.x = x; this.y = y; this.dir = dir;
    this.vx = dir * 9.5;
    this.r = 14; this.life = 95; this.exploded = false;
  }
  update(enemies, boss, platforms) {
    if (this.exploded) return;
    this.x += this.vx;
    this.life--;
    game.spawnSparks(this.x, this.y, '#f59e0b', 2);
    if (Math.random() < 0.4) game.spawnSparks(this.x, this.y, '#fbbf24', 1, 'smoke');

    // Platform collisions
    for (const p of platforms) {
      if (p.w <= 0) continue;
      if (this.x > p.x && this.x < p.x + p.w && this.y > p.y && this.y < p.y + p.h) {
        this.explode(enemies, boss);
        return;
      }
    }
    // Chest collisions
    for (const c of game.chests) {
      if (!c.opened && this.x > c.x && this.x < c.x + c.w && this.y > c.y && this.y < c.y + c.h) {
        c.hit(3);
        this.explode(enemies, boss);
        return;
      }
    }
    // Enemy collisions
    for (const e of enemies) {
      if (!e.dead && this.x > e.x && this.x < e.x + e.w && this.y > e.y && this.y < e.y + e.h) {
        this.explode(enemies, boss);
        return;
      }
    }
    // Boss collisions
    if (boss && !boss.cleansed && this.x > boss.x && this.x < boss.x + boss.w && this.y > boss.y && this.y < boss.y + boss.h) {
      this.explode(enemies, boss);
      return;
    }
    if (this.life <= 0) this.explode(enemies, boss);
  }
  explode(enemies, boss) {
    if (this.exploded) return;
    this.exploded = true;
    sounds.blastExplode();
    game.shakeScreen(6);
    game.hitStop(3);
    game.spawnSparks(this.x, this.y, '#f59e0b', 26);
    game.spawnSparks(this.x, this.y, '#38bdf8', 14);

    const radius = game.getBlastRadius();
    const blastDmg = game.getBlastDamage();

    // Damage enemies in AoE
    for (const e of enemies) {
      if (!e.dead) {
        const d = Math.hypot((e.x + e.w/2) - this.x, (e.y + e.h/2) - this.y);
        if (d <= radius) {
          e.hp -= blastDmg;
          e.hitFlash = 12;
          sounds.enemyHit();
          game.spawnFloatingText(e.x + e.w / 2, e.y, `BLAST! -${blastDmg}`, '#f59e0b', 16);
          game.player.registerHit();
          game.spawnSparks(e.x + e.w/2, e.y + e.h/2, '#fbbf24', 12);
          if (e.hp <= 0) {
            e.dead = true;
            game.score += 150;
            sounds.enemyDie();
            game.spawnSparks(e.x + e.w/2, e.y + e.h/2, '#a855f7', 18);
            game.gems_items.push(new GemCollectible(e.x + e.w/2, e.y, 80));
            game.updateHUD();
          }
        }
      }
    }

    // Damage chests in AoE
    for (const c of game.chests) {
      if (!c.opened) {
        const cd = Math.hypot((c.x + c.w/2) - this.x, (c.y + c.h/2) - this.y);
        if (cd <= radius) c.hit(3);
      }
    }

    // Damage boss in AoE
    if (boss && !boss.cleansed) {
      const bd = Math.hypot((boss.x + boss.w/2) - this.x, (boss.y + boss.h/2) - this.y);
      if (bd <= radius + 30) {
        if (boss.shieldActive) {
          game.showBanner('BARRIER BLOCKS BLAST!', 'Collect holy orbs first!');
          sounds.enemyHit();
        } else {
          const bossDmg = game.getBlastBossDamage();
          boss.hp -= bossDmg;
          boss.hitFlash = 14;
          sounds.enemyHit();
          game.shakeScreen(7);
          game.spawnFloatingText(boss.x + boss.w/2, boss.y - 15, `CRIT! -${bossDmg}`, '#fbbf24', 20);
          game.spawnSparks(boss.x + boss.w/2, boss.y + boss.h/2, '#fbbf24', 24);
          game.player.registerHit();
          if (boss.hp <= 0) {
            boss.hp = 0;
            boss._cleanse();
          }
        }
        game.updateBossHUD(boss.hp, boss.maxHp);
      }
    }
  }
  draw(ctx) {
    if (this.exploded) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, this.r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-this.dir * 6, 0, this.r * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ============================================================
// ENEMY ARROW PROJECTILE (Shot by Shadow Ranger)
// ============================================================
class EnemyArrow {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * 5.5;
    this.vy = Math.sin(angle) * 5.5;
    this.angle = angle;
    this.life = 120;
    this.reflected = false;
  }
  update(player) {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;

    // Deflect by Divine Shield
    if (player.shieldActive && !this.reflected) {
      if (Math.hypot(this.x - (player.x + player.width / 2), this.y - (player.y + player.height / 2)) < 52) {
        this.reflected = true;
        this.vx = -this.vx * 1.5;
        this.vy = -this.vy * 1.5;
        this.angle += Math.PI;
        this.life = 100;
        sounds.shieldBlocked();
        game.spawnFloatingText(player.x + player.width / 2, player.y - 12, 'DEFLECTED! 🛡️', '#38bdf8', 14);
        game.spawnSparks(this.x, this.y, '#fbbf24', 14);
        return;
      }
    }

    if (this.reflected) {
      for (const e of game.enemies) {
        if (!e.dead && this.x > e.x && this.x < e.x + e.w && this.y > e.y && this.y < e.y + e.h) {
          e.hp -= 3;
          e.hitFlash = 10;
          sounds.enemyHit();
          game.spawnFloatingText(e.x + e.w / 2, e.y, 'DEFLECT! -3', '#fbbf24', 15);
          player.registerHit();
          this.life = 0;
          if (e.hp <= 0) {
            e.dead = true;
            game.score += 150;
            sounds.enemyDie();
            game.updateHUD();
          }
          break;
        }
      }
    } else {
      if (this.x > player.x && this.x < player.x + player.width && this.y > player.y && this.y < player.y + player.height) {
        player.takeDamage(16);
        this.life = 0;
      }
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.reflected ? '#fbbf24' : '#c084fc';
    ctx.shadowColor = this.reflected ? '#f59e0b' : '#a855f7';
    ctx.shadowBlur = 8;
    ctx.fillRect(-10, -2, 20, 4);
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(6, -4);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// ============================================================
// PLAYER (Upgraded: RPG Progression, Dash, Blast, Sphere)
// ============================================================
class Player {
  constructor(x,y){
    this.startX=x;this.startY=y;this.x=x;this.y=y;
    this.width=28;this.height=46;this.vx=0;this.vy=0;
    this.speed=5.1;this.jumpForce=-12.4;
    this.isGrounded=false;this.wasGrounded=false;this.canDoubleJump=true;this.coyoteTimer=0;
    this.facing=1;this.health=100;this.maxHealth=100;
    this.isAttacking=false;this.attackTimer=0;this.attackCooldown=0;
    this.attackBox={x:0,y:0,width:44,height:46};
    this.invulnerableTimer=0;this.runCycle=0;this.footstepTimer=0;
    this.combo=0;this.comboTimer=0;this.comboTimeout=180;

    // Powers
    this.dashCooldown=0; this.dashMaxCd=110; this.dashTimer=0; this.isDashing=false;
    this.blastCooldown=0; this.blastMaxCd=140;
    this.shieldCooldown=0; this.shieldMaxCd=420; this.shieldTimer=0; this.shieldActive=false;
    this.shieldRadius=48;
  }

  applyUpgrades() {
    this.maxHealth = game.getPlayerMaxHP();
    this.speed = game.getPlayerSpeed();
    this.dashMaxCd = game.getDashMaxCd();
  }

  reset(x,y){
    this.applyUpgrades();
    this.x=x;this.y=y;this.vx=0;this.vy=0;this.health=this.maxHealth;
    this.isAttacking=false;this.invulnerableTimer=0;this.canDoubleJump=true;
    this.combo=0;this.comboTimer=0;
    this.dashCooldown=0;this.dashTimer=0;this.isDashing=false;
    this.blastCooldown=0;
    this.shieldCooldown=0;this.shieldTimer=0;this.shieldActive=false;
  }
  jump(){
    if(this.isGrounded||this.coyoteTimer>0){
      this.vy=this.jumpForce;this.isGrounded=false;this.coyoteTimer=0;this.canDoubleJump=true;
      sounds.jump();game.spawnSparks(this.x+this.width/2,this.y+this.height,'#38bdf8',8);
    } else if(this.canDoubleJump){
      this.vy=this.jumpForce*0.88;this.canDoubleJump=false;
      sounds.jump();game.spawnSparks(this.x+this.width/2,this.y+this.height,'#f59e0b',10);
    }
  }
  attack(){
    if(this.attackCooldown<=0){
      this.isAttacking=true;this.attackTimer=14;this.attackCooldown=20;
      sounds.slash();
      const sx=this.facing===1?this.x+this.width+10:this.x-10;
      game.spawnSparks(sx,this.y+this.height/2,'#38bdf8',8);
    }
  }
  dash(){
    if(this.dashCooldown<=0){
      this.dashCooldown=this.dashMaxCd;
      this.dashTimer=14;
      this.isDashing=true;
      this.invulnerableTimer=20;
      this.vx=this.facing*(this.speed*2.6);
      this.vy=0;
      sounds.dash();
      game.spawnSparks(this.x+this.width/2,this.y+this.height/2,'#38bdf8',18);
    }
  }
  castBlast(){
    if(this.blastCooldown<=0){
      this.blastCooldown=this.blastMaxCd;
      sounds.blast();
      const sx=this.facing===1?this.x+this.width+12:this.x-12;
      game.playerProjectiles.push(new PlayerBlast(sx,this.y+this.height*0.45,this.facing));
      game.spawnSparks(sx,this.y+this.height*0.45,'#fbbf24',12);
      this.vx-=this.facing*2.8;
    }
  }
  activateShield(){
    if(this.shieldCooldown<=0){
      this.shieldCooldown=this.shieldMaxCd;
      this.shieldTimer=210;
      this.shieldActive=true;
      sounds.shieldActivate();
      game.spawnSparks(this.x+this.width/2,this.y+this.height/2,'#fbbf24',30);
      game.spawnFloatingText(this.x + this.width / 2, this.y - 12, 'DIVINE SPHERE! 🛡️', '#fbbf24', 16);
      game.showBanner('DIVINE SPHERE ACTIVE! 🛡️','Immune & burning all enemies who touch the sphere!');
    }
  }
  registerHit(){
    this.combo++;this.comboTimer=this.comboTimeout;
    sounds.comboHit(this.combo);game.updateComboDisplay(this.combo);
  }
  takeDamage(amount,source='enemy'){
    if(this.shieldActive){
      sounds.shieldBlocked();
      game.spawnFloatingText(this.x + this.width / 2, this.y - 12, 'BLOCKED! 🛡️', '#38bdf8', 14);
      game.spawnSparks(this.x+this.width/2,this.y+this.height/2,'#fbbf24',14);
      game.shakeScreen(2);
      return;
    }
    if(this.invulnerableTimer>0)return;
    this.health-=amount;this.invulnerableTimer=source==='spike'?30:45;
    source==='spike'?sounds.spikeHit():sounds.playerHurt();
    game.shakeScreen(source==='spike'?4:6);
    game.spawnFloatingText(this.x + this.width / 2, this.y - 8, `-${amount}`, '#ef4444', 15);
    game.spawnSparks(this.x+this.width/2,this.y+this.height/2,'#ef4444',12);
    this.combo=0;this.comboTimer=0;game.updateComboDisplay(0);
    if(this.health<=0){this.health=0;game.triggerGameOver();}
  }
  update(keys,platforms){
    if(this.dashCooldown>0)this.dashCooldown--;
    if(this.blastCooldown>0)this.blastCooldown--;
    if(this.shieldCooldown>0)this.shieldCooldown--;

    if(this.shieldTimer>0){
      this.shieldTimer--;
      if(this.shieldTimer===0)this.shieldActive=false;

      // Radiant Sphere Aura Damages Enemies Touching The "Gola"
      const pcx = this.x + this.width / 2;
      const pcy = this.y + this.height / 2;
      const sr = this.shieldRadius;

      if (Math.random() < 0.6) {
        const a = Math.random() * Math.PI * 2;
        game.spawnSparks(pcx + Math.cos(a) * (sr - 2), pcy + Math.sin(a) * (sr - 2), Math.random() < 0.5 ? '#fbbf24' : '#38bdf8', 1);
      }

      for (const e of game.enemies) {
        if (!e.dead) {
          const edist = Math.hypot((e.x + e.w / 2) - pcx, (e.y + e.h / 2) - pcy);
          if (edist < sr + Math.max(e.w, e.h) / 2) {
            if (!e.shieldHitTimer || e.shieldHitTimer <= 0) {
              e.shieldHitTimer = 9;
              e.hp -= 1;
              e.hitFlash = 8;
              sounds.shieldBlocked();
              game.spawnFloatingText(e.x + e.w / 2, e.y, '-1', '#fbbf24', 13);
              game.spawnSparks(e.x + e.w / 2, e.y + e.h / 2, '#fbbf24', 8);
              this.registerHit();

              const kAngle = Math.atan2((e.y + e.h / 2) - pcy, (e.x + e.w / 2) - pcx);
              e.x += Math.cos(kAngle) * 6;

              if (e.hp <= 0) {
                e.dead = true;
                game.score += 150;
                sounds.enemyDie();
                game.spawnSparks(e.x + e.w / 2, e.y + e.h / 2, '#a855f7', 18);
                game.gems_items.push(new GemCollectible(e.x + e.w / 2, e.y, 80));
                game.updateHUD();
              }
            }
          }
        }
      }

      // Damage Boss if touching sphere
      if (game.boss && !game.boss.cleansed) {
        const b = game.boss;
        const bdist = Math.hypot((b.x + b.w / 2) - pcx, (b.y + b.h / 2) - pcy);
        if (bdist < sr + b.w / 2) {
          if (!b.shieldHitTimer || b.shieldHitTimer <= 0) {
            b.shieldHitTimer = 10;
            if (!b.shieldActive) {
              b.hp -= 20;
              b.hitFlash = 10;
              sounds.enemyHit();
              game.shakeScreen(3);
              game.spawnFloatingText(b.x + b.w / 2, b.y - 10, '-20', '#fbbf24', 16);
              game.spawnSparks(b.x + b.w / 2, b.y + b.h / 2, '#fbbf24', 14);
              this.registerHit();
              if (b.hp <= 0) {
                b.hp = 0;
                b._cleanse();
              }
              game.updateBossHUD(b.hp, b.maxHp);
            } else {
              sounds.enemyHit();
            }
          }
        }
      }

      // Shatter stalactites
      for (const st of game.stalactites) {
        if (!st.dead && st.state === 'falling') {
          const sdist = Math.hypot((st.x + st.w / 2) - pcx, (st.y + st.h) - pcy);
          if (sdist < sr + 14) {
            st.dead = true;
            sounds.shieldBlocked();
            game.spawnSparks(st.x + st.w / 2, st.y + st.h, '#fbbf24', 16);
          }
        }
      }
    }

    // Dash
    if(this.dashTimer>0){
      this.dashTimer--;
      this.vx=this.facing*(this.speed*2.5);
      this.vy=0;
      if(this.dashTimer%2===0){
        game.spawnSparks(this.x+this.width/2,this.y+this.height/2,'#38bdf8',3,'smoke');
      }
      for(const e of game.enemies){
        if(!e.dead&&this.x<e.x+e.w&&this.x+this.width>e.x&&this.y<e.y+e.h&&this.y+this.height>e.y){
          e.hp-=2;
          e.hitFlash=10;
          sounds.enemyHit();
          game.spawnFloatingText(e.x + e.w / 2, e.y, 'DASH! -2', '#38bdf8', 14);
          game.spawnSparks(e.x+e.w/2,e.y+e.h/2,'#38bdf8',12);
          this.registerHit();
          if(e.hp<=0){
            e.dead=true;
            game.score+=150;
            sounds.enemyDie();
            game.spawnSparks(e.x+e.w/2,e.y+e.h/2,'#a855f7',18);
            game.gems_items.push(new GemCollectible(e.x + e.w/2, e.y, 80));
            game.updateHUD();
          }
        }
      }
      if(this.dashTimer===0)this.isDashing=false;
    } else {
      if(keys.left){this.vx=-this.speed;this.facing=-1;this.runCycle+=0.2;}
      else if(keys.right){this.vx=this.speed;this.facing=1;this.runCycle+=0.2;}
      else{this.vx*=0.65;if(Math.abs(this.vx)<0.1)this.vx=0;this.runCycle=0;}

      if(this.isGrounded&&Math.abs(this.vx)>1){
        this.footstepTimer++;if(this.footstepTimer>=18){this.footstepTimer=0;sounds.footstep();}
      } else this.footstepTimer=0;

      this.vy+=0.42;if(this.vy>14)this.vy=14;
    }

    this.wasGrounded=this.isGrounded;
    if(this.isGrounded)this.coyoteTimer=6;
    else if(this.coyoteTimer>0)this.coyoteTimer--;

    this.x+=this.vx;this._colX(platforms);
    this.y+=this.vy;this.isGrounded=false;this._colY(platforms);

    if(this.isGrounded&&!this.wasGrounded)this.canDoubleJump=true;

    if(this.attackTimer>0){this.attackTimer--;if(this.attackTimer===0)this.isAttacking=false;}
    if(this.attackCooldown>0)this.attackCooldown--;
    if(this.invulnerableTimer>0)this.invulnerableTimer--;
    if(this.comboTimer>0){this.comboTimer--;if(this.comboTimer===0){this.combo=0;game.updateComboDisplay(0);}}

    this.attackBox.x=this.facing===1?this.x+this.width:this.x-this.attackBox.width;
    this.attackBox.y=this.y;
  }

  _colX(platforms){
    for(const p of platforms){
      if(p.w<=0||p.passThrough)continue;
      if(this.x<p.x+p.w&&this.x+this.width>p.x&&this.y+2<p.y+p.h&&this.y+this.height-2>p.y){
        if(this.vx>0)this.x=p.x-this.width;
        else if(this.vx<0)this.x=p.x+p.w;
        this.vx=0;
      }
    }
  }
  _colY(platforms){
    for(const p of platforms){
      if(p.w<=0)continue;
      if(this.x<p.x+p.w&&this.x+this.width>p.x&&this.y<p.y+p.h&&this.y+this.height>p.y){
        if(this.vy>0&&this.y+this.height-this.vy<=p.y+4){
          this.y=p.y-this.height;this.vy=0;this.isGrounded=true;
          if(p.vx)this.x+=p.vx;
          if(p.type==='crumble'&&!p.crumbling){p.crumbling=true;p.crumbleTimer=90;sounds.crumble();}
        } else if(this.vy<0){this.y=p.y+p.h;this.vy=0;}
      }
    }
  }

  draw(ctx){
    if(this.invulnerableTimer>0&&Math.floor(Date.now()/60)%2===0)return;

    // Dash Ghost Trail
    if(this.isDashing){
      ctx.save();
      ctx.globalAlpha=0.45;
      ctx.fillStyle='#38bdf8';
      ctx.fillRect(this.x-(this.facing*18),this.y,this.width,this.height);
      ctx.globalAlpha=0.25;
      ctx.fillRect(this.x-(this.facing*32),this.y,this.width,this.height);
      ctx.restore();
    }

    ctx.save();ctx.translate(this.x+this.width/2,this.y+this.height/2);ctx.scale(this.facing,1);
    const ct=(this.vx*-1.8)+Math.sin(Date.now()*0.008)*3;
    ctx.fillStyle='#0284c7';ctx.beginPath();ctx.moveTo(-6,-10);ctx.lineTo(-14+ct,18);ctx.lineTo(2,16);ctx.closePath();ctx.fill();
    ctx.fillStyle='#cbd5e1';ctx.fillRect(-8,-12,16,22);
    ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.arc(0,-2,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#94a3b8';ctx.fillRect(-7,-22,14,12);
    ctx.fillStyle='#38bdf8';ctx.shadowColor='#38bdf8';ctx.shadowBlur=8;ctx.fillRect(0,-17,7,3);ctx.shadowBlur=0;
    ctx.fillStyle='#475569';
    const lb=Math.sin(this.runCycle)*4;ctx.fillRect(-7,10,6,12+lb);ctx.fillRect(1,10,6,12-lb);
    ctx.save();
    if(this.isAttacking){
      ctx.rotate(0.9);ctx.fillStyle='#38bdf8';ctx.shadowColor='#38bdf8';ctx.shadowBlur=12;ctx.fillRect(8,-26,6,32);
      ctx.fillStyle='#f59e0b';ctx.fillRect(5,-2,12,4);
    } else {ctx.fillStyle='#e2e8f0';ctx.fillRect(6,-12,4,24);ctx.fillStyle='#f59e0b';ctx.fillRect(4,2,8,3);}
    ctx.restore();
    if(this.isAttacking){ctx.strokeStyle='#67e8f9';ctx.lineWidth=3;ctx.shadowColor='#38bdf8';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(14,0,32,-0.6,0.7);ctx.stroke();}
    ctx.restore();

    // Divine Protection Sphere ("Poora Gola")
    if(this.shieldActive){
      ctx.save();
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      ctx.translate(cx, cy);

      const sphereRadius = this.shieldRadius + Math.sin(Date.now() * 0.008) * 2;

      // Full Spherical Gradient Fill
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, sphereRadius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
      grad.addColorStop(0.3, 'rgba(254, 240, 138, 0.35)');
      grad.addColorStop(0.65, 'rgba(56, 189, 248, 0.25)');
      grad.addColorStop(0.9, 'rgba(245, 158, 11, 0.55)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0.88)');

      ctx.fillStyle = grad;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, 0, sphereRadius, 0, Math.PI * 2);
      ctx.fill();

      // Outer Rim
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, sphereRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Rune Ring 1 (Clockwise)
      ctx.save();
      const rot1 = Date.now() * 0.003;
      ctx.rotate(rot1);
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, sphereRadius * 0.78, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const rx = Math.cos(a) * (sphereRadius * 0.78);
        const ry = Math.sin(a) * (sphereRadius * 0.78);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Outer Energy Arcs (Counter-Clockwise)
      ctx.save();
      const rot2 = -Date.now() * 0.004;
      ctx.rotate(rot2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r1 = sphereRadius - 4;
        const r2 = sphereRadius + 3;
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a + 0.2) * r2, Math.sin(a + 0.2) * r2);
      }
      ctx.stroke();
      ctx.restore();

      // Electric Plasma Lightning Zaps
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const zapAngle = (Date.now() * 0.01) % (Math.PI * 2);
      const zx1 = Math.cos(zapAngle) * (sphereRadius * 0.88);
      const zy1 = Math.sin(zapAngle) * (sphereRadius * 0.88);
      const zx2 = Math.cos(zapAngle + 1.2) * (sphereRadius * 0.88);
      const zy2 = Math.sin(zapAngle + 1.2) * (sphereRadius * 0.88);
      const midx = (zx1 + zx2) / 2 + (Math.sin(Date.now() * 0.03) * 6);
      const midy = (zy1 + zy2) / 2 + (Math.cos(Date.now() * 0.03) * 6);
      ctx.moveTo(zx1, zy1);
      ctx.lineTo(midx, midy);
      ctx.lineTo(zx2, zy2);
      ctx.stroke();

      ctx.restore();
    }
  }
}

// ============================================================
// ENEMY (Wisp, Gargoyle, Ghoul)
// ============================================================
class Enemy {
  constructor(x,y,w,h,type='wisp'){
    this.x=x;this.y=y;this.w=w;this.h=h;this.type=type;
    this.startX=x;this.patrolRange=160;this.dir=1;
    this.speed=type==='gargoyle'?2.8:1.6;
    this.hp=type==='ghoul'?3:2;this.maxHp=this.hp;
    this.dead=false;this.bob=Math.random()*Math.PI*2;this.hitFlash=0;
    this.shieldHitTimer=0;
  }
  update(player){
    if(this.dead)return;
    if(this.hitFlash>0)this.hitFlash--;
    if(this.shieldHitTimer>0)this.shieldHitTimer--;
    this.bob+=0.05;
    if(this.type==='wisp'){
      this.x+=this.speed*this.dir;if(Math.abs(this.x-this.startX)>this.patrolRange)this.dir*=-1;
      this.y+=Math.sin(this.bob)*0.8;
    } else if(this.type==='gargoyle'){
      const d=Math.hypot(player.x-this.x,player.y-this.y);
      if(d<260){const a=Math.atan2(player.y-this.y,player.x-this.x);this.x+=Math.cos(a)*this.speed;this.y+=Math.sin(a)*this.speed;}
      else{this.x+=this.speed*this.dir;if(Math.abs(this.x-this.startX)>this.patrolRange)this.dir*=-1;}
    } else {
      this.x+=this.speed*this.dir;if(Math.abs(this.x-this.startX)>this.patrolRange)this.dir*=-1;
    }
    if(player.x<this.x+this.w&&player.x+player.width>this.x&&player.y<this.y+this.h&&player.y+player.height>this.y)player.takeDamage(15);
    if(player.isAttacking&&player.attackTimer>0){
      const a=player.attackBox;
      if(a.x<this.x+this.w&&a.x+a.width>this.x&&a.y<this.y+this.h&&a.y+a.height>this.y){
        const dmg = game.getBladeDamage();
        this.hp -= dmg;
        this.hitFlash=8;
        sounds.enemyHit();
        game.hitStop(2);
        game.spawnFloatingText(this.x + this.w / 2, this.y, `-${dmg}`, '#f87171', 14);
        game.spawnSparks(this.x+this.w/2,this.y+this.h/2,'#c084fc',10);
        player.isAttacking=false;player.registerHit();
        if(this.hp<=0){
          this.dead=true;game.score+=150;sounds.enemyDie();
          game.spawnSparks(this.x+this.w/2,this.y+this.h/2,'#a855f7',18);
          game.gems_items.push(new GemCollectible(this.x + this.w/2, this.y, 80));
          game.updateHUD();
        }
      }
    }
  }
  draw(ctx){
    if(this.dead)return;
    ctx.save();ctx.translate(this.x+this.w/2,this.y+this.h/2);
    if(this.hitFlash>0)ctx.globalAlpha=0.4+Math.sin(this.hitFlash)*0.5;
    if(this.type==='wisp'){
      ctx.fillStyle=this.hitFlash>0?'#fff':'#9333ea';ctx.shadowColor='#c084fc';ctx.shadowBlur=16;
      ctx.beginPath();ctx.arc(0,0,this.w/2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f43f5e';ctx.shadowBlur=0;ctx.fillRect(-6*this.dir,-3,3,3);ctx.fillRect(2*this.dir,-3,3,3);
    } else if(this.type==='gargoyle'){
      ctx.fillStyle=this.hitFlash>0?'#fff':'#4c1d95';ctx.shadowColor='#a855f7';ctx.shadowBlur=12;ctx.fillRect(-10,-10,20,20);
      const wf=Math.sin(this.bob*2)*8;
      ctx.beginPath();ctx.moveTo(-10,-4);ctx.lineTo(-24,-14+wf);ctx.lineTo(-10,4);ctx.moveTo(10,-4);ctx.lineTo(24,-14+wf);ctx.lineTo(10,4);ctx.fill();
      ctx.fillStyle='#fbbf24';ctx.fillRect(-5,-4,3,3);ctx.fillRect(2,-4,3,3);
    } else {
      ctx.fillStyle=this.hitFlash>0?'#fff':'#2e1065';ctx.fillRect(-12,-16,24,32);
      ctx.fillStyle='#ef4444';ctx.fillRect(-6*this.dir,-8,4,4);ctx.fillRect(3*this.dir,-8,4,4);
    }
    for(let i=0;i<this.maxHp;i++){
      ctx.fillStyle=i<this.hp?'#ef4444':'#1e1b4b';ctx.globalAlpha=0.9;
      ctx.beginPath();ctx.arc(-((this.maxHp-1)*5)+i*10,-this.h/2-8,3,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
}

// ============================================================
// NEW ENEMY: SHADOW RANGER (Bow Archer)
// ============================================================
class ShadowRanger {
  constructor(x, y) {
    this.x = x; this.y = y; this.w = 26; this.h = 42;
    this.hp = 3; this.maxHp = 3; this.dead = false;
    this.facing = -1; this.shootTimer = 70; this.isAiming = false;
    this.hitFlash = 0; this.shieldHitTimer = 0;
  }
  update(player) {
    if (this.dead) return;
    if (this.hitFlash > 0) this.hitFlash--;
    if (this.shieldHitTimer > 0) this.shieldHitTimer--;

    this.facing = player.x < this.x ? -1 : 1;
    const dist = Math.hypot((player.x + player.width / 2) - (this.x + this.w / 2), (player.y + player.height / 2) - (this.y + this.h / 2));

    if (dist < 420) {
      this.shootTimer--;
      if (this.shootTimer <= 30) this.isAiming = true;
      if (this.shootTimer <= 0) {
        sounds.archerShoot();
        const ang = Math.atan2((player.y + player.height / 2) - (this.y + 16), (player.x + player.width / 2) - (this.x + this.w / 2));
        game.enemyProjectiles.push(new EnemyArrow(this.x + (this.facing === 1 ? this.w : 0), this.y + 16, ang));
        this.shootTimer = 140 + Math.floor(Math.random() * 40);
        this.isAiming = false;
      }
    } else {
      this.isAiming = false;
    }

    if (player.x < this.x + this.w && player.x + player.width > this.x && player.y < this.y + this.h && player.y + player.height > this.y) {
      player.takeDamage(12);
    }

    if (player.isAttacking && player.attackTimer > 0) {
      const a = player.attackBox;
      if (a.x < this.x + this.w && a.x + a.width > this.x && a.y < this.y + this.h && a.y + a.height > this.y) {
        const dmg = game.getBladeDamage();
        this.hp -= dmg;
        this.hitFlash = 8;
        sounds.enemyHit();
        game.hitStop(2);
        game.spawnFloatingText(this.x + this.w / 2, this.y, `-${dmg}`, '#f87171', 14);
        game.spawnSparks(this.x + this.w / 2, this.y + this.h / 2, '#c084fc', 10);
        player.isAttacking = false;
        player.registerHit();
        if (this.hp <= 0) {
          this.dead = true;
          game.score += 200;
          sounds.enemyDie();
          game.spawnSparks(this.x + this.w / 2, this.y + this.h / 2, '#a855f7', 18);
          game.gems_items.push(new GemCollectible(this.x + this.w / 2, this.y, 100));
          game.updateHUD();
        }
      }
    }
  }
  draw(ctx) {
    if (this.dead) return;
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.scale(this.facing, 1);
    if (this.hitFlash > 0) ctx.globalAlpha = 0.5;

    ctx.fillStyle = '#1e1138';
    ctx.fillRect(-8, -12, 16, 26);
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.arc(0, -14, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 8;
    ctx.fillRect(1, -16, 4, 3);
    ctx.shadowBlur = 0;

    // Bow
    ctx.strokeStyle = this.isAiming ? '#c084fc' : '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(8, -2, 14, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    if (this.isAiming) {
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(8, -2);
      ctx.lineTo(130, -2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (let i = 0; i < this.maxHp; i++) {
      ctx.fillStyle = i < this.hp ? '#ef4444' : '#1e1b4b';
      ctx.beginPath();
      ctx.arc(-((this.maxHp - 1) * 5) + i * 10, -this.h / 2 - 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ============================================================
// NEW ENEMY: CURSED VANGUARD (Spiked Tower Shield Knight)
// ============================================================
class CursedVanguard {
  constructor(x, y) {
    this.x = x; this.y = y; this.w = 34; this.h = 48;
    this.startX = x; this.patrolRange = 110; this.dir = 1; this.speed = 1.3;
    this.hp = 5; this.maxHp = 5; this.dead = false;
    this.hitFlash = 0; this.shieldHitTimer = 0;
  }
  update(player) {
    if (this.dead) return;
    if (this.hitFlash > 0) this.hitFlash--;
    if (this.shieldHitTimer > 0) this.shieldHitTimer--;

    this.x += this.speed * this.dir;
    if (Math.abs(this.x - this.startX) > this.patrolRange) this.dir *= -1;

    const dist = Math.abs(player.x - this.x);
    if (dist < 180) {
      this.dir = player.x < this.x ? -1 : 1;
    }

    if (player.x < this.x + this.w && player.x + player.width > this.x && player.y < this.y + this.h && player.y + player.height > this.y) {
      player.takeDamage(18);
    }

    if (player.isAttacking && player.attackTimer > 0) {
      const a = player.attackBox;
      if (a.x < this.x + this.w && a.x + a.width > this.x && a.y < this.y + this.h && a.y + a.height > this.y) {
        const hittingFromFront = (player.facing === 1 && this.dir === -1 && player.x < this.x) ||
                                 (player.facing === -1 && this.dir === 1 && player.x > this.x);
        if (hittingFromFront) {
          sounds.shieldKnightBlock();
          game.hitStop(2);
          game.spawnFloatingText(this.x + this.w / 2, this.y - 12, 'SHIELD BLOCKED! 🛡️', '#94a3b8', 13);
          game.spawnSparks(this.x + (this.dir === 1 ? this.w : 0), this.y + this.h / 2, '#94a3b8', 10);
          player.isAttacking = false;
        } else {
          const dmg = game.getBladeDamage() + 1; // Backstab bonus
          this.hp -= dmg;
          this.hitFlash = 10;
          sounds.enemyHit();
          game.hitStop(3);
          game.spawnFloatingText(this.x + this.w / 2, this.y - 8, `BACKSTAB! -${dmg}`, '#fbbf24', 15);
          game.spawnSparks(this.x + this.w / 2, this.y + this.h / 2, '#ef4444', 14);
          player.isAttacking = false;
          player.registerHit();
          if (this.hp <= 0) {
            this.dead = true;
            game.score += 350;
            sounds.enemyDie();
            game.spawnSparks(this.x + this.w / 2, this.y + this.h / 2, '#a855f7', 24);
            game.gems_items.push(new GemCollectible(this.x + this.w / 2, this.y, 200));
            game.updateHUD();
          }
        }
      }
    }
  }
  draw(ctx) {
    if (this.dead) return;
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.scale(this.dir, 1);
    if (this.hitFlash > 0) ctx.globalAlpha = 0.5;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -14, 20, 32);

    ctx.fillStyle = '#334155';
    ctx.fillRect(-8, -24, 16, 12);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(2, -18, 5, 2);

    // Tower shield
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.fillRect(8, -20, 10, 42);
    ctx.strokeRect(8, -20, 10, 42);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(18, 1); ctx.lineTo(26, 1); ctx.lineTo(18, 5); ctx.fill();

    for (let i = 0; i < this.maxHp; i++) {
      ctx.fillStyle = i < this.hp ? '#ef4444' : '#1e1b4b';
      ctx.beginPath();
      ctx.arc(-((this.maxHp - 1) * 5) + i * 10, -this.h / 2 - 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ============================================================
// PETRIFIED VILLAGER
// ============================================================
class PetrifiedVillager {
  constructor(x,y,id){this.x=x;this.y=y;this.w=26;this.h=42;this.id=id;this.cured=false;this.cureProgress=0;}
  update(player){
    if(this.cured)return;
    const d=Math.hypot((this.x+this.w/2)-(player.x+player.width/2),(this.y+this.h/2)-(player.y+player.height/2));
    if(d<55){
      game.activePrompt='Press [E] to Cleanse Stone Curse';
      if(game.keys.interact){
        this.cureProgress+=0.05;game.spawnSparks(this.x+this.w/2,this.y+this.h/2,'#fbbf24',2);
        if(this.cureProgress>=1){
          this.cured=true;game.curedCount++;game.score+=500;
          game.gems += 200;
          sounds.cureVillager();
          game.spawnFloatingText(this.x + this.w / 2, this.y - 12, 'FREED! +200 💎', '#34d399', 15);
          game.spawnSparks(this.x+this.w/2,this.y+this.h/2,'#38bdf8',25);
          game.showBanner('VILLAGER FREED!','The curse lifts and returns their warmth');game.updateHUD();
        }
      }
    }
  }
  draw(ctx){
    ctx.save();ctx.translate(this.x+this.w/2,this.y+this.h/2);
    if(this.cured){
      ctx.fillStyle='#fef08a';ctx.shadowColor='#fbbf24';ctx.shadowBlur=12;
      ctx.beginPath();ctx.arc(0,-12,7,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#38bdf8';ctx.fillRect(-7,-4,14,20);
      ctx.fillStyle='#f43f5e';ctx.font='14px Outfit';ctx.fillText('💖',-6,-24+Math.sin(Date.now()*0.005)*3);
    } else {
      ctx.fillStyle='#64748b';ctx.beginPath();ctx.arc(0,-12,7,0,Math.PI*2);ctx.fill();ctx.fillRect(-7,-4,14,20);
      ctx.strokeStyle='#c084fc';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-5,-2);ctx.lineTo(2,6);ctx.lineTo(-2,14);ctx.stroke();
      if(this.cureProgress>0){
        ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(-18,-30,36,6);
        ctx.fillStyle='#f59e0b';ctx.fillRect(-18,-30,36*this.cureProgress,6);
      }
    }
    ctx.restore();
  }
}

// ============================================================
// SUN ALTAR
// ============================================================
class SunAltar {
  constructor(x,y,id){this.x=x;this.y=y;this.w=34;this.h=44;this.id=id;this.lit=false;}
  update(player){
    if(this.lit)return;
    const d=Math.hypot((this.x+this.w/2)-(player.x+player.width/2),(this.y+this.h/2)-(player.y+player.height/2));
    if(d<60){
      game.activePrompt='Press [E] to Ignite Sun Altar';
      if(game.keys.interact){
        this.lit=true;game.altarsLit++;game.score+=600;
        game.gems += 250;
        sounds.altarIgnite();
        game.spawnFloatingText(this.x + this.w / 2, this.y - 14, 'ALTAR LIT! +250 💎', '#fbbf24', 16);
        game.spawnSparks(this.x+this.w/2,this.y,'#f59e0b',30);
        game.showBanner('ALTAR REIGNITED!','Golden sunlight drives out the shadow');game.updateHUD();
      }
    }
  }
  draw(ctx){
    ctx.save();ctx.translate(this.x+this.w/2,this.y+this.h/2);
    ctx.fillStyle='#334155';ctx.fillRect(-14,0,28,22);ctx.fillStyle='#475569';ctx.fillRect(-10,-10,20,10);
    if(this.lit){
      ctx.fillStyle='#fbbf24';ctx.shadowColor='#f59e0b';ctx.shadowBlur=24;
      ctx.beginPath();ctx.arc(0,-18,10+Math.sin(Date.now()*0.01)*2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-18,5,0,Math.PI*2);ctx.fill();
    } else {ctx.fillStyle='#1e293b';ctx.beginPath();ctx.arc(0,-12,8,0,Math.PI);ctx.fill();}
    ctx.restore();
  }
}

// ============================================================
// BOSS KING (Malakor)
// ============================================================
class BossKing {
  constructor(x,y){
    this.x=x;this.y=y;this.w=54;this.h=76;this.vx=0;
    this.hp=1000;this.maxHp=1000;
    this.timer=0;this.facing=-1;
    this.shieldActive=false;this.shieldUsed=false;
    this.cleansed=false;this.projectiles=[];
    this.phase2=false;this.teleportUsed=false;this.hitFlash=0;
    this.shieldHitTimer=0;
  }
  update(player){
    if(this.cleansed)return;
    if(this.hitFlash>0)this.hitFlash--;
    if(this.shieldHitTimer>0)this.shieldHitTimer--;
    this.timer++;this.facing=player.x<this.x?-1:1;
    const ratio=this.hp/this.maxHp;

    if(ratio<0.35&&!this.shieldUsed){
      this.shieldActive=true;this.shieldUsed=true;
      game.showBanner('CURSE BARRIER ACTIVATED!','Collect 3 Holy Light Spheres to shatter it!');game.spawnBossOrbs();
    }
    if(ratio<0.5&&!this.teleportUsed){
      this.teleportUsed=true;this.phase2=true;this._teleport(player);
      game.showBanner('PHASE 2: SHADOW INCARNATE!','The king grows more powerful!');
    }

    const interval=this.phase2?85:115;
    if(this.timer%interval===0){
      const r=Math.random();
      if(r<0.4){sounds.bossRoar();this._shoot(player);}
      else if(r<0.75)this._shockwave();
      else if(r<0.9&&this.phase2)this._teleport(player);
      else this.vx=this.facing*(this.phase2?7:5.5);
    }
    this.vx*=0.92;this.x+=this.vx;
    if(this.x<180)this.x=180;if(this.x>840)this.x=840;

    for(let i=this.projectiles.length-1;i>=0;i--){
      const p=this.projectiles[i];
      p.x+=p.vx;p.y+=p.vy;p.life--;

      if(player.shieldActive && !p.reflected){
        if(player.x<p.x+p.size && player.x+player.width>p.x && player.y<p.y+p.size && player.y+player.height>p.y){
          p.reflected=true;
          p.vx=-p.vx*1.5; p.vy=-p.vy*1.5;
          p.life=140;
          sounds.shieldBlocked();
          game.spawnFloatingText(player.x + player.width / 2, player.y - 12, 'DEFLECTED! 🛡️', '#38bdf8', 14);
          game.spawnSparks(p.x,p.y,'#fbbf24',16);
          continue;
        }
      }

      if(p.reflected && !this.cleansed){
        if(this.x<p.x+p.size && this.x+this.w>p.x && this.y<p.y+p.size && this.y+this.h>p.y){
          if(!this.shieldActive){
            this.hp-=50;
            this.hitFlash=12;
            sounds.enemyHit();
            game.shakeScreen(5);
            game.spawnFloatingText(this.x + this.w / 2, this.y, 'DEFLECT CRIT! -50', '#fbbf24', 18);
            game.spawnSparks(this.x+this.w/2,this.y+this.h/2,'#fbbf24',18);
            player.registerHit();
            if(this.hp<=0){this.hp=0;this._cleanse();}
          }
          game.updateBossHUD(this.hp,this.maxHp);
          p.life=0;
        }
      } else {
        if(player.x<p.x+p.size&&player.x+player.width>p.x&&player.y<p.y+p.size&&player.y+player.height>p.y){
          player.takeDamage(18);p.life=0;
        }
      }
      if(p.life<=0)this.projectiles.splice(i,1);
    }

    if(player.x<this.x+this.w&&player.x+player.width>this.x&&player.y<this.y+this.h&&player.y+player.height>this.y)player.takeDamage(20);
    if(player.isAttacking&&player.attackTimer>0){
      const a=player.attackBox;
      if(a.x<this.x+this.w&&a.x+a.width>this.x&&a.y<this.y+this.h&&a.y+a.height>this.y){
        if(this.shieldActive){game.showBanner('BARRIER REFLECTS!','Collect holy orbs first!');sounds.enemyHit();}
        else{
          const dmg = (this.phase2?25:35) * game.getBladeDamage();
          this.hp-=dmg;this.hitFlash=8;sounds.enemyHit();
          game.shakeScreen(4);game.hitStop(2);
          game.spawnFloatingText(this.x + this.w / 2, this.y, `-${dmg}`, '#f87171', 16);
          game.spawnSparks(this.x+this.w/2,this.y+this.h/2,'#c084fc',12);
          player.registerHit();
          if(this.hp<=0){this.hp=0;this._cleanse();}
        }
        player.isAttacking=false;game.updateBossHUD(this.hp,this.maxHp);
      }
    }
  }
  _teleport(player){
    sounds.bossTeleport();game.spawnSparks(this.x+this.w/2,this.y+this.h/2,'#c084fc',20);
    this.x=player.x<520?720:220;this.y=374;
    game.spawnSparks(this.x+this.w/2,this.y+this.h/2,'#7c3aed',20);game.shakeScreen(5);
  }
  _shoot(player){
    const ang=Math.atan2((player.y+player.height/2)-(this.y+20),(player.x+player.width/2)-this.x);
    const cnt=this.phase2?5:3;
    for(let i=0;i<cnt;i++){
      const off=(i-Math.floor(cnt/2))*0.2;
      this.projectiles.push({x:this.x+(this.facing===1?this.w:0),y:this.y+20,vx:Math.cos(ang+off)*(this.phase2?5:4.2),vy:Math.sin(ang+off)*(this.phase2?5:4.2),size:14,life:140,reflected:false});
    }
  }
  _shockwave(){
    sounds.bossRoar();game.shakeScreen(8);
    this.projectiles.push({x:this.x,y:this.y+this.h-10,vx:-6,vy:0,size:20,life:100,reflected:false});
    this.projectiles.push({x:this.x+this.w,y:this.y+this.h-10,vx:6,vy:0,size:20,life:100,reflected:false});
  }
  _cleanse(){
    this.cleansed=true;this.projectiles=[];
    sounds.victory();game.spawnSparks(this.x+this.w/2,this.y+this.h/2,'#fef08a',80);
    setTimeout(()=>game.triggerGameVictory(),2000);
  }
  draw(ctx){
    ctx.save();ctx.translate(this.x+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
    if(this.hitFlash>0)ctx.globalAlpha=0.4+Math.sin(this.hitFlash)*0.5;
    if(this.cleansed){
      ctx.fillStyle='#f59e0b';ctx.shadowColor='#fbbf24';ctx.shadowBlur=25;ctx.fillRect(-18,-32,36,64);
      ctx.fillStyle='#fef08a';ctx.beginPath();ctx.moveTo(-16,-32);ctx.lineTo(-8,-42);ctx.lineTo(0,-34);ctx.lineTo(8,-42);ctx.lineTo(16,-32);ctx.fill();
    } else {
      ctx.fillStyle=this.phase2?'#4c0099':'#3b0764';ctx.fillRect(-22,-34,44,68);
      ctx.fillStyle='#7e22ce';ctx.shadowColor=this.phase2?'#f43f5e':'#c084fc';ctx.shadowBlur=this.phase2?20:15;
      ctx.beginPath();ctx.moveTo(-20,-34);ctx.lineTo(-12,-48);ctx.lineTo(0,-36);ctx.lineTo(12,-48);ctx.lineTo(20,-34);ctx.fill();
      ctx.fillStyle=this.phase2?'#f43f5e':'#ef4444';ctx.fillRect(-6,-22,6,4);ctx.fillRect(4,-22,6,4);
      ctx.fillStyle='#1e1b4b';ctx.fillRect(20,-40,8,55);ctx.strokeStyle='#c084fc';ctx.strokeRect(20,-40,8,55);
      if(this.shieldActive){ctx.strokeStyle='#c084fc';ctx.lineWidth=4;ctx.shadowColor='#a855f7';ctx.shadowBlur=25;ctx.beginPath();ctx.arc(0,0,52,0,Math.PI*2);ctx.stroke();}
      if(this.phase2){ctx.strokeStyle='#f43f5e';ctx.lineWidth=2;ctx.globalAlpha=(0.3+Math.sin(Date.now()*0.01)*0.2);ctx.beginPath();ctx.arc(0,0,60,0,Math.PI*2);ctx.stroke();}
    }
    ctx.restore();
    for(const p of this.projectiles){
      ctx.save();
      ctx.fillStyle=p.reflected?'#fbbf24':this.phase2?'#f43f5e':'#a855f7';
      ctx.shadowColor=p.reflected?'#f59e0b':this.phase2?'#ef4444':'#7c3aed';
      ctx.shadowBlur=16;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size/2,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }
}

// ============================================================
// GAME ENGINE (Master Controller)
// ============================================================
class GameEngine {
  constructor(){
    this.canvas=document.getElementById('gameCanvas');
    this.ctx=this.canvas.getContext('2d');
    this.width=960;this.height=540;
    this.currentLevel=1;
    this.score=0;
    this.gems=0;
    this.state='MENU';
    this.keys={left:false,right:false,up:false,attack:false,interact:false};
    this.camera={x:0,y:0};
    this.shakeTimer=0;this.shakeIntensity=0;
    this.hitStopTimer=0;

    // Collections
    this.particles=[];this.floatingTexts=[];
    this.platforms=[];this.movingPlatforms=[];
    this.enemies=[];this.villagers=[];this.altars=[];this.holyOrbs=[];
    this.spikes=[];this.gems_items=[];this.checkpoints=[];this.stalactites=[];this.arenaHazards=[];
    this.chests=[];this.potions=[];
    this.playerProjectiles=[];this.enemyProjectiles=[];

    this.boss=null;
    this.exitDoor={x:0,y:0,w:40,h:64,active:false};
    this.curedCount=0;this.altarsLit=0;
    this.activePrompt='';this.levelStartTime=0;
    this.lastCpX=null;this.lastCpY=null;

    // RPG Progression Upgrades
    this.upgrades = {
      blade: 1, // Max 3
      armor: 1, // Max 3
      speed: 1, // Max 3
      blast: 1  // Max 3
    };
    this.upgradeCosts = {
      blade: [150, 320],
      armor: [150, 320],
      speed: [200, 350],
      blast: [250, 450]
    };

    this.player=new Player(100,360);
    this.dragCtrl=new DraggableControls();
    this.bindEvents();
    this.dragCtrl.init();
    this.initLoop();
  }

  getBladeDamage()      { return this.upgrades.blade; }
  getPlayerMaxHP()      { return 75 + this.upgrades.armor * 25; }
  getPlayerSpeed()      { return 4.5 + this.upgrades.speed * 0.6; }
  getDashMaxCd()        { return 125 - this.upgrades.speed * 15; }
  getBlastRadius()      { return 50 + this.upgrades.blast * 20; }
  getBlastDamage()      { return 2 + this.upgrades.blast * 2; }
  getBlastBossDamage()  { return 45 + this.upgrades.blast * 35; }

  hitStop(frames = 3) {
    this.hitStopTimer = frames;
  }

  spawnFloatingText(x, y, text, color = '#fbbf24', size = 15) {
    this.floatingTexts.push(new FloatingText(x, y, text, color, size));
  }

  bindEvents(){
    window.addEventListener('keydown',(e)=>{
      sounds.init();
      if(e.code==='KeyA'||e.code==='ArrowLeft')this.keys.left=true;
      if(e.code==='KeyD'||e.code==='ArrowRight')this.keys.right=true;
      if((e.code==='KeyW'||e.code==='ArrowUp'||e.code==='Space')&&!e.repeat&&this.state==='PLAYING')this.player.jump();
      if(e.code==='KeyJ'&&!e.repeat&&this.state==='PLAYING')this.player.attack();
      if(e.code==='KeyE'||e.code==='KeyF')this.keys.interact=true;

      // Powers & Shrine
      if((e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyK')&&!e.repeat&&this.state==='PLAYING')this.player.dash();
      if((e.code==='KeyQ')&&!e.repeat&&this.state==='PLAYING')this.player.castBlast();
      if((e.code==='KeyC'||e.code==='KeyI'||e.code==='KeyX')&&!e.repeat&&this.state==='PLAYING'){
        if(this.player.shieldCooldown<=0){
          this.player.activateShield();
        } else if(e.code==='KeyX'){
          this.player.attack();
        }
      }
      if(e.code==='KeyU'&&!e.repeat){
        if(this.state==='PLAYING') this.openShrine();
        else if(this.state==='SHRINE') this.closeShrine();
      }

      if(e.code==='Escape'){
        if(this.state==='PLAYING')this.pauseGame();
        else if(this.state==='PAUSED')this.resumeGame();
        else if(this.state==='SHRINE')this.closeShrine();
      }
      if(e.code==='Enter'){
        const sm=document.getElementById('story-modal');
        if(!sm.classList.contains('hidden')){e.preventDefault();sm.classList.add('hidden');this.startLevel(1);}
        else if(this.state==='PAUSED')this.resumeGame();
      }
    });

    window.addEventListener('keyup',(e)=>{
      if(e.code==='KeyA'||e.code==='ArrowLeft')this.keys.left=false;
      if(e.code==='KeyD'||e.code==='ArrowRight')this.keys.right=false;
      if((e.code==='KeyW'||e.code==='ArrowUp'||e.code==='Space')&&this.player.vy<-4)this.player.vy*=0.55;
      if(e.code==='KeyE'||e.code==='KeyF')this.keys.interact=false;
    });

    this.canvas.addEventListener('mousedown',()=>{sounds.init();if(this.state==='PLAYING')this.player.attack();});

    // Touch button bindings
    this._bt('btn-touch-left','left');
    this._bt('btn-touch-right','right');
    this._bt('btn-touch-interact','interact');
    this._bta('btn-touch-jump',()=>{if(this.state==='PLAYING')this.player.jump();});
    this._bta('btn-touch-attack',()=>{if(this.state==='PLAYING')this.player.attack();});
    this._bta('btn-touch-dash',()=>{if(this.state==='PLAYING')this.player.dash();});
    this._bta('btn-touch-blast',()=>{if(this.state==='PLAYING')this.player.castBlast();});
    this._bta('btn-touch-shield',()=>{if(this.state==='PLAYING')this.player.activateShield();});

    // HUD Skill Slot Click Bindings
    document.getElementById('slot-dash').addEventListener('click',()=>this.player.dash());
    document.getElementById('slot-blast').addEventListener('click',()=>this.player.castBlast());
    document.getElementById('slot-shield').addEventListener('click',()=>this.player.activateShield());

    // Shrine HUD Button
    document.getElementById('btn-open-shop').addEventListener('click',()=>{
      if(this.state==='PLAYING') this.openShrine();
    });

    // Shrine Modal Close
    document.getElementById('btn-close-shrine').addEventListener('click',()=>this.closeShrine());

    // Shrine Upgrade Buttons
    this._bindUpgradeBtn('blade');
    this._bindUpgradeBtn('armor');
    this._bindUpgradeBtn('speed');
    this._bindUpgradeBtn('blast');

    // UI Buttons
    document.getElementById('btn-play').addEventListener('click',()=>{sounds.init();this._showStory();});
    document.getElementById('btn-dialog-continue').addEventListener('click',()=>{document.getElementById('story-modal').classList.add('hidden');this.startLevel(1);});
    document.getElementById('btn-level-select').addEventListener('click',()=>{document.getElementById('main-menu').classList.add('hidden');document.getElementById('level-select-menu').classList.remove('hidden');});
    document.getElementById('btn-back-level-select').addEventListener('click',()=>{document.getElementById('level-select-menu').classList.add('hidden');document.getElementById('main-menu').classList.remove('hidden');});
    document.querySelectorAll('.level-card').forEach(c=>c.addEventListener('click',()=>{document.getElementById('level-select-menu').classList.add('hidden');this.startLevel(parseInt(c.dataset.level,10));}));
    document.getElementById('btn-instructions').addEventListener('click',()=>{document.getElementById('main-menu').classList.add('hidden');document.getElementById('instructions-menu').classList.remove('hidden');});
    document.getElementById('btn-back-instructions').addEventListener('click',()=>{document.getElementById('instructions-menu').classList.add('hidden');document.getElementById('main-menu').classList.remove('hidden');});
    document.getElementById('btn-pause').addEventListener('click',()=>this.pauseGame());
    document.getElementById('btn-resume').addEventListener('click',()=>this.resumeGame());
    document.getElementById('btn-pause-shop').addEventListener('click',()=>{
      document.getElementById('pause-menu').classList.add('hidden');
      this.openShrine();
    });
    document.getElementById('btn-restart-level').addEventListener('click',()=>{this.resumeGame();this.startLevel(this.currentLevel);});
    document.getElementById('btn-reset-controls').addEventListener('click',()=>this.dragCtrl.reset());
    document.getElementById('btn-quit-menu').addEventListener('click',()=>this.quitToMenu());
    document.getElementById('btn-next-level').addEventListener('click',()=>{document.getElementById('level-complete-screen').classList.add('hidden');this.currentLevel<3?this.startLevel(this.currentLevel+1):this.triggerGameVictory();});
    document.getElementById('btn-complete-replay').addEventListener('click',()=>{document.getElementById('level-complete-screen').classList.add('hidden');this.startLevel(this.currentLevel);});
    document.getElementById('btn-retry').addEventListener('click',()=>{document.getElementById('game-over-screen').classList.add('hidden');this.startLevel(this.currentLevel);});
    document.getElementById('btn-game-over-menu').addEventListener('click',()=>this.quitToMenu());
    document.getElementById('btn-play-again').addEventListener('click',()=>this.quitToMenu());

    // Fullscreen Toggle for Mobile & Desktop
    const toggleFS = () => {
      sounds.init();
      const doc = window.document;
      const docEl = doc.documentElement;
      const req = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
      const exit = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
      if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        if (req) req.call(docEl).catch(() => {});
        try {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }
        } catch(e) {}
      } else {
        if (exit) exit.call(doc).catch(() => {});
      }
    };

    const fsHud = document.getElementById('btn-fullscreen-hud');
    if (fsHud) fsHud.addEventListener('click', toggleFS);
    const fsMenu = document.getElementById('btn-fullscreen-menu');
    if (fsMenu) fsMenu.addEventListener('click', toggleFS);

    // Responsive Control Relayout on Screen Size / Orientation Change
    window.addEventListener('resize', () => {
      setTimeout(() => this.dragCtrl.applyLayout(), 180);
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.dragCtrl.applyLayout(), 250);
    });

    // PWA Mobile App Installation Prompt
    let deferredInstallPrompt = null;
    const btnInstall = document.getElementById('btn-install-app');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (btnInstall) btnInstall.classList.remove('hidden');
    });

    if (btnInstall) {
      // Check if already in standalone mode
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        btnInstall.classList.add('hidden');
      } else {
        // Show on mobile by default to guide user
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          btnInstall.classList.remove('hidden');
        }
      }

      btnInstall.addEventListener('click', async () => {
        sounds.init();
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          const choice = await deferredInstallPrompt.userChoice;
          if (choice.outcome === 'accepted') {
            btnInstall.classList.add('hidden');
            this.showBanner('APP INSTALLED! 📲', 'Kingdom of Shadows is now ready on your home screen!');
          }
          deferredInstallPrompt = null;
        } else {
          // Fallback instructions for iOS Safari or Chrome
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (isIOS) {
            alert('To install on iPhone / iPad:\n\n1. Tap the Share button (⎋) at bottom\n2. Select "Add to Home Screen" ➕\n3. Enjoy full-screen native gameplay!');
          } else {
            alert('To install on Android:\n\n1. Tap the top-right menu (⋮)\n2. Tap "Install App" or "Add to Home screen"\n3. Launch directly from your home screen!');
          }
        }
      });
    }

    // Audio Toggles (SFX & BGM)
    const toggleSfx = () => {
      sounds.sfxEnabled = !sounds.sfxEnabled;
      const txt = sounds.sfxEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
      document.getElementById('btn-toggle-sound').textContent = txt;
      document.getElementById('btn-pause-sound').textContent = txt;
    };
    const toggleMusic = () => {
      sounds.musicEnabled = !sounds.musicEnabled;
      const txt = sounds.musicEnabled ? '🎵 Music: ON' : '🔇 Music: OFF';
      document.getElementById('btn-toggle-music').textContent = txt;
      document.getElementById('btn-pause-music').textContent = txt;
      if (sounds.musicEnabled && this.state === 'PLAYING') sounds.startMusic(this.currentLevel);
      else sounds.stopMusic();
    };

    document.getElementById('btn-toggle-sound').addEventListener('click', toggleSfx);
    document.getElementById('btn-pause-sound').addEventListener('click', toggleSfx);
    document.getElementById('btn-toggle-music').addEventListener('click', toggleMusic);
    document.getElementById('btn-pause-music').addEventListener('click', toggleMusic);
  }

  _bindUpgradeBtn(type) {
    document.getElementById(`btn-up-${type}`).addEventListener('click', () => {
      const curLv = this.upgrades[type];
      if (curLv >= 3) return;
      const cost = this.upgradeCosts[type][curLv - 1];
      if (this.gems >= cost) {
        this.gems -= cost;
        this.upgrades[type]++;
        sounds.upgrade();
        this.player.applyUpgrades();
        if (type === 'armor') this.player.health = this.player.maxHealth;
        this.spawnFloatingText(this.player.x + this.player.width / 2, this.player.y - 14, `${type.toUpperCase()} UPGRADED! ✨`, '#fbbf24', 16);
        this.updateShrineUI();
        this.updateHUD();
      } else {
        sounds.spikeHit();
        this.showBanner('NOT ENOUGH GEMS!', `Need 💎 ${cost} Soul Gems to upgrade`);
      }
    });
  }

  openShrine() {
    this.state = 'SHRINE';
    sounds.upgrade();
    this.updateShrineUI();
    document.getElementById('shrine-modal').classList.remove('hidden');
  }

  closeShrine() {
    this.state = 'PLAYING';
    document.getElementById('shrine-modal').classList.add('hidden');
    this.updateHUD();
  }

  updateShrineUI() {
    document.getElementById('shrine-gem-count').textContent = this.gems;
    const types = ['blade', 'armor', 'speed', 'blast'];
    for (const t of types) {
      const lv = this.upgrades[t];
      const pipsWrap = document.getElementById(`pips-${t}`);
      pipsWrap.innerHTML = '';
      for (let i = 1; i <= 3; i++) {
        const p = document.createElement('span');
        p.className = `pip ${i <= lv ? 'on' : ''}`;
        pipsWrap.appendChild(p);
      }
      const btn = document.getElementById(`btn-up-${t}`);
      const desc = document.getElementById(`desc-${t}`);
      if (lv >= 3) {
        btn.textContent = 'MAXED OUT ✓';
        btn.classList.add('maxed');
      } else {
        btn.classList.remove('maxed');
        const cost = this.upgradeCosts[t][lv - 1];
        btn.innerHTML = `Upgrade (💎 <span id="cost-${t}">${cost}</span>)`;
      }

      if (t === 'blade') desc.textContent = `Slash Damage: Lv ${lv} (${lv * 100}%)`;
      if (t === 'armor') desc.textContent = `Max HP: ${75 + lv * 25} (Heals Full)`;
      if (t === 'speed') desc.textContent = `Speed: ${(4.5 + lv * 0.6).toFixed(1)} | Dash CD: ${125 - lv * 15}f`;
      if (t === 'blast') desc.textContent = `Blast Radius: ${50 + lv * 20}px | Dmg: ${2 + lv * 2}`;
    }
  }

  _bt(id,key){
    const el=document.getElementById(id);if(!el)return;
    el.addEventListener('pointerdown',(e)=>{e.preventDefault();sounds.init();if(this.state==='PLAYING')this.keys[key]=true;});
    el.addEventListener('pointerup',(e)=>{e.preventDefault();this.keys[key]=false;});
    el.addEventListener('pointerleave',(e)=>{e.preventDefault();this.keys[key]=false;});
  }
  _bta(id,fn){const el=document.getElementById(id);if(!el)return;el.addEventListener('pointerdown',(e)=>{e.preventDefault();sounds.init();fn();});}
  _showStory(){document.getElementById('main-menu').classList.add('hidden');document.getElementById('story-modal').classList.remove('hidden');}
  pauseGame(){
    if(this.state!=='PLAYING')return;
    this.state='PAUSED';
    Object.keys(this.keys).forEach(k=>this.keys[k]=false);
    document.getElementById('pause-menu').classList.remove('hidden');
  }
  resumeGame(){
    this.state='PLAYING';
    document.getElementById('pause-menu').classList.add('hidden');
    if (sounds.musicEnabled) sounds.startMusic(this.currentLevel);
  }
  quitToMenu(){
    this.state='MENU';
    sounds.stopMusic();
    Object.keys(this.keys).forEach(k=>this.keys[k]=false);
    document.querySelectorAll('.ui-screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('hud').classList.add('hidden');document.getElementById('boss-hud').classList.add('hidden');
    document.getElementById('combo-display').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
  }
  updateComboDisplay(combo){
    const el=document.getElementById('combo-display');
    if(combo>=2){el.classList.remove('hidden');document.getElementById('combo-count').textContent=`${combo}x COMBO!`;el.style.animation='none';el.offsetHeight;el.style.animation=null;}
    else el.classList.add('hidden');
  }

  startLevel(n){
    this.currentLevel=n;this.state='PLAYING';
    this.particles=[];this.floatingTexts=[];
    this.enemies=[];this.villagers=[];this.altars=[];this.holyOrbs=[];
    this.spikes=[];this.gems_items=[];this.checkpoints=[];this.stalactites=[];this.arenaHazards=[];
    this.chests=[];this.potions=[];
    this.playerProjectiles=[];this.enemyProjectiles=[];
    this.boss=null;this.curedCount=0;this.altarsLit=0;
    this.levelStartTime=Date.now();this.lastCpX=null;this.lastCpY=null;
    this.hitStopTimer=0;

    Object.keys(this.keys).forEach(k=>this.keys[k]=false);
    document.querySelectorAll('.ui-screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('hud').classList.remove('hidden');document.getElementById('combo-display').classList.add('hidden');

    if(n===1)this._loadL1();else if(n===2)this._loadL2();else this._loadL3();
    this.player.applyUpgrades();
    sounds.startMusic(n);
    this.updateHUD();
  }

  _loadL1(){
    document.getElementById('level-title-pill').textContent='Level 1: The Cursed Village';
    document.getElementById('objective-text').textContent='Rescue 3 Petrified Villagers:';
    document.getElementById('boss-hud').classList.add('hidden');
    this.levelWidth=2600;this.player.reset(80,370);
    this.platforms=[
      {x:0,y:440,w:680,h:100},{x:760,y:440,w:560,h:100},{x:1420,y:440,w:420,h:100},{x:1940,y:440,w:660,h:100},
      {x:260,y:340,w:140,h:20},{x:480,y:260,w:160,h:20},{x:800,y:320,w:130,h:20},
      {x:980,y:240,w:180,h:20},{x:1200,y:290,w:120,h:20},{x:1460,y:220,w:160,h:20},
      {x:1720,y:300,w:180,h:20},{x:1960,y:360,w:120,h:20},{x:2100,y:270,w:160,h:20},{x:2310,y:350,w:140,h:20},
      {x:700,y:370,w:60,h:20,type:'crumble',crumbling:false,crumbleTimer:0},
      {x:1360,y:380,w:60,h:20,type:'crumble',crumbling:false,crumbleTimer:0},
    ];
    this.movingPlatforms=[{x:1080,y:340,w:100,h:20,startX:1080,rangeX:140,dir:1,speed:1.2,vx:1.2}];
    this.spikes=[new SpikeHazard(693,424,5),new SpikeHazard(1325,424,5),new SpikeHazard(355,320,3)];
    this.gems_items=[new GemCollectible(310,310,100),new GemCollectible(550,230,150),new GemCollectible(1050,210,100),new GemCollectible(1480,190,200),new GemCollectible(2120,240,150)];
    this.checkpoints=[new Checkpoint(980,386),new Checkpoint(1960,386)];
    this.chests=[new TreasureChest(840,416),new TreasureChest(1780,276)];
    this.potions=[new HealthPotion(1230,260)];
    this.villagers=[new PetrifiedVillager(540,218,1),new PetrifiedVillager(1050,198,2),new PetrifiedVillager(1800,258,3)];
    this.enemies=[
      new Enemy(380,400,24,24,'wisp'),new Enemy(630,280,24,24,'wisp'),
      new ShadowRanger(880,400),
      new Enemy(1150,160,28,28,'gargoyle'),
      new CursedVanguard(1600,392),
      new Enemy(1760,260,24,24,'wisp'),
      new ShadowRanger(2140,230),
      new Enemy(2280,400,26,32,'ghoul'),
    ];
    this.exitDoor={x:2470,y:364,w:46,h:76,active:false};
    this.showBanner('CHAPTER I: THE CURSED VILLAGE','Rescue 3 petrified villagers to open the gate!');
  }

  _loadL2(){
    document.getElementById('level-title-pill').textContent='Level 2: Haunted Catacombs';
    document.getElementById('objective-text').textContent='Ignite 3 Ancient Sun Altars:';
    document.getElementById('boss-hud').classList.add('hidden');
    this.levelWidth=2800;this.player.reset(80,360);
    this.platforms=[
      {x:0,y:440,w:580,h:100},{x:680,y:440,w:480,h:100},{x:1260,y:440,w:400,h:100},{x:1760,y:440,w:600,h:100},{x:2460,y:440,w:340,h:100},
      {x:180,y:330,w:110,h:20},{x:360,y:240,w:160,h:20},{x:580,y:180,w:200,h:20},
      {x:800,y:280,w:120,h:20},{x:980,y:200,w:180,h:20},{x:1200,y:300,w:100,h:20},
      {x:1360,y:220,w:160,h:20},{x:1580,y:160,w:200,h:20},{x:1820,y:280,w:140,h:20},
      {x:2020,y:200,w:180,h:20},{x:2240,y:300,w:160,h:20},{x:2460,y:200,w:140,h:20},
      {x:620,y:370,w:60,h:20,type:'crumble',crumbling:false,crumbleTimer:0},
      {x:1200,y:380,w:60,h:20,type:'crumble',crumbling:false,crumbleTimer:0},
      {x:1700,y:380,w:60,h:20,type:'crumble',crumbling:false,crumbleTimer:0},
    ];
    this.movingPlatforms=[
      {x:860,y:360,w:90,h:20,startX:860,rangeX:110,dir:1,speed:1.5,vx:1.5},
      {x:2080,y:350,w:90,h:20,startX:2080,rangeX:130,dir:-1,speed:1.8,vx:-1.8},
    ];
    this.spikes=[new SpikeHazard(580,424,6),new SpikeHazard(1165,424,6),new SpikeHazard(1730,424,5),new SpikeHazard(2400,424,5)];
    this.gems_items=[new GemCollectible(400,210,100),new GemCollectible(640,150,200),new GemCollectible(1020,170,150),new GemCollectible(1620,130,250),new GemCollectible(2060,170,200),new GemCollectible(2490,170,300)];
    this.checkpoints=[new Checkpoint(900,386),new Checkpoint(1820,386)];
    this.chests=[new TreasureChest(600,156),new TreasureChest(1880,256)];
    this.potions=[new HealthPotion(1000,170),new HealthPotion(2260,270)];
    this.altars=[new SunAltar(420,196,1),new SunAltar(1420,176,2),new SunAltar(2510,156,3)];
    this.stalactites=[
      new Stalactite(300,0),new Stalactite(620,0),new Stalactite(900,0),new Stalactite(1200,0),
      new Stalactite(1480,0),new Stalactite(1760,0),new Stalactite(2060,0),new Stalactite(2360,0),new Stalactite(2620,0),
    ];
    this.enemies=[
      new CursedVanguard(300,392),
      new ShadowRanger(620,140),
      new Enemy(820,240,24,24,'wisp'),
      new Enemy(960,400,26,32,'ghoul'),
      new Enemy(1100,160,28,28,'gargoyle'),
      new CursedVanguard(1440,392),
      new ShadowRanger(1640,120),
      new Enemy(1860,240,26,32,'ghoul'),
      new Enemy(2100,160,28,28,'gargoyle'),
      new Enemy(2300,400,26,32,'ghoul'),
    ];
    this.exitDoor={x:2680,y:364,w:46,h:76,active:false};
    this.showBanner('CHAPTER II: HAUNTED CATACOMBS','Reignite 3 sun altars to pierce the darkness!');
  }

  _loadL3(){
    document.getElementById('level-title-pill').textContent='Level 3: The Dark Citadel';
    document.getElementById('objective-text').textContent='Defeat Malakor:';
    document.getElementById('boss-hud').classList.remove('hidden');
    this.levelWidth=1050;this.player.reset(120,370);
    this.platforms=[
      {x:0,y:450,w:1050,h:90},{x:100,y:330,w:160,h:20},{x:400,y:240,w:170,h:20},
      {x:700,y:300,w:160,h:20},{x:250,y:170,w:120,h:20},{x:680,y:170,w:120,h:20},
    ];
    this.arenaHazards=[
      {x:200,y:435,w:64,active:false,timer:0,interval:180,duration:60},
      {x:450,y:435,w:64,active:false,timer:90,interval:180,duration:60},
      {x:700,y:435,w:64,active:false,timer:45,interval:180,duration:60},
    ];
    this.chests=[new TreasureChest(470,216)];
    this.potions=[new HealthPotion(120,300),new HealthPotion(750,270)];
    this.gems_items=[new GemCollectible(270,140,300),new GemCollectible(730,140,300)];
    this.boss=new BossKing(760,374);this.updateBossHUD(this.boss.hp,this.boss.maxHp);
    this.showBanner('CHAPTER III: CLASH WITH MALAKOR','Break the king\'s curse to save the kingdom!');
  }

  spawnBossOrbs(){this.holyOrbs=[{x:220,y:290,collected:false},{x:520,y:200,collected:false},{x:800,y:290,collected:false}];}

  showBanner(title,sub){
    const b=document.getElementById('notification-banner');
    document.getElementById('notif-title').textContent=title;document.getElementById('notif-subtitle').textContent=sub;
    b.classList.remove('hidden');b.style.animation='none';b.offsetHeight;b.style.animation=null;
    setTimeout(()=>b.classList.add('hidden'),3500);
  }

  updateHUD(){
    // Player HP Dual-Layer
    const hpPct = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
    const hpBar = document.getElementById('hp-bar');
    const hpLagBar = document.getElementById('hp-lag-bar');
    if (hpBar) hpBar.style.width = `${hpPct}%`;
    if (hpLagBar) {
      setTimeout(() => { if (hpLagBar) hpLagBar.style.width = `${hpPct}%`; }, 180);
    }
    document.getElementById('hp-text').textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;
    document.getElementById('score-display').textContent = this.score;
    document.getElementById('gem-display').textContent = this.gems;

    // Objectives badge
    const b = document.getElementById('objective-counter');
    if(this.currentLevel===1){b.textContent=`${this.curedCount} / 3`;if(this.curedCount>=3){this.exitDoor.active=true;b.textContent='GATE OPEN ➡';b.style.color='#34d399';}}
    else if(this.currentLevel===2){b.textContent=`${this.altarsLit} / 3`;if(this.altarsLit>=3){this.exitDoor.active=true;b.textContent='GATE OPEN ➡';b.style.color='#34d399';}}
    else b.textContent='BOSS CLASH';

    // Level Progress Tracker
    const progressFill = document.getElementById('level-progress-fill');
    const playerPin = document.getElementById('progress-player-pin');
    if (progressFill && playerPin && this.levelWidth) {
      const prog = Math.max(0, Math.min(100, (this.player.x / (this.levelWidth - 100)) * 100));
      progressFill.style.width = `${prog}%`;
      playerPin.style.left = `${prog}%`;
    }

    // Skills HUD slots & cooldown overlays
    this._updateSkillSlot('dash', this.player.dashCooldown, this.player.dashMaxCd, 'btn-touch-dash');
    this._updateSkillSlot('blast', this.player.blastCooldown, this.player.blastMaxCd, 'btn-touch-blast');
    this._updateSkillSlot('shield', this.player.shieldCooldown, this.player.shieldMaxCd, 'btn-touch-shield', this.player.shieldActive);
  }

  _updateSkillSlot(name, cd, maxCd, touchBtnId, isActive=false){
    const slot = document.getElementById(`slot-${name}`);
    const overlay = document.getElementById(`cd-${name}`);
    const tBtn = document.getElementById(touchBtnId);
    if (!slot || !overlay) return;

    if (isActive) {
      slot.classList.add('active');
      slot.classList.remove('ready');
      overlay.style.height = '0%';
      overlay.textContent = '';
      if(tBtn) tBtn.classList.remove('on-cd');
    } else if (cd > 0) {
      slot.classList.remove('ready');
      slot.classList.remove('active');
      const pct = Math.min(100, Math.ceil((cd / maxCd) * 100));
      overlay.style.height = `${pct}%`;
      overlay.textContent = (cd / 60).toFixed(1) + 's';
      if(tBtn) tBtn.classList.add('on-cd');
    } else {
      slot.classList.add('ready');
      slot.classList.remove('active');
      overlay.style.height = '0%';
      overlay.textContent = '';
      if(tBtn) tBtn.classList.remove('on-cd');
    }
  }

  updateBossHUD(hp, max) {
    const p = Math.max(0, (hp / max) * 100);
    const bossBar = document.getElementById('boss-hp-bar');
    const bossLag = document.getElementById('boss-hp-lag-bar');
    if (bossBar) bossBar.style.width = `${p}%`;
    if (bossLag) {
      setTimeout(() => { if (bossLag) bossLag.style.width = `${p}%`; }, 200);
    }
    document.getElementById('boss-hp-text').textContent = `${Math.ceil(hp)} / ${max}`;
  }

  spawnSparks(x,y,color,count=10,type='glow'){
    for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*4;this.particles.push(new Particle(x,y,Math.cos(a)*s,Math.sin(a)*s,color,2+Math.random()*3,20+Math.random()*25,type));}
  }
  shakeScreen(i){this.shakeIntensity=i;this.shakeTimer=14;}

  triggerGameOver(){
    if(this.state==='GAME_OVER')return;
    this.state='GAME_OVER';
    sounds.stopMusic();
    sounds.defeat();
    document.getElementById('game-over-screen').classList.remove('hidden');
  }

  triggerLevelComplete(){
    if(this.state!=='PLAYING')return;
    this.state='LEVEL_COMPLETE';
    sounds.stopMusic();
    sounds.victory();
    const e=Math.floor((Date.now()-this.levelStartTime)/1000);
    document.getElementById('complete-score').textContent=this.score;
    document.getElementById('complete-time').textContent=`${String(Math.floor(e/60)).padStart(2,'0')}:${String(e%60).padStart(2,'0')}`;
    document.getElementById('level-complete-desc').textContent=this.currentLevel===1?'The villagers are saved! Now descend into the Haunted Catacombs.':'The beacons shine bright! Onward to the Corrupted King in the Dark Citadel!';
    document.getElementById('level-complete-screen').classList.remove('hidden');
  }

  triggerGameVictory(){
    this.state='VICTORY';
    sounds.stopMusic();
    sounds.victory();
    document.getElementById('final-score').textContent=this.score;
    document.getElementById('game-victory-screen').classList.remove('hidden');
    for(let i=0;i<150;i++){const cols=['#f59e0b','#38bdf8','#c084fc','#34d399','#f43f5e'];this.particles.push(new Particle(Math.random()*this.width,-10,(Math.random()-0.5)*3,2+Math.random()*3,cols[Math.floor(Math.random()*cols.length)],4+Math.random()*4,180,'confetti'));}
  }

  initLoop(){const l=()=>{this.update();this.render();requestAnimationFrame(l);};requestAnimationFrame(l);}

  update(){
    if(this.state!=='PLAYING')return;

    // Hit-Stop impact freeze frame
    if (this.hitStopTimer > 0) {
      this.hitStopTimer--;
      return;
    }

    this.activePrompt='';

    // Moving platforms
    for(const mp of this.movingPlatforms){
      mp.x+=mp.vx;if(Math.abs(mp.x-mp.startX)>mp.rangeX){mp.vx*=-1;mp.dir*=-1;}
    }
    // Crumble
    for(const p of this.platforms){if(p.type==='crumble'&&p.crumbling){p.crumbleTimer--;if(p.crumbleTimer<=0)p.w=0;}}

    const allPlats=[...this.platforms,...this.movingPlatforms];
    this.player.update(this.keys,allPlats);

    // Player Projectiles
    for(let i=this.playerProjectiles.length-1; i>=0; i--){
      const pb=this.playerProjectiles[i];
      pb.update(this.enemies, this.boss, allPlats);
      if(pb.exploded || pb.life<=0){
        this.playerProjectiles.splice(i,1);
      }
    }

    // Enemy Projectiles
    for(let i=this.enemyProjectiles.length-1; i>=0; i--){
      const ep=this.enemyProjectiles[i];
      ep.update(this.player);
      if(ep.life<=0) this.enemyProjectiles.splice(i,1);
    }

    // Camera (smooth lerp, clamped)
    const tx=this.player.x-this.width*0.4;
    this.camera.x+=(tx-this.camera.x)*0.1;
    if(this.camera.x<0)this.camera.x=0;
    if(this.camera.x>this.levelWidth-this.width)this.camera.x=this.levelWidth-this.width;

    if(this.shakeTimer>0){this.shakeTimer--;if(this.shakeTimer===0)this.shakeIntensity=0;}

    for(const e of this.enemies)e.update(this.player);
    for(const v of this.villagers)v.update(this.player);
    for(const a of this.altars)a.update(this.player);
    for(const s of this.spikes)s.update(this.player);
    for(const g of this.gems_items)g.update(this.player);
    for(const cp of this.checkpoints)cp.update(this.player);
    for(const st of this.stalactites)st.update(this.player);
    for(const ch of this.chests)ch.update(this.player);
    for(const pot of this.potions)pot.update(this.player);

    // Floating text update
    for(let i=this.floatingTexts.length-1; i>=0; i--){
      this.floatingTexts[i].update();
      if(this.floatingTexts[i].life<=0) this.floatingTexts.splice(i,1);
    }

    // Arena hazards (L3 floor spikes)
    if(this.currentLevel===3){
      for(const h of this.arenaHazards){
        h.timer++;
        if(!h.active&&h.timer>=h.interval){h.timer=0;h.active=true;setTimeout(()=>h.active=false,h.duration*(1000/60));}
        if(h.active){
          if(this.player.x<h.x+h.w&&this.player.x+this.player.width>h.x&&this.player.y+this.player.height>h.y&&this.player.y<h.y+16)
            this.player.takeDamage(25,'spike');
        }
      }
    }

    if(this.boss){
      this.boss.update(this.player);
      for(const orb of this.holyOrbs){
        if(!orb.collected&&Math.hypot(orb.x-(this.player.x+this.player.width/2),orb.y-(this.player.y+this.player.height/2))<35){
          orb.collected=true;this.spawnSparks(orb.x,orb.y,'#38bdf8',20);sounds.cureVillager();
          const rem=this.holyOrbs.filter(o=>!o.collected).length;
          if(rem===0){this.boss.shieldActive=false;this.showBanner('BARRIER SHATTERED!','Strike the King now!');sounds.altarIgnite();}
          else this.showBanner('HOLY ORB FOUND!',`${rem} more needed to break barrier!`);
        }
      }
    }

    // Exit door
    if(this.exitDoor.active&&this.player.x+this.player.width>this.exitDoor.x&&this.player.x<this.exitDoor.x+this.exitDoor.w&&this.player.y+this.player.height>this.exitDoor.y)
      this.triggerLevelComplete();

    // Pitfall
    if(this.player.y>550){
      this.player.takeDamage(25);
      if(this.lastCpX!==null){this.player.x=this.lastCpX;this.player.y=this.lastCpY;}
      else{this.player.x=Math.max(60,this.player.x-200);this.player.y=300;}
      this.player.vy=0;this.player.vx=0;
    }

    for(let i=this.particles.length-1;i>=0;i--){this.particles[i].update();if(this.particles[i].life<=0)this.particles.splice(i,1);}
    this.updateHUD();
  }

  render(){
    this.ctx.clearRect(0,0,this.width,this.height);
    let sx=0,sy=0;
    if(this.shakeTimer>0){sx=(Math.random()-0.5)*this.shakeIntensity;sy=(Math.random()-0.5)*this.shakeIntensity;}
    this.ctx.save();this.ctx.translate(sx-this.camera.x,sy);
    this._drawBG();this._drawPlatforms();this._drawExit();
    for(const cp of this.checkpoints)cp.draw(this.ctx);
    for(const s of this.spikes)s.draw(this.ctx);
    for(const g of this.gems_items)g.draw(this.ctx);
    for(const ch of this.chests)ch.draw(this.ctx);
    for(const pot of this.potions)pot.draw(this.ctx);
    for(const v of this.villagers)v.draw(this.ctx);
    for(const a of this.altars)a.draw(this.ctx);
    for(const orb of this.holyOrbs){if(!orb.collected){this.ctx.save();this.ctx.fillStyle='#38bdf8';this.ctx.shadowColor='#67e8f9';this.ctx.shadowBlur=18;this.ctx.beginPath();this.ctx.arc(orb.x,orb.y+Math.sin(Date.now()*0.006)*4,10,0,Math.PI*2);this.ctx.fill();this.ctx.restore();}}
    for(const st of this.stalactites)st.draw(this.ctx);
    if(this.currentLevel===3)this._drawArenaHazards();
    for(const pb of this.playerProjectiles)pb.draw(this.ctx);
    for(const ep of this.enemyProjectiles)ep.draw(this.ctx);
    for(const e of this.enemies)e.draw(this.ctx);
    if(this.boss)this.boss.draw(this.ctx);
    this.player.draw(this.ctx);
    for(const p of this.particles)p.draw(this.ctx);
    for(const ft of this.floatingTexts)ft.draw(this.ctx);
    if(this.currentLevel===2)this._drawDarkness();
    if(this.activePrompt){this.ctx.save();this.ctx.font='700 13px Outfit';this.ctx.fillStyle='#fef08a';this.ctx.shadowColor='#000';this.ctx.shadowBlur=8;this.ctx.textAlign='center';this.ctx.fillText(this.activePrompt,this.player.x+this.player.width/2,this.player.y-14);this.ctx.restore();}
    this.ctx.restore();
  }

  _drawArenaHazards(){
    for(const h of this.arenaHazards){
      if(h.active){
        this.ctx.save();this.ctx.fillStyle='#ef4444';this.ctx.shadowColor='#f43f5e';this.ctx.shadowBlur=12;
        for(let i=0;i<4;i++){const sx=h.x+i*16;this.ctx.beginPath();this.ctx.moveTo(sx+2,h.y+16);this.ctx.lineTo(sx+8,h.y);this.ctx.lineTo(sx+14,h.y+16);this.ctx.closePath();this.ctx.fill();}
        this.ctx.restore();
      } else if(h.timer>h.interval-45){
        const al=((h.timer-(h.interval-45))/45)*0.5;
        this.ctx.save();this.ctx.globalAlpha=al;this.ctx.fillStyle='#ef4444';this.ctx.fillRect(h.x,h.y,h.w,4);this.ctx.restore();
      }
    }
  }

  _drawBG(){
    const cam=this.camera.x;
    if(this.currentLevel===1){
      const gr=this.ctx.createLinearGradient(0,0,0,540);gr.addColorStop(0,'#0c071e');gr.addColorStop(0.6,'#1e1138');gr.addColorStop(1,'#080410');
      this.ctx.fillStyle=gr;this.ctx.fillRect(cam,0,this.width,540);
      this.ctx.save();this.ctx.fillStyle='#fbcfe8';this.ctx.shadowColor='#c084fc';this.ctx.shadowBlur=40;this.ctx.beginPath();this.ctx.arc(cam+760,110,48,0,Math.PI*2);this.ctx.fill();this.ctx.restore();
      this.ctx.fillStyle='#160b29';for(let i=0;i<7;i++){const mx=i*440-(cam*0.2);this.ctx.beginPath();this.ctx.moveTo(mx,440);this.ctx.lineTo(mx+220,240);this.ctx.lineTo(mx+440,440);this.ctx.fill();}
      this.ctx.fillStyle='#1b1033';for(let i=0;i<9;i++){const hx=i*360-(cam*0.5);this.ctx.fillRect(hx,320,90,120);this.ctx.beginPath();this.ctx.moveTo(hx-10,320);this.ctx.lineTo(hx+45,270);this.ctx.lineTo(hx+100,320);this.ctx.fill();}
    } else if(this.currentLevel===2){
      this.ctx.fillStyle='#08050d';this.ctx.fillRect(cam,0,this.width,540);
      this.ctx.fillStyle='#0e0818';this.ctx.fillRect(cam,0,this.width,50);
      this.ctx.fillStyle='#140c22';for(let i=0;i<11;i++){const px=i*280-(cam*0.3);this.ctx.fillRect(px,60,36,400);this.ctx.fillRect(px-10,50,56,20);}
    } else {
      const gr=this.ctx.createLinearGradient(0,0,0,540);gr.addColorStop(0,'#1a0520');gr.addColorStop(0.7,'#2a0a2f');gr.addColorStop(1,'#0b020d');
      this.ctx.fillStyle=gr;this.ctx.fillRect(0,0,this.levelWidth,540);
      this.ctx.save();this.ctx.fillStyle='#3b0764';this.ctx.shadowColor='#c084fc';this.ctx.shadowBlur=30;this.ctx.beginPath();this.ctx.arc(520,140,80,Math.PI,0);this.ctx.lineTo(600,260);this.ctx.lineTo(440,260);this.ctx.closePath();this.ctx.fill();this.ctx.restore();
      this.ctx.fillStyle='#180720';this.ctx.fillRect(780,260,80,190);this.ctx.beginPath();this.ctx.moveTo(760,260);this.ctx.lineTo(820,210);this.ctx.lineTo(880,260);this.ctx.fill();
    }
  }

  _drawPlatforms(){
    const all=[...this.platforms,...this.movingPlatforms];
    for(const p of all){
      if(p.w<=0)continue;
      const isMove=this.movingPlatforms.includes(p);
      let dx=p.x,alpha=1;
      if(p.type==='crumble'&&p.crumbling){dx+=(Math.random()-0.5)*3;alpha=Math.max(0.2,p.crumbleTimer/90);}
      this.ctx.save();this.ctx.globalAlpha=alpha;
      this.ctx.fillStyle=p.type==='crumble'?'#2d1a10':isMove?'#1e2d3e':'#1e162e';
      this.ctx.fillRect(dx,p.y,p.w,p.h);
      this.ctx.fillStyle=p.type==='crumble'?'#a16207':isMove?'#38bdf8':this.currentLevel===2?'#3b2554':'#6b21a8';
      this.ctx.fillRect(dx,p.y,p.w,4);
      if(isMove){this.ctx.fillStyle='rgba(56,189,248,0.7)';this.ctx.font='11px sans-serif';this.ctx.textAlign='center';this.ctx.fillText('⟷',dx+p.w/2,p.y+14);}
      this.ctx.fillStyle='rgba(192,132,252,0.15)';for(let rx=dx+20;rx<dx+p.w-20;rx+=50)this.ctx.fillRect(rx,p.y+7,12,2);
      this.ctx.restore();
    }
  }

  _drawExit(){
    const d=this.exitDoor;this.ctx.save();this.ctx.fillStyle='#1f1338';this.ctx.fillRect(d.x,d.y,d.w,d.h);
    if(d.active){
      this.ctx.fillStyle='#fbbf24';this.ctx.shadowColor='#f59e0b';this.ctx.shadowBlur=24+Math.sin(Date.now()*0.01)*6;this.ctx.fillRect(d.x+4,d.y+4,d.w-8,d.h-8);
      this.ctx.fillStyle='#ffffff';this.ctx.font='bold 11px Cinzel';this.ctx.textAlign='center';this.ctx.shadowBlur=0;this.ctx.fillText('ENTER',d.x+d.w/2,d.y+d.h/2);
    } else {
      this.ctx.strokeStyle='#475569';this.ctx.lineWidth=3;this.ctx.strokeRect(d.x,d.y,d.w,d.h);
      this.ctx.strokeStyle='#9333ea';this.ctx.beginPath();this.ctx.moveTo(d.x,d.y);this.ctx.lineTo(d.x+d.w,d.y+d.h);this.ctx.moveTo(d.x+d.w,d.y);this.ctx.lineTo(d.x,d.y+d.h);this.ctx.stroke();
    }
    this.ctx.restore();
  }

  _drawDarkness(){
    const px=this.player.x+this.player.width/2,py=this.player.y+this.player.height/2;
    let lr=160;
    for(const a of this.altars){if(a.lit&&Math.hypot(a.x-this.player.x,a.y-this.player.y)<250)lr=Math.min(250,lr+40);}
    const dg=this.ctx.createRadialGradient(px,py,40,px,py,lr);
    dg.addColorStop(0,'rgba(0,0,0,0)');dg.addColorStop(0.6,'rgba(6,3,12,0.72)');dg.addColorStop(1,'rgba(4,2,8,0.97)');
    this.ctx.save();this.ctx.fillStyle=dg;this.ctx.fillRect(this.camera.x,0,this.width,this.height);this.ctx.restore();
  }
}

let game;
window.addEventListener('DOMContentLoaded', () => {
  game = new GameEngine();
});

// Register Service Worker for PWA (Offline & Mobile App Installation)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('ServiceWorker registration error:', err);
    });
  });
}
