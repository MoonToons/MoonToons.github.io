#!/usr/bin/env python3
"""
REVISAR.py — te dice qué falta antes de publicar.

Uso:  python revisar.py
"""
import os, json, hashlib, sys

A = 'assets'
V = '\033[0m'; R = '\033[91m'; G = '\033[92m'; Y = '\033[93m'; B = '\033[1m'
if os.name == 'nt' and not os.environ.get('WT_SESSION'):
    V = R = G = Y = B = ''

DESCR = {
 'work-fooh2.jpg':         'Tarjeta FOOH 2 (800x600)',
 'work-drone.jpg':         'Tarjeta Aéreo drone (800x600)',
 'work-musica.jpg':        'Tarjeta Video musical (800x600)',
 'work-corporativo.jpg':   'Tarjeta Corporativo (800x600)',
 'work-eleden.mp4':        'Hover + modal El Eden (1280x720)',
 'work-maria.mp4':         'Hover + modal Maria Salazar',
 'work-nova.mp4':          'Hover + modal Sistema Nova',
 'work-novaagencia.mp4':   'Hover + modal Nova Agencia',
 'work-theglow.mp4':       'Hover + modal The Glow',
 'work-nicolas.mp4':       'Hover + modal Nicolas Lara',
 'work-fooh2.mp4':         'Hover + modal FOOH 2',
 'work-drone.mp4':         'Hover + modal Drone',
 'work-musica.mp4':        'Hover + modal Video musical',
 'work-corporativo.mp4':   'Hover + modal Corporativo',
 'makingof-drone.mp4':     'Hover making of drone',
 'makingof-camara.mp4':    'Hover making of camara',
 'makingof-set.mp4':       'Hover making of set',
 'makingof-gear.mp4':      'Hover making of equipo',
 'ig-silvia.jpg':          'Foto perfil IG - The Glow (240x240)',
 'ig-maria.jpg':           'Foto perfil IG - Maria Salazar (240x240)',
 'ig-nova.jpg':            'Foto perfil IG - Sistema Nova (240x240)',
 'ig-novaagencia.jpg':     'Foto perfil IG - Nova Agencia (240x240)',
 'ig-javi.jpg':            'Foto perfil IG - Javi Reelve (240x240)',
 'ig-eleden.jpg':          'Foto perfil IG - CC El Eden (240x240)',
 'nodo-log.jpg':           'Nodo color 01 - LOG sin gradear (1400x788)',
 'nodo-camara.jpg':        'Nodo color 02 - correccion camara (1400x788)',
 'nodo-final.jpg':         'Nodo color 03 - grado final (1400x788)',
 'eleden-1.mp4':           'El Eden FOOH pieza 1 (1080x1350)',
 'eleden-2.mp4':           'El Eden FOOH pieza 2 (1080x1350)',
 'eleden-3.mp4':           'El Eden FOOH pieza 3 (1080x1350)',
 'eleden-4.mp4':           'El Eden FOOH pieza 4 (1080x1350)',
 'prensa-1.jpg':           'Recorte de prensa 1 (640x420)',
 'prensa-2.jpg':           'Recorte de prensa 2 (640x420)',
 'prensa-3.jpg':           'Recorte de prensa 3 (640x420)',
 'drone-1.mp4':            'Drone - aereo cinematografico (1920x1080)',
 'drone-2.mp4':            'Drone - FPV Avata 2 (1920x1080)',
 'drone-3.mp4':            'Drone - plano de revelado (1920x1080)',
 'proceso-modelado.mp4':   'Proceso 01 - modelado (1920x1080)',
 'proceso-animacion.mp4':  'Proceso 02 - animacion (1920x1080)',
 'proceso-tracking.mp4':   'Proceso 03 - tracking (1920x1080)',
 'proceso-grabacion.mp4':  'Proceso 04 - grabacion (1920x1080)',
 'proceso-integracion.mp4':'Proceso 05 - color e integracion (1920x1080)',
 'proceso-final.mp4':      'Proceso 06 - entrega final (1920x1080)',
 'logo-panasonic.png':     'Logo oficial Panasonic (PNG transparente)',
 'logo-dji.png':           'Logo oficial DJI (PNG transparente)',
 'logo-blackmagic.png':    'Logo oficial Blackmagic (PNG transparente)',
 'logo-insta360.png':      'Logo oficial Insta360 (PNG transparente)',
 'logo-sigma.png':         'Logo oficial Sigma (PNG transparente)',
 'logo-sirui.png':         'Logo oficial Sirui (PNG transparente)',
 'logo-leica.png':         'Logo oficial Leica (PNG transparente)',
 'logo-davinci.png':       'Logo oficial DaVinci Resolve (PNG transparente)',
 'logo-aftereffects.png':  'Logo oficial After Effects (PNG transparente)',
 'logo-houdini.png':       'Logo oficial Houdini (PNG transparente)',
 'reel-principal.mp4':      'Reel principal (1920x1080)',
 'caso-ads.mp4':            'Caso vertical 1 (1080x1350)',
 'caso-fooh.mp4':           'Caso vertical 2 (1080x1350)',
 'caso-extra.mp4':          'Caso vertical 3 (1080x1350)',
 'cine-rodaje.mp4':         'Cine — cómo se grabó (1080x1920)',
 'cine-estreno.mp4':        'Cine — día del estreno (1080x1920)',
 'cine-final.mp4':          'Cine — la película (1920x1080)',
 'svc-vsl.mp4':             'Servicio VSL (1080x1350)',
 'svc-ads.mp4':             'Servicio Ads (1080x1350)',
 'svc-color.mp4':           'Servicio Color (1080x1350)',
 'svc-motion.mp4':          'Servicio Motion (1080x1350)',
 'svc-vfx.mp4':             'Servicio VFX/FOOH (1080x1350)',
 'svc-ia.mp4':              'Servicio IA (1080x1350)',
 'svc-plugins.mp4':         'Servicio Plugins (1080x1350)',
 'svc-youtube.mp4':         'Servicio YouTube (1080x1350)',
 'svc-documental.mp4':      'Servicio Documental (1080x1350)',
 'antonio-headshot.png':    'Tu foto del hero (1080x1350)',
 'work-eleden.jpg':         'Tarjeta Jurassic El Edén (1200x675)',
 'work-maria.jpg':          'Tarjeta María Salazar (800x800)',
 'work-nova.jpg':           'Tarjeta Sistema Nova (800x800)',
 'work-novaagencia.jpg':    'Tarjeta Nova Agencia (800x600)',
 'work-theglow.jpg':        'Tarjeta The Glow (800x600)',
 'work-nicolas.jpg':        'Tarjeta Nicolás Lara (800x600)',
 'color-antes.jpg':         'Comparador — SIN gradear (1600x900)',
 'color-despues.jpg':       'Comparador — gradeado (1600x900)',
 'pano-360.jpg':            'Vista 360 (3200x900)',
 'makingof-drone.jpg':      'Making of — drone (900x1200)',
 'makingof-camara.jpg':     'Making of — cámara (900x1200)',
 'makingof-set.jpg':        'Making of — set (1200x900)',
 'makingof-gear.jpg':       'Making of — equipo (1200x900)',
}

def main():
    if not os.path.isdir(A):
        print(f'{R}No encuentro la carpeta assets/. Corre esto desde la raíz del proyecto.{V}')
        sys.exit(1)

    try:
        orig = json.load(open('.placeholders.json'))
    except FileNotFoundError:
        orig = {}

    pend, listo, pesados, ausentes = [], [], [], []

    for f, d in DESCR.items():
        p = os.path.join(A, f)
        if not os.path.exists(p):
            ausentes.append((f, d)); continue
        mb = os.path.getsize(p) / 1024 / 1024
        md5 = hashlib.md5(open(p, 'rb').read()).hexdigest()
        if orig.get(f) == md5:
            pend.append((f, d))
        else:
            listo.append((f, d, mb))
            if f.endswith('.mp4') and mb > 5:
                pesados.append((f, mb))

    print(f'\n{B}══ ESTADO DEL PORTAFOLIO ══{V}\n')
    print(f'{G}Reemplazados: {len(listo)}{V}   {Y}Pendientes: {len(pend)}{V}   {R}Ausentes: {len(ausentes)}{V}\n')

    if pend:
        print(f'{Y}{B}TODAVÍA SON REFERENCIAS — falta poner los tuyos:{V}')
        for f, d in pend:
            print(f'  {Y}○{V} {f:26} {d}')
        print()

    if ausentes:
        print(f'{R}{B}FALTAN DEL TODO (el sitio va a mostrar un hueco):{V}')
        for f, d in ausentes:
            print(f'  {R}✗{V} {f:26} {d}')
        print()

    if pesados:
        print(f'{R}{B}PESAN DEMASIADO (más de 5 MB, van a cargar lento):{V}')
        for f, mb in pesados:
            print(f'  {R}!{V} {f:26} {mb:.1f} MB')
        print(f'\n  Comprime con:')
        print(f'  ffmpeg -i {pesados[0][0]} -c:v libx264 -crf 30 -vf "scale=1080:-2" -an nuevo.mp4\n')

    if listo:
        print(f'{G}{B}YA SON TUYOS:{V}')
        for f, d, mb in listo:
            print(f'  {G}✓{V} {f:26} {mb:.1f} MB')
        print()

    # pendientes en el código
    html = open('index.html', encoding='utf-8').read()
    avisos = []
    if 'tucorreo@ejemplo.com' in html: avisos.append('Falta tu correo real')
    if '57XXXXXXXXXX' in html:         avisos.append('Falta tu WhatsApp real')
    n = html.count('href="#"')
    if n:                              avisos.append(f'{n} enlaces sin destino (clientes)')
    if '<section id="assets">' in html: avisos.append('Todavía está la sección de guía (bórrala antes de publicar)')
    n2 = html.count('REEMPLAZAR')
    if n2: avisos.append(f'{n2} textos dicen REEMPLAZAR (cifras, medios de prensa, carreras)')

    if avisos:
        print(f'{Y}{B}PENDIENTES EN EL CÓDIGO:{V}')
        for a in avisos:
            print(f'  {Y}○{V} {a}')
        print()

    if not pend and not ausentes and not pesados and not avisos:
        print(f'{G}{B}Todo listo para publicar.{V}\n')

if __name__ == '__main__':
    main()
