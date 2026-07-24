/* =====================================================
   FORJE·studio — ui/boards.js  (NOVO · aditivo)
   1) FLUXO DE PRANCHETAS: no palco, os slides/cenas se
      compõem organicamente, um abaixo do outro; scroll
      navega, clique seleciona, e a prancheta selecionada
      tem feedback visual claro (anel em brasa + selo).
   2) TELA DE GRADE: visão do palco em grid com todas as
      pranchetas — selecionar, reordenar, adicionar e
      remover em uma tela dedicada (botão no rodapé).
   3) RODAPÉ DE ATALHOS: escala, cor, camada, travar/
      destravar, remover, desfazer, zoom e transição para
      a grade — discreto, ícone + rótulo, contraste na
      interação. Proxy dos controles existentes: um único
      comportamento em toda a ferramenta.
   Carregar após ui/panels.js e ui/editor.js.
   ===================================================== */
(function(F){
  'use strict';
  const $ = s=>document.querySelector(s);
  F.ui = F.ui || {};

  /* ---------- helpers de estado ---------- */
  const design = () => F.state.mode==='design';
  const count  = () => design() ? F.state.slides.length : F.state.timeline.length;
  const curIdx = () => design() ? F.state.cur : F.state.curScene;
  function nameOf(i){
    const s = F.state;
    return design()
      ? (((s.slides[i].title||'').split('\n')[0].trim().slice(0,24)) || 'Slide '+(i+1))
      : ((((F.scenes.get((s.timeline[i]||{}).type)||{}).n)) || (s.timeline[i]||{}).type || 'Cena');
  }
  function keyOf(i){
    const s = F.state;
    return design() ? `d|${s.tpl}|${i}|${s.seed}` : F.motionKey(i);
  }
  /* HTML da arte do índice i (mesmo pipeline das miniaturas do navegador) */
  function boardArtHTML(i){
    const s = F.state, keepC = s.cur, keepS = s.curScene;
    let html = '';
    try{
      if(design()){
        s.cur = i;
        const r = F.rngOf((F.seedOf ? F.seedOf('layout') : s.seed)*7919 + (F.artOff ? F.artOff(i) : i*101));
        html = (F.templates.get((s.slides[i]||{}).tpl || s.tpl)||F.templates.get('manifesto')).render(s.slides[i], r)
             + (F.composeHTML ? F.composeHTML(F.editKey()) : '');
      } else {
        s.curScene = i;
        const sc = s.timeline[i], def = sc && F.scenes.get(sc.type);
        html = (def ? def.render(sc, F.sceneRng ? F.sceneRng(i) : undefined) : '')   /* fase 1.3 */
             + (F.composeHTML ? F.composeHTML(F.motionKey(i)) : '');
      }
    }catch(err){ console.warn('prancheta falhou:', err); }
    finally{ s.cur = keepC; s.curScene = keepS; }
    return html;
  }
  function mountThumb(holder, i, k){
    const fmt = F.FORMATS[F.state.format];
    holder.style.width  = Math.round(fmt.w*k)+'px';
    holder.style.height = Math.round(fmt.h*k)+'px';
    const a = document.createElement('div');
    a.className = 'art thumbart';
    a.setAttribute('style', F.artVarsFor(i) + `transform:scale(${k})`);
    a.innerHTML = boardArtHTML(i);
    holder.appendChild(a);
    if(F.applyEditsIn) F.applyEditsIn(a, keyOf(i));
    if(!design() && F.updateCounters) F.updateCounters(a, 99999);
    return a;
  }
  function selectIdx(i){
    const s = F.state;
    if(design()) s.cur = i; else s.curScene = i;
    F.render(); F.ui.refreshActive && F.ui.refreshActive();
  }

  /* =====================================================
     1 · FLUXO SEQUENCIAL DE PRANCHETAS NO PALCO
  ===================================================== */
  let bT = null, lastCur = -1, lastSig = '';
  F.ui.syncBoards = function(){ clearTimeout(bT); bT = setTimeout(buildBoards, 90); };
  function fitScaleNow(){
    const fw = $('#fitwrap'), fmt = F.FORMATS[F.state.format];
    const w = parseFloat(fw && fw.style.width);
    return (w && fmt.w) ? w/fmt.w : .3;
  }
  function ensureActiveWrap(){
    const stage = $('#stage'), fw = $('#fitwrap');
    let aw = $('#activeBoard');
    if(!aw){
      aw = document.createElement('div');
      aw.id = 'activeBoard';
      aw.className = 'boardwrap on';
      stage.insertBefore(aw, fw);
      aw.appendChild(fw);
      const badge = document.createElement('div');
      badge.className = 'boardbadge on';
      aw.appendChild(badge);
    }
    return aw;
  }
  function buildBoards(){
    const stage = $('#stage'); if(!stage) return;
    const n = count(), cur = curIdx();
    const aw = ensureActiveWrap();
    const flowOn = n > 1;
    stage.classList.toggle('flow', flowOn);
    /* selo da prancheta ativa */
    const badge = aw.querySelector('.boardbadge');
    if(badge) badge.innerHTML =
      `<b>${String(cur+1).padStart(2,'0')}</b><span>${F.esc(nameOf(cur))}</span><em>selecionada</em>`;
    aw.style.order = cur;
    /* pranchetas vizinhas (fantasmas clicáveis, mesmo tamanho da ativa) */
    stage.querySelectorAll('.boardwrap.ghost').forEach(x=>x.remove());
    if(!flowOn){ lastCur = cur; return; }
    const k = fitScaleNow();
    for(let i=0;i<n;i++){
      if(i===cur) continue;
      const g = document.createElement('div');
      g.className = 'boardwrap ghost';
      g.style.order = i;
      g.title = 'selecionar '+(design()?'slide':'cena')+' '+(i+1);
      const th = document.createElement('div');
      th.className = 'bghost';
      mountThumb(th, i, k);
      g.appendChild(th);
      const bd = document.createElement('div');
      bd.className = 'boardbadge';
      bd.innerHTML = `<b>${String(i+1).padStart(2,'0')}</b><span>${F.esc(nameOf(i))}</span>`;
      g.appendChild(bd);
      g.onclick = ()=>selectIdx(i);
      stage.appendChild(g);
    }
    /* seleção mudou: rola a prancheta ativa para o centro do palco */
    const sig = F.state.mode+'|'+F.state.format;
    if(lastCur !== cur || lastSig !== sig){
      lastCur = cur; lastSig = sig;
      requestAnimationFrame(()=>{ try{
        aw.scrollIntoView({block:'center', inline:'center', behavior:'smooth'});
      }catch(e){} });
    }
  }

  /* =====================================================
     2 · TELA DE GRADE (palco em grid)
  ===================================================== */
  F.ui.toggleGridView = function(force){
    const gv = $('#gridView'); if(!gv) return;
    const show = force!=null ? !!force : gv.hidden;
    gv.hidden = !show;
    const fb = $('#sfGrid'); if(fb) fb.classList.toggle('on', show);
    const hb = $('#btnNav'); if(hb) hb.classList.toggle('on', show);
    if(show) buildGridView();
  };
  function buildGridView(){
    const gv = $('#gridView'), grid = $('#gvGrid');
    if(!gv || !grid) return;
    const n = count(), cur = curIdx(), fmt = F.FORMATS[F.state.format];
    $('#gvTitle').textContent = design() ? 'PRANCHETAS · SLIDES' : 'PRANCHETAS · CENAS';
    grid.innerHTML = '';
    if(!n){
      grid.innerHTML = '<div class="note" style="border:none">Adicione cenas na aba TIMELINE — elas aparecem aqui.</div>';
      return;
    }
    const TW = Math.min(260, Math.max(150, (gv.clientWidth-64)/Math.max(2,Math.min(4,n)) - 18));
    const k = TW/fmt.w;
    for(let i=0;i<n;i++){
      const canDel = design() ? n>1 : true;
      const card = document.createElement('div');
      card.className = 'gvcard'+(i===cur?' on':'');
      card.title = 'selecionar e voltar ao palco';
      const th = document.createElement('div');
      th.className = 'gvthumb';
      mountThumb(th, i, k);
      card.appendChild(th);
      const meta = document.createElement('div');
      meta.className = 'gvmeta';
      meta.innerHTML = `<span class="n">${String(i+1).padStart(2,'0')}</span><span class="nm">${F.esc(nameOf(i))}</span>
        <span class="snact">
          <button data-a="up" title="mover para cima"${i===0?' disabled':''}>↑</button>
          <button data-a="down" title="mover para baixo"${i===n-1?' disabled':''}>↓</button>
          <button data-a="del" title="remover"${canDel?'':' disabled'}>×</button>
        </span>`;
      card.appendChild(meta);
      card.onclick = e=>{
        const act = e.target.closest('[data-a]');
        if(act){
          e.stopPropagation();
          const a = act.dataset.a; let ok = false;
          if(a==='up')   ok = design() ? F.moveSlide(i,i-1) : F.moveScene(i,i-1);
          if(a==='down') ok = design() ? F.moveSlide(i,i+1) : F.moveScene(i,i+1);
          if(a==='del'){ ok = design() ? F.removeSlide(i)   : F.removeScene(i);
            if(ok) F.toast((design()?'Slide ':'Cena ')+(i+1)+' removid'+(design()?'o':'a')+'.'); }
          if(ok){ F.render(); F.ui.refreshActive && F.ui.refreshActive(); buildGridView(); }
          return;
        }
        selectIdx(i);
        F.ui.toggleGridView(false);
      };
      grid.appendChild(card);
    }
  }

  /* =====================================================
     3 · RODAPÉ DE ATALHOS (proxy dos controles existentes)
  ===================================================== */
  function needEditMode(){
    if(F.editor && F.editor.on) return true;
    const b = $('#btnEdit');
    if(b){ b.click(); F.toast('Modo edição ativado — clique num elemento da prancheta para usar o atalho.'); }
    return false;
  }
  function proxy(id){ const b = $(id) || (F.ui._edTools && F.ui._edTools.querySelector(id)); if(b) b.click(); }
  function wireFooter(){
    const ft = $('#stageFooter'); if(!ft) return;
    const on = (sel, fn)=>{ const b = ft.querySelector(sel); if(b) b.onclick = fn; };
    on('#sfMinus',  ()=>{ if(needEditMode()) proxy('#edMinus'); });
    on('#sfPlus',   ()=>{ if(needEditMode()) proxy('#edPlus'); });
    on('#sfFwd',    ()=>{ if(needEditMode()) proxy('#edFwd'); });
    on('#sfBwd',    ()=>{ if(needEditMode()) proxy('#edBwd'); });
    on('#sfLock',   ()=>{ if(needEditMode()) proxy('#edLock'); });
    on('#sfUnlock', ()=>{ if(needEditMode()) proxy('#edUnlock'); });
    on('#sfDel',    ()=>{ if(needEditMode()) proxy('#edDel'); });
    on('#sfUndo',   ()=>{ if(needEditMode()) proxy('#edReset'); });
    on('#sfZoomOut',()=>F.zoomBy(1/1.2));
    on('#sfZoomIn', ()=>F.zoomBy(1.2));
    on('#sfGrid',   ()=>F.ui.toggleGridView());
    const col = ft.querySelector('#sfColorInp');
    if(col) col.oninput = ()=>{ if(F.editor && F.editor.on) F.editor.setColor(col.value);
      else needEditMode(); };
    const colBtn = ft.querySelector('#sfColor');
    if(colBtn && col) colBtn.onclick = ()=>{ if(needEditMode()) col.click(); };
  }

  /* =====================================================
     WRAPS ADITIVOS: render/fit sincronizam o fluxo;
     init liga a grade + rodapé; Esc fecha a grade.
  ===================================================== */
  const _render = F.render;
  F.render = function(replay){
    _render.call(F, replay===undefined ? true : replay);
    F.ui.syncBoards();
    const gv = $('#gridView');
    if(gv && !gv.hidden) buildGridView();
  };
  const _fit = F.fit;
  F.fit = function(){ _fit.call(F); F.ui.syncBoards(); };

  const _init = F.ui.init;
  F.ui.init = function(){
    _init.call(F.ui);
    wireFooter();
    const gvClose = $('#gvClose'), gvAdd = $('#gvAdd');
    if(gvClose) gvClose.onclick = ()=>F.ui.toggleGridView(false);
    if(gvAdd) gvAdd.onclick = ()=>{ const b = $('#snAdd'); if(b) b.click();
      setTimeout(buildGridView, 60); };
    document.addEventListener('keydown', e=>{
      const gv = $('#gridView');
      if(e.key==='Escape' && gv && !gv.hidden) F.ui.toggleGridView(false);
    });
    F.ui.syncBoards();
  };

  /* modo edição liga → sidebar abre a aba EDITAR (ferramentas no lugar certo,
     sem sobrepor a prancheta); rodapé sinaliza o estado */
  F.ui.onEditToggle = function(onState){
    const ft = $('#stageFooter');
    if(ft) ft.classList.toggle('editing', onState);
    if(onState && F.ui.switchTab) F.ui.switchTab('t7');
  };
})(window.FORMA);
