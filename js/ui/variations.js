/* =====================================================
   FORJE·studio — ui/variations.js  (NOVO · Eixo 1 · 1.1)
   FOLHA DE CONTATO: overlay no palco com 12 variações
   REAIS da arte atual, geradas pelo mesmo pipeline das
   miniaturas (template+deco+compose+edições+tokens).
   - chips travam eixos: Layout · Cores · Tipografia ·
     Template (eixo travado é âncora — constante em
     todos os cards);
   - DEDUP POR COMPOSIÇÃO (Eixo 1 v2): cada card carrega
     uma assinatura direção/estrutura (F.composeSig) e a
     folha só aceita assinaturas inéditas — variações
     estruturalmente distintas por construção, nunca
     12 cards onde só o fundo muda;
   - A FOLHA NÃO TROCA DE TEMPLATE (S3.2): variar é
     explorar o espaço do design ATUAL; trocar template o
     usuário faz na aba própria. Grid Suíço permanece
     Grid Suíço em seus cards;
   - COMPOSIÇÕES GERADAS (S3.4): 1/3 dos cards vem do
     MOTOR (template Livre) — estrutura da biblioteca
     global + esquema + design system: um design NOVO,
     não uma releitura do template atual. É a resposta ao
     "12 recolorações do sticker": variar é compor outro;
   - clicar num card APLICA seeds/template e fecha; as
     edições e composições manuais permanecem — os eixos
     não entram nas chaves de edição (decisão 3.2, P6);
   - ↻ no card: aplica e reabre — refinamento por seleção;
   - "Seed novo" interno preserva o comportamento clássico
     do botão Variar (novo seed mestre, eixos recomeçam);
   - gatilhos: botão Variar do header e atalho no rodapé.
   Determinismo (P3): a folha `gen` é derivada do seed
   mestre — mesma folha ao reabrir; ↻ Mais avança a página.
   Carregar após ui/boards.js.
   ===================================================== */
(function(F){
  'use strict';
  const $ = s=>document.querySelector(s);
  F.ui = F.ui || {};
  const design = ()=>F.state.mode==='design';
  /* fase 2.2: a folha varia o template EFETIVO do slide atual —
     slide.tpl (roteado do conteúdo) com fallback no global */
  const effTpl = ()=> design()
    ? (((F.state.slides||[])[F.state.cur]||{}).tpl || F.state.tpl)
    : F.state.tpl;
  const N = 12;
  let gen = 1, building = 0, vT = null;

  const AXES = [
    {id:'layout',  lbl:'Layout'},
    {id:'palette', lbl:'Cores'},
    {id:'type',    lbl:'Tipografia'},
  ];

  /* ---------- candidatos ---------- */
  function candidates(){
    const s = F.state, L = s.seedLocks||{}, list = [];
    const idx = design() ? s.cur : s.curScene;
    const base = effTpl();
    const migrated = design() && F.MIGRATED && F.MIGRATED.indexOf(base)>=0;
    const seen = {};
    const rng = F.rngOf(s.seed*7919 + gen*104729 + 31);
    for(let j=0; j<N; j++){
      let c = null, sig = 'j'+j;
      /* migrados: até 24 tentativas por card — só aceita assinatura
         direção/estrutura inédita (dedup do compositor). Não migrados
         variam pelo próprio rng do template; template NUNCA muda. */
      /* 1/3 dos cards (posições 2,5,8,11) é COMPOSIÇÃO GERADA pelo
         motor Livre — exceto quando o Livre JÁ é o template atual */
      const genCard = design() && base!=='livre' && (j%3===2);
      for(let tries=0; tries<24; tries++){
        const cand = { seeds:{}, tpl: genCard ? 'livre' : base };
        cand.seeds.layout  = L.layout  ? ((s.seeds||{}).layout  ?? null) : 1+Math.floor(rng()*99999);
        cand.seeds.palette = L.palette ? ((s.seeds||{}).palette ?? null) : 1+Math.floor(rng()*99999);
        cand.seeds.type    = L.type    ? ((s.seeds||{}).type    ?? null) : 1+Math.floor(rng()*99999);
        c = cand;
        if((!migrated && !genCard) || L.layout) break;
        sig = F.composeSig(cand.seeds.layout ?? s.seed, idx, cand.tpl);
        if(!seen[sig]) break;
      }
      seen[sig] = 1;
      /* badge do card: direção/estrutura legível (descoberta pelo uso);
         composições geradas ganham o selo 'nova' */
      c._sig = ((migrated || c.tpl==='livre') && sig.indexOf(':')>=0)
        ? (c.tpl==='livre' && F.state.tpl!=='livre' ? 'nova · ' : '') + sig.split(':')[1] : '';
      list.push(c);
    }
    return list;
  }
  F.ui._varCandidates = candidates;        // exposto para o smoke headless

  /* empurra o candidato no estado, roda fn, restaura — mesmo padrão
     try/finally de navArtHTML/boardArtHTML (paridade com o render real) */
  function withCand(c, fn){
    const s = F.state, kSeeds = s.seeds;
    const sl = design() ? s.slides[s.cur] : null;
    const per = !!(sl && sl.tpl);                 // slide com template próprio
    const kTpl = per ? sl.tpl : s.tpl;
    try{
      s.seeds = {...(kSeeds||{}), ...c.seeds};
      if(design()){ if(per) sl.tpl = c.tpl; else s.tpl = c.tpl; }
      return fn();
    } finally { s.seeds = kSeeds; if(per) sl.tpl = kTpl; else s.tpl = kTpl; }
  }

  /* arte real do candidato (miniatura escalada, animação congelada) */
  function candArt(c, idx, k){
    return withCand(c, ()=>{
      const s = F.state, keepC = s.cur, keepS = s.curScene;
      const a = document.createElement('div');
      a.className = 'art thumbart';
      try{
        a.setAttribute('style', F.artVarsFor(idx) + `transform:scale(${k})`);
        if(design()){
          s.cur = idx;
          const r = F.rngOf(F.seedOf('layout')*7919 + F.artOff(idx));
          a.innerHTML = (F.templates.get((s.slides[idx]||{}).tpl || s.tpl)||F.templates.get('manifesto')).render(s.slides[idx], r)
                      + (F.composeHTML ? F.composeHTML(F.editKey()) : '');
          if(F.applyEditsIn) F.applyEditsIn(a, F.editKey());
        } else {
          s.curScene = idx;
          const sc = s.timeline[idx], def = sc && F.scenes.get(sc.type);
          a.innerHTML = (def ? def.render(sc, F.sceneRng ? F.sceneRng(idx) : undefined) : '')   /* fase 1.3 */
                      + (F.composeHTML ? F.composeHTML(F.motionKey(idx)) : '');
          if(F.applyEditsIn) F.applyEditsIn(a, F.motionKey(idx));
          if(F.updateCounters) F.updateCounters(a, 99999);
        }
      }catch(err){ console.warn('variação falhou:', err); }
      finally{ s.cur = keepC; s.curScene = keepS; }
      return a;
    });
  }

  /* ---------- aplicar ---------- */
  function apply(c){
    const s = F.state;
    s.seeds = {...(s.seeds||{}), ...c.seeds};
    if(design()){
      const sl = s.slides[s.cur];
      if(sl && sl.tpl) sl.tpl = c.tpl;            // roteado: muda só este slide
      else s.tpl = c.tpl;                         // legado: global, como sempre
    }
    F.render();
    if(F.ui.refreshActive) F.ui.refreshActive();
  }

  /* comportamento clássico do Variar: novo seed mestre; eixos livres
     recomeçam (null = seguem o mestre); eixos travados congelam o
     valor efetivo atual para não mudarem de aparência */
  function newMasterSeed(){
    const s = F.state, L = s.seedLocks||{};
    const frozen = {
      layout: L.layout ? F.seedOf('layout') : null,
      type:   L.type   ? F.seedOf('type')   : null,
      /* palette: null = identidade (não deriva do mestre) — congela o próprio valor */
      palette:L.palette ? ((s.seeds||{}).palette ?? null) : null,
    };
    s.seed = Math.floor(Math.random()*99999);
    s.seeds = frozen;
    F.render();
    if(F.ui.refreshActive) F.ui.refreshActive();
    buildSheet();
  }

  /* ---------- folha ---------- */
  function chipHTML(){
    const L = F.state.seedLocks||{};
    /* motion: layout de cena chega na fase 1.3; template não se aplica */
    const axes = AXES.filter(a=>design() || a.id!=='layout');
    return axes.map(a=>
      `<button class="vschip${L[a.id]?' lk':''}" data-ax="${a.id}"
        title="${L[a.id] ? 'eixo travado — mantido em todas as variações' : 'eixo livre — varia entre os cards'}">
        ${F.uiIcon(L[a.id]?'lock':'unlock')}<span>${a.lbl}</span></button>`).join('');
  }

  function card(c, j, idx, k, fmt){
    const cd = document.createElement('div');
    cd.className = 'vscard';
    cd.title = 'aplicar esta variação — edições e composições permanecem';
    const th = document.createElement('div');
    th.className = 'vsthumb';
    th.style.width  = Math.round(fmt.w*k)+'px';
    th.style.height = Math.round(fmt.h*k)+'px';
    const a = candArt(c, idx, k);
    if(a) th.appendChild(a);
    cd.appendChild(th);
    const meta = document.createElement('div');
    meta.className = 'vsmeta';
    meta.innerHTML = `<span class="n">${String(j+1).padStart(2,'0')}</span>
      ${c._sig ? `<span class="vstag alt" title="direção/estrutura da composição">${F.esc(c._sig)}</span>` : ''}
      <span style="flex:1"></span>
      <button class="vsagain" title="aplicar e variar a partir desta">↻</button>`;
    meta.querySelector('.vsagain').onclick = e=>{
      e.stopPropagation();
      apply(c); gen++; buildSheet();
      F.toast('Variação aplicada — refinando a partir dela.');
    };
    cd.onclick = ()=>{
      apply(c);
      F.ui.toggleVarSheet(false);
      F.toast('Variação aplicada — edições e composições preservadas.');
    };
    cd.appendChild(meta);
    return cd;
  }

  function buildSheet(){
    const sh = $('#varSheet'), grid = $('#vsGrid');
    if(!sh || sh.hidden || !grid) return;
    const s = F.state;
    $('#vsChips').innerHTML = chipHTML();
    $('#vsChips').querySelectorAll('.vschip').forEach(ch=>ch.onclick = ()=>{
      const L = s.seedLocks || (s.seedLocks = {});
      L[ch.dataset.ax] = !L[ch.dataset.ax];
      F.autoSave(); buildSheet();
    });
    const note = $('#vsNote');
    if(note) note.textContent = design()
      ? 'Clique num card para aplicar — suas edições e composições permanecem. Trave um eixo para mantê-lo constante.'
      : 'Variando cores e tipografia da cena atual — a profundidade estrutural de cena chega em S7.';
    grid.innerHTML = '';
    if(!design() && !s.timeline.length){
      grid.innerHTML = '<div class="note" style="border:none">Adicione cenas na aba TIMELINE para variar o motion.</div>';
      return;
    }
    const idx = design() ? s.cur : s.curScene;
    const fmt = F.FORMATS[s.format];
    const TW = Math.min(240, Math.max(140, (sh.clientWidth-64)/4 - 16));
    const k = TW/fmt.w;
    const cands = candidates();
    /* 12 artes reais: monta em lotes por frame (risco mapeado no plano) */
    const tok = ++building;
    let j = 0;
    (function batch(){
      if(building !== tok) return;
      const end = Math.min(j+4, cands.length);
      for(; j<end; j++) grid.appendChild(card(cands[j], j, idx, k, fmt));
      if(j < cands.length) requestAnimationFrame(batch);
    })();
  }

  F.ui.toggleVarSheet = function(force){
    const sh = $('#varSheet'); if(!sh) return;
    const show = force!=null ? !!force : sh.hidden;
    sh.hidden = !show;
    const fb = $('#sfVary'); if(fb) fb.classList.toggle('on', show);
    if(show){
      if(F.ui.toggleGridView) F.ui.toggleGridView(false);   // uma sobreposição por vez
      buildSheet();
    }
  };

  /* ---------- gatilhos e sincronia (wraps aditivos) ---------- */
  const _init = F.ui.init;
  F.ui.init = function(){
    _init.call(F.ui);
    const btn = $('#btnRandom');
    if(btn){
      btn.onclick = ()=>F.ui.toggleVarSheet(true);          // evolução do Variar
      btn.title = 'abrir a folha de variações';
    }
    const fb = $('#sfVary');   if(fb) fb.onclick = ()=>F.ui.toggleVarSheet();
    const cl = $('#vsClose');  if(cl) cl.onclick = ()=>F.ui.toggleVarSheet(false);
    const mo = $('#vsMore');   if(mo) mo.onclick = ()=>{ gen++; buildSheet(); };
    const sd = $('#vsSeed');   if(sd) sd.onclick = newMasterSeed;
    document.addEventListener('keydown', e=>{
      const sh = $('#varSheet');
      if(e.key==='Escape' && sh && !sh.hidden) F.ui.toggleVarSheet(false);
    });
  };
  const _render = F.render;
  F.render = function(replay){
    _render.call(F, replay);
    const sh = $('#varSheet');
    if(sh && !sh.hidden){ clearTimeout(vT); vT = setTimeout(buildSheet, 120); }
  };
})(window.FORMA);
