# EMPIEZA AQUÍ

## 1. Ver el sitio en vivo mientras editas

**La forma fácil (Live Server):**

1. Abre VS Code → `Archivo` → `Abrir carpeta` → elige `portafolio-web`.
2. Abajo a la derecha te va a aparecer un aviso sugiriendo extensiones
   recomendadas. Dale **Instalar**. Si no aparece: ve al ícono de
   extensiones (los cuadritos en la barra izquierda), busca
   `Live Server` de Ritwick Dey e instálalo.
3. Clic derecho sobre `index.html` → **Open with Live Server**.
4. Se abre el navegador en `http://127.0.0.1:5500`.

Desde ahí, **cada vez que guardes (Ctrl+S) el navegador se recarga
solo**. Editas el CSS, guardas, y ves el cambio al instante.

**Truco:** pon VS Code en la mitad izquierda de la pantalla y el
navegador en la derecha (tecla Windows + flecha). Así ves el cambio sin
alternar ventanas.

**Si no quieres instalar nada**, desde la terminal en esta carpeta:

```
python -m http.server 8000
```

y entra a `http://localhost:8000`. Aquí sí tienes que recargar a mano
con F5.

---

## 2. Reemplazar tus fotos y videos

Es solo esto:

1. Abre la carpeta `assets/`.
2. Mira el nombre del archivo que quieres cambiar (por ejemplo
   `work-eleden.jpg`).
3. Renombra tu archivo con **ese mismo nombre exacto**.
4. Arrástralo a `assets/` y acepta reemplazar.
5. Guarda en VS Code o recarga el navegador. Ya está.

No tocas código. El nombre tiene que coincidir letra por letra,
incluyendo la extensión: `work-eleden.jpg`, no `Work-Eleden.JPG`.

**Los nombres completos con sus medidas están en `LEEME.md`**, o
simplemente abre la carpeta `assets/` y mira: los archivos de referencia
dicen "REEMPLAZAR" encima.

---

## 3. Saber qué te falta

En la terminal, dentro de esta carpeta:

```
python revisar.py
```

Te lista:
- qué archivos siguen siendo referencias mías
- cuáles faltan del todo
- cuáles pesan más de 5 MB y van a cargar lento
- qué falta en el código (tu correo, tu WhatsApp, enlaces vacíos)

Córrelo cada tanto mientras avanzas, y otra vez antes de publicar.

---

## 4. Preparar un video antes de meterlo

Los videos tienen que ser **MP4 / H.264** y pesar **menos de 5 MB**.
Con ffmpeg:

```
ffmpeg -i tu-video.mov -c:v libx264 -crf 26 -preset slow -vf "scale=1080:-2" -an svc-vsl.mp4
```

- Sube `-crf` a 30 si pesa mucho, bájalo a 22 si se ve blando.
- El `-an` quita el audio (obligatorio en los que van en loop).
- Cambia `1080:-2` por `1920:-2` para los horizontales.

Y saca su miniatura:

```
ffmpeg -i svc-vsl.mp4 -vframes 1 svc-vsl.jpg
```

---

## 5. Dónde está cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Cualquier texto | `index.html` |
| Colores, tamaños, efectos | `css/styles.css` |
| Animaciones e interacción | `js/main.js` |
| Fotos y videos | `assets/` |

Tanto `styles.css` como `main.js` tienen un índice comentado al inicio
que te dice en qué línea está cada sección.

---

## 6. Antes de publicar

Corre `python revisar.py` y resuelve lo que marque. En particular:

- Tu correo real (busca `tucorreo@ejemplo.com` en `index.html`)
- Tu WhatsApp real (busca `57XXXXXXXXXX`)
- Los enlaces de cada cliente (busca `href="#"`)
- Borra la sección de guía: busca `<section id="assets">` y elimina
  hasta su `</section>`

---

# NUEVO en esta versión

## Nombres de pósters unificados (esto era el bug)

Antes había tres convenciones distintas y por eso algunas fotos no
enlazaban. Ahora la regla es una sola:

**Todo video `X.mp4` tiene su miniatura en `X-poster.jpg`.**

Ejemplos: `svc-vsl.mp4` → `svc-vsl-poster.jpg`,
`cine-final.mp4` → `cine-final-poster.jpg`.

Para sacar la miniatura de cualquier video:

```
ffmpeg -i svc-vsl.mp4 -vframes 1 svc-vsl-poster.jpg
```

## Video al pasar el mouse sobre cualquier imagen

Cada tarjeta de trabajo y cada foto del making of tiene ahora su video.
Al pasar el mouse la foto se desvanece y arranca el video.

Por cada `work-X.jpg` hay un `work-X.mp4`. Reemplaza los dos: la foto es
lo que se ve quieto, el video lo que se ve al pasar por encima.

## Clic en una tarjeta abre el caso

Antes el clic no hacía nada. Ahora abre una ventana con el video en
grande, el texto del caso y un botón de contacto.

El modal lee los datos de la propia tarjeta, así que si editas el título
o la descripción en `index.html`, el modal se actualiza solo.

Si quieres que un caso abra un video más largo o uno de YouTube, abre
`js/main.js`, busca `CASOS_VIDEO` y agrégalo:

```js
const CASOS_VIDEO = {
  'eleden': 'https://www.youtube.com/embed/TU_ID_AQUI',
};
```

## Diez tarjetas de portafolio

Se agregaron cuatro: FOOH 2, Aéreo con drone, Video musical y
Corporativo. Para agregar más, copia un bloque `<button class="work sm"
...>` completo en `index.html` y cambia el `data-caso` por un nombre
nuevo; luego pon `work-<nombre>.jpg` y `work-<nombre>.mp4` en `assets/`.

## Fotos de perfil de clientes

Las tarjetas de clientes ya no muestran una letra: muestran foto.
Reemplaza `ig-silvia.jpg`, `ig-maria.jpg`, `ig-nova.jpg`,
`ig-novaagencia.jpg`, `ig-javi.jpg` e `ig-eleden.jpg` (cuadradas,
240×240; se recortan en círculo solas).

## Subir videos a YouTube

GitHub Pages no sirve bien video grande (100 MB por archivo, 1 GB por
repo, sin CDN). Para el reel largo y la película usa YouTube:

```
pip install google-auth-oauthlib google-api-python-client
python subir-youtube.py assets/cine-final.mp4
```

Los sube como **no listados**: no salen en búsquedas ni en tu canal,
pero funcionan incrustados. Al terminar te deja `embeds.txt` con el
código HTML para pegar. Las instrucciones completas de configuración
están comentadas al inicio de `subir-youtube.py`.

Regla práctica: los clips cortos (hover, servicios) van locales porque
tienen que arrancar al instante; el reel largo y la película van a
YouTube.

---

# NUEVO en v6

## Bugs corregidos

**Carrusel de servicios con huecos.** La animación va de 0 a −50%, así
que la pista necesita medir el doble del ancho de pantalla. En tu
monitor ancho no alcanzaba. Ahora el JS clona las tarjetas hasta que
sobra, y ajusta la velocidad para que se sienta igual en cualquier
pantalla.

**Texto borroso sobre las tarjetas.** El panel del título tenía
`backdrop-filter`, que desenfocaba el video de atrás. Se quitó; el
contraste ahora lo da el degradado más la sombra de texto.

**`caso-extra.mp4` era una copia de `caso-ads.mp4`.** Ya son videos
distintos.

## Secciones nuevas

**Proceso con video (`#proceso`).** Cada paso es un botón: al elegirlo
cambia el video. Si no eliges nada, va recorriendo los seis solo. Pon
tus videos en `proceso-modelado.mp4`, `proceso-animacion.mp4`,
`proceso-tracking.mp4`, `proceso-grabacion.mp4`,
`proceso-integracion.mp4` y `proceso-final.mp4`.

**Nodos de color (`#nodos`).** Tres nodos encadenados como en DaVinci:
LOG → CÁMARA → FINAL. Al hacer clic cambia la imagen con un fundido
corto. Reemplaza `nodo-log.jpg`, `nodo-camara.jpg` y `nodo-final.jpg`
por **el mismo fotograma** en las tres etapas — si son planos distintos
se pierde el efecto.

**El Edén como caso insignia (`#eleden`).** Panel propio con cuatro
piezas de FOOH, las cifras de la campaña y espacio para los recortes de
prensa. Reemplaza `eleden-1.mp4` a `eleden-4.mp4` y `prensa-1.jpg` a
`prensa-3.jpg`, y pon el enlace real de cada nota en su `href`.

**Drone (`#drone`).** Mismo selector que el proceso: aéreo
cinematográfico, FPV y plano de revelado. Archivos `drone-1.mp4` a
`drone-3.mp4`.

**Logros en vistas (`#logros`).** Cuatro cifras. La de El Edén ya está;
las otras tres dicen REEMPLAZAR — pásame tus números de Instagram.

**Logos oficiales de marca.** La sección de equipo ahora usa imágenes en
vez de texto. Los archivos `logo-*.png` son ranuras: descarga el logo
oficial de cada marca desde su sala de prensa y reemplázalos. En reposo
van en gris y al pasar el mouse toman color.

**Credenciales en el hero.** Tres píldoras pequeñas. La de las tres
carreras dice REEMPLAZAR: pásame los nombres exactos.

---

# NUEVO en v7

## Bug corregido: la foto que no cargaba su video

La tercera tarjeta del reel decía `caso-extra.mp4` en el pie pero
apuntaba a `caso-ads.mp4`. Por eso veías el mismo video dos veces. Ya
está apuntando bien.

También se desactivó la barra flotante de controles que salía sobre los
videos (`disablepictureinpicture` + `controlslist`).

## Todo responde al pasar el mouse

Ya no hay que hacer clic: los pasos del proceso, las tomas de drone y
los nodos de color cambian al pasar el mouse por encima. El clic sigue
sirviendo para fijar la selección y detener el recorrido automático.

## Logos de marca con enlace al producto

Cada logo ahora es un enlace a la página oficial del producto. Los
archivos `logo-*.png` siguen siendo ranuras: descarga el logo oficial de
la sala de prensa de cada marca y reemplázalos manteniendo el nombre.
Van en gris y toman color al pasar el mouse, con una flecha ↗ que indica
que son clicables.

## Video de fondo en el hero (opcional)

Pon un archivo llamado **`assets/hero-bg.mp4`** y aparece detrás del
diafragma 3D al 30% de opacidad, desvaneciéndose hacia los bordes y
moviéndose con parallax 3D según el mouse.

**Si no pones ese archivo, el hero queda exactamente como está ahora.**
El JS detecta que no existe y lo quita sin dejar hueco.

Qué funciona bien ahí: movimiento lento y continuo, sin texto ni cortes
rápidos, y tonos cálidos que combinen con el 500T. Una toma de drone
lenta o una de tu mesa de trabajo funcionan. Un reel con cortes cada
medio segundo pelea con el diafragma y se ve sucio.

```
ffmpeg -i tu-toma.mov -c:v libx264 -crf 30 -vf "scale=1600:-2" -an -t 20 assets/hero-bg.mp4
```

## Las carreras: fuera del hero

Quedaron en la sección de plugins, dentro de un panel que explica *por
qué* importan en lugar de solo listarlas.

---

# NUEVO en v8

## El panel se retrae cuando arranca el video

Antes el bloque de texto tapaba la mitad del video. Ahora, en cuanto el
video empieza a dar imagen, el panel se retrae con curvas de velocidad:

- La **descripción** y la **cifra** salen con `cubic-bezier(.7,0,.84,0)`
  — arrancan lento y se van rápido, escalonadas 50ms una de otra.
- El **título** se encoge y se acomoda con `cubic-bezier(.16,1,.3,1)`,
  que llega frenando y se siente con peso, no elástico.
- El **degradado de fondo** se reduce a una base delgada.

Queda solo lo esencial: etiqueta, título y el botón. El video se ve
completo.

El disparador es el evento `playing` del video, no el `mouseenter`: así
el texto no desaparece antes de que haya imagen que mostrar.

Para ajustar la velocidad, busca `v8` en `css/styles.css`.

## Cada tarjeta ya apunta a algo concreto

Antes todas abrían el mismo modal genérico. Ahora:

| Tarjeta | A dónde va | Texto del botón |
|---|---|---|
| Jurassic El Edén | baja a la sección `#eleden` | VER CAMPAÑA COMPLETA |
| FOOH 2 | baja a `#eleden` | VER FOOH |
| Aéreo con drone | baja a `#drone` | VER TOMAS AÉREAS |
| The Glow | abre el Instagram del cliente | VER PERFIL |
| Las demás | abren el modal del caso | VER CASO |

Para cambiar el destino de cualquiera, en `index.html` edita su
`<button class="work ...">`:

```html
data-ir="#drone"                        → baja a esa sección
data-url="https://instagram.com/xxx"    → abre un enlace externo
data-cta="VER LO QUE QUIERAS →"         → texto del botón
```

Si no pones `data-ir` ni `data-url`, la tarjeta abre el modal.
