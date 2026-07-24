/* =====================================================
   FORJE·studio — core/render.js
   Tokens → arte. Renderiza design estático (template) ou
   preview da cena selecionada (motion), e ajusta o fit.
   ===================================================== */
(function(F){
  const $ = s=>document.querySelector(s);
  const art = () => $('#art');

  /* vars inline da arte (tokens+fontes+overrides) para um índice qualquer
     do modo atual — usada pelo render principal e pelas miniaturas do
     navegador de slides/cenas (F.ui.syncNav) */
  F.artVarsFor = function(idx){
    const b = F.state.brand, fmt = F.FORMATS[F.state.format];
    const u = Math.min(fmt.w, fmt.h)/100;
    /* pool de fontes display: o seed escolhe uma por arte/slide */
    const pool = [b.fontH, ...(b.fontPool||[]).filter(f=>f!==b.fontH)];
    const pi = Math.floor(F.rngOf((F.seedOf ? F.seedOf('type') : F.state.seed)*13 + idx*7)()*pool.length);
    /* paleta: variante brand-first quando o eixo divergiu do mestre
       (eixo null = identidade → projetos existentes não mudam, P1).
       Variante escolhida por PROJETO (sem idx): o carrossel inteiro
       mantém a mesma leitura de marca. Overrides por arte (artTokens)
       são aplicados DEPOIS — a escolha explícita do usuário vence. */
    let B = b;
    const pSeed = (F.state.seeds||{}).palette;
    if(pSeed != null && F.paletteVariant){
      const v = F.paletteVariant(Math.floor(F.rngOf(pSeed*31 + 7)()*997), b);
      B = {...b, ...v};
    }
    const vars = {'--b-bg':B.bg,'--b-fg':B.fg,'--b-p1':B.p1,'--b-p2':B.p2,'--b-ac':B.ac,
      '--b-r':b.radius,'--u':u,'--fh':F.fontCSS(pool[pi]||b.fontH),'--fb':F.fontCSS(b.fontB),'--fm':"'IBM Plex Mono',monospace"};
    /* cores desta arte: sobrepõem os tokens da marca (fundo recolore
       véus e sobreposições, que usam color-mix com --b-bg) */
    const tk = (F.state.mode==='design' ? 'd|' : 'm|') + idx;
    const ov = (F.state.artTokens||{})[tk] || null;
    if(ov) for(const k in ov){ if(k!=='canvas') vars['--b-'+k] = ov[k]; }
    /* prancheta: fundo sólido real; véus seguem junto se 'fundo' não tiver override próprio */
    if(ov && ov.canvas && !ov.bg) vars['--b-bg'] = ov.canvas;
    let inline = `width:${fmt.w}px;height:${fmt.h}px;`;
    for(const k in vars) inline += `${k}:${vars[k]};`;
    return inline;
  };
  F.applyTokens = function(){
    F._fontCSS = null;   // fontes podem ter mudado — reembutir no próximo export
    const idx = F.state.mode==='design' ? F.state.cur : F.state.curScene;
    art().setAttribute('style', F.artVarsFor(idx));
  };

  /* zoom da prancheta: multiplicador sobre a escala de encaixe (1 = fit) */
  F.view = F.view || { z:1 };
  F.fit = function(){
    const st = $('#stage'), fmt = F.FORMATS[F.state.format];
    if(!st) return;
    /* superfície reduzida: respiro proporcional em volta + teto de escala */
    const padX = Math.max(48, st.clientWidth*0.085), padY = Math.max(40, st.clientHeight*0.085);
    const base = Math.min((st.clientWidth-padX*2)/fmt.w, (st.clientHeight-padY*2)/fmt.h, .92);
    const s = base * (F.view.z || 1);
    const w = $('#fitwrap');
    w.style.transform = `scale(${s})`;
    w.style.width = fmt.w*s+'px'; w.style.height = fmt.h*s+'px';
    w.style.transformOrigin = 'top left';
    const zl = document.getElementById('zoomLabel');
    if(zl) zl.textContent = Math.round(s*100)+'%';
  };
  F.zoomBy = function(f){
    F.view.z = Math.min(8, Math.max(.2, (F.view.z||1)*f));
    if(Math.abs(F.view.z-1) < .04) F.view.z = 1;   // ímã no encaixe
    F.fit();
  };
  F.zoomReset = function(){ F.view.z = 1; F.fit(); };

  F.render = function(replay=true){
    F.applyTokens();
    const s = F.state, el = art();
    F.stopTimeline && F.stopTimeline();
    if(s.mode === 'design'){
      const slide = s.slides[s.cur];
      const r = F.rngOf((F.seedOf ? F.seedOf('layout') : s.seed)*7919 + (F.artOff ? F.artOff(s.cur) : s.cur*101));
      /* template EFETIVO: slide.tpl (roteamento por conteúdo, fase 2.2)
         com fallback no global — projetos sem slide.tpl não mudam (P1) */
      const tplId = (slide && slide.tpl) || s.tpl;
      el.innerHTML = (F.templates.get(tplId)||F.templates.get('manifesto')).render(slide, r);
      if(F.composeHTML) el.insertAdjacentHTML('beforeend', F.composeHTML(F.editKey()));
    } else {
      /* motion: preview estático da cena selecionada */
      el.innerHTML = '';
      if(s.timeline.length){
        const layer = F.mountScene(Math.min(s.curScene, s.timeline.length-1));
        if(layer){ el.appendChild(layer); F.updateCounters(layer, 99999); }
      } else {
        el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center;color:color-mix(in srgb,var(--b-fg) 50%,transparent);font-family:var(--fm)">adicione cenas na timeline →</div>`;
      }
    }
    /* velocidade global */
    if(F.state.speed !== 1){
      el.querySelectorAll('[data-anim]').forEach(n=>{
        const cs = getComputedStyle(n);
        n.style.setProperty('--dur', (parseFloat(cs.getPropertyValue('--dur'))||.9)/F.state.speed+'s');
      });
    }
    if(F.applyEdits) F.applyEdits();     // edições manuais persistidas (design e preview de cena)
    /* replay=false NÃO pode derrubar o .play: cenas/templates escondem
       elementos pelo estado final da animação (fill both) — sem .play esses
       "fantasmas" apareceriam todos de uma vez na prancheta. O .settle
       mantém o .play e salta as animações direto ao quadro final. */
    el.classList.remove('play','settle');
    if(replay){ void el.offsetWidth; el.classList.add('play'); }
    else el.classList.add('play','settle');
    F.fit(); F.autoSave();
    if(F.ui && F.ui.syncStagebar) F.ui.syncStagebar();
  };

  F.replayMotion = function(){
    const el = art();
    el.classList.remove('play'); void el.offsetWidth; el.classList.add('play');
  };
})(window.FORMA);
