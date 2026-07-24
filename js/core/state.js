/* =====================================================
   FORJE·studio — core/state.js
   Namespace global, registries expansíveis, estado e
   persistência. Carregar SEMPRE primeiro.
   ===================================================== */
window.FORMA = (function(){

  /* ---------- registries: a base a ser populada ---------- */
  function makeRegistry(){
    const map = {};
    return {
      map,
      register(id, def){ map[id] = def; return def; },
      get(id){ return map[id]; },
      ids(){ return Object.keys(map); },
      entries(){ return Object.entries(map); },
    };
  }

  const F = {
    icons:     makeRegistry(),   // id -> {n, svg}
    anims:     makeRegistry(),   // id -> {n, kind:'in'|'loop'} (metadados p/ UI futura)
    fx:        makeRegistry(),   // id -> {n, cls}
    elements:  makeRegistry(),   // id -> {n, html(rng)}
    fonts:     makeRegistry(),   // id -> {n, css, role:'display'|'body'|'both'}
    templates: makeRegistry(),   // id -> {n, d, mini, render(slide, rng)}
    scenes:    makeRegistry(),   // id -> {n, d, dur, fields:[], render(scene, rng?)} — rng opcional (fase 1.3)
  };

  /* ---------- estado ---------- */
  F.defBrand = () => ({
    name:'Sua Marca', handle:'@suamarca',
    bg:'#101014', fg:'#f5f4ef', p1:'#4f46e5', p2:'#22d3ee', ac:'#ffb020',
    fontH:'space', fontB:'inter', fontPool:[], radius:24, logo:null,
    customFonts:[],                  // [{name, data(dataURL), role}]
  });
  /* F.dtr: tradutor dos textos PADRÃO da arte — o i18n substitui por um
     tradutor real; antes dele carregar (1º slide), é identidade e o
     artSync() do i18n ajusta o idioma logo em seguida. */
  F.dtr = F.dtr || (s=>s);
  F.defSlide = (i) => ({
    kicker: i ? F.dtr('PARTE')+' 0'+(i+1) : F.dtr('LANÇAMENTO'),
    title:  i ? F.dtr('Continue a história aqui') : F.dtr('Design de sistema,\nnão de sorte'),
    sub: F.dtr('Um brandbook, infinitas composições. Determinístico quando você quer, variável quando você pede.'),
    img:null, mask:'cover',
  });
  F.defScene = (type) => {
    const def = F.scenes.get(type) || {};
    return { type, dur: def.dur || 2600, exit:'fade', enter:'none',
      kicker:'', title: F.dtr(def.n || 'Cena'), sub:'', icon:'spark', img:null, mask:'cover',
      value:120, suffix:'+', items: F.dtr('Rápido\nConsistente\nSeu') };
  };

  F.FORMATS = {
    post:  {n:'Post 1:1',        w:1080, h:1080},
    igpost:{n:'Post Instagram 4:5', w:1080, h:1350},
    story: {n:'Story 9:16',      w:1080, h:1920},
    wide:  {n:'Wide 16:9',       w:1920, h:1080},
    yt:    {n:'Thumb YouTube',   w:1280, h:720},
    li:    {n:'Post LinkedIn',   w:1200, h:627},
    x:     {n:'Card X/Twitter',  w:1600, h:900},
    pin:   {n:'Pin 2:3',         w:1000, h:1500},
    cover: {n:'Cover LinkedIn',  w:1584, h:396},
    ebook: {n:'E-book A4',       w:1240, h:1754, doc:'pdf'},
    pres:  {n:'Apresentação 16:9', w:1920, h:1080, doc:'pptx'},
  };

  F.state = {
    mode:'design',                       // 'design' | 'motion'
    brand: F.defBrand(),
    fx:['grain'],                        // efeitos ativos (fx registry)
    format:'post', tpl:'manifesto', seed:7, speed:1,
    cta:'Saiba mais →', accentIcon:'spark', pager:'counter',
    slides:[F.defSlide(0)], cur:0,
    timeline:[], curScene:0,
    /* ---- eixos de variação (fundação do plano de diferenciação) ----
       seeds: null = o eixo segue o seed mestre (render idêntico ao
       legado — P1); valor próprio = eixo divergiu do mestre.
       Exceção de semântica: palette null = comportamento NOVO
       desligado (identidade), pois não existia antes da fundação.
       seedLocks: eixo travado é âncora — a folha de variações não o
       sorteia ('tpl' trava o template junto). O eixo 'deco' foi
       removido por decisão de produto (S3.1): adorno agora é
       ESTRUTURAL, decidido pelo compositor (core/composer.js). */
    seeds:{layout:null, palette:null, type:null},
    seedLocks:{layout:false, palette:false, type:false, tpl:false},
    plugins:[],
    edits:{},
    artTokens:{},                        // cores por arte {chave:{bg,fg,p1,p2,ac}}
    compose:{}                           // itens compostos por arte {chave:[{id,comp,x,y,seed,icon}]},                            // edições manuais por arte {chave:[{eid,k,del}]}                          // [{name, code}] — biblioteca do usuário
  };

  /* ---------- plugins: biblioteca expansível pelo frontend ----------
     Um plugin é um arquivo .js que recebe FORMA e registra
     templates/cenas/ícones/efeitos. Persiste junto do conteúdo. */
  F.runPlugin = function(p){
    try{ new Function('FORMA', p.code)(F); return true; }
    catch(e){ console.warn('plugin falhou:', p.name, e);
      if(F.toast) F.toast('Plugin "'+p.name+'" falhou: '+e.message); return false; }
  };
  F.runPlugins = function(){ (F.state.plugins||[]).forEach(F.runPlugin); };

  /* ---------- persistência ----------
     Ordem: window.storage (ambiente Claude) → IndexedDB (web/local,
     persiste entre sessões por origem) → memória (último recurso).
     IndexedDB não é um arquivo portável tipo SQLite — o backup .json
     continua sendo a rota para levar o projeto entre máquinas. */
  const mem = {};
  let _idb;                        // Promise<IDBDatabase|null>
  function idb(){
    if(_idb) return _idb;
    _idb = new Promise(res=>{
      try{
        if(typeof indexedDB === 'undefined') return res(null);
        const rq = indexedDB.open('forma-studio', 1);
        rq.onupgradeneeded = ()=>rq.result.createObjectStore('kv');
        rq.onsuccess = ()=>res(rq.result);
        rq.onerror = ()=>res(null);
        rq.onblocked = ()=>res(null);
      }catch(e){ res(null); }
    });
    return _idb;
  }
  function idbOp(mode, fn){
    return idb().then(db=>{
      if(!db) return undefined;
      return new Promise((res,rej)=>{
        const tx = db.transaction('kv', mode), st = tx.objectStore('kv');
        const rq = fn(st);
        tx.oncomplete = ()=>res(rq && 'result' in rq ? rq.result : undefined);
        tx.onerror = ()=>rej(tx.error);
      });
    }).catch(()=>undefined);
  }
  F.stGet = async k => {
    try{ if(window.storage){ const r = await window.storage.get(k); return r ? r.value : null; } }catch(e){}
    const v = await idbOp('readonly', st=>st.get(k));
    if(v !== undefined) return v;
    return mem[k] ?? null;
  };
  F.stSet = async (k,v) => {
    try{ if(window.storage){ await window.storage.set(k,v); return; } }catch(e){}
    const ok = await idbOp('readwrite', st=>st.put(v,k)).then(()=>true, ()=>false);
    if(!ok) mem[k]=v;
  };
  F.stDel = async k => {
    try{ if(window.storage){ await window.storage.delete(k); return; } }catch(e){}
    await idbOp('readwrite', st=>st.delete(k));
    delete mem[k];
  };

  F.loadPersisted = async function(){
    const b = await F.stGet('forma:brand');
    const c = await F.stGet('forma:content');
    if(b){ try{ F.state.brand = {...F.defBrand(), ...JSON.parse(b)}; }catch(e){} }
    if(c){ try{
      const o = JSON.parse(c);
      Object.assign(F.state, {
        cta:o.cta ?? F.state.cta, slides:o.slides ?? F.state.slides,
        format:o.format ?? F.state.format, tpl:o.tpl ?? F.state.tpl,
        timeline:o.timeline ?? [], fx:o.fx ?? F.state.fx,
        accentIcon:o.accentIcon ?? F.state.accentIcon,
        pager:o.pager ?? F.state.pager,
        plugins:o.plugins ?? [],
        edits:o.edits ?? {},
        artTokens:o.artTokens ?? {},
        compose:o.compose ?? {},
        /* eixos de variação: defaults neutros → projetos antigos renderizam igual (P1) */
        seeds:{layout:null, palette:null, type:null, deco:null, ...(o.seeds||{})},
        seedLocks:{layout:false, palette:false, type:false, tpl:false, ...(o.seedLocks||{})},
      });
    }catch(e){} }
  };
  let saveT;
  F.autoSave = function(){
    clearTimeout(saveT);
    saveT = setTimeout(()=>{ const s = F.state;
      F.stSet('forma:content', JSON.stringify({cta:s.cta, slides:s.slides, format:s.format,
        tpl:s.tpl, timeline:s.timeline, fx:s.fx, accentIcon:s.accentIcon, pager:s.pager, plugins:s.plugins, edits:s.edits, artTokens:s.artTokens, compose:s.compose,
        seeds:s.seeds, seedLocks:s.seedLocks})); }, 600);
  };
  F.saveBrand  = () => F.stSet('forma:brand', JSON.stringify(F.state.brand));
  F.resetBrand = () => { F.state.brand = F.defBrand(); return F.stDel('forma:brand'); };

  /* backup em arquivo (essencial para uso local via file://) */
  F.exportJSON = function(){
    const s = F.state;
    return JSON.stringify({brand:s.brand, cta:s.cta, slides:s.slides, timeline:s.timeline,
      fx:s.fx, format:s.format, tpl:s.tpl, accentIcon:s.accentIcon, pager:s.pager, plugins:s.plugins, edits:s.edits, artTokens:s.artTokens, compose:s.compose,
      seeds:s.seeds, seedLocks:s.seedLocks}, null, 1);
  };
  F.importJSON = function(txt){
    const o = JSON.parse(txt), s = F.state;
    if(o.brand) s.brand = {...F.defBrand(), ...o.brand};
    ['cta','slides','timeline','fx','format','tpl','accentIcon','pager','plugins','edits','artTokens','compose'].forEach(k=>{ if(o[k]!=null) s[k]=o[k]; });
    /* eixos: sempre a partir do JSON (ausente = neutro), nunca herdando da sessão */
    s.seeds = {layout:null, palette:null, type:null, deco:null, ...(o.seeds||{})};
    s.seedLocks = {layout:false, palette:false, type:false, tpl:false, ...(o.seedLocks||{})};
    s.cur = 0; s.curScene = 0;
  };

  /* ---------- operações LIMPAS de slides/cenas ----------
     compose/edits/artTokens são indexados por arte:
       design → edits/compose 'd|tpl|i|seed' · artTokens 'd|i'
       motion → edits/compose 'm|i|type'     · artTokens 'm|i'
     Remover ou reordenar sem remapear embaralharia as composições —
     estas funções mantêm tudo colado à arte certa. */
  F.remapArtKeys = function(mode, remap){           // remap(oldIdx) → newIdx | -1 descarta
    const p0 = mode==='design' ? 'd' : 'm';
    ['edits','compose','artTokens'].forEach(field=>{
      const src = F.state[field]; if(!src) return;
      const out = {};
      for(const k in src){
        const p = k.split('|');
        if(p[0]!==p0){ out[k] = src[k]; continue; }
        /* posição do índice: design usa d|i (artTokens) ou d|tpl|i|seed;
           motion usa m|i ou m|i|type — índice sempre na posição 1 */
        const pos = (p0==='d' && p.length>=3) ? 2 : 1;
        const ni = remap(+p[pos]);
        if(ni==null || ni<0) continue;              // arte removida: descarta os dados dela
        p[pos] = ni;
        out[p.join('|')] = src[k];
      }
      F.state[field] = out;
    });
  };
  F.removeSlide = function(i){
    const s = F.state;
    if(s.slides.length<=1 || i<0 || i>=s.slides.length) return false;
    s.slides.splice(i,1);
    F.remapArtKeys('design', o=> o===i ? -1 : (o>i ? o-1 : o));
    s.cur = s.cur>i ? s.cur-1 : Math.min(s.cur, s.slides.length-1);
    F.autoSave(); return true;
  };
  F.moveSlide = function(i, j){
    const s = F.state;
    if(i===j || i<0 || j<0 || i>=s.slides.length || j>=s.slides.length) return false;
    [s.slides[i], s.slides[j]] = [s.slides[j], s.slides[i]];
    F.remapArtKeys('design', o=> o===i ? j : (o===j ? i : o));
    if(s.cur===i) s.cur = j; else if(s.cur===j) s.cur = i;
    F.autoSave(); return true;
  };
  F.removeScene = function(i){
    const s = F.state;
    if(i<0 || i>=s.timeline.length) return false;
    s.timeline.splice(i,1);
    F.remapArtKeys('motion', o=> o===i ? -1 : (o>i ? o-1 : o));
    s.curScene = s.curScene>i ? s.curScene-1 : Math.max(0, Math.min(s.curScene, s.timeline.length-1));
    F.autoSave(); return true;
  };
  F.moveScene = function(i, j){
    const s = F.state;
    if(i===j || i<0 || j<0 || i>=s.timeline.length || j>=s.timeline.length) return false;
    [s.timeline[i], s.timeline[j]] = [s.timeline[j], s.timeline[i]];
    F.remapArtKeys('motion', o=> o===i ? j : (o===j ? i : o));
    if(s.curScene===i) s.curScene = j; else if(s.curScene===j) s.curScene = i;
    F.autoSave(); return true;
  };

  /* ---------- RNG determinístico ---------- */
  /* seed efetivo de um eixo: o próprio quando divergiu, o mestre quando null */
  F.seedOf = function(axis){
    const v = (F.state.seeds||{})[axis];
    return v==null ? F.state.seed : v;
  };
  F.rngOf = function(seed){ let a = seed>>>0;
    return () => { a|=0; a = a+0x6D2B79F5|0; let t = Math.imul(a^a>>>15, 1|a);
      t = t+Math.imul(t^t>>>7, 61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
  F.pick = (r,arr) => arr[Math.floor(r()*arr.length)];

  /* ---------- Eixo 1 · fase 1.2 — eixos internos por template ----------
     Vetor de eixos DECLARADOS que os templates MIGRADOS interpretam para
     aprofundar a variação: densidade (respiro vs. preenchido), alinhamento
     do bloco de texto (quando o formato permite), contraste tipográfico
     título/sub, família e intensidade do fundo (bgs.js) e assinatura
     gráfica (barra, marca-texto, sublinhado, vazado, sticker) com posição.
     Nº FIXO de sorteios do rng de layout (P3 — determinismo estável mesmo
     que o template consuma mais rng depois); template não migrado ignora
     o helper e permanece byte a byte idêntico (P1). */
  F.tplAxes = function(r){
    const fmt = F.FORMATS[F.state.format] || {w:1080,h:1080};
    const wide = fmt.w/fmt.h >= 1.25;      // largos aceitam centro com mais frequência
    return {
      density : F.pick(r, ['air','air','mid','full']),                    // respiro
      align   : F.pick(r, wide ? ['left','left','center','center','right']
                               : ['left','left','left','center','right']),
      contrast: F.pick(r, ['high','high','mid','soft']),                  // título vs. sub
      bgKind  : F.pick(r, ['lib','lib','id','flat']),                     // família do fundo
      bgAmp   : F.pick(r, ['soft','bold','bold']),                        // intensidade
      sig     : F.pick(r, ['bar','bar','hl','ub','hollow','sticker','none']),
      sigPos  : F.pick(r, ['under','under','over','side']),
    };
  };

  /* ---------- Eixo 1 · fase 1.3 — rng de variação por CENA ----------
     Derivado do eixo de layout (trava/divergência valem para motion).
     Fórmula ÚNICA usada por palco (mountScene), miniaturas do navegador,
     grade de pranchetas e folha de contato — paridade P5 por construção.
     Cenas não migradas simplesmente ignoram o parâmetro (retrocompat). */
  F.sceneRng = idx => F.rngOf(F.seedOf('layout')*6271 + idx*97 + 5);

  /* ---------- helpers de composição ---------- */
  /* deslocamento de rng por arte (Eixo 3): o índice legado i*101 somado
     ao seed POR LINHA do lote (slide.sd). Projetos sem sd → exatamente
     i*101, byte a byte (P1). Uma única fonte para palco, réguas, boards,
     folha de contato e assinatura do compositor (P5). */
  F.artOff = i => i*101 + (((F.state.slides||[])[i]||{}).sd||0);

  F.esc = s => String(s??'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* ---------- dados reais nos componentes ----------
     Os componentes da seção "Dados" aceitam valores digitados no
     formulário do COMPOR (fidedignos), com fallback determinístico por
     seed quando o campo fica vazio (comportamento original preservado).
     F.dataRows: linhas "Rótulo | valor" → [{label, value|null}]
     F.numList : "12, 40 8\n30" → [12,40,8,30] (vírgula, espaço ou linha)
     F.splitVal: "Antes | 22" → {label:'Antes', value:22|null}          */
  F.dataRows = function(text){
    return String(text||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{
      const i = l.lastIndexOf('|');
      if(i<0) return {label:l, value:null};
      const v = parseFloat(String(l.slice(i+1)).replace(',','.').replace(/[^\d.\-]/g,''));
      return {label:l.slice(0,i).trim(), value:isFinite(v)?v:null};
    });
  };
  F.numList = function(text){
    return String(text||'').split(/[\s,;\n]+/).map(t=>parseFloat(t.replace(',','.')))
      .filter(v=>isFinite(v));
  };
  F.splitVal = function(s, fbLabel){
    const l = String(s||'').split('\n')[0];
    if(!l) return {label:fbLabel, value:null};
    const i = l.lastIndexOf('|');
    if(i<0) return {label:l.trim()||fbLabel, value:null};
    const v = parseFloat(String(l.slice(i+1)).replace(',','.').replace(/[^\d.\-]/g,''));
    return {label:l.slice(0,i).trim()||fbLabel, value:isFinite(v)?v:null};
  };

  /* comprime imagens NA ENTRADA: uma foto de celular vira 5–15 MB de base64
     que seriam re-parseados a cada render, duplicados nas miniaturas e
     serializados no autoSave — travando a ferramenta toda. Reduz para no
     máximo `max` px na maior aresta (PNG preserva alfa; resto vira JPEG).
     Qualquer falha (canvas indisponível etc.) devolve o original intacto. */
  F.shrinkImage = function(src, max=1600){
    return new Promise(resolve=>{
      let done = false;
      const res = v=>{ if(!done){ done = true; clearTimeout(guard); resolve(v); } };
      const guard = setTimeout(()=>res(src), 2500);   // imagem corrupta/ambiente sem loader: devolve original
      try{
        if(!/^data:image\//.test(src)) return res(src);
        const im = new Image();
        im.onload = ()=>{
          try{
            const w = im.naturalWidth||im.width, h = im.naturalHeight||im.height;
            if(!w || !h) return res(src);
            const k = Math.min(1, max/Math.max(w,h));
            const keepPng = /^data:image\/(png|webp|gif|svg)/.test(src);
            if(k===1 && (keepPng || src.length < 400_000)) return res(src);  // já pequena
            const cv = document.createElement('canvas');
            cv.width = Math.max(1, Math.round(w*k)); cv.height = Math.max(1, Math.round(h*k));
            const cx = cv.getContext('2d'); if(!cx) return res(src);
            cx.drawImage(im, 0, 0, cv.width, cv.height);
            const out = keepPng ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', .86);
            res(out && out.length < src.length ? out : src);
          }catch(e){ res(src); }
        };
        im.onerror = ()=>res(src);
        im.src = src;
      }catch(e){ res(src); }
    });
  };
  F.nl  = s => F.esc(s).replace(/\n/g,'<br>');
  F.letters = function(s){ let i=0;
    /* cada PALAVRA vive num invólucro inline-block (.lw): o navegador cria
       oportunidade de quebra entre inline-blocks adjacentes, então letras
       soltas migravam sozinhas de linha — agrupadas, a quebra só acontece
       nos espaços. A sequência de --ld é idêntica à anterior. */
    return String(s??'').split('\n').map(line =>
      line.split(' ').map(word => !word ? '' :
        `<span class="lw">` + [...word].map(ch =>
          `<span class="ltr" style="display:inline-block;--ld:calc(var(--t0,0.25s) + ${(i++*0.028).toFixed(3)}s)">${F.esc(ch)}</span>`
        ).join('') + `</span>`
      ).join(' ')
    ).join('<br>');
  };
  F.icon = function(id, style=''){
    const ic = F.icons.get(id) || F.icons.get('spark');
    return `<svg class="ic" viewBox="0 0 24 24" style="${style}">${ic.svg}</svg>`;
  };
  F.logoHTML = function(anim='fade-up', d='.05s'){
    const b = F.state.brand;
    return b.logo
      ? `<img class="logo" data-anim="${anim}" style="--d:${d}" src="${b.logo}" alt="">`
      : `<div class="logotype" data-anim="${anim}" style="--d:${d}">${F.esc(b.name)}</div>`;
  };
  F.imgHTML = function(src, cls='', extra=''){
    return src
      ? `<div class="imgw ${cls}" ${extra}><img src="${src}" alt=""></div>`
      : `<div class="imgw ${cls}" ${extra}><div class="ph">SUA IMAGEM</div></div>`;
  };
  /* imagem full-bleed com véu de legibilidade — usada por TODOS os templates no modo cover */
  F.bgImage = function(src, veil){
    if(!src) return '';
    return `<div class="bgimg" data-anim="fade" style="--dur:1.2s"><img src="${src}" alt="">
      <div class="veil" style="background:${veil}"></div></div>`;
  };
  /* imagem mascarada flutuante — modo circle/blob/arch/window */
  F.floatImage = function(src, mask, pos, anim='scale'){
    const cls = {circle:'mask-circle', blob:'mask-blob', arch:'mask-arch', window:'mask-window'}[mask] || 'mask-window';
    return `<div class="abs" data-anim="${anim}" style="--dur:1.1s;${pos}">
      <div class="abs" data-anim="float" style="inset:0">${F.imgHTML(src, cls, 'style="position:absolute;inset:0"')}</div>
      <div class="abs ${cls}" style="inset:-4%;border:calc(var(--u)*0.4px) solid var(--b-ac);opacity:.7"></div></div>`;
  };
  F.fxHTML = function(){
    return F.state.fx.map(id => { const fx = F.fx.get(id);
      return fx ? `<div class="${fx.cls}"></div>` : ''; }).join('');
  };

  /* mistura de estilos por LINHA do título (vazado / marcado / normal) */
  F.mixTitle = function(title, r, force){
    const styles = force || ['','tHollow','','hl'];
    return String(title??'').split('\n').map((ln,i)=>{
      const s = F.pick(r, styles);
      return `<span${s?` class="${s}"`:''} style="display:inline-block">${F.esc(ln)}</span>`;
    }).join('<br>');
  };
  /* destaca UMA palavra do título (marca-texto ou sublinhado grosso).
     force ('hl'|'ub'), opcional: fixa a classe e garante o destaque —
     usado pela assinatura dos eixos internos (fase 1.2); sem force, o
     comportamento e o consumo de rng são os originais (P1). */
  F.fancyTitle = function(title, r, force){
    /* fase 2.2 (Eixo 2): quando o slide traz DESTAQUES do parser
       (**palavra** → slide.hl), a palavra marcada vence o sorteio e o
       destaque é garantido. Slides sem hl seguem o caminho original —
       consumo de rng idêntico, projetos existentes não mudam (P1). */
    const prefer = (F.state && F.state.mode==='design' &&
      ((F.state.slides||[])[F.state.cur]||{}).hl) || null;
    const norm = w => String(w).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
    const pset = prefer && prefer.length ? prefer.map(norm) : null;
    return String(title??'').split('\n').map(line=>{
      const w = line.split(' ');
      if(pset){
        const hi = w.findIndex(x=>pset.indexOf(norm(x))>=0);
        if(hi>=0){
          const cls = force || 'hl';
          w[hi] = `<span class="${cls}">${F.esc(w[hi])}</span>`;
          return w.map((x,j)=>j===hi?x:F.esc(x)).join(' ');
        }
      }
      const cands = w.map((x,i)=>x.length>3?i:-1).filter(i=>i>=0);
      if(cands.length && (force || r()<.75)){
        const i = F.pick(r,cands), cls = force || F.pick(r,['hl','ub','ub']);
        w[i] = `<span class="${cls}">${F.esc(w[i])}</span>`;
        return w.map((x,j)=>j===i?x:F.esc(x)).join(' ');
      }
      return F.esc(line);
    }).join('<br>');
  };

  /* imagem universal de cena: cover → fundo com véu; máscara → flutuante.
     Toda cena deve usar sceneBG(s, fallback) no lugar do fundo fixo e
     concatenar sceneFloat(s) antes do fxHTML. */
  F.sceneBG = function(s, fallback){
    if(s.img && (s.mask||'cover')==='cover')
      return F.bgImage(s.img, 'linear-gradient(180deg,color-mix(in srgb,var(--b-bg) 58%,transparent),color-mix(in srgb,var(--b-bg) 88%,transparent))');
    return `<div class="abs" style="inset:0;background:${fallback}"></div>`;
  };
  F.sceneFloat = function(s, pos){
    if(s.img && (s.mask||'cover')!=='cover')
      return F.floatImage(s.img, s.mask, pos || 'right:7%;top:9%;width:22%;aspect-ratio:1');
    return '';
  };
  /* marcador de páginas do carrossel — estilo escolhido em F.state.pager */
  F.PAGERS = [['counter','1 / N'],['dots','Pontos'],['dashes','Traços'],['line','Linha'],
              ['numbers','Números'],['fraction','Fração'],['arrow','Seta'],['none','—']];
  F.slideBadge = function(){
    const s = F.state, n = s.slides.length;
    if(s.mode!=='design' || n<2) return '';
    const p = s.pager || 'counter', cur = s.cur;
    const pos = 'right:calc(var(--u)*6px);bottom:calc(var(--u)*6px);';
    const dim = 'color-mix(in srgb,var(--b-fg) 38%,transparent)';
    if(p==='none') return '';
    if(p==='dots' || p==='dashes'){
      const items = Array.from({length:n},(_,i)=>{ const on = i===cur;
        return p==='dots'
          ? `<i style="width:calc(var(--u)*${on?1.7:1.1}px);aspect-ratio:1;border-radius:50%;background:${on?'var(--b-ac)':dim}"></i>`
          : `<i style="width:calc(var(--u)*${on?5:2.2}px);height:calc(var(--u)*0.9px);border-radius:99px;background:${on?'var(--b-ac)':dim}"></i>`;
      }).join('');
      return `<div class="abs" data-anim="fade-up" style="${pos}display:flex;gap:calc(var(--u)*1px);align-items:center">${items}</div>`;
    }
    if(p==='line')
      return `<div class="abs" data-anim="fade" style="left:calc(var(--u)*6px);right:calc(var(--u)*6px);bottom:calc(var(--u)*3.6px);height:calc(var(--u)*0.7px);background:color-mix(in srgb,var(--b-fg) 20%,transparent);border-radius:99px">
        <div data-anim="line" style="width:${((cur+1)/n*100).toFixed(1)}%;height:100%;background:var(--b-ac);border-radius:99px"></div></div>`;
    if(p==='numbers'){
      const items = Array.from({length:n},(_,i)=>
        `<i style="font-style:normal;width:calc(var(--u)*3.2px);aspect-ratio:1;display:grid;place-items:center;border-radius:50%;font-size:calc(var(--u)*1.7px);font-weight:700;${i===cur
          ?'background:var(--b-ac);color:var(--b-bg)'
          :`color:${dim};border:1px solid ${dim}`}">${i+1}</i>`).join('');
      return `<div class="abs fm" data-anim="fade-up" style="${pos}display:flex;gap:calc(var(--u)*0.8px)">${items}</div>`;
    }
    if(p==='fraction')
      return `<div class="abs fh" data-anim="fade-up" style="${pos}display:flex;align-items:baseline;gap:.18em">
        <b style="font-size:calc(var(--u)*5px);color:var(--b-ac);line-height:1">${String(cur+1).padStart(2,'0')}</b>
        <span class="fm" style="font-size:calc(var(--u)*2px);opacity:.6">/ ${String(n).padStart(2,'0')}</span></div>`;
    if(p==='arrow')
      return `<div class="abs" data-anim="pop" style="${pos}width:calc(var(--u)*5.4px);aspect-ratio:1;border-radius:50%;background:var(--b-ac);color:var(--b-bg);display:grid;place-items:center;font-size:calc(var(--u)*2.8px)">${cur+1<n ? F.icon('arrow-right') : F.icon('check')}</div>`;
    /* counter (padrão) */
    return `<div class="abs" style="${pos}display:flex;gap:.8em;align-items:center" data-anim="fade-up">
      <span class="counter">${cur+1} / ${n}</span>
      <span style="color:var(--b-ac);font-size:calc(var(--u)*3.4px);display:flex">${cur+1<n ? F.icon('arrow-right') : F.icon('check')}</span></div>`;
  };

  /* ---------- ícones da INTERFACE (traço vazado, linguagem da marca) ----------
     Separados dos F.icons (que pertencem às artes). Uso: F.uiIcon('play'). */
  F.UIIC = {
    replay:  '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5"/><path d="M3.5 3.5v5h5"/>',
    dice:    '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="9.2" cy="9.2" r="1.1"/><circle cx="14.8" cy="14.8" r="1.1"/><circle cx="14.8" cy="9.2" r="1.1"/><circle cx="9.2" cy="14.8" r="1.1"/>',
    film:    '<rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M7.5 5v14M16.5 5v14M3 10h4.5M3 14h4.5M16.5 10H21M16.5 14H21"/>',
    download:'<path d="M12 4v10.5"/><path d="M7.5 11l4.5 4.5L16.5 11"/><path d="M5 19.5h14"/>',
    upload:  '<path d="M12 15V4.5"/><path d="M7.5 8.5L12 4l4.5 4.5"/><path d="M5 19.5h14"/>',
    code:    '<path d="M9 7.5L4.5 12 9 16.5M15 7.5l4.5 4.5L15 16.5"/>',
    image:   '<rect x="3" y="5" width="18" height="14" rx="3.5"/><circle cx="9" cy="10" r="1.7"/><path d="M4.5 17l4.3-3.8 3.4 2.9 3-2.6 4.3 3.5"/>',
    play:    '<path d="M8.5 5.5v13l10.5-6.5z"/>',
    stop:    '<rect x="6.5" y="6.5" width="11" height="11" rx="3"/>',
    pen:     '<path d="M4.5 19.5l.9-3.8L16.6 4.5a2.1 2.1 0 0 1 3 3L8.3 18.6z"/><path d="M13.8 7.3l3 3"/>',
    lock:    '<rect x="5" y="11" width="14" height="9.5" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock:  '<rect x="5" y="11" width="14" height="9.5" rx="3"/><path d="M8 11V8a4 4 0 0 1 7.6-1.7"/>',
    trash:   '<path d="M4.5 7h15"/><path d="M9.5 7V5.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2V7"/><path d="M6.5 7l.9 12h9.2l.9-12"/><path d="M10.2 11v4.5M13.8 11v4.5"/>',
    undo:    '<path d="M4.5 10h10.5a4.5 4.5 0 0 1 0 9H11"/><path d="M8.5 6l-4 4 4 4"/>',
    save:    '<path d="M6 4h9.5L20 8.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M8 4v5h7.5"/><path d="M8 15.5h8"/>',
    scissors:'<circle cx="6.5" cy="6.5" r="2.3"/><circle cx="6.5" cy="17.5" r="2.3"/><path d="M8.5 8.2L19.5 19M19.5 5L8.5 15.8"/>',
    link:    '<path d="M10 14.5a4.5 4.5 0 0 1 0-6.4l2.1-2.1a4.5 4.5 0 0 1 6.4 6.4l-1.4 1.4"/><path d="M14 9.5a4.5 4.5 0 0 1 0 6.4l-2.1 2.1a4.5 4.5 0 0 1-6.4-6.4l1.4-1.4"/>',
    spark:   '<path d="M12 3.5l1.9 6.6 6.6 1.9-6.6 1.9L12 20.5l-1.9-6.6-6.6-1.9 6.6-1.9z"/>',
    chev:    '<path d="M6 9.5l6 6 6-6"/>',
  };
  F.tokenKey = () => F.state.mode==='design' ? 'd|'+F.state.cur : 'm|'+F.state.curScene;
  /* cor da PRANCHETA desta arte (substitui o fundo gerativo inteiro) */
  F.canvasColor = () => ((F.state.artTokens||{})[F.tokenKey()]||{}).canvas || null;

  F.uiIcon = id => `<svg class="uic" viewBox="0 0 24 24" aria-hidden="true">${F.UIIC[id]||''}</svg>`;

  return F;
})();
