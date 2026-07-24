/* =====================================================
   FORJE·studio — core/growth.js
   Marketing & captura de leads (proof of concept público):
   · Gate de e-mail no PRIMEIRO export do navegador,
     identificado por UID de fingerprint (sem cookies).
   · Lista de leads persistida como JSON no storage da
     aplicação (window.storage → IndexedDB), com export
     CSV: console → FORMA.leads.download()
   · Endpoint: FORMA.LEADS_ENDPOINT aponta para o ingest da
     Forjelo — cada lead também vai via POST form-urlencoded.
   · Pop-up promocional Forjelo ao abrir o estúdio.
   Ordem de carga: depois de export/export-doc, antes de app.js.
   ===================================================== */
(function(F){
  'use strict';

  /* Endpoint de ingest da Forjelo — recebe cada lead via POST
     application/x-www-form-urlencoded (campo obrigatório: email;
     opcionais: name, message). Vazio = só salva local. */
  F.LEADS_ENDPOINT = 'https://forjelo.com/ingest/lead/fj_CFZfjQomhnpHuYwdwge8NPui4V43O-_V';

  const $ = s => document.querySelector(s);

  /* logo do Forje Studio (mesma marca do header/favicon) */
  F.LOGO_SVG = '<svg class="fjmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 327.7 327.7"><defs><mask id="fsBulb" maskUnits="userSpaceOnUse" x="0" y="0" width="327.7" height="327.7"><rect width="327.7" height="327.7" fill="#fff"/><path d="M 101.1 101.1 C 100.2 102.1 99.3 103 98.4 104 C 97.6 105 96.7 105.9 95.9 107 C 95 108 94.2 109 93.5 110.1 C 92.7 111.1 91.9 112.2 91.2 113.3 C 90.5 114.4 89.8 115.5 89.1 116.6 C 88.4 117.7 87.8 118.9 87.2 120 C 86.5 121.2 86 122.3 85.4 123.5 C 84.8 124.7 84.3 125.9 83.8 127.1 C 83.3 128.3 82.8 129.5 82.4 130.8 C 82 132 81.5 133.3 81.2 134.5 C 80.8 135.8 80.4 137 80.1 138.3 C 79.8 139.6 79.5 140.8 79.3 142.1 C 79 143.4 78.8 144.7 78.6 146 C 78.4 147.3 78.2 148.6 78.1 149.9 C 78 151.2 77.9 152.5 77.8 153.8 C 77.8 155.1 77.7 156.4 77.7 157.7 C 77.7 159.1 77.8 160.4 77.8 161.7 C 77.9 163 78 164.3 78.1 165.6 C 78.2 166.9 78.4 168.2 78.6 169.5 C 78.8 170.8 79 172.1 79.3 173.4 C 79.5 174.6 79.8 175.9 80.1 177.2 C 80.4 178.5 80.8 179.7 81.2 181 C 81.5 182.2 82 183.5 82.4 184.7 C 82.8 185.9 83.3 187.2 83.8 188.4 C 84.3 189.6 84.8 190.8 85.4 192 C 86 193.2 86.5 194.3 87.2 195.5 C 87.8 196.6 88.4 197.8 89.1 198.9 C 89.8 200 90.5 201.1 91.2 202.2 C 91.9 203.3 92.7 204.4 93.5 205.4 C 94.2 206.5 95 207.5 95.9 208.5 C 96.7 209.5 97.6 210.5 98.4 211.5 C 99.3 212.5 100.2 213.4 101.1 214.4 C 116.2 229.4 138.2 232.6 157.7 235.5 C 161 236 164.3 236.5 167.5 237 C 173.9 238.1 179.7 240.4 185.1 243.9 C 186.3 244.7 187.5 245.3 188.8 245.9 C 190.1 246.5 191.4 246.9 192.7 247.3 C 194.1 247.6 195.5 247.9 196.9 248 C 198.3 248.1 199.7 248.1 201.1 247.9 C 202.5 247.8 203.8 247.6 205.2 247.2 C 206.5 246.8 207.9 246.4 209.1 245.8 C 210.4 245.2 211.6 244.5 212.8 243.7 C 213.9 242.9 215 242 216 241 L 241 216 C 242 215 242.9 213.9 243.7 212.8 C 244.5 211.6 245.2 210.4 245.8 209.1 C 246.3 207.9 246.8 206.6 247.2 205.2 C 247.5 203.8 247.8 202.5 247.9 201.1 C 248 199.7 248.1 198.3 247.9 196.9 C 247.8 195.5 247.6 194.1 247.3 192.8 C 246.9 191.4 246.5 190.1 245.9 188.8 C 245.3 187.5 244.7 186.3 243.9 185.2 C 240.4 179.8 238.1 173.9 237 167.5 C 236.4 164.3 236 161 235.5 157.7 C 232.6 138.2 229.4 116.2 214.4 101.1 C 213.4 100.2 212.5 99.3 211.5 98.4 C 210.5 97.5 209.6 96.7 208.5 95.9 C 207.5 95 206.5 94.2 205.4 93.4 C 204.4 92.7 203.3 91.9 202.2 91.2 C 201.1 90.5 200 89.8 198.9 89.1 C 197.8 88.4 196.6 87.8 195.5 87.2 C 194.3 86.5 193.2 86 192 85.4 C 190.8 84.8 189.6 84.3 188.4 83.8 C 187.2 83.3 185.9 82.8 184.7 82.4 C 183.5 82 182.2 81.5 181 81.2 C 179.7 80.8 178.5 80.4 177.2 80.1 C 175.9 79.8 174.6 79.5 173.4 79.3 C 172.1 79 170.8 78.8 169.5 78.6 C 168.2 78.4 166.9 78.2 165.6 78.1 C 164.3 78 163 77.9 161.7 77.8 C 160.4 77.8 159.1 77.7 157.8 77.7 C 156.4 77.7 155.1 77.8 153.8 77.8 C 152.5 77.9 151.2 78 149.9 78.1 C 148.6 78.2 147.3 78.4 146 78.6 C 144.7 78.8 143.4 79 142.1 79.3 C 140.8 79.5 139.6 79.8 138.3 80.1 C 137 80.4 135.8 80.8 134.5 81.2 C 133.3 81.5 132 82 130.8 82.4 C 129.6 82.8 128.3 83.3 127.1 83.8 C 125.9 84.3 124.7 84.8 123.5 85.4 C 122.3 86 121.2 86.5 120 87.2 C 118.9 87.8 117.7 88.4 116.6 89.1 C 115.5 89.8 114.4 90.5 113.3 91.2 C 112.2 91.9 111.1 92.7 110.1 93.4 C 109 94.2 108 95 107 95.9 C 105.9 96.7 105 97.5 104 98.4 C 103 99.3 102.1 100.2 101.1 101.1 Z M 101.1 101.1 " fill="#000"/><path d="M 253.3 217.9 L 217.9 253.3 C 217.7 253.5 217.5 253.8 217.3 254 C 217.1 254.3 216.9 254.6 216.8 254.9 C 216.7 255.2 216.6 255.5 216.5 255.8 C 216.5 256.2 216.4 256.5 216.4 256.8 C 216.4 257.1 216.5 257.5 216.5 257.8 C 216.6 258.1 216.7 258.4 216.8 258.7 C 216.9 259 217.1 259.3 217.3 259.6 C 217.5 259.9 217.7 260.1 217.9 260.4 C 218.1 260.6 218.4 260.8 218.7 261 C 218.9 261.2 219.2 261.3 219.5 261.4 C 219.8 261.6 220.1 261.7 220.5 261.7 C 220.8 261.8 221.1 261.8 221.4 261.8 C 221.8 261.8 222.1 261.8 222.4 261.7 C 222.7 261.7 223.1 261.6 223.4 261.4 C 223.7 261.3 223.9 261.2 224.2 261 C 224.5 260.8 224.7 260.6 225 260.4 L 260.4 225 C 260.6 224.7 260.8 224.5 261 224.2 C 261.2 223.9 261.3 223.7 261.4 223.4 C 261.6 223 261.7 222.7 261.7 222.4 C 261.8 222.1 261.8 221.8 261.8 221.4 C 261.8 221.1 261.8 220.8 261.7 220.5 C 261.7 220.1 261.6 219.8 261.4 219.5 C 261.3 219.2 261.2 218.9 261 218.7 C 260.8 218.4 260.6 218.1 260.4 217.9 C 260.1 217.7 259.9 217.5 259.6 217.3 C 259.3 217.1 259 216.9 258.7 216.8 C 258.4 216.7 258.1 216.6 257.8 216.5 C 257.5 216.5 257.2 216.4 256.8 216.4 C 256.5 216.4 256.2 216.5 255.8 216.5 C 255.5 216.6 255.2 216.7 254.9 216.8 C 254.6 216.9 254.3 217.1 254 217.3 C 253.8 217.5 253.5 217.7 253.3 217.9 Z M 253.3 217.9 " fill="#000"/><path d="M 267.4 232.1 L 232.1 267.4 C 231.8 267.7 231.6 267.9 231.4 268.2 C 231.2 268.5 231.1 268.8 231 269.1 C 230.8 269.4 230.8 269.7 230.7 270 C 230.6 270.3 230.6 270.6 230.6 271 C 230.6 271.3 230.6 271.6 230.7 271.9 C 230.8 272.3 230.8 272.6 231 272.9 C 231.1 273.2 231.2 273.5 231.4 273.8 C 231.6 274 231.8 274.3 232.1 274.5 C 232.3 274.7 232.5 275 232.8 275.1 C 233.1 275.3 233.4 275.5 233.7 275.6 C 234 275.7 234.3 275.8 234.6 275.9 C 234.9 275.9 235.3 276 235.6 276 C 235.9 276 236.2 275.9 236.6 275.9 C 236.9 275.8 237.2 275.7 237.5 275.6 C 237.8 275.5 238.1 275.3 238.4 275.1 C 238.6 275 238.9 274.7 239.1 274.5 L 274.5 239.1 C 274.7 238.9 275 238.6 275.1 238.4 C 275.3 238.1 275.5 237.8 275.6 237.5 C 275.7 237.2 275.8 236.9 275.9 236.6 C 275.9 236.2 276 235.9 276 235.6 C 276 235.3 275.9 234.9 275.9 234.6 C 275.8 234.3 275.7 234 275.6 233.7 C 275.5 233.4 275.3 233.1 275.1 232.8 C 275 232.5 274.7 232.3 274.5 232.1 C 274.3 231.8 274 231.6 273.8 231.4 C 273.5 231.2 273.2 231.1 272.9 231 C 272.6 230.8 272.3 230.7 272 230.7 C 271.6 230.6 271.3 230.6 271 230.6 C 270.6 230.6 270.3 230.6 270 230.7 C 269.7 230.7 269.4 230.8 269.1 231 C 268.8 231.1 268.5 231.2 268.2 231.4 C 267.9 231.6 267.7 231.8 267.4 232.1 Z M 267.4 232.1 " fill="#000"/><path d="M 274.5 253.3 L 253.3 274.5 C 253.1 274.7 252.8 275 252.7 275.3 C 252.5 275.5 252.3 275.8 252.2 276.1 C 252.1 276.4 252 276.8 251.9 277.1 C 251.9 277.4 251.8 277.7 251.8 278.1 C 251.8 278.4 251.9 278.7 251.9 279 C 252 279.3 252.1 279.7 252.2 280 C 252.3 280.3 252.5 280.6 252.7 280.8 C 252.8 281.1 253.1 281.4 253.3 281.6 C 253.5 281.8 253.8 282 254 282.2 C 254.3 282.4 254.6 282.5 254.9 282.7 C 255.2 282.8 255.5 282.9 255.8 283 C 256.2 283 256.5 283.1 256.8 283.1 C 257.2 283.1 257.5 283 257.8 283 C 258.1 282.9 258.4 282.8 258.7 282.7 C 259 282.5 259.3 282.4 259.6 282.2 C 259.9 282 260.1 281.8 260.4 281.6 L 281.6 260.4 C 281.8 260.1 282 259.9 282.2 259.6 C 282.4 259.3 282.6 259 282.7 258.7 C 282.8 258.4 282.9 258.1 283 257.8 C 283 257.5 283.1 257.1 283.1 256.8 C 283.1 256.5 283 256.2 283 255.8 C 282.9 255.5 282.8 255.2 282.7 254.9 C 282.6 254.6 282.4 254.3 282.2 254 C 282 253.8 281.8 253.5 281.6 253.3 C 281.4 253.1 281.1 252.8 280.8 252.7 C 280.6 252.5 280.3 252.3 280 252.2 C 279.7 252.1 279.4 252 279 251.9 C 278.7 251.8 278.4 251.8 278.1 251.8 C 277.7 251.8 277.4 251.8 277.1 251.9 C 276.8 252 276.4 252.1 276.1 252.2 C 275.8 252.3 275.5 252.5 275.3 252.7 C 275 252.8 274.7 253.1 274.5 253.3 Z M 274.5 253.3 " fill="#000"/></mask></defs><path d="M 166.1 0 L 161.4 0 C 72.3 0 0 72.3 0 161.5 L 0 166.2 C 0 255.3 72.3 327.6 161.5 327.6 L 326.8 327.6 C 327.3 327.6 327.6 327.2 327.6 326.8 L 327.6 161.5 C 327.6 72.3 255.3 0 166.1 0 Z M 166.1 0 " fill="#F5620F" mask="url(#fsBulb)"/></svg>';

  /* ---------- fingerprint UID (determinístico, sem rede) ---------- */
  function cyrb53(str, seed=0){
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i=0, ch; i<str.length; i++){
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1>>>0)).toString(16);
  }
  function canvasSig(){
    try{
      const c = document.createElement('canvas'); c.width = 220; c.height = 36;
      const x = c.getContext('2d');
      x.textBaseline = 'top'; x.font = '15px "Arial"';
      x.fillStyle = '#F5620F'; x.fillRect(2,2,110,22);
      x.fillStyle = '#041f3f'; x.fillText('forje-studio ✦ 0123', 4, 6);
      x.strokeStyle = '#7C3AED'; x.arc(180,18,12,0,Math.PI*1.4); x.stroke();
      return c.toDataURL();
    }catch(e){ return 'nocanvas'; }
  }
  let _fp;
  F.fingerprint = function(){
    if(_fp) return _fp;
    const parts = [
      navigator.userAgent || '',
      (navigator.languages || [navigator.language]).join(','),
      screen.width + 'x' + screen.height + '@' + (window.devicePixelRatio || 1),
      screen.colorDepth || '',
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      navigator.hardwareConcurrency || '',
      navigator.platform || '',
      canvasSig(),
    ].join('|');
    _fp = 'fj-' + cyrb53(parts);
    return _fp;
  };

  /* ---------- leads: persistência JSON + export CSV ---------- */
  const K_LEADS = 'forma:leads';       // JSON [{email,fp,ts,lang,ua}]
  const K_SEEN  = 'forma:leads:seen';  // JSON [fp,...] — fingerprints já tratados

  async function getJSON(k, fb){ try{ const v = await F.stGet(k); return v ? JSON.parse(v) : fb; }catch(e){ return fb; } }
  const setJSON = (k, v) => F.stSet(k, JSON.stringify(v));

  function csvEsc(v){ v = String(v==null?'':v); return /[",\n;]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v; }

  F.leads = {
    async all(){ return getJSON(K_LEADS, []); },
    async count(){ return (await this.all()).length; },
    async csv(){
      const rows = await this.all();
      const head = 'email,fingerprint,date,lang,user_agent';
      return [head].concat(rows.map(r =>
        [r.email, r.fp, r.ts, r.lang, r.ua].map(csvEsc).join(','))).join('\n');
    },
    async download(){
      const csv = await this.csv();
      F.download(new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8'}), 'forje-leads.csv');
      return csv;
    },
    async clear(){ await F.stDel(K_LEADS); await F.stDel(K_SEEN); return true; },
  };

  async function saveLead(email, fp){
    const lead = { email, fp, ts:new Date().toISOString(),
      lang:(navigator.language||''), ua:(navigator.userAgent||'') };
    const rows = await getJSON(K_LEADS, []);
    rows.push(lead); await setJSON(K_LEADS, rows);
    if(F.LEADS_ENDPOINT){
      /* O ingest espera form-urlencoded (mesmo shape do <form> nativo):
         email obrigatório; name/message opcionais. Mandamos o fingerprint
         em `name` para o card do board já vir identificado. */
      const body = new URLSearchParams({
        email: lead.email,
        name: 'Forje Studio · ' + lead.fp,
        message: 'export gate · ' + lead.ts + ' · ' + lead.lang,
      });
      try{
        /* sendBeacon sobrevive ao unload (o export pode navegar/baixar
           logo em seguida); fetch keepalive é o fallback. */
        const blob = new Blob([body.toString()],
          {type:'application/x-www-form-urlencoded;charset=UTF-8'});
        if(!(navigator.sendBeacon && navigator.sendBeacon(F.LEADS_ENDPOINT, blob))){
          fetch(F.LEADS_ENDPOINT, {method:'POST', mode:'no-cors', keepalive:true,
            headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
            body}).catch(()=>{});
        }
      }catch(e){}
    }
  }
  async function markSeen(fp){
    const seen = await getJSON(K_SEEN, []);
    if(!seen.includes(fp)){ seen.push(fp); await setJSON(K_SEEN, seen); }
  }
  async function isSeen(fp){ return (await getJSON(K_SEEN, [])).includes(fp); }

  /* ---------- modal de captura (gate do 1º export) ---------- */
  function leadModal(){
    return new Promise(res=>{
      const t = F.t || (s=>s);
      const wrap = document.createElement('div');
      wrap.className = 'fmodal';
      wrap.innerHTML = `
        <div class="fmcard glass" role="dialog" aria-modal="true">
          <button class="fmx" type="button" aria-label="${t('fechar')}" title="${t('fechar')}">×</button>
          <div class="fmglyph" aria-hidden="true">${F.LOGO_SVG || ''}</div>
          <h3>${t('Quase lá! Antes do seu primeiro export…')}</h3>
          <p>${t('Deixe seu e-mail para acompanhar as novidades do Forje Studio e da Forjelo. Só pedimos uma vez.')}</p>
          <input class="fminp" type="email" autocomplete="email" placeholder="${t('seu@email.com')}">
          <button class="fmgo" type="button">${t('Liberar exportação')}</button>
          <button class="fmskip" type="button">${t('continuar sem informar')}</button>
        </div>`;
      document.body.appendChild(wrap);
      const inp = wrap.querySelector('.fminp');
      requestAnimationFrame(()=>{ wrap.classList.add('on'); inp.focus(); });
      const close = val => { wrap.classList.remove('on');
        setTimeout(()=>wrap.remove(), 240); res(val); };
      wrap.querySelector('.fmgo').onclick = ()=>{
        const email = inp.value.trim();
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){
          inp.classList.add('err'); inp.focus();
          F.toast(t('E-mail inválido — confere o formato?'));
          setTimeout(()=>inp.classList.remove('err'), 1200);
          return;
        }
        close({email});
      };
      inp.onkeydown = e=>{ if(e.key==='Enter') wrap.querySelector('.fmgo').click(); };
      wrap.querySelector('.fmskip').onclick = ()=>close({skip:true});
      wrap.querySelector('.fmx').onclick   = ()=>close(null);
      wrap.onclick = e=>{ if(e.target===wrap) close(null); };
    });
  }

  /* gate: resolve true (segue o export) ou false (cancelado no ×) */
  let gateBusy = null;
  async function exportGate(){
    const fp = F.fingerprint();
    if(await isSeen(fp)) return true;
    if(gateBusy) return gateBusy;                 // dois cliques rápidos: 1 modal só
    gateBusy = (async ()=>{
      const r = await leadModal();
      gateBusy = null;
      if(!r) return false;                        // fechou no × / fora: não exporta
      if(r.email){ await saveLead(r.email, fp); F.toast((F.t||(s=>s))('Obrigado! Bons designs — exportação liberada.')); }
      await markSeen(fp);                         // com ou sem e-mail: não pede de novo
      return true;
    })();
    return gateBusy;
  }

  /* envolve as exportações de design/motion — o backup .json do
     projeto NÃO passa pelo gate (é ferramenta, não deliverable). */
  ['exportRaster','exportPDF','exportPPTX','exportHTML','exportVideo'].forEach(name=>{
    const fn = F[name];
    if(typeof fn !== 'function') return;
    F[name] = async function(...args){
      if(!(await exportGate())) return;
      return fn.apply(F, args);
    };
  });

  /* ---------- pop-up promocional (todo início de sessão) ---------- */
  function promoPopup(){
    const t = F.t || (s=>s);
    const el = document.createElement('div');
    el.className = 'fpromo glass';
    el.innerHTML = `
      <button class="fpx" type="button" aria-label="${t('fechar')}" title="${t('fechar')}">×</button>
      <div class="fpglyph" aria-hidden="true">${F.LOGO_SVG || ''}</div>
      <div class="fptxt">
        <b>${t('Feito à mão pela Forjelo')}</b>
        <span>${t('Curtiu o estúdio? Nós forjamos sistemas e produtos neste nível para a sua marca.')}</span>
        <a href="https://forjelo.com" target="_blank" rel="noopener">${t('Conhecer a Forjelo →')}</a>
      </div>`;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('on'));
    const bye = ()=>{ el.classList.remove('on'); setTimeout(()=>el.remove(), 380); };
    el.querySelector('.fpx').onclick = bye;
    setTimeout(()=>{ if(document.body.contains(el)) bye(); }, 26000);  // auto-dismiss
  }

  F.growthInit = function(){
    setTimeout(promoPopup, 2400);
    console.info('%cForje Studio by Forjelo','color:#F5620F;font-weight:bold',
      '· leads: FORMA.leads.download() baixa o CSV · FORMA.leads.all() lista · FORMA.LEADS_ENDPOINT p/ webhook');
  };

})(window.FORMA);
