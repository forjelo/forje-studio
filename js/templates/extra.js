/* =====================================================
   FORJE·studio — templates/extra.js
   Templates de ASSINATURA — cartaz, editorial, duotone,
   sticker. Este arquivo é também o modelo de como uma
   biblioteca de templates cresce: registre e pronto.
   ===================================================== */
(function(F){
  const {esc, nl, letters, pick, logoHTML, imgHTML, bgImage, floatImage, icon, fxHTML, slideBadge, mixTitle, fancyTitle} = F;
  const st = () => F.state;

  /* faixa marquee reutilizável */
  function marquee(words, pos, dur, style=''){
    const seq = (words.join('  ✦  ')+'  ✦  ').repeat(2);
    return `<div class="marq" style="${pos}"><div class="in" style="--mdur:${dur}s">
      <span class="fh" style="${style}">${esc(seq)}</span><span class="fh" style="${style}">${esc(seq)}</span></div></div>`;
  }

  /* ------------------------------------------------ CARTAZ (brutalista) */
  F.templates.register('poster',{n:'Cartaz',d:'Tipografia monumental vazada, faixa marquee, número de série.',
   mini:'<rect width="100" height="44" fill="#1a1a1e"/><text x="6" y="24" font-size="17" fill="none" stroke="#eceef2" stroke-width=".8" font-weight="900" font-family="sans-serif">AaBb</text><rect x="0" y="34" width="100" height="6" fill="#ffb020"/>',
   render(s,r){
    /* S3.3 — migração leve: identidade preservada; o esquema de
       superfície (C8) recolore a arte via cascata de vars */
    const _X = F.composeSpec(r,'poster'), _SW = F.schemeVars(_X);
    const _fin = F.composeFinish(r, _X);
    const invert = r()<.3;                 // às vezes fundo accent
    const bgc = invert ? 'var(--b-ac)' : 'var(--b-bg)';
    const fgc = invert ? 'var(--b-bg)' : 'var(--b-fg)';
    const rot = (r()*3-1.5).toFixed(2);
    const num = String(Math.floor(r()*98)+1).padStart(2,'0');
    const img = s.img
      ? (s.mask==='cover'
          ? `<div class="abs duo" data-anim="fade" style="--dur:1.2s;right:0;top:0;bottom:0;width:44%;overflow:hidden">${imgHTML(s.img,'','style="position:absolute;inset:0"')}</div>`
          : floatImage(s.img, s.mask, `right:6%;top:9%;width:24%;aspect-ratio:1;transform:rotate(${(r()*10-5).toFixed(1)}deg)`))
      : '';
    return F.schemeWrap(_SW, `
    <div class="abs" style="inset:0;background:${bgc};color:${fgc}"></div>${_fin}${img}
    <div class="abs" style="left:calc(var(--u)*6px);top:calc(var(--u)*5px);display:flex;align-items:center;gap:1em;color:${fgc}">
      ${logoHTML()}<span class="kicker" data-anim="clip" style="--d:.15s">${esc(s.kicker)}</span></div>
    <div class="abs fh fm" data-anim="fade" style="--d:.3s;right:calc(var(--u)*6px);top:calc(var(--u)*4px);font-size:calc(var(--u)*7px);font-weight:800;color:${fgc};opacity:.25">Nº${num}</div>
    <div class="abs" style="left:calc(var(--u)*6px);right:${s.img&&s.mask==='cover'?'46%':'calc(var(--u)*6px)'};top:50%;transform:translateY(-52%) rotate(${rot}deg)">
      <h1 class="fh" data-anim="clip-up" style="--dur:1.1s;--hc:${fgc};font-size:calc(var(--u)*${F.fitT((9+r()*3).toFixed(1), s)}px);line-height:.96;font-weight:900;letter-spacing:-.02em;text-transform:uppercase;color:${fgc}">${mixTitle(s.title, r, ['','tHollow'])}</h1>
      <p data-anim="fade-up" style="--d:.7s;margin-top:calc(var(--u)*2.4px);font-size:calc(var(--u)*${F.fitS(2.6, s)}px);line-height:1.45;opacity:.85;max-width:26em;color:${fgc}">${nl(s.sub)}</p>
    </div>
    <div class="abs" data-anim="fade" style="--d:.5s;left:0;right:0;bottom:0;height:calc(var(--u)*6px);background:${invert?'var(--b-bg)':'var(--b-ac)'};color:${invert?'var(--b-fg)':'var(--b-bg)'};display:flex;align-items:center;overflow:hidden">
      ${marquee([st().brand.handle, st().cta||'FORMA', s.kicker||''].filter(Boolean),
        'top:50%;transform:translateY(-50%)', 12,
        `font-size:calc(var(--u)*2.6px);font-weight:800;letter-spacing:.08em;text-transform:uppercase`)}
    </div>${fxHTML()}${slideBadge()}`);
  }});

  /* ------------------------------------------------ EDITORIAL */
  F.templates.register('editorial',{n:'Editorial',d:'Revista: réguas, colunas, imagem duotone, fólio.',
   mini:'<rect width="100" height="44" fill="#f4f1ea"/><path d="M6 8H94 M6 12H60" stroke="#1a1a1e" stroke-width="1"/><rect x="6" y="18" width="52" height="6" fill="#1a1a1e"/><rect x="64" y="16" width="30" height="22" fill="#8a86d8"/>',
   render(s,r){
    /* S3.3 — migração leve: identidade preservada; o esquema de
       superfície (C8) recolore a arte via cascata de vars */
    const _X = F.composeSpec(r,'editorial'), _SW = F.schemeVars(_X);
    /* variação interna de revista: lado da imagem, corpo/peso do título,
       colunas e régua — a identidade (réguas + fólio + duotone) fica */
    const flip = r()<.35;
    const tsz = (5.6+r()*1.6).toFixed(1), tw = pick(r,[500,600,600,700]);
    const barw = (7+r()*9).toFixed(0);
    const cols = (s.sub && s.sub.length>90) ? (r()<.7?2:1) : 1;
    const img = s.img
      ? (s.mask==='cover'
        ? `<div class="abs duo" data-anim="clip" style="--dur:1.1s;${flip?'left':'right'}:calc(var(--u)*6px);top:calc(var(--u)*14px);bottom:calc(var(--u)*14px);width:34%;overflow:hidden">${imgHTML(s.img,'','style="position:absolute;inset:0"')}</div>`
        : floatImage(s.img, s.mask, `${flip?'left':'right'}:8%;top:50%;transform:translateY(-50%);width:28%;aspect-ratio:1`))
      : `<div class="abs" data-anim="fade" style="--d:.4s;${flip?'left':'right'}:calc(var(--u)*6px);top:calc(var(--u)*14px);bottom:calc(var(--u)*14px);width:34%">${imgHTML(null,'','style="position:absolute;inset:0"')}</div>`;
    return F.schemeWrap(_SW, `
    <div class="abs" style="inset:0;background:var(--b-bg)"></div>
    <div class="abs" data-anim="line" style="left:calc(var(--u)*6px);right:calc(var(--u)*6px);top:calc(var(--u)*10px);height:calc(var(--u)*0.35px);background:var(--b-fg)"></div>
    <div class="abs" data-anim="line" style="--d:.15s;left:calc(var(--u)*6px);right:calc(var(--u)*6px);bottom:calc(var(--u)*10px);height:calc(var(--u)*0.18px);background:color-mix(in srgb,var(--b-fg) 50%,transparent)"></div>
    <div class="abs" style="left:calc(var(--u)*6px);right:calc(var(--u)*6px);top:calc(var(--u)*5px);display:flex;justify-content:space-between;align-items:baseline">
      ${logoHTML('fade','.05s')}
      <span class="fm" data-anim="fade" style="--d:.2s;font-size:calc(var(--u)*2px);letter-spacing:.14em;opacity:.7">${esc(s.kicker).toUpperCase()} — ${new Date().getFullYear()}</span></div>
    ${img}
    <div class="abs" style="left:${flip?'44%':'calc(var(--u)*6px)'};width:52%;top:calc(var(--u)*15px);display:flex;flex-direction:column;gap:calc(var(--u)*2.6px)">
      <h1 class="fh" data-anim="blur" style="--dur:1s;font-size:calc(var(--u)*${F.fitT(tsz, s)}px);line-height:1.04;font-weight:${tw};letter-spacing:-.01em">${fancyTitle(s.title, r)}</h1>
      <div class="bar" data-anim="line" style="--d:.7s;width:calc(var(--u)*${barw}px);height:calc(var(--u)*0.5px);background:var(--b-${_X.tone})"></div>
      <p data-anim="fade-up" style="--d:.85s;font-size:calc(var(--u)*${F.fitS(2.4, s)}px);line-height:1.62;opacity:.86;${cols===2?'column-count:2;column-gap:calc(var(--u)*3px);':''}max-width:34em">${nl(s.sub)}</p>
      ${st().cta?`<span data-anim="fade-up" style="--d:1.05s;font-weight:700;font-size:calc(var(--u)*2.5px)"><span class="ub">${esc(st().cta)}</span></span>`:''}
    </div>
    <div class="abs handle" data-anim="fade" style="--d:1.2s;left:calc(var(--u)*6px);bottom:calc(var(--u)*5.5px)">${esc(st().brand.handle)}</div>
    <div class="abs fm" data-anim="fade" style="--d:1.2s;right:calc(var(--u)*6px);bottom:calc(var(--u)*5.5px);font-size:calc(var(--u)*2px);opacity:.6">${String(st().cur+1).padStart(2,'0')}</div>
    ${fxHTML()}${slideBadge()}`);
  }});

  /* ------------------------------------------------ DUOTONE */
  F.templates.register('duotone',{n:'Duotone',d:'Imagem lavada nas cores da marca, tipografia de festival.',
   mini:'<rect width="100" height="44" fill="#4f46e5"/><rect width="100" height="44" fill="url(#g)" opacity=".5"/><text x="5" y="36" font-size="15" fill="#eceef2" font-weight="900" font-family="sans-serif">FORMA</text><rect x="5" y="6" width="22" height="5" fill="#ffb020"/>',
   render(s,r){
    /* S3.3 — migração leve: identidade preservada; o esquema de
       superfície (C8) recolore a arte via cascata de vars */
    const _X = F.composeSpec(r,'duotone'), _SW = F.schemeVars(_X);
    const bg = s.img
      ? `<div class="abs duo" style="inset:0;overflow:hidden">${imgHTML(s.img,'','style="position:absolute;inset:0"')}</div>`
      : `<div class="abs" style="inset:0;background:linear-gradient(160deg,var(--b-p1),var(--b-p2))"></div>`;
    const up = r()<.6;
    return F.schemeWrap(_SW, `${bg}
    <div class="abs" style="inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--b-bg) 30%,transparent),transparent 40%,color-mix(in srgb,var(--b-bg) 55%,transparent))"></div>
    <div class="abs vtext fm" data-anim="clip-up" style="--d:.3s;right:calc(var(--u)*4px);top:calc(var(--u)*6px);font-size:calc(var(--u)*2.2px);letter-spacing:.3em;opacity:.9">${esc(s.kicker).toUpperCase()}</div>
    <div class="abs" style="left:calc(var(--u)*6px);top:calc(var(--u)*5px);display:flex;align-items:center;gap:1em">${logoHTML()}</div>
    <div class="abs" style="left:calc(var(--u)*6px);right:calc(var(--u)*10px);bottom:calc(var(--u)*7px);display:flex;flex-direction:column;gap:calc(var(--u)*2.2px);align-items:flex-start">
      <h1 class="fh" data-anim="letters" style="font-size:calc(var(--u)*${F.fitT((7.4+r()*2).toFixed(1), s)}px);line-height:.98;font-weight:900;${up?'text-transform:uppercase;':''}letter-spacing:-.015em">${letters(s.title)}</h1>
      <p data-anim="fade-up" style="--d:1s;font-size:calc(var(--u)*${F.fitS(2.6, s)}px);line-height:1.5;opacity:.92;max-width:26em">${nl(s.sub)}</p>
      <div style="display:flex;gap:1em;align-items:center">
        ${st().cta?`<span class="cta" data-anim="pop" style="--d:1.2s">${esc(st().cta)} ${icon('arrow-up-right')}</span>`:''}
        <span class="handle" data-anim="fade-up" style="--d:1.3s">${esc(st().brand.handle)}</span>
      </div>
    </div>${fxHTML()}${slideBadge()}`);
  }});

  /* ------------------------------------------------ STICKER */
  F.templates.register('stickers',{n:'Sticker',d:'Adesivos com sombra dura, fundo chapado, humor pop.',
   mini:'<rect width="100" height="44" fill="#ffb020"/><rect x="14" y="10" width="56" height="22" rx="4" fill="#eceef2" stroke="#1a1a1e" stroke-width="2" transform="rotate(-4 42 21)"/><circle cx="80" cy="12" r="7" fill="#22d3ee" stroke="#1a1a1e" stroke-width="2"/>',
   render(s,r){
    /* S3.3 — migração leve: identidade preservada; o esquema de
       superfície (C8) recolore a arte via cascata de vars */
    const _X = F.composeSpec(r,'stickers'), _SW = F.schemeVars(_X);
    const tones = ['var(--b-ac)','var(--b-p1)','var(--b-p2)'];
    const bgc = pick(r, tones);
    const rot = (r()*8-4).toFixed(1);
    const ids = F.icons.ids();
    const badges = [0,1,2].map(i=>{
      const pos = [['left:8%','top:12%'],['right:9%','top:16%'],['right:14%','bottom:14%']][i];
      return `<div class="sticker abs" data-anim="pop" style="--d:${(0.8+i*0.18).toFixed(2)}s;${pos[0]};${pos[1]};width:calc(var(--u)*9px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;font-size:calc(var(--u)*4.4px);transform:rotate(${(r()*30-15).toFixed(0)}deg)">
        <span data-anim="float" style="--d:${i*.6}s;display:flex">${icon(pick(r,ids))}</span></div>`;
    }).join('');
    const img = s.img ? floatImage(s.img, s.mask==='cover'?'circle':s.mask, `left:11%;bottom:12%;width:22%;aspect-ratio:1`,'pop') : '';
    return F.schemeWrap(_SW, `
    <div class="abs" style="inset:0;background:${bgc}"></div>
    <div class="abs" style="inset:0;background:radial-gradient(circle at 20% 15%, #ffffff2e, transparent 40%)"></div>
    ${badges}${img}
    <div class="abs" style="left:50%;top:47%;transform:translate(-50%,-50%) rotate(${rot}deg);width:74%">
      <div class="sticker" data-anim="scale" style="--dur:.9s;border-radius:calc(var(--b-r)*1.6px);padding:calc(var(--u)*5px) calc(var(--u)*5.5px);display:flex;flex-direction:column;gap:calc(var(--u)*1.8px);text-align:center;align-items:center">
        <span class="kicker" data-anim="clip" style="--d:.4s;color:var(--b-p1)">${esc(s.kicker)}</span>
        <h1 class="fh" data-anim="pop" style="--d:.5s;font-size:calc(var(--u)*6px);line-height:1.02;font-weight:900">${nl(s.title)}</h1>
        <p data-anim="fade-up" style="--d:.7s;font-size:calc(var(--u)*${F.fitS(2.4, s)}px);line-height:1.45;opacity:.8;max-width:26em">${nl(s.sub)}</p>
        ${st().cta?`<span class="cta" data-anim="pop" style="--d:.9s;background:var(--b-p1);color:var(--b-bg)">${esc(st().cta)}</span>`:''}
      </div>
    </div>
    <div class="abs" style="left:calc(var(--u)*6px);top:calc(var(--u)*5px)">${logoHTML()}</div>
    <div class="abs handle" data-anim="fade-up" style="--d:1.1s;left:50%;transform:translateX(-50%);bottom:calc(var(--u)*4.5px);color:var(--b-bg)">${esc(st().brand.handle)}</div>
    ${fxHTML()}${slideBadge()}`);
  }});

})(window.FORMA);
