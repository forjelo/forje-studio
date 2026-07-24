/* =====================================================
   FORJE·studio — lib/components.js
   Design system de COMPONENTES: peças de UI prontas
   (buttons, cards, charts, badges…) desenhadas com os
   tokens da marca, para compor sobre qualquer template
   ou cena (aba COMPOR → arrastar no palco).
   Contrato: F.components.register(id, {n, cat, html(rng, ctx)})
   ctx = {title, sub, cta, img, icon} do slide/cena atual.
   ===================================================== */
(function(F){
  F.components = (function(){ const map={}; return {
    map, register:(id,def)=>map[id]=def, get:id=>map[id],
    ids:()=>Object.keys(map), entries:()=>Object.entries(map)}; })();
  const c = (id,n,cat,html)=>F.components.register(id,{n,cat,html});
  const u = x=>`calc(var(--u)*${x}px)`;
  const esc = s=>F.esc(s);

  /* ---------- ações ---------- */
  c('btn','Botão','Ações',(r,x)=>`<span class="cta" style="font-size:${u(2.8)}">${esc(x.cta||'Começar')} ${F.icon('arrow-right')}</span>`);
  c('btn-ghost','Botão ghost','Ações',(r,x)=>`<span style="display:inline-flex;align-items:center;gap:.5em;border:${u(0.22)} solid var(--b-fg);color:var(--b-fg);font-weight:700;font-size:${u(2.6)};padding:.7em 1.4em;border-radius:calc(var(--b-r)*1px)">${esc(x.cta||'Saber mais')}</span>`);
  c('badge','Badge','Ações',(r,x)=>`<span style="background:var(--b-ac);color:var(--b-bg);font-weight:800;font-size:${u(2.2)};padding:.5em .9em;border-radius:99px;display:inline-flex;align-items:center;gap:.4em">${F.icon(x.icon||'spark')} ${esc((x.kicker||'NOVO').toUpperCase())}</span>`);
  c('status','Status','Ações',()=>`<span style="display:inline-flex;align-items:center;gap:.5em;background:color-mix(in srgb,var(--b-p2) 18%,transparent);border:1px solid color-mix(in srgb,var(--b-p2) 50%,transparent);color:var(--b-fg);font-size:${u(2.2)};padding:.5em 1em;border-radius:99px"><i style="width:.6em;height:.6em;border-radius:50%;background:var(--b-p2)"></i> Online agora</span>`);
  c('kbd','Tecla','Ações',(r,x)=>`<span class="fm" style="display:inline-flex;gap:.4em">${(x.title||'Ctrl K').split(' ').map(k=>
    `<i style="font-style:normal;background:color-mix(in srgb,var(--b-fg) 12%,transparent);border:1px solid color-mix(in srgb,var(--b-fg) 30%,transparent);border-bottom-width:${u(0.4)};border-radius:.4em;padding:.35em .7em;font-size:${u(2.2)}">${esc(k)}</i>`).join('')}</span>`);

  /* ---------- cards ---------- */
  c('card-glass','Card liquid glass','Cards',(r,x)=>`<div class="glass2" style="width:${u(34)};padding:${u(3)};display:flex;flex-direction:column;gap:${u(1.2)}">
    <span style="color:var(--b-ac);font-size:${u(3.4)};display:flex">${F.icon(x.icon||'spark')}</span>
    <b class="fh" style="font-size:${u(2.8)}">${esc((x.title||'Título').split('\n')[0])}</b>
    <span style="font-size:${u(2)};opacity:.8;line-height:1.5">${esc(x.sub||'Descrição do card.')}</span></div>`);
  c('card-stat','Card de métrica','Cards',(r,x)=>`<div class="glass2" style="width:${u(24)};padding:${u(2.6)};display:flex;flex-direction:column;gap:${u(0.8)}">
    <span class="fm" style="font-size:${u(1.8)};letter-spacing:.12em;opacity:.7">${esc((x.kicker||'RECEITA').toUpperCase())}</span>
    <b class="fh" style="font-size:${u(4.6)};color:var(--b-ac)">${esc(x.title||('R$ '+(40+Math.floor(r()*60))+'k'))}</b>
    <span style="font-size:${u(1.9)};color:var(--b-p2);display:inline-flex;align-items:center;gap:.3em">${F.icon('trend')} ${esc(x.sub||('+'+(8+Math.floor(r()*20))+'% no mês'))}</span></div>`);
  c('card-quote','Depoimento','Cards',(r,x)=>`<div class="glass2" style="width:${u(38)};padding:${u(3)};display:flex;flex-direction:column;gap:${u(1.4)}">
    <span style="font-size:${u(2.2)};line-height:1.5;opacity:.92">"${esc(x.sub||'Mudou completamente nosso fluxo de trabalho.')}"</span>
    <span style="display:flex;align-items:center;gap:${u(1.2)}">
      <i style="width:${u(4)};height:${u(4)};border-radius:50%;background:linear-gradient(135deg,var(--b-p1),var(--b-p2));display:grid;place-items:center;font-style:normal;font-weight:800;font-size:${u(1.8)};color:var(--b-fg)">AB</i>
      <span style="display:flex;flex-direction:column"><b style="font-size:${u(2)}">Ana B.</b><span style="font-size:${u(1.7)};opacity:.65">Diretora de marca</span></span></span></div>`);
  c('price','Etiqueta de preço','Cards',(r,x)=>`<div style="background:var(--b-ac);color:var(--b-bg);border-radius:calc(var(--b-r)*1px);padding:${u(1.6)} ${u(2.4)};display:flex;flex-direction:column;align-items:center;transform:rotate(${(r()*8-4).toFixed(1)}deg)">
    <s style="font-size:${u(1.9)};opacity:.65">${esc(x.kicker||('R$ '+(150+Math.floor(r()*100))))}</s>
    <b class="fh" style="font-size:${u(4.2)};line-height:1">${esc(x.title||('R$ '+(59+Math.floor(r()*40))))}</b>
    <span class="fm" style="font-size:${u(1.5)};letter-spacing:.1em">${esc(x.sub||'/mês')}</span></div>`);

  /* ---------- dados ---------- */
  c('chart-bars','Gráfico de barras','Dados',(r,x)=>{
    /* dados reais: linhas "Rótulo | valor" (ou só o valor) no campo Dados;
       vazio → série determinística do seed (comportamento original) */
    const rows = F.dataRows(x.data).filter(o=>o.value!=null || /^[\d.,\-]+$/.test(o.label));
    let vals, labs;
    if(rows.length){
      vals = rows.map(o=>o.value!=null?o.value:parseFloat(o.label.replace(',','.'))||0).slice(0,8);
      labs = rows.map(o=>o.value!=null?o.label:'').slice(0,8);
    } else { vals=[]; labs=[]; for(let i=0;i<7;i++){ vals.push(20+r()*70); labs.push(''); } }
    const max = Math.max(...vals.map(v=>Math.abs(v)), 1e-9);
    const hi = rows.length ? vals.indexOf(Math.max(...vals)) : 5;
    const n = vals.length, bw = Math.min(9, 100/n*0.62), gap = 100/n;
    const hasLabs = labs.some(Boolean);
    let bars='';
    vals.forEach((v,i)=>{ const h=Math.max(2, Math.abs(v)/max*70+2);
      bars+=`<rect x="${(i*gap+(gap-bw)/2).toFixed(1)}" y="${(92-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${i===hi?'var(--b-ac)':'color-mix(in srgb,var(--b-p1) 70%,var(--b-fg))'}" opacity="${i===hi?1:.55}"/>`; });
    const legend = hasLabs
      ? `<div style="display:grid;grid-template-columns:repeat(${n},1fr);gap:${u(0.4)};margin-top:${u(0.7)}">${
          labs.map((l2,i)=>`<span class="fm" style="font-size:${u(1.25)};text-align:center;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${i===hi?'color:var(--b-ac);font-weight:700':'opacity:.62'}">${esc(l2)}</span>`).join('')}</div>` : '';
    return `<div class="glass2" style="width:${u(28)};padding:${u(2.2)}"><svg viewBox="0 0 100 96" style="width:100%;display:block">${bars}<line x1="0" y1="93" x2="100" y2="93" stroke="color-mix(in srgb,var(--b-fg) 30%,transparent)"/></svg>${legend}</div>`;});
  c('chart-line','Gráfico de linha','Dados',(r,x)=>{
    /* dados reais: números no campo Dados (vírgula/espaço/linha); vazio → seed */
    let vals = F.numList(x.data);
    if(vals.length<2){ vals=[]; for(let i=0;i<=8;i++) vals.push(75-r()*55); }
    else{ const mn=Math.min(...vals), mx=Math.max(...vals), sp=(mx-mn)||1;
      vals = vals.slice(0,24).map(v=>72-((v-mn)/sp)*58); }
    const n=vals.length, pts=vals.map((y,i)=>`${(i*100/(n-1)).toFixed(1)},${y.toFixed(1)}`);
    const d='M'+pts.join(' L');
    return `<div class="glass2" style="width:${u(28)};padding:${u(2.2)}"><svg viewBox="0 0 100 80" style="width:100%;display:block">
      <path d="${d} L100,80 L0,80 Z" fill="color-mix(in srgb,var(--b-ac) 18%,transparent)"/>
      <path d="${d}" fill="none" stroke="var(--b-ac)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" data-anim="draw" style="--dash:220"/></svg></div>`;});
  c('chart-donut','Donut','Dados',(r,x)=>{
    const p=String(Math.min(100,parseInt(x.value)||+(30+r()*55).toFixed(0))), C=2*Math.PI*30;
    return `<div style="width:${u(16)};position:relative"><svg viewBox="0 0 80 80" style="width:100%">
      <circle cx="40" cy="40" r="30" fill="none" stroke="color-mix(in srgb,var(--b-fg) 14%,transparent)" stroke-width="11"/>
      <circle cx="40" cy="40" r="30" fill="none" stroke="var(--b-ac)" stroke-width="11" stroke-linecap="round"
        stroke-dasharray="${(C*p/100).toFixed(0)} ${C.toFixed(0)}" transform="rotate(-90 40 40)"/></svg>
      <b class="fh" style="position:absolute;inset:0;display:grid;place-items:center;font-size:${u(3)}">${p}%</b></div>`;});
  c('progress','Barra de progresso','Dados',(r,x)=>{const p=String(parseInt(x.value)||(35+r()*55).toFixed(0));
    return `<div style="width:${u(26)};display:flex;flex-direction:column;gap:${u(0.8)}">
    <span style="display:flex;justify-content:space-between;font-size:${u(1.9)}"><b>${esc(x.kicker||'Meta')}</b><span class="fm" style="opacity:.7">${p}%</span></span>
    <div style="height:${u(1.4)};background:color-mix(in srgb,var(--b-fg) 14%,transparent);border-radius:99px;overflow:hidden">
      <div data-anim="line" style="width:${p}%;height:100%;background:linear-gradient(90deg,var(--b-p1),var(--b-ac));border-radius:99px"></div></div></div>`;});
  c('table','Tabela','Dados',(r,x)=>{
    /* dados reais: Cabeçalho "PLANO | PREÇO | NÍVEL";
       Linhas: um registro por linha "Starter | R$ 29 | ✓".
       Vazio → tabela de exemplo original (sem regressão). */
    const split = s=>String(s).split('|').map(z=>esc(z.trim()));
    const head = (x.thead||'').trim() ? split(x.thead.split('\n')[0]) : ['PLANO','PREÇO','NÍVEL'];
    const bodyLines = String(x.trows||'').split('\n').map(l=>l.trim()).filter(Boolean);
    const rows = bodyLines.length ? bodyLines.slice(0,7).map(split)
      : [['Starter','R$ 29','✓'],['Pro','R$ 79','✓✓'],['Studio','R$ 149','✓✓✓']];
    const cols = Math.max(head.length, ...rows.map(rw=>rw.length));
    const grid = '2fr'+' 1fr'.repeat(Math.max(0,cols-1));
    const hiRow = rows.length===3 && !bodyLines.length ? 1 : -1;   // destaque só na tabela de exemplo
    const cell = (v,i)=>`<span style="padding:${u(0.5)} 0;border-top:1px solid color-mix(in srgb,var(--b-fg) 14%,transparent);${i===hiRow?'color:var(--b-ac);font-weight:700':''}">${v??''}</span>`;
    return `<div class="glass2" style="width:${u(32)};padding:${u(1.4)};font-size:${u(2)}">
    <div style="display:grid;grid-template-columns:${grid};gap:${u(0.6)} ${u(1)};padding:${u(1)}">
      ${Array.from({length:cols},(_,ci)=>`<b class="fm" style="font-size:${u(1.6)};letter-spacing:.1em;opacity:.6">${head[ci]??''}</b>`).join('')}
      ${rows.map((rw,i)=>Array.from({length:cols},(_,ci)=>cell(rw[ci],i)).join('')).join('')}
    </div></div>`;});

  /* ---------- pessoas & feedback ---------- */
  c('avatar-group','Avatares','Pessoas',(r,x)=>{
    const tones=['p1','p2','ac'];
    return `<span style="display:inline-flex;align-items:center">${[0,1,2].map(i=>
      `<i style="width:${u(4.2)};height:${u(4.2)};border-radius:50%;margin-left:${i?u(-1.4):0};border:${u(0.3)} solid var(--b-bg);background:linear-gradient(135deg,var(--b-${tones[i]}),var(--b-${tones[(i+1)%3]}));display:grid;place-items:center;font-style:normal;font-weight:800;font-size:${u(1.7)}">${'ABC'[i]}${'NRS'[i]}</i>`).join('')}
      <span style="margin-left:${u(1)};font-size:${u(2)};opacity:.8">${esc(x.title||('+'+(90+Math.floor(r()*900))+' pessoas'))}</span></span>`;});
  c('rating','Avaliação','Pessoas',(r,x)=>`<span style="display:inline-flex;align-items:center;gap:${u(0.5)};color:var(--b-ac);font-size:${u(2.8)}">${F.icon('star')}${F.icon('star')}${F.icon('star')}${F.icon('star')}${F.icon('star')}<b style="color:var(--b-fg);font-size:${u(2.2)};margin-left:.3em">${esc(x.title||'4.9')}</b></span>`);
  c('notify','Notificação','Pessoas',(r,x)=>`<div class="glass2" style="width:${u(32)};padding:${u(1.8)};display:flex;gap:${u(1.4)};align-items:center">
    <span style="width:${u(4.4)};height:${u(4.4)};border-radius:${u(1.2)};background:var(--b-ac);color:var(--b-bg);display:grid;place-items:center;font-size:${u(2.4)}">${F.icon(x.icon||'bolt')}</span>
    <span style="display:flex;flex-direction:column;gap:.15em"><b style="font-size:${u(2)}">${esc((x.kicker||'Novidade'))}</b>
    <span style="font-size:${u(1.8)};opacity:.7">${esc(x.sub||'agora mesmo · toque para ver')}</span></span></div>`);

  /* ---------- mockups ---------- */
  c('browser','Janela de navegador','Mockups',(r,x)=>{
    /* imagem: própria (props.img, via formulário do COMPOR) > do slide/cena;
       ajustes: imgfit (cover/contain), imgx/imgy (posição %), imgzoom (×) */
    const fit = x.imgfit==='contain' ? 'contain' : 'cover';
    const px = x.imgx!=null && x.imgx!=='' ? +x.imgx : 50;
    const py = x.imgy!=null && x.imgy!=='' ? +x.imgy : 50;
    const zm = Math.min(3, Math.max(1, +x.imgzoom || 1));
    const media = x.img
      ? `<img src="${x.img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:${px}% ${py}%;transform:scale(${zm});transform-origin:${px}% ${py}%">`
      : `<div style="position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(135deg,color-mix(in srgb,var(--b-p1) 24%,var(--b-bg)),var(--b-bg))"><b class="fh" style="font-size:${u(3)}">${esc((x.title||'Preview').split('\n')[0].slice(0,18))}</b></div>`;
    return `<div style="width:${u(40)};border-radius:calc(var(--b-r)*1px);overflow:hidden;border:1px solid color-mix(in srgb,var(--b-fg) 22%,transparent);box-shadow:0 ${u(2)} ${u(6)} rgba(0,0,0,.35)">
    <div style="background:color-mix(in srgb,var(--b-fg) 10%,var(--b-bg));padding:${u(1)} ${u(1.4)};display:flex;gap:${u(0.6)};align-items:center">
      <i style="width:${u(1)};height:${u(1)};border-radius:50%;background:#ff5f57"></i><i style="width:${u(1)};height:${u(1)};border-radius:50%;background:#febc2e"></i><i style="width:${u(1)};height:${u(1)};border-radius:50%;background:#28c840"></i>
      <span class="fm" style="margin-left:${u(1)};font-size:${u(1.5)};opacity:.6">${esc(x.url||'suamarca.com')}</span></div>
    <div style="height:${u(22)};position:relative;overflow:hidden;background:var(--b-bg)">${media}</div></div>`;});
  c('code','Janela de código','Mockups',(r,x)=>{
    const lines = x.sub ? esc(x.sub).split('\n').map((ln,i)=>
        `<span style="color:${['var(--b-p2)','var(--b-fg)','var(--b-ac)'][i%3]}">${ln}</span>`).join('<br>')
      : `<span style="color:var(--b-p2)">const</span> <span style="color:var(--b-fg)">marca</span> = <span style="color:var(--b-ac)">'sua'</span>;<br>
    <span style="color:var(--b-p2)">design</span>.<span style="color:var(--b-p1)">compose</span>(<span style="color:var(--b-fg)">marca</span>)<br>
    <span style="opacity:.5">// determinístico ✓</span>`;
    return `<div class="fm" style="width:${u(34)};background:#0d0f14;border:1px solid color-mix(in srgb,var(--b-fg) 20%,transparent);border-radius:calc(var(--b-r)*1px);padding:${u(2)};font-size:${u(1.8)};line-height:1.7;box-shadow:0 ${u(2)} ${u(6)} rgba(0,0,0,.35)">${lines}</div>`;});
  c('checklist','Checklist','Mockups',(r,x)=>{
    const items=(x.sub||'Rápido\nConsistente\nSeu').split(/[\n.]/).filter(Boolean).slice(0,3);
    return `<div style="display:flex;flex-direction:column;gap:${u(1.2)}">${items.map((it,i)=>
      `<span data-anim="slide-r" style="--d:${(i*.15).toFixed(2)}s;display:inline-flex;align-items:center;gap:${u(1)};font-size:${u(2.4)};font-weight:600"><i style="width:${u(3)};height:${u(3)};border-radius:${u(0.8)};background:var(--b-ac);color:var(--b-bg);display:grid;place-items:center;font-style:normal;font-size:${u(1.8)}">${F.icon('check')}</i>${esc(it.trim().slice(0,64))}</span>`).join('')}</div>`;});

  /* campos editáveis por componente (formulário na aba COMPOR) */
  const FIELDS = {
    btn:['cta'], 'btn-ghost':['cta'], badge:['kicker','icon'], status:['kicker'], kbd:['title'],
    'card-glass':['title','sub','icon'], 'card-quote':['sub'], 'card-stat':['kicker','title','sub'],
    price:['kicker','title','sub'], notify:['kicker','sub','icon'], checklist:['sub'],
    browser:['url','title'], code:['sub'], progress:['kicker','value'], 'chart-donut':['value'],
    rating:['title'], 'avatar-group':['title'],
    'chart-bars':['data'], 'chart-line':['data'], table:['thead','trows'],
  };
  Object.entries(FIELDS).forEach(([id,f])=>{ const d=F.components.get(id); if(d) d.fields=f; });
  /* componentes que acoplam imagem: o formulário do COMPOR ganha upload
     próprio + controles de encaixe/posição/zoom (extensível a plugins) */
  ['browser'].forEach(id=>{ const d=F.components.get(id); if(d) d.imgSlot=true; });
})(window.FORMA);
