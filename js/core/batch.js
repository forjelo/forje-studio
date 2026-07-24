/* =====================================================
   FORJE·studio — core/batch.js  (Eixo 3 · fase 3.1)
   DADOS → N ARTES. CSV/JSON local (parser próprio, sem
   dependência), mapeamento coluna → campo, seed POR LINHA
   (hash(linha) ⊕ eixo de layout → slide.sd) e export
   nomeado por campo. Determinístico: mesmos dados + mesmos
   seeds → mesmas artes (P3); travas de eixo respeitadas.
   Nada aqui roda em projetos antigos — sem sd, F.artOff
   devolve exatamente i*101 (P1).
   ===================================================== */
(function(F){

  /* ---------- hash determinístico (djb2 xor) ---------- */
  F.hashStr = function(str){
    let h = 5381;
    for(let i=0;i<str.length;i++) h = ((h*33) ^ str.charCodeAt(i)) >>> 0;
    return h >>> 0;
  };

  /* ---------- CSV: parser pequeno e correto ----------
     Aspas (RFC 4180): campo entre "…" preserva vírgulas,
     quebras de linha e "" (aspas escapadas). Delimitador
     detectado entre , ; e TAB pela 1ª linha fora de aspas.
     BOM e CRLF tolerados. */
  F.parseCSV = function(txt){
    txt = String(txt||'').replace(/^\uFEFF/,'');
    /* detecção do delimitador: conta candidatos fora de aspas na 1ª linha lógica */
    let inQ=false, counts={',':0,';':0,'\t':0}, i=0;
    for(; i<txt.length; i++){
      const c = txt[i];
      if(c==='"') inQ=!inQ;
      else if(!inQ && (c==='\n')) break;
      else if(!inQ && counts[c]!=null) counts[c]++;
    }
    const delim = counts[';']>counts[','] ? ';' : (counts['\t']>counts[','] ? '\t' : ',');

    const rows=[]; let row=[], cell='', q=false;
    for(i=0;i<txt.length;i++){
      const c = txt[i];
      if(q){
        if(c==='"'){ if(txt[i+1]==='"'){ cell+='"'; i++; } else q=false; }
        else cell+=c;
      } else {
        if(c==='"') q=true;
        else if(c===delim){ row.push(cell); cell=''; }
        else if(c==='\n'){ row.push(cell.replace(/\r$/,'')); rows.push(row); row=[]; cell=''; }
        else cell+=c;
      }
    }
    if(cell!=='' || row.length){ row.push(cell.replace(/\r$/,'')); rows.push(row); }
    while(rows.length && rows[rows.length-1].every(v=>v==='')) rows.pop();
    if(!rows.length) return {headers:[], rows:[]};
    const headers = rows[0].map(h=>String(h).trim());
    const out = rows.slice(1).map(r=>{
      const o={}; headers.forEach((h,k)=>{ o[h] = (r[k]??'').trim(); }); return o;
    });
    return {headers, rows:out};
  };

  /* ---------- tabela: JSON (array de objetos) ou CSV ---------- */
  F.parseTable = function(txt){
    const t = String(txt||'').trim();
    if(t[0]==='[' || t[0]==='{'){
      try{
        let j = JSON.parse(t);
        if(!Array.isArray(j)) j = j.rows||j.data||j.items||[j];
        j = j.filter(o=>o && typeof o==='object');
        const headers = []; j.forEach(o=>Object.keys(o).forEach(k=>{ if(headers.indexOf(k)<0) headers.push(k); }));
        return {headers, rows:j.map(o=>{ const r={}; headers.forEach(h=>r[h]=String(o[h]??'').trim()); return r; })};
      }catch(e){ /* cai para CSV */ }
    }
    return F.parseCSV(t);
  };

  /* ---------- mapeamento coluna → campo (palpite por nome) ---------- */
  const GUESS = {
    title : /^(t[ií]tulo|title|nome do post|headline|produto|product|nome|name|episo|assunto)/i,
    kicker: /^(kicker|chap[eé]u|categoria|category|tag|se[çc][ãa]o|section|tipo|label|r[óo]tulo)/i,
    sub   : /^(sub|descri|desc|texto|body|corpo|apoio|resumo|summary|detal|bio|fala|convidado|guest)/i,
    img   : /^(img|image|imagem|foto|photo|capa|thumb|url da imagem|picture)/i,
    name  : /^(arquivo|file|filename|slug|nome do arquivo|id|c[óo]digo|sku)$/i,
    value : /^(valor|value|n[úu]mero|number|qtd|quantidade|count|m[ée]trica|metric)/i,
    suffix: /^(sufixo|suffix|unidade|unit)$/i,
  };
  F.guessMap = function(headers){
    const map = {title:'', kicker:'', sub:'', img:'', name:'', value:'', suffix:''};
    for(const field of ['title','kicker','sub','img','name','value','suffix'])
      for(const h of headers)
        if(!map[field] && GUESS[field].test(h) &&
           Object.values(map).indexOf(h)<0){ map[field]=h; break; }
    if(!map.title && headers.length) map.title = headers.find(h=>Object.values(map).indexOf(h)<0) || headers[0];
    return map;
  };

  /* ---------- helpers de célula (mesma gramática do parser do Eixo 2) --- */
  const STAT = /^\s*(?:[+\-~≈]?\s*(?:R\$|US\$|\$|€|£)?\s*\d[\d.,]*\s*(?:%|x|X|mi|mil|bi|k|K|M|\+)?)\s*$/;
  const IMGU = /^(https?:\/\/\S+\.(?:png|jpe?g|webp|gif|avif|svg)(?:\?\S*)?|data:image\/[^;]+;base64,\S+)$/i;
  function pullMarks(txt){                       // **palavra** → destaque garantido
    const hl=[];
    const out = String(txt||'').replace(/\*\*([^*\n]{1,40})\*\*|__([^_\n]{1,40})__/g,
      (m,a,b)=>{ const w=(a||b).trim(); if(w && hl.length<3) hl.push(w); return a||b; });
    return {txt:out, hl};
  }
  F.slug = function(s){
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase().slice(0,48) || 'arte';
  };

  /* ---------- linhas → slides ----------
     mapping: {title, kicker, sub, img, name} (nomes de coluna; vazio = ignora)
     opts: { route:true       — img→split, número protagonista→poster
             perLine:true     — slide.sd = hash(linha) ⊕ seedOf('layout')
             max:60 }                                                     */
  F.batchSlides = function(rows, mapping, opts){
    opts = Object.assign({route:true, perLine:true, max:60}, opts||{});
    const warnings = [];
    if(rows.length > opts.max){ rows = rows.slice(0, opts.max); warnings.push('capped'); }
    const axis = F.seedOf ? (F.seedOf('layout')||0) : 0;
    const slides = rows.map((row,i)=>{
      const cell = k => mapping[k] ? String(row[mapping[k]]??'').trim() : '';
      const T = pullMarks(cell('title')), S = pullMarks(cell('sub'));
      const sl = {
        kicker: cell('kicker'),
        title : F.breakTitle ? F.breakTitle(T.txt) : T.txt,
        sub   : S.txt,
        img   : IMGU.test(cell('img')) ? cell('img') : null,
        mask  : 'cover',
      };
      const hl = T.hl.concat(S.hl).slice(0,3);
      if(hl.length) sl.hl = hl;
      const nm = cell('name') || cell('title');
      if(nm) sl.name = F.slug(nm);
      if(opts.route){
        if(sl.img) sl.tpl = 'split';
        else if(STAT.test(T.txt)) sl.tpl = 'poster';
      }
      if(opts.perLine){
        const rowStr = ['title','kicker','sub','img','name'].map(cell).join('\u001f');
        sl.sd = ((F.hashStr(rowStr) ^ axis) >>> 0) % 900000;    // hash(linha) ⊕ eixo
      }
      if(!sl.title && !sl.sub) warnings.push('empty:'+(i+1));
      return sl;
    }).filter(sl=>sl.title || sl.sub || sl.img);
    return {slides, warnings};
  };

  /* ---------- geração: dados → estado (espelho do generateFromContent) -- */
  F.generateFromData = function(rows, mapping, opts){
    opts = opts||{};
    const s = F.state;

    /* seeds de eixo primeiro (travas respeitadas) — o sd por linha
       é derivado do eixo de layout NOVO, ficando estável dentro da
       geração e re-derivável com o mesmo opts.seed (P3) */
    const L = s.seedLocks||{};
    const rr = opts.seed!=null ? F.rngOf(opts.seed) : Math.random;
    const rnd = ()=>1+Math.floor(rr()*99999);
    s.seeds = {
      layout : L.layout  ? F.seedOf('layout') : rnd(),
      palette: L.palette ? ((s.seeds||{}).palette ?? null) : rnd(),
      type   : L.type    ? F.seedOf('type')   : rnd(),
    };

    const B = F.batchSlides(rows, mapping, opts);
    if(!B.slides.length){ F.toast && F.toast('Nenhuma linha com conteúdo — confira o mapeamento.'); return B; }

    if(opts.mode==='append'){
      const base = s.slides.length;
      s.slides = s.slides.concat(B.slides.map(b=>Object.assign(F.defSlide(0), b)));
      s.cur = base;
    } else {
      F.remapArtKeys && F.remapArtKeys('design', ()=>-1);   // edições do carrossel antigo
      s.slides = B.slides.map(b=>Object.assign(F.defSlide(0), b));
      s.cur = 0;
    }

    if(F.render) F.render();
    F.autoSave && F.autoSave();
    if(F.toast) F.toast(B.slides.length+' artes geradas dos dados'+(B.warnings.indexOf('capped')>=0?' (limite de '+(opts.max||60)+' linhas)':'')+'.');
    if(opts.openSheet!==false && F.ui && F.ui.toggleVarSheet) F.ui.toggleVarSheet(true);
    return B;
  };

  /* =====================================================
     Fase 3.3 · DADOS → MOTION (um MP4 por linha)
     A timeline é o TEMPLATE. Mecanismo primário: mail-merge
     por placeholder {{coluna}} nos textos das cenas — preciso,
     preserva narrativas multi-cena (certificado: "Certificamos
     que {{nome}}…"). Fallback: sem nenhum placeholder na
     timeline, os campos MAPEADOS (kicker/título/sub/img/
     valor/sufixo) são aplicados a todas as cenas.
     ===================================================== */
  const PH = /\{\{\s*([^{}\n]+?)\s*\}\}/g;
  const SUBFIELDS = ['kicker','title','sub','items','suffix'];

  F.timelineHasPH = function(timeline){
    return (timeline||[]).some(sc=>SUBFIELDS.concat('img').some(f=>{
      PH.lastIndex = 0; return typeof sc[f]==='string' && PH.test(sc[f]); }));
  };

  /* substitui UMA linha na timeline → cópia profunda; nunca muta o template */
  F.subTimeline = function(timeline, row, mapping){
    const keys = Object.keys(row||{});
    const kmap = {}; keys.forEach(k=>kmap[k.trim().toLowerCase()]=k);
    const cellByPH = name => { const k = kmap[String(name).trim().toLowerCase()];
      return k!=null ? String(row[k]??'') : null; };
    const cell = f => mapping && mapping[f] ? String(row[mapping[f]]??'').trim() : '';
    const usePH = F.timelineHasPH(timeline);
    let hits = 0;
    const sub = s => String(s).replace(PH, (m,name)=>{
      const v = cellByPH(name); if(v==null) return m;      // coluna desconhecida fica visível
      hits++; return v; });
    const out = (timeline||[]).map(sc=>{
      const c = JSON.parse(JSON.stringify(sc));
      if(usePH){
        for(const f of SUBFIELDS) if(typeof c[f]==='string') c[f] = sub(c[f]);
        if(typeof c.img==='string' && PH.test((PH.lastIndex=0, c.img))){
          const v = sub(c.img); c.img = IMGU.test(v.trim()) ? v.trim() : null;
        }
        if(typeof c.value==='string'){ const v = parseFloat(sub(c.value).replace(',','.'));
          c.value = isFinite(v) ? v : 0; }
      } else {
        if(cell('kicker')) c.kicker = cell('kicker');
        if(cell('title'))  c.title  = cell('title');
        if(cell('sub'))    c.sub    = cell('sub');
        if(cell('img') && IMGU.test(cell('img'))) c.img = cell('img');
        if(mapping && mapping.value){ const v = parseFloat(cell('value').replace(',','.'));
          if(isFinite(v)) c.value = v; }
        if(cell('suffix')) c.suffix = cell('suffix');
      }
      return c;
    });
    return { timeline: out, hits, mode: usePH ? 'placeholder' : 'mapping' };
  };

  /* nomes por linha, com dedup por sufixo -rN */
  F.batchVideoNames = function(rows, mapping){
    const seen = {};
    return rows.map((row,i)=>{
      const cell = f => mapping && mapping[f] ? String(row[mapping[f]]??'').trim() : '';
      let base = F.slug(cell('name') || cell('title') || ('linha-'+(i+1)));
      if(seen[base]) base += '-r'+(i+1);
      seen[base] = 1;
      return 'forje_'+base+'.mp4';
    });
  };

  F.exportVideoBatch = async function(rows, mapping, opts){
    opts = opts||{};
    const s = F.state, max = opts.max||20;
    if(!s.timeline || !s.timeline.length) return F.toast('Monte a timeline (modo MOTION) primeiro — ela é o template do lote.');
    if(!('VideoEncoder' in window) || !('VideoFrame' in window) || !window.Mp4Muxer)
      return F.toast('Lote de vídeo requer WebCodecs (Chrome/Edge) — o fallback WebM em tempo real seria inviável para N vídeos.');
    let capped = false;
    if(rows.length > max){ rows = rows.slice(0,max); capped = true; }
    const names = F.batchVideoNames(rows, mapping);
    const keepTL = s.timeline, keepMode = s.mode, keepScene = s.curScene;
    const N = rows.length; let done = 0;
    F.prog(true, 'Lote de vídeo · timeline como template…'); F.progSet(0);
    try{
      s.mode = 'motion';
      for(let r=0; r<N; r++){
        const S = F.subTimeline(keepTL, rows[r], mapping);
        s.timeline = S.timeline;
        await F.exportVideo({ quiet:true, name:names[r],
          progBase: r/N, progSpan: 1/N });
        done++;
      }
      F.toast(done+' vídeos gerados da timeline'+(capped?' (limite de '+max+' linhas)':'')+'.');
    }catch(e){ console.error(e); F.toast('Lote interrompido no vídeo '+(done+1)+'/'+N+': '+e.message);
    }finally{
      s.timeline = keepTL; s.mode = keepMode; s.curScene = keepScene;
      F.prog(false); if(F.render) F.render();
    }
    return { done, names: names.slice(0,done) };
  };
})(window.FORMA);
