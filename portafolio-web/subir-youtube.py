#!/usr/bin/env python3
"""
subir-youtube.py — sube tus videos a YouTube y te devuelve el código
                   listo para pegar en el sitio.

POR QUÉ ESTO: GitHub Pages no sirve bien archivos grandes (límite de
100 MB por archivo, 1 GB por repositorio, y sin CDN de video). Subir a
YouTube como "no listado" te da streaming adaptativo gratis, sin tocar
tu cuota de GitHub, y los videos no salen en búsquedas ni en tu canal.

--------------------------------------------------------------------
PREPARACIÓN (una sola vez, unos 10 minutos)
--------------------------------------------------------------------
1. Instala las librerías:

   pip install google-auth-oauthlib google-api-python-client

2. Crea las credenciales:
   a) Entra a https://console.cloud.google.com/
   b) Crea un proyecto nuevo (nómbralo "portafolio" o lo que quieras).
   c) Busca "YouTube Data API v3" en la barra y dale ACTIVAR.
   d) Ve a "Credenciales" → "Crear credenciales" → "ID de cliente de
      OAuth" → tipo de aplicación: "App de escritorio".
   e) Descarga el JSON y guárdalo junto a este script con el nombre
      client_secret.json
   f) En "Pantalla de consentimiento de OAuth", agrega tu propio correo
      de Gmail en "Usuarios de prueba". Sin esto Google te va a
      rechazar el acceso.

--------------------------------------------------------------------
USO
--------------------------------------------------------------------
   # subir un video
   python subir-youtube.py assets/cine-final.mp4

   # subir varios de una
   python subir-youtube.py assets/cine-final.mp4 assets/reel-principal.mp4

   # subir TODOS los de una carpeta
   python subir-youtube.py --carpeta assets

   # como público en lugar de no listado
   python subir-youtube.py assets/reel.mp4 --privacidad public

La primera vez se abre el navegador para que autorices. Después guarda
el permiso en token.json y ya no vuelve a pedirlo.

Al terminar escribe embeds.txt con el código HTML de cada video.

--------------------------------------------------------------------
CUIDADO CON LA CUOTA
--------------------------------------------------------------------
La API da 10.000 unidades al día y cada subida cuesta ~1.600. Eso son
unos 6 videos por día. Si necesitas subir más, hazlo desde la web de
YouTube y usa --solo-embed para generar el código.
"""

import os
import sys
import json
import argparse

SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
EXTS = ('.mp4', '.mov', '.m4v', '.webm')


def autenticar():
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request

    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('client_secret.json'):
                print('\nERROR: no encuentro client_secret.json')
                print('Sigue los pasos de PREPARACIÓN arriba en este archivo.\n')
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as f:
            f.write(creds.to_json())
    return creds


def titulo_bonito(ruta):
    n = os.path.splitext(os.path.basename(ruta))[0]
    return n.replace('-', ' ').replace('_', ' ').title()


def subir(youtube, ruta, privacidad, descripcion):
    from googleapiclient.http import MediaFileUpload
    from googleapiclient.errors import HttpError

    mb = os.path.getsize(ruta) / 1024 / 1024
    print(f'\n→ {os.path.basename(ruta)}  ({mb:.1f} MB)')

    cuerpo = {
        'snippet': {
            'title': titulo_bonito(ruta),
            'description': descripcion,
            'categoryId': '1',          # Film & Animation
        },
        'status': {
            'privacyStatus': privacidad,
            'selfDeclaredMadeForKids': False,
        },
    }

    media = MediaFileUpload(ruta, chunksize=5 * 1024 * 1024, resumable=True)
    req = youtube.videos().insert(part='snippet,status', body=cuerpo, media_body=media)

    resp = None
    while resp is None:
        try:
            estado, resp = req.next_chunk()
            if estado:
                pct = int(estado.progress() * 100)
                barra = '█' * (pct // 4) + '░' * (25 - pct // 4)
                print(f'\r  {barra} {pct}%', end='', flush=True)
        except HttpError as e:
            if e.resp.status in (500, 502, 503, 504):
                print('\n  reintentando…')
                continue
            if 'quotaExceeded' in str(e):
                print('\n  CUOTA AGOTADA. Espera al reinicio diario '
                      '(medianoche hora del Pacífico) o sube desde la web.')
                return None
            raise

    print(f'\r  {"█" * 25} 100%')
    vid = resp['id']
    print(f'  listo → https://youtu.be/{vid}')
    return vid


def embed_html(video_id, titulo):
    return f'''<!-- {titulo} -->
<div class="yt-embed">
  <iframe src="https://www.youtube.com/embed/{video_id}?rel=0&modestbranding=1"
          title="{titulo}" frameborder="0" loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowfullscreen></iframe>
</div>'''


CSS_EMBED = '''
/* pega esto en css/styles.css si usas embeds de YouTube */
.yt-embed{position:relative;width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;
  border:1px solid rgba(242,234,224,.1);background:#000;}
.yt-embed iframe{position:absolute;inset:0;width:100%;height:100%;}
'''


def main():
    ap = argparse.ArgumentParser(description='Sube videos a YouTube y genera los embeds.')
    ap.add_argument('videos', nargs='*', help='rutas de los videos')
    ap.add_argument('--carpeta', help='sube todos los videos de una carpeta')
    ap.add_argument('--privacidad', default='unlisted',
                    choices=['unlisted', 'private', 'public'],
                    help='unlisted (por defecto) = no sale en búsquedas ni en tu canal')
    ap.add_argument('--descripcion', default='Portafolio — Enrique Antonio Cepeda · @antoine.vfx')
    ap.add_argument('--solo-embed', action='store_true',
                    help='no sube nada: genera el HTML a partir de IDs que le pases')
    args = ap.parse_args()

    if args.solo_embed:
        print('Pega los IDs de YouTube (uno por línea, Enter vacío para terminar).')
        print('El ID es lo que va después de /watch?v=  o de youtu.be/\n')
        salida = []
        while True:
            vid = input('ID: ').strip()
            if not vid:
                break
            salida.append(embed_html(vid, vid))
        if salida:
            with open('embeds.txt', 'w', encoding='utf-8') as f:
                f.write('\n\n'.join(salida) + '\n\n' + CSS_EMBED)
            print('\nEscrito en embeds.txt')
        return

    rutas = list(args.videos)
    if args.carpeta:
        rutas += [os.path.join(args.carpeta, f)
                  for f in sorted(os.listdir(args.carpeta))
                  if f.lower().endswith(EXTS)]

    rutas = [r for r in rutas if os.path.exists(r)]
    if not rutas:
        ap.print_help()
        print('\nNo me pasaste videos válidos.')
        return

    total_mb = sum(os.path.getsize(r) for r in rutas) / 1024 / 1024
    print(f'\n{len(rutas)} video(s), {total_mb:.1f} MB en total')
    print(f'Privacidad: {args.privacidad}')
    if len(rutas) > 6:
        print('\nOJO: más de 6 subidas puede agotar la cuota diaria de la API.')
    if input('\n¿Seguimos? (s/n) ').lower() not in ('s', 'si', 'sí', 'y'):
        return

    from googleapiclient.discovery import build
    youtube = build('youtube', 'v3', credentials=autenticar())

    resultados = []
    for r in rutas:
        vid = subir(youtube, r, args.privacidad, args.descripcion)
        if vid is None:
            break
        resultados.append((os.path.basename(r), vid))

    if resultados:
        with open('embeds.txt', 'w', encoding='utf-8') as f:
            for nombre, vid in resultados:
                f.write(embed_html(vid, nombre) + '\n\n')
            f.write(CSS_EMBED)

        with open('youtube-ids.json', 'w', encoding='utf-8') as f:
            json.dump(dict(resultados), f, indent=2, ensure_ascii=False)

        print(f'\n{"="*52}')
        print(f'{len(resultados)} video(s) subidos.')
        print('  embeds.txt        → código HTML para pegar')
        print('  youtube-ids.json  → los IDs por archivo')
        print(f'{"="*52}\n')
        print('Para usar uno en el modal de casos, abre js/main.js y en')
        print('CASOS_VIDEO pon, por ejemplo:')
        print("  'eleden': 'https://www.youtube.com/embed/" + resultados[0][1] + "',\n")


if __name__ == '__main__':
    main()
