/* =====================================================
   FORJE·studio — ui/resize.js  (NOVO · aditivo)
   Alças de redimensionamento no box do elemento
   selecionado: dimensionar com precisão cirúrgica via
   movimento, sem depender do formulário nem do menu.
   · cantos (nw/ne/sw/se): escala proporcional (persiste
     em it.k / op.k — mesmo canal do A−/A+)
   · laterais (w/e) em itens compostos com largura (.sized):
     ajusta a LARGURA (it.w, em % da prancheta)
   · badge ao vivo com as dimensões em px reais da arte
   · alças compensam o zoom do palco (tamanho constante)
   Carregar após ui/editor.js.
   ===================================================== */
(function(F){
  'use strict';
  const art = () => document.getElementById('art');
  let box = null, hDrag = null;

  const HANDLES = ['nw','n','ne','e','se','s','sw','w'];
  const CLAMP_K = k => Math.min(8, Math.max(.08, Math.round(k*1000)/1000));

  function artScale(){
    const a = art(); if(!a) return 1;
    const r = a.getBoundingClientRect();
    return (r.width / a.offsetWidth) || 1;
  }
  function ensureBox(){
    const a = art(); if(!a) return null;
    if(box && box.isConnected && box.parentElement === a) return box;
    box = document.createElement('div');
    box.id = 'rzBox';
    box.innerHTML = HANDLES.map(h=>`<i class="rz rz-${h}" data-h="${h}"></i>`).join('')
      + `<span class="rzbadge" id="rzBadge"></span>`;
    a.appendChild(box);
    box.querySelectorAll('.rz').forEach(h=>{
      h.addEventListener('pointerdown', startResize);
    });
    return box;
  }
  function removeBox(){ if(box){ box.remove(); box = null; } }

  /* alça lateral controla LARGURA real em: itens compostos .sized (it.w)
     e — ajuste pós-S6 — elementos de TEXTO (h1/p): mudar a largura
     refaz o fluxo do texto (op.w + .tflex), em vez de só escalar.
     Nos demais, laterais escalam proporcionalmente como antes. */
  function textEl(el){
    return !!el && (/^(H1|H2|H3|P)$/.test(el.tagName)
      || !!el.querySelector(':scope > h1, :scope > h2, :scope > p'));
  }
  function widthMode(el){
    if(!el) return false;
    if(el.dataset.cid){ const it = F.editor._itemOf(el); if(it && it.w) return true; }
    return textEl(el);
  }

  F.editor.syncHandles = function(light){
    const ed = F.editor;
    if(!ed.on || ed.sels.length !== 1 || !ed.sel || !ed.sel.isConnected
       || ed._isLocked(ed.sel) || hDrag){
      if(!hDrag) removeBox();
      return;
    }
    const a = art(), el = ed.sel;
    const b = ensureBox(); if(!b) return;
    const ar = a.getBoundingClientRect(), r = el.getBoundingClientRect();
    const k = artScale();
    b.style.left   = ((r.left - ar.left)/k) + 'px';
    b.style.top    = ((r.top  - ar.top )/k) + 'px';
    b.style.width  = (r.width /k) + 'px';
    b.style.height = (r.height/k) + 'px';
    b.style.setProperty('--rzk', 1/k);          // alças com tamanho constante na tela
    b.classList.toggle('wmode', widthMode(el));
    if(!light){
      const badge = b.querySelector('#rzBadge');
      if(badge) badge.textContent = Math.round(r.width/k) + ' × ' + Math.round(r.height/k) + ' px';
    }
  };

  function startResize(e){
    const ed = F.editor;
    const el = ed.sel;
    if(!el || !el.isConnected || ed._isLocked(el)) return;
    e.preventDefault(); e.stopPropagation();
    const h = e.currentTarget.dataset.h;
    const k = artScale();
    const r = el.getBoundingClientRect();
    const it = F.editor._itemOf(el);
    const wMode = widthMode(el) && (h==='e' || h==='w');
    /* âncora: canto/lado oposto — a referência de distância do gesto */
    const ax = h.includes('w') ? r.right : h.includes('e') ? r.left : (r.left+r.right)/2;
    const ay = h.includes('n') ? r.bottom : h.includes('s') ? r.top : (r.top+r.bottom)/2;
    const d0 = Math.max(8, Math.hypot(e.clientX-ax, e.clientY-ay));
    const dx0 = Math.max(8, Math.abs(e.clientX-ax));
    const tw = wMode && !(it && it.w);                 // modo largura de TEXTO
    hDrag = { el, h, it, wMode, tw, ax, ay, d0, dx0, k,
      baseK: it ? (it.k||1) : ((F.editor._opFor(+el.dataset.eid).k)||1),
      baseW: (it && it.w) ? it.w
           : tw ? Math.max(4, r.width / (el.parentElement?.getBoundingClientRect().width || r.width) * 100)
           : 0,
      r0:r,
      pid: e.pointerId };
    try{ e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); }catch(err){}
    document.addEventListener('pointermove', onResize);
    document.addEventListener('pointerup', endResize, {once:true});
    document.addEventListener('pointercancel', endResize, {once:true});
  }
  function onResize(e){
    if(!hDrag) return;
    const d = hDrag;
    if(d.wMode){
      /* largura em % — precisão de 0.1% */
      const f = Math.max(.05, Math.abs(e.clientX - d.ax) / d.dx0);
      const nw = Math.min(100, Math.max(2, Math.round(d.baseW * f * 10)/10));
      if(d.tw){
        /* TEXTO: o box muda e o conteúdo reflui junto (quebra flexível) */
        F.editor._opFor(+d.el.dataset.eid).w = nw;
        d.el.style.width = nw + '%';
        d.el.style.maxWidth = 'none';
        d.el.classList.add('tflex');
      } else {
        d.it.w = nw;
        d.el.style.width = nw + '%';
      }
    } else {
      const f = Math.hypot(e.clientX - d.ax, e.clientY - d.ay) / d.d0;
      const nk = CLAMP_K(d.baseK * f);
      if(d.it) d.it.k = nk; else F.editor._opFor(+d.el.dataset.eid).k = nk;
      d.el.style.scale = nk;
      d._nk = nk;
    }
    /* box + badge ao vivo */
    const a = art(), ar = a.getBoundingClientRect(), r = d.el.getBoundingClientRect();
    const k = artScale();
    if(box){
      box.style.left   = ((r.left - ar.left)/k) + 'px';
      box.style.top    = ((r.top  - ar.top )/k) + 'px';
      box.style.width  = (r.width /k) + 'px';
      box.style.height = (r.height/k) + 'px';
      const badge = box.querySelector('#rzBadge');
      if(badge) badge.textContent = Math.round(r.width/k) + ' × ' + Math.round(r.height/k) + ' px'
        + (d.wMode ? '  ·  '+(d.tw ? F.editor._opFor(+d.el.dataset.eid).w : d.it.w)+'%'
                   : (d._nk ? '  ·  ×'+d._nk.toFixed(2) : ''));
    }
  }
  function endResize(){
    if(!hDrag) return;
    const wasW = hDrag.wMode;
    hDrag = null;
    document.removeEventListener('pointermove', onResize);
    F.autoSave();
    if(wasW){
      /* largura muda o fluxo interno: re-render preserva o layout real.
         Reseleção por cid (item composto) ou por eid (elemento de texto —
         a ordem do DOM é estável, o eid re-atribuído coincide). */
      const sel = F.editor.sel;
      const snapC = sel && sel.dataset.cid, snapE = sel && sel.dataset.eid;
      F.render(false);
      const el2 = snapC ? art().querySelector(`[data-cid="${snapC}"]`)
                : snapE!=null ? art().querySelector(`[data-eid="${snapE}"]`) : null;
      if(el2 && F.editor.on){
        F.editor.sels = [el2]; F.editor.sel = el2;
        el2.style.outline = '3px dashed #5ee6c7'; el2.style.outlineOffset = '3px';
      }
    }
    F.editor.syncHandles();
  }
})(window.FORMA);
