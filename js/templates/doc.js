/* =====================================================
   FORJE·studio — templates/doc.js
   Templates orientados a DOCUMENTO, desenhados para os
   novos formatos E-book A4 e Apresentação 16:9 (e para a
   exportação PDF/PPTX) — mas funcionam em qualquer formato.
   · capa      — capa de e-book / abertura de deck
   · capitulo  — abertura de capítulo/seção com número monumental
   · topicos   — slide de conteúdo: cada linha do texto vira um bullet
   ===================================================== */
(function(F){
  const {esc, nl, letters, pick, logoHTML, bgImage, floatImage, icon, fxHTML, slideBadge, fancyTitle} = F;
  const st = () => F.state;
  const veilFull = `linear-gradient(180deg,color-mix(in srgb,var(--b-bg) 60%,transparent),color-mix(in srgb,var(--b-bg) 90%,transparent))`;
  const bullets = s => String(s||'').split('\n').map(x=>x.trim()).filter(Boolean);

  /* ------------------------------------------------ CAPA */
  F.templates.register('capa',{n:'Capa de e-book',d:'Capa editorial com moldura, título monumental e assinatura da marca. Feita para o formato E-book A4 e aberturas de apresentação.',
   mini:'<rect x="10" y="4" width="80" height="36" rx="3" fill="none" stroke="#5ee6c7" stroke-width="1.6"/><rect x="18" y="16" width="64" height="7" rx="2" fill="#eceef2"/><rect x="18" y="27" width="34" height="3" rx="1.5" fill="#5ee6c7"/><rect x="40" y="8" width="20" height="3" rx="1.5" fill="#9aa0ad"/>',
   render(s,r){
    const tn = pick(r,['ac','ac','p2']);
    const frame = pick(r,['full','full','corners']);
    const bg = s.img && s.mask==='cover'
      ? bgImage(s.img, veilFull)
      : `<div class="abs" style="inset:0;background:radial-gradient(130% 90% at 50% ${pick(r,['0%','100%'])},color-mix(in srgb,var(--b-p1) ${Math.floor(14+r()*14)}%,var(--b-bg)),var(--b-bg) 62%)"></div>${r()<.6?F.bgOf(r):''}`;
    const floatImg = s.img && s.mask!=='cover'
      ? floatImage(s.img, s.mask, `left:50%;transform:translateX(-50%);top:9%;width:${(26+r()*8).toFixed(0)}%;aspect-ratio:1`) : '';
    const frameHTML = frame==='full'
      ? `<div class="abs" data-anim="fade" style="inset:calc(var(--u)*3.4px);border:calc(var(--u)*0.28px) solid color-mix(in srgb,var(--b-fg) 40%,transparent);border-radius:calc(var(--b-r)*0.6px);pointer-events:none"></div>`
      : `<div class="abs" data-anim="fade" style="left:calc(var(--u)*3.4px);top:calc(var(--u)*3.4px);width:calc(var(--u)*10px);height:calc(var(--u)*10px);border-left:calc(var(--u)*0.5px) solid var(--b-${tn});border-top:calc(var(--u)*0.5px) solid var(--b-${tn})"></div>
         <div class="abs" data-anim="fade" style="right:calc(var(--u)*3.4px);bottom:calc(var(--u)*3.4px);width:calc(var(--u)*10px);height:calc(var(--u)*10px);border-right:calc(var(--u)*0.5px) solid var(--b-${tn});border-bottom:calc(var(--u)*0.5px) solid var(--b-${tn})"></div>`;
    return `${bg}${frameHTML}${floatImg}
    <div class="abs" style="inset:0;padding:calc(var(--u)*9px);display:flex;flex-direction:column;align-items:center;justify-content:${floatImg?'flex-end':'center'};text-align:center;gap:calc(var(--u)*2.4px)">
      <div data-anim="clip" style="display:flex;align-items:center;gap:.7em">
        <i style="display:block;width:calc(var(--u)*6px);height:calc(var(--u)*0.24px);background:var(--b-${tn})"></i>
        <span class="kicker" style="color:var(--b-${tn})">${esc(s.kicker)}</span>
        <i style="display:block;width:calc(var(--u)*6px);height:calc(var(--u)*0.24px);background:var(--b-${tn})"></i></div>
      <h1 class="fh" data-anim="letters" style="font-size:calc(var(--u)*${(7.2+r()*2.2).toFixed(1)}px);line-height:1.04;font-weight:800;letter-spacing:-.015em;max-width:11em">${letters(s.title)}</h1>
      <p data-anim="fade-up" style="--d:.9s;font-size:calc(var(--u)*2.6px);line-height:1.55;opacity:.85;max-width:26em">${nl(s.sub)}</p>
      <div data-anim="fade-up" style="--d:1.1s;margin-top:calc(var(--u)*3px);display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*1.2px)">
        ${logoHTML()}
        <span class="handle">${esc(st().brand.handle)}</span></div>
    </div>${fxHTML()}${slideBadge()}`;
   }});

  /* ------------------------------------------------ CAPÍTULO */
  F.templates.register('capitulo',{n:'Capítulo',d:'Abertura de capítulo/seção: número monumental vazado (do rótulo), título e texto de apoio. Ideal para e-books e divisórias de apresentação.',
   mini:'<text x="8" y="34" font-size="30" font-weight="800" fill="none" stroke="#5ee6c7" stroke-width="1">01</text><rect x="46" y="14" width="46" height="6" rx="2" fill="#eceef2"/><rect x="46" y="24" width="34" height="3" rx="1.5" fill="#9aa0ad"/>',
   render(s,r){
    const tn = pick(r,['ac','ac','p1','p2']);
    const num = (s.kicker||'01').replace(/[^\dA-Za-z]/g,'').slice(0,3) || '01';
    const side = pick(r,['row','col','col']);
    const bg = s.img && s.mask==='cover' ? bgImage(s.img, veilFull)
      : `<div class="abs" style="inset:0;background:linear-gradient(${Math.floor(r()*360)}deg,color-mix(in srgb,var(--b-p1) 12%,var(--b-bg)),var(--b-bg) 60%)"></div>${r()<.5?F.bgOf(r):''}`;
    const floatImg = s.img && s.mask!=='cover'
      ? floatImage(s.img, s.mask, `right:${(6+r()*5).toFixed(0)}%;bottom:${(8+r()*6).toFixed(0)}%;width:${(20+r()*7).toFixed(0)}%;aspect-ratio:1`) : '';
    const numHTML = `<b class="fh" data-anim="blur" style="font-size:calc(var(--u)*${side==='row'?22:26}px);line-height:.85;font-weight:800;color:transparent;-webkit-text-stroke:calc(var(--u)*0.22px) var(--b-${tn});opacity:.9">${esc(num)}</b>`;
    return `${bg}${floatImg}
    <div class="abs" style="inset:0;padding:calc(var(--u)*8px);display:flex;flex-direction:${side==='row'?'row':'column'};align-items:${side==='row'?'center':'flex-start'};justify-content:${side==='row'?'flex-start':'center'};gap:calc(var(--u)*${side==='row'?5:2.4}px)">
      ${numHTML}
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*2.2px);max-width:${side==='row'?'60%':'80%'}">
        <span class="kicker" data-anim="clip" style="color:var(--b-${tn})">${esc(s.kicker)}</span>
        <h1 class="fh" data-anim="clip-up" style="--dur:1s;font-size:calc(var(--u)*${(5.6+r()*1.6).toFixed(1)}px);line-height:1.06;font-weight:800;letter-spacing:-.012em">${fancyTitle(s.title, r)}</h1>
        <div class="bar" data-anim="line" style="--d:.9s;width:calc(var(--u)*${(9+r()*8).toFixed(0)}px);background:var(--b-${tn})"></div>
        <p data-anim="fade-up" style="--d:1.05s;font-size:calc(var(--u)*2.6px);line-height:1.55;opacity:.86;max-width:30em">${nl(s.sub)}</p>
      </div>
      <div class="abs" style="left:calc(var(--u)*8px);right:calc(var(--u)*8px);bottom:calc(var(--u)*5px);display:flex;justify-content:space-between;align-items:center">
        ${logoHTML()}
        <span class="handle" data-anim="fade-up" style="--d:1.2s">${esc(st().brand.handle)}</span></div>
    </div>${fxHTML()}${slideBadge()}`;
   }});

  /* ------------------------------------------------ TÓPICOS */
  F.templates.register('topicos',{n:'Tópicos',d:'Slide de conteúdo: cada linha do texto vira um bullet com marcador da marca. O par perfeito da exportação PPTX/PDF.',
   mini:'<rect x="8" y="7" width="52" height="6" rx="2" fill="#eceef2"/><circle cx="12" cy="21" r="2.4" fill="#5ee6c7"/><rect x="18" y="19" width="56" height="4" rx="2" fill="#9aa0ad"/><circle cx="12" cy="30" r="2.4" fill="#5ee6c7"/><rect x="18" y="28" width="44" height="4" rx="2" fill="#9aa0ad"/><circle cx="12" cy="39" r="2.4" fill="#5ee6c7"/><rect x="18" y="37" width="50" height="4" rx="2" fill="#9aa0ad"/>',
   render(s,r){
    const tn = pick(r,['ac','ac','p2']);
    const mk = pick(r,['dot','num','check']);
    const its = bullets(s.sub);
    const list = its.length ? its : ['Adicione uma linha por tópico no campo de texto.','Cada linha vira um bullet como este.','A hierarquia sai pronta no PDF e no PPTX.'];
    const fs = list.length>6 ? 2.5 : list.length>4 ? 2.8 : 3.2;
    const marker = i => mk==='num'
      ? `<b class="fm" style="flex:0 0 auto;width:calc(var(--u)*3.6px);height:calc(var(--u)*3.6px);border-radius:50%;border:calc(var(--u)*0.22px) solid var(--b-${tn});color:var(--b-${tn});display:grid;place-items:center;font-size:calc(var(--u)*1.7px);font-weight:700">${i+1}</b>`
      : mk==='check'
      ? `<b style="flex:0 0 auto;width:calc(var(--u)*3.2px);height:calc(var(--u)*3.2px);border-radius:50%;background:var(--b-${tn});color:var(--b-bg);display:grid;place-items:center;font-size:calc(var(--u)*1.8px)">${icon('check')}</b>`
      : `<b style="flex:0 0 auto;width:calc(var(--u)*1.6px);height:calc(var(--u)*1.6px);border-radius:50%;background:var(--b-${tn});margin-top:calc(var(--u)*${(fs*.62).toFixed(2)}px)"></b>`;
    const floatImg = s.img
      ? floatImage(s.img, s.mask==='cover'?'soft':s.mask, `right:${(5+r()*3).toFixed(0)}%;top:50%;transform:translateY(-50%);width:${(24+r()*6).toFixed(0)}%;aspect-ratio:${pick(r,['1','3/4'])}`) : '';
    const bg = `<div class="abs" style="inset:0;background:linear-gradient(160deg,color-mix(in srgb,var(--b-p1) 10%,var(--b-bg)),var(--b-bg) 55%)"></div>${r()<.45?F.bgOf(r):''}`;
    return `${bg}${floatImg}
    <div class="abs" style="inset:0;padding:calc(var(--u)*7px) calc(var(--u)*8px);display:flex;flex-direction:column;gap:calc(var(--u)*3.4px)">
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*1.4px);max-width:${floatImg?'62%':'100%'}">
        <span class="kicker" data-anim="clip" style="color:var(--b-${tn})">${esc(s.kicker)}</span>
        <h1 class="fh" data-anim="clip-up" style="--dur:.9s;font-size:calc(var(--u)*${F.fitT((4.6+r()*1.2).toFixed(1), s)}px);line-height:1.08;font-weight:800;letter-spacing:-.012em">${fancyTitle(s.title, r)}</h1>
        <div class="bar" data-anim="line" style="--d:.8s;width:calc(var(--u)*9px);background:var(--b-${tn})"></div></div>
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*${list.length>5?1.8:2.4}px);max-width:${floatImg?'58%':'74%'};flex:1;justify-content:flex-start">
        ${list.map((t,i)=>`<div data-anim="slide-r" style="--d:${(.7+i*.14).toFixed(2)}s;display:flex;gap:calc(var(--u)*1.8px);align-items:${mk==='dot'?'flex-start':'center'}">
          ${marker(i)}<span style="font-size:calc(var(--u)*${fs}px);line-height:1.45;opacity:.92">${esc(t)}</span></div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        ${logoHTML()}
        <span class="handle" data-anim="fade-up" style="--d:1.3s">${esc(st().brand.handle)}</span></div>
    </div>${fxHTML()}${slideBadge()}`;
   }});
})(window.FORMA);
