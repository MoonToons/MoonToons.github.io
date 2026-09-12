# Portafolio — guía de trabajo

## Estructura del proyecto

```
portafolio-web/
├── index.html          ← estructura y todos los textos
├── css/styles.css      ← todo el diseño (con índice al inicio)
├── js/main.js          ← interacciones (con índice al inicio)
├── assets/             ← tus fotos y videos
└── .vscode/            ← configuración recomendada
```

## Abrirlo en VS Code

1. Abre la carpeta `portafolio-web` en VS Code.
2. Te va a sugerir instalar **Live Server** — acéptalo.
3. Clic derecho en `index.html` → "Open with Live Server".
4. Cada vez que guardes, el navegador se recarga solo.

## Dónde tocar cada cosa

| Quiero cambiar… | Archivo | Busca |
|---|---|---|
| Un texto cualquiera | `index.html` | el texto mismo |
| Color de acento | `css/styles.css` | `--halation` |
| Fuerza del grano | `css/styles.css` | `--grain-opacity` |
| Tamaño del grano | `js/main.js` | `SCALE`, `GRAIN_LUMA` |
| Ancho del sitio | `css/styles.css` | `--maxw` |
| Velocidad de carruseles | `css/styles.css` | `railL`, `railR` |
| Intensidad del flote | `css/styles.css` | `@keyframes wig1` |

---

# Cómo poner tus fotos y videos

## La regla básica

Todo lo que ves en el sitio vive en la carpeta `assets/`. Para reemplazar
cualquier cosa: **borras el archivo de referencia y pones el tuyo con el
mismo nombre exacto**. No tocas nada de código.

Si tu archivo se llama `mi reel final V3.mp4`, renómbralo a
`reel-principal.mp4` y reemplaza el que está. Listo.

El nombre debe coincidir letra por letra, incluidos guiones y extensión.
`Reel-Principal.MP4` no sirve, tiene que ser `reel-principal.mp4`.

---

## Videos: ¿local o YouTube?

**Locales (dentro de `assets/`)** para todo lo corto: los carruseles de
servicios, los casos verticales, los clips de rodaje y estreno. Se
reproducen sin salir del sitio, sin logo de YouTube, sin "videos
recomendados" al final llevándose a tu cliente. Es la opción correcta
para casi todo el portafolio.

Condiciones para que funcionen bien:
- Formato **MP4 con códec H.264** y audio AAC. Si exportas otra cosa
  (ProRes, H.265, WebM) hay navegadores donde no carga.
- **Sin audio** los que están en loop automático — los navegadores
  bloquean el autoplay con sonido.
- Máximo **5 MB por clip**. Un clip de 15 s a 1080p debería pesar 2–3 MB.

Comando para preparar cualquier video (necesitas ffmpeg):

```
ffmpeg -i tu-video.mov -c:v libx264 -crf 26 -preset slow -vf "scale=1080:-2" -an salida.mp4
```

Sube el `-crf` a 30 si pesa mucho; bájalo a 22 si se ve blando.

**YouTube o Vimeo** solo para dos casos: la película completa y el reel
largo si pasa de 5 MB. Son piezas que el cliente va a ver una vez, no
material que deba cargar de entrada. Para incrustar uno, dime cuál y te
paso el bloque exacto para pegar.

---

## Fotos

Usa **JPG** (o WebP si sabes convertir). Nada de PNG para fotografía:
pesa cuatro veces más sin verse mejor.

Exporta al tamaño que dice la tabla de abajo y con calidad 70–80. Una
foto de 500 KB ya es demasiado; apunta a 150–250 KB.

---

## Tabla de reemplazo

### Videos

| Archivo | Medida | Dónde sale |
|---|---|---|
| `reel-principal.mp4` | 1920×1080 | Reel grande de la sección Reel |
| `caso-ads.mp4` | 1080×1350 | Caso vertical 1 |
| `caso-fooh.mp4` | 1080×1350 | Caso vertical 2 |
| `caso-extra.mp4` | 1080×1350 | Caso vertical 3 |
| `cine-rodaje.mp4` | 1080×1920 | Sección de cine — cómo se grabó |
| `cine-estreno.mp4` | 1080×1920 | Sección de cine — día del estreno |
| `cine-final.mp4` | 1920×1080 | Sección de cine — la película |
| `svc-vsl.mp4` | 1080×1350 | Carrusel de servicios — VSL |
| `svc-ads.mp4` | 1080×1350 | Carrusel — Ads |
| `svc-color.mp4` | 1080×1350 | Carrusel — Color grading |
| `svc-motion.mp4` | 1080×1350 | Carrusel — Motion graphics |
| `svc-vfx.mp4` | 1080×1350 | Carrusel — VFX / FOOH |
| `svc-ia.mp4` | 1080×1350 | Carrusel — Flujos con IA |
| `svc-plugins.mp4` | 1080×1350 | Carrusel — Plugins |
| `svc-youtube.mp4` | 1080×1350 | Carrusel — Video YouTube |
| `svc-documental.mp4` | 1080×1350 | Carrusel — Documental |

Cada video tiene además un **póster** (la imagen que se ve antes de
reproducir): mismo nombre pero `.jpg`. Por ejemplo `svc-vsl.jpg`.
Sácalo con:

```
ffmpeg -i svc-vsl.mp4 -vframes 1 svc-vsl.jpg
```

### Fotos

| Archivo | Medida | Dónde sale |
|---|---|---|
| `antonio-headshot.png` | 1080×1350 | Tu foto del hero |
| `work-eleden.jpg` | 1200×675 | Tarjeta grande — Jurassic El Edén |
| `work-maria.jpg` | 800×800 | Tarjeta — María Salazar |
| `work-nova.jpg` | 800×800 | Tarjeta — Sistema Nova |
| `work-novaagencia.jpg` | 800×600 | Tarjeta — Nova Agencia |
| `work-theglow.jpg` | 800×600 | Tarjeta — The Glow |
| `work-nicolas.jpg` | 800×600 | Tarjeta — Nicolás Lara |
| `color-antes.jpg` | 1600×900 | Comparador — frame sin gradear |
| `color-despues.jpg` | 1600×900 | Comparador — frame gradeado |
| `pano-360.jpg` | 3200×900 | Vista 360 arrastrable |
| `makingof-drone.jpg` | 900×1200 | Making of — volando drone |
| `makingof-camara.jpg` | 900×1200 | Making of — cámara en mano |
| `makingof-set.jpg` | 1200×900 | Making of — set general |
| `makingof-gear.jpg` | 1200×900 | Making of — equipo |

**Importante con el comparador de color:** `color-antes.jpg` y
`color-despues.jpg` tienen que ser **el mismo fotograma exacto**, uno sin
gradear y otro gradeado. Si son tomas distintas el efecto no funciona.

**Para la 360:** exporta la panorámica equirectangular del Insta360 como
una tira horizontal larga. Cuanto más ancha, más recorrido tiene el
arrastre.

---

## Antes de publicar

1. Cambia tu correo y tu WhatsApp en los botones del pie (busca
   `tucorreo@ejemplo.com` y `57XXXXXXXXXX` en `index.html`).
2. Pon los enlaces reales de cada cliente (busca `href="#"`).
3. Borra la sección de guía: busca `<section id="assets">` y elimina
   hasta su `</section>`. También quita el enlace del menú si lo hubiera.
4. Revisa que ningún video pese más de 5 MB.

---

## Para verlo en tu computador

Abrir `index.html` con doble clic funciona. Si algún video no carga,
levanta un servidor local desde la carpeta:

```
python -m http.server 8000
```

y entra a `http://localhost:8000`.

## Para publicarlo

GitHub Pages o Vercel, gratis. Sube la carpeta completa (con `assets/`
dentro) y apunta tu dominio. Límite de GitHub: 100 MB por archivo y 1 GB
de repositorio — de sobra si respetas los 5 MB por video.
