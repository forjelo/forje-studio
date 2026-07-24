/* =====================================================
   FORJE·studio — lib/anims.js
   1) anims: metadados das animações disponíveis (as
      keyframes vivem em css/art.css). Serve de contrato
      para templates/cenas e para UIs futuras de edição.
   2) fx: efeitos de acabamento (camadas sobre a arte).
   3) elements: decorações compostas por RNG.
   Expandir = registrar aqui + (se nova) keyframe no art.css.
   ===================================================== */
(function(F){

  /* ---------- animações ---------- */
  const a = (id,n,kind)=>F.anims.register(id,{n,kind});
  a('fade','Fade','in');            a('fade-up','Fade sobe','in');
  a('clip','Revela →','in');        a('clip-up','Revela ↑','in');
  a('scale','Escala','in');         a('blur','Desfoque','in');
  a('line','Linha →','in');         a('line-y','Linha ↓','in');
  a('pop','Pop','in');              a('slide-l','Desliza ←','in');
  a('slide-r','Desliza →','in');    a('rise','Sobe e assenta','in');
  a('letters','Letra a letra','in');a('draw','Traço SVG','in');
  a('flip-x','Vira ↕ 3D','in');     a('flip-y','Vira ↔ 3D','in');
  a('bounce','Quica','in');         a('swing','Balança','in');
  a('rotate','Gira e entra','in');  a('zoom-in','Aproxima','in');
  a('blur-up','Desfoque sobe','in');a('skew','Inclina','in');
  a('tracking','Espaça letras','in');a('iris','Íris','in');
  a('type','Digitação','in');
  a('sketch','Rascunho (traço)','in');a('ink','Tinta (traço+fade)','in');
  a('unfold','Desdobra','in');       a('roll','Rola e entra','in');
  a('elastic','Elástico','in');      a('trace','Traço vivo','loop');
  a('float','Flutua','loop');       a('orbit','Orbita','loop');
  a('spin','Gira','loop');          a('pulse','Pulsa','loop');
  a('wobble','Gangorra','loop');    a('breathe','Respira','loop');

  /* ---------- efeitos de acabamento ---------- */
  const x = (id,n,cls)=>F.fx.register(id,{n,cls});
  x('grain',    'Granulado',   'fx-grain');
  x('vignette', 'Vinheta',     'fx-vignette');
  x('scanlines','Scanlines',   'fx-scanlines');
  x('frame',    'Moldura',     'fx-frame');
  x('glowtop',  'Brilho topo', 'fx-glowtop');

  /* ---------- elementos decorativos (usam RNG) ---------- */
  const e = (id,n,html)=>F.elements.register(id,{n,html});
  e('ring','Anel', r =>
    `<div class="abs" data-anim="spin" style="right:${(-16+r()*10).toFixed(0)}%;top:${(-20+r()*10).toFixed(0)}%;width:52%;aspect-ratio:1;border:calc(var(--u)*0.5px) solid color-mix(in srgb,var(--b-p1) 55%,transparent);border-radius:50%"></div>`);
  e('asterisk','Asterisco', r =>
    `<div class="abs" data-anim="pulse" style="right:${(6+r()*8).toFixed(0)}%;top:${(8+r()*8).toFixed(0)}%;font-size:calc(var(--u)*7px);color:var(--b-p2)">✳</div>`);
  e('dots','Pontos', r =>
    `<div class="abs" data-anim="orbit" style="right:${(5+r()*8).toFixed(0)}%;top:${(6+r()*8).toFixed(0)}%;display:grid;grid-template-columns:repeat(4,1fr);gap:calc(var(--u)*1.4px)">${'<i style="width:calc(var(--u)*1px);aspect-ratio:1;border-radius:50%;background:var(--b-p2)"></i>'.repeat(12)}</div>`);
  e('cross','Cruzeta', r =>
    `<div class="abs" data-anim="pulse" style="left:${(6+r()*6).toFixed(0)}%;bottom:${(10+r()*10).toFixed(0)}%;width:calc(var(--u)*5px);aspect-ratio:1;color:var(--b-ac)"><svg class="ic" viewBox="0 0 24 24" style="width:100%;height:100%"><path d="M12 4v16M4 12h16"/></svg></div>`);
  e('squiggle','Rabisco', r =>
    `<div class="abs" data-anim="draw" style="--dash:200;left:${(50+r()*20).toFixed(0)}%;bottom:${(8+r()*8).toFixed(0)}%;width:calc(var(--u)*16px);color:var(--b-ac)"><svg class="ic" viewBox="0 0 100 20" style="width:100%;height:auto;stroke-width:4"><path d="M2 12 C 15 2, 25 22, 38 12 S 60 2, 72 12 S 92 20, 98 8"/></svg></div>`);
  e('burst','Explosão', r =>
    `<div class="abs" data-anim="spin" style="right:${(8+r()*8).toFixed(0)}%;bottom:${(12+r()*8).toFixed(0)}%;width:calc(var(--u)*9px);aspect-ratio:1;color:var(--b-ac)"><svg class="ic" viewBox="0 0 24 24" style="width:100%;height:100%;stroke-width:1.4"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg></div>`);

  e('plusgrid','Grade de cruzetas', r =>{
    let g=''; for(let i=0;i<9;i++) g+=`<span style="display:grid;place-items:center;font-size:calc(var(--u)*1.6px);opacity:.7">+</span>`;
    return `<div class="abs" data-anim="fade" style="right:${(6+r()*8).toFixed(0)}%;top:${(8+r()*10).toFixed(0)}%;display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--u)*1.6px);color:var(--b-ac);font-weight:700">${g}</div>`;});
  e('orbits','Órbitas', r =>
    `<div class="abs" data-anim="fade" style="left:${(4+r()*6).toFixed(0)}%;top:${(8+r()*12).toFixed(0)}%;width:calc(var(--u)*11px);aspect-ratio:1;color:var(--b-p2)">
      <i style="position:absolute;inset:0;border:1px solid currentColor;border-radius:50%;opacity:.55"></i>
      <i style="position:absolute;inset:22%;border:1px solid currentColor;border-radius:50%;opacity:.75"></i>
      <i data-anim="pulse" style="position:absolute;left:50%;top:-3%;width:14%;aspect-ratio:1;border-radius:50%;background:var(--b-ac)"></i></div>`);
  e('sparkles','Faíscas', r =>{
    let sp='';
    for(let i=0;i<3;i++) sp+=`<i data-anim="pop" style="--d:${(.4+i*.25).toFixed(2)}s;position:absolute;left:${(i*34+r()*14).toFixed(0)}%;top:${(r()*70).toFixed(0)}%;width:calc(var(--u)*${(2+r()*2).toFixed(1)}px);aspect-ratio:1;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);background:var(--b-ac)"></i>`;
    return `<div class="abs" style="right:${(6+r()*10).toFixed(0)}%;top:${(8+r()*12).toFixed(0)}%;width:calc(var(--u)*14px);height:calc(var(--u)*10px)">${sp}</div>`;});
  e('ticks','Riscos diagonais', r =>{
    let t=''; for(let i=0;i<4;i++) t+=`<i style="display:block;width:calc(var(--u)*4px);height:calc(var(--u)*0.5px);background:currentColor;border-radius:99px"></i>`;
    return `<div class="abs" data-anim="slide-r" style="left:${(5+r()*6).toFixed(0)}%;bottom:${(10+r()*10).toFixed(0)}%;display:flex;flex-direction:column;gap:calc(var(--u)*1px);transform:rotate(-24deg);color:var(--b-ac);opacity:.85">${t}</div>`;});
  e('halfring','Meio-anel', r =>
    `<div class="abs" data-anim="fade" style="--d:.5s;right:${(-4+r()*4).toFixed(0)}%;bottom:${(-6+r()*6).toFixed(0)}%;width:calc(var(--u)*${(14+r()*8).toFixed(0)}px);aspect-ratio:1;color:var(--b-p1)"><svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible"><path d="M5 50A45 45 0 0 1 95 50" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" opacity=".7"/></svg></div>`);

  F.decorate = function(r){ // uma decoração aleatória do registry
    const ids = F.elements.ids();
    return F.elements.get(F.pick(r, ids)).html(r);
  };
})(window.FORMA);
