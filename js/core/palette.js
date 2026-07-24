/* =====================================================
   FORJE·studio — core/palette.js  (NOVO · fundação Eixo 1)
   Variantes de paleta BRAND-FIRST (P2): permutações de
   p1/p2/ac, inversão bg↔fg e tints/shades dos PRÓPRIOS
   tons — nenhum hue novo entra pelo gerador.
   Guardrail de contraste (P4): variantes com texto
   ilegível são descartadas do espaço ANTES do sorteio.
   Tudo determinístico e puro (P3).
   Carregar após core/state.js e antes de core/render.js.
   ===================================================== */
(function(F){
  'use strict';

  /* ---------- cor: helpers puros ---------- */
  const hex2rgb = h=>{
    let s = String(h||'').trim().replace('#','');
    if(s.length===3) s = s.split('').map(c=>c+c).join('');
    const n = parseInt(s,16);
    return (isFinite(n) && s.length===6) ? [n>>16&255, n>>8&255, n&255] : null;
  };
  const rgb2hex = c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  /* mistura linear com branco/preto — tint/shade preservando o hue do tom */
  F.mixHex = function(h, other, k){
    const a = hex2rgb(h), b = hex2rgb(other);
    if(!a || !b) return h;
    return rgb2hex(a.map((v,i)=>v+(b[i]-v)*k));
  };

  /* luminância relativa (WCAG) e razão de contraste */
  const lum = h=>{
    const c = hex2rgb(h); if(!c) return 0;
    const f = v=>{ v/=255; return v<=.03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); };
    return .2126*f(c[0]) + .7152*f(c[1]) + .0722*f(c[2]);
  };
  F.contrastRatio = (a,b)=>{ const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05); };
  F.contrastOK = (bg, fg, min=4.5)=>F.contrastRatio(bg, fg) >= min;

  /* ---------- espaço de variantes ----------
     6 permutações de (p1,p2,ac) × inversão opcional bg↔fg ×
     3 níveis (original / tint / shade) ≈ 20–36 candidatas,
     deduplicadas e filtradas por contraste. */
  const PERMS  = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
  const LEVELS = [null, ['#ffffff',.16], ['#000000',.2]];

  F.paletteVariants = function(brand){
    const b = brand || F.state.brand, base = [b.p1, b.p2, b.ac];
    const out = [], seen = {};
    for(const inv of [false, true]){
      const bg = inv ? b.fg : b.bg, fg = inv ? b.bg : b.fg;
      if(!F.contrastOK(bg, fg)) continue;          // P4: reprovada nem entra no sorteio
      for(const lv of LEVELS){
        for(const pm of PERMS){
          let t = pm.map(i=>base[i]);
          if(lv) t = t.map(h=>F.mixHex(h, lv[0], lv[1]));
          const v = {p1:t[0], p2:t[1], ac:t[2], bg, fg};
          const k = [v.p1,v.p2,v.ac,v.bg,v.fg].join('|');
          if(seen[k]) continue; seen[k] = 1;
          out.push(v);
        }
      }
    }
    /* variante 0 é SEMPRE a identidade (a paleta da marca como está) —
       o índice 0 nunca muda um projeto existente */
    const idk = [b.p1,b.p2,b.ac,b.bg,b.fg].join('|');
    const i0 = out.findIndex(v=>[v.p1,v.p2,v.ac,v.bg,v.fg].join('|')===idk);
    if(i0 > 0){ const [ident] = out.splice(i0,1); out.unshift(ident); }
    else if(i0 < 0) out.unshift({p1:b.p1, p2:b.p2, ac:b.ac, bg:b.bg, fg:b.fg});
    return out;
  };
  F.paletteVariant = function(n, brand){
    const vs = F.paletteVariants(brand);
    return vs[((n % vs.length) + vs.length) % vs.length] || vs[0];
  };
})(window.FORMA);
