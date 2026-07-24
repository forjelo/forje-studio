/* =====================================================
   FORJE·studio — ui/panels.js
   Interface do estúdio. Painéis por modo:
   design → MARCA / FORMATO / CONTEÚDO / IMAGEM / LIB
   motion → MARCA / TIMELINE / CENA / ESTILO / LIB
   Uploads usam <label> nativo (funciona em sandbox),
   com alternativas: arrastar no palco e colar Ctrl+V.
   ===================================================== */
(function(F){
  const $ = s=>document.querySelector(s), $$ = s=>[...document.querySelectorAll(s)];
  F.ui = {};

  /* ---------- listas de transição de cena ---------- */
  const SCENE_ENTERS = [['none','—'],['fade','Fade'],['wipe','Wipe →'],['wipe-up','Wipe ↑'],['wipe-down','Wipe ↓'],
    ['zoom','Zoom +'],['zoom-out','Zoom −'],['slide-l','Desliza ←'],['slide-r','Desliza →'],['slide-up','Desliza ↑'],
    ['slide-down','Desliza ↓'],['blur','Desfoque'],['iris','Íris'],['flip','Vira 3D'],['spin','Gira']];
  const SCENE_EXITS = [['none','—'],['fade','Fade'],['wipe','Wipe ↑'],['wipe-down','Wipe ↓'],['wipe-l','Wipe ←'],
    ['wipe-r','Wipe →'],['zoom','Zoom +'],['zoom-out','Zoom −'],['slide','Desliza ↑'],['slide-down','Desliza ↓'],
    ['slide-l','Desliza ←'],['slide-r','Desliza →'],['blur','Desfoque'],['iris','Íris'],['flip','Vira 3D'],['spin','Gira']];
  const ITEM_EXITS = [['','—'],['fade','Fade'],['fall','Cai'],['rise','Sobe'],['shrink','Encolhe'],
    ['blur','Desfoque'],['slide-l','Desliza ←'],['slide-r','Desliza →'],['spin','Gira']];
  const ICON_COLORS = [['ac','Accent'],['p1','Primária'],['p2','Secundária'],['fg','Texto'],['bg','Fundo']];
  /* presets do "Inserir texto" — ponto de partida, tudo ajustável no formulário */
  function textPreset(t){
    if(t==='para')  return {w:46, props:{text:'Escreva seu parágrafo aqui. Fonte, peso, alinhamento e tudo mais são ajustáveis no formulário deste item.', size:3.4, weight:400, font:'__body', lh:1.45, align:'left'}};
    if(t==='label') return {w:26, props:{text:'RÓTULO', size:2.4, weight:600, font:'__mono', ls:.16, upper:1, align:'left'}};
    return {w:56, props:{text:'Seu título aqui', size:9, weight:800, font:'__display', lh:1.05, align:'left'}};
  }
  /* catálogo de formas: vem da biblioteca F.shapes (lib/shapes.js) —
     [id, nome, categoria, html da pré-visualização] */
  const SHAPES = ()=>F.shapes.entries().map(([id,d])=>[id, d.n, d.cat||'Formas', d.prev]);
  /* botão de forma com pré-visualização (usado na paleta e no formulário) */
  function shapeBtn(kind, nome, prev, on){
    return el(`<button class="shbtn${on?' on':''}" draggable="true" title="${nome}" data-q="${(nome+' '+kind).toLowerCase()}">${prev}</button>`);
  }


  /* seção "inserir ícone na arte" — usada em IMAGEM (design) e CENA (motion) */
  function iconInsertSection(){
    const w = el(`<div class="field"><span class="lbl">Ícones, imagens livres e logo</span>
      <button class="hbtn" style="justify-content:center">${F.uiIcon('spark')} Compor ícones e elementos →</button>
      <div class="note">A inserção de ícones, imagens livres e da logo fica organizada na aba <b>COMPOR</b>, com cor, tamanho, forma e animação por item.</div></div>`);
    w.querySelector('button').onclick = ()=>switchTab('t5');
    return w;
  }

  /* seção "cores desta arte": sobrepõe os tokens da marca só no slide/cena atual */
  function artColorsSection(){
    const key = F.tokenKey(), b = F.state.brand;
    const ov = (F.state.artTokens||{})[key] || {};
    const who = F.state.mode==='design' ? 'slide '+(F.state.cur+1) : 'cena '+(F.state.curScene+1);
    const w = el(`<div class="field"><span class="lbl">Cores desta arte <em>${who}</em></span>
      <div class="colors"></div>
      <button class="hbtn" style="justify-content:center">Restaurar cores da marca</button>
      <div class="note"><b>Prancheta</b> troca a cor de fundo REAL da arte (o fundo gerativo do template vira sólido nessa cor; véus acompanham). <b>Fundo/véu</b> ajusta só o tom das sobreposições. Persiste e sai em todos os exports.</div></div>`);
    const grid = w.querySelector('.colors');
    [['canvas','prancheta'],['bg','fundo/véu'],['fg','texto'],['p1','prim.'],['p2','sec.'],['ac','accent']].forEach(([k,n])=>{
      const c = el(`<label class="cw"><input type="color" value="${ov[k]||b[k==='canvas'?'bg':k]}"><span>${n}</span></label>`);
      c.querySelector('input').oninput = e=>{
        F.state.artTokens = F.state.artTokens || {};
        (F.state.artTokens[key] = F.state.artTokens[key] || {})[k] = e.target.value;
        F.autoSave(); F.render(false);
      };
      grid.appendChild(c);
    });
    w.querySelector('button').onclick = ()=>{
      if(F.state.artTokens) delete F.state.artTokens[key];
      F.autoSave(); F.render(); F.ui.refreshActive();
      F.toast('Cores da marca restauradas nesta arte.');
    };
    return w;
  }

  /* ---------- utilidades ---------- */
  function el(html){ const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }
  function readAsData(f, cb){ const r = new FileReader(); r.onload = ()=>cb(r.result); r.readAsDataURL(f); }
  /* imagens SEMPRE entram comprimidas (BUG de lentidão: base64 gigante) */
  function readAsImage(f, cb){ readAsData(f, src=>F.shrinkImage(src).then(cb)); }
  /* render ao vivo com no máx. 1 render por frame (sliders disparam dezenas/s) */
  let liveT = false;
  function liveRender(){
    if(liveT) return; liveT = true;
    (window.requestAnimationFrame||setTimeout)(()=>{ liveT = false; F.render(false); });
  }
  function readAsText(f, cb){ const r = new FileReader(); r.onload = ()=>cb(r.result); r.readAsText(f); }

  /* upload robusto: <label> abre o seletor nativamente (sem .click()
     programático, que alguns ambientes embutidos bloqueiam) + drag&drop */
  function fileLabel(text, accept, onFile){
    const lab = el(`<label class="drop">${text}<input type="file" accept="${accept}" hidden></label>`);
    const inp = lab.querySelector('input');
    inp.onchange = ()=>{ if(inp.files[0]) onFile(inp.files[0]); inp.value=''; };
    lab.ondragover = e=>{ e.preventDefault(); lab.style.borderColor='var(--ui-ac)'; };
    lab.ondragleave = ()=>lab.style.borderColor='';
    lab.ondrop = e=>{ e.preventDefault(); lab.style.borderColor='';
      const f = e.dataTransfer.files[0]; if(f) onFile(f); };
    return lab;
  }
  function iconPicker(current, onpick, draggable){
    const g = el(`<div class="icongrid"></div>`);
    F.icons.entries().forEach(([id,ic])=>{
      const b = el(`<button class="icbtn${id===current?' on':''}" title="${ic.n}${draggable?' — clique ou arraste para o palco':''}">
        <svg viewBox="0 0 24 24">${ic.svg}</svg></button>`);
      b.onclick = ()=>{ g.querySelectorAll('.icbtn').forEach(x=>x.classList.remove('on'));
        b.classList.add('on'); onpick(id); };
      if(draggable){ b.draggable = true;
        b.ondragstart = e=>e.dataTransfer.setData('text/forma-comp', '__icon|'+id); }
      g.appendChild(b);
    });
    return g;
  }
  function fontSelect(role, value, onchange){
    const s = el(`<select class="inp"></select>`);
    F.fonts.entries().forEach(([id,f])=>{
      if(f.role===role || f.role==='both')
        s.appendChild(el(`<option value="${id}">${f.n}</option>`));
    });
    (F.state.brand.customFonts||[]).forEach(cf=>
      s.appendChild(el(`<option value="custom:${cf.name}">★ ${cf.name}</option>`)));
    s.value = value; s.onchange = ()=>onchange(s.value);
    return s;
  }
  function chipRow(entries, current, onpick){
    const w = el(`<div class="chips"></div>`);
    entries.forEach(([id,n])=>{
      const c = el(`<div class="chip${id===current?' on':''}">${n}</div>`);
      c.onclick = ()=>{ w.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));
        c.classList.add('on'); onpick(id); };
      w.appendChild(c); });
    return w;
  }
  function maskChips(current, onpick){
    return chipRow([['cover','Cover'],['window','Janela'],['circle','Círculo'],['blob','Blob'],['arch','Arco']], current, onpick);
  }
  function fxChips(){
    const w = el(`<div class="chips"></div>`);
    F.fx.entries().forEach(([id,fx])=>{
      const c = el(`<div class="chip${F.state.fx.includes(id)?' on':''}">${fx.n}</div>`);
      c.onclick = ()=>{ const i = F.state.fx.indexOf(id);
        if(i>=0) F.state.fx.splice(i,1); else F.state.fx.push(id);
        c.classList.toggle('on'); F.render(); };
      w.appendChild(c); });
    return w;
  }
  function imageField(getSrc, setSrc, note){
    const w = el(`<div class="field"><span class="lbl">Imagem</span></div>`);
    const lab = fileLabel('enviar imagem — ou arraste aqui / cole Ctrl+V', 'image/*',
      f=>readAsImage(f, src=>{ setSrc(src); sync(); F.render(); }));
    const thumb = el(`<div class="thumb" style="display:none"><img alt=""><button class="x">×</button></div>`);
    const rm = el(`<button class="hbtn" style="justify-content:center">${F.uiIcon('scissors')} Remover fundo branco</button>`);
    const sync = ()=>{ const has = !!getSrc();
      thumb.style.display = has?'block':'none'; lab.style.display = has?'none':'block';
      if(has) thumb.querySelector('img').src = getSrc(); };
    thumb.querySelector('.x').onclick = ()=>{ setSrc(null); sync(); F.render(); };
    rm.onclick = async ()=>{
      const src = getSrc(); if(!src) return F.toast('Envie uma imagem primeiro.');
      const out = await F.removeWhiteBg(src); setSrc(out); sync(); F.render();
      F.toast('Fundo branco removido (limiar local, sem IA).');
    };
    w.append(lab, thumb, rm);
    if(note) w.appendChild(el(`<div class="note">${note}</div>`));
    sync();
    return w;
  }
  F.removeWhiteBg = async function(src){
    const im = new Image(); im.src = src; await im.decode();
    const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
    const cx = cv.getContext('2d'); cx.drawImage(im,0,0);
    const d = cx.getImageData(0,0,cv.width,cv.height), p = d.data;
    for(let i=0;i<p.length;i+=4){
      const l = Math.min(p[i],p[i+1],p[i+2]);
      if(l>235) p[i+3]=0;
      else if(l>205) p[i+3]=Math.round(p[i+3]*(235-l)/30);
    }
    cx.putImageData(d,0,0);
    return cv.toDataURL('image/png');
  };

  /* destino "inteligente" de imagens coladas/arrastadas no palco */
  function assignImage(src, how){
    const s = F.state;
    if(s.mode==='design'){ s.slides[s.cur].img = src; }
    else{
      const sc = s.timeline[s.curScene];
      if(!sc) return F.toast('Adicione uma cena primeiro.');
      sc.img = src;
    }
    buildPanels(); F.render();
    F.toast('Imagem aplicada '+how+'.');
  }

  /* =====================================================
     PAINEL: MARCA (igual nos dois modos)
  ===================================================== */
  function panelBrand(p){
    const b = F.state.brand;
    p.innerHTML = `
      <div class="field"><span class="lbl">Nome da marca</span><input class="inp" id="bName" value="${F.esc(b.name)}"></div>
      <div class="field"><span class="lbl">Handle / assinatura</span><input class="inp" id="bHandle" value="${F.esc(b.handle)}"></div>
      <div class="field"><span class="lbl">Paleta</span><div class="colors">
        ${[['cBg','bg','fundo'],['cFg','fg','texto'],['cP1','p1','prim.'],['cP2','p2','sec.'],['cAc','ac','accent']]
          .map(([id,k,n])=>`<label class="cw"><input type="color" id="${id}" value="${b[k]}"><span>${n}</span></label>`).join('')}
      </div></div>
      <div class="row">
        <div class="field"><span class="lbl">Fonte display</span><span id="fH"></span></div>
        <div class="field"><span class="lbl">Fonte texto</span><span id="fB"></span></div>
      </div>
      <div class="field"><span class="lbl">Variação de fontes display (o seed alterna)</span><div class="chips" id="fontPool"></div></div>
      <div class="field"><span class="lbl">Fonte própria (.ttf/.otf/.woff2)</span><span id="fontLab"></span></div>
      <div class="field"><span class="lbl">Raio dos cantos</span>
        <div class="range"><input type="range" id="bRadius" min="0" max="60" step="2" value="${b.radius}"><output id="bRadiusO">${b.radius}px</output></div></div>
      <div class="field"><span class="lbl">Logo (PNG/SVG)</span><span id="logoLab"></span>
        <div class="thumb" id="logoThumb" style="display:none"><img id="logoImg" alt="logo"><button class="x" id="logoX">×</button></div></div>
      <div class="row">
        <button class="hbtn" id="btnSaveBrand" style="justify-content:center">${F.uiIcon('save')} Salvar</button>
        <button class="hbtn" id="btnResetBrand" style="justify-content:center">Limpar</button>
      </div>
      <div class="row">
        <button class="hbtn" id="btnExpJSON" style="justify-content:center">${F.uiIcon('download')} Backup .json</button>
        <span id="jsonLab" style="flex:1"></span>
      </div>
      <div class="note">O brandbook (tokens, logo e fontes próprias) persiste no estúdio e pode ser levado em arquivo .json — carregue uma vez, componha para sempre.</div>
      <div class="field"><span class="lbl">Idioma da interface</span>
        <div class="chips langchips" id="langSel">
          ${[['auto','Auto (detectar)'],['pt','Português'],['en','English'],['es','Español']]
            .map(([v,n])=>`<div class="chip${(F.langPref||'auto')===v?' on':''}" data-lang="${v}">${n}</div>`).join('')}
        </div></div>`;
    const map = {bName:'name', bHandle:'handle', cBg:'bg', cFg:'fg', cP1:'p1', cP2:'p2', cAc:'ac'};
    for(const id in map){ const i = $('#'+id); i.oninput = ()=>{ b[map[id]] = i.value; F.render(false); }; }
    $('#fH').replaceWith(fontSelect('display', b.fontH, v=>{ b.fontH=v; F.render(false); }));
    $('#fB').replaceWith(fontSelect('body',    b.fontB, v=>{ b.fontB=v; F.render(false); }));
    /* pool de variação: multi-select de fontes display */
    const fpWrap = $('#fontPool');
    b.fontPool = b.fontPool || [];
    const poolCands = F.fonts.entries().filter(([id,f])=>f.role!=='body')
      .map(([id,f])=>[id,f.n])
      .concat((b.customFonts||[]).map(cf=>['custom:'+cf.name,'★ '+cf.name]));
    poolCands.forEach(([id,n])=>{
      const c = el(`<div class="chip${b.fontPool.includes(id)?' on':''}">${n}</div>`);
      c.onclick = ()=>{ const i=b.fontPool.indexOf(id);
        if(i>=0) b.fontPool.splice(i,1); else b.fontPool.push(id);
        c.classList.toggle('on'); F.render(); };
      fpWrap.appendChild(c);
    });
    $('#bRadius').oninput = e=>{ b.radius = +e.target.value; $('#bRadiusO').textContent = e.target.value+'px'; F.render(false); };

    /* fonte própria */
    $('#fontLab').replaceWith(fileLabel('enviar arquivo de fonte da marca', '.ttf,.otf,.woff,.woff2',
      async f=>{ try{ const id = await F.addCustomFont(f); b.fontH = id;
          buildPanels(); F.render(); F.toast('Fonte "'+id.slice(7)+'" carregada como display. Salve o brandbook para persistir.');
        }catch(err){ F.toast('Não consegui carregar essa fonte: '+err.message); } }));

    /* logo */
    const logoLab = fileLabel('enviar logo — ou arraste aqui', 'image/*',
      f=>readAsImage(f, src=>{ b.logo = src; syncLogo(); F.render(); }));
    $('#logoLab').replaceWith(logoLab);
    const syncLogo = ()=>{ const has = !!b.logo;
      $('#logoThumb').style.display = has?'block':'none'; logoLab.style.display = has?'none':'block';
      if(has) $('#logoImg').src = b.logo; };
    syncLogo();
    $('#logoX').onclick = ()=>{ b.logo = null; syncLogo(); F.render(); };

    /* idioma da interface (PT fonte · EN · ES) */
    document.querySelectorAll('#langSel .chip').forEach(ch=>{
      ch.onclick = async ()=>{
        await F.setLang(ch.dataset.lang);
        document.querySelectorAll('#langSel .chip').forEach(c=>c.classList.toggle('on', c===ch));
      };
    });

    $('#btnSaveBrand').onclick = async ()=>{ await F.saveBrand(); F.toast('Brandbook salvo — carrega automático nas próximas sessões.'); };
    $('#btnResetBrand').onclick = async ()=>{ await F.resetBrand(); buildPanels(); F.render(); F.toast('Brandbook restaurado ao padrão.'); };
    $('#btnExpJSON').onclick = ()=>F.download(new Blob([F.exportJSON()],{type:'application/json'}),'forje-brandbook.json');
    const jsonLab = fileLabel('importar .json', '.json,application/json',
      f=>readAsText(f, async txt=>{ try{ F.importJSON(txt); await F.loadCustomFonts(); F.runPlugins();
          buildPanels(); F.render(); F.toast('Projeto importado.'); }catch(err){ F.toast('JSON inválido.'); } }));
    jsonLab.style.padding = '8px'; jsonLab.style.fontSize = '12.5px';
    $('#jsonLab').replaceWith(jsonLab);
  }

  /* =====================================================
     DESIGN: FORMATO / CONTEÚDO / IMAGEM
  ===================================================== */
  function panelFormato(p){
    p.innerHTML = `
      <div class="field"><span class="lbl">Formato de saída</span><span id="fmtRow"></span></div>
      <div class="field"><span class="lbl">Template <em style="font-style:normal">${F.templates.ids().length}</em></span><div class="grid2" id="tplGrid"></div></div>
      <div class="field"><span class="lbl">Efeitos de acabamento</span><span id="fxRow"></span></div>
      <div class="field"><span class="lbl">Velocidade do motion</span>
        <div class="range"><input type="range" id="mSpeed" min="60" max="180" step="10" value="${F.state.speed*100}"><output id="mSpeedO">${F.state.speed.toFixed(1)}×</output></div></div>`;
    $('#fmtRow').replaceWith(chipRow(Object.entries(F.FORMATS).map(([k,v])=>[k,v.n]), F.state.format, id=>{ F.state.format=id; F.render(); }));
    $('#fxRow').replaceWith(fxChips());
    const tg = $('#tplGrid');
    /* fase 2.2: quando o conteúdo roteou templates por slide, o card
       marcado é o EFETIVO do slide atual e o clique muda só este slide;
       sem roteamento, o comportamento global de sempre (P1). */
    const perSlide = ()=> (F.state.slides||[]).some(x=>x && x.tpl);
    const effTpl = ()=> ((F.state.slides||[])[F.state.cur]||{}).tpl || F.state.tpl;
    F.templates.entries().forEach(([id,t])=>{
      const c = el(`<div class="tcard${effTpl()===id?' on':''}">
        <svg viewBox="0 0 100 44">${t.mini||''}</svg><div class="tn">${t.n}</div><div class="td">${t.d||''}</div></div>`);
      c.onclick = ()=>{
        if(perSlide()) F.state.slides[F.state.cur].tpl = id;
        else F.state.tpl = id;
        tg.querySelectorAll('.tcard').forEach(x=>x.classList.remove('on'));
        c.classList.add('on'); F.render(); };
      tg.appendChild(c); });
    if(perSlide()){
      const row = el(`<div class="field">
        <div class="note">Este carrossel usa template por slide (roteado do conteúdo) — o clique acima muda só o slide atual.</div>
        <button class="hbtn" id="btnTplAll" style="justify-content:center">Usar este template em todos os slides</button></div>`);
      row.querySelector('#btnTplAll').onclick = ()=>{
        F.state.tpl = effTpl();
        (F.state.slides||[]).forEach(x=>{ if(x) delete x.tpl; });
        F.render(); F.toast('Template aplicado a todos os slides.');
        switchTab(activeTab);
      };
      tg.after(row);
    }
    $('#mSpeed').oninput = e=>{ F.state.speed = +e.target.value/100;
      $('#mSpeedO').textContent = F.state.speed.toFixed(1)+'×'; F.render(); };
    p.appendChild(artColorsSection());
  }
  function panelConteudo(p){
    const s = F.state, sl = s.slides[s.cur];
    p.innerHTML = `
      <div class="field"><span class="lbl">Slides do carrossel</span><div class="slides" id="slideRow"></div></div>
      <div class="field"><span class="lbl">Kicker / chapéu</span><input class="inp" id="cKicker" value="${F.esc(sl.kicker)}"></div>
      <div class="field"><span class="lbl">Título</span><textarea class="inp" id="cTitle">${F.esc(sl.title)}</textarea></div>
      <div class="field"><span class="lbl">Subtítulo / apoio</span><textarea class="inp" id="cSub">${F.esc(sl.sub)}</textarea></div>
      <div class="field"><span class="lbl">CTA (global)</span><input class="inp" id="cCta" value="${F.esc(s.cta)}"></div>
      <div class="field"><span class="lbl">Marcador de páginas do carrossel</span><span id="pagerRow"></span></div>
      <div class="note">Cada slide guarda seu próprio texto, imagem e máscara. CTA, assinatura e marcador valem para o carrossel inteiro (o marcador aparece com 2+ slides).</div>
      <div class="field" style="margin-top:10px"><span class="lbl">Gerar do conteúdo <em>cole o texto — o sistema fatia, roteia e compõe</em></span>
        <textarea class="inp" id="genTxt" rows="7" style="min-height:110px" placeholder="Cole aqui o conteúdo do carrossel…"></textarea>
        <span id="genModeRow"></span>
        <label class="lbl" style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="genRoute" checked> Template por conteúdo (roteamento)</label>
        <label class="lbl" style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="genImgs" checked> Usar imagens do texto</label>
        <button class="hbtn" id="btnGen" style="justify-content:center">${F.uiIcon('spark')} Gerar slides</button>
        <div class="note">linha em branco separa slides · # título · ### kicker · &gt; citação · - lista · **destaque** · ![](url) imagem · bloco final com ação vira o CTA</div>
      </div>
      <div class="field" style="margin-top:10px"><span class="lbl">Gerar em lote (dados) <em>CSV ou JSON — cada linha vira uma arte</em></span>
        <label class="hbtn" style="justify-content:center;cursor:pointer">${F.uiIcon('grid')||''} Carregar CSV / JSON<input type="file" id="batFile" accept=".csv,.json,text/csv,application/json,.tsv" hidden></label>
        <div id="batMap"></div>
      </div>`;
    buildSlideRow($('#slideRow'), ()=>panelConteudo(p));
    $('#pagerRow').replaceWith(chipRow(F.PAGERS, s.pager||'counter', id=>{ s.pager=id; F.render(); }));
    /* Eixo 2 · gerar do conteúdo: rascunho sobrevive à troca de aba */
    F.ui._genDraft = F.ui._genDraft || { txt:'', mode:'replace' };
    const gt = $('#genTxt'); gt.value = F.ui._genDraft.txt;
    gt.oninput = e=>{ F.ui._genDraft.txt = e.target.value; };
    $('#genModeRow').replaceWith(chipRow([['replace','Substituir slides'],['append','Adicionar ao fim']],
      F.ui._genDraft.mode, id=>{ F.ui._genDraft.mode = id; }));
    $('#btnGen').onclick = ()=>{
      const txt = F.ui._genDraft.txt||'';
      if(!txt.trim()){ F.toast('Cole um texto para gerar.'); return; }
      const P = F.generateFromContent(txt, {
        mode: F.ui._genDraft.mode,
        route: $('#genRoute').checked,
        useImages: $('#genImgs').checked,
      });
      if(P.slides.length) panelConteudo(p);
    };
    /* Eixo 3 · fase 3.1 — dados → N artes, com mapeamento persistente */
    $('#batFile').onchange = e=>{
      const f = e.target.files[0]; e.target.value=''; if(!f) return;
      readAsText(f, txt=>{
        const T = F.parseTable(txt);
        if(!T.rows.length){ F.toast('Arquivo sem linhas de dados.'); return; }
        F.ui._batch = { headers:T.headers, rows:T.rows, map:F.guessMap(T.headers),
                        mode:'replace', perLine:true, route:true, file:f.name };
        panelConteudo(p);
      });
    };
    const B = F.ui._batch;
    if(B){
      const selOf = (field, label) => `<div class="field" style="margin:4px 0 0"><span class="lbl">${label}</span>
        <select class="inp" data-bf="${field}"><option value="">— ignorar —</option>${
          B.headers.map(h=>`<option value="${F.esc(h)}"${B.map[field]===h?' selected':''}>${F.esc(h)}</option>`).join('')}</select></div>`;
      const bm = $('#batMap');
      bm.innerHTML = `<div class="note" style="margin-top:6px">${F.esc(B.file)} · ${B.rows.length} linhas · ${B.headers.length} colunas</div>
        ${selOf('title','Título')}${selOf('kicker','Kicker / chapéu')}${selOf('sub','Subtítulo / apoio')}
        ${selOf('img','Imagem (URL)')}${selOf('name','Nome do arquivo (export)')}
        <span id="batModeRow"></span>
        <label class="lbl" style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="batPer" ${B.perLine?'checked':''}> Variação por linha (seed dos dados)</label>
        <label class="lbl" style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="batRoute" ${B.route?'checked':''}> Template por conteúdo (imagem, número)</label>
        <button class="hbtn" id="btnBat" style="justify-content:center">${F.uiIcon('spark')} Gerar ${Math.min(B.rows.length,60)} artes</button>
        <div class="note">o campo <b>Nome do arquivo</b> nomeia o export: forje_<i>nome</i>_1080x1080.png</div>`;
      bm.querySelectorAll('select[data-bf]').forEach(sel=>{ sel.onchange = ()=>{ B.map[sel.dataset.bf] = sel.value; }; });
      $('#batModeRow').replaceWith(chipRow([['replace','Substituir slides'],['append','Adicionar ao fim']],
        B.mode, id=>{ B.mode = id; }));
      $('#btnBat').onclick = ()=>{
        if(!B.map.title && !B.map.sub && !B.map.img){ F.toast('Mapeie ao menos o Título.'); return; }
        B.perLine = $('#batPer').checked; B.route = $('#batRoute').checked;
        const R = F.generateFromData(B.rows, B.map, {mode:B.mode, perLine:B.perLine, route:B.route});
        if(R.slides.length) panelConteudo(p);
      };
      /* Eixo 3 · fase 3.3 — um MP4 por linha, timeline como template */
      if((s.timeline||[]).length){
        const ph = F.timelineHasPH(s.timeline);
        const vid = el(`<div class="field" style="margin-top:8px"><span class="lbl">Vídeo em lote <em>timeline como template — 1 MP4 por linha</em></span>
          ${selOf('value','Valor (contador das cenas)')}${selOf('suffix','Sufixo do contador')}
          <button class="hbtn" id="btnBatVid" style="justify-content:center">${F.uiIcon('play')||''} Gerar ${Math.min(B.rows.length,20)} MP4s da timeline</button>
          <div class="note">${ph
            ? 'placeholders <b>{{coluna}}</b> detectados na timeline — cada linha preenche os seus'
            : 'dica: escreva <b>{{coluna}}</b> nos textos das cenas (ex.: “Certificamos {{nome}}”) para o mail-merge preciso; sem placeholders, os campos mapeados acima substituem em todas as cenas'}</div>
        </div>`);
        bm.appendChild(vid);
        vid.querySelectorAll('select[data-bf]').forEach(sel=>{ sel.onchange = ()=>{ B.map[sel.dataset.bf] = sel.value; }; });
        vid.querySelector('#btnBatVid').onclick = ()=>F.exportVideoBatch(B.rows, B.map, {});
      }
    }
    $('#cKicker').oninput = e=>{ sl.kicker = e.target.value; F.render(false); };
    $('#cTitle').oninput  = e=>{ sl.title  = e.target.value; F.render(false); };
    $('#cSub').oninput    = e=>{ sl.sub    = e.target.value; F.render(false); };
    $('#cCta').oninput    = e=>{ s.cta     = e.target.value; F.render(false); };
  }
  function buildSlideRow(row, rebuild){
    const s = F.state;
    row.innerHTML = '';
    s.slides.forEach((sl,i)=>{
      const w = el(`<span class="slw"><button class="sl${i===s.cur?' on':''}${sl.img?' hasimg':''}">${i+1}</button>${
        s.slides.length>1 ? `<button class="slx" title="remover o slide ${i+1}">×</button>` : ''}</span>`);
      w.querySelector('.sl').onclick = ()=>{ s.cur = i; rebuild(); F.render(); };
      const x = w.querySelector('.slx');
      if(x) x.onclick = e=>{ e.stopPropagation();
        if(F.removeSlide(i)){ rebuild(); F.render(); F.toast('Slide '+(i+1)+' removido — composições e cores dos demais preservadas.'); } };
      row.appendChild(w); });
    const add = el(`<button class="sl" title="adicionar slide">+</button>`);
    add.onclick = ()=>{ s.slides.push(F.defSlide(s.slides.length)); s.cur = s.slides.length-1; rebuild(); F.render(); };
    row.appendChild(add);
  }
  function panelImagem(p){
    const s = F.state, sl = s.slides[s.cur];
    p.innerHTML = `<div class="lbl">Imagem do slide ${s.cur+1}</div><span id="imgF"></span>
      <div class="field"><span class="lbl">Encaixe (máscara deste slide)</span><span id="maskRow"></span></div>
      <div class="row"><button class="hbtn" id="btnAll" style="justify-content:center">Aplicar imagem a todos os slides</button></div>
      <div class="field"><span class="lbl">Ícone de destaque <em>seleção usada pelos templates — para INSERIR ícones, use COMPOR</em></span><span id="icRow"></span></div>
      <div class="note">No modo <b>Cover</b> a imagem vira fundo/painel full-bleed com tratamento de legibilidade em qualquer template. Também dá para <b>arrastar uma imagem direto no palco</b> ou colar com <b>Ctrl+V</b>.</div>`;
    $('#imgF').replaceWith(imageField(()=>sl.img, v=>{ sl.img=v; }, null));
    $('#maskRow').replaceWith(maskChips(sl.mask, id=>{ sl.mask=id; F.render(); }));
    $('#btnAll').onclick = ()=>{ s.slides.forEach(x=>{ x.img = sl.img; x.mask = sl.mask; }); F.render(); F.toast('Imagem aplicada a todos os slides.'); };
    $('#icRow').replaceWith(iconPicker(s.accentIcon, id=>{ s.accentIcon=id; F.render(); }));
    p.appendChild(iconInsertSection());
  }

  /* =====================================================
     MOTION: TIMELINE / CENA / ESTILO
  ===================================================== */
  function panelTimeline(p){
    const s = F.state;
    p.innerHTML = `
      <div class="field"><span class="lbl">Formato do vídeo</span><span id="fmtRow"></span></div>
      <div class="field"><span class="lbl">Timeline <em style="font-style:normal">${(F.totalDuration()/1000).toFixed(1)}s</em></span>
        <div class="tl" id="tlList"></div>
        <div class="addscene" id="addScene">+ adicionar cena</div>
        <div class="chips" id="sceneTypes" style="display:none"></div></div>
      <div class="note">Cada cena tem duração, transições de entrada e saída e conteúdo próprios. Clique numa cena para editá-la na aba CENA; Play na barra do palco reproduz a timeline inteira.</div>`;
    $('#fmtRow').replaceWith(chipRow(Object.entries(F.FORMATS).map(([k,v])=>[k,v.n]), s.format, id=>{ s.format=id; F.render(); }));
    const list = $('#tlList');
    s.timeline.forEach((sc,i)=>{
      const def = F.scenes.get(sc.type)||{n:sc.type};
      const c = el(`<div class="scard${i===s.curScene?' on':''}">
        <div class="top"><span class="n">${String(i+1).padStart(2,'0')}</span><span class="name">${def.n}</span>
          <span class="mini">
            <button data-a="up" title="subir">↑</button><button data-a="down" title="descer">↓</button>
            <button data-a="del" title="remover">×</button></span></div>
        <div class="cfg">
          <label class="field"><span class="lbl">duração (s)</span>
            <input class="inp" data-a="dur" type="number" min="0.5" max="20" step="0.1" value="${(sc.dur/1000).toFixed(1)}"></label>
          <label class="field"><span class="lbl">entrada</span>
            <select class="inp" data-a="enter">
              ${SCENE_ENTERS.map(([v,n])=>`<option value="${v}" ${(sc.enter||'none')===v?'selected':''}>${n}</option>`).join('')}
            </select></label>
          <label class="field"><span class="lbl">saída</span>
            <select class="inp" data-a="exit">
              ${SCENE_EXITS.map(([v,n])=>`<option value="${v}" ${(sc.exit||'fade')===v?'selected':''}>${n}</option>`).join('')}
            </select></label>
        </div></div>`);
      c.onclick = e=>{
        const a = e.target.dataset.a;
        if(a==='up'){ if(F.moveScene(i, i-1)){ buildPanels(); F.render(); } return; }
        if(a==='down'){ if(F.moveScene(i, i+1)){ buildPanels(); F.render(); } return; }
        if(a==='del'){ if(F.removeScene(i)){ buildPanels(); F.render(); } return; }
        if(a==='dur'||a==='exit'||a==='enter') return;
        s.curScene = i; buildPanels(); F.render(); switchTab('t3');
      };
      c.querySelector('[data-a=dur]').onchange = e=>{ sc.dur = Math.round(parseFloat(e.target.value||2)*1000); buildPanels(); F.render(); };
      c.querySelector('[data-a=exit]').onchange  = e=>{ sc.exit = e.target.value; F.autoSave();
        if(i===s.curScene){ F.render();
          /* mostra a saída escolhida no palco: entrada roda, pausa breve, sai */
          if(sc.exit!=='none'){ const x = sc.exit;
            setTimeout(()=>{ const layer = document.querySelector('#art .scenelayer');
              if(layer && s.timeline[s.curScene]===sc && sc.exit===x){
                layer.classList.add('exiting','exit-'+x);
                setTimeout(()=>{ if(F.state.mode==='motion') F.render(); }, 640);
              }}, 900); } } };
      c.querySelector('[data-a=enter]').onchange = e=>{ sc.enter = e.target.value; F.autoSave(); if(i===s.curScene) F.render(); };
      list.appendChild(c);
    });
    const add = $('#addScene'), types = $('#sceneTypes');
    add.onclick = ()=>{ types.style.display = types.style.display==='none'?'flex':'none';
      if(types.childElementCount) return;
      F.scenes.entries().forEach(([id,def])=>{
        const c = el(`<div class="chip" title="${def.d||''}">${def.n}</div>`);
        c.onclick = ()=>{ s.timeline.push(F.defScene(id)); s.curScene = s.timeline.length-1;
          buildPanels(); F.render(); };
        types.appendChild(c); }); };
  }
  function panelCena(p){
    const s = F.state, sc = s.timeline[s.curScene];
    if(!sc){ p.innerHTML = `<div class="note">Adicione uma cena na aba TIMELINE para editar aqui.</div>`; return; }
    const def = F.scenes.get(sc.type), fields = def.fields||[];
    p.innerHTML = `<div class="lbl">Cena ${s.curScene+1} — ${def.n}</div>`;
    const bind = (key, elm)=>{ elm.querySelector('input,textarea').oninput = e=>{ sc[key] = e.target.value; F.render(false); }; p.appendChild(elm); };
    if(fields.includes('kicker')) bind('kicker', el(`<div class="field"><span class="lbl">Kicker</span><input class="inp" value="${F.esc(sc.kicker)}"></div>`));
    if(fields.includes('title'))  bind('title',  el(`<div class="field"><span class="lbl">Título</span><textarea class="inp">${F.esc(sc.title)}</textarea></div>`));
    if(fields.includes('sub'))    bind('sub',    el(`<div class="field"><span class="lbl">Apoio</span><textarea class="inp">${F.esc(sc.sub)}</textarea></div>`));
    if(fields.includes('items'))  bind('items',  el(`<div class="field"><span class="lbl">Itens (um por linha)</span><textarea class="inp">${F.esc(sc.items)}</textarea></div>`));
    if(fields.includes('value')){
      const w = el(`<div class="row">
        <div class="field"><span class="lbl">Valor</span><input class="inp" type="number" value="${sc.value}"></div>
        <div class="field"><span class="lbl">Sufixo</span><input class="inp" value="${F.esc(sc.suffix)}"></div></div>`);
      const [v,x] = w.querySelectorAll('input');
      v.oninput = e=>{ sc.value = +e.target.value; F.render(false); };
      x.oninput = e=>{ sc.suffix = e.target.value; F.render(false); };
      p.appendChild(w);
    }
    if(fields.includes('cta')) bind('cta', el(`<div class="field"><span class="lbl">CTA</span><input class="inp" value="${F.esc(sc.cta||F.state.cta)}"></div>`));
    if(fields.includes('icon')){
      const w = el(`<div class="field"><span class="lbl">Ícone da cena</span></div>`);
      w.appendChild(iconPicker(sc.icon, id=>{ sc.icon = id; F.render(false); }));
      p.appendChild(w);
    }
    /* imagem é universal: toda cena aceita (cover = fundo com véu; máscara = flutuante) */
    p.appendChild(imageField(()=>sc.img, v=>{ sc.img = v; }, null));
    const mw = el(`<div class="field"><span class="lbl">Encaixe da imagem</span></div>`);
    mw.appendChild(maskChips(sc.mask||'cover', id=>{ sc.mask = id; F.render(); }));
    p.appendChild(mw);
    p.appendChild(el(`<div class="note">Imagem exclusiva desta cena — também aceita arrastar no palco ou colar Ctrl+V. Em <b>Cover</b> vira fundo com véu; nas máscaras entra como elemento flutuante.</div>`));
    p.appendChild(el(`<div class="note">Duração e transições de entrada/saída ficam no cartão da cena, na aba TIMELINE.</div>`));
    p.appendChild(iconInsertSection());
  }
  function panelEstilo(p){
    p.innerHTML = `
      <div class="field"><span class="lbl">Efeitos de acabamento</span><span id="fxRow"></span></div>
      <div class="field"><span class="lbl">Ícone de destaque <em>seleção usada pelos templates — para INSERIR ícones, use COMPOR</em></span><span id="icRow"></span></div>
      <div class="note">Efeitos e ícone padrão valem para todas as cenas. Ícones específicos são definidos por cena na aba CENA.</div>`;
    $('#fxRow').replaceWith(fxChips());
    $('#icRow').replaceWith(iconPicker(F.state.accentIcon, id=>{ F.state.accentIcon = id; F.render(); }));
    p.appendChild(artColorsSection());
  }

  /* =====================================================
     LIB — biblioteca de plugins (templates/cenas do usuário)
  ===================================================== */
  const SAMPLE_TPL = `/* FORMA plugin — template de exemplo
   Salve como .js e envie na aba LIB. Contrato completo no README. */
FORMA.templates.register('meu-template', {
  n: 'Meu template', d: 'Descrição curta que aparece no card.',
  mini: '<rect width="100" height="44" fill="#26262c"/><rect x="8" y="18" width="60" height="8" fill="#5ee6c7"/>',
  render(slide, rng){
    const F = FORMA;
    // slide: {kicker,title,sub,img,mask} — rng(): 0..1 determinístico
    const bg = slide.img && slide.mask==='cover'
      ? F.bgImage(slide.img, 'linear-gradient(180deg,transparent,color-mix(in srgb,var(--b-bg) 85%,transparent))')
      : '<div class="abs" style="inset:0;background:var(--b-bg)"></div>';
    return bg + '<div class="abs" style="inset:0;display:grid;place-items:center;padding:calc(var(--u)*8px)">'
      + '<h1 class="fh" data-anim="letters" style="font-size:calc(var(--u)*8px);font-weight:900;text-align:center">'
      + F.letters(slide.title) + '</h1></div>' + F.fxHTML();
  }
});`;
  const SAMPLE_SCENE = `/* FORMA plugin — cena de exemplo
   fields declarados geram o formulário na aba CENA automaticamente. */
FORMA.scenes.register('minha-cena', {
  n: 'Minha cena', d: 'Descrição curta.', dur: 2600,
  fields: ['title','icon'],
  render(scene){
    const F = FORMA;
    return '<div class="abs" style="inset:0;background:var(--b-bg)"></div>'
      + '<div class="abs" style="inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*3px)">'
      + '<div data-anim="pop" style="color:var(--b-ac);font-size:calc(var(--u)*10px);display:flex">' + F.icon(scene.icon) + '</div>'
      + '<h1 class="fh" data-anim="fade-up" style="--d:.3s;font-size:calc(var(--u)*6px);font-weight:800">' + F.esc(scene.title) + '</h1>'
      + '</div>' + F.fxHTML();
  }
});`;
  function panelLib(p){
    const s = F.state;
    p.innerHTML = `
      <div class="lbl">Plugins instalados <em style="font-style:normal">${(s.plugins||[]).length}</em></div>
      <div class="tl" id="plugList"></div>
      <span id="plugLab"></span>
      <div class="lbl">Modelos para começar</div>
      <div class="row">
        <button class="hbtn" id="btnExTpl" style="justify-content:center">${F.uiIcon('download')} exemplo: template</button>
        <button class="hbtn" id="btnExScene" style="justify-content:center">${F.uiIcon('download')} exemplo: cena</button>
      </div>
      <div class="note">Um plugin é um <b>.js</b> que registra templates, cenas, ícones ou efeitos via <code>FORMA.*.register()</code>. Ao enviar, ele roda na hora, aparece nos painéis e <b>persiste com o projeto</b> (inclusive no backup .json). O README documenta os contratos completos.</div>`;
    const list = $('#plugList');
    (s.plugins||[]).forEach((pl,i)=>{
      const c = el(`<div class="scard"><div class="top"><span class="n">${String(i+1).padStart(2,'0')}</span>
        <span class="name">${F.esc(pl.name)}</span>
        <span class="mini"><button data-a="del" title="remover">×</button></span></div></div>`);
      c.querySelector('[data-a=del]').onclick = ()=>{
        s.plugins.splice(i,1); F.autoSave();
        F.toast('Plugin removido. Recarregue a página para limpar os registros dele.');
        buildPanels();
      };
      list.appendChild(c);
    });
    $('#plugLab').replaceWith(fileLabel('+ enviar plugin .js', '.js,text/javascript',
      f=>readAsText(f, code=>{
        const pl = {name:f.name, code};
        if(F.runPlugin(pl)){
          s.plugins.push(pl); F.autoSave();
          buildPanels(); F.render();
          F.toast('Plugin "'+f.name+'" instalado — templates/cenas novos já disponíveis.');
        }
      })));
    $('#btnExTpl').onclick   = ()=>F.download(new Blob([SAMPLE_TPL],{type:'text/javascript'}),'forje-plugin-template.js');
    $('#btnExScene').onclick = ()=>F.download(new Blob([SAMPLE_SCENE],{type:'text/javascript'}),'forje-plugin-cena.js');
  }


  /* =====================================================
     COMPOR — design system + camada de composição
  ===================================================== */
  function panelCompor(p){
    const key = F.editKey();
    const placed = ((F.state.compose||{})[key]||[]);
    p.innerHTML = `
      <div class="note">Clique para adicionar ao centro ou <b>arraste para o palco</b>. Depois use <b>Editar</b> para mover (arrastar), escalar (A−/A+) e apagar. Tudo persiste por arte e sai nos exports.</div>
      <input class="inp" id="compSearch" placeholder="Buscar componente ou item desta arte…" autocomplete="off">
      <div class="lbl">Componentes</div><div id="compCats"></div>
      <div class="lbl">Inserir texto</div>
      <div class="row" id="compText">
        <button class="hbtn tprev" data-t="title" draggable="true" style="justify-content:center;font-weight:800" title="clique ou arraste para o palco">Aa Título</button>
        <button class="hbtn tprev" data-t="para" draggable="true" style="justify-content:center" title="clique ou arraste para o palco">Aa Parágrafo</button>
        <button class="hbtn tprev" data-t="label" draggable="true" style="justify-content:center;font-family:var(--mono);font-size:10px;letter-spacing:.12em" title="clique ou arraste para o palco">RÓTULO</button>
      </div>
      <div class="lbl">Inserir forma</div>
      <div class="shapewrap" id="compShapes"></div>
      <div class="lbl">Inserir ícone</div><span id="compIcon"></span>
      <div class="row">
        <button class="hbtn" id="compImg" style="justify-content:center">${F.uiIcon('image')} Imagem livre</button>
        <button class="hbtn" id="compLogo" style="justify-content:center">${F.uiIcon('link')} Logo da marca</button>
      </div>
      <div class="lbl">Nesta arte <em style="font-style:normal">${placed.length}</em></div>
      <div class="tl" id="placedList"></div>`;
    /* paleta agrupada por categoria */
    const cats = {};
    F.components.entries().forEach(([id,def])=>{ (cats[def.cat]=cats[def.cat]||[]).push([id,def]); });
    const wrap = $('#compCats');
    Object.entries(cats).forEach(([cat,items])=>{
      const blk = el(`<div class="catblk"><div class="lbl" style="margin-top:8px">${cat}</div><div class="chips"></div></div>`);
      const chips = blk.querySelector('.chips');
      items.forEach(([id,def])=>{
        const c = el(`<div class="chip" draggable="true" title="arraste para o palco">${def.n}</div>`);
        c.dataset.q = (def.n+' '+id+' '+cat).toLowerCase();
        c.onclick = ()=>F.addComposeItem(id, 50, 50);
        c.ondragstart = e=>{ e.dataTransfer.setData('text/forma-comp', id); };
        chips.appendChild(c);
      });
      wrap.appendChild(blk);
    });
    /* texto: presets tipográficos (usam as fontes da marca por padrão) */
    $$('#compText .tprev').forEach(btn=>{
      const t = btn.dataset.t;
      btn.onclick = ()=>F.addComposeItem('__text', 50, 42, textPreset(t));
      btn.ondragstart = e=>e.dataTransfer.setData('text/forma-comp', '__text|'+t);
    });
    /* formas geométricas: biblioteca completa, agrupada por categoria */
    const shWrap = $('#compShapes');
    const shCats = {};
    SHAPES().forEach(([kind, nome, cat, prev])=>{ (shCats[cat] = shCats[cat]||[]).push([kind, nome, prev]); });
    Object.entries(shCats).forEach(([cat, list2])=>{
      const blk = el(`<div class="catblk shcat"><div class="lbl" style="margin-top:6px">${cat}</div><div class="shapegrid"></div></div>`);
      const grid = blk.querySelector('.shapegrid');
      list2.forEach(([kind, nome, prev])=>{
        const b2 = shapeBtn(kind, nome+' — clique ou arraste para o palco', prev, false);
        b2.onclick = ()=>F.addComposeItem('__shape', 50, 46, {props:{kind, fill:F.state.brand.ac}});
        b2.ondragstart = e=>e.dataTransfer.setData('text/forma-comp', '__shape|'+kind);
        grid.appendChild(b2);
      });
      shWrap.appendChild(blk);
    });
    $('#compIcon').replaceWith(iconPicker(null, id=>F.addComposeItem('__icon', 50, 42, {icon:id}), true));
    $('#compImg').onclick = ()=>F.addComposeItem('__img', 50, 50);
    $('#compLogo').onclick = ()=>{ F.addComposeItem('__logo', 50, 14);
      if(!F.state.brand.logo) F.toast('Envie a logo na aba MARCA — o item usa a logo do brandbook.'); };
    $('#compSearch').oninput = e=>{
      const q = e.target.value.trim().toLowerCase();
      $$('#compCats .chip').forEach(ch=>{ ch.style.display = !q || ch.dataset.q.includes(q) ? '' : 'none'; });
      $$('#compCats .catblk').forEach(bl=>{
        const any = [...bl.querySelectorAll('.chip')].some(ch=>ch.style.display!=='none');
        bl.style.display = any ? '' : 'none'; });
      $$('#compShapes .shbtn').forEach(sb=>{ sb.style.display = !q || (sb.dataset.q||'').includes(q) ? '' : 'none'; });
      $$('#compShapes .shcat').forEach(bl=>{
        const any = [...bl.querySelectorAll('.shbtn')].some(sb=>sb.style.display!=='none');
        bl.style.display = any ? '' : 'none'; });
      $$('#placedList .scard').forEach(cd=>{ cd.style.display = !q || (cd.dataset.q||'').includes(q) ? '' : 'none'; });
    };
    const list = $('#placedList');
    const LBL = {cta:'Texto do botão', title:'Título', sub:'Texto', kicker:'Rótulo', icon:'Ícone', url:'Endereço (URL da barra)', value:'Valor', data:'Dados'};
    /* rótulos e dicas específicos por componente: os campos de dados dizem
       exatamente o formato esperado — nada de valor sorteado sem controle */
    const LBL_C = {
      qr:{qrdata:'Conteúdo (URL ou texto)', sub:'Legenda'},
      barcode:{title:'Código (números e/ou texto)'},
      'chart-bars':{data:'Dados (Rótulo | valor por linha)'},
      'chart-line':{data:'Dados (números por vírgula ou linha)'},
      sparkline:{data:'Dados (números por vírgula ou linha)', title:'Valor em destaque', sub:'Legenda'},
      'chart-pie':{kicker:'Fatia 1 (Rótulo | valor)', title:'Fatia 2 (Rótulo | valor)', sub:'Fatia 3 (Rótulo | valor)'},
      'chart-cols':{sub:'Linhas (Rótulo | valor 0–100)'},
      compare:{kicker:'Antes (Rótulo | valor)', sub:'Depois (Rótulo | valor)'},
      heatgrid:{data:'Intensidades 0–100 (opcional)', sub:'Legenda'},
      table:{thead:'Cabeçalho (colunas com | )', trows:'Linhas (colunas com | )'},
      gauge:{value:'Valor (0–100)'}, 'chart-donut':{value:'Valor (0–100)'}, progress:{value:'Valor (0–100)'},
    };
    const PH_C = {
      qr:{qrdata:'https://forjelo.com'},
      barcode:{title:'0072026400018'},
      'chart-bars':{data:'Jan | 12\nFev | 30\nMar | 22'},
      'chart-line':{data:'12, 18, 9, 30, 26'},
      sparkline:{data:'4, 9, 6, 14, 12, 21'},
      'chart-pie':{kicker:'Orgânico | 44', title:'Pago | 35', sub:'Indicação | 21'},
      'chart-cols':{sub:'Instagram | 62\nYouTube | 48\nLinkedIn | 31'},
      compare:{kicker:'Antes | 22', sub:'Depois | 86'},
      heatgrid:{data:'80 12 55 90 5 …'},
      table:{thead:'PLANO | PREÇO | NÍVEL', trows:'Starter | R$ 29 | ✓\nPro | R$ 79 | ✓✓'},
    };
    placed.forEach((it,i)=>{
      const def = F.components.get(it.comp);
      const nm = it.comp==='__icon' ? 'Ícone' : it.comp==='__img' ? 'Imagem' : it.comp==='__logo' ? 'Logo' : it.comp==='__text' ? 'Texto' : it.comp==='__shape' ? ('Forma · '+F.shapeName((it.props||{}).kind)) : (def?def.n:it.comp);
      const c = el(`<div class="scard${it.min?' min':''}" data-cid="${it.id}"><div class="top" title="clique para ${it.min?'expandir':'minimizar'}"><span class="n">${String(i+1).padStart(2,'0')}</span>
        <span class="name">${nm}</span>
        <span class="mini">
          <button data-a="min" title="minimizar/expandir">${F.uiIcon('chev')}</button>
          <button data-a="del" title="remover item">${F.uiIcon('trash')}</button>
        </span></div></div>`);
      c.dataset.q = (nm+' '+it.comp).toLowerCase();
      const toggleMin = ()=>{ it.min = !it.min; c.classList.toggle('min', it.min); F.autoSave(); };
      c.querySelector('[data-a=min]').onclick = e=>{ e.stopPropagation(); toggleMin(); };
      c.querySelector('.top').onclick = e=>{ if(!e.target.closest('button')) toggleMin(); };
      c.querySelector('[data-a=del]').onclick = e=>{ e.stopPropagation(); F.removeComposeItem(key, it.id); buildPanels(); };
      /* formulário: campos declarados pelo componente (ou ícone do item __icon) */
      it.props = it.props || {};
      const fields = it.comp==='__icon' ? ['__itemicon'] : ((def&&def.fields)||[]);
      fields.forEach(fk=>{
        if(fk==='icon' || fk==='__itemicon'){
          const sel = el(`<select class="inp" style="font-size:12px"></select>`);
          F.icons.entries().forEach(([iid,ic])=>sel.appendChild(el(`<option value="${iid}">${ic.n}</option>`)));
          sel.value = fk==='__itemicon' ? (it.icon||'spark') : (it.props.icon || '');
          if(fk==='icon' && !it.props.icon) sel.insertBefore(el(`<option value="" selected>— do slide/cena —</option>`), sel.firstChild);
          sel.onchange = ()=>{ if(fk==='__itemicon') it.icon = sel.value; else it.props.icon = sel.value || undefined;
            F.autoSave(); F.render(false); };
          const w = el(`<label class="field"><span class="lbl">Ícone</span></label>`); w.appendChild(sel); c.appendChild(w);
        } else {
          const multi = fk==='sub' || fk==='data' || fk==='trows';
          const lbl = (LBL_C[it.comp]||{})[fk] || LBL[fk] || fk;
          const w = el(`<label class="field"><span class="lbl">${lbl}</span>
            ${multi?`<textarea class="inp" style="font-size:12px;min-height:44px"></textarea>`
                   :`<input class="inp" style="font-size:12px">`}</label>`);
          const inp = w.querySelector('input,textarea');
          inp.value = it.props[fk] ?? '';
          inp.placeholder = (PH_C[it.comp]||{})[fk] || (['data','qrdata','thead','trows'].includes(fk) ? '' : 'herda do conteúdo');
          inp.oninput = ()=>{ const v = inp.value;
            if(v==='') delete it.props[fk]; else it.props[fk] = v;
            F.autoSave(); F.render(false); };
          c.appendChild(w);
        }
      });
      if(!fields.length && !['__img','__text','__shape'].includes(it.comp))
        c.appendChild(el(`<div class="note" style="font-size:10.5px">Conteúdo gerado pelo seed — reposicione/escale com Editar.</div>`));

      /* mockup que acopla imagem (ex.: Janela de navegador): upload de
         imagem PRÓPRIA + ajuste do enquadramento dentro do mockup */
      if(def && def.imgSlot){
        c.appendChild(imageField(()=>it.props.img,
          v=>{ if(v) it.props.img = v; else delete it.props.img; F.autoSave(); },
          it.props.img ? null : 'Sem imagem própria, o mockup usa a imagem do slide/cena (se houver). Enviando aqui, ela vale só para este item.'));
        const fw = el(`<div class="field"><span class="lbl">Encaixe da imagem no mockup</span></div>`);
        fw.appendChild(chipRow([['cover','Cobrir'],['contain','Conter']], it.props.imgfit||'cover',
          v=>{ if(v==='cover') delete it.props.imgfit; else it.props.imgfit = v; F.autoSave(); F.render(false); }));
        c.appendChild(fw);
        const slider = (lbl, key, min, max, step, defv, show)=>{
          const w = el(`<label class="field"><span class="lbl">${lbl}</span>
            <div class="range"><input type="range" min="${min}" max="${max}" step="${step}"
              value="${it.props[key]!=null ? it.props[key] : defv}"><output></output></div></label>`);
          const inp = w.querySelector('input'), out = w.querySelector('output');
          out.textContent = show(+inp.value);
          inp.oninput = e=>{ const v = +e.target.value;
            if(v===defv) delete it.props[key]; else it.props[key] = v;
            out.textContent = show(v); F.autoSave(); liveRender(); };
          return w;
        };
        const posRow = el(`<div class="row"></div>`);
        posRow.append(
          slider('Posição horiz.', 'imgx', 0, 100, 1, 50, v=>v+'%'),
          slider('Posição vert.',  'imgy', 0, 100, 1, 50, v=>v+'%'));
        c.appendChild(posRow);
        c.appendChild(slider('Zoom da imagem', 'imgzoom', 1, 3, 0.05, 1, v=>'×'+v.toFixed(2)));
      }

      /* logo da marca: largura própria */
      if(it.comp==='__logo'){
        const wl = el(`<label class="field"><span class="lbl">Largura da logo</span>
          <div class="range"><input type="range" min="6" max="46" step="1" value="${it.size||16}"><output>${it.size||16}u</output></div></label>`);
        const li = wl.querySelector('input'), lo = wl.querySelector('output');
        li.oninput = e=>{ it.size = +e.target.value; lo.textContent = it.size+'u'; F.autoSave(); F.render(false); };
        c.appendChild(wl);
        if(!F.state.brand.logo) c.appendChild(el(`<div class="note" style="font-size:10.5px">Sem logo no brandbook ainda — envie na aba MARCA.</div>`));
      }

      /* imagem de composição: arquivo PRÓPRIO (não mexe no cover do slide/cena) */
      if(it.comp==='__img'){
        c.appendChild(imageField(()=>it.src, v=>{ if(v) it.src = v; else delete it.src; F.autoSave(); },
          it.src ? null : 'Sem imagem própria, o item usa a imagem do slide/cena (se houver). Enviando aqui, ela vale só para esta composição — o cover fica livre para outra imagem.'));
        const mw = el(`<div class="field"><span class="lbl">Encaixe deste item</span></div>`);
        mw.appendChild(chipRow([['window','Janela'],['circle','Círculo'],['blob','Blob'],['arch','Arco']],
          it.mask||'window', id=>{ it.mask = id; F.autoSave(); F.render(false); }));
        c.appendChild(mw);
      }

      /* ícone: cor, tamanho e forma */
      /* ---- formulário do TEXTO livre ---- */
      if(it.comp==='__text'){
        const p = it.props;
        const live = ()=>{ F.autoSave(); liveRender(); };
        const wt2 = el(`<label class="field"><span class="lbl">Texto</span>
          <textarea class="inp" style="font-size:12px;min-height:56px"></textarea></label>`);
        const ta = wt2.querySelector('textarea'); ta.value = p.text||'';
        ta.oninput = ()=>{ p.text = ta.value; live(); };
        c.appendChild(wt2);
        /* fonte: papéis da marca + catálogo + custom do brandbook */
        const wf = el(`<label class="field"><span class="lbl">Fonte</span></label>`);
        const sf = el(`<select class="inp" style="font-size:12px"></select>`);
        sf.appendChild(el(`<option value="__display">★ Display da marca</option>`));
        sf.appendChild(el(`<option value="__body">★ Corpo da marca</option>`));
        sf.appendChild(el(`<option value="__mono">★ Mono</option>`));
        F.fonts.entries().forEach(([fid,f])=>sf.appendChild(el(`<option value="${fid}">${f.n}</option>`)));
        (F.state.brand.customFonts||[]).forEach(cf=>sf.appendChild(el(`<option value="custom:${cf.name}">★ ${cf.name} (sua)</option>`)));
        sf.value = p.font||'__display';
        sf.onchange = ()=>{ p.font = sf.value; F.autoSave(); F.render(false); };
        wf.appendChild(sf); c.appendChild(wf);
        const row1 = el(`<div class="row"></div>`);
        const mkSl = (lbl,key,min,max,step,defv,fmt)=>{
          const w = el(`<label class="field"><span class="lbl">${lbl}</span>
            <div class="range"><input type="range" min="${min}" max="${max}" step="${step}" value="${p[key]!=null?p[key]:defv}"><output></output></div></label>`);
          const i2 = w.querySelector('input'), o2 = w.querySelector('output');
          o2.textContent = fmt(+i2.value);
          i2.oninput = e2=>{ p[key] = +e2.target.value; o2.textContent = fmt(+e2.target.value); live(); };
          return w; };
        row1.append(mkSl('Tamanho','size',1.4,26,0.2,6,v=>v+'u'));
        const ww2 = el(`<label class="field"><span class="lbl">Peso</span></label>`);
        const sw2 = el(`<select class="inp" style="font-size:12px"></select>`);
        [[300,'Light 300'],[400,'Regular 400'],[500,'Medium 500'],[600,'Semi 600'],[700,'Bold 700'],[800,'Extra 800'],[900,'Black 900']]
          .forEach(([v,n])=>sw2.appendChild(el(`<option value="${v}">${n}</option>`)));
        sw2.value = p.weight||700;
        sw2.onchange = ()=>{ p.weight = +sw2.value; F.autoSave(); F.render(false); };
        ww2.appendChild(sw2); row1.appendChild(ww2); c.appendChild(row1);
        const wal = el(`<div class="field"><span class="lbl">Alinhamento</span></div>`);
        wal.appendChild(chipRow([['left','Esq.'],['center','Centro'],['right','Dir.'],['justify','Justif.']],
          p.align||'left', v=>{ p.align = v; F.autoSave(); F.render(false); }));
        c.appendChild(wal);
        const wst = el(`<div class="field"><span class="lbl">Estilo</span></div>`);
        const stRow = el(`<div class="chips"></div>`);
        const mkTg = (lbl,key)=>{
          const ch = el(`<div class="chip${p[key]?' on':''}">${lbl}</div>`);
          ch.onclick = ()=>{ p[key] = p[key]?0:1; ch.classList.toggle('on', !!p[key]); F.autoSave(); F.render(false); };
          return ch; };
        stRow.append(mkTg('CAIXA ALTA','upper'), mkTg('Itálico','italic'));
        wst.appendChild(stRow); c.appendChild(wst);
        const row2 = el(`<div class="row"></div>`);
        row2.append(mkSl('Entrelinha','lh',0.85,2,0.05,1.15,v=>'×'+v.toFixed(2)),
                    mkSl('Tracking','ls',-0.05,0.35,0.01,0,v=>v.toFixed(2)+'em'));
        c.appendChild(row2);
      }

      /* ---- formulário da FORMA geométrica ---- */
      if(it.comp==='__shape'){
        const p = it.props;
        const live = ()=>{ F.autoSave(); liveRender(); };
        const wk = el(`<div class="field"><span class="lbl">Forma · ${F.shapeName(p.kind||'rect')}</span><div class="shapewrap" style="max-height:180px"><div class="shapegrid"></div></div></div>`);
        const wkGrid = wk.querySelector('.shapegrid');
        SHAPES().forEach(([kind, nome,, prev])=>{
          const sb = shapeBtn(kind, nome, prev, (p.kind||'rect')===kind);
          sb.draggable = false;
          sb.onclick = ()=>{ p.kind = kind; F.autoSave(); F.render(false); buildPanels(); };
          wkGrid.appendChild(sb);
        });
        c.appendChild(wk);
        const mkSl = (lbl,key,min,max,step,defv,fmt)=>{
          const w = el(`<label class="field"><span class="lbl">${lbl}</span>
            <div class="range"><input type="range" min="${min}" max="${max}" step="${step}" value="${p[key]!=null?p[key]:defv}"><output></output></div></label>`);
          const i2 = w.querySelector('input'), o2 = w.querySelector('output');
          o2.textContent = fmt(+i2.value);
          i2.oninput = e2=>{ p[key] = +e2.target.value; o2.textContent = fmt(+e2.target.value); live(); };
          return w; };
        const rowD = el(`<div class="row"></div>`);
        rowD.append(mkSl('Largura','sw',1,96,1,16,v=>v+'u'), mkSl('Altura','sh',0.5,96,0.5,16,v=>v+'u'));
        c.appendChild(rowD);
        const rowF = el(`<div class="row" style="align-items:flex-end"></div>`);
        const wfc = el(`<label class="field" style="flex:0 0 84px"><span class="lbl">Cor</span>
          <input type="color" class="inp" style="height:36px;padding:3px" value="${p.fill||'#F5620F'}"></label>`);
        wfc.querySelector('input').oninput = e2=>{ p.fill = e2.target.value; live(); };
        const wnf = el(`<div class="field" style="flex:1"><span class="lbl">Preenchimento</span></div>`);
        wnf.appendChild(chipRow([['fill','Cheio'],['none','Só contorno']], p.nofill?'none':'fill',
          v=>{ if(v==='none'){ p.nofill = 1; if(!p.bw) p.bw = 0.5; } else delete p.nofill;
            F.autoSave(); F.render(false); }));
        rowF.append(wfc, wnf); c.appendChild(rowF);
        c.appendChild(mkSl('Opacidade','op',5,100,1,100,v=>v+'%'));
        const rowB = el(`<div class="row" style="align-items:flex-end"></div>`);
        rowB.append(mkSl('Raio das bordas','rad',0,24,0.5,0,v=>v+'u'),
                    mkSl('Contorno','bw',0,4,0.1,0,v=>v?v.toFixed(1)+'u':'sem'));
        c.appendChild(rowB);
        const rowB2 = el(`<div class="row" style="align-items:flex-end"></div>`);
        const wbc = el(`<label class="field" style="flex:0 0 84px"><span class="lbl">Cor do contorno</span>
          <input type="color" class="inp" style="height:36px;padding:3px" value="${p.bc||p.fill||'#F5620F'}"></label>`);
        wbc.querySelector('input').oninput = e2=>{ p.bc = e2.target.value; live(); };
        rowB2.append(wbc, mkSl('Rotação','rot',0,360,1,0,v=>v+'°'));
        c.appendChild(rowB2);
        c.appendChild(el(`<div class="note" style="font-size:10.5px">Triângulo e estrela usam recorte — o contorno não se aplica a eles. Raio vale para retângulo.</div>`));
      }

      if(it.comp==='__icon'){
        const row = el(`<div class="row"></div>`);
        const wc = el(`<label class="field"><span class="lbl">Cor</span></label>`);
        const selC = el(`<select class="inp" style="font-size:12px"></select>`);
        ICON_COLORS.forEach(([v,n])=>selC.appendChild(el(`<option value="${v}">${n}</option>`)));
        selC.value = it.color||'ac';
        selC.onchange = ()=>{ it.color = selC.value; F.autoSave(); F.render(false); };
        wc.appendChild(selC);
        const ws = el(`<label class="field"><span class="lbl">Tamanho</span>
          <input class="inp" type="range" min="2" max="18" step="0.5" value="${it.size||6}"></label>`);
        ws.querySelector('input').oninput = e=>{ it.size = +e.target.value; F.autoSave(); liveRender(); };
        row.append(wc, ws); c.appendChild(row);
        const wsh = el(`<label class="field"><span class="lbl">Forma</span></label>`);
        wsh.appendChild(chipRow([['plain','Solto'],['chip','Círculo'],['tile','Quadro']], it.shape||'plain',
          v=>{ it.shape = v; F.autoSave(); F.render(false); }));
        c.appendChild(wsh);
      }

      /* motion do item: entrada + atraso + saída (a saída toca no fim da cena, no vídeo) */
      const mrow = el(`<div class="row"></div>`);
      const wa = el(`<label class="field"><span class="lbl">Entrada</span></label>`);
      const selA = el(`<select class="inp" style="font-size:12px"></select>`);
      selA.appendChild(el(`<option value="">Pop (padrão)</option>`));
      selA.appendChild(el(`<option value="none">— sem animação —</option>`));
      F.anims.entries().forEach(([aid,ad])=>{
        if(aid==='pop' || aid==='letters') return;    // letters exige marcação .ltr; draw funciona em ícones/SVGs
        selA.appendChild(el(`<option value="${aid}">${ad.n}${ad.kind==='loop'?' ∞':''}</option>`)); });
      selA.value = it.anim && it.anim!=='pop' ? it.anim : '';
      selA.onchange = ()=>{ if(selA.value==='') delete it.anim; else it.anim = selA.value;
        F.autoSave(); F.render(); };
      wa.appendChild(selA);
      const wd = el(`<label class="field"><span class="lbl">Atraso (s)</span>
        <input class="inp" type="number" min="0" max="8" step="0.1" style="font-size:12px" value="${it.d!=null?it.d:0.2}"></label>`);
      wd.querySelector('input').onchange = e=>{ it.d = Math.max(0, +e.target.value||0); F.autoSave(); F.render(); };
      mrow.append(wa, wd); c.appendChild(mrow);
      const wx = el(`<label class="field"><span class="lbl">Saída (fim da cena — vale no vídeo)</span></label>`);
      const selX = el(`<select class="inp" style="font-size:12px"></select>`);
      ITEM_EXITS.forEach(([v,n])=>selX.appendChild(el(`<option value="${v}">${n}</option>`)));
      selX.value = it.xanim||'';
      selX.onchange = ()=>{ if(selX.value==='') delete it.xanim; else it.xanim = selX.value;
        F.autoSave(); F.render(false); };
      wx.appendChild(selX); c.appendChild(wx);

      /* cor do item (componentes; o ícone tem controle próprio acima) */
      if(!['__icon','__img','__logo','__shape'].includes(it.comp)){
        const wc = el(`<label class="field"><span class="lbl">Cor do item</span>
          <div class="row" style="align-items:center">
            <input type="color" class="inp" style="height:36px;padding:3px;flex:0 0 64px" value="${it.c||'#FB923C'}">
            <span class="note" style="flex:1;border:none;padding:0">${it.c?'cor própria aplicada':'herda os tokens da marca'}</span>
            <button class="hbtn" style="flex:0 0 auto;padding:6px 10px" title="voltar às cores da marca">×</button>
          </div></label>`);
        wc.querySelector('input').oninput = e=>{ it.c = e.target.value; F.autoSave(); F.render(false); };
        wc.querySelector('button').onclick = ()=>{ delete it.c; F.autoSave(); F.render(); buildPanels(); };
        c.appendChild(wc);
      }

      /* largura do box: o texto preenche a lateral e cresce para baixo */
      const ww = el(`<label class="field"><span class="lbl">Largura do box</span>
        <div class="range"><input type="range" min="0" max="96" step="2" value="${it.w||0}"><output>${it.w?it.w+'%':'auto'}</output></div></label>`);
      const wi = ww.querySelector('input'), wo = ww.querySelector('output');
      wi.oninput = e=>{ const v = +e.target.value;
        if(!v) delete it.w; else it.w = v;
        wo.textContent = v ? v+'%' : 'auto';
        F.autoSave(); liveRender(); };
      c.appendChild(ww);
      /* corpo colapsável: tudo exceto o cabeçalho */
      const body = el(`<div class="cbody"></div>`);
      [...c.children].forEach(ch=>{ if(!ch.classList.contains('top')) body.appendChild(ch); });
      c.appendChild(body);
      list.appendChild(c);
    });
  }
  /* selecionar um item composto no palco abre o formulário dele aqui */
  F.ui = F.ui || {};
  F.ui.focusComposeItem = function(cid){
    switchTab('t5');
    const card = document.querySelector(`#placedList [data-cid="${cid}"]`);
    if(card){ card.scrollIntoView({block:'center', behavior:'smooth'});
      card.classList.add('flash'); setTimeout(()=>card.classList.remove('flash'), 1200); }
  };

  /* =====================================================
     ABAS + STAGEBAR + HEADER
  ===================================================== */
  /* EDITAR: as ferramentas de edição (#editTools) moram no sidebar —
     sem sobrepor a prancheta no palco, no desktop e no mobile.
     O nó original é MOVIDO (não duplicado): ids e handlers do
     ui/editor.js continuam valendo 1:1. */
  function panelEditar(p){
    const tools = F.ui._edTools || document.getElementById('editTools');
    if(tools) F.ui._edTools = tools;
    const on = !!(F.editor && F.editor.on);
    const head = el(`<div class="field"><span class="lbl">Modo edição <em>${on?'ativo':'inativo'}</em></span>
      <button class="hbtn" style="justify-content:center">${on?'Desativar modo edição':'Ativar modo edição'}</button>
      <div class="note">Clique num elemento da prancheta para selecionar (repita para pegar o de baixo); arraste para mover; use as <b>alças do box</b> para dimensionar com precisão; arraste no fundo para selecionar vários. As ferramentas abaixo e o rodapé do palco valem para a seleção.</div></div>`);
    head.querySelector('button').onclick = ()=>{
      const b = $('#btnEdit'); if(b) b.click();
      F.ui.refreshActive();
    };
    p.appendChild(head);
    if(tools){ tools.hidden = !on; p.appendChild(tools); }
  }

  const TABS = {
    design:[['t1','MARCA',panelBrand],['t2','FORMATO',panelFormato],['t3','CONTEÚDO',panelConteudo],['t4','IMAGEM',panelImagem],['t5','COMPOR',panelCompor],['t7','EDITAR',panelEditar],['t6','LIB',panelLib]],
    motion:[['t1','MARCA',panelBrand],['t2','TIMELINE',panelTimeline],['t3','CENA',panelCena],['t4','ESTILO',panelEstilo],['t5','COMPOR',panelCompor],['t7','EDITAR',panelEditar],['t6','LIB',panelLib]],
  };
  let activeTab = 't2';
  function switchTab(id){
    activeTab = id;
    $$('.tab').forEach(t=>t.classList.toggle('on', t.dataset.t===id));
    $$('.panel').forEach(p=>p.classList.toggle('on', p.dataset.p===id));
    const at = document.querySelector(`.tab[data-t="${id}"]`);
    if(at && at.scrollIntoView) at.scrollIntoView({inline:'center', block:'nearest', behavior:'smooth'});
    /* reconstruir o painel ao ativar: conteúdo sempre reflete o estado atual
       (slides, cenas e itens compostos mudam fora da aba) */
    const def = TABS[F.state.mode].find(d=>d[0]===id);
    const panel = document.querySelector(`.panel[data-p="${id}"]`);
    if(def && panel){ panel.innerHTML=''; def[2](panel); }
  }
  F.ui = F.ui || {};
  F.ui.refreshActive = ()=>switchTab(activeTab);
  function buildPanels(){
    const defs = TABS[F.state.mode];
    const tabs = $('#tabs'), wrap = $('#panels');
    tabs.innerHTML = ''; wrap.innerHTML = '';
    defs.forEach(([id,n,fn])=>{
      const t = el(`<div class="tab${id===activeTab?' on':''}" data-t="${id}">${n}</div>`);
      t.onclick = ()=>switchTab(id);
      tabs.appendChild(t);
      const p = el(`<div class="panel${id===activeTab?' on':''}" data-p="${id}"></div>`);
      wrap.appendChild(p);
      fn(p);
    });
    syncTabArrows();
  }
  /* carrossel de abas: setas grandes avançam/retornam a faixa */
  function syncTabArrows(){
    const tabs = $('#tabs'), prev = $('#tabPrev'), next = $('#tabNext');
    if(!tabs || !prev || !next) return;
    const upd = ()=>{
      const max = tabs.scrollWidth - tabs.clientWidth;
      prev.disabled = tabs.scrollLeft <= 2;
      next.disabled = tabs.scrollLeft >= max - 2;
      const off = max <= 2;                      // tudo cabe: setas somem
      prev.style.display = next.style.display = off ? 'none' : 'grid';
    };
    const step = ()=>Math.max(96, Math.round(tabs.clientWidth*0.6));
    prev.onclick = ()=>tabs.scrollBy({left:-step(), behavior:'smooth'});
    next.onclick = ()=>tabs.scrollBy({left: step(), behavior:'smooth'});
    tabs.onscroll = upd;
    if(!syncTabArrows._ro && window.ResizeObserver){
      syncTabArrows._ro = new ResizeObserver(upd); syncTabArrows._ro.observe(tabs);
    }
    upd();
  }
  F.ui.buildPanels = buildPanels;
  F.ui.switchTab = switchTab;

  F.ui.syncStagebar = function(){
    const s = F.state, fmt = F.FORMATS[s.format];
    $('#fmtLabel').textContent = fmt.n + (s.mode==='design' && s.slides.length>1 ? ' · carrossel' : '');
    $('#dimLabel').textContent = `— ${fmt.w}×${fmt.h}px`;
    $('#seedLabel').textContent = s.mode==='design'
      ? `seed ${s.seed} · ${(F.templates.get(s.tpl)||{}).n||''}`
      : `${s.timeline.length} cenas · ${(F.totalDuration()/1000).toFixed(1)}s`;
    $('#motionCtl').style.display = s.mode==='motion' ? 'flex' : 'none';
    $('#btnRandom').style.display = s.mode==='design' ? '' : 'none';
    /* header do palco agora abre a GRADE (v. boards.js) — rótulo fixo */
    F.ui.syncNav();
  };

  /* =====================================================
     NAVEGADOR DE SLIDES/CENAS NO PALCO
     Grid rolável com miniaturas REAIS (mesmo pipeline de
     render: template/cena + composição + edições + cores
     por arte). Clicar numa miniatura seleciona o slide ou
     a cena para manuseio em TODOS os menus — sem precisar
     voltar a CONTEÚDO/TIMELINE.
  ===================================================== */
  let navT = null;
  F.ui.syncNav = function(){
    const nav = $('#stageNav');
    if(!nav || nav.hidden) return;
    clearTimeout(navT); navT = setTimeout(buildNav, 80);   // debounce: render dispara com frequência
  };
  function navArtHTML(i){
    /* HTML da arte do índice i — cur/curScene entram temporariamente no
       lugar para o contexto da composição (herança de textos/imagem) */
    const s = F.state, keepC = s.cur, keepS = s.curScene;
    let html = '';
    try{
      if(s.mode==='design'){
        s.cur = i;
        const r = F.rngOf((F.seedOf ? F.seedOf('layout') : s.seed)*7919 + (F.artOff ? F.artOff(i) : i*101));
        html = (F.templates.get((s.slides[i]||{}).tpl || s.tpl)||F.templates.get('manifesto')).render(s.slides[i], r)
             + (F.composeHTML ? F.composeHTML(F.editKey()) : '');
      } else {
        s.curScene = i;
        const sc = s.timeline[i], def = F.scenes.get(sc.type);
        html = (def ? def.render(sc, F.sceneRng ? F.sceneRng(i) : undefined) : '')   /* fase 1.3 */
             + (F.composeHTML ? F.composeHTML(F.motionKey(i)) : '');
      }
    }catch(err){ console.warn('miniatura falhou:', err); }
    finally{ s.cur = keepC; s.curScene = keepS; }
    return html;
  }
  function buildNav(){
    const nav = $('#stageNav'), grid = $('#snGrid');
    if(!nav || nav.hidden || !grid) return;
    const s = F.state, design = s.mode==='design';
    $('#snTitle').textContent = design ? 'SLIDES' : 'CENAS';
    $('#snAdd').title = design ? 'adicionar slide' : 'adicionar cena (escolha o tipo na aba TIMELINE)';
    grid.innerHTML = '';
    const n = design ? s.slides.length : s.timeline.length;
    if(!n){
      grid.appendChild(el(`<div class="note" style="border:none;padding:4px 2px">Adicione cenas na aba TIMELINE — elas aparecem aqui como miniaturas selecionáveis.</div>`));
      return;
    }
    const fmt = F.FORMATS[s.format], TW = 150, k = TW/fmt.w;
    const cur = design ? s.cur : s.curScene;
    for(let i=0; i<n; i++){
      const name = design
        ? (((s.slides[i].title||'').split('\n')[0].trim().slice(0,22)) || 'Slide '+(i+1))
        : (((F.scenes.get(s.timeline[i].type)||{}).n) || s.timeline[i].type);
      const meta = design
        ? (s.slides[i].img ? 'img' : '')
        : ((+s.timeline[i].dur/1000||2).toFixed(1)+'s');
      const canDel = design ? n>1 : true;
      const card = el(`<div class="sncard${i===cur?' on':''}" title="selecionar ${design?'slide':'cena'} ${i+1} para edição em todas as abas">
        <div class="snthumb" style="height:${Math.round(fmt.h*k)}px"></div>
        <div class="snmeta"><span class="n">${String(i+1).padStart(2,'0')}</span><span class="nm">${F.esc(name)}</span><span class="mx">${meta}</span>
          <span class="snact">
            <button data-a="up" title="mover para cima"${i===0?' disabled':''}>↑</button>
            <button data-a="down" title="mover para baixo"${i===n-1?' disabled':''}>↓</button>
            <button data-a="del" title="remover ${design?'slide':'cena'} ${i+1}"${canDel?'':' disabled'}>×</button>
          </span></div></div>`);
      const a = document.createElement('div');
      a.className = 'art thumbart';
      a.setAttribute('style', F.artVarsFor(i) + `transform:scale(${k})`);
      a.innerHTML = navArtHTML(i);
      card.querySelector('.snthumb').appendChild(a);
      const key = design ? `d|${s.tpl}|${i}|${s.seed}` : F.motionKey(i);
      if(F.applyEditsIn) F.applyEditsIn(a, key);
      if(!design && F.updateCounters) F.updateCounters(a, 99999);
      card.onclick = e=>{
        const act = e.target.closest('[data-a]');
        if(act){
          e.stopPropagation();
          const dir = act.dataset.a;
          let ok = false;
          if(dir==='up')   ok = design ? F.moveSlide(i, i-1)  : F.moveScene(i, i-1);
          if(dir==='down') ok = design ? F.moveSlide(i, i+1)  : F.moveScene(i, i+1);
          if(dir==='del'){ ok = design ? F.removeSlide(i)     : F.removeScene(i);
            if(ok) F.toast((design?'Slide ':'Cena ')+(i+1)+' removid'+(design?'o':'a')+' — composições e cores dos demais preservadas.'); }
          if(ok){ F.render(); F.ui.refreshActive(); }
          return;
        }
        if(design) s.cur = i; else s.curScene = i;
        F.render(); F.ui.refreshActive();
      };
      grid.appendChild(card);
    }
  }

  F.ui.init = function(){
    /* modo */
    $('#segDesign').onclick = ()=>setMode('design');
    $('#segMotion').onclick = ()=>setMode('motion');
    function setMode(m){
      F.state.mode = m;
      $('#segDesign').classList.toggle('on', m==='design');
      $('#segMotion').classList.toggle('on', m==='motion');
      if(m==='motion' && !F.state.timeline.length){
        F.state.timeline = [F.defScene('intro'), F.defScene('statement'), F.defScene('outro')];
        const st = F.state.timeline[1], sl = F.state.slides[0];
        st.kicker = sl.kicker; st.title = sl.title; st.sub = sl.sub;
      }
      activeTab = 't2';
      buildPanels(); F.render();
    }
    /* header */
    $('#btnReplay').onclick = ()=>{ if(F.state.mode==='motion') playTL(); else F.replayMotion(); };
    $('#btnRandom').onclick = ()=>{ F.state.seed = Math.floor(Math.random()*99999); F.render(); };
    /* ---- dropdown Exportar: agrupa saídas e imports sem poluir o header ---- */
    const ddWrap = $('#ddExport'), ddMenu = ddWrap.querySelector('.ddmenu');
    const ddClose = ()=>{ ddMenu.hidden = true; ddWrap.classList.remove('open'); };
    $('#btnExpMenu').onclick = e=>{ e.stopPropagation();
      ddMenu.hidden = !ddMenu.hidden; ddWrap.classList.toggle('open', !ddMenu.hidden); };
    document.addEventListener('click', e=>{ if(!ddWrap.contains(e.target)) ddClose(); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') ddClose(); });
    const ddAct = (id, fn)=>{ $(id).onclick = ()=>{ ddClose(); fn(); }; };
    ddAct('#btnPNG',  ()=>F.exportRaster('png'));
    /* Eixo 3 · fase 3.2 — checklist de formatos dentro do dropdown */
    F.ui._fmtSel = F.ui._fmtSel || Object.keys(F.FORMATS).filter(k=>!F.FORMATS[k].doc);
    const fmtBox = $('#ddFmts');
    function buildFmtBox(){
      fmtBox.innerHTML = Object.entries(F.FORMATS).filter(([k,v])=>!v.doc).map(([k,v])=>
        `<label class="lbl" style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:2px 0">
           <input type="checkbox" data-fk="${k}" ${F.ui._fmtSel.indexOf(k)>=0?'checked':''}>
           ${v.n} <em style="opacity:.55">${v.w}×${v.h}</em></label>`).join('')
        + `<button class="hbtn" id="btnFmtGo" style="justify-content:center;width:100%;margin-top:6px">Exportar PNG dos formatos marcados</button>`;
      fmtBox.querySelectorAll('input[data-fk]').forEach(cb=>{ cb.onchange = ()=>{
        F.ui._fmtSel = [...fmtBox.querySelectorAll('input[data-fk]:checked')].map(x=>x.dataset.fk); }; });
      fmtBox.querySelector('#btnFmtGo').onclick = ()=>{ ddClose(); F.exportFormats(F.ui._fmtSel, 'png'); };
    }
    $('#btnPNGAll').onclick = e=>{ e.stopPropagation();
      if(fmtBox.hidden) buildFmtBox();
      fmtBox.hidden = !fmtBox.hidden; };
    ddAct('#btnJPG',  ()=>F.exportRaster('jpeg'));
    ddAct('#btnPDF',  ()=>F.exportPDF());
    ddAct('#btnPPTX', ()=>F.exportPPTX());
    ddAct('#btnHTML', ()=>F.exportHTML());
    ddAct('#btnVideo',()=>F.exportVideo());
    ddAct('#btnBackupJSON', ()=>F.download(new Blob([F.exportJSON()],{type:'application/json'}),'forje-brandbook.json'));
    $('#ddImpJSON input').onchange = e=>{ const f = e.target.files[0]; ddClose(); if(!f) return;
      readAsText(f, async txt=>{ try{ F.importJSON(txt); await F.loadCustomFonts(); F.runPlugins();
        buildPanels(); F.render(); F.toast('Projeto importado.'); }catch(err){ F.toast('JSON inválido.'); } });
      e.target.value=''; };
    $('#ddImpPlugin input').onchange = e=>{ const f = e.target.files[0]; ddClose(); if(!f) return;
      readAsText(f, code=>{ const pl = {name:f.name, code};
        const ok = F.runPlugin(pl); if(!ok) return F.toast('Plugin com erro — veja o console.');
        F.state.plugins = F.state.plugins||[]; F.state.plugins.push(pl); F.autoSave();
        buildPanels(); F.render(); F.toast(`Plugin “${f.name}” instalado.`); });
      e.target.value=''; };
    /* stagebar motion */
    function playTL(){
      $('#btnPlayTL').innerHTML = F.uiIcon('stop');
      F.playTimeline((p,i)=>{
        $('#tlProgBar').style.width = (p*100)+'%';
        if(i<0){ $('#btnPlayTL').innerHTML = F.uiIcon('play'); }
      });
    }
    $('#btnPlayTL').onclick = ()=>{
      if(F.player.playing){ F.stopTimeline(); $('#btnPlayTL').innerHTML = F.uiIcon('play'); F.render(); }
      else playTL();
    };
    /* rotas alternativas de imagem: colar e arrastar no palco */
    document.addEventListener('paste', e=>{
      const it = [...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/'));
      if(!it) return;
      const f = it.getAsFile(); if(!f) return;
      readAsImage(f, src=>assignImage(src, 'via Ctrl+V'));
    });
    const stage = $('#stage');
    stage.addEventListener('dragover', e=>{ e.preventDefault(); stage.style.outline='2px dashed var(--ui-ac)'; stage.style.outlineOffset='-8px'; });
    stage.addEventListener('dragleave', ()=>{ stage.style.outline=''; });
    stage.addEventListener('drop', e=>{
      e.preventDefault(); stage.style.outline='';
      const comp = e.dataTransfer.getData('text/forma-comp');
      if(comp){
        const r = document.getElementById('art').getBoundingClientRect();
        const x = Math.min(96, Math.max(2, (e.clientX-r.left)/r.width*100));
        const y = Math.min(96, Math.max(2, (e.clientY-r.top)/r.height*100));
        if(comp.startsWith('__icon|')) return F.addComposeItem('__icon', x, y, {icon:comp.slice(7)});
        if(comp.startsWith('__text|')) return F.addComposeItem('__text', x, y, textPreset(comp.slice(7)));
        if(comp.startsWith('__shape|')) return F.addComposeItem('__shape', x, y, {props:{kind:comp.slice(8), fill:F.state.brand.ac}});
        return F.addComposeItem(comp, x, y);
      }
      const f = [...(e.dataTransfer?.files||[])].find(x=>x.type.startsWith('image/'));
      if(f) readAsImage(f, src=>assignImage(src, 'no palco'));
    });
    /* zoom da prancheta: botões + Ctrl/Cmd+scroll; o rótulo reseta ao fit */
    $('#zoomIn').onclick  = ()=>F.zoomBy(1.2);
    $('#zoomOut').onclick = ()=>F.zoomBy(1/1.2);
    $('#zoomLabel').onclick = ()=>{ F.zoomReset(); F.toast('Zoom ajustado à tela.'); };
    stage.addEventListener('wheel', e=>{
      if(!e.ctrlKey && !e.metaKey) return;      // scroll normal continua rolando o palco
      e.preventDefault();
      F.zoomBy(e.deltaY < 0 ? 1.12 : 1/1.12);
    }, {passive:false});
    /* navegador de slides/cenas no palco */
    /* o botão do header abre a GRADE (mesmo módulo do footer) — o painel
       Slides (#stageNav) permanece no código para outros recursos, mas
       sem acesso pela interface: cobria o palco e ficou redundante. */
    const btnNav = $('#btnNav');
    btnNav.onclick = ()=>F.ui.toggleGridView();
    $('#snAdd').onclick = ()=>{
      const s = F.state;
      if(s.mode==='design'){
        s.slides.push(F.defSlide(s.slides.length));
        s.cur = s.slides.length-1;
        F.render(); F.ui.refreshActive();
        F.toast('Slide '+s.slides.length+' adicionado e selecionado.');
      } else {
        switchTab('t2');
        F.toast('Escolha o tipo em “+ adicionar cena”, na aba TIMELINE.');
      }
    };
    buildPanels();
    new ResizeObserver(F.fit).observe(stage);
  };
})(window.FORMA);
