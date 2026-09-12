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
