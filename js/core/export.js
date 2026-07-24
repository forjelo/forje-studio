/* =====================================================
   FORJE·studio — core/export.js
   PNG/JPG (lote do carrossel), HTML standalone e VÍDEO.
   Vídeo: WebCodecs + mp4-muxer (vendor) → .mp4 real com
   timestamp exato por frame — a duração do arquivo é a da
   timeline, independente da velocidade de rasterização.
   Fallback: MediaRecorder → .webm (tempo de parede).
   ===================================================== */
(function(F){
  const $ = s=>document.querySelector(s);
  const art = () => $('#art');

  F.download = function(blob, name){
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.rel = 'noopener';
    document.body.appendChild(a);          // Firefox exige a âncora no DOM
    a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
  };
  F.toast = function(t){ const el = $('#toast'); el.textContent = t; el.classList.add('on');
    clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove('on'), 4200); };
  F.prog = function(on, title){ $('#prog').classList.toggle('on', on); if(title) $('#progTitle').textContent = title; };
  F.progSet = function(p, txt){ $('#progBar').style.width = (p*100).toFixed(0)+'%';
    $('#progTxt').textContent = txt || (p*100).toFixed(0)+'%'; };

  /* ---------- higiene de exportação ----------
     Nada da FERRAMENTA pode sair na arte: guias de snap (#guideDV/H),
     retângulo de seleção múltipla (#mqBox) e os contornos (outline) de
     seleção/trava do modo edição são removidos antes de rasterizar ou
     serializar. Os contornos são restaurados depois — a edição ao vivo
     do usuário não é perturbada por um export. */
  const GUIDE_SEL = '#guideDV,#guideDH,#guideV,#guideH,#mqBox';
  function clearGuides(){ art().querySelectorAll(GUIDE_SEL).forEach(g=>g.remove()); }
  function stashOutlines(){
    const stash = [];
    art().querySelectorAll('*').forEach(el=>{
      if(el.style && el.style.outline){
        stash.push([el, el.style.outline, el.style.outlineOffset]);
        el.style.outline = ''; el.style.outlineOffset = '';
      }
    });
    return ()=>stash.forEach(([el,o,off])=>{ if(el.isConnected){ el.style.outline=o; el.style.outlineOffset=off; } });
  }
  /* clone da arte 100% limpo para serialização (HTML standalone) */
  F.cleanArtHTML = function(){
    const clone = art().cloneNode(true);
    clone.querySelectorAll(GUIDE_SEL).forEach(g=>g.remove());
    clone.querySelectorAll('*').forEach(el=>{
      if(el.style && el.style.outline){ el.style.outline=''; el.style.outlineOffset=''; }
      if(el.dataset && el.dataset.locked) delete el.dataset.locked;
    });
    clone.className = 'art play';
    return clone.outerHTML;
  };

  /* ---------- rasterização ----------
     Primário: html-to-image (SVG foreignObject — o navegador desenha,
     fiel a color-mix/clip-path/texto vazado). Fallback: html2canvas.
     CSS de fontes embutido uma vez e reutilizado nos frames. */
  F._fontCSS = null;
  F.snapshot = async function(scale=1, bg=null){
    const el = art();
    clearGuides();
    const restore = stashOutlines();
    try{
      if(window.htmlToImage){
        try{
          if(F._fontCSS == null){
            try{ F._fontCSS = await htmlToImage.getFontEmbedCSS(el); }
            catch(e){ F._fontCSS = ''; }
          }
          const opts = {pixelRatio:scale, fontEmbedCSS:F._fontCSS, fontEmbedCss:F._fontCSS,
            cacheBust:false, ...(bg?{backgroundColor:bg}:{})};
          return await htmlToImage.toCanvas(el, opts);
        }catch(e){ console.warn('html-to-image falhou, tentando html2canvas:', e); }
      }
      if(window.html2canvas)
        return await html2canvas(el, {scale, backgroundColor:bg, logging:false, useCORS:true});
      throw new Error('nenhum motor de rasterização disponível (verifique a conexão)');
    } finally { restore(); }
  };
  F.settleStatic = async function(){
    clearGuides();
    /* determinístico: .settle força TODA animação (inclusive as infinitas —
       float/orbit/pulse/trace/marquee…) a concluir no estado final em 1ms.
       Sem isso, animações infinitas eram capturadas no meio do voo e cada
       export saía diferente, com elementos deslocados uns sobre os outros. */
    art().classList.add('settle');
    art().getAnimations({subtree:true}).forEach(a=>{ try{a.finish();}catch(e){} });
    const layer = art().querySelector('.scenelayer');
    if(layer) F.updateCounters(layer, 99999);
    await new Promise(r=>requestAnimationFrame(r));
    await new Promise(r=>setTimeout(r,60));
  };

  /* ---------- raster (PNG/JPG) ----------
     Nome do arquivo (Eixo 3): slide.name (campo mapeado no lote) tem
     precedência — `forje_{nome}_{WxH}.ext`; sem name, o esquema legado
     byte a byte. Colisões de nome ganham sufixo _sN. */
  F.exportName = function(i, fmtKey, type, many){
    const s = F.state, fmt = F.FORMATS[fmtKey||s.format];
    const ext = type==='jpeg' ? 'jpg' : type;
    const nm = s.mode==='design' && (s.slides[i]||{}).name;
    if(nm){
      const dup = s.slides.some((x,j)=>j!==i && x.name===nm);
      return `forje_${nm}_${fmt.w}x${fmt.h}${dup?'_s'+(i+1):''}.${ext}`;
    }
    return `forje_${s.mode==='design'?s.tpl:'cena'}_${fmt.w}x${fmt.h}${many?'_s'+(i+1):''}.${ext}`;
  };
  F.exportRaster = async function(type){
    const s = F.state, fmt = F.FORMATS[s.format];
    const many = s.mode==='design' && s.slides.length>1, keep = s.cur;
    F.prog(true, many ? 'Exportando carrossel…' : 'Exportando imagem…'); F.progSet(0);
    try{
      const n = many ? s.slides.length : 1;
      for(let i=0;i<n;i++){
        if(many){ s.cur = i; F.render(); }
        await F.settleStatic();
        const cv = await F.snapshot(1, type==='jpeg' ? s.brand.bg : null);
        const blob = await new Promise(r=>cv.toBlob(r, 'image/'+type, .94));
        F.download(blob, F.exportName(i, s.format, type, many));
        F.progSet((i+1)/n, `slide ${i+1}/${n}`);
        await new Promise(r=>setTimeout(r,300));
      }
      F.toast(many ? `${n} slides exportados em ${type.toUpperCase()}.` : `Exportado em ${type.toUpperCase()} (${fmt.w}×${fmt.h}).`);
    }catch(e){ console.error(e); F.toast('Falha na exportação: '+e.message); }
    finally{ if(many){ s.cur = keep; } F.render(); F.prog(false); }
  };

  /* ---------- Eixo 3 · fase 3.2 — um conteúdo, todas as mídias ----------
     Itera os formatos raster escolhidos: para cada um, muda s.format,
     re-renderiza (os templates escalam por --u) e exporta o carrossel
     inteiro. Restaura formato e slide no finally — o palco volta como
     estava mesmo se um formato falhar no meio. */
  F.exportFormats = async function(keys, type){
    type = type||'png';
    const s = F.state;
    const fmts = (keys && keys.length ? keys : Object.keys(F.FORMATS)).filter(k=>F.FORMATS[k] && !F.FORMATS[k].doc);
    if(!fmts.length){ F.toast('Escolha ao menos um formato.'); return; }
    const many = s.mode==='design' && s.slides.length>1;
    const n = many ? s.slides.length : 1, total = fmts.length*n;
    const keepF = s.format, keepC = s.cur;
    let done = 0;
    F.prog(true, 'Exportando todos os formatos…'); F.progSet(0);
    try{
      for(const fk of fmts){
        s.format = fk; 
        for(let i=0;i<n;i++){
          if(many) s.cur = i;
          F.render();
          await F.settleStatic();
          const cv = await F.snapshot(1, type==='jpeg' ? s.brand.bg : null);
          const blob = await new Promise(r=>cv.toBlob(r, 'image/'+type, .94));
          F.download(blob, F.exportName(i, fk, type, many));
          done++;
          F.progSet(done/total, `${F.FORMATS[fk].n} · ${done}/${total}`);
          await new Promise(r=>setTimeout(r,300));
        }
      }
      F.toast(`${total} imagens exportadas em ${fmts.length} formatos.`);
    }catch(e){ console.error(e); F.toast('Falha na exportação: '+e.message); }
    finally{ s.format = keepF; s.cur = keepC; F.render(); F.prog(false); }
  };

  /* ---------- HTML standalone ---------- */
  function fontsLinkHTML(){ const l = document.getElementById('gfonts'); return l ? l.outerHTML : ''; }
  function customFontsCSS(){
    return (F.state.brand.customFonts||[]).map(cf=>
      `@font-face{font-family:'${cf.name}';src:url(${cf.data})}`).join('\n');
  }
  F.exportHTML = function(){
    F.applyTokens();
    const s = F.state, artcss = document.getElementById('artcss').textContent;
    let bodyContent, script = '';
    if(s.mode==='design'){
      bodyContent = F.cleanArtHTML();
    } else {
      const scenes = s.timeline.map((sc,i)=>({
        html: F.mountScene(i).innerHTML, dur:+sc.dur||2000, exit:sc.exit||'fade'}));
      bodyContent = `<div class="art play" id="art" style="${art().getAttribute('style')}"></div>`;
      script = `<script>
const SC=${JSON.stringify(scenes)};const art=document.getElementById('art');const EXIT=450;
function counters(l,t){l.querySelectorAll('[data-count]').forEach(el=>{const to=+el.dataset.to||0,sf=el.dataset.suffix||'';
  const p=Math.min(1,Math.max(0,(t-200)/1400)),e=1-Math.pow(1-p,3);el.textContent=Math.round(to*e).toLocaleString('pt-BR')+sf;});}
(async function loop(){for(;;){art.innerHTML='';for(let i=0;i<SC.length;i++){const l=document.createElement('div');
  l.className='scenelayer';l.innerHTML=SC[i].html;art.appendChild(l);
  const p=l.previousElementSibling;if(p){p.classList.add('exit-'+SC[i-1].exit);setTimeout(()=>p.remove(),EXIT+60);}
  const t0=performance.now();await new Promise(res=>{(function st(){const t=performance.now()-t0;counters(l,t);
    if(t>=SC[i].dur)return res();requestAnimationFrame(st);})();});}
  await new Promise(r=>setTimeout(r,600));}})();
<\/script>`;
    }
    const doc = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${F.esc(s.brand.name)} — FORJE export</title>
${fontsLinkHTML()}<style>${customFontsCSS()}\n${artcss}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0e}</style></head>
<body>${bodyContent}${script}</body></html>`;
    F.download(new Blob([doc],{type:'text/html'}), `forje_${s.mode==='design'?s.tpl:'motion'}.html`);
    F.toast(s.mode==='design'
      ? 'HTML standalone exportado — abre em qualquer navegador com o motion embutido.'
      : 'Player HTML exportado — a timeline roda em loop em qualquer navegador.');
  };

  /* ---------- VÍDEO ---------- */
  const FPS = 15, STEP = 1000/FPS;

  async function pickAvcCodec(w, h){
    const cands = ['avc1.420033','avc1.420029','avc1.42001f','avc1.4d0029'];
    for(const codec of cands){
      try{
        const r = await VideoEncoder.isConfigSupported({codec, width:w, height:h,
          bitrate:6_000_000, framerate:FPS});
        if(r.supported) return codec;
      }catch(e){}
    }
    return null;
  }

  F.videoName = function(isMotion, opts){
    return (opts && opts.name) || `forje_${isMotion?'timeline':F.state.tpl}.mp4`;
  };
  /* opts (Eixo 3 · fase 3.3): { name    — nome do arquivo,
       quiet — não abre/fecha o painel de progresso nem dá toast (o lote gerencia),
       progBase, progSpan — mapeiam o progresso interno numa fatia do total }.
     Sem opts, comportamento idêntico ao anterior. */
  F.exportVideo = async function(opts){
    opts = opts||{};
    const P = (p,txt)=>F.progSet((opts.progBase||0)+p*(opts.progSpan??1), txt);
    const s = F.state;
    if(s.mode==='motion' && !s.timeline.length) return F.toast('Adicione cenas à timeline primeiro.');
    if(!('VideoEncoder' in window) || !('VideoFrame' in window) || !window.Mp4Muxer){
      F.toast('WebCodecs indisponível neste navegador — gerando WebM (tempo real).');
      return F.exportWebMLegacy();
    }
    const fmt = F.FORMATS[s.format];
    const vscale = Math.min(1, 720/Math.min(fmt.w,fmt.h));
    let W = Math.round(fmt.w*vscale), H = Math.round(fmt.h*vscale);
    W -= W%2; H -= H%2;                                  // h264 exige dimensões pares
    const codec = await pickAvcCodec(W,H);
    if(!codec){
      F.toast('H.264 indisponível — gerando WebM (tempo real).');
      return F.exportWebMLegacy();
    }
    const isMotion = s.mode==='motion';
    if(!opts.quiet){ F.prog(true, 'Renderizando MP4 frame a frame…'); F.progSet(0); }
    const cv = document.createElement('canvas'); cv.width=W; cv.height=H;
    const ctx = cv.getContext('2d');
    const {Muxer, ArrayBufferTarget} = Mp4Muxer;
    const muxer = new Muxer({target:new ArrayBufferTarget(),
      video:{codec:'avc', width:W, height:H}, fastStart:'in-memory'});
    let encErr = null;
    const enc = new VideoEncoder({
      output:(chunk,meta)=>muxer.addVideoChunk(chunk,meta),
      error:e=>{ encErr = e; }});
    enc.configure({codec, width:W, height:H, bitrate:6_000_000, framerate:FPS});
    let fno = 0;
    const pushFrame = async (tMs)=>{
      if(encErr) throw encErr;
      const snap = await F.snapshot(vscale, s.brand.bg);
      ctx.drawImage(snap, 0, 0, W, H);
      const vf = new VideoFrame(cv, {timestamp:Math.round(tMs*1000), duration:Math.round(STEP*1000)});
      enc.encode(vf, {keyFrame: fno % (FPS*2) === 0});    // keyframe a cada 2s
      vf.close(); fno++;
      if(enc.encodeQueueSize > 4) await new Promise(r=>setTimeout(r,30)); // não afogar o encoder
    };
    try{
      if(isMotion){
        const total = F.totalDuration(); let doneMs = 0;
        for(let i=0;i<s.timeline.length;i++){
          const seeker = await F.prepScene(i);
          for(let t=0; t<seeker.dur; t+=STEP){
            seeker.seek(t);
            await pushFrame(doneMs + t);
            P((doneMs+t)/total, `cena ${i+1}/${s.timeline.length} · ${((doneMs+t)/1000).toFixed(1)}s`);
          }
          doneMs += seeker.dur;
        }
      } else {
        F.render(); F.replayMotion();
        await new Promise(r=>requestAnimationFrame(r));
        const anims = art().getAnimations({subtree:true});
        anims.forEach(a=>{ try{a.pause();}catch(e){} });
        const dur = Math.round(4200/s.speed), frames = Math.ceil(dur/STEP);
        for(let f=0; f<=frames; f++){
          const t = f*STEP;
          anims.forEach(a=>{ try{a.currentTime=t;}catch(e){} });
          await pushFrame(t);
          P(f/frames, `frame ${f}/${frames}`);
        }
      }
      await enc.flush(); muxer.finalize();
      const buf = muxer.target.buffer;
      F.download(new Blob([buf],{type:'video/mp4'}), F.videoName(isMotion, opts));
      const secs = isMotion ? (F.totalDuration()/1000).toFixed(1) : (4.2/s.speed).toFixed(1);
      if(!opts.quiet) F.toast(`MP4 exportado — ${secs}s, ${FPS}fps, duração exata da timeline.`);
    }catch(e){ console.error(e); F.toast('Falha no vídeo: '+e.message); if(opts.quiet) throw e;
    }finally{ try{ enc.close(); }catch(e){} if(!opts.quiet){ F.prog(false); F.render(); } }
  };

  /* fallback: MediaRecorder (tempo de parede — pode sair mais lento
     se a máquina não rasterizar em tempo real) */
  F.exportWebMLegacy = async function(){
    const s = F.state, fmt = F.FORMATS[s.format];
    const isMotion = s.mode==='motion';
    const vscale = Math.min(1, 720/Math.min(fmt.w,fmt.h));
    const cv = document.createElement('canvas');
    cv.width = Math.round(fmt.w*vscale); cv.height = Math.round(fmt.h*vscale);
    const ctx = cv.getContext('2d');
    const stream = cv.captureStream(30);
    const mime = ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
    if(!mime) return F.toast('Este navegador não suporta gravação de vídeo.');
    const chunks = []; const rec = new MediaRecorder(stream, {mimeType:mime, videoBitsPerSecond:8_000_000});
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    const done = new Promise(r=>rec.onstop=r);
    F.prog(true, 'Renderizando WebM…'); F.progSet(0);
    try{
      rec.start();
      const drawFrame = async (t0)=>{
        const snap = await F.snapshot(vscale, s.brand.bg);
        ctx.drawImage(snap, 0, 0, cv.width, cv.height);
        const spent = performance.now()-t0;
        await new Promise(r=>setTimeout(r, Math.max(0, STEP-spent)));
      };
      if(isMotion){
        const total = F.totalDuration(); let doneMs = 0;
        for(let i=0;i<s.timeline.length;i++){
          const seeker = await F.prepScene(i);
          for(let t=0; t<seeker.dur; t+=STEP){
            const t0 = performance.now();
            seeker.seek(t);
            await drawFrame(t0);
            F.progSet((doneMs+t)/total, `cena ${i+1}/${s.timeline.length}`);
          }
          doneMs += seeker.dur;
        }
      } else {
        F.render(); F.replayMotion();
        await new Promise(r=>requestAnimationFrame(r));
        const anims = art().getAnimations({subtree:true});
        anims.forEach(a=>{ try{a.pause();}catch(e){} });
        const dur = Math.round(4200/s.speed), frames = Math.ceil(dur/STEP);
        for(let f=0; f<=frames; f++){
          const t0 = performance.now();
          anims.forEach(a=>{ try{a.currentTime=f*STEP;}catch(e){} });
          await drawFrame(t0);
          F.progSet(f/frames, `frame ${f}/${frames}`);
        }
      }
      rec.stop(); await done;
      F.download(new Blob(chunks,{type:'video/webm'}), `forje_${isMotion?'timeline':s.tpl}.webm`);
      F.toast('WebM exportado (modo compatibilidade — timing depende da máquina).');
    }catch(e){ console.error(e); try{rec.stop();}catch(_){} F.toast('Falha no vídeo: '+e.message); }
    finally{ F.prog(false); F.render(); }
  };
})(window.FORMA);
