/* =====================================================
   FORJE·studio — core/i18n.js
   Internacionalização PT (fonte) / EN / ES.
   Estratégia: as strings do código continuam em PT-BR;
   este módulo traduz o DOM da INTERFACE em tempo real
   (MutationObserver) a partir de um dicionário — nada
   dentro de `.art` (a arte do usuário) é tocado, então
   exports e composições ficam 100% intactos.
   Ordem de carga: logo após core/state.js.
   ===================================================== */
(function(F){
  'use strict';

  /* ---------- dicionário: PT → [EN, ES] ---------- */
  const S = {
    /* header / marca */
    'design & motion por sistema': ['design & motion by system','diseño & motion por sistema'],
    'Replay': ['Replay','Replay'],
    'Variar': ['Vary','Variar'],
    'Exportar': ['Export','Exportar'],
    'repetir animação': ['replay the animation','repetir la animación'],
    'nova variação determinística': ['new deterministic variation','nueva variación determinística'],
    'Design': ['Design','Diseño'],
    'Motion': ['Motion','Motion'],

    /* menu exportar */
    'Imagem': ['Image','Imagen'],
    'Documento': ['Document','Documento'],
    'Web & vídeo': ['Web & video','Web y video'],
    'Projeto': ['Project','Proyecto'],
    'lote / carrossel': ['batch / carousel','lote / carrusel'],
    'com fundo sólido': ['solid background','con fondo sólido'],
    'e-book · full-bleed': ['e-book · full-bleed','e-book · full-bleed'],
    'PowerPoint · G. Slides': ['PowerPoint · G. Slides','PowerPoint · G. Slides'],
    'página standalone': ['standalone page','página standalone'],
    'vídeo da timeline': ['timeline video','video de la timeline'],
    'Backup': ['Backup','Backup'],
    '.json completo': ['full .json','.json completo'],
    'Importar projeto': ['Import project','Importar proyecto'],
    'Importar plugin': ['Import plugin','Importar plugin'],

    /* abas */
    'MARCA': ['BRAND','MARCA'],
    'FORMATO': ['FORMAT','FORMATO'],
    'CONTEÚDO': ['CONTENT','CONTENIDO'],
    'IMAGEM': ['IMAGE','IMAGEN'],
    'COMPOR': ['COMPOSE','COMPONER'],
    'LIB': ['LIB','LIB'],
    'TIMELINE': ['TIMELINE','TIMELINE'],
    'CENA': ['SCENE','ESCENA'],
    'ESTILO': ['STYLE','ESTILO'],
    'abas anteriores': ['previous tabs','pestañas anteriores'],
    'próximas abas': ['next tabs','siguientes pestañas'],

    /* barra do palco */
    'Slides': ['Slides','Slides'],
    'Cenas': ['Scenes','Escenas'],
    'SLIDES': ['SLIDES','SLIDES'],
    'CENAS': ['SCENES','ESCENAS'],
    'Editar': ['Edit','Editar'],
    'adicionar': ['add','añadir'],
    'adicionar slide': ['add slide','añadir slide'],
    'afastar a prancheta (Ctrl+scroll)': ['zoom out the artboard (Ctrl+scroll)','alejar la mesa de trabajo (Ctrl+scroll)'],
    'aproximar a prancheta (Ctrl+scroll)': ['zoom in the artboard (Ctrl+scroll)','acercar la mesa de trabajo (Ctrl+scroll)'],
    'ajustar à tela (reset do zoom)': ['fit to screen (zoom reset)','ajustar a la pantalla (reset del zoom)'],
    'grade de slides/cenas no palco — selecionar, reordenar, adicionar e remover': ['slide/scene grid on the stage — select, reorder, add and remove','cuadrícula de slides/escenas en el escenario — seleccionar, reordenar, añadir y quitar'],
    'editar elementos da arte (abre o menu de ferramentas)': ['edit artwork elements (opens the tools menu)','editar elementos del arte (abre el menú de herramientas)'],

    /* menu de edição */
    'Escala': ['Scale','Escala'],
    'Animar': ['Animate','Animar'],
    'Cor': ['Color','Color'],
    'Camada': ['Layer','Capa'],
    'Travas': ['Locks','Bloqueos'],
    'Remover': ['Remove','Quitar'],
    'diminuir (vale para todos os selecionados)': ['decrease (applies to all selected)','disminuir (aplica a todos los seleccionados)'],
    'aumentar (vale para todos os selecionados)': ['increase (applies to all selected)','aumentar (aplica a todos los seleccionados)'],
    'animação do(s) elemento(s) selecionado(s)': ['animation of the selected element(s)','animación del/los elemento(s) seleccionado(s)'],
    'cor do(s) elemento(s) selecionado(s)': ['color of the selected element(s)','color del/los elemento(s) seleccionado(s)'],
    'trazer para a frente (topo)': ['bring to front (top)','traer al frente (arriba)'],
    'avançar uma camada': ['bring forward one layer','avanzar una capa'],
    'recuar uma camada': ['send backward one layer','retroceder una capa'],
    'enviar para trás (fundo)': ['send to back (bottom)','enviar al fondo'],
    'travar/destravar selecionados (não movem nem escalam)': ['lock/unlock selected (they will not move or scale)','bloquear/desbloquear seleccionados (no se mueven ni escalan)'],
    'destravar tudo desta arte': ['unlock everything in this artwork','desbloquear todo en este arte'],
    'apagar selecionados (Delete)': ['delete selected (Delete)','eliminar seleccionados (Delete)'],
    'desfazer edições desta arte': ['undo edits of this artwork','deshacer ediciones de este arte'],

    /* rodapé de atalhos + fluxo de pranchetas + tela de grade + aba EDITAR */
    'EDITAR': ['EDIT','EDITAR'],
    'Camada ↑': ['Layer ↑','Capa ↑'],
    'Camada ↓': ['Layer ↓','Capa ↓'],
    'Travar': ['Lock','Bloquear'],
    'Destravar': ['Unlock','Desbloquear'],
    'Desfazer': ['Undo','Deshacer'],
    'Zoom −': ['Zoom −','Zoom −'],
    'Zoom +': ['Zoom +','Zoom +'],
    'Grade': ['Grid','Cuadrícula'],
    '✕ Fechar': ['✕ Close','✕ Cerrar'],

    /* eixo 1 · folha de variações */
    'VARIAÇÕES': ['VARIATIONS','VARIACIONES'],
    'Variações': ['Variations','Variaciones'],
    'Layout': ['Layout','Layout'],
    'Cores': ['Colors','Colores'],
    'Tipografia': ['Typography','Tipografía'],
    'Seed novo': ['New seed','Seed nuevo'],
    '↻ Mais': ['↻ More','↻ Más'],
    'abrir a folha de variações': ['open the variations sheet','abrir la hoja de variaciones'],
    'folha de variações — gerar, escolher, refinar': ['variations sheet — generate, pick, refine','hoja de variaciones — generar, elegir, refinar'],
    'novo seed mestre — recomeça as variações (comportamento clássico do Variar)': ['new master seed — restarts variations (classic Vary behavior)','nuevo seed maestro — reinicia las variaciones (comportamiento clásico de Variar)'],
    'sortear outra folha de variações': ['draw another sheet of variations','sortear otra hoja de variaciones'],
    'eixo travado — mantido em todas as variações': ['axis locked — kept across all variations','eje bloqueado — se mantiene en todas las variaciones'],
    'eixo livre — varia entre os cards': ['axis free — varies across cards','eje libre — varía entre las tarjetas'],
    'aplicar esta variação — edições e composições permanecem': ['apply this variation — edits and compositions remain','aplicar esta variación — ediciones y composiciones permanecen'],
    'aplicar e variar a partir desta': ['apply and vary from this one','aplicar y variar a partir de esta'],
    'template diferente — edições chaveiam por template': ['different template — edits are keyed per template','plantilla diferente — las ediciones se indexan por plantilla'],
    'Clique num card para aplicar — suas edições e composições permanecem. Trave um eixo para mantê-lo constante.': ['Click a card to apply — your edits and compositions remain. Lock an axis to keep it constant.','Haz clic en una tarjeta para aplicar — tus ediciones y composiciones permanecen. Bloquea un eje para mantenerlo constante.'],
    'Variando cores e tipografia da cena atual — a profundidade estrutural de cena chega em S7.': ['Varying colors and typography of the current scene — structural scene depth arrives in S7.','Variando colores y tipografía de la escena actual — la profundidad estructural de escena llega en S7.'],
    'direção/estrutura da composição': ['composition direction/structure','dirección/estructura de la composición'],
    'Livre': ['Freeform','Libre'],
    'Composição gerada: estrutura da biblioteca global + esquema + design system — um template novo a cada seed.': ['Generated composition: structure from the global library + scheme + design system — a new template every seed.','Composición generada: estructura de la biblioteca global + esquema + design system — una plantilla nueva en cada semilla.'],
    'Adicione cenas na aba TIMELINE para variar o motion.': ['Add scenes in the TIMELINE tab to vary the motion.','Agrega escenas en la pestaña TIMELINE para variar el motion.'],
    'Variação aplicada — edições e composições preservadas.': ['Variation applied — edits and compositions preserved.','Variación aplicada — ediciones y composiciones preservadas.'],
    'Variação aplicada — refinando a partir dela.': ['Variation applied — refining from it.','Variación aplicada — refinando a partir de ella.'],
    'PRANCHETAS': ['ARTBOARDS','MESAS DE TRABAJO'],
    'PRANCHETAS · SLIDES': ['ARTBOARDS · SLIDES','MESAS · SLIDES'],
    'PRANCHETAS · CENAS': ['ARTBOARDS · SCENES','MESAS · ESCENAS'],
    'selecionada': ['selected','seleccionada'],
    'Modo edição': ['Edit mode','Modo edición'],
    'ativo': ['active','activo'],
    'inativo': ['inactive','inactivo'],
    'Ativar modo edição': ['Enable edit mode','Activar modo edición'],
    'Desativar modo edição': ['Disable edit mode','Desactivar modo edición'],
    'diminuir a escala da seleção': ['decrease selection scale','disminuir la escala de la selección'],
    'aumentar a escala da seleção': ['increase selection scale','aumentar la escala de la selección'],
    'cor da seleção': ['selection color','color de la selección'],
    'travar/destravar seleção': ['lock/unlock selection','bloquear/desbloquear selección'],
    'apagar seleção': ['delete selection','eliminar selección'],
    'afastar a prancheta': ['zoom out the artboard','alejar la mesa de trabajo'],
    'aproximar a prancheta': ['zoom in the artboard','acercar la mesa de trabajo'],
    'ver o palco em grade — selecionar, reordenar, adicionar e remover pranchetas': ['view the stage as a grid — select, reorder, add and remove artboards','ver el escenario en cuadrícula — seleccionar, reordenar, añadir y quitar mesas'],
    'voltar ao palco (Esc)': ['back to the stage (Esc)','volver al escenario (Esc)'],
    'selecionar e voltar ao palco': ['select and go back to the stage','seleccionar y volver al escenario'],

    /* progresso / export */
    'Exportando…': ['Exporting…','Exportando…'],
    'Exportando carrossel…': ['Exporting carousel…','Exportando carrusel…'],
    'Exportando imagem…': ['Exporting image…','Exportando imagen…'],
    'Renderizando MP4 frame a frame…': ['Rendering MP4 frame by frame…','Renderizando MP4 cuadro a cuadro…'],
    'Renderizando WebM…': ['Rendering WebM…','Renderizando WebM…'],
    'Compondo PDF…': ['Composing PDF…','Componiendo PDF…'],
    'Compondo PPTX…': ['Composing PPTX…','Componiendo PPTX…'],
    'escrevendo arquivo…': ['writing file…','escribiendo archivo…'],
    'empacotando…': ['packaging…','empaquetando…'],

    /* painel MARCA */
    'Nome da marca': ['Brand name','Nombre de la marca'],
    'Handle / assinatura': ['Handle / signature','Handle / firma'],
    'Paleta': ['Palette','Paleta'],
    'fundo': ['bg','fondo'],
    'texto': ['text','texto'],
    'prim.': ['prim.','prim.'],
    'sec.': ['sec.','sec.'],
    'accent': ['accent','acento'],
    'Fonte display': ['Display font','Fuente display'],
    'Fonte texto': ['Body font','Fuente de texto'],
    'Variação de fontes display (o seed alterna)': ['Display font variation (the seed rotates them)','Variación de fuentes display (la semilla alterna)'],
    'Fonte própria (.ttf/.otf/.woff2)': ['Custom font (.ttf/.otf/.woff2)','Fuente propia (.ttf/.otf/.woff2)'],
    'Raio dos cantos': ['Corner radius','Radio de las esquinas'],
    'Logo (PNG/SVG)': ['Logo (PNG/SVG)','Logo (PNG/SVG)'],
    'Salvar': ['Save','Guardar'],
    'Limpar': ['Reset','Restablecer'],
    'Backup .json': ['Backup .json','Backup .json'],
    'importar .json': ['import .json','importar .json'],
    'enviar logo — ou arraste aqui': ['upload logo — or drag it here','subir logo — o arrástralo aquí'],
    'enviar arquivo de fonte da marca': ['upload the brand font file','subir el archivo de fuente de la marca'],
    'enviar imagem — ou arraste aqui / cole Ctrl+V': ['upload image — or drag here / paste Ctrl+V','subir imagen — o arrastra aquí / pega Ctrl+V'],
    '+ enviar plugin .js': ['+ upload .js plugin','+ subir plugin .js'],
    'O brandbook (tokens, logo e fontes próprias) persiste no estúdio e pode ser levado em arquivo .json — carregue uma vez, componha para sempre.': [
      'The brandbook (tokens, logo and custom fonts) persists in the studio and can travel as a .json file — load it once, compose forever.',
      'El brandbook (tokens, logo y fuentes propias) persiste en el estudio y puede viajar como archivo .json — cárgalo una vez, compón para siempre.'],
    'Idioma da interface': ['Interface language','Idioma de la interfaz'],
    'Auto (detectar)': ['Auto (detect)','Auto (detectar)'],
    'Português': ['Português','Português'],
    'English': ['English','English'],
    'Español': ['Español','Español'],

    /* painel FORMATO */
    'Formato de saída': ['Output format','Formato de salida'],
    'Template': ['Template','Plantilla'],
    'Modelos para começar': ['Starter models','Modelos para empezar'],
    'Apresentação 16:9': ['Presentation 16:9','Presentación 16:9'],

    /* painel CONTEÚDO */
    'Kicker': ['Kicker','Kicker'],
    'Kicker / chapéu': ['Kicker / eyebrow','Kicker / antetítulo'],
    'Título': ['Title','Título'],
    'Subtítulo / apoio': ['Subtitle / support','Subtítulo / apoyo'],
    'CTA': ['CTA','CTA'],
    'CTA (global)': ['CTA (global)','CTA (global)'],
    'Slides do carrossel': ['Carousel slides','Slides del carrusel'],
    'Marcador de páginas do carrossel': ['Carousel page marker','Marcador de páginas del carrusel'],
    'Largura da logo': ['Logo width','Ancho del logo'],
    'Aplicar imagem a todos os slides': ['Apply image to all slides','Aplicar imagen a todos los slides'],
    'Cada slide guarda seu próprio texto, imagem e máscara. CTA, assinatura e marcador valem para o carrossel inteiro (o marcador aparece com 2+ slides).': [
      'Each slide keeps its own text, image and mask. CTA, signature and marker apply to the whole carousel (the marker shows with 2+ slides).',
      'Cada slide guarda su propio texto, imagen y máscara. CTA, firma y marcador aplican a todo el carrusel (el marcador aparece con 2+ slides).'],

    /* Eixo 3 · lote (dados → N artes · todos os formatos) */
    'Gerar em lote (dados)': ['Batch generate (data)','Generar en lote (datos)'],
    'CSV ou JSON — cada linha vira uma arte': ['CSV or JSON — each row becomes an artwork','CSV o JSON — cada fila se vuelve un arte'],
    'Carregar CSV / JSON': ['Load CSV / JSON','Cargar CSV / JSON'],
    'linhas': ['rows','filas'],
    'colunas': ['columns','columnas'],
    '— ignorar —': ['— ignore —','— ignorar —'],
    'Imagem (URL)': ['Image (URL)','Imagen (URL)'],
    'Nome do arquivo (export)': ['File name (export)','Nombre de archivo (export)'],
    'Variação por linha (seed dos dados)': ['Per-row variation (data seed)','Variación por fila (seed de los datos)'],
    'Template por conteúdo (imagem, número)': ['Template by content (image, number)','Template por contenido (imagen, número)'],
    'Mapeie ao menos o Título.': ['Map at least the Title.','Mapea al menos el Título.'],
    'Arquivo sem linhas de dados.': ['File has no data rows.','Archivo sin filas de datos.'],
    'artes geradas dos dados': ['artworks generated from data','artes generadas de los datos'],
    'Nenhuma linha com conteúdo — confira o mapeamento.': ['No row with content — check the mapping.','Ninguna fila con contenido — revisa el mapeo.'],
    'PNG · todos os formatos': ['PNG · all formats','PNG · todos los formatos'],
    'um conteúdo, todas as mídias': ['one content, every canvas','un contenido, todos los medios'],
    'Exportar PNG dos formatos marcados': ['Export PNG for checked formats','Exportar PNG de los formatos marcados'],
    'Escolha ao menos um formato.': ['Pick at least one format.','Elige al menos un formato.'],
    'imagens exportadas em': ['images exported in','imágenes exportadas en'],
    'formatos.': ['formats.','formatos.'],
    'Exportando todos os formatos…': ['Exporting all formats…','Exportando todos los formatos…'],
    'o campo <b>Nome do arquivo</b> nomeia o export: forje_<i>nome</i>_1080x1080.png': ['the <b>File name</b> field names the export: forje_<i>name</i>_1080x1080.png','el campo <b>Nombre de archivo</b> nombra el export: forje_<i>nombre</i>_1080x1080.png'],
    /* Eixo 3 · fase 3.3 — vídeo em lote */
    'Vídeo em lote': ['Batch video','Video en lote'],
    'timeline como template — 1 MP4 por linha': ['timeline as template — 1 MP4 per row','timeline como plantilla — 1 MP4 por fila'],
    'Valor (contador das cenas)': ['Value (scene counters)','Valor (contadores de escena)'],
    'Sufixo do contador': ['Counter suffix','Sufijo del contador'],
    'placeholders <b>{{coluna}}</b> detectados na timeline — cada linha preenche os seus': ['<b>{{column}}</b> placeholders detected in the timeline — each row fills its own','placeholders <b>{{columna}}</b> detectados en la timeline — cada fila llena los suyos'],
    'dica: escreva <b>{{coluna}}</b> nos textos das cenas (ex.: “Certificamos {{nome}}”) para o mail-merge preciso; sem placeholders, os campos mapeados acima substituem em todas as cenas': ['tip: write <b>{{column}}</b> in scene texts (e.g. “Certifying {{name}}”) for precise mail-merge; without placeholders, the mapped fields above replace across all scenes','tip: escribe <b>{{columna}}</b> en los textos de las escenas (ej.: “Certificamos a {{nombre}}”) para el mail-merge preciso; sin placeholders, los campos mapeados reemplazan en todas las escenas'],
    'Monte a timeline (modo MOTION) primeiro — ela é o template do lote.': ['Build the timeline (MOTION mode) first — it is the batch template.','Arma la timeline (modo MOTION) primero — es la plantilla del lote.'],
    'Lote de vídeo requer WebCodecs (Chrome/Edge) — o fallback WebM em tempo real seria inviável para N vídeos.': ['Batch video requires WebCodecs (Chrome/Edge) — the real-time WebM fallback would be unfeasible for N videos.','El lote de video requiere WebCodecs (Chrome/Edge) — el fallback WebM en tiempo real sería inviable para N videos.'],
    'Lote de vídeo · timeline como template…': ['Batch video · timeline as template…','Lote de video · timeline como plantilla…'],
    'vídeos gerados da timeline': ['videos generated from the timeline','videos generados de la timeline'],
    'Lote interrompido no vídeo': ['Batch stopped at video','Lote interrumpido en el video'],
    /* Eixo 2 · gerar do conteúdo */
    'Gerar do conteúdo': ['Generate from content','Generar del contenido'],
    'cole o texto — o sistema fatia, roteia e compõe': ['paste the text — the system slices, routes and composes','pega el texto — el sistema divide, rutea y compone'],
    'Cole aqui o conteúdo do carrossel…': ['Paste your carousel content here…','Pega aquí el contenido del carrusel…'],
    'Substituir slides': ['Replace slides','Reemplazar slides'],
    'Adicionar ao fim': ['Append at the end','Agregar al final'],
    'Template por conteúdo (roteamento)': ['Template by content (routing)','Template por contenido (ruteo)'],
    'Usar imagens do texto': ['Use images from the text','Usar imágenes del texto'],
    'Gerar slides': ['Generate slides','Generar slides'],
    'linha em branco separa slides · # título · ### kicker · > citação · - lista · **destaque** · ![](url) imagem · bloco final com ação vira o CTA': [
      'blank line splits slides · # title · ### kicker · > quote · - list · **highlight** · ![](url) image · final action block becomes the CTA',
      'línea en blanco separa slides · # título · ### kicker · > cita · - lista · **destacado** · ![](url) imagen · bloque final con acción se vuelve el CTA'],
    'Cole um texto para gerar.': ['Paste some text to generate.','Pega un texto para generar.'],
    'Nenhum conteúdo reconhecido.': ['No content recognized.','Ningún contenido reconocido.'],
    'slides gerados do conteúdo': ['slides generated from content','slides generados del contenido'],
    'CTA detectado': ['CTA detected','CTA detectado'],
    'Este carrossel usa template por slide (roteado do conteúdo) — o clique acima muda só o slide atual.': [
      'This carousel uses per-slide templates (routed from content) — clicking above changes only the current slide.',
      'Este carrusel usa template por slide (ruteado del contenido) — el clic de arriba cambia solo el slide actual.'],
    'Usar este template em todos os slides': ['Use this template on all slides','Usar este template en todos los slides'],
    'Template aplicado a todos os slides.': ['Template applied to all slides.','Template aplicado a todos los slides.'],

    /* painel IMAGEM */
    'Encaixe (máscara deste slide)': ['Fit (mask of this slide)','Encaje (máscara de este slide)'],
    'Encaixe da imagem': ['Image fit','Encaje de la imagen'],
    'Encaixe da imagem no mockup': ['Image fit inside the mockup','Encaje de la imagen en el mockup'],
    'Encaixe deste item': ['Fit of this item','Encaje de este elemento'],

    /* painel COMPOR */
    'Componentes': ['Components','Componentes'],
    'Inserir texto': ['Insert text','Insertar texto'],
    'Inserir forma': ['Insert shape','Insertar forma'],
    'Inserir ícone': ['Insert icon','Insertar icono'],
    'Cor do item': ['Item color','Color del elemento'],
    'Cor do contorno': ['Stroke color','Color del contorno'],
    'Preenchimento': ['Fill','Relleno'],
    'Forma': ['Shape','Forma'],
    'Texto': ['Text','Texto'],
    'Fonte': ['Font','Fuente'],
    'Peso': ['Weight','Peso'],
    'Tamanho': ['Size','Tamaño'],
    'Alinhamento': ['Alignment','Alineación'],
    'Largura do box': ['Box width','Ancho de la caja'],
    'Aa Título': ['Aa Heading','Aa Título'],
    'Aa Parágrafo': ['Aa Paragraph','Aa Párrafo'],
    'RÓTULO': ['LABEL','ETIQUETA'],
    'Prancheta': ['Artboard','Mesa de trabajo'],
    'Fundo/véu': ['Background/veil','Fondo/velo'],
    'Buscar componente ou item desta arte…': ['Search a component or item of this artwork…','Buscar un componente o elemento de este arte…'],
    'Nesta arte': ['In this artwork','En este arte'],
    'Cores desta arte': ['Colors of this artwork','Colores de este arte'],
    'Restaurar cores da marca': ['Restore brand colors','Restaurar colores de la marca'],
    'voltar às cores da marca': ['back to the brand colors','volver a los colores de la marca'],
    'Conteúdo gerado pelo seed — reposicione/escale com Editar.': ['Seed-generated content — reposition/scale with Edit.','Contenido generado por la semilla — reposiciona/escala con Editar.'],
    /* formulários de dados reais (COMPOR) */
    'Dados': ['Data','Datos'],
    'Conteúdo (URL ou texto)': ['Content (URL or text)','Contenido (URL o texto)'],
    'Legenda': ['Caption','Leyenda'],
    'Código (números e/ou texto)': ['Code (numbers and/or text)','Código (números y/o texto)'],
    'Dados (Rótulo | valor por linha)': ['Data (Label | value per line)','Datos (Etiqueta | valor por línea)'],
    'Dados (números por vírgula ou linha)': ['Data (numbers by comma or line)','Datos (números por coma o línea)'],
    'Valor em destaque': ['Highlighted value','Valor destacado'],
    'Fatia 1 (Rótulo | valor)': ['Slice 1 (Label | value)','Porción 1 (Etiqueta | valor)'],
    'Fatia 2 (Rótulo | valor)': ['Slice 2 (Label | value)','Porción 2 (Etiqueta | valor)'],
    'Fatia 3 (Rótulo | valor)': ['Slice 3 (Label | value)','Porción 3 (Etiqueta | valor)'],
    'Linhas (Rótulo | valor 0–100)': ['Lines (Label | value 0–100)','Líneas (Etiqueta | valor 0–100)'],
    'Antes (Rótulo | valor)': ['Before (Label | value)','Antes (Etiqueta | valor)'],
    'Depois (Rótulo | valor)': ['After (Label | value)','Después (Etiqueta | valor)'],
    'Intensidades 0–100 (opcional)': ['Intensities 0–100 (optional)','Intensidades 0–100 (opcional)'],
    'Cabeçalho (colunas com | )': ['Header (columns with | )','Encabezado (columnas con | )'],
    'Linhas (colunas com | )': ['Rows (columns with | )','Filas (columnas con | )'],
    'Valor (0–100)': ['Value (0–100)','Valor (0–100)'],
    'Triângulo e estrela usam recorte — o contorno não se aplica a eles. Raio vale para retângulo.': [
      'Triangle and star use clipping — the stroke does not apply to them. Radius applies to rectangles.',
      'Triángulo y estrella usan recorte — el contorno no se les aplica. El radio aplica al rectángulo.'],
    'herda os tokens da marca': ['inherits the brand tokens','hereda los tokens de la marca'],
    'cor própria aplicada': ['custom color applied','color propio aplicado'],
    'clique ou arraste para o palco': ['click or drag to the stage','haz clic o arrastra al escenario'],
    'arraste para o palco': ['drag to the stage','arrastra al escenario'],

    /* painel TIMELINE / CENA / ESTILO */
    '+ adicionar cena': ['+ add scene','+ añadir escena'],
    'Entrada': ['In','Entrada'],
    'Estilo': ['Style','Estilo'],
    'entrada': ['in','entrada'],
    'saída': ['out','salida'],
    'duração (s)': ['duration (s)','duración (s)'],
    'Atraso (s)': ['Delay (s)','Retraso (s)'],
    'Saída (fim da cena — vale no vídeo)': ['Out (end of scene — applies to video)','Salida (fin de la escena — aplica al video)'],
    'Apoio': ['Support','Apoyo'],
    'Valor': ['Value','Valor'],
    'Sufixo': ['Suffix','Sufijo'],
    'Itens (um por linha)': ['Items (one per line)','Ítems (uno por línea)'],
    'Ícone': ['Icon','Icono'],
    'Ícone da cena': ['Scene icon','Icono de la escena'],
    'Ícone de destaque': ['Accent icon','Icono de acento'],
    'Ícones, imagens livres e logo': ['Icons, free images and logo','Iconos, imágenes libres y logo'],
    'Efeitos de acabamento': ['Finishing effects','Efectos de acabado'],
    'Velocidade do motion': ['Motion speed','Velocidad del motion'],
    'Formato do vídeo': ['Video format','Formato del video'],
    'subir': ['move up','subir'],
    'descer': ['move down','bajar'],
    'mover para cima': ['move up','mover hacia arriba'],
    'mover para baixo': ['move down','mover hacia abajo'],
    'remover': ['remove','quitar'],
    'remover item': ['remove item','quitar elemento'],
    'minimizar/expandir': ['minimize/expand','minimizar/expandir'],
    'clique para expandir': ['click to expand','haz clic para expandir'],
    'clique para minimizar': ['click to minimize','haz clic para minimizar'],
    'Adicione cenas na aba TIMELINE — elas aparecem aqui como miniaturas selecionáveis.': [
      'Add scenes in the TIMELINE tab — they show up here as selectable thumbnails.',
      'Añade escenas en la pestaña TIMELINE — aparecen aquí como miniaturas seleccionables.'],
    'Adicione uma cena na aba TIMELINE para editar aqui.': ['Add a scene in the TIMELINE tab to edit it here.','Añade una escena en la pestaña TIMELINE para editarla aquí.'],
    'Cada cena tem duração, transições de entrada e saída e conteúdo próprios. Clique numa cena para editá-la na aba CENA; Play na barra do palco reproduz a timeline inteira.': [
      'Each scene has its own duration, in/out transitions and content. Click a scene to edit it in the SCENE tab; Play on the stage bar plays the whole timeline.',
      'Cada escena tiene su propia duración, transiciones de entrada/salida y contenido. Haz clic en una escena para editarla en la pestaña ESCENA; Play en la barra del escenario reproduce toda la timeline.'],
    'Duração e transições de entrada/saída ficam no cartão da cena, na aba TIMELINE.': [
      'Duration and in/out transitions live on the scene card, in the TIMELINE tab.',
      'La duración y las transiciones de entrada/salida están en la tarjeta de la escena, en la pestaña TIMELINE.'],
    'Efeitos e ícone padrão valem para todas as cenas. Ícones específicos são definidos por cena na aba CENA.': [
      'Effects and the default icon apply to all scenes. Specific icons are set per scene in the SCENE tab.',
      'Los efectos y el icono predeterminado aplican a todas las escenas. Los iconos específicos se definen por escena en la pestaña ESCENA.'],
    'Sem logo no brandbook ainda — envie na aba MARCA.': ['No logo in the brandbook yet — upload it in the BRAND tab.','Aún no hay logo en el brandbook — súbelo en la pestaña MARCA.'],

    /* templates (nomes) */
    'Manifesto': ['Manifesto','Manifiesto'],
    'Grid Suíço': ['Swiss Grid','Grid Suizo'],
    'Glow': ['Glow','Glow'],
    'Split': ['Split','Split'],
    'Produto/CTA': ['Product/CTA','Producto/CTA'],
    'Cartaz': ['Poster','Cartel'],
    'Editorial': ['Editorial','Editorial'],
    'Duotone': ['Duotone','Duotono'],
    'Sticker': ['Sticker','Sticker'],
    'Capa de e-book': ['E-book cover','Portada de e-book'],
    'Capítulo': ['Chapter','Capítulo'],
    'Tópicos': ['Topics','Temas'],
    /* cenas (nomes) */
    'Abertura de logo': ['Logo opening','Apertura de logo'],
    'Statement': ['Statement','Statement'],
    'Ponto com ícone': ['Point with icon','Punto con icono'],
    'Vitrine de imagem': ['Image showcase','Vitrina de imagen'],
    'Número que cresce': ['Growing number','Número que crece'],
    'Lista revelada': ['Revealed list','Lista revelada'],
    'Encerramento CTA': ['CTA closing','Cierre CTA'],
    'Split imagem+texto': ['Split image+text','Split imagen+texto'],
    'Citação': ['Quote','Cita'],
    'Passos numerados': ['Numbered steps','Pasos numerados'],
    'Marquee': ['Marquee','Marquee'],
    /* templates/cenas (descrições) */
    'Tipografia dominante; fundo, tratamento e decoração variam por seed.': ['Dominant typography; background, treatment and decoration vary by seed.','Tipografía dominante; fondo, tratamiento y decoración varían según la semilla.'],
    'Linhas técnicas; colunas, fundo e tratamento variam.': ['Technical lines; columns, background and treatment vary.','Líneas técnicas; columnas, fondo y tratamiento varían.'],
    'Aurora/orbes + cartão de vidro (comum ou liquid glass).': ['Aurora/orbs + glass card (plain or liquid glass).','Aurora/orbes + tarjeta de vidrio (común o liquid glass).'],
    'Metade imagem, metade texto; lado, fundo e tom variam.': ['Half image, half text; side, background and tone vary.','Mitad imagen, mitad texto; lado, fondo y tono varían.'],
    'Imagem em destaque com selo; rotação, máscara e fundo variam.': ['Featured image with a badge; rotation, mask and background vary.','Imagen destacada con sello; rotación, máscara y fondo varían.'],
    'Tipografia monumental vazada, faixa marquee, número de série.': ['Monumental outlined typography, marquee strip, serial number.','Tipografía monumental calada, franja marquee, número de serie.'],
    'Revista: réguas, colunas, imagem duotone, fólio.': ['Magazine: rules, columns, duotone image, folio.','Revista: reglas, columnas, imagen duotono, folio.'],
    'Imagem lavada nas cores da marca, tipografia de festival.': ['Image washed in the brand colors, festival typography.','Imagen lavada en los colores de la marca, tipografía de festival.'],
    'Adesivos com sombra dura, fundo chapado, humor pop.': ['Stickers with hard shadow, flat background, pop humor.','Stickers con sombra dura, fondo plano, humor pop.'],
    'Capa editorial com moldura, título monumental e assinatura da marca. Feita para o formato E-book A4 e aberturas de apresentação.': [
      'Editorial cover with frame, monumental title and brand signature. Made for the E-book A4 format and presentation openings.',
      'Portada editorial con marco, título monumental y firma de la marca. Hecha para el formato E-book A4 y aperturas de presentación.'],
    'Abertura de capítulo/seção: número monumental vazado (do rótulo), título e texto de apoio. Ideal para e-books e divisórias de apresentação.': [
      'Chapter/section opening: monumental outlined number (from the label), title and support text. Ideal for e-books and presentation dividers.',
      'Apertura de capítulo/sección: número monumental calado (de la etiqueta), título y texto de apoyo. Ideal para e-books y divisores de presentación.'],
    'Slide de conteúdo: cada linha do texto vira um bullet com marcador da marca. O par perfeito da exportação PPTX/PDF.': [
      'Content slide: each text line becomes a bullet with the brand marker. The perfect pair for PPTX/PDF export.',
      'Slide de contenido: cada línea del texto se convierte en un bullet con el marcador de la marca. El par perfecto de la exportación PPTX/PDF.'],
    'Logo revela com anel desenhado.': ['Logo reveals with a drawn ring.','El logo se revela con un anillo dibujado.'],
    'Frase de impacto letra a letra.': ['Impact phrase letter by letter.','Frase de impacto letra por letra.'],
    'Ícone grande + título + apoio. Bom para bullets.': ['Big icon + title + support. Good for bullets.','Icono grande + título + apoyo. Bueno para bullets.'],
    'Imagem da cena com máscara e legenda.': ['Scene image with mask and caption.','Imagen de la escena con máscara y leyenda.'],
    'Contador animado + rótulo.': ['Animated counter + label.','Contador animado + etiqueta.'],
    'Itens (um por linha) entram em cascata.': ['Items (one per line) cascade in.','Los ítems (uno por línea) entran en cascada.'],
    'Chamada final com logo e assinatura.': ['Final call with logo and signature.','Llamado final con logo y firma.'],
    'Imagem entra por um lado, texto pelo outro.': ['Image enters from one side, text from the other.','La imagen entra por un lado, el texto por el otro.'],
    'Frase entre aspas gigantes + autor.': ['Phrase between giant quotes + author.','Frase entre comillas gigantes + autor.'],
    'Aspas monumentais; fundo e tom variam por seed.': ['Monumental quotes; background and tone vary by seed.','Comillas monumentales; fondo y tono varían según la semilla.'],
    'Sequência 01→0N em cascata.': ['01→0N sequence in cascade.','Secuencia 01→0N en cascada.'],
    'Faixas correndo + palavra central.': ['Running strips + central word.','Franjas en movimiento + palabra central.'],

    /* toasts fixos */
    'Adicione cenas à timeline primeiro.': ['Add scenes to the timeline first.','Primero añade escenas a la timeline.'],
    'Adicione uma cena primeiro.': ['Add a scene first.','Primero añade una escena.'],
    'Este navegador não suporta gravação de vídeo.': ['This browser does not support video recording.','Este navegador no admite grabación de video.'],
    'H.264 indisponível — gerando WebM (tempo real).': ['H.264 unavailable — generating WebM (real time).','H.264 no disponible — generando WebM (tiempo real).'],
    'WebCodecs indisponível neste navegador — gerando WebM (tempo real).': ['WebCodecs unavailable in this browser — generating WebM (real time).','WebCodecs no disponible en este navegador — generando WebM (tiempo real).'],
    'WebM exportado (modo compatibilidade — timing depende da máquina).': ['WebM exported (compatibility mode — timing depends on the machine).','WebM exportado (modo compatibilidad — el timing depende de la máquina).'],
    'Clique num elemento da arte primeiro.': ['Click an element of the artwork first.','Primero haz clic en un elemento del arte.'],
    'Componente adicionado — arraste para posicionar, A−/A+ para escalar.': ['Component added — drag to position, A−/A+ to scale.','Componente añadido — arrastra para posicionar, A−/A+ para escalar.'],
    'Edições e composições desta arte desfeitas.': ['Edits and compositions of this artwork undone.','Ediciones y composiciones de este arte deshechas.'],
    'Elemento(s) travado(s) — destrave para animar.': ['Element(s) locked — unlock to animate.','Elemento(s) bloqueado(s) — desbloquea para animar.'],
    'Elemento(s) travado(s) — destrave para colorir.': ['Element(s) locked — unlock to color.','Elemento(s) bloqueado(s) — desbloquea para colorear.'],
    'Elemento(s) travado(s) — destrave para mudar a camada.': ['Element(s) locked — unlock to change the layer.','Elemento(s) bloqueado(s) — desbloquea para cambiar la capa.'],
    'Elemento(s) travado(s) — use o botão de trava para destravar.': ['Element(s) locked — use the lock button to unlock.','Elemento(s) bloqueado(s) — usa el botón de bloqueo para desbloquear.'],
    'Modo edição: clique seleciona (repita para pegar o de baixo); arraste no fundo para selecionar VÁRIOS; Shift+clique soma; arrastar move.': [
      'Edit mode: click selects (repeat to grab the one below); drag on the background to select SEVERAL; Shift+click adds; dragging moves.',
      'Modo edición: el clic selecciona (repite para tomar el de abajo); arrastra en el fondo para seleccionar VARIOS; Shift+clic suma; arrastrar mueve.'],
    'Selecione um elemento primeiro.': ['Select an element first.','Primero selecciona un elemento.'],
    'Todas as travas desta arte removidas.': ['All locks of this artwork removed.','Todos los bloqueos de este arte eliminados.'],
    'Brandbook restaurado ao padrão.': ['Brandbook restored to default.','Brandbook restaurado al valor predeterminado.'],
    'Brandbook salvo — carrega automático nas próximas sessões.': ['Brandbook saved — loads automatically in future sessions.','Brandbook guardado — se carga automáticamente en las próximas sesiones.'],
    'Cores da marca restauradas nesta arte.': ['Brand colors restored in this artwork.','Colores de la marca restaurados en este arte.'],
    'Envie a logo na aba MARCA — o item usa a logo do brandbook.': ['Upload the logo in the BRAND tab — the item uses the brandbook logo.','Sube el logo en la pestaña MARCA — el elemento usa el logo del brandbook.'],
    'Envie uma imagem primeiro.': ['Upload an image first.','Primero sube una imagen.'],
    'Escolha o tipo em “+ adicionar cena”, na aba TIMELINE.': ['Choose the type in “+ add scene”, in the TIMELINE tab.','Elige el tipo en “+ añadir escena”, en la pestaña TIMELINE.'],
    'Fundo branco removido (limiar local, sem IA).': ['White background removed (local threshold, no AI).','Fondo blanco eliminado (umbral local, sin IA).'],
    'Imagem aplicada a todos os slides.': ['Image applied to all slides.','Imagen aplicada a todos los slides.'],
    'Imagem aplicada via Ctrl+V.': ['Image applied via Ctrl+V.','Imagen aplicada vía Ctrl+V.'],
    'Imagem aplicada no palco.': ['Image applied on the stage.','Imagen aplicada en el escenario.'],
    'JSON inválido.': ['Invalid JSON.','JSON inválido.'],
    'Plugin com erro — veja o console.': ['Plugin error — check the console.','Plugin con error — mira la consola.'],
    'Plugin removido. Recarregue a página para limpar os registros dele.': ['Plugin removed. Reload the page to clear its registrations.','Plugin eliminado. Recarga la página para limpiar sus registros.'],
    'Projeto importado.': ['Project imported.','Proyecto importado.'],
    'Zoom ajustado à tela.': ['Zoom fit to screen.','Zoom ajustado a la pantalla.'],

    /* growth: marca d'água, captura e promo */
    'Quase lá! Antes do seu primeiro export…': ['Almost there! Before your first export…','¡Casi listo! Antes de tu primera exportación…'],
    'Deixe seu e-mail para acompanhar as novidades do Forje Studio e da Forjelo. Só pedimos uma vez.': [
      'Leave your email to follow Forje Studio and Forjelo news. We only ask once.',
      'Deja tu correo para seguir las novedades de Forje Studio y Forjelo. Solo lo pedimos una vez.'],
    'seu@email.com': ['you@email.com','tu@email.com'],
    'Liberar exportação': ['Unlock export','Desbloquear exportación'],
    'continuar sem informar': ['continue without email','continuar sin correo'],
    'E-mail inválido — confere o formato?': ['Invalid email — check the format?','Correo inválido — ¿revisas el formato?'],
    'Obrigado! Bons designs — exportação liberada.': ['Thank you! Happy designing — export unlocked.','¡Gracias! Buenos diseños — exportación desbloqueada.'],
    'Feito à mão pela Forjelo': ['Handcrafted by Forjelo','Hecho a mano por Forjelo'],
    'Curtiu o estúdio? Nós forjamos sistemas e produtos neste nível para a sua marca.': [
      'Enjoying the studio? We forge systems and products at this level for your brand.',
      '¿Te gusta el estudio? Forjamos sistemas y productos de este nivel para tu marca.'],
    'Conhecer a Forjelo →': ['Meet Forjelo →','Conocer Forjelo →'],
    'fechar': ['close','cerrar'],
  };

  /* ---------- padrões dinâmicos: [regex, en(m), es(m)] ---------- */
  const RX = [
    [/^Slide (\d+) removido — composições e cores dos demais preservadas\.$/,
      m=>`Slide ${m[1]} removed — compositions and colors of the others preserved.`,
      m=>`Slide ${m[1]} eliminado — composiciones y colores de los demás preservados.`],
    [/^Slide (\d+) adicionado e selecionado\.$/,
      m=>`Slide ${m[1]} added and selected.`, m=>`Slide ${m[1]} añadido y seleccionado.`],
    [/^Imagem aplicada (.+)\.$/,
      m=>`Image applied (${m[1]}).`, m=>`Imagen aplicada (${m[1]}).`],
    [/^Fonte "(.+)" carregada como display\. Salve o brandbook para persistir\.$/,
      m=>`Font "${m[1]}" loaded as display. Save the brandbook to persist it.`,
      m=>`Fuente "${m[1]}" cargada como display. Guarda el brandbook para persistirla.`],
    [/^Não consegui carregar essa fonte: (.*)$/,
      m=>`Could not load this font: ${m[1]}`, m=>`No pude cargar esta fuente: ${m[1]}`],
    [/^Plugin "(.+)" falhou: (.*)$/,
      m=>`Plugin "${m[1]}" failed: ${m[2]}`, m=>`El plugin "${m[1]}" falló: ${m[2]}`],
    [/^Falha no PDF: (.*)$/, m=>`PDF failure: ${m[1]}`, m=>`Fallo en el PDF: ${m[1]}`],
    [/^Falha no PPTX: (.*)$/, m=>`PPTX failure: ${m[1]}`, m=>`Fallo en el PPTX: ${m[1]}`],
    [/^Falha no vídeo: (.*)$/, m=>`Video failure: ${m[1]}`, m=>`Fallo en el video: ${m[1]}`],
    [/^Falha na exportação: (.*)$/, m=>`Export failure: ${m[1]}`, m=>`Fallo en la exportación: ${m[1]}`],
    [/^cena (\d+)\/(\d+)(.*)$/, m=>`scene ${m[1]}/${m[2]}${m[3]}`, m=>`escena ${m[1]}/${m[2]}${m[3]}`],
    [/^Cena (\d+) — (.*)$/, m=>`Scene ${m[1]} — ${tr(m[2])}`, m=>`Escena ${m[1]} — ${tr(m[2])}`],
    [/^Imagem do slide (\d+)$/, m=>`Slide ${m[1]} image`, m=>`Imagen del slide ${m[1]}`],
    [/^remover slide (\d+)$/, m=>`remove slide ${m[1]}`, m=>`quitar slide ${m[1]}`],
    [/^remover o slide (\d+)$/, m=>`remove slide ${m[1]}`, m=>`quitar el slide ${m[1]}`],
    [/^remover cena (\d+)$/, m=>`remove scene ${m[1]}`, m=>`quitar escena ${m[1]}`],
    [/^selecionar (slide|cena) (\d+) para edição em todas as abas$/,
      m=>`select ${m[1]==='slide'?'slide':'scene'} ${m[2]} for editing in all tabs`,
      m=>`seleccionar ${m[1]==='slide'?'slide':'escena'} ${m[2]} para edición en todas las pestañas`],
  ];

  /* ---------- estado do idioma ---------- */
  const LANGS = ['pt','en','es'];
  F.langPref = 'auto';                 // 'auto' | 'pt' | 'en' | 'es'
  F.lang = 'pt';

  function detect(){
    const cands = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'pt'])
      .map(l=>String(l).toLowerCase());
    for(const l of cands){
      if(l.startsWith('pt')) return 'pt';
      if(l.startsWith('es')) return 'es';
      if(l.startsWith('en')) return 'en';
    }
    return 'en';                       // fallback global: inglês
  }
  function resolve(){ return F.langPref==='auto' ? detect() : F.langPref; }

  const COL = {en:0, es:1};
  function tr(pt){                     // traduz uma string PT → idioma atual
    if(F.lang==='pt' || pt==null) return pt;
    const key = String(pt);
    const hit = S[key];
    if(hit) return hit[COL[F.lang]] || key;
    for(const [rx, en, es] of RX){
      const m = key.match(rx);
      if(m) return (F.lang==='en' ? en : es)(m);
    }
    return key;                        // sem tradução: mantém PT
  }
  F.t = tr;                            // API pública p/ novos módulos

  /* ---------- tradutor de DOM ----------
     Guarda o original PT de cada nó/atributo num WeakMap e
     sempre traduz A PARTIR do original — trocar de idioma
     re-traduz tudo, inclusive de volta ao PT. */
  const origText = new WeakMap();      // Text -> string PT
  const lastSet  = new WeakMap();      // Text -> última string escrita por nós
  const origAttr = new WeakMap();      // Element -> {attr: valor PT}
  const ATTRS = ['title','placeholder','aria-label','alt'];

  function skip(el){
    for(let n = el; n; n = n.parentElement){
      if(n.classList && (n.classList.contains('art') || n.hasAttribute('data-no-i18n'))) return true;
      const tag = n.tagName;
      if(tag==='SCRIPT' || tag==='STYLE' || tag==='TEXTAREA') return true;
    }
    return false;
  }

  function txNode(node){
    const cur = node.nodeValue;
    if(!cur || !cur.trim()) return;
    let pt = origText.get(node);
    if(pt===undefined || (lastSet.get(node)!==cur)){ pt = cur; origText.set(node, pt); }
    const lead = pt.match(/^\s*/)[0], tail = pt.match(/\s*$/)[0];
    const out = lead + tr(pt.trim()) + tail;
    if(out!==cur){ lastSet.set(node, out); node.nodeValue = out; }
    else lastSet.set(node, cur);
  }

  function txAttrs(el){
    let store = origAttr.get(el);
    for(const a of ATTRS){
      if(!el.hasAttribute(a)) continue;
      const cur = el.getAttribute(a);
      if(!store) { store = {}; origAttr.set(el, store); }
      if(store[a]===undefined || store['__set_'+a]!==cur) store[a] = cur;
      const out = tr(store[a]);
      if(out!==cur) el.setAttribute(a, out);
      store['__set_'+a] = el.getAttribute(a);
    }
  }

  function txTree(root){
    if(root.nodeType===3){ if(root.parentElement && !skip(root.parentElement)) txNode(root); return; }
    if(root.nodeType!==1 || skip(root)) return;
    txAttrs(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode(n){
        if(n.nodeType===1) return skip(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n; while((n = walker.nextNode())){
      if(n.nodeType===3) txNode(n); else txAttrs(n);
    }
  }

  const TITLES = {
    pt:'Forje·studio — design & motion por sistema',
    en:'Forje·studio — design & motion by system',
    es:'Forje·studio — diseño & motion por sistema',
  };
  function apply(){
    document.documentElement.lang = F.lang==='pt' ? 'pt-BR' : F.lang;
    document.title = TITLES[F.lang] || TITLES.pt;
    if(document.body) txTree(document.body);
    artSync();
  }

  /* ---------- conteúdo PADRÃO da arte (templates/cenas pré-prontos) ----------
     Regra: o que o USUÁRIO escreveu jamais é tocado. Só trocamos textos que
     são EXATAMENTE um padrão de fábrica (em qualquer dos 3 idiomas) pelo
     equivalente no idioma atual — slides/cenas/CTA pré-prontos acompanham a
     troca de idioma; o design em criação permanece intacto. */
  const ART = {
    'LANÇAMENTO': ['LAUNCH','LANZAMIENTO'],
    'PARTE': ['PART','PARTE'],
    'Pontos-chave': ['Key points','Puntos clave'],
    'Design de sistema,\nnão de sorte': ['Design by system,\nnot by luck','Diseño por sistema,\nno por suerte'],
    'Continue a história aqui': ['Continue the story here','Continúa la historia aquí'],
    'Um brandbook, infinitas composições. Determinístico quando você quer, variável quando você pede.':
      ['One brandbook, endless compositions. Deterministic when you want, variable when you ask.',
       'Un brandbook, infinitas composiciones. Determinístico cuando quieres, variable cuando lo pides.'],
    'Saiba mais →': ['Learn more →','Saber más →'],
    'Rápido\nConsistente\nSeu': ['Fast\nConsistent\nYours','Rápido\nConsistente\nTuyo'],
    /* nomes das cenas pré-prontas (viram o título default da cena) */
    'Abertura de logo': ['Logo opening','Apertura de logo'],
    'Statement': ['Statement','Statement'],
    'Ponto com ícone': ['Point with icon','Punto con icono'],
    'Vitrine de imagem': ['Image showcase','Vitrina de imagen'],
    'Número que cresce': ['Growing number','Número que crece'],
    'Lista revelada': ['Revealed list','Lista revelada'],
    'Encerramento CTA': ['CTA closing','Cierre CTA'],
    'Split imagem+texto': ['Split image+text','Split imagen+texto'],
    'Citação': ['Quote','Cita'],
    'Passos numerados': ['Numbered steps','Pasos numerados'],
    'Marquee': ['Marquee','Marquee'],
  };
  const A_COL = {pt:null, en:0, es:1};
  /* qualquer idioma → idioma atual (só para valores exatamente padrão) */
  function artTr(v){
    if(v==null || v==='') return v;
    const s = String(v);
    for(const pt in ART){
      const [en,es] = ART[pt];
      if(s===pt || s===en || s===es)
        return F.lang==='pt' ? pt : ART[pt][A_COL[F.lang]];
    }
    const m = s.match(/^(PARTE|PART) (0?\d+)$/);
    if(m) return (F.lang==='en' ? 'PART ' : 'PARTE ') + m[2];
    return v;                                   // texto do usuário: intocado
  }
  F.dtr = artTr;                                // defaults novos nascem no idioma atual
  function artSync(){
    if(!F.state) return;
    let dirty = false;
    const sw = (obj,k)=>{ const nv = artTr(obj[k]); if(nv!==obj[k]){ obj[k]=nv; dirty=true; } };
    sw(F.state,'cta');
    (F.state.slides||[]).forEach(sl=>{ sw(sl,'kicker'); sw(sl,'title'); sw(sl,'sub'); });
    (F.state.timeline||[]).forEach(sc=>{ sw(sc,'kicker'); sw(sc,'title'); sw(sc,'sub'); sw(sc,'items'); });
    if(dirty){
      F.autoSave && F.autoSave();
      F.render && F.render(false);
      if(F.ui && F.ui.refreshActive) F.ui.refreshActive();   // inputs do CONTEÚDO/CENA acompanham
    }
  }

  F.setLang = async function(pref){
    F.langPref = LANGS.includes(pref) ? pref : 'auto';
    F.lang = resolve();
    try{ await F.stSet('forma:lang', F.langPref); }catch(e){}
    apply();
  };

  /* observer: pega painéis reconstruídos, toasts, labels dinâmicos */
  let obs;
  function watch(){
    if(obs) return;
    obs = new MutationObserver(muts=>{
      if(F.lang==='pt') return;                      // PT é a fonte: nada a fazer
      for(const m of muts){
        if(m.type==='characterData'){
          const node = m.target;
          if(node.nodeValue!==lastSet.get(node) && node.parentElement && !skip(node.parentElement)){
            origText.set(node, node.nodeValue);      // novo conteúdo genuíno
            txNode(node);
          }
        }else if(m.type==='childList'){
          m.addedNodes.forEach(n=>txTree(n));
        }else if(m.type==='attributes'){
          const el = m.target;
          if(el.nodeType===1 && !skip(el)){
            const store = origAttr.get(el), a = m.attributeName;
            const cur = el.getAttribute(a);
            if(cur!=null && (!store || store['__set_'+a]!==cur)){
              if(store) store[a] = cur;
              txAttrs(el);
            }
          }
        }
      }
    });
    obs.observe(document.body, {childList:true, subtree:true, characterData:true,
      attributes:true, attributeFilter:ATTRS});
  }

  /* ---------- boot ---------- */
  F.i18nInit = async function(){
    try{ const saved = await F.stGet('forma:lang'); if(saved && LANGS.concat('auto').includes(saved)) F.langPref = saved; }catch(e){}
    F.lang = resolve();
    apply();
    watch();
  };

})(window.FORMA);
