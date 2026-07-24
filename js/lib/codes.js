/* =====================================================
   FORJE·studio — lib/codes.js
   Códigos REAIS e escaneáveis para a composição:
   · F.qrSVG(texto)      → QR Code (vendor qrcode-generator,
     correção M, zona de silêncio de 4 módulos, UTF-8)
   · F.barcodeSVG(texto) → Code 128 (subconjuntos B/C com
     seleção automática e dígito verificador — norma
     ISO/IEC 15417)
   Ambos são determinísticos: o mesmo conteúdo gera sempre
   o mesmo código, em qualquer preview e em todos os exports.
   ===================================================== */
(function(F){
  'use strict';

  /* ---------- QR Code ---------- */
  F.qrSVG = function(text){
    try{
      if(typeof qrcode !== 'function') throw new Error('lib QR indisponível');
      const qr = qrcode(0, 'M');            // tipo 0 = menor versão que couber
      qr.addData(String(text||''), 'Byte'); // Byte + override UTF-8 do vendor
      qr.make();
      const n = qr.getModuleCount(), Q = 4; // zona de silêncio: 4 módulos (norma)
      const size = n + Q*2;
      let d = '';
      for(let y=0;y<n;y++) for(let x=0;x<n;x++)
        if(qr.isDark(y,x)) d += `M${x+Q} ${y+Q}h1v1h-1z`;
      /* shape-rendering:crispEdges — módulos sem antialiasing = leitura confiável */
      return `<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" style="width:100%;display:block" role="img" aria-label="QR code">`
        + `<rect width="${size}" height="${size}" fill="#fff"/>`
        + `<path d="${d}" fill="#111"/></svg>`;
    }catch(e){
      return `<svg viewBox="0 0 29 29" style="width:100%;display:block"><rect width="29" height="29" fill="#fff"/><text x="14.5" y="16" text-anchor="middle" font-size="3" fill="#111">conteúdo longo demais</text></svg>`;
    }
  };

  /* ---------- Code 128 ----------
     Tabela oficial de padrões (larguras barra/espaço, 11 módulos por
     símbolo; stop = 13). Índices 0–102 são os valores dos caracteres,
     103–105 os starts A/B/C, 106 o stop. */
  const C128 = ('212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 '
    + '221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 '
    + '221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 '
    + '212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 '
    + '231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 '
    + '231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 '
    + '314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 '
    + '112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 '
    + '111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 '
    + '214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 '
    + '114131 311141 411131 211412 211214 211232 2331112').split(' ');

  /* codifica em valores Code 128 com seleção automática B/C:
     trechos 100% numéricos com 4+ dígitos entram em C (2 dígitos por
     símbolo = barras mais curtas); o resto em B (ASCII 32–126). */
  function c128values(text){
    const s = [...String(text)].map(ch=>{
      const c = ch.codePointAt(0);
      return (c>=32 && c<=126) ? ch : ' ';       // fora do conjunto B → espaço
    }).join('');
    if(!s) return null;
    const vals = [];
    let mode = null, i = 0;
    const digitRun = j=>{ let k=j; while(k<s.length && s[k]>='0' && s[k]<='9') k++; return k-j; };
    while(i < s.length){
      const run = digitRun(i);
      const useC = run>=4 || (run>=2 && i===0 && run===s.length);
      if(useC){
        const take = run - (run%2);              // C usa pares de dígitos
        if(mode===null){ vals.push(105); mode='C'; }
        else if(mode!=='C'){ vals.push(99); mode='C'; }
        for(let k=0;k<take;k+=2) vals.push(+s.substr(i+k,2));
        i += take;
      } else {
        if(mode===null){ vals.push(104); mode='B'; }
        else if(mode!=='B'){ vals.push(100); mode='B'; }
        vals.push(s.charCodeAt(i)-32);
        i++;
      }
    }
    let sum = vals[0];
    for(let k=1;k<vals.length;k++) sum += vals[k]*k;
    vals.push(sum % 103);                        // dígito verificador
    vals.push(106);                              // stop
    return vals;
  }

  F.barcodeSVG = function(text){
    const vals = c128values(text);
    if(!vals) return '';
    const Q = 10;                                // zona de silêncio ≥10 módulos
    let x = Q, rects = '';
    vals.forEach(v=>{
      const pat = C128[v];
      for(let k=0;k<pat.length;k++){
        const w = +pat[k];
        if(k%2===0) rects += `<rect x="${x}" y="0" width="${w}" height="30" fill="currentColor"/>`;
        x += w;
      }
    });
    const W = x + Q;
    return `<svg viewBox="0 0 ${W} 30" preserveAspectRatio="none" shape-rendering="crispEdges" style="width:100%;display:block" role="img" aria-label="código de barras">${rects}</svg>`;
  };
})(window.FORMA);
