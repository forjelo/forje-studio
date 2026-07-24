/* =====================================================
   FORJE·studio — ui/editor.js
   Edição manual + camada de COMPOSIÇÃO.
   ✎ liga o modo: clique seleciona (clicar de novo no
   mesmo ponto CICLA para o elemento de baixo — nada fica
   inacessível), arrastar MOVE, A−/A+ escalam, 🗑 apaga,
   ↺ desfaz a arte atual. Ops: {eid, k, dx, dy, del}.
   SELEÇÃO MÚLTIPLA: arrastar no fundo da prancheta abre
   um retângulo (marquee) que seleciona vários; Shift+
   clique soma/remove; mover, escalar, travar, animar,
   colorir e apagar valem para o conjunto inteiro.
   Composição: itens (componentes/ícones/imagens) soltos
   sobre a arte, guardados em state.compose[chave] e
   presentes em preview, player e exports.
   ===================================================== */
(function(F){
  const $ = s=>document.querySelector(s);
  const art = () => document.getElementById('art');
  F.editor = { on:false, sel:null, sels:[], _pt:null, _cycle:0 };

  F.editKey = function(){
    const s = F.state;
    /* fase 2.2: chave usa o template EFETIVO (slide.tpl || s.tpl) —
       slides sem tpl próprio produzem exatamente a chave antiga (P1) */
    return s.mode==='design'
      ? `d|${(s.slides[s.cur]||{}).tpl || s.tpl}|${s.cur}|${s.seed}`
      : `m|${s.curScene}|${(s.timeline[s.curScene]||{}).type||''}`;
  };
  F.motionKey = idx => `m|${idx}|${(F.state.timeline[idx]||{}).type||''}`;

  /* ---------- composição ---------- */
  F.composeHTML = function(key){
    const items = (F.state.compose||{})[key] || [];
    const ctx = composeCtx();
    return items.map(it=>{
      let inner='';
      if(it.comp==='__logo'){
        const src = F.state.brand.logo;
        const lw = +it.size || 16;
        inner = src
          ? `<img src="${src}" style="width:calc(var(--u)*${lw}px);display:block">`
          : `<div class="imgw mask-window" style="width:calc(var(--u)*${lw}px);aspect-ratio:3/1"><div class="ph">SUA LOGO</div></div>`;
      }
      else if(it.comp==='__icon'){
        const col = (it.color||'ac')[0]==='#' ? it.color : `var(--b-${it.color||'ac'})`;
        const sz = +it.size || 6;
        if(it.shape==='chip')
          inner = `<span style="width:calc(var(--u)*${(sz*1.8).toFixed(1)}px);aspect-ratio:1;border-radius:50%;background:${col};color:var(--b-bg);display:grid;place-items:center;font-size:calc(var(--u)*${sz}px)">${F.icon(it.icon)}</span>`;
        else if(it.shape==='tile')
          inner = `<span style="width:calc(var(--u)*${(sz*1.8).toFixed(1)}px);aspect-ratio:1;border-radius:calc(var(--b-r)*0.6px);background:color-mix(in srgb,${col} 18%,transparent);border:1px solid color-mix(in srgb,${col} 55%,transparent);color:${col};display:grid;place-items:center;font-size:calc(var(--u)*${sz}px)">${F.icon(it.icon)}</span>`;
        else inner = `<span style="font-size:calc(var(--u)*${sz}px);color:${col};display:flex">${F.icon(it.icon)}</span>`;
      }
      else if(it.comp==='__img'){
        const src = it.src || ctx.img;                       // própria > do slide/cena
        const mk = {circle:'mask-circle', blob:'mask-blob', arch:'mask-arch', window:'mask-window'}[it.mask] || 'mask-window';
        const ar = (it.mask==='circle'||it.mask==='blob') ? '1' : '4/3';
        inner = src
          ? `<div class="imgw ${mk}" style="width:calc(var(--u)*26px);aspect-ratio:${ar}"><img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div>`
          : `<div class="imgw mask-window" style="width:calc(var(--u)*26px);aspect-ratio:4/3"><div class="ph">SUA IMAGEM</div></div>`;
      }
      else if(it.comp==='__text'){
        /* texto livre: fonte (marca/catálogo/custom), tamanho, peso, itálico,
           alinhamento, caixa alta, entrelinha e tracking; cor via it.c */
        const p = it.props||{};
        const fam = p.font==='__body' ? 'var(--fb)' : p.font==='__mono' ? 'var(--fm)'
                  : (p.font && p.font!=='__display') ? F.fontCSS(p.font) : 'var(--fh)';
        const sz = +p.size||6, wt = +p.weight||700, lh = +p.lh||1.15, ls = (p.ls!=null?+p.ls:0);
        inner = `<div style="font-family:${fam};font-size:calc(var(--u)*${sz}px);font-weight:${wt};line-height:${lh};letter-spacing:${ls}em;text-align:${p.align||'left'};${p.upper?'text-transform:uppercase;':''}${p.italic?'font-style:italic;':''}white-space:pre-wrap;overflow-wrap:break-word">${F.nl(p.text||'Seu texto')}</div>`;
      }
      else if(it.comp==='__shape'){
        /* forma geométrica: delega para a biblioteca F.shapes (lib/shapes.js),
           que cobre todas as formas novas e reproduz as legadas 1:1.
           O bloco abaixo permanece como fallback de segurança. */
        const p = it.props||{};
        const sdef = F.shapes && F.shapes.get(p.kind||'rect');
        if(sdef){ inner = sdef.html(p); }
        else{
        const sw = +p.sw||16, sh = +p.sh||16, kind = p.kind||'rect';
        const fill = p.nofill ? 'transparent' : (p.fill||'#F5620F');
        const op = (p.op!=null ? +p.op : 100)/100, rot = +p.rot||0;
        const rad = +p.rad||0, bw = +p.bw||0, bc = p.bc||p.fill||'#F5620F';
        const W = `width:calc(var(--u)*${sw}px);`, H = `height:calc(var(--u)*${sh}px);`;
        const base = `opacity:${op};rotate:${rot}deg;`;
        const bord = bw ? `border:calc(var(--u)*${bw}px) solid ${bc};` : '';
        const box = `box-sizing:border-box;`;
        if(kind==='circle')       inner = `<div style="${W}${H}${base}${bord}${box}border-radius:50%;background:${fill}"></div>`;
        else if(kind==='pill')    inner = `<div style="${W}${H}${base}${bord}${box}border-radius:999px;background:${fill}"></div>`;
        else if(kind==='ring')    inner = `<div style="${W}${H}${base}${box}border:calc(var(--u)*${bw||1.6}px) solid ${p.fill||'#F5620F'};border-radius:50%;background:transparent"></div>`;
        else if(kind==='line')    inner = `<div style="${W}height:calc(var(--u)*${Math.max(.2,bw||.7)}px);${base}border-radius:999px;background:${p.fill||'#F5620F'}"></div>`;
        else if(kind==='tri')     inner = `<div style="${W}${H}${base}clip-path:polygon(50% 0,100% 100%,0 100%);background:${fill}"></div>`;
        else if(kind==='star')    inner = `<div style="${W}${H}${base}clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);background:${fill}"></div>`;
        else /* rect */           inner = `<div style="${W}${H}${base}${bord}${box}border-radius:calc(var(--u)*${rad}px);background:${fill}"></div>`;
        }
      }
      else{ const def = F.components.get(it.comp); if(!def) return '';
        inner = def.html(F.rngOf(it.seed||1), {...ctx, ...(it.props||{})}); }
      const sized = it.w ? ' sized' : '';
      const wcss = it.w ? `width:${it.w}%;` : '';
      const zcss = (it.z!=null && it.z!=='') ? `z-index:${it.z};` : '';
      const xa = it.xanim ? ` data-xanim="${it.xanim}"` : '';
      const d = (it.d!=null && it.d!=='') ? (+it.d||0) : .2;
      const ccss = it.c ? `color:${it.c};--b-ac:${it.c};--b-p1:${it.c};--b-p2:${it.c};` : '';
      const kcss = (it.k && it.k!==1) ? `scale:${it.k};` : '';
      return `<div class="abs compitem${sized}" data-cid="${it.id}" data-anim="${it.anim||'pop'}"${xa} style="left:${it.x}%;top:${it.y}%;${wcss}${ccss}${kcss}${zcss}--d:${d}s">${inner}</div>`;
    }).join('');
  };
  function composeCtx(){
    const s = F.state;
    const src = s.mode==='design' ? s.slides[s.cur] : (s.timeline[s.curScene]||{});
    return {title:src.title||'', sub:src.sub||'', kicker:src.kicker||'',
      cta:s.cta, img:src.img||null, icon:src.icon||s.accentIcon};
  }
  F.addComposeItem = function(comp, x, y, extra={}){
    const s = F.state, key = F.editKey();
    s.compose = s.compose || {}; s.compose[key] = s.compose[key] || [];
    s.compose[key].push({id:'c'+Date.now()+Math.floor(Math.random()*999),
      comp, x:+x.toFixed(1), y:+y.toFixed(1), seed:Math.floor(Math.random()*9999), ...extra});
    F.autoSave(); F.render();
    if(F.ui && F.ui.refreshActive) F.ui.refreshActive();
    if(!F.editor.on) $('#btnEdit').click();
    F.toast('Componente adicionado — arraste para posicionar, A−/A+ para escalar.');
  };
  F.removeComposeItem = function(key, id){
    const list = (F.state.compose||{})[key]; if(!list) return;
    const i = list.findIndex(o=>o.id===id); if(i>=0) list.splice(i,1);
    F.autoSave(); F.render();
    if(F.ui && F.ui.refreshActive) F.ui.refreshActive();
  };

  /* ---------- edições (genérico por raiz+chave) ---------- */
  F.applyEditsIn = function(root, key){
    const els = [...root.querySelectorAll('[data-anim], .abs')];
    els.forEach((el,i)=>el.dataset.eid = i);
    const list = (F.state.edits||{})[key] || [];
    list.forEach(op=>{
      const el = els[op.eid]; if(!el) return;
      if(op.del){ el.style.display = 'none'; return; }
      if(op.k && op.k !== 1) el.style.scale = op.k;   // 'scale' não desloca offsets (zoom deslocava)
      if(op.w){                                          // largura de TEXTO (resize lateral):
        el.style.width = op.w + '%';                     // o conteúdo REFLUI para o novo box
        el.style.maxWidth = 'none';
        el.classList.add('tflex');                       // <br> fixos viram quebra flexível
      }
      if(op.dx || op.dy) el.style.translate = `${op.dx||0}px ${op.dy||0}px`;
      if(op.anim) el.dataset.anim = op.anim;            // troca/adiciona animação
      if(op.c) paintColor(el, op.c);                     // recolore texto/ícones/acentos
      if(op.z!=null){                                    // camada persistida (frente/trás)
        el.style.zIndex = op.z;
        if(!el.classList.contains('abs') && !el.classList.contains('compitem'))
          el.style.position = 'relative';               // z-index exige elemento posicionado
      }
      if(op.lock) el.dataset.locked = '1';
    });
    /* itens compostos travados */
    const comp = (F.state.compose||{})[key] || [];
    comp.filter(o=>o.lock).forEach(o=>{
      const el = root.querySelector(`[data-cid="${o.id}"]`); if(el) el.dataset.locked='1'; });
    if(F.editor && F.editor.on) F.paintLocks && F.paintLocks();
  };
  /* marcação visual dos travados enquanto o modo edição está ativo */
  F.paintLocks = function(){
    art().querySelectorAll('[data-locked]').forEach(el=>{
      if(!F.editor.sels.includes(el)){ el.style.outline = '2px dotted #9aa0ad'; el.style.outlineOffset = '2px'; }});
  };
  function isLocked(el){ return el && el.dataset.locked === '1'; }
  /* recolore o elemento: cor direta + tokens de acento (ícones e textos
     que usam var(--b-ac/p1/p2) seguem pela cascata) */
  function paintColor(el, c){
    el.style.color = c;
    ['--b-ac','--b-p1','--b-p2'].forEach(k=>el.style.setProperty(k, c));
  }
  function composeItemOf(el){
    if(!el || !el.dataset.cid) return null;
    return ((F.state.compose||{})[F.editKey()]||[]).find(o=>o.id===el.dataset.cid) || null;
  }

  /* ---------- SELEÇÃO (única e múltipla) ---------- */
  function syncSelCount(){
    const b = document.getElementById('edCount');
    if(!b) return;
    const n = F.editor.sels.length;
    b.style.display = n>1 ? '' : 'none';
    b.textContent = n>1 ? n+' sel.' : '';
  }
  function outlineOff(el){
    if(!el || !el.isConnected) return;
    if(isLocked(el)){ el.style.outline = '2px dotted #9aa0ad'; el.style.outlineOffset = '2px'; }
    else el.style.outline = '';
  }
  function setSel(list){
    F.editor.sels.forEach(outlineOff);
    F.editor.sels = (list||[]).filter((el,i,a)=>el && a.indexOf(el)===i);
    F.editor.sel = F.editor.sels[F.editor.sels.length-1] || null;
    F.editor.sels.forEach(el=>{ el.style.outline = '3px dashed #5ee6c7'; el.style.outlineOffset = '3px'; });
    syncSelCount();
    if(F.editor.syncHandles) F.editor.syncHandles();   // alças de redimensionamento (ui/resize.js)
  }
  function select(el){ setSel(el ? [el] : []); }
  function toggleSel(el){
    const s = [...F.editor.sels], i = s.indexOf(el);
    if(i>=0) s.splice(i,1); else s.push(el);
    setSel(s);
  }
  function selection(){ return F.editor.sels.length ? F.editor.sels : (F.editor.sel ? [F.editor.sel] : []); }
  /* re-seleciona após um re-render (os nós são recriados) */
  function selSnapshot(){
    return F.editor.sels.map(el=>el.dataset.cid ? {cid:el.dataset.cid} : {eid:el.dataset.eid});
  }
  function selRestore(list){
    const a = art();
    setSel((list||[]).map(d=>d.cid
      ? a.querySelector(`[data-cid="${d.cid}"]`)
      : a.querySelector(`[data-eid="${d.eid}"]`)).filter(Boolean));
  }

  /* aplicar ANIMAÇÃO ao(s) elemento(s) selecionado(s) (barra do palco) */
  F.editor.setAnim = function(v){
    const els = selection();
    if(!els.length){ F.toast('Clique num elemento da arte primeiro.'); return false; }
    const free = els.filter(el=>!isLocked(el));
    if(!free.length){ F.toast('Elemento(s) travado(s) — destrave para animar.'); return false; }
    free.forEach(el=>{
      const it = composeItemOf(el);
      if(it){ if(v==='') delete it.anim; else it.anim = v; }
      else{ const op = opFor(+el.dataset.eid); if(v==='') delete op.anim; else op.anim = v; }
    });
    const snap = selSnapshot();
    F.autoSave(); F.render();
    selRestore(snap);
    const def = F.anims.get(v);
    F.toast(v==='none' ? (free.length>1 ? 'Animação removida de '+free.length+' elementos.' : 'Animação removida do elemento.')
          : 'Animação "'+((def&&def.n)||v)+'" aplicada'+(free.length>1?' a '+free.length+' elementos':'')+' — dê Replay para rever.');
    return true;
  };
  /* aplicar COR ao(s) elemento(s) selecionado(s) (ao vivo, sem re-render) */
  F.editor.setColor = function(c){
    const els = selection();
    if(!els.length){ F.toast('Clique num elemento da arte primeiro.'); return false; }
    const free = els.filter(el=>!isLocked(el));
    if(!free.length){ F.toast('Elemento(s) travado(s) — destrave para colorir.'); return false; }
    free.forEach(el=>{
      const it = composeItemOf(el);
      if(it){ if(it.comp==='__icon') it.color = c; else it.c = c; }
      else{ opFor(+el.dataset.eid).c = c; }
      paintColor(el, c);            // feedback imediato; persiste no próximo render
    });
    F.autoSave();
    return true;
  };
  F.applyEdits = function(){
    F.editor.sel = null; F.editor.sels = []; syncSelCount();
    F.applyEditsIn(art(), F.editKey());
  };

  function opFor(eid){
    const s = F.state, key = F.editKey();
    s.edits = s.edits || {}; s.edits[key] = s.edits[key] || [];
    let op = s.edits[key].find(o=>o.eid===eid);
    if(!op){ op = {eid, k:1, dx:0, dy:0}; s.edits[key].push(op); }
    return op;
  }
  /* helpers expostos para módulos adicionais (ui/resize.js): persistir
     escala/largura de um elemento sem duplicar a lógica de edits/compose */
  F.editor._opFor = opFor;
  F.editor._itemOf = el => composeItemOf(el);
  F.editor._isLocked = el => isLocked(el);
  function isFullbleed(el){
    const a = art().getBoundingClientRect(), r = el.getBoundingClientRect();
    return r.width >= a.width*.92 && r.height >= a.height*.92;
  }
  function editablesAt(x, y){
    const all = document.elementsFromPoint(x, y)
      .filter(el => art().contains(el) && el !== art())
      .map(el => el.closest('[data-anim], .abs'))
      .filter(el => el && el !== art() && !el.classList.contains('scenelayer'))
      .filter((el,i,a) => a.indexOf(el) === i);
    /* seleção certeira: entre os elementos sob o cursor, o MENOR (mais
       específico) vem primeiro — 1 clique pega o que se vê; cliques
       repetidos continuam ciclando para os maiores/abaixo. Fundos e
       contêineres full-bleed vão para o fim: o topo da fila é o que se vê */
    const vis = all.filter(el=>!isFullbleed(el))
      .map(el=>{ const b2 = el.getBoundingClientRect(); return [el, b2.width*b2.height]; })
      .sort((a2,b3)=>a2[1]-b3[1]).map(p2=>p2[0]);
    return [...vis, ...all.filter(isFullbleed)];
  }
  function lockSel(){
    const els = selection();
    if(!els.length) return F.toast('Selecione um elemento primeiro.');
    const key = F.editKey();
    /* comportamento de grupo: se houver algum destravado, TRAVA todos;
       se todos já estão travados, DESTRAVA todos */
    const locking = els.some(el=>!isLocked(el));
    els.forEach(el=>{
      if(locking && isLocked(el)) return;    // já travado, mantém
      if(el.dataset.cid){
        const it = ((F.state.compose||{})[key]||[]).find(o=>o.id===el.dataset.cid);
        if(it){ if(locking) it.lock = 1; else delete it.lock; }
      } else { const op = opFor(+el.dataset.eid); if(locking) op.lock = 1; else delete op.lock; }
      if(locking){ el.dataset.locked = '1'; el.style.outline='2px dotted #9aa0ad'; el.style.outlineOffset='2px'; }
      else{ delete el.dataset.locked; el.style.outline=''; }
    });
    F.autoSave();
    if(locking){
      setSel([]);
      F.toast(els.length>1
        ? els.length+' elementos travados — ficam pontilhados e não movem/escalam/apagam. Selecione (marquee) e use Travar de novo para destravar.'
        : 'Travado — fica marcado (pontilhado) e não move/escala/apaga. Selecione e use Travar de novo para destravar.');
    } else {
      setSel(els);                            // devolve o contorno de seleção
      F.toast(els.length>1 ? els.length+' elementos destravados.' : 'Destravado.');
    }
  }
  function unlockAll(){
    const key = F.editKey();
    (((F.state.edits||{})[key])||[]).forEach(o=>{ delete o.lock; });
    (((F.state.compose||{})[key])||[]).forEach(o=>{ delete o.lock; });
    art().querySelectorAll('[data-locked]').forEach(el=>{ delete el.dataset.locked; el.style.outline=''; });
    F.editor.sels.forEach(el=>{ if(el.isConnected){ el.style.outline='3px dashed #5ee6c7'; el.style.outlineOffset='3px'; } });
    F.autoSave(); F.toast('Todas as travas desta arte removidas.');
  }
  function scaleSel(mult){
    const els = selection();
    if(!els.length) return F.toast('Clique num elemento da arte primeiro.');
    const free = els.filter(el=>!isLocked(el));
    if(!free.length) return F.toast('Elemento(s) travado(s) — use o botão de trava para destravar.');
    const clamp = k => Math.min(4, Math.max(.2, Math.round(k*mult*100)/100));
    free.forEach(el=>{
      const it = composeItemOf(el);
      if(it){ it.k = clamp(it.k||1); el.style.scale = it.k; }        // item composto: persiste em it.k
      else{ const op = opFor(+el.dataset.eid); op.k = clamp(op.k||1); el.style.scale = op.k; }
    });
    F.autoSave();
    if(F.editor.syncHandles) F.editor.syncHandles();
  }
  function delSel(){
    const els = selection();
    if(!els.length) return F.toast('Clique num elemento da arte primeiro.');
    const free = els.filter(el=>!isLocked(el));
    if(!free.length) return F.toast('Elemento(s) travado(s) — use o botão de trava para destravar.');
    const key = F.editKey();
    let removedComp = false;
    free.forEach(el=>{
      if(el.dataset.cid){
        const list = (F.state.compose||{})[key];
        if(list){ const i = list.findIndex(o=>o.id===el.dataset.cid);
          if(i>=0){ list.splice(i,1); removedComp = true; } }
        el.style.display = 'none';
      } else {
        opFor(+el.dataset.eid).del = 1;
        el.style.display = 'none';
      }
    });
    select(null);
    F.autoSave();
    if(removedComp){ F.render(); if(F.ui && F.ui.refreshActive) F.ui.refreshActive(); }
    F.toast(free.length>1
      ? free.length+' elementos removidos desta arte — Desfazer reverte.'
      : 'Elemento removido desta arte — Desfazer reverte.');
  }
  function resetEdits(){
    delete (F.state.edits||{})[F.editKey()];
    delete (F.state.compose||{})[F.editKey()];
    F.autoSave(); F.render();
    F.toast('Edições e composições desta arte desfeitas.');
  }

  /* ---------- CAMADAS: frente/trás com z-index persistente ----------
     modelo unificado: z efetivo = inline > (compitem: 60 | template: 0).
     'front'/'back' vão aos extremos do que existe na arte; 'fwd'/'bwd'
     dão um passo. Vale para a seleção múltipla inteira, ao vivo. */
  function effZ(el){
    const v = el.style.zIndex;
    if(v!=='' && v!=null && !isNaN(+v)) return +v;
    return el.classList.contains('compitem') ? 60 : 0;
  }
  function layerSel(dir){
    const els = selection();
    if(!els.length) return F.toast('Clique num elemento da arte primeiro.');
    const free = els.filter(el=>!isLocked(el));
    if(!free.length) return F.toast('Elemento(s) travado(s) — destrave para mudar a camada.');
    const all = [...art().querySelectorAll('[data-eid]')]
      .filter(el=>el.style.display!=='none' && !isFullbleed(el));
    const maxZ = Math.max(0, ...all.map(effZ)), minZ = Math.min(0, ...all.map(effZ));
    free.forEach(el=>{
      const cur = effZ(el);
      const nz = dir==='front' ? maxZ+1 : dir==='back' ? minZ-1 : dir==='fwd' ? cur+1 : cur-1;
      const it = composeItemOf(el);
      if(it) it.z = nz; else opFor(+el.dataset.eid).z = nz;
      el.style.zIndex = nz;
      if(!el.classList.contains('abs') && !el.classList.contains('compitem'))
        el.style.position = 'relative';
    });
    F.autoSave();
    const msg = {front:'trazido(s) para a frente', fwd:'avançou(aram) uma camada',
                 bwd:'recuou(aram) uma camada', back:'enviado(s) para trás'}[dir];
    F.toast((free.length>1 ? free.length+' elementos ' : 'Elemento ') + msg + '.');
  }

  /* guias de alinhamento com snap: centro da arte (verde), bordas e
     margens (cinza) e arestas/centros dos DEMAIS elementos (rosa) */
  const GUIDE_COLORS = {center:'#5ee6c7', edge:'#9aa0ad', el:'#ff5ea0'};
  function guide(axis){ // linha dinâmica posicionada em px do espaço da arte
    let g = art().querySelector('#guideD'+axis);
    if(!g){ g = document.createElement('div'); g.id = 'guideD'+axis;
      g.style.cssText = 'position:absolute;pointer-events:none;z-index:999;opacity:.95;display:none;'
        + (axis==='V' ? 'top:0;bottom:0;width:1.5px' : 'left:0;right:0;height:1.5px');
      art().appendChild(g); }
    return g;
  }
  function hideGuides(){ ['V','H'].forEach(a=>{ const g=art().querySelector('#guideD'+a); if(g) g.style.display='none'; }); }
  /* coleta alvos de snap no espaço da arte (px não escalados);
     `exclude`: elementos que se movem junto (grupo) não são alvo */
  function collectSnapTargets(dragEl, exclude){
    const a = art().getBoundingClientRect(), k = a.width/art().offsetWidth;
    const W = art().offsetWidth, H = art().offsetHeight;
    const M = Math.min(W,H)/100*7;                     // margem padrão dos templates (7u)
    const xs = [{v:0,c:'edge'},{v:M,c:'edge'},{v:W/2,c:'center'},{v:W-M,c:'edge'},{v:W,c:'edge'}];
    const ys = [{v:0,c:'edge'},{v:M,c:'edge'},{v:H/2,c:'center'},{v:H-M,c:'edge'},{v:H,c:'edge'}];
    [...art().querySelectorAll('.compitem, [data-anim]')]
      .filter(el=>el!==dragEl && !(exclude&&exclude.includes(el)) && !dragEl.contains(el) && !el.contains(dragEl) && el.style.display!=='none')
      .forEach(el=>{
        const r = el.getBoundingClientRect();
        if(r.width<4 || r.height<4) return;
        if(r.width>=a.width*.92 && r.height>=a.height*.92) return;    // ignora full-bleed
        const l=(r.left-a.left)/k, rr=(r.right-a.left)/k, t=(r.top-a.top)/k, b=(r.bottom-a.top)/k;
        xs.push({v:l,c:'el'},{v:(l+rr)/2,c:'el'},{v:rr,c:'el'});
        ys.push({v:t,c:'el'},{v:(t+b)/2,c:'el'},{v:b,c:'el'});
      });
    return {xs, ys};
  }
  /* melhor snap de um conjunto de arestas contra os alvos */
  function bestSnap(edges, targets, thr){
    let best = null;
    for(const t of targets) for(const e of edges){
      const d = t.v - e;
      if(Math.abs(d) < thr && (!best || Math.abs(d) < Math.abs(best.d))) best = {d, t};
    }
    return best;
  }

  /* ---------- marquee (retângulo de seleção múltipla) ---------- */
  let mqBox = null;
  function mqRect(mq, e){
    return {left:Math.min(mq.x0,e.clientX), top:Math.min(mq.y0,e.clientY),
      right:Math.max(mq.x0,e.clientX), bottom:Math.max(mq.y0,e.clientY)};
  }
  function drawMq(r){
    const a = art().getBoundingClientRect(), k = a.width/art().offsetWidth;
    if(!mqBox){
      mqBox = document.createElement('div');
      mqBox.id = 'mqBox';
      mqBox.style.cssText = 'position:absolute;z-index:1000;pointer-events:none;'
        + 'border:1.5px dashed #FB923C;background:rgba(245,98,15,.08);border-radius:4px';
      art().appendChild(mqBox);
    }
    mqBox.style.left = ((r.left-a.left)/k)+'px';
    mqBox.style.top = ((r.top-a.top)/k)+'px';
    mqBox.style.width = ((r.right-r.left)/k)+'px';
    mqBox.style.height = ((r.bottom-r.top)/k)+'px';
  }
  function clearMq(){ if(mqBox){ mqBox.remove(); mqBox = null; } }
  function marqueeHits(r){
    const a = art();
    const els = [...a.querySelectorAll('[data-anim], .abs')]
      .filter(el=>el!==a && !el.classList.contains('scenelayer')
        && el.style.display!=='none' && !(el.id||'').startsWith('guideD') && el.id!=='mqBox')
      .filter(el=>!isFullbleed(el))
      .filter(el=>{ const b = el.getBoundingClientRect();
        return b.width>2 && b.height>2 && b.right>r.left && b.left<r.right && b.bottom>r.top && b.top<r.bottom; });
    /* mantém só os mais externos: mover pai e filho juntos duplicaria o deslocamento */
    return els.filter(el=>!els.some(o=>o!==el && o.contains(el)));
  }

  F.editorInit = function(){
    const btn = $('#btnEdit'), tools = $('#editTools');
    btn.onclick = ()=>{
      F.editor.on = !F.editor.on;
      btn.classList.toggle('editing', F.editor.on);
      tools.hidden = !F.editor.on;           // dropdown flutuante — a barra não estica
      art().style.cursor = F.editor.on ? 'crosshair' : '';
      /* touch: sem isso o navegador rola a página em vez de arrastar o elemento */
      art().style.touchAction = F.editor.on ? 'none' : '';
      art().style.userSelect = F.editor.on ? 'none' : '';
      art().style.webkitUserSelect = F.editor.on ? 'none' : '';
      if(!F.editor.on){ select(null); clearMq(); }
      else F.toast('Modo edição: clique seleciona (repita para pegar o de baixo); arraste no fundo para selecionar VÁRIOS; Shift+clique soma; arrastar move; use as alças do box para dimensionar.');
      if(F.ui && F.ui.onEditToggle) F.ui.onEditToggle(F.editor.on);   // sidebar abre a aba EDITAR
      if(F.editor.syncHandles) F.editor.syncHandles();
    };
    $('#edMinus').onclick = ()=>scaleSel(1/1.12);
    $('#edPlus').onclick  = ()=>scaleSel(1.12);
    $('#edDel').onclick   = delSel;
    $('#edReset').onclick = resetEdits;
    $('#edLock').onclick  = lockSel;
    $('#edUnlock').onclick = unlockAll;
    $('#edFront').onclick = ()=>layerSel('front');
    $('#edFwd').onclick   = ()=>layerSel('fwd');
    $('#edBwd').onclick   = ()=>layerSel('bwd');
    $('#edBack').onclick  = ()=>layerSel('back');
    /* animação do(s) elemento(s) selecionado(s) */
    const selAnim = $('#edAnim');
    if(selAnim){
      selAnim.innerHTML = '<option value="">Animar…</option><option value="none">— sem animação —</option>';
      F.anims.entries().forEach(([id,a])=>{
        if(id==='letters') return;                 // exige marcação .ltr; draw vale para ícones/SVGs
        const o = document.createElement('option');
        o.value = id; o.textContent = a.n + (a.kind==='loop'?' ∞':'');
        selAnim.appendChild(o);
      });
      selAnim.onchange = ()=>{ const v = selAnim.value; selAnim.value = '';
        if(v!=='') F.editor.setAnim(v); };
    }
    /* cor do(s) elemento(s) selecionado(s) */
    const inColor = $('#edColor');
    if(inColor) inColor.oninput = ()=>F.editor.setColor(inColor.value);

    /* atalhos: Esc limpa a seleção; Delete/Backspace apaga os selecionados */
    document.addEventListener('keydown', e=>{
      if(!F.editor.on) return;
      const t = e.target;
      if(t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      if(e.key==='Escape'){ select(null); }
      else if((e.key==='Delete' || e.key==='Backspace') && F.editor.sels.length){
        e.preventDefault(); delSel();
      }
    });

    /* modelo de interação: tocar SELECIONA; tocar de novo no mesmo lugar CICLA
       para o de baixo; arrastar MOVE o(s) selecionado(s). Full-bleed (fundos e
       contêineres do tamanho da arte) só movem se já estavam selecionados.
       Arrastar a partir do FUNDO (full-bleed não selecionado / vazio) abre o
       retângulo de seleção múltipla; Shift+clique soma/remove da seleção. */
    let drag = null, mq = null;
    art().addEventListener('pointerdown', e=>{
      if(!F.editor.on) return;
      if(e.target && e.target.closest && e.target.closest('#rzBox')) return;   // alças (ui/resize.js) cuidam do próprio gesto
      e.preventDefault(); e.stopPropagation();
      const cands = editablesAt(e.clientX, e.clientY);
      /* Shift: alterna o elemento sob o cursor na seleção múltipla */
      if(e.shiftKey){
        if(cands.length) toggleSel(cands[0]);
        return;
      }
      /* fundo da prancheta (full-bleed não selecionado) ou área vazia:
         vira marquee se arrastar; clique simples mantém o comportamento antigo */
      if(!cands.length || (isFullbleed(cands[0]) && !F.editor.sels.includes(cands[0]))){
        mq = {x0:e.clientX, y0:e.clientY, cands, moved:false};
        art().setPointerCapture && art().setPointerCapture(e.pointerId);
        return;
      }
      const wasSel = F.editor.sel;
      let el;
      if(F.editor.sels.length>1 && cands.some(c=>F.editor.sels.includes(c)))
        el = cands.find(c=>F.editor.sels.includes(c));      // pegar o grupo por qualquer membro
      else if(wasSel && cands.includes(wasSel)) el = wasSel; // já selecionado sob o dedo
      else { el = cands[0]; select(el); }                    // topo visível da pilha
      const groupEls = (F.editor.sels.length>1 && F.editor.sels.includes(el))
        ? F.editor.sels.filter(x=>x!==el && !isLocked(x) && !isFullbleed(x)) : null;
      const canDrag = !isLocked(el) && (!isFullbleed(el) || el === wasSel);  // travado não move; prancheta exige seleção prévia
      const scale = art().getBoundingClientRect().width / art().offsetWidth;
      const key = F.editKey();
      /* fresh: a seleção nasceu NESTE toque — o pointerup não deve ciclar
         (antes, o 1º clique selecionava no down e o up já pulava para o de
         baixo, exigindo 2+ cliques para pegar o elemento visado) */
      drag = {el, cands, fresh: el !== wasSel, x0:e.clientX, y0:e.clientY, scale, moved:false, canDrag,
        cid:el.dataset.cid||null, eid:+el.dataset.eid,
        snap: canDrag ? collectSnapTargets(el, groupEls) : null,
        base: el.dataset.cid ? null : {...opFor(+el.dataset.eid)},
        group: (canDrag && groupEls && groupEls.length) ? groupEls.map(x=>{
          const cid = x.dataset.cid||null;
          if(cid){ const it = ((F.state.compose||{})[key]||[]).find(o=>o.id===cid);
            return it ? {el:x, cid, bx:it.x, by:it.y} : null; }
          return {el:x, eid:+x.dataset.eid, bt:{...opFor(+x.dataset.eid)}};
        }).filter(Boolean) : null};
      art().setPointerCapture && art().setPointerCapture(e.pointerId);
    }, true);
    art().addEventListener('pointermove', e=>{
      if(!F.editor.on) return;
      if(mq){
        if(Math.abs(e.clientX-mq.x0)+Math.abs(e.clientY-mq.y0) > 5) mq.moved = true;
        if(mq.moved) drawMq(mqRect(mq, e));
        return;
      }
      if(!drag) return;
      const dx=(e.clientX-drag.x0)/drag.scale, dy=(e.clientY-drag.y0)/drag.scale;
      if(Math.abs(dx)+Math.abs(dy) > 4) drag.moved = true;
      if(!drag.moved || !drag.canDrag) return;
      /* posição tentativa */
      if(drag.cid){
        const item=((F.state.compose||{})[F.editKey()]||[]).find(o=>o.id===drag.cid);
        if(item){ drag.el.style.left = (item.x + dx/art().offsetWidth*100)+'%';
                  drag.el.style.top  = (item.y + dy/art().offsetHeight*100)+'%'; }
      }else{
        drag.el.style.translate = `${(drag.base.dx||0)+dx}px ${(drag.base.dy||0)+dy}px`;
      }
      /* snap: bordas/margens/centro da arte + arestas e centros dos demais elementos */
      const a = art().getBoundingClientRect(), k = drag.scale;
      const rct = drag.el.getBoundingClientRect();
      const thr = Math.max(5, art().offsetWidth*0.008);          // px no espaço da arte
      const L=(rct.left-a.left)/k, R=(rct.right-a.left)/k;
      const T=(rct.top-a.top)/k,   B=(rct.bottom-a.top)/k;
      const bx = drag.snap ? bestSnap([L,(L+R)/2,R], drag.snap.xs, thr) : null;
      const by = drag.snap ? bestSnap([T,(T+B)/2,B], drag.snap.ys, thr) : null;
      const gv = guide('V'), gh = guide('H');
      if(bx){ gv.style.display='block'; gv.style.left = bx.t.v+'px'; gv.style.background = GUIDE_COLORS[bx.t.c]; }
      else gv.style.display='none';
      if(by){ gh.style.display='block'; gh.style.top = by.t.v+'px'; gh.style.background = GUIDE_COLORS[by.t.c]; }
      else gh.style.display='none';
      const sx = bx ? bx.d : 0, sy = by ? by.d : 0;
      if(sx || sy){
        if(drag.cid){
          drag.el.style.left = (parseFloat(drag.el.style.left) + sx/art().offsetWidth*100)+'%';
          drag.el.style.top  = (parseFloat(drag.el.style.top)  + sy/art().offsetHeight*100)+'%';
        }else{
          const cur = (drag.el.style.translate||'0px 0px').split(' ').map(parseFloat);
          drag.el.style.translate = `${(cur[0]||0)+sx}px ${(cur[1]||0)+sy}px`;
        }
      }
      drag.snapped = {sx, sy};
      /* grupo: replica o delta efetivo (arrasto + snap) nos demais selecionados */
      if(drag.group){
        const gdx = dx + sx, gdy = dy + sy;
        drag.group.forEach(m=>{
          if(m.cid){
            m.el.style.left = (m.bx + gdx/art().offsetWidth*100)+'%';
            m.el.style.top  = (m.by + gdy/art().offsetHeight*100)+'%';
          } else {
            m.el.style.translate = `${(m.bt.dx||0)+gdx}px ${(m.bt.dy||0)+gdy}px`;
          }
        });
      }
      if(F.editor.syncHandles) F.editor.syncHandles(true);   // alças acompanham o arrasto
    });
    const endDrag = e=>{
      /* fim do marquee: clique simples preserva o comportamento antigo;
         com movimento, seleciona tudo que o retângulo tocou */
      if(mq){
        if(!mq.moved){
          if(!mq.cands.length) select(null);
          else{
            const wasSel = F.editor.sel;
            if(wasSel && mq.cands.includes(wasSel) && mq.cands.length > 1){
              const i = mq.cands.indexOf(wasSel);
              const next = mq.cands[(i+1) % mq.cands.length];
              select(next);
              if(next.dataset.cid && F.ui && F.ui.focusComposeItem) F.ui.focusComposeItem(next.dataset.cid);
            } else select(mq.cands[0]);
          }
        } else if(e){
          const hits = marqueeHits(mqRect(mq, e));
          setSel(hits);
          F.toast(hits.length
            ? hits.length+' elemento'+(hits.length>1?'s':'')+' selecionado'+(hits.length>1?'s':'')+' — mova, escale, trave, anime, colora ou apague em conjunto.'
            : 'Nada selecionado nessa área.');
        }
        clearMq(); mq = null;
        return;
      }
      if(!drag) return;
      if(!drag.moved){
        /* toque sem arrasto: cicla só se o elemento JÁ estava selecionado
           antes deste toque (toque repetido no mesmo lugar) */
        if(!drag.fresh && drag.el === F.editor.sel && F.editor.sels.length<=1 && drag.cands.length > 1){
          const i = drag.cands.indexOf(drag.el);
          const next = drag.cands[(i+1) % drag.cands.length];
          if(next !== drag.el){ select(next);
            if(next.dataset.cid && F.ui && F.ui.focusComposeItem) F.ui.focusComposeItem(next.dataset.cid);
            drag = null; return; }
        }
      }
      if(drag.moved && drag.canDrag){
        if(drag.cid){
          const item=((F.state.compose||{})[F.editKey()]||[]).find(o=>o.id===drag.cid);
          if(item){ item.x=+parseFloat(drag.el.style.left).toFixed(1);
                    item.y=+parseFloat(drag.el.style.top).toFixed(1); }
        }else{
          const cur=(drag.el.style.translate||'0px 0px').split(' ').map(parseFloat);
          const op=opFor(drag.eid);
          op.dx=Math.round(cur[0]||0); op.dy=Math.round(cur[1]||0);
        }
        /* persiste o grupo inteiro */
        if(drag.group){
          const key = F.editKey();
          drag.group.forEach(m=>{
            if(m.cid){
              const it=((F.state.compose||{})[key]||[]).find(o=>o.id===m.cid);
              if(it){ it.x=+parseFloat(m.el.style.left).toFixed(1);
                      it.y=+parseFloat(m.el.style.top).toFixed(1); }
            }else{
              const cur=(m.el.style.translate||'0px 0px').split(' ').map(parseFloat);
              const op=opFor(m.eid);
              op.dx=Math.round(cur[0]||0); op.dy=Math.round(cur[1]||0);
            }
          });
        }
        F.autoSave();
      }
      if(!drag.moved && drag.cid && F.editor.sels.length<=1 && F.ui && F.ui.focusComposeItem){
        F.ui.focusComposeItem(drag.cid);      // tocar num item composto abre o formulário dele
      }
      hideGuides();
      drag=null;
      if(F.editor.syncHandles) F.editor.syncHandles();
    };
    art().addEventListener('pointerup', endDrag);
    art().addEventListener('pointercancel', ()=>{ clearMq(); mq=null; drag=null; hideGuides(); });
    art().addEventListener('contextmenu', e=>{ if(F.editor.on) e.preventDefault(); });
  };
})(window.FORMA);
