/* =====================================================
   FORJE·studio — lib/components-extra.js
   EXPANSÃO do design system de componentes: +45 peças
   novas em 8 categorias, todas desenhadas com os tokens
   da marca e prontas para compor sobre qualquer template
   ou cena (aba COMPOR). Mesmo contrato de components.js:
   F.components.register(id, {n, cat, html(rng, ctx), fields})
   ===================================================== */
(function(F){
  const c = (id,n,cat,html)=>F.components.register(id,{n,cat,html});
  const u = x=>`calc(var(--u)*${x}px)`;
  const esc = s=>F.esc(s);
  const nl = s=>F.nl(s);
  const lines = (s,fb)=> String(s||fb).split('\n').map(x=>x.trim()).filter(Boolean);

  /* ══════════════════ AÇÕES ══════════════════ */
  c('btn-play','Botão play','Ações',(r,x)=>`<span style="display:inline-flex;align-items:center;gap:.6em">
    <i style="width:${u(5.4)};aspect-ratio:1;border-radius:50%;background:var(--b-ac);color:var(--b-bg);display:grid;place-items:center;font-style:normal;font-size:${u(2.4)};box-shadow:0 0 0 ${u(0.8)} color-mix(in srgb,var(--b-ac) 28%,transparent)">${F.icon('play')}</i>
    <b style="font-size:${u(2.3)}">${esc(x.title||'Assista agora')}</b></span>`);
  c('link-arrow','Link com seta','Ações',(r,x)=>`<span style="display:inline-flex;align-items:center;gap:.45em;font-weight:700;font-size:${u(2.6)};color:var(--b-ac);border-bottom:${u(0.28)} solid var(--b-ac);padding-bottom:.15em">${esc(x.cta||'Ver detalhes')} ${F.icon('arrow-right')}</span>`);
  c('tag','Tag','Ações',(r,x)=>`<span class="fm" style="display:inline-flex;align-items:center;gap:.4em;font-size:${u(2)};letter-spacing:.06em;color:var(--b-fg);background:color-mix(in srgb,var(--b-fg) 10%,transparent);border:1px solid color-mix(in srgb,var(--b-fg) 26%,transparent);padding:.45em .9em;border-radius:calc(var(--b-r)*0.6px)"># ${esc(x.kicker||'design')}</span>`);
  c('tag-row','Fileira de tags','Ações',(r,x)=>`<span style="display:inline-flex;gap:${u(1)};flex-wrap:wrap">${
    lines(x.sub,'branding\nmotion\nsistema').slice(0,5).map(t=>
      `<i class="fm" style="font-style:normal;font-size:${u(1.9)};color:var(--b-fg);background:color-mix(in srgb,var(--b-p2) 16%,transparent);border:1px solid color-mix(in srgb,var(--b-p2) 45%,transparent);padding:.4em .85em;border-radius:99px">${esc(t)}</i>`).join('')}</span>`);
  c('download-chip','Chip de download','Ações',(r,x)=>`<span style="display:inline-flex;align-items:center;gap:.6em;background:color-mix(in srgb,var(--b-fg) 9%,transparent);border:1px solid color-mix(in srgb,var(--b-fg) 24%,transparent);border-radius:calc(var(--b-r)*1px);padding:.7em 1.2em">
    <i style="font-style:normal;color:var(--b-ac);font-size:${u(2.8)};display:flex">${F.icon('spark')}</i>
    <span style="display:flex;flex-direction:column;line-height:1.2"><b style="font-size:${u(2)}">${esc(x.title||'material-gratuito.pdf')}</b><span class="fm" style="font-size:${u(1.5)};opacity:.6">${esc(x.sub||'2,4 MB · grátis')}</span></span></span>`);
  c('follow-cta','Siga a marca','Ações',(r,x)=>`<span style="display:inline-flex;align-items:center;gap:${u(1.2)};background:var(--b-fg);color:var(--b-bg);border-radius:99px;padding:.55em 1.3em .55em .6em">
    ${F.state.brand.logo?`<img src="${F.state.brand.logo}" style="width:${u(3.6)};height:${u(3.6)};object-fit:contain;border-radius:50%;background:var(--b-bg);padding:${u(0.4)}">`:`<i style="width:${u(3.6)};aspect-ratio:1;border-radius:50%;background:var(--b-ac);display:grid;place-items:center;font-style:normal;font-weight:900;color:var(--b-bg);font-size:${u(1.8)}">${esc((F.state.brand.name||'M')[0])}</i>`}
    <span style="display:flex;flex-direction:column;line-height:1.15"><b style="font-size:${u(2)}">Siga ${esc(F.state.brand.handle)}</b><span style="font-size:${u(1.5)};opacity:.65">conteúdo toda semana</span></span></span>`);

  /* ══════════════════ CARDS ══════════════════ */
  c('card-feature','Card de recurso','Cards',(r,x)=>`<div class="glass2" style="width:${u(36)};padding:${u(2.4)};display:flex;gap:${u(1.8)};align-items:flex-start">
    <span style="flex:0 0 auto;width:${u(5)};aspect-ratio:1;border-radius:calc(var(--b-r)*0.8px);background:color-mix(in srgb,var(--b-ac) 18%,transparent);border:1px solid color-mix(in srgb,var(--b-ac) 45%,transparent);color:var(--b-ac);display:grid;place-items:center;font-size:${u(2.6)}">${F.icon(x.icon||'bolt')}</span>
    <span style="display:flex;flex-direction:column;gap:.35em"><b class="fh" style="font-size:${u(2.5)}">${esc((x.title||'Recurso principal').split('\n')[0])}</b>
    <span style="font-size:${u(1.9)};opacity:.78;line-height:1.5">${esc(x.sub||'Explique o benefício em uma frase curta e direta.')}</span></span></div>`);
  c('card-step','Card de passo','Cards',(r,x)=>`<div class="glass2" style="width:${u(28)};padding:${u(2.4)};display:flex;flex-direction:column;gap:${u(1)}">
    <b class="fh" style="font-size:${u(5)};color:var(--b-ac);line-height:1">${esc(x.kicker||'01')}</b>
    <b style="font-size:${u(2.4)}">${esc((x.title||'Primeiro passo').split('\n')[0])}</b>
    <span style="font-size:${u(1.9)};opacity:.75;line-height:1.45">${esc(x.sub||'Descreva a etapa aqui.')}</span></div>`);
  c('card-banner','Banner com CTA','Cards',(r,x)=>`<div style="width:${u(46)};border-radius:calc(var(--b-r)*1.2px);padding:${u(2.6)};display:flex;align-items:center;justify-content:space-between;gap:${u(2)};background:linear-gradient(120deg,var(--b-p1),color-mix(in srgb,var(--b-p2) 70%,var(--b-p1)))">
    <span style="display:flex;flex-direction:column;gap:.25em"><b class="fh" style="font-size:${u(2.8)}">${esc((x.title||'Pronto para começar?').split('\n')[0])}</b>
    <span style="font-size:${u(1.9)};opacity:.85">${esc(x.sub||'Leva menos de 2 minutos.')}</span></span>
    <span style="flex:0 0 auto;background:var(--b-fg);color:var(--b-bg);font-weight:800;font-size:${u(2.1)};padding:.65em 1.3em;border-radius:99px;white-space:nowrap">${esc(x.cta||'Começar')}</span></div>`);
  c('card-profile','Card de perfil','Cards',(r,x)=>`<div class="glass2" style="width:${u(26)};padding:${u(2.6)};display:flex;flex-direction:column;align-items:center;gap:${u(1)};text-align:center">
    <i style="width:${u(8)};aspect-ratio:1;border-radius:50%;background:linear-gradient(135deg,var(--b-p1),var(--b-ac));display:grid;place-items:center;font-style:normal;font-weight:900;font-size:${u(3.2)};color:var(--b-fg)">${esc((x.title||'Ana Bento').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase())}</i>
    <b class="fh" style="font-size:${u(2.4)}">${esc((x.title||'Ana Bento').split('\n')[0])}</b>
    <span class="fm" style="font-size:${u(1.7)};color:var(--b-ac);letter-spacing:.08em">${esc((x.kicker||'DIRETORA DE ARTE').toUpperCase())}</span>
    <span style="font-size:${u(1.8)};opacity:.72;line-height:1.45">${esc(x.sub||'10 anos desenhando sistemas de marca.')}</span></div>`);
  c('card-event','Card de evento','Cards',(r,x)=>{
    const dt=(x.kicker||'24 AGO').split(' ');
    return `<div class="glass2" style="width:${u(36)};padding:${u(2)};display:flex;gap:${u(1.8)};align-items:center">
    <span style="flex:0 0 auto;width:${u(7.4)};border-radius:calc(var(--b-r)*0.8px);overflow:hidden;text-align:center;border:1px solid color-mix(in srgb,var(--b-fg) 22%,transparent)">
      <b class="fh" style="display:block;font-size:${u(3.4)};padding:${u(0.7)} 0 ${u(0.3)}">${esc(dt[0]||'24')}</b>
      <span class="fm" style="display:block;font-size:${u(1.4)};letter-spacing:.14em;background:var(--b-ac);color:var(--b-bg);padding:${u(0.4)} 0">${esc((dt[1]||'AGO').toUpperCase())}</span></span>
    <span style="display:flex;flex-direction:column;gap:.3em"><b style="font-size:${u(2.3)}">${esc((x.title||'Workshop de marca ao vivo').split('\n')[0])}</b>
    <span class="fm" style="font-size:${u(1.7)};opacity:.7">${esc(x.sub||'19h · online e gratuito')}</span></span></div>`;});
  c('coupon','Cupom de desconto','Cards',(r,x)=>`<div style="width:${u(34)};clip-path:polygon(0 0,100% 0,100% 40%,97% 46%,97% 54%,100% 60%,100% 100%,0 100%,0 60%,3% 54%,3% 46%,0 40%);background:var(--b-ac);color:var(--b-bg);padding:${u(2)} ${u(3)};display:flex;align-items:center;justify-content:space-between;gap:${u(2)}">
    <span style="display:flex;flex-direction:column"><span class="fm" style="font-size:${u(1.5)};letter-spacing:.16em;opacity:.75">${esc((x.kicker||'CUPOM').toUpperCase())}</span>
    <b class="fh" style="font-size:${u(4)};line-height:1.05">${esc(x.title||'-30% OFF')}</b></span>
    <span class="fm" style="font-size:${u(2)};font-weight:700;border:${u(0.24)} dashed var(--b-bg);padding:.5em .9em;border-radius:.5em;white-space:nowrap">${esc(x.sub||'FORJE30')}</span></div>`);
  c('polaroid','Polaroid','Cards',(r,x)=>{
    const rot=(r()*8-4).toFixed(1);
    const media = x.img?`<img src="${x.img}" style="width:100%;height:100%;object-fit:cover">`:`<div class="ph" style="font-size:${u(1.8)}">SUA FOTO</div>`;
    return `<div style="width:${u(26)};background:#faf7f0;color:#1b1b1f;padding:${u(1.2)} ${u(1.2)} ${u(2.6)};box-shadow:0 ${u(1.6)} ${u(4)} rgba(0,0,0,.4);transform:rotate(${rot}deg)">
    <div style="width:100%;aspect-ratio:1;overflow:hidden;background:#ddd">${media}</div>
    <div class="fm" style="text-align:center;font-size:${u(1.8)};margin-top:${u(1.2)};opacity:.75">${esc(x.sub||'nos bastidores ✳')}</div></div>`;});

  /* ══════════════════ DADOS ══════════════════ */
  c('kpi','KPI destaque','Dados',(r,x)=>`<span style="display:inline-flex;flex-direction:column;line-height:1">
    <b class="fh" style="font-size:${u(9)};letter-spacing:-.02em;background:linear-gradient(120deg,var(--b-ac),var(--b-p2));-webkit-background-clip:text;background-clip:text;color:transparent">${esc(x.title||('+'+(80+Math.floor(r()*220))+'%'))}</b>
    <span class="fm" style="font-size:${u(2)};letter-spacing:.12em;opacity:.75;margin-top:.4em">${esc((x.sub||'DE CRESCIMENTO NO ANO').toUpperCase())}</span></span>`);
  c('stat-row','Trio de métricas','Dados',(r,x)=>{
    const its = lines(x.sub,'120+ | projetos\n8 anos | de estrada\n97% | de retenção').slice(0,3)
      .map(l=>l.split('|').map(z=>z.trim()));
    return `<div style="display:inline-flex;gap:${u(3.4)}">${its.map(([v,l])=>
      `<span style="display:flex;flex-direction:column;gap:.2em;border-left:${u(0.3)} solid var(--b-ac);padding-left:${u(1.2)}">
        <b class="fh" style="font-size:${u(4.2)};line-height:1">${esc(v||'—')}</b>
        <span style="font-size:${u(1.8)};opacity:.72">${esc(l||'')}</span></span>`).join('')}</div>`;});
  c('sparkline','Sparkline','Dados',(r,x)=>{
    /* dados reais: números no campo Dados; vazio → série do seed */
    let pts=[];
    const vals = F.numList(x.data);
    if(vals.length>=2){
      const mn=Math.min(...vals), mx=Math.max(...vals), sp=(mx-mn)||1, vv=vals.slice(0,24), n=vv.length;
      pts = vv.map((v,i)=>`${(i*100/(n-1)).toFixed(1)},${(36-((v-mn)/sp)*28).toFixed(1)}`);
      const last = pts[pts.length-1].split(',');
      return `<span style="display:inline-flex;align-items:center;gap:${u(1.2)}">
    <svg viewBox="0 0 100 40" style="width:${u(16)};display:block;overflow:visible"><path d="M${pts.join(' L')}" fill="none" stroke="var(--b-ac)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" data-anim="draw" style="--dash:200"/><circle cx="${last[0]}" cy="${last[1]}" r="4" fill="var(--b-ac)"/></svg>
    <span style="display:flex;flex-direction:column;line-height:1.15"><b class="fh" style="font-size:${u(2.8)}">${esc(x.title||'R$ 84k')}</b><span class="fm" style="font-size:${u(1.5)};color:var(--b-p2)">${esc(x.sub||'últimos 30 dias')}</span></span></span>`;
    }
    for(let i=0;i<=10;i++) pts.push(`${i*10},${(38-r()*30).toFixed(0)}`);
    return `<span style="display:inline-flex;align-items:center;gap:${u(1.2)}">
    <svg viewBox="0 0 100 40" style="width:${u(16)};display:block;overflow:visible"><path d="M${pts.join(' L')}" fill="none" stroke="var(--b-ac)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" data-anim="draw" style="--dash:200"/><circle cx="100" cy="${pts[10].split(',')[1]}" r="4" fill="var(--b-ac)"/></svg>
    <span style="display:flex;flex-direction:column;line-height:1.15"><b class="fh" style="font-size:${u(2.8)}">${esc(x.title||'R$ 84k')}</b><span class="fm" style="font-size:${u(1.5)};color:var(--b-p2)">${esc(x.sub||'últimos 30 dias')}</span></span></span>`;});
  c('chart-pie','Gráfico de pizza','Dados',(r,x)=>{
    /* valores reais: cada rótulo aceita "Nome | valor" (ex.: "Orgânico | 44");
       os valores são normalizados para 100%. Sem valores → seed (original). */
    const segs = [['ac', F.splitVal(x.kicker,'Orgânico')],
                  ['p1', F.splitVal(x.title,'Pago')],
                  ['p2', F.splitVal(x.sub,'Indicação')]];
    let a, b, cx3;
    if(segs.some(([,o])=>o.value!=null)){
      const raw = segs.map(([,o])=>Math.max(0, o.value!=null?o.value:0));
      const tot = raw.reduce((s2,v)=>s2+v,0)||1;
      a = Math.round(raw[0]/tot*100); b = Math.round(raw[1]/tot*100); cx3 = 100-a-b;
    } else {
      a = Math.round(20+r()*45); b = Math.round(15+r()*(85-a)); cx3 = 100-a-b;
    }
    const vals=[a,b,cx3], pie=['ac','p1'].map((t,i)=>`var(--b-${t}) ${i?a+'% '+(a+b)+'%':'0 '+a+'%'}`).join(',');
    return `<div class="glass2" style="width:${u(26)};padding:${u(2.2)};display:flex;align-items:center;gap:${u(2)}">
    <div style="flex:0 0 ${u(11)};aspect-ratio:1;border-radius:50%;background:conic-gradient(${pie},color-mix(in srgb,var(--b-p2) 65%,transparent) ${a+b}% 100%)"></div>
    <span style="display:flex;flex-direction:column;gap:.5em;font-size:${u(1.8)}">${segs.map(([t,o],i)=>
      `<i style="font-style:normal;display:inline-flex;align-items:center;gap:.5em"><b style="width:.8em;height:.8em;border-radius:.25em;background:var(--b-${t})"></b>${esc(o.label)} <b style="opacity:.65">${vals[i]}%</b></i>`).join('')}</span></div>`;});
  c('gauge','Velocímetro','Dados',(r,x)=>{
    const p=Math.min(100,parseInt(x.value)||Math.round(40+r()*55)), C=Math.PI*40;
    return `<div style="width:${u(18)};position:relative"><svg viewBox="0 0 100 58" style="width:100%;display:block">
    <path d="M10 52A40 40 0 0 1 90 52" fill="none" stroke="color-mix(in srgb,var(--b-fg) 14%,transparent)" stroke-width="10" stroke-linecap="round"/>
    <path d="M10 52A40 40 0 0 1 90 52" fill="none" stroke="var(--b-ac)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(C*p/100).toFixed(0)} ${C.toFixed(0)}"/></svg>
    <b class="fh" style="position:absolute;left:0;right:0;bottom:0;text-align:center;font-size:${u(3.2)}">${p}%</b></div>`;});
  c('chart-cols','Barras horizontais','Dados',(r,x)=>{
    /* valores reais: cada linha aceita "Rótulo | valor" (0–100).
       Sem valor na linha → largura do seed (original). */
    const its = F.dataRows(lines(x.sub,'Instagram\nYouTube\nLinkedIn').join('\n')).slice(0,4);
    return `<div class="glass2" style="width:${u(30)};padding:${u(2.2)};display:flex;flex-direction:column;gap:${u(1.3)}">${its.map((o,i)=>{
      const l2 = o.label;
      const w = o.value!=null ? Math.max(0,Math.min(100,Math.round(o.value))) : Math.round(30+r()*65);
      return `<span style="display:flex;flex-direction:column;gap:.3em"><span style="display:flex;justify-content:space-between;font-size:${u(1.8)}"><b>${esc(l2)}</b><span class="fm" style="opacity:.65">${w}%</span></span>
      <i style="display:block;height:${u(1.3)};border-radius:99px;background:color-mix(in srgb,var(--b-fg) 12%,transparent);overflow:hidden"><i data-anim="line" style="--d:${(i*.14).toFixed(2)}s;display:block;width:${w}%;height:100%;border-radius:99px;background:${i===0?'var(--b-ac)':'color-mix(in srgb,var(--b-p1) 80%,var(--b-fg))'}"></i></i></span>`;}).join('')}</div>`;});
  c('compare','Antes × depois','Dados',(r,x)=>{
    /* valores reais: rótulos aceitam "Antes | 22" e "Depois | 86";
       barras proporcionais ao maior valor. Sem valores → seed. */
    const A = F.splitVal(x.kicker,'Antes'), B = F.splitVal(x.sub,'Depois');
    let a, b;
    if(A.value!=null || B.value!=null){
      const va = Math.max(0, A.value!=null?A.value:0), vb = Math.max(0, B.value!=null?B.value:0);
      const mx = Math.max(va, vb, 1e-9);
      a = Math.round(va/mx*95); b = Math.round(vb/mx*95);
      A.show = A.value!=null?A.value:0; B.show = B.value!=null?B.value:0;
    } else {
      a = Math.round(15+r()*30); b = Math.round(65+r()*30);
      A.show = a; B.show = b;
    }
    return `<div class="glass2" style="width:${u(26)};padding:${u(2.2)};display:flex;flex-direction:column;gap:${u(1.2)}">
    <b style="font-size:${u(2)}">${esc((x.title||'Alcance mensal').split('\n')[0])}</b>
    ${[[A.label,a,A.show,'color-mix(in srgb,var(--b-fg) 30%,transparent)'],[B.label,b,B.show,'var(--b-ac)']].map(([l2,w,v,cor])=>
      `<span style="display:flex;align-items:center;gap:${u(1)};font-size:${u(1.8)}"><span style="flex:0 0 ${u(7)};opacity:.75">${esc(String(l2))}</span>
      <i data-anim="line" style="display:block;height:${u(2.2)};border-radius:.4em;flex:0 0 ${Math.max(2,w)}%;background:${cor}"></i><b class="fm" style="font-size:${u(1.6)}">${(+v).toLocaleString('pt-BR')}</b></span>`).join('')}</div>`;});
  c('heatgrid','Grade de atividade','Dados',(r,x)=>{
    /* intensidades reais: números 0–100 no campo Dados preenchem as células
       (linha a linha); vazio → padrão do seed. Legenda editável no Texto. */
    const vals = F.numList(x.data).map(v=>Math.max(0,Math.min(100,v))/100);
    let cells='';
    for(let i=0;i<7*14;i++){ const v = vals.length ? (vals[i]??0) : r();
      cells+=`<i style="border-radius:22%;background:${v>.72?'var(--b-ac)':v>.45?'color-mix(in srgb,var(--b-ac) 45%,transparent)':'color-mix(in srgb,var(--b-fg) 10%,transparent)'}"></i>`; }
    return `<div class="glass2" style="width:${u(30)};padding:${u(2)}"><div style="display:grid;grid-template-columns:repeat(14,1fr);grid-auto-rows:1fr;gap:${u(0.45)};aspect-ratio:2">${cells}</div>
    <div class="fm" style="font-size:${u(1.4)};opacity:.6;margin-top:${u(1)}">${esc(x.sub||'consistência · últimas 14 semanas')}</div></div>`;});
  c('delta','Variação ±','Dados',(r,x)=>{
    const up = !(x.sub||'').startsWith('-');
    return `<span style="display:inline-flex;align-items:center;gap:.5em;background:color-mix(in srgb,${up?'var(--b-p2)':'#f43f5e'} 16%,transparent);border:1px solid color-mix(in srgb,${up?'var(--b-p2)':'#f43f5e'} 50%,transparent);color:${up?'var(--b-p2)':'#f87171'};font-weight:800;font-size:${u(2.2)};padding:.4em .9em;border-radius:99px">${F.icon('trend')} ${esc(x.title||'+24,8%')}</span>`;});

  /* ══════════════════ PESSOAS & SOCIAL ══════════════════ */
  c('chat-in','Balão recebido','Social',(r,x)=>`<div style="max-width:${u(32)};background:color-mix(in srgb,var(--b-fg) 12%,transparent);border:1px solid color-mix(in srgb,var(--b-fg) 20%,transparent);border-radius:calc(var(--b-r)*1px) calc(var(--b-r)*1px) calc(var(--b-r)*1px) ${u(0.5)};padding:${u(1.4)} ${u(1.8)};font-size:${u(2.1)};line-height:1.45">${esc(x.sub||'Vocês fazem identidade completa? Preciso pra ontem 😅')}</div>`);
  c('chat-out','Balão enviado','Social',(r,x)=>`<div style="max-width:${u(32)};background:var(--b-ac);color:var(--b-bg);border-radius:calc(var(--b-r)*1px) calc(var(--b-r)*1px) ${u(0.5)} calc(var(--b-r)*1px);padding:${u(1.4)} ${u(1.8)};font-size:${u(2.1)};line-height:1.45;font-weight:500">${esc(x.sub||'Fazemos! Te mando a proposta hoje ainda ⚡')}</div>`);
  c('social-post','Post social','Social',(r,x)=>`<div class="glass2" style="width:${u(38)};padding:${u(2.2)};display:flex;flex-direction:column;gap:${u(1.4)}">
    <span style="display:flex;align-items:center;gap:${u(1.2)}">
      <i style="width:${u(4.2)};aspect-ratio:1;border-radius:50%;background:linear-gradient(135deg,var(--b-p1),var(--b-ac));display:grid;place-items:center;font-style:normal;font-weight:900;font-size:${u(1.9)}">${esc((x.title||F.state.brand.name||'M')[0])}</i>
      <span style="display:flex;flex-direction:column;line-height:1.2"><b style="font-size:${u(1.9)}">${esc((x.title||F.state.brand.name).split('\n')[0])}</b><span class="fm" style="font-size:${u(1.5)};opacity:.6">${esc(x.kicker||F.state.brand.handle)} · 2h</span></span></span>
    <span style="font-size:${u(2)};line-height:1.5">${esc(x.sub||'Design não é decoração. É a decisão repetida mil vezes até virar identidade.')}</span>
    <span class="fm" style="display:flex;gap:${u(2.4)};font-size:${u(1.6)};opacity:.65"><i style="font-style:normal;display:inline-flex;align-items:center;gap:.35em;color:var(--b-ac)">${F.icon('heart')} 1,2k</i><i style="font-style:normal">💬 84</i><i style="font-style:normal">↗ 312</i></span></div>`);
  c('comment','Comentário','Social',(r,x)=>`<div style="width:${u(32)};display:flex;gap:${u(1.2)};align-items:flex-start">
    <i style="flex:0 0 auto;width:${u(3.6)};aspect-ratio:1;border-radius:50%;background:linear-gradient(135deg,var(--b-p2),var(--b-p1));display:grid;place-items:center;font-style:normal;font-weight:800;font-size:${u(1.6)}">${esc((x.title||'RS')[0])}</i>
    <span style="background:color-mix(in srgb,var(--b-fg) 9%,transparent);border-radius:calc(var(--b-r)*0.9px);padding:${u(1.1)} ${u(1.5)};display:flex;flex-direction:column;gap:.2em">
      <b style="font-size:${u(1.8)}">${esc((x.title||'Rafa Souza').split('\n')[0])}</b>
      <span style="font-size:${u(1.9)};line-height:1.45;opacity:.88">${esc(x.sub||'Melhor conteúdo de marca que já vi por aqui 🔥')}</span></span></div>`);
  c('id-badge','Crachá','Social',(r,x)=>`<div class="glass2" style="width:${u(22)};padding:${u(2)};display:flex;flex-direction:column;align-items:center;gap:${u(1)};text-align:center;border-top:${u(0.7)} solid var(--b-ac)">
    <span class="fm" style="font-size:${u(1.3)};letter-spacing:.2em;opacity:.6">${esc((x.kicker||'SPEAKER').toUpperCase())}</span>
    <i style="width:${u(6.4)};aspect-ratio:1;border-radius:50%;background:linear-gradient(135deg,var(--b-p1),var(--b-ac));display:grid;place-items:center;font-style:normal;font-weight:900;font-size:${u(2.6)}">${esc((x.title||'AB').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase())}</i>
    <b class="fh" style="font-size:${u(2.2)}">${esc((x.title||'Ana Bento').split('\n')[0])}</b>
    <span class="fm" style="font-size:${u(1.5)};opacity:.65">${esc(x.sub||F.state.brand.name)}</span></div>`);

  /* ══════════════════ MOCKUPS ══════════════════ */
  c('phone','Moldura de celular','Mockups',(r,x)=>{
    const fit = x.imgfit==='contain'?'contain':'cover';
    const px2 = x.imgx!=null&&x.imgx!==''?+x.imgx:50, py = x.imgy!=null&&x.imgy!==''?+x.imgy:50;
    const zm = Math.min(3,Math.max(1,+x.imgzoom||1));
    const media = x.img
      ? `<img src="${x.img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:${px2}% ${py}%;transform:scale(${zm});transform-origin:${px2}% ${py}%">`
      : `<div style="position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(160deg,color-mix(in srgb,var(--b-p1) 26%,var(--b-bg)),var(--b-bg))"><b class="fh" style="font-size:${u(2.4)};text-align:center;padding:0 ${u(2)}">${esc((x.title||'Seu app').split('\n')[0])}</b></div>`;
    return `<div style="width:${u(20)};aspect-ratio:9/18.5;border-radius:${u(3.2)};border:${u(0.5)} solid color-mix(in srgb,var(--b-fg) 30%,transparent);background:var(--b-bg);padding:${u(0.6)};box-shadow:0 ${u(2.4)} ${u(7)} rgba(0,0,0,.45)">
    <div style="position:relative;width:100%;height:100%;border-radius:${u(2.4)};overflow:hidden">${media}
    <i style="position:absolute;top:${u(0.9)};left:50%;transform:translateX(-50%);width:32%;height:${u(1.6)};border-radius:99px;background:rgba(0,0,0,.85)"></i></div></div>`;});
  c('video-player','Player de vídeo','Mockups',(r,x)=>{
    const media = x.img?`<img src="${x.img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.85">`:`<div style="position:absolute;inset:0;background:linear-gradient(140deg,color-mix(in srgb,var(--b-p1) 30%,var(--b-bg)),var(--b-bg))"></div>`;
    const p=Math.round(20+r()*60);
    return `<div style="width:${u(40)};aspect-ratio:16/9;border-radius:calc(var(--b-r)*1px);overflow:hidden;position:relative;border:1px solid color-mix(in srgb,var(--b-fg) 22%,transparent);box-shadow:0 ${u(2)} ${u(6)} rgba(0,0,0,.4)">${media}
    <span style="position:absolute;inset:0;display:grid;place-items:center"><i style="width:${u(6.4)};aspect-ratio:1;border-radius:50%;background:color-mix(in srgb,var(--b-bg) 55%,transparent);backdrop-filter:blur(4px);border:1px solid color-mix(in srgb,var(--b-fg) 35%,transparent);color:var(--b-fg);display:grid;place-items:center;font-style:normal;font-size:${u(2.8)}">${F.icon('play')}</i></span>
    <span style="position:absolute;left:${u(1.6)};right:${u(1.6)};bottom:${u(1.4)};display:flex;align-items:center;gap:${u(1)}">
      <i style="flex:1;display:block;height:${u(0.7)};border-radius:99px;background:color-mix(in srgb,var(--b-fg) 28%,transparent)"><i style="display:block;width:${p}%;height:100%;border-radius:99px;background:var(--b-ac)"></i></i>
      <span class="fm" style="font-size:${u(1.5)}">${esc(x.sub||'02:14')}</span></span></div>`;});
  c('music-player','Player de música','Mockups',(r,x)=>`<div class="glass2" style="width:${u(32)};padding:${u(2)};display:flex;align-items:center;gap:${u(1.6)}">
    <i style="flex:0 0 auto;width:${u(6.4)};aspect-ratio:1;border-radius:calc(var(--b-r)*0.7px);background:linear-gradient(135deg,var(--b-ac),var(--b-p1));display:grid;place-items:center;font-style:normal;color:var(--b-bg);font-size:${u(3)}">${F.icon(x.icon||'spark')}</i>
    <span style="flex:1;display:flex;flex-direction:column;gap:.45em;min-width:0">
      <b style="font-size:${u(2)};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc((x.title||'Som da marca').split('\n')[0])}</b>
      <span class="fm" style="font-size:${u(1.5)};opacity:.6">${esc(x.sub||F.state.brand.name)}</span>
      <i style="display:block;height:${u(0.6)};border-radius:99px;background:color-mix(in srgb,var(--b-fg) 15%,transparent)"><i data-anim="line" style="display:block;width:44%;height:100%;border-radius:99px;background:var(--b-ac)"></i></i></span>
    <i style="flex:0 0 auto;font-style:normal;color:var(--b-ac);font-size:${u(2.6)};display:flex">${F.icon('play')}</i></div>`);
  c('search-bar','Barra de busca','Mockups',(r,x)=>`<span style="display:inline-flex;align-items:center;gap:${u(1)};width:${u(32)};background:color-mix(in srgb,var(--b-fg) 8%,transparent);border:1px solid color-mix(in srgb,var(--b-fg) 26%,transparent);border-radius:99px;padding:${u(1.1)} ${u(1.8)}">
    <i style="font-style:normal;opacity:.6;font-size:${u(2.2)};display:flex"><svg class="ic" viewBox="0 0 24 24" style="width:1em;height:1em"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L20.5 20.5"/></svg></i>
    <span style="font-size:${u(2)};opacity:.75">${esc(x.title||'como criar uma marca forte')}</span>
    <i style="font-style:normal;margin-left:auto;width:.55em;height:1.2em;background:var(--b-ac)" data-anim="pulse"></i></span>`);
  c('terminal','Terminal','Mockups',(r,x)=>{
    const ls = lines(x.sub,'$ forje build --brand\n✓ tokens aplicados\n✓ 12 artes exportadas').slice(0,5);
    return `<div class="fm" style="width:${u(34)};background:#0b0d12;border:1px solid color-mix(in srgb,var(--b-fg) 20%,transparent);border-radius:calc(var(--b-r)*1px);overflow:hidden;box-shadow:0 ${u(2)} ${u(6)} rgba(0,0,0,.4)">
    <div style="background:color-mix(in srgb,var(--b-fg) 8%,#0b0d12);padding:${u(0.9)} ${u(1.4)};display:flex;gap:${u(0.6)}"><i style="width:${u(1)};aspect-ratio:1;border-radius:50%;background:#ff5f57"></i><i style="width:${u(1)};aspect-ratio:1;border-radius:50%;background:#febc2e"></i><i style="width:${u(1)};aspect-ratio:1;border-radius:50%;background:#28c840"></i></div>
    <div style="padding:${u(1.8)};font-size:${u(1.8)};line-height:1.75">${ls.map((l2,i)=>`<div style="color:${l2.startsWith('$')?'var(--b-ac)':l2.startsWith('✓')?'var(--b-p2)':'var(--b-fg)'};opacity:${l2.startsWith('$')?1:.88}">${esc(l2)}</div>`).join('')}</div></div>`;});
  c('credit-card','Cartão','Mockups',(r,x)=>`<div style="width:${u(34)};aspect-ratio:1.586;border-radius:calc(var(--b-r)*1.1px);padding:${u(2.2)};display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(130deg,color-mix(in srgb,var(--b-p1) 85%,#000),color-mix(in srgb,var(--b-p2) 55%,var(--b-p1)));box-shadow:0 ${u(2.2)} ${u(6)} rgba(0,0,0,.45);position:relative;overflow:hidden">
    <i style="position:absolute;right:-14%;top:-30%;width:64%;aspect-ratio:1;border-radius:50%;background:color-mix(in srgb,var(--b-ac) 30%,transparent);filter:blur(${u(3)})"></i>
    <span style="display:flex;justify-content:space-between;align-items:center"><b class="fh" style="font-size:${u(2.2)}">${esc((x.title||F.state.brand.name).split('\n')[0])}</b><i style="width:${u(4.4)};height:${u(3.2)};border-radius:${u(0.6)};background:linear-gradient(135deg,#e8c56b,#b98a2f)"></i></span>
    <span style="display:flex;flex-direction:column;gap:.4em"><span class="fm" style="font-size:${u(2.2)};letter-spacing:.14em">•••• •••• •••• ${esc(x.value||'2048')}</span>
    <span class="fm" style="font-size:${u(1.5)};opacity:.75;display:flex;justify-content:space-between"><span>${esc(x.sub||'MEMBRO DESDE 2020')}</span><span>12/29</span></span></span></div>`);
  c('calendar-date','Data de calendário','Mockups',(r,x)=>{
    const dt=(x.title||'24 AGO').split(' ');
    return `<div style="width:${u(11)};border-radius:calc(var(--b-r)*0.9px);overflow:hidden;text-align:center;border:1px solid color-mix(in srgb,var(--b-fg) 24%,transparent);background:color-mix(in srgb,var(--b-fg) 6%,transparent)">
    <span class="fm" style="display:block;background:var(--b-ac);color:var(--b-bg);font-size:${u(1.6)};letter-spacing:.18em;padding:${u(0.6)} 0;font-weight:700">${esc((dt[1]||'AGO').toUpperCase())}</span>
    <b class="fh" style="display:block;font-size:${u(5.4)};padding:${u(0.8)} 0 ${u(0.2)};line-height:1">${esc(dt[0]||'24')}</b>
    <span class="fm" style="display:block;font-size:${u(1.4)};opacity:.6;padding-bottom:${u(0.8)}">${esc(x.sub||'quarta')}</span></div>`;});
  c('map-pin','Pin de local','Mockups',(r,x)=>`<span style="display:inline-flex;align-items:center;gap:${u(1)};background:color-mix(in srgb,var(--b-bg) 70%,transparent);backdrop-filter:blur(4px);border:1px solid color-mix(in srgb,var(--b-fg) 26%,transparent);border-radius:99px;padding:${u(0.8)} ${u(1.6)} ${u(0.8)} ${u(0.9)}">
    <i style="width:${u(3.4)};aspect-ratio:1;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--b-ac);display:grid;place-items:center;font-style:normal"><b style="transform:rotate(45deg);width:35%;aspect-ratio:1;border-radius:50%;background:var(--b-bg)"></b></i>
    <span style="display:flex;flex-direction:column;line-height:1.15"><b style="font-size:${u(1.9)}">${esc((x.title||'Estúdio Forjelo').split('\n')[0])}</b><span class="fm" style="font-size:${u(1.4)};opacity:.6">${esc(x.sub||'São Paulo · SP')}</span></span></span>`);
  c('toggle-row','Configuração','Mockups',(r,x)=>`<div class="glass2" style="width:${u(30)};padding:${u(1.6)} ${u(2)};display:flex;align-items:center;justify-content:space-between;gap:${u(2)}">
    <span style="display:flex;flex-direction:column;line-height:1.25"><b style="font-size:${u(2)}">${esc((x.title||'Modo sistema').split('\n')[0])}</b><span style="font-size:${u(1.6)};opacity:.65">${esc(x.sub||'design determinístico')}</span></span>
    <i style="flex:0 0 auto;width:${u(4.6)};height:${u(2.6)};border-radius:99px;background:var(--b-ac);position:relative;font-style:normal"><b style="position:absolute;top:${u(0.3)};right:${u(0.3)};width:${u(2)};height:${u(2)};border-radius:50%;background:var(--b-bg)"></b></i></div>`);
  c('qr','QR code','Mockups',(r,x)=>{
    /* QR REAL e escaneável (lib/codes.js): o conteúdo vem do formulário
       do COMPOR (URL ou texto livre) — determinístico, sem seed. */
    const content = (x.qrdata||'').trim() || 'https://forjelo.com';
    return `<div style="width:${u(14)};background:#fff;padding:${u(0.9)};border-radius:calc(var(--b-r)*0.7px)">
    <div style="aspect-ratio:1">${F.qrSVG(content)}</div>
    ${x&&x.sub?`<div class="fm" style="color:#111;text-align:center;font-size:${u(1.3)};margin-top:${u(0.4)};padding:0 ${u(0.3)} ${u(0.3)};overflow-wrap:anywhere">${esc(x.sub)}</div>`:''}</div>`;});

  /* ══════════════════ LISTAS & ESTRUTURA ══════════════════ */
  c('steps-h','Passos horizontais','Listas',(r,x)=>{
    const its = lines(x.sub,'Briefing\nSistema\nEntrega').slice(0,4);
    return `<div style="display:inline-flex;align-items:flex-start;gap:${u(0.5)}">${its.map((l2,i)=>
      `<span style="display:flex;align-items:center;gap:${u(0.5)}">
        <span data-anim="pop" style="--d:${(i*.16).toFixed(2)}s;display:flex;flex-direction:column;align-items:center;gap:.5em;width:${u(11)}">
          <i style="width:${u(4)};aspect-ratio:1;border-radius:50%;font-style:normal;display:grid;place-items:center;font-weight:800;font-size:${u(1.9)};${i===0?'background:var(--b-ac);color:var(--b-bg)':'border:'+u(0.24)+' solid color-mix(in srgb,var(--b-fg) 40%,transparent)'}">${i+1}</i>
          <b style="font-size:${u(1.8)};text-align:center">${esc(l2)}</b></span>
        ${i<its.length-1?`<i data-anim="line" style="--d:${(i*.16+.1).toFixed(2)}s;display:block;width:${u(5)};height:${u(0.26)};background:color-mix(in srgb,var(--b-fg) 35%,transparent);margin-top:${u(1.9)}"></i>`:''}</span>`).join('')}</div>`;});
  c('timeline-v','Linha do tempo','Listas',(r,x)=>{
    const its = lines(x.sub,'2022 | Fundação do estúdio\n2024 | 100º projeto entregue\n2026 | Operação internacional').slice(0,5)
      .map(l2=>l2.split('|').map(z=>z.trim()));
    return `<div style="display:inline-flex;flex-direction:column">${its.map(([y,t],i)=>
      `<span data-anim="slide-r" style="--d:${(i*.15).toFixed(2)}s;display:flex;gap:${u(1.4)}">
        <span style="display:flex;flex-direction:column;align-items:center"><i style="width:${u(1.5)};aspect-ratio:1;border-radius:50%;background:var(--b-ac);flex:0 0 auto"></i>${i<its.length-1?`<i style="flex:1;width:${u(0.24)};background:color-mix(in srgb,var(--b-fg) 28%,transparent);min-height:${u(3)}"></i>`:''}</span>
        <span style="display:flex;flex-direction:column;padding-bottom:${u(2.2)}"><b class="fm" style="font-size:${u(1.7)};color:var(--b-ac)">${esc(y||'')}</b><span style="font-size:${u(2)}">${esc(t||y)}</span></span></span>`).join('')}</div>`;});
  c('faq','Pergunta & resposta','Listas',(r,x)=>`<div class="glass2" style="width:${u(38)};padding:${u(2.4)};display:flex;flex-direction:column;gap:${u(1.2)}">
    <span style="display:flex;gap:${u(1)};align-items:flex-start"><b class="fh" style="color:var(--b-ac);font-size:${u(2.6)}">Q.</b><b style="font-size:${u(2.3)};line-height:1.35">${esc((x.title||'Quanto tempo leva um projeto de marca?').split('\n')[0])}</b></span>
    <span style="display:flex;gap:${u(1)};align-items:flex-start"><b class="fh" style="color:var(--b-p2);font-size:${u(2.6)}">A.</b><span style="font-size:${u(2)};line-height:1.5;opacity:.85">${esc(x.sub||'De 4 a 6 semanas, do diagnóstico à entrega do sistema completo.')}</span></span></div>`);
  c('quote-big','Aspas monumentais','Listas',(r,x)=>`<div style="width:${u(42)};position:relative;padding-left:${u(5)}">
    <b class="fh" style="position:absolute;left:0;top:${u(-2)};font-size:${u(12)};line-height:1;color:var(--b-ac);opacity:.9">“</b>
    <span class="fh" style="font-size:${u(3.4)};line-height:1.3;font-weight:700;display:block">${nl(x.sub||'A marca é o que fazem\nquando você não está na sala.')}</span>
    ${x.title?`<span class="fm" style="display:block;margin-top:${u(1.4)};font-size:${u(1.8)};opacity:.7">— ${esc(x.title.split('\n')[0])}</span>`:''}</div>`);
  c('divider','Divisor ornamentado','Listas',(r,x)=>`<span style="display:inline-flex;align-items:center;gap:${u(1.4)};width:${u(34)}">
    <i style="flex:1;height:${u(0.22)};background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--b-fg) 45%,transparent))"></i>
    <i style="font-style:normal;color:var(--b-ac);font-size:${u(2.4)};display:flex">${F.icon(x.icon||'spark')}</i>
    <i style="flex:1;height:${u(0.22)};background:linear-gradient(90deg,color-mix(in srgb,var(--b-fg) 45%,transparent),transparent)"></i></span>`);
  c('section-head','Cabeçalho de seção','Listas',(r,x)=>`<span style="display:inline-flex;align-items:baseline;gap:${u(1.6)}">
    <b class="fh" style="font-size:${u(6.4)};line-height:1;color:transparent;-webkit-text-stroke:${u(0.16)} var(--b-ac)">${esc(x.kicker||'01')}</b>
    <span style="display:flex;flex-direction:column;gap:.3em"><b class="fh" style="font-size:${u(3.2)}">${esc((x.title||'Diagnóstico').split('\n')[0])}</b>
    <i style="display:block;width:${u(9)};height:${u(0.5)};border-radius:99px;background:var(--b-ac)" data-anim="line"></i></span></span>`);
  c('checklist-x','Lista faz/não faz','Listas',(r,x)=>{
    const sim = lines(x.title,'Sistema próprio\nTokens da marca').slice(0,3);
    const nao = lines(x.sub,'Template genérico\nSorte no feed').slice(0,3);
    const li=(t,ok,i)=>`<span data-anim="slide-r" style="--d:${(i*.13).toFixed(2)}s;display:inline-flex;align-items:center;gap:.6em;font-size:${u(2.1)}">
      <i style="font-style:normal;width:${u(2.8)};aspect-ratio:1;border-radius:50%;display:grid;place-items:center;font-size:${u(1.6)};${ok?'background:var(--b-p2);color:var(--b-bg)':'background:color-mix(in srgb,#f43f5e 22%,transparent);color:#f87171'}">${ok?F.icon('check'):'✕'}</i>${esc(t)}</span>`;
    return `<div style="display:inline-flex;gap:${u(4)}"><span style="display:flex;flex-direction:column;gap:${u(1.1)}">${sim.map((t,i)=>li(t,true,i)).join('')}</span>
    <span style="display:flex;flex-direction:column;gap:${u(1.1)}">${nao.map((t,i)=>li(t,false,i)).join('')}</span></div>`;});

  /* ══════════════════ RÓTULOS & SELOS ══════════════════ */
  c('ribbon','Fita de canto','Rótulos',(r,x)=>`<span style="display:inline-block;background:var(--b-ac);color:var(--b-bg);font-weight:800;font-size:${u(2)};letter-spacing:.1em;padding:.5em 2.6em;transform:rotate(-8deg);box-shadow:0 ${u(0.8)} ${u(2.4)} rgba(0,0,0,.35);clip-path:polygon(2% 0,98% 0,100% 50%,98% 100%,2% 100%,0 50%)">${esc((x.kicker||'DESTAQUE').toUpperCase())}</span>`);
  c('stamp','Carimbo circular','Rótulos',(r,x)=>{
    const txt = esc((x.title||'FEITO À MÃO · FORJADO · ').toUpperCase());
    return `<div data-anim="spin" style="width:${u(15)};aspect-ratio:1;position:relative;color:var(--b-ac)">
    <svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible">
      <defs><path id="stc${Math.floor(r()*1e6)}" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1 -76 0"/></defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" stroke-width="2.4"/>
      <circle cx="50" cy="50" r="29" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <text style="font-size:11px;letter-spacing:2.6px;font-weight:700;fill:currentColor;font-family:var(--fm)"><textPath href="#stc${Math.floor(r()*1e6)}" startOffset="0">${txt}</textPath></text>
    </svg>
    <span style="position:absolute;inset:0;display:grid;place-items:center;font-size:${u(4)}">${F.icon(x.icon||'spark')}</span></div>`;});
  c('discount-seal','Selo de oferta','Rótulos',(r,x)=>`<div data-anim="pop" style="width:${u(13)};aspect-ratio:1;clip-path:polygon(${(function(){const pts=[];for(let k=0;k<24;k++){const a=Math.PI*k/12-Math.PI/2,rr=k%2?42:50;pts.push((50+rr*Math.cos(a)).toFixed(1)+'% '+(50+rr*Math.sin(a)).toFixed(1)+'%');}return pts.join(',');})()});background:var(--b-ac);color:var(--b-bg);display:grid;place-items:center;text-align:center;transform:rotate(${(r()*16-8).toFixed(0)}deg)">
    <span style="display:flex;flex-direction:column;line-height:1"><b class="fh" style="font-size:${u(3.4)}">${esc(x.title||'-40%')}</b><span class="fm" style="font-size:${u(1.2)};letter-spacing:.12em;font-weight:700">${esc((x.sub||'SÓ HOJE').toUpperCase())}</span></span></div>`);
  c('flag-new','Bandeira NOVO','Rótulos',(r,x)=>`<span style="display:inline-flex;align-items:center;gap:.5em;background:var(--b-p2);color:var(--b-bg);font-weight:900;font-size:${u(2)};letter-spacing:.14em;padding:.45em 1em;clip-path:polygon(0 0,100% 0,92% 50%,100% 100%,0 100%)">${esc((x.kicker||'NOVO').toUpperCase())}&nbsp;&nbsp;</span>`);
  c('date-chip','Chip de data','Rótulos',(r,x)=>`<span class="fm" style="display:inline-flex;align-items:center;gap:.55em;border:1px solid color-mix(in srgb,var(--b-fg) 30%,transparent);border-radius:99px;padding:.5em 1.1em;font-size:${u(1.9)}"><i style="font-style:normal;color:var(--b-ac);display:flex;font-size:1.15em"><svg class="ic" viewBox="0 0 24 24" style="width:1em;height:1em"><rect x="4" y="5.5" width="16" height="15" rx="3"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></svg></i>${esc(x.title||'24 ago · 19h')}</span>`);
  c('loc-chip','Chip de local','Rótulos',(r,x)=>`<span class="fm" style="display:inline-flex;align-items:center;gap:.55em;border:1px solid color-mix(in srgb,var(--b-fg) 30%,transparent);border-radius:99px;padding:.5em 1.1em;font-size:${u(1.9)}"><i style="font-style:normal;color:var(--b-ac);display:flex;font-size:1.15em"><svg class="ic" viewBox="0 0 24 24" style="width:1em;height:1em"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg></i>${esc(x.title||'São Paulo · SP')}</span>`);
  c('swatches','Paleta da marca','Rótulos',()=>`<span style="display:inline-flex;gap:${u(0.8)}">${['bg','p1','p2','ac','fg'].map((t,i)=>
    `<i data-anim="pop" style="--d:${(i*.08).toFixed(2)}s;font-style:normal;width:${u(4)};aspect-ratio:1;border-radius:${u(1.1)};background:var(--b-${t});border:1px solid color-mix(in srgb,var(--b-fg) 28%,transparent)"></i>`).join('')}</span>`);
  c('barcode','Código de barras','Rótulos',(r,x)=>{
    /* Code 128 REAL e escaneável (lib/codes.js): o código vem do
       formulário do COMPOR (números e/ou texto) — determinístico. */
    const content = (x.title||'').trim() || '0072026400018';
    return `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:.4em;color:var(--b-fg)">
    <span style="display:block;width:${u(18)};height:${u(5.4)}">${F.barcodeSVG(content)}</span>
    <span class="fm" style="font-size:${u(1.5)};letter-spacing:.3em;opacity:.7">${esc(content)}</span></span>`;});

  /* ---------- campos editáveis por componente ---------- */
  const FIELDS = {
    'btn-play':['title'], 'link-arrow':['cta'], tag:['kicker'], 'tag-row':['sub'],
    'download-chip':['title','sub'], 'card-feature':['title','sub','icon'],
    'card-step':['kicker','title','sub'], 'card-banner':['title','sub','cta'],
    'card-profile':['kicker','title','sub'], 'card-event':['kicker','title','sub'],
    coupon:['kicker','title','sub'], polaroid:['sub'],
    kpi:['title','sub'], 'stat-row':['sub'], sparkline:['data','title','sub'],
    'chart-pie':['kicker','title','sub'], gauge:['value'], 'chart-cols':['sub'],
    compare:['title','kicker','sub'], delta:['title','sub'], heatgrid:['data','sub'],
    'chat-in':['sub'], 'chat-out':['sub'], 'social-post':['kicker','title','sub'],
    comment:['title','sub'], 'id-badge':['kicker','title','sub'],
    phone:['title'], 'video-player':['sub'], 'music-player':['title','sub','icon'],
    'search-bar':['title'], terminal:['sub'], 'credit-card':['title','sub','value'],
    'calendar-date':['title','sub'], 'map-pin':['title','sub'], 'toggle-row':['title','sub'],
    qr:['qrdata','sub'],
    'steps-h':['sub'], 'timeline-v':['sub'], faq:['title','sub'],
    'quote-big':['title','sub'], divider:['icon'], 'section-head':['kicker','title'],
    'checklist-x':['title','sub'],
    ribbon:['kicker'], stamp:['title','icon'], 'discount-seal':['title','sub'],
    'flag-new':['kicker'], 'date-chip':['title'], 'loc-chip':['title'], barcode:['title'],
  };
  Object.entries(FIELDS).forEach(([id,f])=>{ const d=F.components.get(id); if(d) d.fields=f; });
  /* componentes que acoplam imagem própria (upload + enquadramento no COMPOR) */
  ['phone','video-player','polaroid'].forEach(id=>{ const d=F.components.get(id); if(d) d.imgSlot=true; });
})(window.FORMA);
