/* =====================================================
   FORJE·studio — motion/scenes-extra.js
   Cenas adicionais — e modelo de como a biblioteca de
   cenas cresce: registre com o contrato e a aba CENA
   monta o formulário sozinha a partir de `fields`.
   ===================================================== */
(function(F){
  const {esc, nl, letters, logoHTML, imgHTML, icon, fxHTML, sceneBG, sceneFloat} = F;
  const st = () => F.state;

  /* ------------------------------------------ SPLIT (imagem + texto) */
  F.scenes.register('split-scene',{n:'Split imagem+texto',d:'Imagem entra por um lado, texto pelo outro.',
   dur:3000,fields:['kicker','title','sub','img'],
   render(s){ return `
    <div class="abs" style="inset:0;background:radial-gradient(120% 120% at 18% 20%,color-mix(in srgb,var(--b-p1) 20%,var(--b-bg)),var(--b-bg))"></div>
    <div class="abs" data-anim="clip" style="--dur:1.1s;right:0;top:0;bottom:0;width:46%">${imgHTML(s.img,'','style="position:absolute;inset:0"')}</div>
    <div class="abs" data-anim="line-y" style="--d:.5s;right:46%;top:8%;bottom:8%;width:calc(var(--u)*0.4px);background:var(--b-ac)"></div>
    <div class="abs" style="left:0;top:0;bottom:0;width:52%;padding:calc(var(--u)*7px);display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*2.4px)">
      ${s.kicker?`<span class="kicker" data-anim="clip" style="--d:.3s;color:var(--b-ac)">${esc(s.kicker)}</span>`:''}
      <h1 class="fh" data-anim="slide-r" style="--d:.45s;--dur:1s;font-size:calc(var(--u)*5.6px);line-height:1.06;font-weight:800">${nl(s.title)}</h1>
      ${s.sub?`<p data-anim="fade-up" style="--d:.75s;font-size:calc(var(--u)*2.7px);line-height:1.5;opacity:.88">${nl(s.sub)}</p>`:''}
    </div>${fxHTML()}`; }});

  /* ------------------------------------------ CITAÇÃO */
  F.scenes.register('quote-scene',{n:'Citação',d:'Frase entre aspas gigantes + autor.',
   dur:3200,fields:['title','sub'],
   render(s){ return `
    ${sceneBG(s,`linear-gradient(180deg,var(--b-bg),color-mix(in srgb,var(--b-p1) 12%,var(--b-bg)))`)}
    <div class="abs fh" data-anim="blur" style="left:calc(var(--u)*8px);top:calc(var(--u)*2px);font-size:calc(var(--u)*22px);line-height:1;color:var(--b-ac)">“</div>
    <div class="abs" style="inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:calc(var(--u)*3px);padding:calc(var(--u)*10px)">
      <h1 class="fh" data-anim="letters" style="--t0:.35s;font-size:calc(var(--u)*5.8px);line-height:1.2;font-weight:600;max-width:15em">${letters(s.title)}</h1>
      <div style="display:flex;align-items:center;gap:calc(var(--u)*1.6px)">
        <div class="bar" data-anim="line" style="--d:1.1s;width:calc(var(--u)*6px)"></div>
        ${s.sub?`<span data-anim="fade-up" style="--d:1.2s;font-size:calc(var(--u)*2.6px);opacity:.85">${esc(s.sub)}</span>`:''}
      </div>
    </div>${sceneFloat(s)}${fxHTML()}`; }});

  /* ------------------------------------------ PASSOS NUMERADOS */
  F.scenes.register('steps',{n:'Passos numerados',d:'Sequência 01→0N em cascata.',
   dur:3400,fields:['kicker','items'],
   render(s){
    const items = String(s.items||'').split('\n').filter(Boolean);
    return `
    ${sceneBG(s,`var(--b-bg)`)}
    <div class="abs" style="inset:0;padding:calc(var(--u)*8px);display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*3.4px)">
      ${s.kicker?`<span class="kicker" data-anim="clip" style="color:var(--b-ac)">${esc(s.kicker)}</span>`:''}
      ${items.map((it,i)=>`
        <div data-anim="rise" style="--d:${(0.25+i*0.32).toFixed(2)}s;display:flex;align-items:center;gap:calc(var(--u)*2.4px)">
          <span class="fh" style="font-size:calc(var(--u)*5.6px);font-weight:900;color:transparent;-webkit-text-stroke:calc(var(--u)*0.14px) var(--b-ac);text-shadow:calc(var(--u)*0.1px) 0 var(--b-ac),calc(var(--u)*-0.1px) 0 var(--b-ac),0 calc(var(--u)*0.1px) var(--b-ac),0 calc(var(--u)*-0.1px) var(--b-ac)">${String(i+1).padStart(2,'0')}</span>
          <div style="flex:1">
            <div class="fh" style="font-size:calc(var(--u)*3.8px);font-weight:700">${esc(it)}</div>
            <div class="bar" data-anim="line" style="--d:${(0.5+i*0.32).toFixed(2)}s;width:calc(var(--u)*8px);height:calc(var(--u)*0.35px);margin-top:calc(var(--u)*0.8px);opacity:.5"></div>
          </div>
        </div>`).join('')}
    </div>${sceneFloat(s)}${fxHTML()}`; }});

  /* ------------------------------------------ MARQUEE */
  F.scenes.register('marquee',{n:'Marquee',d:'Faixas correndo + palavra central.',
   dur:2800,fields:['title','items'],
   render(s){
    const words = String(s.items||'').split('\n').filter(Boolean);
    const seq = (words.join('  ✦  ')+'  ✦  ').repeat(3);
    const strip = (pos,dur,op)=>`<div class="marq" style="${pos}"><div class="in" style="--mdur:${dur}s">
      <span class="fh" style="font-size:calc(var(--u)*4.6px);font-weight:900;text-transform:uppercase;letter-spacing:.04em;opacity:${op}">${esc(seq)}</span>
      <span class="fh" style="font-size:calc(var(--u)*4.6px);font-weight:900;text-transform:uppercase;letter-spacing:.04em;opacity:${op}">${esc(seq)}</span></div></div>`;
    return `
    ${sceneBG(s,`var(--b-bg)`)}
    ${strip('top:12%',16,.28)}${strip('bottom:12%',12,.28)}
    <div class="abs" style="inset:0;display:grid;place-items:center;padding:calc(var(--u)*8px)">
      <h1 class="fh" data-anim="pop" style="--d:.2s;font-size:calc(var(--u)*8px);font-weight:900;text-align:center;line-height:1"><span class="hl">${nl(s.title)}</span></h1>
    </div>${sceneFloat(s)}${fxHTML()}`; }});

})(window.FORMA);
