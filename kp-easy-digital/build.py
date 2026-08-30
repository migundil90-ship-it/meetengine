# -*- coding: utf-8 -*-
"""Сборка КП для Easy Digital: шрифты и логотипы вшиваются base64, наружу файл не ходит."""
import base64, os, re, io

ROOT = '/Users/mihail/meetengine'
HERE = os.path.dirname(os.path.abspath(__file__))

FONTS = open('/private/tmp/claude-501/-Users-mihail-meetengine-kp/9f537014-a22a-40ec-a70d-c0fb615e98be/scratchpad/fonts.css', encoding='utf-8').read()

DARK = {'samolet','magnit','pg','kaspersky','megafon','sportmaster','evalar'}

def logo(name, cls='lg', alt=''):
    p = os.path.join(ROOT, 'meetengine-kp-trening', 'logos', name + '.png')
    if not os.path.exists(p):
        p = os.path.join(ROOT, 'logos', name + '.png')
    b = base64.b64encode(open(p,'rb').read()).decode()
    c = cls + (' inv' if name in DARK else '')
    return '<img class="%s" alt="%s" src="data:image/png;base64,%s">' % (c, alt or name, b)

def raw_b64(name):
    p = os.path.join(ROOT, 'logos', name + '.png')
    if not os.path.exists(p):
        p = os.path.join(ROOT, 'meetengine-kp-trening', 'logos', name + '.png')
    return 'data:image/png;base64,' + base64.b64encode(open(p,'rb').read()).decode()

BODY = open(os.path.join(HERE, 'body.tpl'), encoding='utf-8').read()
CSS  = open(os.path.join(HERE, 'style.css'), encoding='utf-8').read()
JS   = open(os.path.join(HERE, 'deck.js'), encoding='utf-8').read()

# подстановка логотипов вида {{logo:magnit}} и {{src:eda.xyz}}
BODY = re.sub(r'\{\{logo:([^}|]+)(?:\|([^}]+))?\}\}',
              lambda m: logo(m.group(1), 'lg', m.group(2) or ''), BODY)
BODY = re.sub(r'\{\{case:([^}|]+)(?:\|([^}]+))?\}\}',
              lambda m: logo(m.group(1), 'caselogo', m.group(2) or ''), BODY)
BODY = re.sub(r'\{\{src:([^}]+)\}\}', lambda m: raw_b64(m.group(1)), BODY)

n_slides = BODY.count('class="slide')
html = """<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>MEETENGINE x easy - системный выход на ЛПР в брендах</title>
<style>%s</style>
<style>%s</style>
</head><body>
<div id="bar"></div>
<div class="brandmark">MEET<span>ENGINE</span></div>
<div id="hint">&#8592; &#8594; ЛИСТАТЬ</div>
<div id="deck">%s</div>
<div id="nav">
  <span id="count"></span>
  <button id="prev" aria-label="Назад">&#8249;</button>
  <button id="next" aria-label="Вперёд">&#8250;</button>
</div>
<script>%s</script>
</body></html>""" % (FONTS, CSS, BODY, JS)

out = os.path.join(HERE, 'index.html')
open(out, 'w', encoding='utf-8').write(html)
print('слайдов:', n_slides, '· байт:', len(html), '->', out)
