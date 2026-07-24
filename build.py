#!/usr/bin/env python3
"""
FORJE·studio — build.py
1) Injeta css/art.css dentro do <style id="artcss"> do index.html
   (o export HTML/PNG lê esse bloco em runtime).
2) Gera dist/forje-studio-preview.html: bundle single-file com
   todo CSS/JS inline — útil para compartilhar ou testar num
   ambiente que só aceita um arquivo.
Rode após editar css/art.css ou qualquer módulo js/.
"""
import re, pathlib

ROOT = pathlib.Path(__file__).parent
read = lambda p: (ROOT/p).read_text(encoding='utf-8')

JS_ORDER = ['js/core/state.js','js/core/palette.js','js/core/composer.js','js/core/content.js','js/core/batch.js','js/core/i18n.js','js/lib/fonts.js','js/lib/icons.js','js/lib/anims.js','js/lib/bgs.js','js/lib/shapes.js','js/lib/codes.js','js/lib/components.js','js/lib/components-extra.js',
            'js/templates/static.js','js/templates/extra.js','js/templates/doc.js','js/motion/scenes.js','js/motion/scenes-extra.js','js/motion/player.js',
            'js/core/render.js','js/core/export.js','js/core/export-doc.js','js/ui/editor.js','js/ui/panels.js','js/ui/resize.js','js/ui/boards.js','js/ui/variations.js','js/core/growth.js','js/app.js']

artcss = read('css/art.css')

# 1) injetar no index.html
index = read('index.html')
index = re.sub(r'(<style id="artcss">)[\s\S]*?(</style>)',
               lambda m: m.group(1) + '\n' + artcss + '\n' + m.group(2), index, count=1)
(ROOT/'index.html').write_text(index, encoding='utf-8')

# 2) bundle de preview
bundle = index
bundle = bundle.replace('<link rel="stylesheet" href="css/app.css">',
                        '<style>\n' + read('css/app.css') + '\n</style>')
for src in ['vendor/html-to-image.js','vendor/mp4-muxer.js','vendor/qrcode-generator.js'] + JS_ORDER:
    js = read(src).replace('</script>', '<\\/script>')
    bundle = bundle.replace(f'<script src="{src}"></script>',
                            f'<script>\n/* ===== {src} ===== */\n{js}\n</script>')
(ROOT/'dist').mkdir(exist_ok=True)
(ROOT/'dist/forje-studio-preview.html').write_text(bundle, encoding='utf-8')
print('ok: index.html atualizado e dist/forje-studio-preview.html gerado',
      f'({len(bundle)//1024} KB)')
