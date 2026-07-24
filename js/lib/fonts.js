/* =====================================================
   FORJE·studio — lib/fonts.js
   Catálogo de fontes por PAPEL (display/body), expansível.
   Para adicionar: FORMA.fonts.register(id,{n,css,gf,role})
   e incluir a família no link do Google Fonts (index.html).
   Fontes custom (.ttf/.otf/.woff2) entram via upload e são
   persistidas em dataURL dentro do brandbook.
   ===================================================== */
(function(F){
  const r = (id,n,css,role)=>F.fonts.register(id,{n,css,role});

  /* display — personalidade */
  r('archivo',  'Archivo Black',   "'Archivo Black',sans-serif",        'display');
  r('anton',    'Anton',           "'Anton',sans-serif",                'display');
  r('bebas',    'Bebas Neue',      "'Bebas Neue',sans-serif",           'display');
  r('space',    'Space Grotesk',   "'Space Grotesk',sans-serif",        'both');
  r('sora',     'Sora',            "'Sora',sans-serif",                 'both');
  r('syne',     'Syne',            "'Syne',sans-serif",                 'display');
  r('unbounded','Unbounded',       "'Unbounded',sans-serif",            'display');
  r('playfair', 'Playfair Display',"'Playfair Display',serif",          'display');
  r('fraunces', 'Fraunces',        "'Fraunces',serif",                  'display');
  r('dmserif',  'DM Serif Display',"'DM Serif Display',serif",          'display');

  /* body — leitura */
  r('inter',    'Inter',           "'Inter',sans-serif",                'body');
  r('manrope',  'Manrope',         "'Manrope',sans-serif",              'body');
  r('outfit',   'Outfit',          "'Outfit',sans-serif",               'body');
  r('worksans', 'Work Sans',       "'Work Sans',sans-serif",            'body');
  r('plexmono', 'IBM Plex Mono',   "'IBM Plex Mono',monospace",         'both');
  r('jetbrains','JetBrains Mono',  "'JetBrains Mono',monospace",        'both');

  /* resolve o css de uma fonte (catálogo ou custom do brandbook) */
  F.fontCSS = function(id){
    if(id && id.startsWith('custom:')){
      const name = id.slice(7);
      return `'${name}',sans-serif`;
    }
    const f = F.fonts.get(id);
    return f ? f.css : "'Inter',sans-serif";
  };

  /* carrega as fontes custom do brandbook no documento via FontFace */
  F.loadCustomFonts = async function(){
    const list = F.state.brand.customFonts || [];
    for(const cf of list){
      try{
        const ff = new FontFace(cf.name, `url(${cf.data})`);
        await ff.load(); document.fonts.add(ff);
      }catch(e){ console.warn('fonte custom falhou:', cf.name, e); }
    }
  };
  F.addCustomFont = async function(file){
    const name = file.name.replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9 _-]/g,'');
    const data = await new Promise((res,rej)=>{ const rd=new FileReader();
      rd.onload=()=>res(rd.result); rd.onerror=rej; rd.readAsDataURL(file); });
    const ff = new FontFace(name, `url(${data})`);
    await ff.load(); document.fonts.add(ff);
    F.state.brand.customFonts = F.state.brand.customFonts || [];
    F.state.brand.customFonts.push({name, data});
    return 'custom:'+name;
  };
})(window.FORMA);
