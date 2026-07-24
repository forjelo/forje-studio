/* =====================================================
   FORJE·studio — app.js (boot)
   Ordem no index.html: state → fonts → icons → anims →
   templates(+extra) → scenes(+extra) → player → render →
   export → panels → app
   ===================================================== */
(async function(F){
  await F.loadPersisted();
  await F.i18nInit();     // idioma: detecta/carrega antes de montar a UI
  await F.loadCustomFonts();
  F.runPlugins();          // biblioteca do usuário (aba LIB)
  F.ui.init();
  F.editorInit();
  F.render();
  F.growthInit();          // pop-up Forjelo + gate de leads no 1º export
})(window.FORMA);
