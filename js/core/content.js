/* =====================================================
   FORJE·studio — core/content.js  (NOVO · Eixo 2 · S4)
   CONTEÚDO QUE VIRA DESIGN: parser DETERMINÍSTICO
   texto → carrossel (fase 2.1), ROTEAMENTO SEMÂNTICO
   por slide (fase 2.2, via slide.tpl opcional com
   fallback no template global), FIT TIPOGRÁFICO
   programático (fase 2.2) e markdown leve (fase 2.3,
   sem IA). Nenhuma dependência de rede: heurísticas
   puras, mesma entrada → mesma saída (P3).

   O que o parser entende:
   - blocos separados por linha em branco → um slide cada;
   - bloco único longo → fatiado por SENTENÇAS com alvo
     de ~180–240 caracteres por slide (proporção P4);
   - linha curta em CAIXA ALTA, terminada em ':' ou
     "Parte/Passo/Dica N" → kicker; '###' → kicker;
   - '#'/'##' → título; 1ª linha ≤ 56 chars → título;
     sem linha-título, o título é DERIVADO da 1ª sentença
     (essência até a 1ª vírgula/travessão) — nunca corta
     no meio de palavra, nunca reticências;
   - quebra inteligente do título no ponto de MENOR
     desequilíbrio entre as linhas;
   - '>' ou aspas envolventes → citação (atribuição na
     linha com travessão vira o sub);
   - linhas '-', '•', '*', '1.' → lista (roteia p/ o
     template de tópicos; >6 itens divide em slides);
   - número protagonista ('98%', '+120', 'R$ 1,2 mi',
     '3x') → estatística (roteia p/ tipografia monumental);
   - **palavra** → DESTAQUE persistido em slide.hl
     (marca-texto/sublinhado garantido no título);
   - ![alt](url), URL de imagem ou dataURL → slide.img;
   - bloco final curto com verbo de ação/URL/@ → vira o
     CTA global (s.cta), não um slide; bloco de ação
     longo → slide roteado ao template Produto/CTA.

   Roteamento (fase 2.2): lista→topicos · citação→quote ·
   estatística→poster · ação→cta · com imagem→split ·
   default alterna manifesto/split (1º slide = manifesto).

   FIT TIPOGRÁFICO: mapa determinístico caracteres →
   fator de escala (com piso de legibilidade), consumido
   pelos templates via F.fitT/F.fitS. Comprimentos dentro
   do orçamento original devolvem o TAMANHO ORIGINAL
   INALTERADO — projetos existentes renderizam byte a
   byte igual (P1); o fator só age no excedente.

   Carregar após core/composer.js e antes dos templates.
   ===================================================== */
(function(F){
  'use strict';

  /* ============ template EFETIVO por slide (fase 2.2) ============
     slide.tpl é opcional; fallback no global — chaves de edição de
     projetos antigos (sem slide.tpl) permanecem idênticas (P1). */
  F.tplOf = function(i){
    const s = F.state;
    return ((s.slides||[])[i] || {}).tpl || s.tpl;
  };

  /* ============ FIT TIPOGRÁFICO (fase 2.2) ============
     Orçamentos calibrados no design atual dos templates:
     título ≤ 48 chars e sub ≤ 190 chars → fator 1 (byte a byte
     igual ao render de hoje). Acima, escala côncava com piso. */
  F.fitK = function(s){
    const t = String((s && s.title) || '').replace(/\n/g,'');
    const n = t.length;
    if(n <= 48) return 1;
    return Math.max(.5, Math.min(1, +Math.pow(48/n, .6).toFixed(3)));
  };
  F.fitKSub = function(s){
    const n = String((s && s.sub) || '').length;
    if(n <= 190) return 1;
    return Math.max(.68, Math.min(1, +Math.pow(190/n, .55).toFixed(3)));
  };
  /* devolvem o argumento ORIGINAL quando o fator é 1 — a string
     interpolada no template não muda um byte (P1) */
  F.fitT = function(size, s){
    const k = F.fitK(s);
    if(k >= 1) return size;
    return Math.max(3.4, parseFloat(size)*k).toFixed(1);
  };
  F.fitS = function(size, s){
    const k = F.fitKSub(s);
    if(k >= 1) return size;
    return Math.max(1.9, +(parseFloat(size)*k).toFixed(2));
  };

  /* ============ utilitários do parser ============ */
  const IMG_LINE = /^!\[[^\]]*\]\((\S+?)\)\s*$/;
  const IMG_URL  = /^(https?:\/\/\S+\.(?:png|jpe?g|webp|gif|svg)(?:\?\S*)?)$/i;
  const IMG_DATA = /^data:image\/\S+$/;
  const URL_ANY  = /https?:\/\/\S+|www\.\S+/i;
  const LIST_LN  = /^\s*(?:[-•*–]|\d{1,2}[.)])\s+/;
  const ACTIONS  = /^(acesse|saiba|confira|baixe|compre|inscreva|assine|siga|clique|veja|garanta|comece|experimente|fale|entre|participe|aproveite|cadastre|agende|solicite|pe[cç]a|descubra|conhe[cç]a|get|join|follow|visit|learn|sign|start|try|buy|shop|book|download|subscribe|discover|claim|order)\b/i;
  const KICKER_N = /^(parte|passo|dica|cap[íi]tulo|cap\.|dia|semana|step|part|tip|day|week)\s*\d+/i;
  const ABBR     = /^(?:[A-Za-zÀ-ÿ]|Dr|Sr|Sra|Srta|Prof|etc|ex|p\.ex|vs|No|nº|art|fig|pág|pg|Mr|Mrs|Ms|St|Jr)\.$/i;

  const normalize = txt => String(txt||'')
    .replace(/\r\n?/g,'\n').replace(/\u00a0/g,' ')
    .replace(/[ \t]+$/gm,'').replace(/\n{3,}/g,'\n\n').trim();

  /* fatiador de sentenças sem lookbehind (Safari antigo) e com
     tolerância a abreviações e decimais ("1.5" não quebra) */
  F.splitSentences = function(t){
    t = String(t||'').replace(/\s+/g,' ').trim();
    const out = []; let cur = '';
    for(let i=0;i<t.length;i++){
      cur += t[i];
      if(!/[.!?…]/.test(t[i])) continue;
      while(i+1<t.length && /["”'’)\]]/.test(t[i+1])) cur += t[++i];
      const rest = t.slice(i+1);
      if(!rest.trim()){ out.push(cur.trim()); cur=''; continue; }
      if(!/^\s/.test(rest)) continue;                       // "1.5", "v2.0"
      const tail = (cur.trim().split(/\s+/).pop()||'');
      if(ABBR.test(tail)) continue;                          // "Dr.", "p.ex."
      if(/^[\sA-ZÀ-ÖØ-Þ0-9“"'(¿¡]/.test(rest.trim()[0]||'')){ out.push(cur.trim()); cur=''; }
    }
    if(cur.trim()) out.push(cur.trim());
    return out;
  };

  /* empacota sentenças com alvo de caracteres por slide (proporção);
     resto minúsculo no fim é fundido no bloco anterior */
  function packSentences(sents, target){
    const out = []; let cur = '';
    for(const sn of sents){
      if(!cur){ cur = sn; continue; }
      if((cur.length + 1 + sn.length) <= target*1.15) cur += ' '+sn;
      else { out.push(cur); cur = sn; }
    }
    if(cur) out.push(cur);
    if(out.length>1 && out[out.length-1].length < target*.35){
      const last = out.pop(); out[out.length-1] += ' '+last;
    }
    return out;
  }

  /* quebra inteligente do título: espaço mais próximo do ponto de
     menor desequilíbrio entre as linhas (2 linhas; 3 se muito longo) */
  F.breakTitle = function(t){
    t = String(t||'').trim();
    if(t.indexOf('\n')>=0 || t.length<=26) return t;
    const brk = (str)=>{                     // melhor espaço ~metade
      let best=-1, diff=Infinity;
      for(let i=0;i<str.length;i++) if(str[i]===' '){
        const d = Math.abs(i - str.length/2);
        if(d<diff && i>=8 && str.length-i-1>=6){ diff=d; best=i; }
      }
      return best<0 ? str : str.slice(0,best)+'\n'+str.slice(best+1);
    };
    if(t.length<=58) return brk(t);
    /* 3 linhas: quebra nos terços */
    const cut = (str, at)=>{ let best=-1, diff=Infinity;
      for(let i=0;i<str.length;i++) if(str[i]===' '){
        const d = Math.abs(i-at); if(d<diff && i>=8){ diff=d; best=i; } }
      return best; };
    const a = cut(t, t.length/3);
    if(a<0) return brk(t);
    const rest = t.slice(a+1), b = cut(rest, rest.length/2);
    return b<0 ? t.slice(0,a)+'\n'+rest : t.slice(0,a)+'\n'+rest.slice(0,b)+'\n'+rest.slice(b+1);
  };

  /* **destaque** / __destaque__ / *destaque* → texto limpo + palavras */
  function emphasis(str){
    const words = [];
    let s = String(str||'');
    const grab = (m, g)=>{ g.split(/\s+/).forEach(w=>{
      const c = w.replace(/[^\p{L}\p{N}]+/gu,'');
      if(c.length>2 && words.indexOf(c)<0) words.push(c); }); return g; };
    s = s.replace(/\*\*([^*\n]+)\*\*/g, grab).replace(/__([^_\n]+)__/g, grab);
    s = s.replace(/(^|[\s(])\*([^*\n]{2,}?)\*(?=[\s).,;:!?]|$)/g, (m,p,g)=>p+grab(m,g));
    return { text:s, words: words.slice(0,3) };
  }

  /* essência de uma sentença longa para virar título: 1ª cláusula
     (vírgula/travessão/dois-pontos) ou primeiras ~7 palavras */
  function titleFrom(sent){
    const s = String(sent||'').trim().replace(/[.…]+$/,'');
    if(s.length<=56) return { t:s, rest:'' };
    const m = s.match(/^(.{12,56}?)[,;:—–]\s+(.+)$/);
    if(m) return { t:m[1].trim(), rest:m[2].trim() };
    const w = s.split(' ');
    let t = '', i = 0;
    while(i<w.length && (t+' '+w[i]).trim().length<=52){ t = (t+' '+w[i]).trim(); i++; }
    return { t, rest: w.slice(i).join(' ') };
  }

  /* ============ parser de UM bloco → proto-slide ============ */
  function parseBlock(block, opts){
    const out = { kicker:'', title:'', sub:'', img:null, mask:null, hl:[], kind:'default', warn:null };
    let lines = block.split('\n').map(l=>l.trim()).filter(Boolean);

    /* imagens: linha-imagem inteira ou embutida no texto */
    if(opts.useImages !== false){
      lines = lines.filter(l=>{
        const m = l.match(IMG_LINE) || l.match(IMG_URL) || (IMG_DATA.test(l) ? [l,l] : null);
        if(m && !out.img){ out.img = m[1]; out.mask = opts.mask || 'cover'; return false; }
        return !m;                                   // 2ª imagem do bloco: descartada
      }).map(l=>l.replace(/!\[[^\]]*\]\((\S+?)\)/g, (mm,u)=>{
        if(!out.img){ out.img = u; out.mask = opts.mask || 'cover'; } return ''; }).trim())
        .filter(Boolean);
    }
    if(!lines.length) return out.img ? (out.kind='image', out.title='', out) : null;

    /* CITAÇÃO: '>' de markdown, aspas envolventes ou atribuição por travessão */
    const attrIx = lines.findIndex((l,i)=> i>0 && /^(—|–|--)\s*\S/.test(l));
    const quoted = /^>/.test(lines[0]) ||
      (/^[“"']/.test(lines[0]) && /[”"']$/.test(lines[attrIx>0? attrIx-1 : lines.length-1]||''));
    if(quoted){
      let body = (attrIx>0? lines.slice(0,attrIx) : lines).map(l=>l.replace(/^>\s?/,'')).join(' ');
      body = body.replace(/^[“"']\s*/,'').replace(/\s*[”"']$/,'');
      const e = emphasis(body);
      out.kind='quote';
      out.title = F.breakTitle(e.text); out.hl = e.words;
      out.sub = attrIx>0 ? lines.slice(attrIx).join(' ').replace(/^(—|–|--)\s*/,'') : '';
      return out;
    }

    /* kicker: '###', CAIXA ALTA curta, 'Rótulo:', 'Parte N' */
    const kick = l => {
      if(/^###\s+/.test(l)) return l.replace(/^###\s+/,'');
      if(l.length<=48 && /:$/.test(l) && !LIST_LN.test(l)) return l.replace(/:$/,'');
      if(l.length<=38 && l===l.toUpperCase() && /[A-ZÀ-ÖØ-Þ]/.test(l) && l.split(' ').length<=5 && !LIST_LN.test(l)) return l;
      if(l.length<=30 && KICKER_N.test(l)) return l;
      return null;
    };
    if(lines.length>1){
      const k = kick(lines[0]);
      if(k!=null){ out.kicker = k; lines = lines.slice(1); }
    }

    /* LISTA: 2+ linhas marcadas */
    const marked = lines.filter(l=>LIST_LN.test(l));
    if(marked.length>=2){
      out.kind='list';
      const pre = lines.slice(0, lines.indexOf(marked[0]));
      const items = lines.filter(l=>LIST_LN.test(l)).map(l=>{
        const e = emphasis(l.replace(LIST_LN,''));
        e.words.forEach(w=>{ if(out.hl.indexOf(w)<0) out.hl.push(w); });
        return e.text;
      });
      const tl = pre.map(l=>l.replace(/^#{1,2}\s+/,'')).join(' ').trim();
      const et = emphasis(tl);
      out.title = F.breakTitle(et.text || out.kicker || F.dtr('Pontos-chave'));
      if(!tl && out.kicker) out.kicker = '';
      et.words.forEach(w=>{ if(out.hl.indexOf(w)<0) out.hl.push(w); });
      out.hl = out.hl.slice(0,3);
      out.sub = items.join('\n');
      out._items = items.length;
      return out;
    }

    /* título: '#'/'##' ou 1ª linha curta */
    let title = null;
    if(/^#{1,2}\s+/.test(lines[0])){ title = lines[0].replace(/^#{1,2}\s+/,''); lines = lines.slice(1); }
    else if(lines[0].length<=56 && lines.length>1){ title = lines[0]; lines = lines.slice(1); }
    else if(lines.length===1 && lines[0].length<=72){ title = lines[0]; lines = []; }

    let body = lines.join(' ').trim();

    /* ESTATÍSTICA: número protagonista em linha própria ou abrindo o bloco */
    const statRe = /^[+\-]?\s?(?:R\$|US\$|\$|€)?\s?\d[\d.,]*\s?(?:%|x|X|\+|mi|mil|bi|k|K|M)?$/;
    const statTok = (title && title.length<=10 && statRe.test(title)) ? title
                  : (!title && statRe.test((body.split(' ')[0]||'')) && body.split(' ')[0].length<=8 ? body.split(' ')[0] : null);
    if(statTok){
      out.kind='stat';
      if(title && statRe.test(title)){ /* título já é o número */ }
      else { body = body.slice(statTok.length).trim(); title = statTok; }
    }

    if(!title){
      const sents = F.splitSentences(body);
      const d = titleFrom(sents[0]||'');
      title = d.t; out.warn = 'derived-title';
      body = [d.rest, ...sents.slice(1)].filter(Boolean).join(' ');
    }

    const et = emphasis(title), eb = emphasis(body);
    out.title = F.breakTitle(et.text);
    out.sub = eb.text;
    out.hl = et.words.concat(eb.words.filter(w=>et.words.indexOf(w)<0)).slice(0,3);
    return out;
  }

  /* ============ F.parseContent — o pipeline completo ============ */
  F.parseContent = function(txt, opts){
    opts = Object.assign({ target:220, maxSub:300, useImages:true, route:true, maxSlides:20 }, opts||{});
    const warnings = [];
    const text = normalize(txt);
    if(!text) return { slides:[], cta:null, warnings:['empty'] };

    let blocks = text.split(/\n{2,}/);

    /* bloco único e longo, sem estrutura de linhas: fatiar por sentenças */
    if(blocks.length===1 && blocks[0].length > opts.target*1.4 &&
       blocks[0].split('\n').length === 1 && !LIST_LN.test(blocks[0])){
      blocks = packSentences(F.splitSentences(blocks[0]), opts.target);
      warnings.push('sliced');
    }

    /* CTA global: bloco FINAL curto com verbo de ação, URL ou @ */
    let cta = null;
    if(blocks.length>1){
      const last = blocks[blocks.length-1].trim();
      const short = last.length<=90 && last.split('\n').length<=2;
      if(short && (ACTIONS.test(last) || URL_ANY.test(last) || /^@\w/.test(last) || /→/.test(last))){
        cta = last.split('\n')[0].trim();
        blocks = blocks.slice(0,-1);
        warnings.push('cta');
      }
    }

    /* blocos → proto-slides */
    let slides = [];
    for(let bi=0; bi<blocks.length; bi++){
      const p = parseBlock(blocks[bi], opts);
      if(!p) continue;
      if(p.warn) warnings.push(p.warn);

      /* bloco FINAL de AÇÃO que não coube no CTA global → slide Produto/CTA */
      if(p.kind==='default' && ACTIONS.test((p.title||'').replace(/\n/g,' ')) &&
         (p.title+p.sub).length<=200 && bi===blocks.length-1 && blocks.length>1)
        p.kind='ctaSlide';

      /* PROPORÇÃO (P4): sub excedente é dividido em slides de continuação */
      if(p.kind!=='list' && p.sub && p.sub.length > opts.maxSub){
        const chunks = packSentences(F.splitSentences(p.sub), opts.target);
        p.sub = chunks[0]||'';
        slides.push(p);
        for(const ch of chunks.slice(1)){
          const sents = F.splitSentences(ch);
          const d = titleFrom(sents[0]||'');
          slides.push({ kicker:p.kicker, title:F.breakTitle(d.t),
            sub:[d.rest, ...sents.slice(1)].filter(Boolean).join(' '),
            img:null, mask:null, hl:[], kind:'default', warn:null });
        }
        warnings.push('split');
        continue;
      }
      /* LISTA longa: fatiar em slides de até 6 itens */
      if(p.kind==='list' && p._items>6){
        const items = p.sub.split('\n');
        for(let i=0;i<items.length;i+=6)
          slides.push({ ...p, sub:items.slice(i,i+6).join('\n'), _items:Math.min(6,items.length-i) });
        warnings.push('list-split');
        continue;
      }
      slides.push(p);
    }

    if(slides.length > opts.maxSlides){
      slides = slides.slice(0, opts.maxSlides);
      warnings.push('capped');
    }

    /* ============ ROTEAMENTO SEMÂNTICO (fase 2.2) ============ */
    if(opts.route){
      let dflt = 0;
      slides.forEach((p,i)=>{
        p.tpl = p.kind==='quote'    ? 'quote'
              : p.kind==='list'     ? 'topicos'
              : p.kind==='stat'     ? 'poster'
              : p.kind==='ctaSlide' ? 'cta'
              : (p.img || p.kind==='image') ? 'split'
              : (i===0 ? 'manifesto' : (dflt++ % 2 ? 'manifesto' : 'split'));
      });
    }

    slides.forEach(p=>{ delete p._items; delete p.warn; });
    return { slides, cta, warnings };
  };

  /* ============ geração: povoar o estado e ENCADEAR a folha ============ */
  F.generateFromContent = function(txt, opts){
    opts = Object.assign({ mode:'replace', openSheet:true }, opts||{});
    const P = F.parseContent(txt, opts);
    if(!P.slides.length){
      if(F.toast) F.toast('Nenhum conteúdo reconhecido.');
      return P;
    }
    const s = F.state;
    const mk = b => Object.assign({ kicker:b.kicker||'', title:b.title||'', sub:b.sub||'',
      img:b.img||null, mask:b.mask||'cover' },
      b.hl && b.hl.length ? {hl:b.hl} : {},
      b.tpl ? {tpl:b.tpl} : {});

    if(opts.mode==='append'){
      const base = s.slides.length;
      s.slides = s.slides.concat(P.slides.map(mk));
      s.cur = base;
    } else {
      /* substituir: as chaves de edição/composição/cores do modo design
         pertencem ao carrossel antigo — descartadas para não vazarem
         para as artes novas (motion permanece intacto) */
      F.remapArtKeys && F.remapArtKeys('design', ()=>-1);
      s.slides = P.slides.map(mk);
      s.cur = 0;
    }
    if(P.cta) s.cta = P.cta;

    /* seeds de eixo NOVOS (travas respeitadas) — o carrossel nasce com
       cara própria e desagua na folha de contato: cole → gere → escolha.
       opts.seed (opcional) torna a derivação determinística p/ testes. */
    const L = s.seedLocks||{};
    const rr = opts.seed!=null ? F.rngOf(opts.seed) : Math.random;
    const rnd = ()=>1+Math.floor(rr()*99999);
    s.seeds = {
      layout : L.layout  ? F.seedOf('layout') : rnd(),
      palette: L.palette ? ((s.seeds||{}).palette ?? null) : rnd(),
      type   : L.type    ? F.seedOf('type')   : rnd(),
    };

    if(F.render) F.render();
    F.autoSave && F.autoSave();
    if(F.toast) F.toast(P.slides.length+' slides gerados do conteúdo'+(P.cta?' · CTA detectado':'')+'.');
    if(opts.openSheet!==false && F.ui && F.ui.toggleVarSheet) F.ui.toggleVarSheet(true);
    return P;
  };
})(window.FORMA);
