/* =====================================================
   FORJE·studio — core/composer.js  (Eixo 1 · v2.1)
   ALGORITMO DE COMPOSIÇÃO POR PREMISSAS DE DESIGN +
   CAMADA DE DESIGN SYSTEM (S3.2).

   Premissas de composição:
   C1 · Direção primeiro — estrutura, eixos e VARIANTES DE
        UI saem dos pools da direção sorteada: nunca uma
        combinação que um designer não faria.
   C2 · Um protagonista por arte — estruturas de tipografia
        dominante subordinam o fundo.
   C3 · Ornamento é estrutura — régua, fólio, moldura,
        ancorados ao grid 7u; jamais adorno solto.
   C4 · Respiro inverso à escala do título.
   C5 · Acento com papel único; áreas grandes por inversão
        fg/bg (contraste por construção).
   C6 · Superfície viva — nenhuma prancheta sai com o bg
        cru ("tela preta"): o chapado vira lavagem sutil de
        tom da marca, com profundidade opcional.
   C7 · Design system variável — os ELEMENTOS DE UI são
        papéis (kicker, cta, divisor, handle, cartão) com
        variantes intercambiáveis da MESMA função: um
        botão pode virar badge, tag, link, caixa; a
        variante é escolhida pelo pool coerente da direção.
   C8 · ESQUEMA é eixo de composição (S3.3) — a polaridade
        da superfície varia de verdade: dark com tipografia
        clara, LIGHT com tipografia escura, superfícies
        TONAIS e de ACENTO da própria marca. Contraste
        calculado (WCAG ≥ 4.5 texto; tons de UI ajustados
        por tint/shade do PRÓPRIO hue — P2/P4 por cálculo,
        nunca por sorte).
   C9 · Acabamento profissional — camadas de tratamento
        coerentes com a direção: holografia (conic
        iridescente sutil), liquid glass (orbes desfocados
        + brilho especular), piso 3D em perspectiva,
        inclinação de perspectiva no título. Glassmorphism
        já vive na pele de cartão (C7).

   Determinismo (P3): nº FIXO de 17 sorteios por spec
   (8 de composição + 3 de esquema/acabamento + 6 de
   design system), sempre na mesma ordem.
   Carregar após core/state.js e antes dos templates.
   ===================================================== */
(function(F){
  'use strict';

  /* ================= direções de design =================
     st: pools de ESTRUTURA por template migrado;
     aligns/con/bgs/sigs/orns/tones: eixos de composição;
     ui: pools de VARIANTE por papel do design system;
     shape: regime de cantos; shadow: regime de sombra;
     amp: intensidade do fundo (constantes da direção). */
  const DIR = {
    editorial: {  /* revista: grid, réguas, esquerda, alto contraste */
      st:{manifesto:['anchor','classic'], split:['column','half'], quote:['classic','attributed'],
          livre:['anchor','attributed','letterbox']},
      aligns:['left','left','center'], con:['high','mid'],
      bgs:['flat','flat','id','gridpaper'], amp:'soft',
      orns:['rule','folio','none'], sigs:['bar','ub','none'], tones:['ac','p1'],
      schemes:['light','light','dark'], finishes:['none'],
      ui:{kicker:['num','underline','plain'], cta:['link','outline'], bar:['solid','double'],
          handle:['plain','mono'], card:['outline','flat'], shape:['brand','sharp']}, shadow:'none' },
    poster: {     /* cartaz: tipografia monumental, presença */
      st:{manifesto:['monumental','band'], split:['stack','half'], quote:['giantmark','centered'],
          livre:['monumental','band','bignum','ticker','framehero']},
      aligns:['center','center','left'], con:['high'],
      bgs:['id','spotlight','sweep','horizon'], amp:'bold',
      orns:['none','rule'], sigs:['hollow','none','bar'], tones:['ac','p2'],
      schemes:['dark','tonal','accent'], finishes:['holo','holo','persp','none'],
      ui:{kicker:['badge','plain'], cta:['solid','boxed'], bar:['solid'],
          handle:['plain','pill'], card:['flat'], shape:['brand','pill']}, shadow:'none' },
    minimal: {    /* quase nada: respiro máximo, gesto mínimo */
      st:{manifesto:['center','anchor'], split:['half','column'], quote:['centered','classic'],
          livre:['center','anchor','letterbox']},
      aligns:['left','center','center'], con:['soft','mid'],
      bgs:['flat','flat','flat','id'], amp:'soft',
      orns:['none','none','rule'], sigs:['none','none','bar'], tones:['ac','p1','p2'],
      schemes:['light','dark','light'], finishes:['none'],
      ui:{kicker:['plain','dot'], cta:['ghost','link'], bar:['solid'],
          handle:['plain'], card:['flat','outline'], shape:['brand']}, shadow:'none' },
    brutal: {     /* duro: 900, caixa alta, cantos retos, sombra dura */
      st:{manifesto:['band','monumental','classic'], split:['stack','half'], quote:['giantmark','classic'],
          livre:['band','bignum','diagonal','ticker','monumental']},
      aligns:['left','left','center'], con:['high'],
      bgs:['stripes','checker','rays','flat'], amp:'bold',
      orns:['none','frame'], sigs:['hl','hollow','ub'], tones:['ac','p2'],
      schemes:['tonal','dark','accent','light'], finishes:['persp','persp','none'],
      ui:{kicker:['mono','badge'], cta:['boxed','solid'], bar:['slashes','solid'],
          handle:['mono'], card:['hard'], shape:['sharp']}, shadow:'hard' },
    elegante: {   /* suave: pesos leves, pill, vidro, sombra macia */
      st:{manifesto:['center','anchor'], split:['half','panel'], quote:['centered','attributed'],
          livre:['center','framehero','giantmark']},
      aligns:['center','center','left'], con:['soft','mid'],
      bgs:['aurora','mesh','id','flat'], amp:'soft',
      orns:['frame','none','none'], sigs:['bar','none'], tones:['p1','p2','ac'],
      schemes:['light','tonal','dark'], finishes:['liquid','liquid','holo','none'],
      ui:{kicker:['tag','dot'], cta:['pill','ghost'], bar:['double','solid'],
          handle:['pill','plain'], card:['glass','outline'], shape:['pill','brand']}, shadow:'soft' },
    tech: {       /* técnico: mono, pontilhados, colchetes, cantos retos */
      st:{manifesto:['classic','anchor'], split:['column','panel'], quote:['classic','attributed'],
          livre:['bignum','diagonal','anchor','letterbox']},
      aligns:['left','left'], con:['mid','high'],
      bgs:['dots','gridpaper','flat','id'], amp:'soft',
      orns:['rule','folio','rule'], sigs:['ub','bar'], tones:['ac','p2'],
      schemes:['dark','light','dark'], finishes:['floor3d','floor3d','none'],
      ui:{kicker:['mono','num'], cta:['outline','link'], bar:['dotted','solid'],
          handle:['mono','plain'], card:['outline'], shape:['sharp','brand']}, shadow:'none' },
  };
  const DKEYS = ['editorial','editorial','poster','poster','minimal','brutal','elegante','tech'];
  F.DIRECTIONS = DIR;   // inspecionável/expansível (plugins podem registrar direções)

  /* ================= spec de composição (17 sorteios fixos) ================= */
  /* estruturas dos templates de migração leve (identidade preservada:
     variam por esquema/direção/UI e pelo próprio rng interno) */
  const ST_LIGHT = { glow:['card','halo'], cta:['classic','tilt'], grid:['classic'],
                     poster:['classic'], editorial:['classic'], duotone:['classic'], stickers:['classic'] };
  F.composeSpec = function(r, tpl){
    const dk = F.pick(r, DKEYS), d = DIR[dk];
    const spec = {
      dir:       dk,
      structure: F.pick(r, d.st[tpl] || ST_LIGHT[tpl] || ['classic']),
      align:     F.pick(r, d.aligns),
      contrast:  F.pick(r, d.con),
      bg:        F.pick(r, d.bgs),
      sig:       F.pick(r, d.sigs),
      orn:       F.pick(r, d.orns),
      tone:      F.pick(r, d.tones),
      /* C8 — esquema de superfície + C9 — acabamento */
      scheme:     F.pick(r, d.schemes),
      schemeTone: F.pick(r, ['p1','p2']),
      finish:     F.pick(r, d.finishes),
      amp:       d.amp,
      shadow:    d.shadow,
      /* C7 — design system: variante por papel, do pool da direção */
      ui: {
        kicker: F.pick(r, d.ui.kicker),
        cta:    F.pick(r, d.ui.cta),
        bar:    F.pick(r, d.ui.bar),
        handle: F.pick(r, d.ui.handle),
        card:   F.pick(r, d.ui.card),
        shape:  F.pick(r, d.ui.shape),
      },
    };
    /* C2 — protagonista único: estruturas dominantes subordinam o fundo */
    if(['monumental','giantmark','band','bignum','ticker'].includes(spec.structure))
      spec.bg = (spec.bg==='id' ? 'id' : 'flat');
    /* C8 — papel único do tom sobre superfície tonal/acento: o tom de UI
       nunca é o mesmo tom da superfície (hue sobre o próprio hue) */
    if(spec.scheme==='accent') spec.tone = spec.schemeTone;
    if(spec.scheme==='tonal' && spec.tone===spec.schemeTone) spec.tone = 'ac';
    /* C4 — respiro inverso à escala */
    spec.density = (spec.structure==='monumental'||spec.structure==='giantmark'||spec.structure==='bignum') ? 'air'
                 : (spec.structure==='band'||spec.structure==='stack') ? 'mid'
                 : (dk==='minimal'||dk==='elegante') ? 'air'
                 : (dk==='brutal') ? 'full' : 'mid';
    return spec;
  };

  /* assinatura direção/estrutura de uma arte — dedup da folha de contato.
     Replica exatamente o rng que o template migrado consumirá no render. */
  F.MIGRATED = ['manifesto','split','quote','glow','cta','grid','poster','editorial','duotone','stickers','livre'];
  F.composeSig = function(layoutSeed, idx, tpl){
    if(F.MIGRATED.indexOf(tpl) < 0) return 'tpl:'+tpl;
    const s = F.composeSpec(F.rngOf(layoutSeed*7919 + (F.artOff ? F.artOff(idx) : idx*101)), tpl);
    /* o esquema entra na assinatura: a folha é obrigada a misturar
       polaridades (dark/light/tonal/accent) entre os cards */
    return tpl+':'+s.dir+'/'+s.structure+'/'+s.scheme;
  };

  /* ================= superfícies e ornamento ================= */

  /* C6 — fundo pela direção; 'flat' vira SUPERFÍCIE VIVA: lavagem
     sutil de tom da marca (4–8%) + profundidade opcional. Nunca o
     bg cru — era a origem das "telas pretas" (S3.2). */
  F.composeBG = function(r, spec, identity){
    if(spec.bg==='flat'){
      const tn = F.pick(r, ['p1','p2']), a = Math.floor(4+r()*5);
      const ang = Math.floor(r()*360);
      const wash = `linear-gradient(${ang}deg,color-mix(in srgb,var(--b-${tn}) ${a+4}%,var(--b-bg)),color-mix(in srgb,var(--b-${tn}) ${Math.max(1,a-3)}%,var(--b-bg)) 55%,var(--b-bg))`;
      const depth = r()<.5
        ? `<div class="abs" style="inset:0;background:radial-gradient(120% 90% at 50% 6%,transparent 55%,color-mix(in srgb,#000 20%,transparent))"></div>` : '';
      return `<div class="abs" style="inset:0;background:${wash}"></div>`+depth;
    }
    if(spec.bg==='id') return `<div class="abs" style="inset:0;background:${identity}"></div>`;
    const fn = F.bgs.get(spec.bg);
    const core = fn ? fn(r) : `<div class="abs" style="inset:0;background:var(--b-bg)"></div>`;
    return spec.amp==='soft'
      ? core + `<div class="abs" style="inset:0;background:color-mix(in srgb,var(--b-bg) 30%,transparent)"></div>`
      : core;
  };

  /* C3 — ornamento ESTRUTURAL, ancorado ao grid de margem 7u */
  F.composeOrn = function(spec){
    const ln = `height:1px;background:color-mix(in srgb,var(--b-fg) 18%,transparent)`;
    if(spec.orn==='rule')
      return `<div class="abs" data-anim="line" style="--d:.35s;left:calc(var(--u)*7px);right:calc(var(--u)*7px);top:calc(var(--u)*13px);${ln}"></div>
        <div class="abs" data-anim="line" style="--d:.45s;left:calc(var(--u)*7px);right:calc(var(--u)*7px);bottom:calc(var(--u)*13px);${ln}"></div>`;
    if(spec.orn==='folio'){
      const s = F.state, n = s.mode==='design' ? s.slides.length : Math.max(1,s.timeline.length);
      const i = (s.mode==='design' ? s.cur : s.curScene)+1;
      return `<span class="abs fm" data-anim="fade" style="--d:.5s;right:calc(var(--u)*7px);top:calc(var(--u)*6.4px);font-family:var(--fm);font-size:calc(var(--u)*1.9px);letter-spacing:.14em;opacity:.6">№ ${String(i).padStart(2,'0')} — ${String(n).padStart(2,'0')}</span>`;
    }
    if(spec.orn==='frame')
      return `<div class="abs" data-anim="fade" style="--d:.25s;inset:calc(var(--u)*3.4px);border:1px solid color-mix(in srgb,var(--b-fg) 22%,transparent);pointer-events:none"></div>`;
    return '';
  };

  /* ================= C8 · ESQUEMA DE SUPERFÍCIE =================
     Recolore a arte inteira via cascata de CSS vars num wrapper —
     todos os véus, color-mix, hl/ub/cta seguem automaticamente.
     Brand-first (P2): light = inversão bg↔fg da marca; tonal/accent =
     superfície do PRÓPRIO tom (78% sobre o bg). Contraste por cálculo
     (P4): texto ≥ 4.5:1; tons de UI ajustados por tint/shade do próprio
     hue até ≥ 2.8:1 contra a nova superfície. 'dark' = identidade. */
  function fitTone(hex, bg){
    /* os tons de UI viram COR DE TEXTO (kicker, link, mono...):
       o piso é 4.5:1 (AA), não 2.8 — lição do preview S3.3 */
    if(!F.contrastRatio) return hex;
    const toward = (F.contrastRatio(bg,'#ffffff') > F.contrastRatio(bg,'#000000')) ? '#ffffff' : '#000000';
    for(const k of [0,.2,.35,.5,.65,.8]){
      const c = k ? F.mixHex(hex, toward, k) : hex;
      if(F.contrastRatio(bg, c) >= 4.5) return c;
    }
    return toward;
  }
  F.schemeVars = function(X){
    if(!X || X.scheme==='dark' || !F.contrastRatio) return '';
    const b = F.state.brand;
    let bg, fg;
    if(X.scheme==='light'){ bg = b.fg; fg = b.bg; }
    else {
      const tone = X.scheme==='accent' ? b.ac : (X.schemeTone==='p2' ? b.p2 : b.p1);
      bg = F.mixHex(tone, b.bg, .22);                  // 78% do tom sobre o bg da marca
      fg = null;
    }
    if(!fg || !F.contrastOK(bg, fg)){
      /* escada de garantia: fg da marca → bg da marca → branco/preto */
      fg = [b.fg, b.bg, '#ffffff', '#0b0b0e'].find(c=>F.contrastOK(bg, c)) || '#ffffff';
    }
    /* tons de UI ajustados ao novo chão (tint/shade do próprio hue — P2) */
    const p1 = fitTone(b.p1, bg), p2 = fitTone(b.p2, bg), ac = fitTone(b.ac, bg);
    return `--b-bg:${bg};--b-fg:${fg};--b-p1:${p1};--b-p2:${p2};--b-ac:${ac};`;
  };
  /* wrapper de esquema: identidade (dark) devolve o HTML puro.
     ATENÇÃO (bug S3.3): custom properties redefinidas no wrapper NÃO
     recomputam a `color` herdada da raiz .art — o wrapper precisa
     declarar a própria color/background para a herança descer certa. */
  F.schemeWrap = function(vars, html){
    return vars ? `<div class="abs" style="inset:0;${vars}color:var(--b-fg);background:var(--b-bg)">${html}</div>` : html;
  };

  /* ================= C9 · ACABAMENTOS PROFISSIONAIS =================
     Camadas de tratamento coerentes com a direção, inseridas logo após
     o fundo. 'persp' não gera camada — os templates inclinam o título. */
  F.composeFinish = function(r, X){
    if(!X || !X.finish || X.finish==='none' || X.finish==='persp') return '';
    if(X.finish==='holo'){
      /* holografia: varredura conic iridescente nos tons da marca + brilho */
      const ang = Math.floor(r()*360), x = Math.floor(20+r()*60), y = Math.floor(10+r()*50);
      return `<div class="abs" data-anim="fade" style="--dur:1.4s;inset:0;opacity:.30;background:conic-gradient(from ${ang}deg at ${x}% ${y}%,var(--b-p1),var(--b-p2),var(--b-ac),var(--b-p2),var(--b-p1))"></div>
        <div class="abs" style="inset:0;opacity:.12;background:linear-gradient(${Math.floor(30+r()*40)}deg,transparent 28%,#ffffff 50%,transparent 68%)"></div>`;
    }
    if(X.finish==='liquid'){
      /* liquid glass: orbes desfocados + streak especular */
      let orbs = '';
      const tones = ['p1','p2','ac'];
      for(let i=0;i<3;i++){
        const sz = (26+r()*22).toFixed(0), xx = (r()*90).toFixed(0), yy = (r()*90).toFixed(0);
        orbs += `<div class="abs" data-anim="float" style="--d:${(i*.4).toFixed(1)}s;left:${xx}%;top:${yy}%;width:${sz}%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--b-${tones[i]}) 62%,transparent),transparent 70%);filter:blur(calc(var(--u)*2.6px))"></div>`;
      }
      return orbs + `<div class="abs" style="left:-10%;top:${(8+r()*20).toFixed(0)}%;width:120%;height:16%;background:linear-gradient(100deg,transparent,color-mix(in srgb,#ffffff 9%,transparent) 50%,transparent);transform:rotate(-8deg)"></div>`;
    }
    if(X.finish==='floor3d'){
      /* piso 3D: grade em perspectiva ancorada à base */
      const gp = (5+r()*3).toFixed(1);
      return `<div class="abs" data-anim="fade" style="--d:.3s;left:-20%;right:-20%;bottom:0;height:42%;opacity:.34;transform:perspective(calc(var(--u)*60px)) rotateX(58deg);transform-origin:bottom;background:
        repeating-linear-gradient(0deg,color-mix(in srgb,var(--b-fg) 55%,transparent) 0 1px,transparent 1px calc(var(--u)*${gp}px)),
        repeating-linear-gradient(90deg,color-mix(in srgb,var(--b-fg) 55%,transparent) 0 1px,transparent 1px calc(var(--u)*${gp}px))"></div>`;
    }
    return '';
  };
  /* inclinação de perspectiva do bloco de título (finish 'persp') */
  F.perspStyle = function(X){
    if(!X || X.finish!=='persp') return '';
    const ry = X.align==='center' ? 0 : (X.align==='right' ? 7 : -7);
    return `transform:perspective(calc(var(--u)*150px)) rotateX(7deg) rotateY(${ry}deg);transform-origin:center;`;
  };

  /* ================= C7 · DESIGN SYSTEM (papéis × variantes) =================
     Cada papel tem variantes intercambiáveis da MESMA função. Tudo escala
     por --u, cor pelos tokens da marca, cantos pelo regime da direção. */

  const RAD = X => X.ui.shape==='sharp' ? '0' : (X.ui.shape==='pill' ? '99em' : 'calc(var(--b-r)*1px)');
  const SHW = X => X.shadow==='hard'
    ? `box-shadow:calc(var(--u)*0.8px) calc(var(--u)*0.8px) 0 color-mix(in srgb,var(--b-fg) 85%,transparent);`
    : X.shadow==='soft'
    ? `box-shadow:0 calc(var(--u)*1.4px) calc(var(--u)*4px) color-mix(in srgb,#000 28%,transparent);`
    : '';
  const artIdx = () => (F.state.mode==='design' ? F.state.cur : F.state.curScene)+1;

  F.dsys = {
    /* ---- papel: kicker (rótulo de abertura) ---- */
    kicker(v, X, text){
      const e = F.esc(text), tn = `var(--b-${X.tone})`;
      if(v==='badge')
        return `<span class="kicker" data-anim="clip" style="background:${tn};color:var(--b-bg);padding:.55em 1.1em;border-radius:${RAD(X)};${SHW(X)}opacity:1">${e}</span>`;
      if(v==='tag')
        return `<span class="kicker" data-anim="clip" style="color:${tn};border:calc(var(--u)*0.22px) solid color-mix(in srgb,${tn} 60%,transparent);padding:.5em 1.1em;border-radius:${RAD(X)}">${e}</span>`;
      if(v==='mono')
        return `<span class="kicker" data-anim="clip" style="color:${tn};letter-spacing:.3em">[ ${e} ]</span>`;
      if(v==='num')
        return `<span class="kicker" data-anim="clip" style="color:${tn}">${String(artIdx()).padStart(2,'0')} — ${e}</span>`;
      if(v==='dot')
        return `<span class="kicker" data-anim="clip" style="display:inline-flex;align-items:center;gap:.7em"><i style="width:.55em;aspect-ratio:1;border-radius:50%;background:${tn}"></i><span style="color:${tn}">${e}</span></span>`;
      if(v==='underline')
        return `<span class="kicker" data-anim="clip" style="color:${tn};border-bottom:calc(var(--u)*0.32px) solid ${tn};padding-bottom:.35em">${e}</span>`;
      /* plain — o kicker clássico com o ícone de acento da marca */
      return `<span style="display:inline-flex;align-items:center;gap:.6em" data-anim="clip">
        <span style="color:${tn};font-size:calc(var(--u)*2.8px);display:flex">${F.icon(F.state.accentIcon)}</span>
        <span class="kicker" style="color:${tn}">${e}</span></span>`;
    },

    /* ---- papel: ação (o "botão" que vira badge, tag, link, caixa...) ---- */
    cta(v, X, label, d='1.35s'){
      if(!label) return '';
      const e = F.esc(label), tn = `var(--b-${X.tone})`, ar = F.icon('arrow-right');
      if(v==='link')
        return `<span data-anim="pop" style="--d:${d};display:inline-flex;align-items:center;gap:.45em;font-weight:700;font-size:calc(var(--u)*2.7px);color:${tn};border-bottom:calc(var(--u)*0.28px) solid ${tn};padding-bottom:.18em">${e} ${ar}</span>`;
      if(v==='outline')
        return `<span class="cta" data-anim="pop" style="--d:${d};background:transparent;color:${tn};border:calc(var(--u)*0.28px) solid ${tn};border-radius:${RAD(X)}">${e} ${ar}</span>`;
      if(v==='ghost')
        return `<span class="cta" data-anim="pop" style="--d:${d};background:color-mix(in srgb,${tn} 14%,transparent);color:${tn};border-radius:${RAD(X)}">${e}</span>`;
      if(v==='pill')
        return `<span class="cta" data-anim="pop" style="--d:${d};background:${tn};border-radius:99em;${SHW(X)}">${e} ${ar}</span>`;
      if(v==='boxed')
        return `<span class="cta" data-anim="pop" style="--d:${d};background:${tn};border-radius:0;text-transform:uppercase;letter-spacing:.06em;border:calc(var(--u)*0.28px) solid var(--b-fg);${SHW({...X,shadow:'hard'})}">${e}</span>`;
      if(v==='tagcta')
        return `<span class="cta" data-anim="pop" style="--d:${d};background:transparent;color:${tn};border:calc(var(--u)*0.22px) dashed color-mix(in srgb,${tn} 70%,transparent);border-radius:${RAD(X)};font-family:var(--fm)"># ${e}</span>`;
      /* solid */
      return `<span class="cta" data-anim="pop" style="--d:${d};background:${tn};border-radius:${RAD(X)};${SHW(X)}">${e} ${ar}</span>`;
    },

    /* ---- papel: divisor/assinatura de linha ---- */
    bar(v, X, w, d='.95s'){
      const tn = `var(--b-${X.tone})`;
      if(v==='double')
        return `<span data-anim="line" style="--d:${d};display:flex;flex-direction:column;gap:calc(var(--u)*0.7px);width:calc(var(--u)*${w}px)">
          <i style="height:1px;background:${tn}"></i><i style="height:1px;background:color-mix(in srgb,${tn} 45%,transparent)"></i></span>`;
      if(v==='dotted')
        return `<span data-anim="line" style="--d:${d};width:calc(var(--u)*${w}px);border-top:calc(var(--u)*0.5px) dotted ${tn};display:block"></span>`;
      if(v==='slashes')
        return `<span class="fm" data-anim="clip" style="--d:${d};font-family:var(--fm);font-weight:700;letter-spacing:.14em;color:${tn};font-size:calc(var(--u)*2.4px)">///</span>`;
      /* solid */
      return `<span class="bar" data-anim="line" style="--d:${d};display:block;width:calc(var(--u)*${w}px);background:${tn}"></span>`;
    },

    /* ---- papel: assinatura da marca (handle) ---- */
    handle(v, X, d='1.25s'){
      const h = F.esc(F.state.brand.handle);
      if(v==='pill')
        return `<span class="handle" data-anim="fade-up" style="--d:${d};border:1px solid color-mix(in srgb,var(--b-fg) 30%,transparent);padding:.45em 1em;border-radius:99em;opacity:.85">${h}</span>`;
      if(v==='mono')
        return `<span class="handle" data-anim="fade-up" style="--d:${d};font-family:var(--fm);letter-spacing:.12em;opacity:.7">${h}</span>`;
      return `<span class="handle" data-anim="fade-up" style="--d:${d}">${h}</span>`;
    },

    /* ---- papel: pele de cartão (painéis/superfícies elevadas) ---- */
    cardStyle(v, X){
      if(v==='glass')
        return `background:color-mix(in srgb,var(--b-bg) 55%,transparent);backdrop-filter:blur(10px);border:1px solid color-mix(in srgb,var(--b-fg) 26%,transparent);border-radius:${RAD(X)};${SHW(X)}`;
      if(v==='outline')
        return `background:color-mix(in srgb,var(--b-bg) 55%,transparent);border:calc(var(--u)*0.26px) solid color-mix(in srgb,var(--b-fg) 32%,transparent);border-radius:${RAD(X)};`;
      if(v==='hard')
        return `background:var(--b-bg);border:calc(var(--u)*0.3px) solid var(--b-fg);border-radius:0;${SHW({...X,shadow:'hard'})}`;
      /* flat */
      return `background:color-mix(in srgb,var(--b-bg) 92%,transparent);border:1px solid color-mix(in srgb,var(--b-fg) 14%,transparent);border-radius:${RAD(X)};${SHW(X)}`;
    },
  };
})(window.FORMA);
