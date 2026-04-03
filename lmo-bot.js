(function () {
    "use strict";

    if (window._tlmBotLoaded) {
        window._tlmBot?.stop();
        document.getElementById('tlm-gui')?.remove();
    }
    window._tlmBotLoaded = true;

    const config = {
        loopSpeed: 10,
        adventureInterval: 10,
        autoCraft: true,
        autoBattle: true,
        autoAdventure: true,
        clickDragon: true,
        lang: 'en',
    };

    const i18n = {
        th: {
            title: '🐉 LMO Auto-Bot',
            start: '▶ เริ่ม', stop: '■ หยุด',
            features: 'ฟีเจอร์', stats: 'สถิติ',
            running: 'กำลังทำงาน', offline: 'ออฟไลน์',
            uptime: '⏱ เวลาทำงาน',
            adventure: '⚡ ผจญภัยอัตโนมัติ',
            craft: '🔨 สร้างอัตโนมัติ',
            battle: '⚔️ การต่อสู้อัตโนมัติ',
            dragon: '🐲 กดมังกรอัตโนมัติ',
            sAdv: 'ผจญภัย', sCraft: 'สร้าง', sBattle: 'ต่อสู้',
            sDragon: 'กดมังกร', sArrows: 'ลูกศร', sPopups: 'ไปต่อ',
            btnAdventure: 'ผจญภัย', btnCraft: 'สร้าง',
            btnBattle: 'การต่อสู้', btnContinue: 'ไปต่อ',
        },
        en: {
            title: '🐉 LMO Auto-Bot',
            start: '▶ Start', stop: '■ Stop',
            features: 'Features', stats: 'Stats',
            running: 'Running', offline: 'Offline',
            uptime: '⏱ Uptime',
            adventure: '⚡ Auto Adventure',
            craft: '🔨 Auto Craft',
            battle: '⚔️ Auto Battle',
            dragon: '🐲 Auto Dragon',
            sAdv: 'Adventure', sCraft: 'Craft', sBattle: 'Battle',
            sDragon: 'Dragon', sArrows: 'Arrows', sPopups: 'Continue',
            btnAdventure: 'Adventure', btnCraft: 'Craft',
            btnBattle: 'Battle', btnContinue: 'continue',
        },
    };

    const t = () => i18n[config.lang];

    const state = {
        active: false,
        timer: null,
        advTimer: null,
        uptimeStart: null,      // เวลาเริ่มทำงาน
        totalUptime: 0,         // สะสม ms (กรณีหยุดแล้วเริ่มใหม่)
        isPlayingSequence: false,
        shieldBotRunning: false,
        shieldBotRaf: null,
        shieldHistory: new WeakMap(),
        stats: {
            dragonClicks: 0, sequencesSolved: 0, targetsSniped: 0,
            tripletsMatched: 0, popupsCleared: 0, shieldBlocks: 0,
            adventureClicks: 0, craftClicks: 0, battleClicks: 0,
        },
    };

    function formatUptime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const d = Math.floor(totalSec / 86400);
        const h = Math.floor((totalSec % 86400) / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }

    function getUptime() {
        if (!state.uptimeStart) return state.totalUptime;
        return state.totalUptime + (Date.now() - state.uptimeStart);
    }

    const utils = {
        simulateKeyPress: (key) => {
            const map = { ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39 };
            ['keydown', 'keyup'].forEach(type =>
                document.dispatchEvent(new KeyboardEvent(type, { key, code: key, keyCode: map[key], bubbles: true }))
            );
        },
        reactClick: (el) => {
            ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(t =>
                el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }))
            );
        },
        getCenter: (el) => {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
        },
        dispatchMouseMove: (el, clientX, clientY) => {
            const ev = new MouseEvent('mousemove', { bubbles: true, cancelable: true, view: window, clientX, clientY, screenX: clientX, screenY: clientY });
            [el, document, window].forEach(t => t.dispatchEvent(ev));
        },
    };

    function findBtn(name) {
        return Array.from(document.querySelectorAll('.button__65fca, .button__8128e, [role="button"]'))
            .find(el => {
                const txt = (el.textContent || '').trim();
                const disabled = el.className.includes('disabled') || el.disabled || el.getAttribute('aria-disabled') === 'true';
                return txt.includes(name) && !disabled && el.offsetParent !== null;
            });
    }

    // ======= ARROWS =======
    function handleArrowSequence() {
        if (state.isPlayingSequence) return;
        const container = document.querySelector('[class*="sequences"]');
        if (!container) return;
        let seq = [];
        const imgs = Array.from(container.querySelectorAll('img[alt^="Arrow"]'));
        if (imgs.length > 0) {
            seq = imgs.map(img => img.getAttribute('alt'));
        } else {
            Array.from(container.children).forEach(el => {
                const style = el.getAttribute('style') || '';
                const cls = el.className || '';
                const inner = el.innerHTML.toLowerCase();
                const match = style.match(/rotate\(([-\d.]+)deg\)/);
                if (match) {
                    const deg = ((parseFloat(match[1]) % 360) + 360) % 360;
                    if (deg < 45 || deg >= 315) seq.push('ArrowUp');
                    else if (deg >= 45 && deg < 135) seq.push('ArrowRight');
                    else if (deg >= 135 && deg < 225) seq.push('ArrowDown');
                    else seq.push('ArrowLeft');
                    return;
                }
                if (cls.includes('up') || inner.includes('up')) seq.push('ArrowUp');
                else if (cls.includes('down') || inner.includes('down')) seq.push('ArrowDown');
                else if (cls.includes('left') || inner.includes('left')) seq.push('ArrowLeft');
                else if (cls.includes('right') || inner.includes('right')) seq.push('ArrowRight');
            });
        }
        if (seq.length === 0) return;
        state.isPlayingSequence = true;
        seq.forEach((dir, i) => setTimeout(() => utils.simulateKeyPress(dir), i * 200));
        setTimeout(() => { state.isPlayingSequence = false; state.stats.sequencesSolved++; }, seq.length * 200 + 800);
    }

    // ======= 3x3 GRID =======
    function handleTripletGrid() {
        const items = Array.from(document.querySelectorAll("[class*='gridItem']"))
            .filter(item => !item.className.toLowerCase().includes('matched') && item.style.opacity !== '0');
        if (!items.length) return;
        const groups = {};
        items.forEach(item => {
            const svg = item.querySelector('svg');
            if (!svg) return;
            const sig = Array.from(svg.querySelectorAll('path')).map(p => p.getAttribute('d')).join('') + svg.getAttribute('viewBox');
            if (!groups[sig]) groups[sig] = [];
            groups[sig].push(item);
        });
        for (let sig in groups) {
            if (groups[sig].length >= 3) {
                groups[sig].slice(0, 3).forEach((el, i) => setTimeout(() => utils.reactClick(el), i * 100));
                state.stats.tripletsMatched++;
                return;
            }
        }
    }

    // ======= TARGETS =======
    function handleBattleTargets() {
        document.querySelectorAll('img[alt="target"]').forEach(t => { utils.reactClick(t); state.stats.targetsSniped++; });
    }

    // ======= SHIELD =======
    function stopBattleShield() {
        if (state.shieldBotRaf) { cancelAnimationFrame(state.shieldBotRaf); state.shieldBotRaf = null; }
        state.shieldBotRunning = false;
        state.shieldHistory = new WeakMap();
    }

    function handleBattleShield() {
        if (state.shieldBotRunning) return;
        state.shieldBotRunning = true;
        state.shieldHistory = new WeakMap();
        const getGame = () => document.querySelector('div[class^="game__"]');
        const getShield = () => document.querySelector('img[class^="shield_"]');
        const getProjectiles = () => [...document.querySelectorAll('img[class^="projectile_"]')].filter(e => e.isConnected);
        function loop() {
            if (!state.active || !state.shieldBotRunning) { stopBattleShield(); return; }
            const game = getGame(), shield = getShield();
            if (!game || !shield) { stopBattleShield(); return; }
            const projectiles = getProjectiles();
            const now = performance.now();
            for (const p of projectiles) {
                const rect = p.getBoundingClientRect();
                const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
                const prev = state.shieldHistory.get(p);
                if (!prev) { state.shieldHistory.set(p, { x, y, t: now, vx: 0, vy: 0 }); continue; }
                const dt = Math.max((now - prev.t) / 1000, 0.0001);
                state.shieldHistory.set(p, { x, y, t: now, vx: (x - prev.x) / dt, vy: (y - prev.y) / dt });
            }
            const sc = utils.getCenter(shield);
            let best = null, bestT = Infinity;
            for (const p of projectiles) {
                const s = state.shieldHistory.get(p);
                if (!s || s.y > sc.y || s.vy <= 0) continue;
                const tts = (sc.y - s.y) / s.vy;
                if (!Number.isFinite(tts) || tts < 0 || tts >= bestT) continue;
                bestT = tts; best = { predictedX: s.x + s.vx * tts, predictedY: sc.y };
            }
            if (best) { utils.dispatchMouseMove(game, best.predictedX, best.predictedY); state.stats.shieldBlocks++; }
            state.shieldBotRaf = requestAnimationFrame(loop);
        }
        loop();
    }

    // ======= POPUP =======
    function handlePopups() {
        const continueWrapper = document.querySelector('[class*="continueButtonWrapper"] *');
        if (continueWrapper && continueWrapper.offsetParent !== null) {
            continueWrapper.click();
            state.stats.popupsCleared++;
            return true;
        }
        const dismiss = Array.from(document.querySelectorAll('[role="button"], .button__65fca, .button__8128e'))
            .find(el => {
                if (el.offsetParent === null) return false;
                const txt = (el.textContent || '').toLowerCase();
                return (txt.includes(t().btnContinue) || txt.includes('go back') || txt.includes('okay') || txt.includes('close') || txt.includes('กลับ') || txt.includes('back'))
                    && !el.className.includes('disabled');
            });
        if (dismiss) { utils.reactClick(dismiss); state.stats.popupsCleared++; return true; }
        return false;
    }

    // ======= ADVENTURE LOOP =======
    function startAdventureLoop() {
        if (state.advTimer) clearInterval(state.advTimer);
        state.advTimer = setInterval(() => {
            if (!state.active || !config.autoAdventure) return;
            const adv = findBtn(t().btnAdventure) || findBtn('Adventure') || findBtn('ผจญภัย');
            if (adv) { utils.reactClick(adv); state.stats.adventureClicks++; }
        }, config.adventureInterval);
    }

    // ======= MAIN LOOP =======
    function mainLoop() {
        if (handlePopups()) return;
        if (config.clickDragon) {
            const d = document.querySelector('.dragonClickable__8e80e') ||
                document.querySelector('img[alt="Grass Toucher"]') ||
                document.querySelector('img.dragon_b6b008');
            if (d) { utils.reactClick(d); state.stats.dragonClicks++; }
        }
        if (document.querySelector('[class*="sequences"]')) {
            stopBattleShield();
            if (config.autoCraft) handleArrowSequence();
            return;
        }
        if (document.querySelector("[class*='gridItem']")) {
            stopBattleShield();
            if (config.autoBattle) handleTripletGrid();
            return;
        }
        if (document.querySelector('img[class*="shield_"]')) {
            if (config.autoBattle) handleBattleShield();
            return;
        }
        if (document.querySelector('img[alt="target"]')) {
            stopBattleShield();
            if (config.autoBattle) handleBattleTargets();
            return;
        }
        stopBattleShield();
        if (config.autoCraft) {
            const craft = findBtn(t().btnCraft) || findBtn('Craft') || findBtn('สร้าง');
            if (craft) { utils.reactClick(craft); state.stats.craftClicks++; return; }
        }
        if (config.autoBattle) {
            const battle = findBtn(t().btnBattle) || findBtn('Battle') || findBtn('การต่อสู้');
            if (battle) { utils.reactClick(battle); state.stats.battleClicks++; return; }
        }
    }

    // ======= GUI =======
    function updateLang() {
        const l = t();
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('tlm-title', l.title);
        set('tlm-start', l.start);
        set('tlm-stop', l.stop);
        set('tlm-feat-title', l.features);
        set('tlm-stat-title', l.stats);
        set('tlm-uptime-lbl', l.uptime);
        set('tlm-lbl-autoAdventure', l.adventure);
        set('tlm-lbl-autoCraft', l.craft);
        set('tlm-lbl-autoBattle', l.battle);
        set('tlm-lbl-clickDragon', l.dragon);
        set('s-adv-lbl', l.sAdv);
        set('s-craft-lbl', l.sCraft);
        set('s-battle-lbl', l.sBattle);
        set('s-dragon-lbl', l.sDragon);
        set('s-arrows-lbl', l.sArrows);
        set('s-popups-lbl', l.sPopups);
        const statusEl = document.getElementById('tlm-status');
        if (statusEl) statusEl.textContent = state.active ? l.running : l.offline;
    }

    function createGUI() {
        if (document.getElementById('tlm-gui')) document.getElementById('tlm-gui').remove();

        const style = document.createElement('style');
        style.innerHTML = `
            #tlm-wrap { position:fixed; top:20px; right:20px; width:300px; z-index:999999; font-family:'Segoe UI',sans-serif; font-size:13px; color:#e0e0e0; }
            #tlm-box { background:rgba(20,20,30,0.97); border:1px solid rgba(255,255,255,0.1); border-radius:10px; box-shadow:0 8px 32px rgba(0,0,0,0.8); overflow:hidden; }
            #tlm-header { background:linear-gradient(135deg,#1a1a2e,#16213e); padding:10px 14px; cursor:move; display:flex; justify-content:space-between; align-items:center; user-select:none; border-bottom:1px solid rgba(255,255,255,0.08); }
            #tlm-header span { font-weight:700; font-size:14px; letter-spacing:.5px; }
            #tlm-body { padding:12px; }
            .tlm-row { display:flex; gap:8px; margin-bottom:10px; }
            .tlm-btn { flex:1; border:none; padding:7px 0; border-radius:6px; cursor:pointer; font-weight:700; font-size:13px; color:#fff; transition:all .2s; }
            .tlm-btn:hover { filter:brightness(1.2); transform:translateY(-1px); }
            .tlm-btn.green { background:linear-gradient(135deg,#1db954,#17a045); }
            .tlm-btn.red { background:linear-gradient(135deg,#e74c3c,#c0392b); }
            .tlm-btn.lang { background:linear-gradient(135deg,#5865f2,#4752c4); font-size:12px; flex:0 0 auto; padding:7px 12px; }
            .tlm-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
            .tlm-toggle-row:last-child { border:none; }
            .tlm-switch { position:relative; width:36px; height:20px; flex-shrink:0; }
            .tlm-switch input { opacity:0; width:0; height:0; }
            .tlm-slider { position:absolute; inset:0; background:#333; border-radius:20px; cursor:pointer; transition:.3s; }
            .tlm-slider:before { content:''; position:absolute; width:14px; height:14px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:.3s; }
            input:checked + .tlm-slider { background:#1db954; }
            input:checked + .tlm-slider:before { transform:translateX(16px); }
            .tlm-stats { display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-top:10px; }
            .tlm-stat { background:rgba(255,255,255,0.05); border-radius:6px; padding:6px 8px; }
            .tlm-stat-val { font-size:16px; font-weight:700; color:#1db954; }
            .tlm-stat-lbl { font-size:10px; color:#888; margin-top:1px; }
            #tlm-status { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700; }
            #tlm-status.on { background:#1db954; color:#000; }
            #tlm-status.off { background:#e74c3c; color:#fff; }
            .tlm-section-title { font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px; margin:10px 0 6px; }
            #tlm-collapse { cursor:pointer; color:#666; font-size:18px; line-height:1; padding:0 2px; }
            #tlm-uptime-box { background:rgba(29,185,84,0.1); border:1px solid rgba(29,185,84,0.3); border-radius:6px; padding:6px 10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; }
            #tlm-uptime-val { font-size:15px; font-weight:700; color:#1db954; font-family:monospace; }
            #tlm-uptime-lbl { font-size:11px; color:#888; }
        `;
        document.head.appendChild(style);

        const l = t();
        const gui = document.createElement('div');
        gui.id = 'tlm-gui';
        gui.innerHTML = `
        <div id="tlm-wrap">
          <div id="tlm-box">
            <div id="tlm-header">
              <div style="display:flex;flex-direction:column;gap:2px">
                <span id="tlm-title">${l.title}</span>
                <span id="tlm-uptime-header" style="font-size:11px;font-weight:400;color:#1db954;font-family:monospace;">⏱ 0s</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span id="tlm-status" class="off">${l.offline}</span>
                <span id="tlm-collapse">−</span>
              </div>
            </div>
            <div id="tlm-body">
              <div class="tlm-row">
                <button class="tlm-btn green" id="tlm-start">${l.start}</button>
                <button class="tlm-btn red" id="tlm-stop">${l.stop}</button>
                <button class="tlm-btn lang" id="tlm-lang">🌐 EN</button>
              </div>

              <div class="tlm-section-title" id="tlm-feat-title">${l.features}</div>
              <div>
                ${[
                    ['autoAdventure', l.adventure],
                    ['autoCraft', l.craft],
                    ['autoBattle', l.battle],
                    ['clickDragon', l.dragon],
                ].map(([key, label]) => `
                  <div class="tlm-toggle-row">
                    <span id="tlm-lbl-${key}">${label}</span>
                    <label class="tlm-switch">
                      <input type="checkbox" id="cb-${key}" ${config[key] ? 'checked' : ''}>
                      <span class="tlm-slider"></span>
                    </label>
                  </div>
                `).join('')}
              </div>
              <div class="tlm-section-title" id="tlm-stat-title">${l.stats}</div>
              <div class="tlm-stats">
                <div class="tlm-stat"><div class="tlm-stat-val" id="s-adv">0</div><div class="tlm-stat-lbl" id="s-adv-lbl">${l.sAdv}</div></div>
                <div class="tlm-stat"><div class="tlm-stat-val" id="s-craft">0</div><div class="tlm-stat-lbl" id="s-craft-lbl">${l.sCraft}</div></div>
                <div class="tlm-stat"><div class="tlm-stat-val" id="s-battle">0</div><div class="tlm-stat-lbl" id="s-battle-lbl">${l.sBattle}</div></div>
                <div class="tlm-stat"><div class="tlm-stat-val" id="s-dragon">0</div><div class="tlm-stat-lbl" id="s-dragon-lbl">${l.sDragon}</div></div>
                <div class="tlm-stat"><div class="tlm-stat-val" id="s-arrows">0</div><div class="tlm-stat-lbl" id="s-arrows-lbl">${l.sArrows}</div></div>
                <div class="tlm-stat"><div class="tlm-stat-val" id="s-popups">0</div><div class="tlm-stat-lbl" id="s-popups-lbl">${l.sPopups}</div></div>
              </div>
            </div>
          </div>
        </div>`;
        document.body.appendChild(gui);

        // Drag
        let drag = false, ox, oy;
        const wrap = document.getElementById('tlm-wrap');
        document.getElementById('tlm-header').addEventListener('mousedown', e => {
            if (e.target.closest('button, input, label, #tlm-collapse')) return;
            drag = true;
            const rect = wrap.getBoundingClientRect();
            ox = e.clientX - rect.left; oy = e.clientY - rect.top;
            wrap.style.right = 'auto';
            wrap.style.left = rect.left + 'px';
            wrap.style.top = rect.top + 'px';
            e.preventDefault();
        });
        window.addEventListener('mousemove', e => { if (drag) { wrap.style.left = (e.clientX - ox) + 'px'; wrap.style.top = (e.clientY - oy) + 'px'; } });
        window.addEventListener('mouseup', () => drag = false);

        // Collapse
        let collapsed = false;
        document.getElementById('tlm-collapse').onclick = () => {
            collapsed = !collapsed;
            document.getElementById('tlm-body').style.display = collapsed ? 'none' : 'block';
            document.getElementById('tlm-collapse').textContent = collapsed ? '+' : '−';
        };

        // Lang
        document.getElementById('tlm-lang').onclick = () => {
            config.lang = config.lang === 'th' ? 'en' : 'th';
            document.getElementById('tlm-lang').textContent = config.lang === 'th' ? '🌐 EN' : '🌐 ไทย';
            updateLang();
        };

        document.getElementById('tlm-start').onclick = () => window._tlmBot.start();
        document.getElementById('tlm-stop').onclick = () => window._tlmBot.stop();

        ['autoAdventure', 'autoCraft', 'autoBattle', 'clickDragon'].forEach(key => {
            document.getElementById('cb-' + key).onchange = e => {
                config[key] = e.target.checked;
                if (key === 'autoAdventure') {
                    if (config[key] && state.active) startAdventureLoop();
                    else { clearInterval(state.advTimer); state.advTimer = null; }
                }
            };
        });

        // Stats + uptime update
        setInterval(() => {
            const st = state.stats;
            const l = t();
            const statusEl = document.getElementById('tlm-status');
            if (statusEl) { statusEl.textContent = state.active ? l.running : l.offline; statusEl.className = state.active ? 'on' : 'off'; }

            const uptimeEl = document.getElementById('tlm-uptime-header');
            if (uptimeEl) uptimeEl.textContent = 'online ' + formatUptime(getUptime());

            const map = { 's-adv': st.adventureClicks, 's-craft': st.craftClicks, 's-battle': st.battleClicks, 's-dragon': st.dragonClicks, 's-arrows': st.sequencesSolved, 's-popups': st.popupsCleared };
            for (const [id, val] of Object.entries(map)) { const el = document.getElementById(id); if (el) el.textContent = val.toLocaleString(); }
        }, 500);
    }

    window._tlmBot = {
        start() {
            if (state.active) return;
            state.active = true;
            state.uptimeStart = Date.now();
            state.timer = setInterval(mainLoop, config.loopSpeed);
            startAdventureLoop();
        },
        stop() {
            if (state.uptimeStart) {
                state.totalUptime += Date.now() - state.uptimeStart;
                state.uptimeStart = null;
            }
            clearInterval(state.timer); clearInterval(state.advTimer);
            stopBattleShield(); state.active = false; state.timer = null; state.advTimer = null;
        },
        config, state,
    };

    createGUI();
    window._tlmBot.start();
    console.log('%c✅ LMO Bot โหลดแล้ว! / Loaded!', 'color:lime;font-size:14px;font-weight:bold');
})();
