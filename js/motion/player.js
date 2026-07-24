/* =====================================================
   FORJE·studio — motion/player.js
   Compositor de timeline: reproduz as cenas em sequência
   com transições de saída, atualiza contadores e expõe
   utilidades de "time-stepping" determinístico usadas
   pelo export de vídeo (frames exatos, sem tempo real).
   ===================================================== */
(function(F){
  const art = () => document.getElementById('art');
  const EXIT_MS = 450;

  F.player = { playing:false, _tok:0 };

  /* monta o HTML de uma cena numa camada */
  F.mountScene = function(idx){
    const sc = F.state.timeline[idx]; if(!sc) return null;
    const def = F.scenes.get(sc.type); if(!def) return null;
    const layer = document.createElement('div');
    layer.className = 'scenelayer';
    if(sc.enter && sc.enter!=='none') layer.classList.add('enter-'+sc.enter);
    /* fase 1.3: rng de variação por cena, derivado do eixo de layout —
       cenas não migradas ignoram o parâmetro (retrocompatível) */
    layer.innerHTML = def.render(sc, F.sceneRng ? F.sceneRng(idx) : undefined);
    if(F.composeHTML && F.motionKey)
      layer.insertAdjacentHTML('beforeend', F.composeHTML(F.motionKey(idx)));
    if(F.applyEditsIn && F.motionKey) F.applyEditsIn(layer, F.motionKey(idx));
    return layer;
  };

  /* contadores: valor em função do tempo local da cena */
  F.updateCounters = function(layer, tLocal, durIn=1400, delay=200){
    layer.querySelectorAll('[data-count]').forEach(el=>{
      const to = +el.dataset.to || 0, suf = el.dataset.suffix || '';
      const p = Math.min(1, Math.max(0, (tLocal-delay) / durIn));
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.round(to*eased).toLocaleString('pt-BR') + (p>=1?suf:suf);
    });
  };

  F.totalDuration = () => F.state.timeline.reduce((a,s)=>a+(+s.dur||2000),0);

  /* ---------- reprodução em tempo real ---------- */
  F.playTimeline = async function(onTick){
    const s = F.state, el = art();
    if(!s.timeline.length) return;
    F.stopTimeline();
    const tok = ++F.player._tok;
    F.player.playing = true;
    el.classList.remove('settle'); el.classList.add('play');
    el.innerHTML = '';
    const total = F.totalDuration();
    let elapsed = 0;
    for(let i=0; i<s.timeline.length && F.player._tok===tok; i++){
      const sc = s.timeline[i], dur = +sc.dur || 2000;
      const layer = F.mountScene(i);
      el.appendChild(layer);
      /* a saída toca DENTRO da janela da cena (visível, igual ao export);
         a próxima cena só monta depois — entrada e saída ficam legíveis */
      const hasExit = i < s.timeline.length-1;
      const exitAt = Math.max(0, dur - EXIT_MS);
      let exited = false;
      const t0 = performance.now();
      await new Promise(res=>{
        const step = ()=>{ if(F.player._tok!==tok) return res();
          const t = performance.now()-t0;
          F.updateCounters(layer, t);
          if(hasExit && !exited && t >= exitAt){
            exited = true;
            layer.classList.add('exiting');                       // saídas de itens compostos
            const x = sc.exit || 'fade';
            if(x !== 'none') layer.classList.add('exit-'+x);      // saída da cena
          }
          if(onTick) onTick((elapsed+Math.min(t,dur))/total, i);
          if(t>=dur) return res();
          requestAnimationFrame(step); };
        step();
      });
      if(F.player._tok===tok) layer.remove();
      elapsed += dur;
    }
    if(F.player._tok===tok){ F.player.playing=false; if(onTick) onTick(1,-1); }
  };
  F.stopTimeline = function(){ F.player._tok++; F.player.playing=false; };

  /* ---------- stepping determinístico (para export) ----------
     Prepara a cena idx pausada e devolve um "seeker": seek(tLocal)
     posiciona todas as animações (entrada, loops e saída) em t. */
  F.prepScene = async function(idx){
    const el = art();
    el.classList.remove('settle'); el.classList.add('play');
    el.innerHTML = '';
    const sc = F.state.timeline[idx];
    const layer = F.mountScene(idx);
    el.appendChild(layer);
    await new Promise(r=>requestAnimationFrame(r));
    let anims = layer.getAnimations({subtree:true});
    anims.forEach(a=>{ try{a.pause();}catch(e){} });
    const dur = +sc.dur||2000, exitAt = Math.max(0, dur-EXIT_MS);
    let exiting = false, exitAnims = [];
    return {
      layer, dur,
      seek(t){
        anims.forEach(a=>{ try{a.currentTime = t;}catch(e){} });
        F.updateCounters(layer, t);
        if(t>=exitAt && !exiting && idx < F.state.timeline.length-1){
          exiting = true;
          layer.classList.add('exiting');
          if((sc.exit||'fade')!=='none') layer.classList.add('exit-'+(sc.exit||'fade'));
          exitAnims = layer.getAnimations({subtree:true}).filter(a=>!anims.includes(a));
          exitAnims.forEach(a=>{ try{a.pause();}catch(e){} });
        }
        if(exiting) exitAnims.forEach(a=>{ try{a.currentTime = t-exitAt;}catch(e){} });
      }
    };
  };
})(window.FORMA);
