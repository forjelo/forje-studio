/* =====================================================
   FORJE·studio — lib/shapes.js
   Biblioteca de FORMAS GEOMÉTRICAS (registry expansível).
   Cada forma: {n, cat, prev, html(props)}
   - prev: HTML da pré-visualização 22px (usa currentColor)
   - html: render final no palco (props do formulário COMPOR:
     kind, sw, sh, fill, nofill, op, rot, rad, bw, bc)
   Os ids legados (rect, pill, circle, ring, tri, star, line)
   continuam com saída visual idêntica — nada regride.
   Expandir = F.shapes.register(id, {...}).
   ===================================================== */
(function(F){
  F.shapes = (function(){ const map={}; return {
    map, register:(id,def)=>map[id]=def, get:id=>map[id],
    ids:()=>Object.keys(map), entries:()=>Object.entries(map)}; })();

  /* ---------- contexto derivado das props ---------- */
  function ctx(p){
    const sw = +p.sw||16, sh = +p.sh||16;
    const col = p.fill||'#F5620F';
    const fill = p.nofill ? 'transparent' : col;
    const op = (p.op!=null ? +p.op : 100)/100, rot = +p.rot||0;
    const rad = +p.rad||0, bw = +p.bw||0, bc = p.bc||col;
    return { sw, sh, col, fill, op, rot, rad, bw, bc, nofill:!!p.nofill,
      W:`width:calc(var(--u)*${sw}px);`, H:`height:calc(var(--u)*${sh}px);`,
      base:`opacity:${op};rotate:${rot}deg;`,
      bord: bw ? `border:calc(var(--u)*${bw}px) solid ${bc};` : '',
      box:'box-sizing:border-box;' };
  }
  /* div simples com estilo extra */
  const dv = (c, extra) => `<div style="${c.W}${c.H}${c.base}${extra}"></div>`;
  /* forma via clip-path (contorno não se aplica — recorte) */
  const clip = (c, poly) => dv(c, `clip-path:polygon(${poly});background:${c.fill||c.col}`);
  /* forma via SVG preenchido (estica no box; contorno = bw) */
  function svgFill(c, body){
    const swv = (c.bw || (c.nofill ? 1.4 : 0)) * 100/Math.max(1,c.sw);
    const at = `fill="${c.nofill?'none':c.col}"${(c.bw||c.nofill)?` stroke="${c.nofill&&!c.bw?c.col:c.bc}" stroke-width="${swv.toFixed(1)}" stroke-linejoin="round"`:''}`;
    return `<div style="${c.W}${c.H}${c.base}"><svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block;overflow:visible">${body(at)}</svg></div>`;
  }
  /* forma de TRAÇO (linha viva): usa a cor principal como stroke */
  function svgStroke(c, d, cap='round'){
    const swv = Math.max(1.5, (c.bw||2) * 100/Math.max(1,c.sw));
    return `<div style="${c.W}${c.H}${c.base}"><svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block;overflow:visible"><path d="${d}" fill="none" stroke="${c.col}" stroke-width="${swv.toFixed(1)}" stroke-linecap="${cap}" stroke-linejoin="round"/></svg></div>`;
  }
  /* polígono estrelado paramétrico (pontas n, raio interno ir%) */
  function starPts(n, ir){
    const pts=[];
    for(let k=0;k<n*2;k++){
      const a = Math.PI*k/n - Math.PI/2, r = k%2 ? ir : 50;
      pts.push((50+r*Math.cos(a)).toFixed(1)+'% '+(50+r*Math.sin(a)).toFixed(1)+'%');
    }
    return pts.join(',');
  }
  /* pré-visualização 22px genérica */
  const pv = css => `<i style="${css}"></i>`;
  const pvClip = poly => pv(`width:20px;height:20px;clip-path:polygon(${poly});background:currentColor`);
  const pvSvg = (body, stroke) => `<svg viewBox="0 0 100 100" style="width:20px;height:20px;overflow:visible">${
    stroke ? `<path d="${body}" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` : body}</svg>`;

  const s = (id, n, cat, prev, html) => F.shapes.register(id, {n, cat, prev, html});
  const P = {}; // polígonos nomeados (reutilizados em prev + render)
  P.tri      = '50% 0,100% 100%,0 100%';
  P.triDown  = '0 0,100% 0,50% 100%';
  P.triRight = '0 0,100% 50%,0 100%';
  P.diamond  = '50% 0,100% 50%,50% 100%,0 50%';
  P.pent     = '50% 0,100% 38%,81% 100%,19% 100%,0 38%';
  P.hex      = '25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%';
  P.oct      = '30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%';
  P.par      = '22% 0,100% 0,78% 100%,0 100%';
  P.trap     = '20% 0,80% 0,100% 100%,0 100%';
  P.star5    = '50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%'; /* legado */
  P.star4    = starPts(4, 20);
  P.star6    = starPts(6, 30);
  P.star8    = starPts(8, 32);
  P.burst    = starPts(12, 40);
  P.arrow    = '0 32%,58% 32%,58% 8%,100% 50%,58% 92%,58% 68%,0 68%';
  P.chevron  = '0 0,65% 0,100% 50%,65% 100%,0 100%,35% 50%';
  P.plus     = '35% 0,65% 0,65% 35%,100% 35%,100% 65%,65% 65%,65% 100%,35% 100%,35% 65%,0 65%,0 35%,35% 35%';
  P.bolt     = '58% 0,20% 56%,44% 56%,36% 100%,80% 40%,54% 40%';
  P.shield   = '50% 0,100% 15%,92% 65%,50% 100%,8% 65%,0 15%';
  P.banner   = '0 0,100% 0,88% 50%,100% 100%,0 100%';
  P.speech   = '0 0,100% 0,100% 74%,32% 74%,14% 100%,16% 74%,0 74%';
  P.ticket   = '0 0,100% 0,100% 38%,94% 42%,94% 58%,100% 62%,100% 100%,0 100%,0 62%,6% 58%,6% 42%,0 38%';

  /* ══════════ BÁSICAS ══════════ */
  s('rect','Retângulo','Básicas', pv('width:22px;height:16px;border-radius:3px;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:calc(var(--u)*${c.rad}px);background:${c.fill}`);});
  s('square','Quadrado','Básicas', pv('width:17px;height:17px;border-radius:3px;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:calc(var(--u)*${c.rad}px);background:${c.fill}`);});
  s('pill','Pílula','Básicas', pv('width:24px;height:12px;border-radius:999px;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:999px;background:${c.fill}`);});
  s('circle','Círculo','Básicas', pv('width:18px;height:18px;border-radius:50%;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:50%;background:${c.fill}`);});
  s('ring','Anel','Básicas', pv('width:18px;height:18px;border-radius:50%;border:3px solid currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.box}border:calc(var(--u)*${c.bw||1.6}px) solid ${c.col};border-radius:50%;background:transparent`);});
  s('semi','Semicírculo','Básicas', pv('width:20px;height:10px;border-radius:20px 20px 0 0;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:50% 50% 0 0/100% 100% 0 0;background:${c.fill}`);});
  s('quarter','Quarto de círculo','Básicas', pv('width:18px;height:18px;border-radius:100% 0 0 0;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:100% 0 0 0;background:${c.fill}`);});
  s('squircle','Squircle','Básicas', pv('width:18px;height:18px;border-radius:30%;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:28%;background:${c.fill}`);});
  s('egg','Ovo','Básicas', pv('width:15px;height:19px;border-radius:50% 50% 50% 50%/62% 62% 40% 40%;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:50% 50% 50% 50%/62% 62% 40% 40%;background:${c.fill}`);});
  s('blob','Blob orgânico','Básicas', pv('width:19px;height:18px;border-radius:62% 38% 55% 45%/48% 60% 40% 52%;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:62% 38% 55% 45%/48% 60% 40% 52%;background:${c.fill}`);});
  s('leaf','Folha / pétala','Básicas', pv('width:17px;height:17px;border-radius:0 50% 0 50%;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:0 50% 0 50%;background:${c.fill}`);});
  s('frame','Moldura','Básicas', pv('width:20px;height:15px;border:2.5px solid currentColor;border-radius:3px'),
    p=>{const c=ctx(p); return dv(c,`${c.box}border:calc(var(--u)*${c.bw||0.8}px) solid ${c.col};border-radius:calc(var(--u)*${c.rad}px);background:transparent`);});
  s('tab','Aba','Básicas', pv('width:22px;height:13px;border-radius:6px 6px 0 0;background:currentColor'),
    p=>{const c=ctx(p); return dv(c,`${c.bord}${c.box}border-radius:calc(var(--u)*${c.rad||1.6}px) calc(var(--u)*${c.rad||1.6}px) 0 0;background:${c.fill}`);});

  /* ══════════ POLÍGONOS ══════════ */
  s('tri','Triângulo','Polígonos', pvClip(P.tri), p=>clip(ctx(p), P.tri));
  s('tri-down','Triângulo ▽','Polígonos', pvClip(P.triDown), p=>clip(ctx(p), P.triDown));
  s('tri-right','Triângulo ▷','Polígonos', pvClip(P.triRight), p=>clip(ctx(p), P.triRight));
  s('diamond','Losango','Polígonos', pvClip(P.diamond), p=>clip(ctx(p), P.diamond));
  s('pentagon','Pentágono','Polígonos', pvClip(P.pent), p=>clip(ctx(p), P.pent));
  s('hexagon','Hexágono','Polígonos', pvClip(P.hex), p=>clip(ctx(p), P.hex));
  s('octagon','Octógono','Polígonos', pvClip(P.oct), p=>clip(ctx(p), P.oct));
  s('parallel','Paralelogramo','Polígonos', pvClip(P.par), p=>clip(ctx(p), P.par));
  s('trapezoid','Trapézio','Polígonos', pvClip(P.trap), p=>clip(ctx(p), P.trap));

  /* ══════════ ESTRELAS & SELOS ══════════ */
  s('star','Estrela','Estrelas & selos', pvClip(P.star5), p=>clip(ctx(p), P.star5));
  s('star4','Brilho 4 pontas','Estrelas & selos', pvClip(P.star4), p=>clip(ctx(p), P.star4));
  s('star6','Estrela 6 pontas','Estrelas & selos', pvClip(P.star6), p=>clip(ctx(p), P.star6));
  s('star8','Estrela 8 pontas','Estrelas & selos', pvClip(P.star8), p=>clip(ctx(p), P.star8));
  s('burst','Selo / explosão','Estrelas & selos', pvClip(P.burst), p=>clip(ctx(p), P.burst));
  s('asterisk','Asterisco','Estrelas & selos', pvSvg('M50 6V94M12 28L88 72M88 28L12 72', true),
    p=>svgStroke(ctx(p), 'M50 6V94M12 28L88 72M88 28L12 72'));
  s('flower','Flor','Estrelas & selos', pvSvg('<circle cx="50" cy="22" r="19" fill="currentColor"/><circle cx="74" cy="36" r="19" fill="currentColor"/><circle cx="74" cy="64" r="19" fill="currentColor"/><circle cx="50" cy="78" r="19" fill="currentColor"/><circle cx="26" cy="64" r="19" fill="currentColor"/><circle cx="26" cy="36" r="19" fill="currentColor"/>'),
    p=>svgFill(ctx(p), at=>`<circle cx="50" cy="22" r="20" ${at}/><circle cx="74" cy="36" r="20" ${at}/><circle cx="74" cy="64" r="20" ${at}/><circle cx="50" cy="78" r="20" ${at}/><circle cx="26" cy="64" r="20" ${at}/><circle cx="26" cy="36" r="20" ${at}/>`));

  /* ══════════ SETAS & SÍMBOLOS ══════════ */
  s('arrow','Seta','Setas & símbolos', pvClip(P.arrow), p=>clip(ctx(p), P.arrow));
  s('chevron','Chevron','Setas & símbolos', pvClip(P.chevron), p=>clip(ctx(p), P.chevron));
  s('plus','Cruz / mais','Setas & símbolos', pvClip(P.plus), p=>clip(ctx(p), P.plus));
  s('bolt','Raio','Setas & símbolos', pvClip(P.bolt), p=>clip(ctx(p), P.bolt));
  s('heart','Coração','Setas & símbolos', pvSvg('<path d="M50 88L14 52A22 22 0 1 1 50 24A22 22 0 1 1 86 52Z" fill="currentColor"/>'),
    p=>svgFill(ctx(p), at=>`<path d="M50 88L14 52A22 22 0 1 1 50 24A22 22 0 1 1 86 52Z" ${at}/>`));
  s('drop','Gota','Setas & símbolos', pvSvg('<path d="M50 2C50 2 88 50 88 69A38 30 0 0 1 12 69C12 50 50 2 50 2Z" fill="currentColor"/>'),
    p=>svgFill(ctx(p), at=>`<path d="M50 2C50 2 88 50 88 69A38 30 0 0 1 12 69C12 50 50 2 50 2Z" ${at}/>`));
  s('crescent','Lua crescente','Setas & símbolos', pvSvg('<path d="M62 2A50 50 0 1 0 62 98A44 44 0 1 1 62 2Z" fill="currentColor"/>'),
    p=>svgFill(ctx(p), at=>`<path d="M62 2A50 50 0 1 0 62 98A44 44 0 1 1 62 2Z" ${at}/>`));
  s('shield','Escudo','Setas & símbolos', pvClip(P.shield), p=>clip(ctx(p), P.shield));
  s('speech','Balão de fala','Setas & símbolos', pvClip(P.speech), p=>clip(ctx(p), P.speech));
  s('banner','Faixa / fita','Setas & símbolos', pvClip(P.banner), p=>clip(ctx(p), P.banner));
  s('ticket','Cupom recortado','Setas & símbolos', pvClip(P.ticket), p=>clip(ctx(p), P.ticket));

  /* ══════════ LINHAS & TRAÇOS ══════════ */
  s('line','Linha','Linhas & traços', pv('width:24px;height:3px;border-radius:99px;background:currentColor'),
    p=>{const c=ctx(p); return `<div style="${c.W}height:calc(var(--u)*${Math.max(.2,c.bw||.7)}px);${c.base}border-radius:999px;background:${c.col}"></div>`;});
  s('line-v','Linha vertical','Linhas & traços', pv('width:3px;height:22px;border-radius:99px;background:currentColor'),
    p=>{const c=ctx(p); return `<div style="width:calc(var(--u)*${Math.max(.2,c.bw||.7)}px);${c.H}${c.base}border-radius:999px;background:${c.col}"></div>`;});
  s('dashes','Linha tracejada','Linhas & traços', pvSvg('M4 50H96', true).replace('stroke-width="9"','stroke-width="9" stroke-dasharray="14 12"'),
    p=>{const c=ctx(p); const swv=Math.max(1.5,(c.bw||2)*100/Math.max(1,c.sw));
      return `<div style="${c.W}${c.H}${c.base}"><svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block;overflow:visible"><path d="M2 50H98" fill="none" stroke="${c.col}" stroke-width="${swv.toFixed(1)}" stroke-linecap="round" stroke-dasharray="10 8"/></svg></div>`;});
  s('wave','Onda','Linhas & traços', pvSvg('M2 60Q14 20 26 60T50 60T74 60T98 60', true),
    p=>svgStroke(ctx(p), 'M2 60Q14 20 26 60T50 60T74 60T98 60'));
  s('zigzag','Zigue-zague','Linhas & traços', pvSvg('M2 70L18 30L34 70L50 30L66 70L82 30L98 70', true),
    p=>svgStroke(ctx(p), 'M2 70L18 30L34 70L50 30L66 70L82 30L98 70'));
  s('arc','Arco','Linhas & traços', pvSvg('M8 82A42 42 0 0 1 92 82', true),
    p=>svgStroke(ctx(p), 'M8 82A42 42 0 0 1 92 82'));
  s('spiral','Espiral','Linhas & traços', pvSvg('M50 50m0 -6a6 6 0 0 1 6 6a12 12 0 0 1 -12 12a20 20 0 0 1 -20 -20a30 30 0 0 1 30 -30a40 40 0 0 1 40 40', true),
    p=>svgStroke(ctx(p), 'M50 50m0 -6a6 6 0 0 1 6 6a12 12 0 0 1 -12 12a20 20 0 0 1 -20 -20a30 30 0 0 1 30 -30a40 40 0 0 1 40 40'));

  /* nome amigável (usado nas listas do painel COMPOR) */
  F.shapeName = kind => (F.shapes.get(kind)||{}).n || 'Retângulo';
})(window.FORMA);
