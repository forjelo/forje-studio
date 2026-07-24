/* =====================================================
   FORJE·studio — templates/static.js
   Templates base com VARIAÇÃO COMBINATÓRIA: cada seed
   sorteia fundo (lib bgs) × tratamento do título ×
   tom de destaque × decorações × alinhamento. Todos
   consomem slide.img (cover → fundo; máscara → flutuante).
   ===================================================== */
(function(F){
  const {esc, nl, letters, pick, logoHTML, imgHTML, bgImage, floatImage, icon, fxHTML, slideBadge, mixTitle, fancyTitle} = F;
  const st = () => F.state;

  const veilSide = dir => `linear-gradient(${dir},color-mix(in srgb,var(--b-bg) 92%,transparent) 34%,color-mix(in srgb,var(--b-bg) 45%,transparent) 60%,transparent)`;
  const veilFull = `linear-gradient(180deg,color-mix(in srgb,var(--b-bg) 55%,transparent),color-mix(in srgb,var(--b-bg) 88%,transparent))`;

  /* título com tratamento sorteado (anim compatível) */
  function titleHTML(s, r, size, extra=''){
    /* Eixo 2: slide com DESTAQUE do parser força o modo fancy (o
       destaque tem que aparecer); fit tipográfico só age no excedente */
    const mode = (s.hl && s.hl.length) ? 'fancy' : pick(r, ['letters','letters','fancy','mix','upper']);
    const base = `font-size:calc(var(--u)*${F.fitT ? F.fitT(size, s) : size}px);line-height:1.03;font-weight:800;letter-spacing:-.012em;${extra}`;
    if(mode==='letters') return `<h1 class="fh" data-anim="letters" style="${base}">${letters(s.title)}</h1>`;
    if(mode==='fancy')   return `<h1 class="fh" data-anim="clip-up" style="--dur:1s;${base}">${fancyTitle(s.title, r)}</h1>`;
    if(mode==='mix')     return `<h1 class="fh" data-anim="blur" style="--dur:1s;${base}">${mixTitle(s.title, r, ['','tHollow'])}</h1>`;
    return `<h1 class="fh" data-anim="clip-up" style="--dur:1s;${base}text-transform:uppercase">${fancyTitle(s.title, r)}</h1>`;
  }
  /* fundo: identidade da marca OU biblioteca geradora */
  function bgPick(r, identity){
    return pick(r, ['lib','lib','id']) === 'lib' ? F.bgOf(r) :
      `<div class="abs" style="inset:0;background:${identity}"></div>`;
  }
  const tone = r => pick(r,['ac','ac','p1','p2']);

  /* ============ Eixo 1 v2 · intérpretes do COMPOSITOR ============
     Somente os templates MIGRADOS (manifesto, split, quote) consomem
     F.composeSpec/composeBG/composeOrn; glow, cta e grid seguem os
     helpers originais acima. Nenhum adorno aleatório: ornamento vem
     do compositor (estrutural, ancorado ao grid — premissa C3). */
  const DEN = {                       // respiro → espaçamentos e sub
    air :{gap:3.2, subW:22, subS:2.6},
    mid :{gap:2.6, subW:26, subS:2.7},
    full:{gap:2.2, subW:30, subS:2.8},
  };
  const CON = {                       // contraste tipográfico título/sub
    high:{w:900, ls:'-.02em',  lh:1.0,  subO:.78},
    mid :{w:800, ls:'-.012em', lh:1.05, subO:.88},
    soft:{w:600, ls:'-.004em', lh:1.12, subO:.92},
  };
  const AI = a => a==='center' ? 'center' : (a==='right' ? 'flex-end' : 'flex-start');
  const wideFmt = () => { const f = F.FORMATS[st().format]; return f.w/f.h >= 1.3; };

  /* título honrando contraste + assinatura da direção */
  function titleC(s, r, X, size, extra=''){
    const c = CON[X.contrast];
    const upper = X.dir==='brutal' || (X.dir==='poster' && r()<.5);
    const base = `font-size:calc(var(--u)*${F.fitT ? F.fitT(size, s) : size}px);line-height:${c.lh};font-weight:${c.w};letter-spacing:${c.ls};${upper?'text-transform:uppercase;':''}${F.perspStyle(X)}${extra}`;
    const wantHl = !!(s.hl && s.hl.length);      // Eixo 2: destaque garantido
    if(X.sig==='hollow' && !wantHl) return `<h1 class="fh" data-anim="blur" style="--dur:1s;${base}">${mixTitle(s.title, r, ['','tHollow'])}</h1>`;
    if(wantHl || X.sig==='hl'||X.sig==='ub')
      return `<h1 class="fh" data-anim="clip-up" style="--dur:1s;${base}">${F.fancyTitle(s.title, r, (X.sig==='hl'||X.sig==='ub')?X.sig:undefined)}</h1>`;
    return `<h1 class="fh" data-anim="letters" style="${base}">${letters(s.title)}</h1>`;
  }
  /* kicker via design system (C7): plain/tag/badge/mono/num/dot/underline */
  function kickerC(s, X){
    return `<div style="display:flex" data-anim="clip">${F.dsys.kicker(X.ui.kicker, X, s.kicker)}</div>`;
  }
  function subC(s, X, d='1.1s'){
    const D = DEN[X.density], c = CON[X.contrast];
    return `<p data-anim="fade-up" style="--d:${d};font-size:calc(var(--u)*${F.fitS ? F.fitS(D.subS, s) : D.subS}px);line-height:1.5;opacity:${c.subO};max-width:${D.subW}em">${nl(s.sub)}</p>`;
  }
  /* divisor via design system (C7): solid/double/dotted/slashes */
  function barC(r, X, d='.95s'){
    if(X.sig!=='bar') return '';
    return F.dsys.bar(X.ui.bar, X, (8+r()*10).toFixed(0), d);
  }
  /* rodapé via design system (C7): handle e ação nas variantes da direção */
  function footerC(X){
    return `<div style="display:flex;justify-content:space-between;width:100%;align-items:center">
      ${F.dsys.handle(X.ui.handle, X)}
      ${F.dsys.cta(X.ui.cta, X, st().cta)}
    </div>`;
  }


  /* =====================================================
     MOTOR GENERATIVO · template LIVRE (S3.4)
     A tese do produto: variar não é sacudir o template —
     é COMPOR OUTRO. O Livre é o compositor puro: estrutura
     da biblioteca global (por direção), esquema, acabamento
     e design system geram um template novo a cada seed —
     a lib de templates não precisa crescer para o espaço
     de composições crescer.
     ===================================================== */
  F.composeArt = function(s, r){
    const X = F.composeSpec(r,'livre'), D = DEN[X.density], C = CON[X.contrast];
    const SW = F.schemeVars(X);
    const bg = F.composeBG(r, X, `linear-gradient(${Math.floor(r()*360)}deg,color-mix(in srgb,var(--b-p1) 14%,var(--b-bg)),var(--b-bg) 58%)`);
    const fin = F.composeFinish(r, X), orn = F.composeOrn(X);
    const ai = AI(X.align), P = 'padding:calc(var(--u)*7px)';
    const topRow = `<div style="display:flex;justify-content:space-between;width:100%;align-items:center">${logoHTML()}${kickerC(s,X)}</div>`;
    const floatImg = s.img
      ? floatImage(s.img, s.mask==='cover'?'circle':s.mask, `right:${(6+r()*4).toFixed(0)}%;top:${(8+r()*10).toFixed(0)}%;width:${(20+r()*8).toFixed(0)}%;aspect-ratio:1`) : '';

    /* ---- DIAGONAL: corte diagonal — metade invertida ou imagem ---- */
    if(X.structure==='diagonal'){
      const a = (54+r()*14).toFixed(0), b = (34+r()*14).toFixed(0);
      const half = s.img
        ? `<div class="abs" data-anim="fade" style="--dur:1s;inset:0;clip-path:polygon(${a}% 0,100% 0,100% 100%,${b}% 100%)">${imgHTML(s.img,'','style="position:absolute;inset:0"')}<div class="abs" style="inset:0;background:color-mix(in srgb,var(--b-bg) 25%,transparent)"></div></div>`
        : `<div class="abs" data-anim="fade" style="--dur:1s;inset:0;clip-path:polygon(${a}% 0,100% 0,100% 100%,${b}% 100%);background:var(--b-fg)"></div>`;
      return F.schemeWrap(SW, `${bg}${fin}${half}${orn}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;text-align:left">
      ${topRow}
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*${D.gap}px);align-items:flex-start;max-width:56%">
        ${barC(r,X)}
        ${titleC(s, r, X, (5.6+r()*1.8).toFixed(1))}
        ${subC(s,X)}
      </div>
      ${footerC(X)}
    </div>${fxHTML()}${slideBadge()}`);
    }
    /* ---- TICKER: faixas de texto repetido + palco central ---- */
    if(X.structure==='ticker'){
      const word = (s.kicker || s.title || '').split('\n')[0];
      const seq = esc((word+'  •  ').repeat(8));
      const row = (pos,d)=>`<div class="abs fh" data-anim="fade" style="--d:${d};${pos};white-space:nowrap;font-size:calc(var(--u)*3.4px);font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:.16">${seq}</div>`;
      return F.schemeWrap(SW, `${bg}${fin}${orn}
    ${row('left:-4%;top:calc(var(--u)*8px)','.2s')}
    ${row('left:-14%;bottom:calc(var(--u)*8px)','.35s')}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:calc(var(--u)*${D.gap}px)">
      ${kickerC(s,X)}
      ${titleC(s, r, X, (6.4+r()*2).toFixed(1), 'max-width:11em;')}
      ${subC(s,X)}
      ${F.dsys.cta(X.ui.cta, X, st().cta)}
    </div>
    <div class="abs" style="left:calc(var(--u)*7px);right:calc(var(--u)*7px);bottom:calc(var(--u)*14px);display:flex;justify-content:space-between;align-items:center">${logoHTML()}${F.dsys.handle(X.ui.handle, X)}</div>
    ${fxHTML()}${slideBadge()}`);
    }
    /* ---- LETTERBOX: barras cinematográficas + palco largo ---- */
    if(X.structure==='letterbox'){
      const bh = (9+r()*4).toFixed(1);
      const barBox = pos=>`<div class="abs" data-anim="clip" style="--dur:.9s;left:0;right:0;${pos}:0;height:calc(var(--u)*${bh}px);background:var(--b-fg);color:var(--b-bg);display:flex;align-items:center;justify-content:space-between;padding:0 calc(var(--u)*7px)"></div>`;
      return F.schemeWrap(SW, `${bg}${fin}
    ${barBox('top')}${barBox('bottom')}
    <div class="abs" data-anim="fade" style="--d:.3s;left:calc(var(--u)*7px);top:calc(var(--u)*${(bh/2-1.2).toFixed(1)}px);color:var(--b-bg);display:flex;align-items:center;gap:1em">${logoHTML()}</div>
    <div class="abs fm" data-anim="fade" style="--d:.4s;right:calc(var(--u)*7px);top:calc(var(--u)*${(bh/2-1).toFixed(1)}px);color:var(--b-bg);font-family:var(--fm);font-size:calc(var(--u)*1.9px);letter-spacing:.16em">${esc(s.kicker).toUpperCase()}</div>
    <div class="abs" style="left:0;right:0;top:calc(var(--u)*${bh}px);bottom:calc(var(--u)*${bh}px);${P};display:flex;flex-direction:column;justify-content:center;align-items:${ai};text-align:${X.align};gap:calc(var(--u)*${D.gap}px)">
      ${titleC(s, r, X, (5.8+r()*1.6).toFixed(1), 'max-width:13em;')}
      ${barC(r,X)}
      ${subC(s,X)}
    </div>
    <div class="abs" data-anim="fade" style="--d:1.1s;right:calc(var(--u)*7px);bottom:calc(var(--u)*${(bh/2-1).toFixed(1)}px);color:var(--b-bg);display:inline-flex">${F.dsys.handle(X.ui.handle, X, '1.1s')}</div>
    ${floatImg}${fxHTML()}${slideBadge()}`);
    }
    /* ---- BIGNUM: índice monumental como protagonista gráfico ---- */
    if(X.structure==='bignum'){
      const n = String((F.state.mode==='design'?F.state.cur:F.state.curScene)+1).padStart(2,'0');
      const side = r()<.5;
      return F.schemeWrap(SW, `${bg}${fin}${orn}
    <div class="abs fh" data-anim="blur" style="--dur:1.2s;${side?'right':'left'}:calc(var(--u)*-3px);top:50%;transform:translateY(-50%);font-size:calc(var(--u)*${(38+r()*14).toFixed(0)}px);line-height:1;font-weight:900;color:color-mix(in srgb,var(--b-${X.tone}) 26%,transparent);letter-spacing:-.04em">${n}</div>
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;justify-content:space-between;align-items:${side?'flex-start':'flex-end'};text-align:${side?'left':'right'}">
      ${topRow}
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*${D.gap}px);align-items:${side?'flex-start':'flex-end'};max-width:62%">
        ${titleC(s, r, X, (6+r()*2).toFixed(1))}
        ${barC(r,X)}
        ${subC(s,X)}
      </div>
      ${footerC(X)}
    </div>${fxHTML()}${slideBadge()}`);
    }
    /* ---- FRAMEHERO: moldura grossa + herói central; kicker rompe a borda ---- */
    if(X.structure==='framehero'){
      const bw = (0.9+r()*0.5).toFixed(2);
      return F.schemeWrap(SW, `${bg}${fin}
    <div class="abs" data-anim="fade" style="--d:.2s;inset:calc(var(--u)*4px);border:calc(var(--u)*${bw}px) solid var(--b-${X.tone});pointer-events:none"></div>
    <div class="abs" data-anim="clip" style="--d:.4s;left:50%;top:calc(var(--u)*4px);transform:translate(-50%,-50%);background:var(--b-bg);padding:.2em 1.2em;display:inline-flex">${kickerC(s,X)}</div>
    <div class="abs" style="inset:calc(var(--u)*4px);padding:calc(var(--u)*6px);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:calc(var(--u)*${D.gap}px)">
      ${logoHTML('fade-up','.3s')}
      ${titleC(s, r, X, (6+r()*1.8).toFixed(1), 'max-width:11em;')}
      ${subC(s,X)}
      ${F.dsys.cta(X.ui.cta, X, st().cta)}
    </div>
    <div class="abs" data-anim="fade-up" style="--d:1.2s;left:50%;bottom:calc(var(--u)*4px);transform:translate(-50%,50%);background:var(--b-bg);padding:.2em 1em;display:inline-flex">${F.dsys.handle(X.ui.handle, X, '1.2s')}</div>
    ${floatImg}${fxHTML()}${slideBadge()}`);
    }
    /* ---- GIANTMARK: aspas monumentais (família citação) ---- */
    if(X.structure==='giantmark'){
      return F.schemeWrap(SW, `${bg}${fin}${orn}
    <div class="abs fh" data-anim="blur" style="--dur:1.4s;left:50%;top:46%;transform:translate(-50%,-50%);font-size:calc(var(--u)*${(56+r()*14).toFixed(0)}px);line-height:1;color:var(--b-${X.tone});opacity:.16;pointer-events:none">\u201c</div>
    <div class="abs" style="inset:0;padding:calc(var(--u)*8px) calc(var(--u)*9px);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:calc(var(--u)*${D.gap}px)">
      ${kickerC(s,X)}
      ${titleC(s, r, X, (5.4+r()*1.4).toFixed(1), 'max-width:15em;')}
      ${subC(s,X)}
    </div>
    <div class="abs" style="left:calc(var(--u)*7px);right:calc(var(--u)*7px);bottom:calc(var(--u)*5px);display:flex;justify-content:space-between;align-items:center">${logoHTML('fade-up','1.2s')}${F.dsys.handle(X.ui.handle, X, '1.25s')}</div>
    ${fxHTML()}${slideBadge()}`);
    }
    /* ---- ATTRIBUTED: bloco editorial com atribuição forte ---- */
    if(X.structure==='attributed'){
      return F.schemeWrap(SW, `${bg}${fin}${orn}
    <div class="abs" style="inset:0;padding:calc(var(--u)*8px);display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*${(D.gap+0.6).toFixed(1)}px)">
      ${kickerC(s,X)}
      ${titleC(s, r, X, (5+r()*1.4).toFixed(1), 'max-width:17em;')}
      <div style="display:flex;align-items:center;gap:calc(var(--u)*2.4px)">
        ${F.dsys.bar('solid', X, '6', '1s')}
        <p data-anim="fade-up" style="--d:1.1s;font-size:calc(var(--u)*${F.fitS(2.5, s)}px);opacity:${C.subO}">${nl(s.sub)}</p>
      </div>
    </div>
    <div class="abs" style="left:calc(var(--u)*7px);right:calc(var(--u)*7px);bottom:calc(var(--u)*5px);display:flex;justify-content:space-between;align-items:center">${logoHTML('fade-up','1.2s')}${F.dsys.handle(X.ui.handle, X, '1.25s')}</div>
    ${floatImg}${fxHTML()}${slideBadge()}`);
    }
    /* ---- MONUMENTAL / BAND / ANCHOR / CENTER (família manifesto) ---- */
    if(X.structure==='monumental'){
      return F.schemeWrap(SW, `${bg}${fin}${floatImg}${orn}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;justify-content:space-between;align-items:${ai};text-align:${X.align}">
      ${topRow}
      ${titleC(s, r, X, (10.5+r()*2.4).toFixed(1), 'max-width:9.5em;')}
      <div style="display:flex;justify-content:space-between;width:100%;align-items:flex-end;gap:calc(var(--u)*4px)">
        <p data-anim="fade-up" style="--d:1.1s;font-size:calc(var(--u)*${F.fitS(2.3, s)}px);line-height:1.5;opacity:${C.subO};max-width:18em;text-align:left">${nl(s.sub)}</p>
        ${F.dsys.handle(X.ui.handle, X)}
      </div>
    </div>${fxHTML()}${slideBadge()}`);
    }
    if(X.structure==='band'){
      const Xb = {...X, sig:'none'};
      return F.schemeWrap(SW, `${bg}${fin}${orn}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;justify-content:space-between;align-items:${ai};text-align:${X.align}">
      ${topRow}
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*2.6px);align-items:${ai};align-self:stretch">
        <div data-anim="clip" style="--dur:.9s;margin:0 calc(var(--u)*-7px);background:var(--b-fg);color:var(--b-bg);padding:calc(var(--u)*3px) calc(var(--u)*7px)">
          ${titleC(s, r, Xb, (6.2+r()*1.6).toFixed(1), 'max-width:13em;')}
        </div>
        ${subC(s,X)}
      </div>
      ${footerC(X)}
    </div>${fxHTML()}${slideBadge()}`);
    }
    if(X.structure==='center'){
      return F.schemeWrap(SW, `${bg}${fin}${floatImg}${orn}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center">
      ${logoHTML()}
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*${D.gap}px);align-items:center">
        ${kickerC(s,X)}
        ${titleC(s, r, X, (6+r()*2).toFixed(1), 'max-width:13em;')}
        ${barC(r,X)}
        ${subC(s,X)}
      </div>
      ${footerC(X)}
    </div>${fxHTML()}${slideBadge()}`);
    }
    /* ANCHOR (padrão) */
    return F.schemeWrap(SW, `${bg}${fin}${floatImg}${orn}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;align-items:${ai};text-align:${X.align}">
      ${topRow}
      <div style="flex:1"></div>
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*${D.gap}px);align-items:${ai}">
        ${barC(r,X)}
        ${titleC(s, r, X, (6+r()*2.2).toFixed(1), 'max-width:14em;')}
        ${subC(s,X)}
      </div>
      <div style="height:calc(var(--u)*4px)"></div>
      ${footerC(X)}
    </div>${fxHTML()}${slideBadge()}`);
  };

  /* o template LIVRE: o compositor puro como template de verdade */
  F.templates.register('livre',{n:'Livre',d:'Composição gerada: estrutura da biblioteca global + esquema + design system — um template novo a cada seed.',
   mini:'<rect x="6" y="6" width="40" height="14" rx="2" fill="#5ee6c7"/><rect x="6" y="26" width="88" height="6" rx="2" fill="#eceef2"/><polygon points="60,6 94,6 94,20 74,20" fill="#8a86d8"/><rect x="6" y="36" width="26" height="4" rx="2" fill="#9aa0ad"/>',
   render(s,r){ return F.composeArt(s,r); }});

  /* ------------------------------------------------ MANIFESTO */  /* ------------------------------------------------ MANIFESTO */
  F.templates.register('manifesto',{n:'Manifesto',d:'Tipografia dominante; fundo, tratamento e decoração variam por seed.',
   mini:'<rect x="8" y="10" width="60" height="7" rx="2" fill="#5ee6c7"/><rect x="8" y="21" width="84" height="7" rx="2" fill="#eceef2"/><rect x="8" y="32" width="40" height="3" rx="1.5" fill="#5ee6c7"/>',
   render(s,r){
    /* Eixo 1 v2 — composição por premissas (F.composeSpec) */
    const X = F.composeSpec(r,'manifesto'), D = DEN[X.density], C = CON[X.contrast];
    const bg = s.img && s.mask==='cover' ? bgImage(s.img, veilFull)
      : F.composeBG(r, X, `linear-gradient(${Math.floor(r()*360)}deg,color-mix(in srgb,var(--b-p1) 16%,var(--b-bg)),var(--b-bg) 55%)`);
    const floatImg = s.img && s.mask!=='cover'
      ? floatImage(s.img, s.mask, `right:${(5+r()*4).toFixed(0)}%;top:${(6+r()*8).toFixed(0)}%;width:${(22+r()*8).toFixed(0)}%;aspect-ratio:1`) : '';
    const orn = F.composeOrn(X), ai = AI(X.align);
    const SW = F.schemeVars(X), fin = F.composeFinish(r, X);   // C8/C9
    const P = 'padding:calc(var(--u)*7px)';
    const topRow = `<div style="display:flex;justify-content:space-between;width:100%;align-items:center">${logoHTML()}${kickerC(s,X)}</div>`;

    /* MONUMENTAL — a tipografia é o protagonista (C2): título 10.5–13u,
       sub curto no rodapé; fundo já subordinado pelo compositor */
    if(X.structure==='monumental'){
      return F.schemeWrap(SW, `${bg}${fin}${floatImg}${orn}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;justify-content:space-between;align-items:${ai};text-align:${X.align}">
      ${topRow}
      ${titleC(s, r, X, (10.5+r()*2.4).toFixed(1), 'max-width:9.5em;')}
      <div style="display:flex;justify-content:space-between;width:100%;align-items:flex-end;gap:calc(var(--u)*4px)">
        <p data-anim="fade-up" style="--d:1.1s;font-size:calc(var(--u)*${F.fitS(2.3, s)}px);line-height:1.5;opacity:${C.subO};max-width:18em;text-align:left">${nl(s.sub)}</p>
        ${F.dsys.handle(X.ui.handle, X)}
      </div>
    </div>${fxHTML()}${slideBadge()}`);
    }
    /* BAND — faixa invertida fg/bg atravessando a arte: contraste
       garantido por construção (C5); a faixa é a assinatura */
    if(X.structure==='band'){
      const Xb = {...X, sig:'none'};
      return F.schemeWrap(SW, `${bg}${fin}${orn}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;justify-content:space-between;align-items:${ai};text-align:${X.align}">
      ${topRow}
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*2.6px);align-items:${ai};align-self:stretch">
        <div data-anim="clip" style="--dur:.9s;margin:0 calc(var(--u)*-7px);background:var(--b-fg);color:var(--b-bg);padding:calc(var(--u)*3px) calc(var(--u)*7px)">
          ${titleC(s, r, Xb, (6.2+r()*1.6).toFixed(1), 'max-width:13em;')}
        </div>
        ${subC(s,X)}
      </div>
      ${footerC(X)}
    </div>${fxHTML()}${slideBadge()}`);
    }
    /* ANCHOR — bloco editorial ancorado na base, kicker no topo */
    if(X.structure==='anchor'){
      return F.schemeWrap(SW, `${bg}${fin}${floatImg}${orn}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;align-items:${ai};text-align:${X.align}">
      ${topRow}
      <div style="flex:1"></div>
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*${D.gap}px);align-items:${ai}">
        ${barC(r,X)}
        ${titleC(s, r, X, (6+r()*2.2).toFixed(1), 'max-width:14em;')}
        ${subC(s,X)}
      </div>
      <div style="height:calc(var(--u)*4px)"></div>
      ${footerC(X)}
    </div>${fxHTML()}${slideBadge()}`);
    }
    /* CENTER — palco central simétrico */
    if(X.structure==='center'){
      return F.schemeWrap(SW, `${bg}${fin}${floatImg}${orn}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center">
      ${logoHTML()}
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*${D.gap}px);align-items:center">
        ${kickerC(s,X)}
        ${titleC(s, r, X, (6+r()*2).toFixed(1), 'max-width:13em;')}
        ${barC(r,X)}
        ${subC(s,X)}
      </div>
      ${footerC(X)}
    </div>${fxHTML()}${slideBadge()}`);
    }
    /* CLASSIC — o manifesto original, dirigido pelos eixos coerentes */
    return F.schemeWrap(SW, `${bg}${fin}${floatImg}${orn}
    <div class="abs" style="inset:0;${P};display:flex;flex-direction:column;justify-content:space-between;align-items:${ai};text-align:${X.align}">
      ${logoHTML()}
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*${D.gap}px);align-items:${ai}">
        ${kickerC(s,X)}
        ${titleC(s, r, X, (6+r()*3).toFixed(1), 'max-width:14em;')}
        ${barC(r,X)}
        ${subC(s,X)}
      </div>
      ${footerC(X)}
    </div>${fxHTML()}${slideBadge()}`);
  }});

  /* ------------------------------------------------ SPLIT */
  F.templates.register('split',{n:'Split',d:'Metade imagem, metade texto; lado, fundo e tom variam.',
   mini:'<rect x="52" y="6" width="42" height="32" rx="4" fill="#3b3f4c"/><rect x="8" y="12" width="36" height="6" rx="2" fill="#eceef2"/><rect x="8" y="22" width="28" height="3" rx="1.5" fill="#9aa0ad"/><rect x="8" y="29" width="18" height="5" rx="2.5" fill="#5ee6c7"/>',
   render(s,r){
    /* Eixo 1 v2 — composição por premissas; 'stack' cai para 'half'
       em formato largo (faixa superior rasa demais — P4) */
    const X = F.composeSpec(r,'split'), D = DEN[X.density], C = CON[X.contrast];
    if(X.structure==='stack' && wideFmt()) X.structure = 'half';
    const flip = r()<.45, isCover = s.mask==='cover';
    const orn = F.composeOrn(X);
    const bg = F.composeBG(r, X, `radial-gradient(120% 120% at ${flip?'85%':'15%'} 20%,color-mix(in srgb,var(--b-p1) 22%,var(--b-bg)),var(--b-bg))`);
    const alc = AI(X.align==='right' ? 'left' : X.align);
    const SW = F.schemeVars(X), fin = F.composeFinish(r, X);   // C8/C9
    const ta  = X.align==='center' ? 'center' : 'left';
    const stack = `<div style="display:flex;flex-direction:column;gap:calc(var(--u)*${(D.gap-0.2).toFixed(1)}px);align-items:${alc}">
        ${kickerC(s,X)}
        ${titleC(s, r, X, (5+r()*1.4).toFixed(1))}
        ${barC(r,X,'.7s')}
        <p data-anim="fade-up" style="--d:.6s;font-size:calc(var(--u)*${F.fitS((D.subS-0.1).toFixed(1), s)}px);line-height:1.5;opacity:${C.subO}">${nl(s.sub)}</p>
        ${st().cta?`<span data-anim="pop" style="--d:.85s;align-self:${alc};display:inline-flex">${F.dsys.cta(X.ui.cta, X, st().cta, '.85s')}</span>`:''}
      </div>`;

    /* STACK — corte horizontal: imagem em faixa superior, texto embaixo */
    if(X.structure==='stack'){
      const hImg = (40+r()*10).toFixed(0);
      const imgTop = isCover
        ? `<div class="abs" data-anim="clip" style="--dur:1.1s;left:0;right:0;top:0;height:${hImg}%">${imgHTML(s.img,'','style="position:absolute;inset:0"')}</div>`
        : `<div class="abs" data-anim="clip" style="--dur:1.1s;left:0;right:0;top:0;height:${hImg}%;display:grid;place-items:center">${floatImage(s.img, s.mask, 'position:relative;width:30%;aspect-ratio:1')}</div>`;
      return F.schemeWrap(SW, `${bg}${fin}${imgTop}${orn}
    <div class="abs" style="left:0;right:0;bottom:0;top:${hImg}%;padding:calc(var(--u)*6px) calc(var(--u)*7px);display:flex;flex-direction:column;justify-content:space-between;align-items:${alc};text-align:${ta}">
      ${stack}
      <div style="display:flex;justify-content:space-between;width:100%;align-items:center">${logoHTML()}${F.dsys.handle(X.ui.handle, X, '1s')}</div>
    </div>${fxHTML()}${slideBadge()}`);
    }
    /* PANEL — imagem full-bleed + cartão de texto sobreposto */
    if(X.structure==='panel'){
      const base = s.img ? bgImage(s.img, veilSide(flip?'270deg':'90deg')) : bg;
      return F.schemeWrap(SW, `${base}${fin}${orn}
    <div class="abs" data-anim="rise" style="--dur:1s;${flip?'right':'left'}:calc(var(--u)*6px);top:50%;transform:translateY(-50%);width:46%;${F.dsys.cardStyle(X.ui.card, X)}padding:calc(var(--u)*5px);display:flex;flex-direction:column;gap:calc(var(--u)*2.2px);align-items:flex-start;text-align:left">
      ${logoHTML()}
      ${kickerC(s,X)}
      ${titleC(s, r, X, (4.6+r()*1.2).toFixed(1))}
      <p data-anim="fade-up" style="--d:.6s;font-size:calc(var(--u)*${F.fitS(2.5, s)}px);line-height:1.5;opacity:${C.subO}">${nl(s.sub)}</p>
      ${st().cta?`<span data-anim="pop" style="--d:.85s;display:inline-flex">${F.dsys.cta(X.ui.cta, X, st().cta, '.85s')}</span>`:''}
    </div>
    <span class="abs" data-anim="fade-up" style="--d:1.1s;${flip?'left':'right'}:calc(var(--u)*7px);bottom:calc(var(--u)*5px);display:inline-flex">${F.dsys.handle(X.ui.handle, X, '1.1s')}</span>
    ${fxHTML()}${slideBadge()}`);
    }
    /* COLUMN — coluna estreita de texto + imagem dominante + régua divisória */
    if(X.structure==='column'){
      const tw = (38+r()*4).toFixed(0);
      const imgSide = isCover
        ? `<div class="abs" data-anim="clip${flip?'':'-up'}" style="--dur:1.1s;${flip?'left':'right'}:0;top:0;bottom:0;width:${(100-tw)}%">${imgHTML(s.img,'','style="position:absolute;inset:0"')}</div>`
        : floatImage(s.img, s.mask, `${flip?'left':'right'}:${((100-tw)/2-17).toFixed(0)}%;top:50%;transform:translateY(-50%);width:34%;aspect-ratio:1`);
      const divider = `<div class="abs" data-anim="line-y" style="--d:.5s;--dur:.8s;${flip?'right':'left'}:${tw}%;top:calc(var(--u)*7px);bottom:calc(var(--u)*7px);width:1px;background:color-mix(in srgb,var(--b-fg) 20%,transparent)"></div>`;
      return F.schemeWrap(SW, `${bg}${fin}${imgSide}${divider}${orn}
    <div class="abs" style="${flip?'right':'left'}:0;top:0;bottom:0;width:${tw}%;padding:calc(var(--u)*7px) calc(var(--u)*5px) calc(var(--u)*7px) calc(var(--u)*7px);display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;text-align:left">
      ${logoHTML()}
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*${(D.gap-0.2).toFixed(1)}px);align-items:flex-start">
        ${kickerC(s,X)}
        ${titleC(s, r, X, (4.6+r()*1.2).toFixed(1))}
        ${barC(r,X,'.7s')}
        <p data-anim="fade-up" style="--d:.6s;font-size:calc(var(--u)*${F.fitS(2.4, s)}px);line-height:1.5;opacity:${C.subO}">${nl(s.sub)}</p>
        ${st().cta?`<span data-anim="pop" style="--d:.85s;display:inline-flex">${F.dsys.cta(X.ui.cta, X, st().cta, '.85s')}</span>`:''}
      </div>
      ${F.dsys.handle(X.ui.handle, X, '1s')}
    </div>${fxHTML()}${slideBadge()}`);
    }
    /* HALF — o split original, dirigido pelos eixos coerentes */
    const imgBox = isCover
      ? `<div class="abs" data-anim="clip${flip?'':'-up'}" style="--dur:1.1s;${flip?'left':'right'}:0;top:0;bottom:0;width:${(42+r()*8).toFixed(0)}%">${imgHTML(s.img,'','style="position:absolute;inset:0"')}</div>`
      : floatImage(s.img, s.mask, `${flip?'left':'right'}:6%;top:50%;transform:translateY(-50%);width:${(32+r()*10).toFixed(0)}%;aspect-ratio:1`);
    return F.schemeWrap(SW, `${bg}${fin}${imgBox}${orn}
    <div class="abs" style="${flip?'right':'left'}:0;top:0;bottom:0;width:52%;padding:calc(var(--u)*7px);display:flex;flex-direction:column;justify-content:space-between;align-items:${alc};text-align:${ta}">
      ${logoHTML()}
      ${stack}
      ${F.dsys.handle(X.ui.handle, X, '1s')}
    </div>${fxHTML()}${slideBadge()}`);
  }});

  /* ------------------------------------------------ GLOW */
  F.templates.register('glow',{n:'Glow',d:'Aurora/orbes + cartão de vidro (comum ou liquid glass).',
   mini:'<circle cx="20" cy="12" r="12" fill="#4f46e5" opacity=".7"/><circle cx="80" cy="34" r="14" fill="#22d3ee" opacity=".6"/><rect x="24" y="12" width="52" height="22" rx="5" fill="#eceef2" opacity=".14" stroke="#eceef2" stroke-opacity=".4"/>',
   render(s,r){
    /* S3.3 — migração leve: identidade (vidro + orbes) preservada;
       esquema, acabamento e design system por cima; estrutura 'halo'
       troca o cartão por um halo de luz atrás do conteúdo */
    const X = F.composeSpec(r,'glow'), SW = F.schemeVars(X);
    const fin = F.composeFinish(r, {...X, finish: X.finish==='none' ? 'liquid' : X.finish});
    const glass = (X.ui.card==='glass' && X.scheme==='dark') ? pick(r,['glass','glass2','glass2']) : '';
    const bg = s.img && s.mask==='cover' ? bgImage(s.img, veilFull)
      : pick(r,[F.bgs.get('aurora'), F.bgs.get('mesh'), F.bgs.get('sweep')])(r);
    const floatImg = s.img && s.mask!=='cover'
      ? floatImage(s.img, s.mask, 'left:50%;top:0;transform:translate(-50%,-30%);width:30%;aspect-ratio:1','pop') : '';
    const inner = `${logoHTML('fade-up','.3s')}
        <div data-anim="clip" style="--d:.45s;display:flex">${F.dsys.kicker(X.ui.kicker, X, s.kicker)}</div>
        ${titleHTML(s, r, (4.8+r()*1.4).toFixed(1), 'text-align:center;')}
        <p data-anim="fade-up" style="--d:1.15s;font-size:calc(var(--u)*${F.fitS(2.6, s)}px);line-height:1.5;opacity:.88;max-width:30em">${nl(s.sub)}</p>
        ${st().cta?`<span data-anim="pop" style="--d:1.35s;display:inline-flex">${F.dsys.cta(X.ui.cta, X, st().cta, '1.35s')}</span>`:''}`;
    const box = X.structure==='halo'
      ? `<div class="abs" data-anim="fade" style="--dur:1.2s;left:50%;top:44%;transform:translate(-50%,-50%);width:72%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--b-${X.tone}) 24%,transparent),transparent 62%)"></div>
        <div class="abs" style="inset:0;display:grid;place-items:center;padding:calc(var(--u)*6px)">
          <div data-anim="scale" style="--dur:1s;max-width:72%;display:flex;flex-direction:column;gap:calc(var(--u)*2.6px);align-items:center;text-align:center">${inner}</div>
        </div>`
      : `<div class="abs" style="inset:0;display:grid;place-items:center;padding:calc(var(--u)*6px)">
          <div class="${glass}" data-anim="scale" style="--dur:1s;${glass?'':F.dsys.cardStyle(X.ui.card, X)}max-width:78%;padding:calc(var(--u)*6px) calc(var(--u)*7px);display:flex;flex-direction:column;gap:calc(var(--u)*2.6px);align-items:center;text-align:center">${inner}</div>
        </div>`;
    return F.schemeWrap(SW, `${bg}${fin}${box}${floatImg}
    <div class="abs" data-anim="fade-up" style="--d:1.5s;left:50%;bottom:calc(var(--u)*4px);transform:translateX(-50%);display:inline-flex">${F.dsys.handle(X.ui.handle, X, '1.5s')}</div>
    ${fxHTML()}${slideBadge()}`);
  }});

  /* ------------------------------------------------ CITAÇÃO */
  F.templates.register('quote',{n:'Citação',d:'Aspas monumentais; fundo e tom variam por seed.',
   mini:'<text x="8" y="30" font-size="30" fill="#5ee6c7" font-family="serif">\u201c</text><rect x="30" y="14" width="58" height="5" rx="2" fill="#eceef2"/><rect x="30" y="23" width="44" height="5" rx="2" fill="#eceef2"/>',
   render(s,r){
    /* Eixo 1 v2 — composição por premissas; contraste vira peso de
       citação (700/600/500) — leitura mais leve que o manifesto */
    const X = F.composeSpec(r,'quote'), D = DEN[X.density], C = CON[X.contrast];
    const qw = {high:700, mid:600, soft:500}[X.contrast];
    const bg = s.img && s.mask==='cover' ? bgImage(s.img, veilSide('90deg'))
      : F.composeBG(r, X, `linear-gradient(180deg,var(--b-bg),color-mix(in srgb,var(--b-${X.tone}) 10%,var(--b-bg)))`);
    const portrait = s.img && s.mask!=='cover'
      ? floatImage(s.img, s.mask==='blob'?'blob':'circle', 'right:7%;bottom:16%;width:20%;aspect-ratio:1','pop') : '';
    const orn = F.composeOrn(X);
    const SW = F.schemeVars(X), fin = F.composeFinish(r, X);   // C8/C9
    const wantHl = !!(s.hl && s.hl.length);      // Eixo 2: destaque garantido
    const tBody = (X.sig==='hollow' && !wantHl) ? mixTitle(s.title, r, ['','tHollow'])
                : (wantHl || X.sig==='hl'||X.sig==='ub') ? F.fancyTitle(s.title, r, (X.sig==='hl'||X.sig==='ub')?X.sig:undefined)
                : letters(s.title);
    const tAnim = (X.sig==='hollow' && !wantHl) ? 'blur' : (wantHl || X.sig==='hl'||X.sig==='ub') ? 'clip-up' : 'letters';
    const footer = `<div class="abs" style="left:calc(var(--u)*7px);right:calc(var(--u)*7px);bottom:calc(var(--u)*5px);display:flex;justify-content:space-between;align-items:center">
      ${logoHTML('fade-up','1.3s')}${F.dsys.handle(X.ui.handle, X, '1.35s')}
    </div>`;

    /* GIANTMARK — as aspas são o protagonista gráfico (C2): marca
       monumental translúcida atrás do texto centrado */
    if(X.structure==='giantmark'){
      return F.schemeWrap(SW, `${bg}${fin}${orn}
    <div class="abs fh" data-anim="blur" style="--dur:1.4s;left:50%;top:46%;transform:translate(-50%,-50%);font-size:calc(var(--u)*${(56+r()*16).toFixed(0)}px);line-height:1;color:var(--b-${X.tone});opacity:.14;pointer-events:none">\u201c</div>
    <div class="abs" style="inset:0;padding:calc(var(--u)*8px) calc(var(--u)*9px);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:calc(var(--u)*${D.gap}px)">
      <h1 class="fh" data-anim="${tAnim}" style="--t0:.35s;${tAnim!=='letters'?'--dur:1s;':''}font-size:calc(var(--u)*${F.fitT((5.6+r()*1.4).toFixed(1), s)}px);line-height:1.22;font-weight:${qw};max-width:15em">${tBody}</h1>
      <div style="display:flex;align-items:center;gap:calc(var(--u)*2px)">
        ${X.sig==='bar'?`<div class="bar" data-anim="line" style="--d:1.05s;width:calc(var(--u)*6px);background:var(--b-${X.tone})"></div>`:''}
        <p data-anim="fade-up" style="--d:1.15s;font-size:calc(var(--u)*${F.fitS(D.subS, s)}px);opacity:${C.subO}">${nl(s.sub)}</p>
      </div>
    </div>${portrait}${footer}${fxHTML()}${slideBadge()}`);
    }
    /* ATTRIBUTED — citação editorial + bloco de atribuição forte */
    if(X.structure==='attributed'){
      const face = s.img && s.mask!=='cover'
        ? floatImage(s.img, 'circle', 'position:relative;width:calc(var(--u)*9px);aspect-ratio:1;flex:0 0 auto','pop') : '';
      return F.schemeWrap(SW, `${bg}${fin}${orn}
    <div class="abs" style="inset:0;padding:calc(var(--u)*8px);display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*${(D.gap+0.6).toFixed(1)}px)">
      <div class="fh" data-anim="fade" style="font-size:calc(var(--u)*9px);line-height:.6;color:var(--b-${X.tone})">\u201c</div>
      <h1 class="fh" data-anim="${tAnim}" style="--t0:.3s;${tAnim!=='letters'?'--dur:1s;':''}font-size:calc(var(--u)*${F.fitT((4.8+r()*1.2).toFixed(1), s)}px);line-height:1.24;font-weight:${qw};max-width:17em">${tBody}</h1>
      <div style="display:flex;align-items:center;gap:calc(var(--u)*2.4px)">
        ${face}
        <div class="bar" data-anim="line-y" style="--d:1s;--dur:.7s;width:calc(var(--u)*0.6px);height:calc(var(--u)*6px);background:var(--b-${X.tone})"></div>
        <div style="display:flex;flex-direction:column;gap:calc(var(--u)*0.5px)">
          <strong data-anim="fade-up" style="--d:1.1s;font-size:calc(var(--u)*2.6px);font-weight:800">${nl(s.sub)}</strong>
          <span class="kicker" data-anim="fade-up" style="--d:1.2s;color:var(--b-${X.tone})">${esc(s.kicker)}</span>
        </div>
      </div>
    </div>${footer}${fxHTML()}${slideBadge()}`);
    }
    /* CENTERED — palco central com aspas no eixo */
    if(X.structure==='centered'){
      return F.schemeWrap(SW, `${bg}${fin}${orn}
    <div class="abs fh" data-anim="blur" style="left:50%;transform:translateX(-50%);top:calc(var(--u)*4px);font-size:calc(var(--u)*${(16+r()*6).toFixed(0)}px);line-height:1;color:var(--b-${X.tone});opacity:.9">\u201c</div>
    <div class="abs" style="inset:0;padding:calc(var(--u)*8px) calc(var(--u)*9px);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:calc(var(--u)*${D.gap}px)">
      <h1 class="fh" data-anim="${tAnim}" style="--t0:.35s;${tAnim!=='letters'?'--dur:1s;':''}font-size:calc(var(--u)*${F.fitT((5.2+r()*1.4).toFixed(1), s)}px);line-height:1.22;font-weight:${qw};max-width:15em;margin-top:calc(var(--u)*7px)">${tBody}</h1>
      <div style="display:flex;align-items:center;gap:calc(var(--u)*2px)">
        ${X.sig==='bar'?`<div class="bar" data-anim="line" style="--d:1.05s;width:calc(var(--u)*6px);background:var(--b-${X.tone})"></div>`:''}
        <p data-anim="fade-up" style="--d:1.15s;font-size:calc(var(--u)*${F.fitS(D.subS, s)}px);opacity:${C.subO}">${nl(s.sub)}</p>
      </div>
    </div>${portrait}${footer}${fxHTML()}${slideBadge()}`);
    }
    /* CLASSIC — a citação original, dirigida pelos eixos coerentes */
    return F.schemeWrap(SW, `${bg}${fin}${orn}
    <div class="abs fh" data-anim="blur" style="left:calc(var(--u)*5px);top:calc(var(--u)*-2px);font-size:calc(var(--u)*${(22+r()*8).toFixed(0)}px);line-height:1;color:var(--b-${X.tone});opacity:.9">\u201c</div>
    <div class="abs" style="inset:0;padding:calc(var(--u)*7px) calc(var(--u)*8px);display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*${D.gap}px)">
      <h1 class="fh" data-anim="${tAnim}" style="--t0:.35s;${tAnim!=='letters'?'--dur:1s;':''}font-size:calc(var(--u)*${F.fitT((5.2+r()*1.4).toFixed(1), s)}px);line-height:1.18;font-weight:${qw};max-width:16em;margin-top:calc(var(--u)*6px)">${tBody}</h1>
      <div style="display:flex;align-items:center;gap:calc(var(--u)*2px)">
        ${X.sig==='bar'?`<div class="bar" data-anim="line" style="--d:1.05s;width:calc(var(--u)*8px);background:var(--b-${X.tone})"></div>`:''}
        <p data-anim="fade-up" style="--d:1.15s;font-size:calc(var(--u)*${F.fitS(D.subS, s)}px);opacity:${C.subO}">${nl(s.sub)}</p>
      </div>
    </div>${portrait}${footer}${fxHTML()}${slideBadge()}`);
  }});

  /* ------------------------------------------------ PRODUTO/CTA */
  F.templates.register('cta',{n:'Produto/CTA',d:'Imagem em destaque com selo; rotação, máscara e fundo variam.',
   mini:'<circle cx="68" cy="22" r="16" fill="#3b3f4c"/><circle cx="80" cy="10" r="6" fill="#ffb020"/><rect x="8" y="14" width="34" height="6" rx="2" fill="#eceef2"/><rect x="8" y="26" width="22" height="6" rx="3" fill="#5ee6c7"/>',
   render(s,r){
    /* S3.3 — migração leve: identidade (produto + selo) preservada;
       esquema e design system por cima; estrutura 'tilt' inclina a
       vitrine e o título em perspectiva */
    const X = F.composeSpec(r,'cta'), SW = F.schemeVars(X);
    const fin = F.composeFinish(r, X);
    const tilt = X.structure==='tilt';
    const rot=((r()*14-7)*(tilt?1.8:1)).toFixed(1), tn = X.tone;
    const persp = tilt ? F.perspStyle({finish:'persp', align:'left'}) : '';
    const mask = s.mask==='cover' ? pick(r,['arch','circle','window']) : s.mask;
    const bg = bgPick(r, `radial-gradient(90% 90% at 78% 30%,color-mix(in srgb,var(--b-p1) 30%,var(--b-bg)),transparent 60%),radial-gradient(70% 70% at 20% 90%,color-mix(in srgb,var(--b-p2) 18%,var(--b-bg)),transparent 55%),var(--b-bg)`);
    return F.schemeWrap(SW, `${bg}${fin}
    <div class="abs" data-anim="scale" style="--dur:1.1s;right:7%;top:50%;transform:translateY(-50%) rotate(${rot}deg);width:${(38+r()*8).toFixed(0)}%;aspect-ratio:1">
      <div class="abs" data-anim="float" style="inset:0">${imgHTML(s.img,{circle:'mask-circle',blob:'mask-blob',arch:'mask-arch',window:'mask-window'}[mask]||'mask-arch','style="position:absolute;inset:0"')}</div>
      <div class="abs" data-anim="pop" style="--d:.9s;right:-4%;top:-6%;display:flex;align-items:center;gap:.4em;background:var(--b-${tn});color:var(--b-bg);font-weight:800;font-size:calc(var(--u)*2.4px);padding:.7em 1em;border-radius:99px;transform:rotate(${(4+r()*8).toFixed(0)}deg)">${icon(st().accentIcon)} ${esc(s.kicker)||'NOVO'}</div>
    </div>
    <div class="abs" style="left:0;top:0;bottom:0;width:50%;padding:calc(var(--u)*7px);display:flex;flex-direction:column;justify-content:space-between">
      ${logoHTML()}
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*2.4px)">
        <div style="${persp}">${titleHTML(s, r, (5.2+r()*1.4).toFixed(1))}</div>
        <p data-anim="fade-up" style="--d:.55s;font-size:calc(var(--u)*${F.fitS(2.6, s)}px);line-height:1.5;opacity:.88">${nl(s.sub)}</p>
        ${st().cta?`<span data-anim="pop" style="--d:.8s;align-self:flex-start;display:inline-flex">${F.dsys.cta(X.ui.cta, X, st().cta, '.8s')}</span>`:''}
      </div>
      ${F.dsys.handle(X.ui.handle, X, '1s')}
    </div>${fxHTML()}${slideBadge()}`);
  }});

  /* ------------------------------------------------ GRID SUÍÇO */
  F.templates.register('grid',{n:'Grid Suíço',d:'Linhas técnicas; colunas, fundo e tratamento variam.',
   mini:'<path d="M25 0V44 M50 0V44 M75 0V44 M0 15H100 M0 30H100" stroke="#2c2f38"/><rect x="8" y="18" width="50" height="8" rx="1" fill="#eceef2"/><rect x="8" y="6" width="14" height="4" rx="1" fill="#5ee6c7"/>',
   render(s,r){
    /* S3.3 — migração leve com RESTRIÇÃO DE IDENTIDADE: o corpo suíço
       (colunas, réguas, mono) é intocado; variam apenas o esquema de
       superfície e as variantes de handle/ação do design system */
    const X = F.composeSpec(r,'grid'), SW = F.schemeVars(X);
    const cols = pick(r,[4,5,6]), tn = tone(r);
    let lines='';
    for(let i=1;i<cols;i++) lines += `<div class="abs" data-anim="line-y" style="--d:${(i*.06).toFixed(2)}s;--dur:.7s;left:${(100/cols*i).toFixed(2)}%;top:0;bottom:0;width:1px;background:color-mix(in srgb,var(--b-fg) 14%,transparent)"></div>`;
    lines += `<div class="abs" data-anim="line" style="--d:.3s;left:0;right:0;top:26%;height:1px;background:color-mix(in srgb,var(--b-fg) 14%,transparent)"></div>
              <div class="abs" data-anim="line" style="--d:.4s;left:0;right:0;bottom:20%;height:1px;background:color-mix(in srgb,var(--b-fg) 14%,transparent)"></div>`;
    const bg = s.img && s.mask==='cover' ? bgImage(s.img, veilFull)
      : pick(r,[F.bgs.get('dots'), F.bgs.get('gridpaper'), F.bgs.get('spotlight'), r2=>`<div class="abs" style="inset:0;background:var(--b-bg)"></div>`])(r);
    const cell = s.img && s.mask!=='cover'
      ? `<div class="abs" data-anim="clip-up" style="--d:.5s;--dur:1s;right:${(100/cols*0.15).toFixed(1)}%;top:29%;width:${(100/cols*1.7).toFixed(1)}%;aspect-ratio:1">${imgHTML(s.img,{circle:'mask-circle',blob:'mask-blob',arch:'mask-arch',window:'mask-window'}[s.mask]||'mask-window','style="position:absolute;inset:0"')}</div>` : '';
    return F.schemeWrap(SW, `${bg}${lines}${cell}
    <div class="abs" style="left:calc(var(--u)*6px);top:calc(var(--u)*5px);right:calc(var(--u)*6px);display:flex;justify-content:space-between;align-items:center">
      ${logoHTML()}
      <span class="kicker" data-anim="clip" style="--d:.2s;color:var(--b-${tn})">${esc(s.kicker)}</span>
    </div>
    <div class="abs" style="left:calc(var(--u)*6px);right:calc(var(--u)*6px);top:31%;display:flex;flex-direction:column;gap:calc(var(--u)*2.6px)">
      ${titleHTML(s, r, (6.4+r()*1.4).toFixed(1), s.img&&s.mask!=='cover'?'max-width:9em;':'')}
      <div style="display:flex;gap:calc(var(--u)*1.4px);align-items:center">
        <span data-anim="pop" style="--d:1s;color:var(--b-${tn});font-size:calc(var(--u)*2.6px);display:flex">${icon(st().accentIcon)}</span>
        <p data-anim="slide-l" style="--d:1.05s;font-size:calc(var(--u)*${F.fitS(2.6, s)}px);opacity:.88;max-width:34em">${nl(s.sub)}</p>
      </div>
    </div>
    <div class="abs" style="left:calc(var(--u)*6px);right:calc(var(--u)*6px);bottom:calc(var(--u)*5px);display:flex;justify-content:space-between;align-items:center">
      ${F.dsys.handle(X.ui.handle, X, '1.2s')}
      ${st().cta?`<span data-anim="pop" style="--d:1.3s;display:inline-flex">${F.dsys.cta(X.ui.cta, X, st().cta, '1.3s')}</span>`:''}
    </div>${fxHTML()}${slideBadge()}`);
  }});
})(window.FORMA);
