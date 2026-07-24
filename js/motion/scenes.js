/* =====================================================
   FORJE·studio — motion/scenes.js
   Cenas: blocos compositáveis da timeline de motion.
   Contrato: FORMA.scenes.register(id, {
     n, d, dur (padrão ms), fields:[campos editáveis],
     render(scene, rng?) -> html  // rng opcional (fase 1.3):
     derivado de seedOf('layout') por cena; cenas que não o usam
     permanecem idênticas (retrocompatível)
   })
   Campos possíveis: kicker,title,sub,icon,img,value,suffix,items,cta
   Contadores: elementos com [data-count][data-to][data-suffix]
   são atualizados pelo player conforme o tempo da cena.
   ===================================================== */
(function(F){
  const {esc, nl, letters, logoHTML, imgHTML, bgImage, floatImage, icon, fxHTML, sceneBG, sceneFloat} = F;
  const st = () => F.state;
  const center = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:calc(var(--u)*2.6px);padding:calc(var(--u)*8px)';

  /* -------------------------------------------- ABERTURA / LOGO */
  F.scenes.register('intro',{n:'Abertura de logo',d:'Logo revela com anel desenhado.',dur:2400,fields:['kicker'],
   render(s){ return `
    ${sceneBG(s,`radial-gradient(70% 70% at 50% 45%,color-mix(in srgb,var(--b-p1) 18%,var(--b-bg)),var(--b-bg))`)}
    <div style="${center}">
      <div class="abs" data-anim="draw" style="--dash:640;--dur:1.2s;left:50%;top:50%;transform:translate(-50%,-50%);width:calc(var(--u)*34px);aspect-ratio:1;color:var(--b-ac)">
        <svg class="ic" viewBox="0 0 200 200" style="width:100%;height:100%;stroke-width:2"><circle cx="100" cy="100" r="96"/></svg></div>
      <div data-anim="blur" style="--d:.5s;--dur:1s;transform:scale(1.6)">${st().brand.logo
        ? `<img class="logo" style="height:calc(var(--u)*10px)" src="${st().brand.logo}" alt="">`
        : `<div class="logotype" style="font-size:calc(var(--u)*6px)">${esc(st().brand.name)}</div>`}</div>
      ${s.kicker?`<div class="kicker" data-anim="fade-up" style="--d:1.1s;color:var(--b-ac);margin-top:calc(var(--u)*8px)">${esc(s.kicker)}</div>`:''}
    </div>${sceneFloat(s)}${fxHTML()}`; }});

  /* -------------------------------------------- STATEMENT */
  F.scenes.register('statement',{n:'Statement',d:'Frase de impacto letra a letra.',dur:3000,fields:['kicker','title','sub'],
   render(s){ return `
    ${sceneBG(s,`var(--b-bg)`)}
    <div style="${center}">
      ${s.kicker?`<div style="display:flex;align-items:center;gap:.6em" data-anim="clip">
        <span style="color:var(--b-ac);font-size:calc(var(--u)*2.8px);display:flex">${icon(s.icon||st().accentIcon)}</span>
        <span class="kicker" style="color:var(--b-ac)">${esc(s.kicker)}</span></div>`:''}
      <h1 class="fh" data-anim="letters" style="--t0:.3s;font-size:calc(var(--u)*7px);line-height:1.05;font-weight:800;max-width:12em">${letters(s.title)}</h1>
      <div class="bar" data-anim="line" style="--d:1s;width:calc(var(--u)*14px)"></div>
      ${s.sub?`<p data-anim="fade-up" style="--d:1.15s;font-size:calc(var(--u)*2.8px);opacity:.88;max-width:26em;line-height:1.5">${nl(s.sub)}</p>`:''}
    </div>${sceneFloat(s)}${fxHTML()}`; }});

  /* -------------------------------------------- PONTO COM ÍCONE */
  F.scenes.register('icon-point',{n:'Ponto com ícone',d:'Ícone grande + título + apoio. Bom para bullets.',dur:2800,fields:['title','sub','icon'],
   render(s){ return `
    ${sceneBG(s,`linear-gradient(160deg,color-mix(in srgb,var(--b-p1) 14%,var(--b-bg)),var(--b-bg) 60%)`)}
    <div style="${center}">
      <div class="iconbox" data-anim="pop" style="width:calc(var(--u)*16px);aspect-ratio:1;font-size:calc(var(--u)*8px)">
        <span data-anim="float" style="display:flex">${icon(s.icon)}</span></div>
      <h1 class="fh" data-anim="rise" style="--d:.35s;font-size:calc(var(--u)*5.6px);font-weight:800;max-width:13em;line-height:1.08">${nl(s.title)}</h1>
      ${s.sub?`<p data-anim="fade-up" style="--d:.6s;font-size:calc(var(--u)*2.8px);opacity:.88;max-width:26em;line-height:1.5">${nl(s.sub)}</p>`:''}
    </div>${sceneFloat(s)}${fxHTML()}`; }});

  /* -------------------------------------------- IMAGEM */
  F.scenes.register('image',{n:'Vitrine de imagem',d:'Imagem da cena com máscara e legenda.',dur:3000,fields:['kicker','title','img'],
   render(s){
    return `
    ${s.img ? bgImage(s.img, `linear-gradient(180deg,transparent 30%,color-mix(in srgb,var(--b-bg) 92%,transparent))`)
            : `<div class="abs" style="inset:0;background:var(--b-bg)"></div><div style="${center}">${imgHTML(null,'mask-window','style="width:60%;aspect-ratio:16/10"')}</div>`}
    <div class="abs" style="left:calc(var(--u)*7px);right:calc(var(--u)*7px);bottom:calc(var(--u)*7px);display:flex;flex-direction:column;gap:calc(var(--u)*1.6px)">
      ${s.kicker?`<span class="kicker" data-anim="clip" style="color:var(--b-ac)">${esc(s.kicker)}</span>`:''}
      <h1 class="fh" data-anim="clip-up" style="--d:.25s;--dur:1s;font-size:calc(var(--u)*5px);font-weight:800;line-height:1.06;max-width:16em">${nl(s.title)}</h1>
    </div>${fxHTML()}`; }});

  /* -------------------------------------------- ESTATÍSTICA */
  F.scenes.register('stat',{n:'Número que cresce',d:'Contador animado + rótulo.',dur:2800,fields:['title','value','suffix','icon'],
   render(s){ return `
    ${sceneBG(s,`radial-gradient(80% 80% at 50% 110%,color-mix(in srgb,var(--b-p2) 20%,var(--b-bg)),var(--b-bg) 60%)`)}
    <div style="${center}">
      <div data-anim="fade" style="color:var(--b-ac);font-size:calc(var(--u)*5px);display:flex">${icon(s.icon)}</div>
      <div class="fh" data-anim="scale" style="--d:.15s;font-size:calc(var(--u)*16px);font-weight:800;line-height:1;color:var(--b-ac)">
        <span data-count data-to="${+s.value||0}" data-suffix="${esc(s.suffix||'')}">0</span></div>
      <h2 data-anim="fade-up" style="--d:.5s;font-size:calc(var(--u)*3.2px);font-weight:600;opacity:.92;max-width:22em">${nl(s.title)}</h2>
    </div>${sceneFloat(s)}${fxHTML()}`; }});

  /* -------------------------------------------- LISTA */
  F.scenes.register('list',{n:'Lista revelada',d:'Itens (um por linha) entram em cascata.',dur:3200,fields:['kicker','items','icon'],
   render(s){
    const items = String(s.items||'').split('\n').filter(Boolean);
    return `
    ${sceneBG(s,`var(--b-bg)`)}
    <div class="abs" style="inset:0;padding:calc(var(--u)*9px);display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*3px)">
      ${s.kicker?`<span class="kicker" data-anim="clip" style="color:var(--b-ac);margin-bottom:calc(var(--u)*1px)">${esc(s.kicker)}</span>`:''}
      ${items.map((it,i)=>`
        <div data-anim="slide-r" style="--d:${(0.25+i*0.3).toFixed(2)}s;display:flex;align-items:center;gap:calc(var(--u)*2px)">
          <span style="color:var(--b-ac);font-size:calc(var(--u)*3.4px);display:flex">${icon(s.icon||'check-circle')}</span>
          <span class="fh" style="font-size:calc(var(--u)*4.6px);font-weight:700">${esc(it)}</span>
        </div>`).join('')}
    </div>${sceneFloat(s)}${fxHTML()}`; }});

  /* -------------------------------------------- ENCERRAMENTO / CTA */
  F.scenes.register('outro',{n:'Encerramento CTA',d:'Chamada final com logo e assinatura.',dur:3000,fields:['title','cta'],
   render(s){ return `
    ${sceneBG(s,`linear-gradient(180deg,var(--b-bg),color-mix(in srgb,var(--b-p1) 22%,var(--b-bg)))`)}
    <div style="${center}">
      ${logoHTML('blur','.1s')}
      <h1 class="fh" data-anim="letters" style="--t0:.4s;font-size:calc(var(--u)*6px);font-weight:800;line-height:1.06;max-width:13em">${letters(s.title)}</h1>
      <span class="cta" data-anim="pop" style="--d:1s">${esc(s.cta||st().cta)} ${icon('arrow-right')}</span>
      <span class="handle" data-anim="fade-up" style="--d:1.2s">${esc(st().brand.handle)}</span>
    </div>${sceneFloat(s)}${fxHTML()}`; }});

})(window.FORMA);
