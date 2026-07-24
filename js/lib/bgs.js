/* =====================================================
   FORJE·studio — lib/bgs.js
   Biblioteca de FUNDOS geradores: cada entrada devolve
   camadas HTML absolutas construídas por RNG com os
   tokens da marca. Templates usam F.bgOf(r) para variar
   drasticamente a cada seed. Expandir = registrar.
   ===================================================== */
(function(F){
  F.bgs = (function(){ const map={};
    /* prancheta com cor própria: o fundo gerativo cede lugar ao sólido */
    const wrap = fn => fn && (r => { const cv = F.canvasColor && F.canvasColor();
      return cv ? `<div class="abs" style="inset:0;background:${cv}"></div>` : fn(r); });
    return {
    map, register:(id,fn)=>map[id]=fn, get:id=>wrap(map[id]),
    ids:()=>Object.keys(map), entries:()=>Object.entries(map).map(([id,fn])=>[id,wrap(fn)])}; })();
  const b = (id,fn)=>F.bgs.register(id,fn);
  const base = `<div class="abs" style="inset:0;background:var(--b-bg)"></div>`;
  const pct = (r,a,z)=>(a+r()*(z-a)).toFixed(0);

  /* mesh gradient — manchas radiais sobrepostas */
  b('mesh', r=>{
    let g='';
    const tones=['p1','p2','ac'];
    for(let i=0;i<3;i++) g+=`radial-gradient(${pct(r,40,70)}% ${pct(r,40,70)}% at ${pct(r,0,100)}% ${pct(r,0,100)}%,color-mix(in srgb,var(--b-${tones[i]}) ${pct(r,16,30)}%,transparent),transparent 70%),`;
    return base+`<div class="abs" style="inset:0;background:${g}transparent"></div>`;
  });
  /* aurora — blobs desfocados orbitando */
  b('aurora', r=>{
    let blobs='';
    ['p1','p2','ac'].forEach((tn,i)=>{
      blobs+=`<div class="abs" data-anim="orbit" style="--d:${(-i*3)}s;left:${pct(r,i*25,i*25+35)}%;top:${pct(r,10,70)}%;width:${pct(r,34,52)}%;aspect-ratio:1;border-radius:50%;background:var(--b-${tn});opacity:.5;filter:blur(calc(var(--u)*8px))"></div>`;});
    return base+blobs+`<div class="abs" style="inset:0;background:color-mix(in srgb,var(--b-bg) 34%,transparent)"></div>`;
  });
  /* varredura cônica */
  b('sweep', r=>base+`<div class="abs" style="inset:0;background:conic-gradient(from ${pct(r,0,360)}deg at ${pct(r,30,70)}% ${pct(r,30,70)}%,color-mix(in srgb,var(--b-p1) 26%,var(--b-bg)),var(--b-bg) 40%,color-mix(in srgb,var(--b-p2) 18%,var(--b-bg)) 70%,var(--b-bg));opacity:.9"></div>`);
  /* listras diagonais sutis */
  b('stripes', r=>{
    const w=(1.5+r()*3).toFixed(1);
    return base+`<div class="abs" style="inset:0;background:repeating-linear-gradient(${pct(r,20,70)}deg,color-mix(in srgb,var(--b-fg) 5%,transparent) 0 calc(var(--u)*${w}px),transparent calc(var(--u)*${w}px) calc(var(--u)*${(+w*2).toFixed(1)}px))"></div>
    <div class="abs" style="inset:0;background:radial-gradient(90% 90% at ${pct(r,20,80)}% 20%,transparent,color-mix(in srgb,var(--b-bg) 72%,transparent))"></div>`;
  });
  /* matriz de pontos */
  b('dots', r=>base+`<div class="abs" style="inset:0;background-image:radial-gradient(color-mix(in srgb,var(--b-fg) ${pct(r,10,20)}%,transparent) calc(var(--u)*0.35px),transparent calc(var(--u)*0.35px));background-size:calc(var(--u)*${pct(r,3,6)}px) calc(var(--u)*${pct(r,3,6)}px)"></div>
    <div class="abs" style="inset:0;background:radial-gradient(80% 80% at 50% 30%,transparent 40%,color-mix(in srgb,var(--b-bg) 80%,transparent))"></div>`);
  /* papel milimetrado */
  b('gridpaper', r=>{const g=pct(r,6,10);
    return base+`<div class="abs" style="inset:0;background:linear-gradient(color-mix(in srgb,var(--b-fg) 9%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--b-fg) 9%,transparent) 1px,transparent 1px);background-size:calc(var(--u)*${g}px) calc(var(--u)*${g}px)"></div>
    <div class="abs" style="inset:0;background:radial-gradient(100% 100% at 50% 0%,transparent 50%,color-mix(in srgb,var(--b-bg) 75%,transparent))"></div>`;});
  /* spotlight teatral */
  b('spotlight', r=>base+`<div class="abs" style="inset:0;background:radial-gradient(${pct(r,50,80)}% ${pct(r,50,80)}% at ${pct(r,30,70)}% ${pct(r,15,45)}%,color-mix(in srgb,var(--b-p1) 24%,var(--b-bg)),var(--b-bg) 75%)"></div>`);
  /* horizonte dividido */
  b('horizon', r=>{const h=pct(r,55,75);
    return base+`<div class="abs" style="left:0;right:0;top:${h}%;bottom:0;background:color-mix(in srgb,var(--b-p1) ${pct(r,14,26)}%,var(--b-bg))"></div>
    <div class="abs" style="left:0;right:0;top:calc(${h}% - 1px);height:2px;background:var(--b-ac);opacity:.8"></div>`;});

  /* raios cônicos alternados */
  b('rays', r=>{
    const seg=(6+r()*8).toFixed(1);
    return base+`<div class="abs" style="inset:-30%;background:repeating-conic-gradient(from ${pct(r,0,360)}deg at ${pct(r,30,70)}% ${pct(r,20,60)}%,color-mix(in srgb,var(--b-p1) 14%,var(--b-bg)) 0 ${seg}deg,var(--b-bg) ${seg}deg ${(+seg*2).toFixed(1)}deg);opacity:.9"></div>
    <div class="abs" style="inset:0;background:radial-gradient(80% 80% at 50% 45%,transparent 30%,color-mix(in srgb,var(--b-bg) 78%,transparent))"></div>`;
  });
  /* ondas empilhadas no rodapé */
  b('waves', r=>{
    let w='';
    ['p1','p2','ac'].forEach((tn,i)=>{
      const y=58+i*13, a=10-i*2;
      w+=`<path d="M0 ${y} Q ${pct(r,15,35)} ${y-a}, 50 ${y} T 100 ${y} V100 H0 Z" fill="color-mix(in srgb,var(--b-${tn}) ${pct(r,14,26)}%,var(--b-bg))"/>`;});
    return base+`<svg class="abs" style="inset:0;width:100%;height:100%" viewBox="0 0 100 100" preserveAspectRatio="none">${w}</svg>`;
  });
  /* arcos concêntricos */
  b('arcs', r=>{
    const cx=pct(r,20,80), cy=pct(r,-10,20);
    let rings='';
    for(let i=1;i<=5;i++) rings+=`<div class="abs" style="left:${cx}%;top:${cy}%;transform:translate(-50%,-50%);width:${i*26}%;aspect-ratio:1;border-radius:50%;border:1px solid color-mix(in srgb,var(--b-fg) ${16-i*2}%,transparent)"></div>`;
    return base+rings+`<div class="abs" style="left:${cx}%;top:${cy}%;transform:translate(-50%,-50%);width:20%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--b-p1) 30%,transparent),transparent 70%)"></div>`;
  });
  /* xadrez sutil desbotado */
  b('checker', r=>{
    const g=pct(r,6,11);
    return base+`<div class="abs" style="inset:0;opacity:.5;background:repeating-conic-gradient(color-mix(in srgb,var(--b-fg) 6%,transparent) 0 90deg,transparent 90deg 180deg);background-size:calc(var(--u)*${g}px) calc(var(--u)*${g}px)"></div>
    <div class="abs" style="inset:0;background:radial-gradient(90% 90% at 50% 40%,transparent 30%,color-mix(in srgb,var(--b-bg) 82%,transparent))"></div>`;
  });
  /* bokeh — luzes desfocadas */
  b('bokeh', r=>{
    let d='';
    for(let i=0;i<7;i++){ const tn=F.pick(r,['p1','p2','ac']);
      d+=`<div class="abs" style="left:${pct(r,0,92)}%;top:${pct(r,0,88)}%;width:${pct(r,5,16)}%;aspect-ratio:1;border-radius:50%;background:var(--b-${tn});opacity:.${pct(r,1,3)};filter:blur(calc(var(--u)*${(1+r()*3).toFixed(1)}px))"></div>`;}
    return base+d+`<div class="abs" style="inset:0;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--b-bg) 55%,transparent))"></div>`;
  });
  /* brilho de canto */
  b('corner', r=>{
    const cn=F.pick(r,['0% 0%','100% 0%','0% 100%','100% 100%']);
    return base+`<div class="abs" style="inset:0;background:radial-gradient(${pct(r,60,95)}% ${pct(r,60,95)}% at ${cn},color-mix(in srgb,var(--b-ac) ${pct(r,18,30)}%,var(--b-bg)),var(--b-bg) 70%)"></div>
    <div class="abs" style="inset:0;background:radial-gradient(50% 50% at ${cn},color-mix(in srgb,var(--b-p2) 14%,transparent),transparent 60%)"></div>`;
  });

  /* sorteia um fundo da biblioteca */
  F.bgOf = function(r){
    const id = F.pick(r, F.bgs.ids());
    return F.bgs.get(id)(r);
  };
})(window.FORMA);
