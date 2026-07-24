/* =====================================================
   FORJE·studio — lib/icons.js
   Biblioteca de ícones SVG (traço 2px, viewBox 24).
   Para expandir: FORMA.icons.register('id',{n:'Nome',svg:'<path .../>'})
   Os ícones herdam currentColor e escalam por font-size.
   ===================================================== */
(function(F){
  const r = (id,n,svg)=>F.icons.register(id,{n,svg});

  /* setas e direção */
  r('arrow-right','Seta →','<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>');
  r('arrow-up-right','Seta ↗','<path d="M6 18L18 6"/><path d="M9 6h9v9"/>');
  r('arrow-down','Seta ↓','<path d="M12 4v15"/><path d="M6 13l6 6 6-6"/>');
  r('chevrons','Avanço','<path d="M6 5l7 7-7 7"/><path d="M13 5l7 7-7 7"/>');
  r('repeat','Loop','<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>');

  /* energia e destaque */
  r('spark','Brilho','<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>');
  r('bolt','Raio','<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>');
  r('star','Estrela','<path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9z"/>');
  r('flame','Chama','<path d="M12 22c4 0 7-2.7 7-7 0-3-2-5.5-3.5-7C15 10 14 11 12.5 11 13 7 11 4 8.5 2 9 6 4 8.5 5 15c.6 4 3 7 7 7z"/>');
  r('sun','Sol','<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>');
  r('moon','Lua','<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>');
  r('diamond','Diamante','<path d="M12 2l5 5-5 15L7 7z"/><path d="M2 7h20L12 22z"/>');

  /* validação e sinalização */
  r('check','Check','<path d="M4 12l5 5L20 6"/>');
  r('check-circle','Check ⊙','<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>');
  r('plus','Mais','<path d="M12 5v14M5 12h14"/>');
  r('x','Fechar','<path d="M6 6l12 12M18 6L6 18"/>');
  r('alert','Alerta','<path d="M12 3l10 18H2z"/><path d="M12 10v5"/><path d="M12 18.5v.01"/>');
  r('info','Info','<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.5v.01"/>');
  r('lock','Cadeado','<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>');
  r('shield','Escudo','<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>');

  /* dados e negócio */
  r('chart','Gráfico','<path d="M4 20V10M10 20V4M16 20v-7M2 20h20"/>');
  r('trend','Tendência','<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>');
  r('target','Alvo','<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>');
  r('pie','Pizza','<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 2.5A9 9 0 0 1 21.5 9H15z"/>');
  r('coin','Moeda','<circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1-3 2.5 1.5 2 3 2.5 3 1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5"/>');
  r('cart','Carrinho','<circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.5 12h11L21 8H7"/>');
  r('tag','Etiqueta','<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="8" cy="8" r="1.5"/>');
  r('gift','Presente','<rect x="4" y="10" width="16" height="11" rx="1"/><path d="M3 7h18v3H3z"/><path d="M12 7v14"/><path d="M12 7c-4 0-5-4-2.5-4S12 7 12 7zm0 0c4 0 5-4 2.5-4S12 7 12 7z"/>');

  /* tecnologia */
  r('rocket','Foguete','<path d="M5 15c-1.5 1.5-2 6-2 6s4.5-.5 6-2"/><path d="M9 15l-3-3C7 6 12 3 21 3c0 9-3 14-9 15z"/><circle cx="15" cy="9" r="1.6"/>');
  r('cube','Cubo','<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12L3 7M12 12v10"/>');
  r('layers','Camadas','<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17l9 5 9-5"/>');
  r('grid','Grade','<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>');
  r('code','Código','<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/>');
  r('cpu','Chip','<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>');
  r('cloud','Nuvem','<path d="M7 18a5 5 0 1 1 .8-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>');
  r('wifi','Sinal','<path d="M2 9a15 15 0 0 1 20 0"/><path d="M5.5 12.5a10 10 0 0 1 13 0"/><path d="M9 16a5 5 0 0 1 6 0"/><path d="M12 19.5v.01"/>');
  r('play','Play','<path d="M7 5v14l12-7z"/>');
  r('camera','Câmera','<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="13" r="3.5"/>');

  /* pessoas e comunicação */
  r('user','Pessoa','<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>');
  r('users','Pessoas','<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.4 3.5-5 6.5-5s5.7 1.6 6.5 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15.2c2 .7 3.3 2.2 3.8 4.8"/>');
  r('heart','Coração','<path d="M12 21C7 16.5 3 13 3 8.8 3 6 5 4 7.5 4c1.8 0 3.4 1 4.5 2.6C13.1 5 14.7 4 16.5 4 19 4 21 6 21 8.8c0 4.2-4 7.7-9 12.2z"/>');
  r('message','Mensagem','<path d="M21 12a8 8 0 0 1-8 8H4l2-3.2A8 8 0 1 1 21 12z"/>');
  r('mail','E-mail','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>');
  r('phone','Telefone','<path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>');
  r('mic','Microfone','<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>');
  r('globe','Globo','<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 3 15 0 18-3-3-3-15 0-18z"/>');

  /* lugar e tempo */
  r('pin','Local','<path d="M12 21c-4-4.5-7-7.8-7-11a7 7 0 0 1 14 0c0 3.2-3 6.5-7 11z"/><circle cx="12" cy="10" r="2.5"/>');
  r('clock','Relógio','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>');
  r('calendar','Agenda','<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>');
  r('eye','Olho','<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>');
  r('leaf','Folha','<path d="M4 20C4 10 10 4 21 4c0 11-6 16-14 16"/><path d="M4 20c2-5 6-9 11-11"/>');
  r('drop','Gota','<path d="M12 3c3.5 4.5 6.5 8 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 11 8.5 7.5 12 3z"/>');
})(window.FORMA);
