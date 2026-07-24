/* =====================================================
   FORJE·studio — core/export-doc.js
   Exportação de DOCUMENTOS, 100% no navegador e sem
   dependências externas:
   · PDF  — cada slide/cena vira uma página; a arte é
     rasterizada e ocupa a página INTEIRA (full-bleed,
     sem bordas: o conteúdo se adequa perfeitamente).
     Formato E-book A4 sai em página A4 exata; os demais
     saem em páginas na proporção exata da arte.
   · PPTX — pacote OOXML real (zip escrito à mão) com um
     slide por arte, pronto para PowerPoint e para
     importar no Google Apresentações. O tamanho do
     slide segue a proporção do formato escolhido.
   Design → páginas/slides do carrossel.
   Motion → cada cena vira uma página/slide (frame final).
   ===================================================== */
(function(F){
  const te = new TextEncoder();

  /* ---------- CRC-32 (zip) ---------- */
  const CRC_T = (()=>{ const t = new Uint32Array(256);
    for(let i=0;i<256;i++){ let c=i;
      for(let k=0;k<8;k++) c = c&1 ? 0xEDB88320 ^ (c>>>1) : c>>>1;
      t[i]=c>>>0; } return t; })();
  const crc32 = d => { let c=0xFFFFFFFF;
    for(let i=0;i<d.length;i++) c = CRC_T[(c^d[i])&255] ^ (c>>>8);
    return (c^0xFFFFFFFF)>>>0; };

  /* ---------- escritor ZIP (método stored) ---------- */
  function makeZip(files){                 // files: [{name, data:string|Uint8Array}]
    const parts=[], cdir=[]; let off=0;
    files.forEach(f=>{
      const nm = te.encode(f.name);
      const d  = typeof f.data==='string' ? te.encode(f.data) : f.data;
      const crc = crc32(d);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0,0x04034b50,true); lh.setUint16(4,20,true);
      lh.setUint32(14,crc,true); lh.setUint32(18,d.length,true); lh.setUint32(22,d.length,true);
      lh.setUint16(26,nm.length,true);
      parts.push(new Uint8Array(lh.buffer), nm, d);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0,0x02014b50,true); ch.setUint16(4,20,true); ch.setUint16(6,20,true);
      ch.setUint32(16,crc,true); ch.setUint32(20,d.length,true); ch.setUint32(24,d.length,true);
      ch.setUint16(28,nm.length,true); ch.setUint32(42,off,true);
      cdir.push(new Uint8Array(ch.buffer), nm);
      off += 30 + nm.length + d.length;
    });
    let cdLen=0; cdir.forEach(c=>cdLen+=c.length);
    const eo = new DataView(new ArrayBuffer(22));
    eo.setUint32(0,0x06054b50,true);
    eo.setUint16(8,files.length,true); eo.setUint16(10,files.length,true);
    eo.setUint32(12,cdLen,true); eo.setUint32(16,off,true);
    const all=[...parts,...cdir,new Uint8Array(eo.buffer)];
    let total=0; all.forEach(c=>total+=c.length);
    const out=new Uint8Array(total); let p=0;
    all.forEach(c=>{ out.set(c,p); p+=c.length; });
    return out;
  }

  /* ---------- captura de todas as artes do modo atual ---------- */
  async function eachArt(onArt, label){
    const s = F.state;
    const design = s.mode==='design';
    const n = design ? s.slides.length : s.timeline.length;
    if(!design && !n) throw new Error('adicione cenas à timeline primeiro');
    const keep = design ? s.cur : s.curScene;
    try{
      for(let i=0;i<n;i++){
        if(design) s.cur = i; else s.curScene = i;
        F.render();
        await F.settleStatic();
        const cv = await F.snapshot(1, s.brand.bg);      // fundo sólido: páginas não têm alfa
        await onArt(cv, i, n);
        F.progSet((i+1)/n, `${label} ${i+1}/${n}`);
        await new Promise(r=>setTimeout(r,40));
      }
    } finally {
      if(design) s.cur = keep; else s.curScene = keep;
    }
    return n;
  }
  const canvasJPEG = cv => new Promise((res,rej)=>
    cv.toBlob(async b=>{ if(!b) return rej(new Error('rasterização vazia'));
      res(new Uint8Array(await b.arrayBuffer())); }, 'image/jpeg', .92));

  /* =====================================================
     PDF — escritor mínimo com imagens JPEG (DCTDecode)
  ===================================================== */
  function buildPDF(pages){                // pages: [{jpeg,w,h,ptW,ptH}]
    const objs = [];
    const kids = pages.map((_,i)=>`${3+i*3} 0 R`).join(' ');
    objs.push(`<< /Type /Catalog /Pages 2 0 R >>`);
    objs.push(`<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>`);
    pages.forEach((pg,i)=>{
      const cn = 3+i*3+1, xn = 3+i*3+2;
      objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pg.ptW} ${pg.ptH}] /Resources << /XObject << /Im${i} ${xn} 0 R >> /ProcSet [/PDF /ImageC] >> /Contents ${cn} 0 R >>`);
      const cont = `q ${pg.ptW} 0 0 ${pg.ptH} 0 0 cm /Im${i} Do Q`;
      objs.push({head:`<< /Length ${cont.length} >>`, data:te.encode(cont)});
      objs.push({head:`<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpeg.length} >>`, data:pg.jpeg});
    });
    const parts=[ Uint8Array.from([0x25,0x50,0x44,0x46,0x2D,0x31,0x2E,0x34,0x0A,0x25,0xE2,0xE3,0xCF,0xD3,0x0A]) ]; // %PDF-1.4 + binário
    const offs=[]; let off=parts[0].length;
    const push = u8 => { parts.push(u8); off += u8.length; };
    objs.forEach((o,i)=>{
      offs.push(off);
      push(te.encode(`${i+1} 0 obj\n${typeof o==='string'?o:o.head}\n`));
      if(typeof o!=='string'){ push(te.encode('stream\n')); push(o.data); push(te.encode('\nendstream\n')); }
      push(te.encode('endobj\n'));
    });
    const xrefOff = off;
    let xr = `xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;
    offs.forEach(o=>{ xr += String(o).padStart(10,'0')+' 00000 n \n'; });
    xr += `trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xrefOff}\n%%EOF`;
    push(te.encode(xr));
    let total=0; parts.forEach(c=>total+=c.length);
    const out=new Uint8Array(total); let p=0;
    parts.forEach(c=>{ out.set(c,p); p+=c.length; });
    return out;
  }

  F.exportPDF = async function(){
    const s = F.state, fmt = F.FORMATS[s.format];
    /* página em pontos: A4 exato quando a proporção bate (E-book A4);
       senão, página na proporção exata da arte (96px → 72pt) */
    const isA4 = Math.abs((fmt.w/fmt.h) - (210/297)) < 0.012;
    const ptW = isA4 ? 595.28 : +(fmt.w*0.75).toFixed(2);
    const ptH = isA4 ? 841.89 : +(fmt.h*0.75).toFixed(2);
    F.prog(true, 'Compondo PDF…'); F.progSet(0);
    try{
      const pages=[];
      const n = await eachArt(async cv=>{
        pages.push({jpeg:await canvasJPEG(cv), w:cv.width, h:cv.height, ptW, ptH});
      }, 'página');
      F.progSet(1, 'escrevendo arquivo…');
      const pdf = buildPDF(pages);
      F.download(new Blob([pdf],{type:'application/pdf'}), `forje_${s.mode==='design'?s.tpl:'timeline'}.pdf`);
      F.toast(`PDF exportado — ${n} página${n>1?'s':''}${isA4?' em A4':''}, conteúdo full-bleed ajustado ao documento.`);
    }catch(e){ console.error(e); F.toast('Falha no PDF: '+e.message); }
    finally{ F.render(); F.prog(false); }
  };

  /* =====================================================
     PPTX — pacote OOXML mínimo (1 imagem full-bleed/slide)
  ===================================================== */
  const XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
  const NS = {
    a:'http://schemas.openxmlformats.org/drawingml/2006/main',
    r:'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    p:'http://schemas.openxmlformats.org/presentationml/2006/main',
    ct:'http://schemas.openxmlformats.org/package/2006/content-types',
    rel:'http://schemas.openxmlformats.org/package/2006/relationships',
  };
  const R = {
    doc:'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
    master:'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster',
    layout:'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout',
    slide:'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide',
    theme:'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
    image:'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
    core:'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
    app:'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties',
  };
  const rels = items => XML+`<Relationships xmlns="${NS.rel}">`+
    items.map(([id,type,tg])=>`<Relationship Id="${id}" Type="${type}" Target="${tg}"/>`).join('')+`</Relationships>`;
  const emptyTree = `<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>`;
  function theme1(b){
    const hex = c => String(c||'#888888').replace('#','').slice(0,6).toUpperCase();
    return XML+`<a:theme xmlns:a="${NS.a}" name="Forje"><a:themeElements><a:clrScheme name="Forje"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="${hex(b.bg)}"/></a:dk2><a:lt2><a:srgbClr val="${hex(b.fg)}"/></a:lt2><a:accent1><a:srgbClr val="${hex(b.ac)}"/></a:accent1><a:accent2><a:srgbClr val="${hex(b.p1)}"/></a:accent2><a:accent3><a:srgbClr val="${hex(b.p2)}"/></a:accent3><a:accent4><a:srgbClr val="${hex(b.ac)}"/></a:accent4><a:accent5><a:srgbClr val="${hex(b.p1)}"/></a:accent5><a:accent6><a:srgbClr val="${hex(b.p2)}"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Forje"><a:majorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;
  }
  const slideXML = (cx,cy) => XML+`<p:sld xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:pic><p:nvPicPr><p:cNvPr id="2" name="Arte Forje"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId2"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;

  F.exportPPTX = async function(){
    const s = F.state, fmt = F.FORMATS[s.format];
    /* EMU: lado maior = 12192000 (o 16:9 padrão sai exatamente 13,33×7,5in) */
    const k = 12192000/Math.max(fmt.w, fmt.h);
    const cx = Math.round(fmt.w*k), cy = Math.round(fmt.h*k);
    F.prog(true, 'Compondo PPTX…'); F.progSet(0);
    try{
      const imgs=[];
      const n = await eachArt(async cv=>{ imgs.push(await canvasJPEG(cv)); }, 'slide');
      F.progSet(1, 'empacotando…');
      const files = [];
      const overrides = imgs.map((_,i)=>
        `<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('');
      files.push({name:'[Content_Types].xml', data: XML+`<Types xmlns="${NS.ct}"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${overrides}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`});
      files.push({name:'_rels/.rels', data: rels([['rId1',R.doc,'ppt/presentation.xml'],['rId2',R.core,'docProps/core.xml'],['rId3',R.app,'docProps/app.xml']])});
      const brand = F.esc(s.brand.name||'Forje');
      files.push({name:'docProps/core.xml', data: XML+`<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${brand} — FORJE·studio</dc:title><dc:creator>FORJE·studio</dc:creator></cp:coreProperties>`});
      files.push({name:'docProps/app.xml', data: XML+`<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>FORJE·studio</Application><Slides>${n}</Slides></Properties>`});
      files.push({name:'ppt/presentation.xml', data: XML+`<p:presentation xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${imgs.map((_,i)=>`<p:sldId id="${256+i}" r:id="rId${2+i}"/>`).join('')}</p:sldIdLst><p:sldSz cx="${cx}" cy="${cy}"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`});
      files.push({name:'ppt/_rels/presentation.xml.rels', data: rels([
        ['rId1',R.master,'slideMasters/slideMaster1.xml'],
        ...imgs.map((_,i)=>[`rId${2+i}`,R.slide,`slides/slide${i+1}.xml`]),
        [`rId${2+imgs.length}`,R.theme,'theme/theme1.xml'],
      ])});
      files.push({name:'ppt/slideMasters/slideMaster1.xml', data: XML+`<p:sldMaster xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}">${emptyTree}<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`});
      files.push({name:'ppt/slideMasters/_rels/slideMaster1.xml.rels', data: rels([['rId1',R.layout,'../slideLayouts/slideLayout1.xml'],['rId2',R.theme,'../theme/theme1.xml']])});
      files.push({name:'ppt/slideLayouts/slideLayout1.xml', data: XML+`<p:sldLayout xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}" type="blank" preserve="1">${emptyTree}<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`});
      files.push({name:'ppt/slideLayouts/_rels/slideLayout1.xml.rels', data: rels([['rId1',R.master,'../slideMasters/slideMaster1.xml']])});
      files.push({name:'ppt/theme/theme1.xml', data: theme1(s.brand)});
      imgs.forEach((jpg,i)=>{
        files.push({name:`ppt/slides/slide${i+1}.xml`, data: slideXML(cx,cy)});
        files.push({name:`ppt/slides/_rels/slide${i+1}.xml.rels`, data: rels([['rId1',R.layout,'../slideLayouts/slideLayout1.xml'],['rId2',R.image,`../media/image${i+1}.jpeg`]])});
        files.push({name:`ppt/media/image${i+1}.jpeg`, data: jpg});
      });
      const zip = makeZip(files);
      F.download(new Blob([zip],{type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'}),
        `forje_${s.mode==='design'?s.tpl:'timeline'}.pptx`);
      F.toast(`PPTX exportado — ${n} slide${n>1?'s':''}, abre no PowerPoint e importa no Google Apresentações.`);
    }catch(e){ console.error(e); F.toast('Falha no PPTX: '+e.message); }
    finally{ F.render(); F.prog(false); }
  };
})(window.FORMA);
