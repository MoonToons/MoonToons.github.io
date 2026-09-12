/* =============================================================
   PORTAFOLIO — Enrique Antonio Cepeda
   -------------------------------------------------------------
   MÓDULOS (en orden de aparición)
     1. Grano animado      → ajustes: SCALE, GRAIN_LUMA, GRAIN_ALPHA, GRAIN_FPS
     2. Cursor personalizado
     3. Menú móvil
     4. Shader WebGL del hero (diafragma)
     5. Inclinación 3D     → elementos con data-tilt
     6. Botones magnéticos
     7. Comparador antes/después
     8. Vista 360 arrastrable
     9. Reproducción al pasar el mouse
    10. Apariciones al hacer scroll y contadores
   ============================================================= */

/* ---------- grano animado (Dehancer-style): ruido nuevo cada cuadro ---------- */
(function(){
  const c = document.getElementById('grainCanvas');
  if(!c) return;
  const ctx = c.getContext('2d', {alpha:true});
  // se renderiza a baja resolución y se escala: así el grano tiene tamaño de
  // partícula real y no cuesta rendimiento
  // ---- AJUSTES DEL GRANO ----
  const SCALE       = 3;   // tamaño de partícula (2 = fino, 4 = grueso)
  const GRAIN_LUMA  = 150; // brillo del grano
  const GRAIN_ALPHA = 170; // densidad
  const GRAIN_FPS   = 14;  // el grano real no corre a 60fps
  let w, hgt, img, buf32;
  function resize(){
    w = Math.ceil(innerWidth/SCALE); hgt = Math.ceil(innerHeight/SCALE);
    c.width = w; c.height = hgt;
    c.style.width = innerWidth+'px'; c.style.height = innerHeight+'px';
    img = ctx.createImageData(w, hgt);
    buf32 = new Uint32Array(img.data.buffer);
  }
  addEventListener('resize', resize); resize();
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let last = 0;
  function render(ts){
    // 14 fps: el grano de película no corre a 60, se "pisa" entre cuadros
    if(ts - last > 1000/GRAIN_FPS){
      last = ts;
      for(let i=0; i<buf32.length; i++){
        // gaussiano aproximado: distribución orgánica, no random plano
        const g = (Math.random()+Math.random()+Math.random())/3;
        // luminancia baja porque el modo es screen (suma luz):
        // valores altos lavarían los negros
        const n = (g*GRAIN_LUMA)|0;
        // alfa variable = partículas de distinto peso, como el haluro de plata
        const a = (Math.random()*GRAIN_ALPHA)|0;
        buf32[i] = (a<<24) | (n<<16) | (n<<8) | n;
      }
      ctx.putImageData(img, 0, 0);
    }
    if(!reduce) requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();

/* ---------- custom cursor ---------- */
const cursor = document.getElementById('cursor');
let cx = innerWidth/2, cy = innerHeight/2, tx = cx, ty = cy;
addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
(function loop(){ cx += (tx-cx)*.18; cy += (ty-cy)*.18;
  cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  requestAnimationFrame(loop); })();
document.querySelectorAll('a,button,.work,.cap,.sp,.cw,.pano').forEach(el=>{
  el.addEventListener('mouseenter',()=>cursor.classList.add('big'));
  el.addEventListener('mouseleave',()=>cursor.classList.remove('big'));
});

/* ---------- mobile nav ---------- */
document.getElementById('navtoggle').addEventListener('click',()=>{
  document.getElementById('navlinks').classList.toggle('open');
});
document.querySelectorAll('#navlinks a').forEach(a=>{
  a.addEventListener('click',()=>document.getElementById('navlinks').classList.remove('open'));
});

/* ---------- WebGL aperture (hero) ---------- */
(function(){
  const canvas = document.getElementById('lensCanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if(!gl) return;
  const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;
  const fs = `
  precision highp float;
  uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
  // rotate helper
  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
  // signed distance to an n-sided polygon blade edge set (iris approximation)
  float iris(vec2 uv, float r, float blades, float rotAmt){
    float a = atan(uv.y, uv.x) + rotAmt;
    float seg = 6.28318/blades;
    float d = cos(floor(.5 + a/seg)*seg - a) * length(uv);
    return d - r;
  }
  void main(){
    vec2 uv = (gl_FragCoord.xy - .5*u_res)/min(u_res.x,u_res.y);
    vec2 m = (u_mouse - .5*u_res)/min(u_res.x,u_res.y);
    // parallax toward mouse
    uv += m*0.06;
    float t = u_time*0.22;
    vec3 col = vec3(0.0);
    // concentric iris rings -> lens barrel feel
    for(int i=0;i<5;i++){
      float fi = float(i);
      float r = 0.20 + fi*0.085;
      float d = iris(uv*rot(t*(0.25+fi*0.08) + fi*0.5), r, 8.0, 0.0);
      float ring = smoothstep(0.012, 0.0, abs(d));
      // 500T halation: warm orange core bleeding outward
      vec3 warm = vec3(0.87,0.29,0.14)*(1.0-fi*0.13);
      col += ring*warm*0.75;
      // soft bloom around each ring
      col += exp(-abs(d)*26.0)*warm*0.10;
    }
    // faint cool counter-glow (grain/teal shadow bias of the stock)
    float centre = length(uv);
    col += vec3(0.42,0.48,0.47)*exp(-centre*4.2)*0.10;
    // mouse-follow specular highlight
    float sp = exp(-length(uv-m*0.9)*7.0);
    col += vec3(0.95,0.55,0.32)*sp*0.14;
    // vignette + gamma
    col *= smoothstep(1.25, 0.15, centre);
    col = pow(col, vec3(0.86));
    gl_FragColor = vec4(col, 1.0);
  }`;
  function sh(type, src){ const s = gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s; }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog,'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const uRes = gl.getUniformLocation(prog,'u_res'),
        uTime = gl.getUniformLocation(prog,'u_time'),
        uMouse = gl.getUniformLocation(prog,'u_mouse');
  let mx = 0, my = 0, dpr = Math.min(devicePixelRatio||1, 2);
  function resize(){
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width*dpr; canvas.height = r.height*dpr;
    gl.viewport(0,0,canvas.width,canvas.height);
    mx = canvas.width/2; my = canvas.height/2;
  }
  addEventListener('resize', resize); resize();
  canvas.parentElement.addEventListener('mousemove', e=>{
    const r = canvas.getBoundingClientRect();
    mx = (e.clientX-r.left)*dpr; my = (r.height-(e.clientY-r.top))*dpr;
  });
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const t0 = performance.now();
  (function draw(){
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, reduce ? 0 : (performance.now()-t0)/1000);
    gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES,0,3);
    requestAnimationFrame(draw);
  })();
})();

/* ---------- 3D tilt ---------- */
function tilt(el, deg){
  el.addEventListener('pointermove', e=>{
    const r = el.getBoundingClientRect();
    const px = (e.clientX-r.left)/r.width - .5, py = (e.clientY-r.top)/r.height - .5;
    el.style.transform = `perspective(800px) rotateX(${(-py*deg).toFixed(2)}deg) rotateY(${(px*deg).toFixed(2)}deg) translateZ(6px)`;
  });
  el.addEventListener('pointerleave', ()=>{ el.style.transform='perspective(800px) rotateX(0) rotateY(0)'; });
}
document.querySelectorAll('[data-tilt]').forEach(el=>tilt(el,5));
const hp = document.getElementById('heroPhoto'); if(hp) tilt(hp,4);

/* ---------- magnetic buttons ---------- */
document.querySelectorAll('.btn').forEach(b=>{
  b.addEventListener('pointermove', e=>{
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${((e.clientX-r.left)/r.width-.5)*8}px, ${((e.clientY-r.top)/r.height-.5)*6}px)`;
  });
  b.addEventListener('pointerleave', ()=>b.style.transform='');
});

/* ---------- before/after ---------- */
const range=document.getElementById('cwRange'), before=document.getElementById('cwBefore'), handle=document.getElementById('cwHandle');
range.addEventListener('input', e=>{
  const v=e.target.value;
  before.style.clipPath=`inset(0 ${100-v}% 0 0)`;
  handle.style.left=v+'%';
});

/* ---------- 360 pano ---------- */
const pano=document.getElementById('pano'), track=document.getElementById('panoTrack'), hud=document.getElementById('panoHud');
let dragging=false, startX=0, startOff=0, off=0;
function setOff(x){
  const max = track.offsetWidth - pano.offsetWidth;
  off = Math.min(0, Math.max(-max, x));
  track.style.transform=`translateX(${off}px)`;
  hud.textContent = `ARRASTRA — ${Math.round(Math.abs(off)/max*360)}°`;
}
pano.addEventListener('pointerdown', e=>{dragging=true;pano.classList.add('dragging');startX=e.clientX;startOff=off;pano.setPointerCapture(e.pointerId);});
pano.addEventListener('pointermove', e=>{ if(dragging) setOff(startOff + (e.clientX-startX)); });
['pointerup','pointerleave','pointercancel'].forEach(ev=>pano.addEventListener(ev,()=>{dragging=false;pano.classList.remove('dragging');}));

/* ---------- hover play services ---------- */
document.querySelectorAll('.svc').forEach(c=>{
  const v=c.querySelector('video');
  c.addEventListener('mouseenter',()=>{v.play().catch(()=>{});});
  c.addEventListener('mouseleave',()=>{v.pause();v.currentTime=0;});
});

/* ---------- hover play verticals ---------- */
document.querySelectorAll('.rv video').forEach(v=>{
  const p=v.parentElement;
  p.addEventListener('mouseenter',()=>v.play().catch(()=>{}));
  p.addEventListener('mouseleave',()=>{v.pause();v.currentTime=0;});
});

/* ---------- scroll reveal + counters ---------- */
const io = new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} }),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const cio = new IntersectionObserver(es=>es.forEach(en=>{
  if(!en.isIntersecting) return;
  const el = en.target, target = parseFloat(el.dataset.count), dec = target % 1 !== 0;
  let s = null;
  function step(ts){
    if(!s) s = ts;
    const p = Math.min((ts-s)/1100, 1);
    const val = target * (1 - Math.pow(1-p, 3));
    el.textContent = dec ? val.toFixed(1) : Math.round(val);
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  cio.unobserve(el);
}),{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));


/* =============================================================
   AÑADIDO v5
     11. Video al pasar el mouse (tarjetas e imágenes)
     12. Modal de caso
   ============================================================= */

/* ---------- video en hover ---------- */
document.querySelectorAll('.work, .slot').forEach(el=>{
  const v = el.querySelector('.work-vid, .slot-vid');
  if(!v) return;
  el.addEventListener('mouseenter', ()=>{ v.play().catch(()=>{}); });
  el.addEventListener('mouseleave', ()=>{ v.pause(); v.currentTime = 0; });
});

/* ---------- modal de caso ----------
   Los datos se leen de la propia tarjeta, así que al editar el HTML
   el modal se actualiza solo: no hay que tocar este archivo.
   Si un caso tiene video largo aparte, añádelo en CASOS_VIDEO abajo. */
const CASOS_VIDEO = {
  // 'eleden': 'assets/caso-eleden-completo.mp4',
  // o un embed de YouTube:  'eleden': 'https://www.youtube.com/embed/XXXXXXX'
};

(function(){
  const modal = document.getElementById('modal');
  if(!modal) return;
  const vid   = document.getElementById('mVid');
  const elTag = document.getElementById('mTag');
  const elTit = document.getElementById('mTitulo');
  const elDes = document.getElementById('mDesc');
  const elMet = document.getElementById('mMetric');

  function abrir(card){
    const k = card.dataset.caso;
    elTag.textContent = card.querySelector('.tag')?.textContent || '';
    elTit.textContent = card.querySelector('h3')?.textContent || '';
    elDes.textContent = card.querySelector('p')?.textContent || '';
    elMet.textContent = card.querySelector('.metric')?.textContent || '';

    const fuente = CASOS_VIDEO[k] || `assets/work-${k}.mp4`;
    const poster = `assets/work-${k}.jpg`;
    vid.src = fuente;
    vid.poster = poster;
    vid.load();

    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-abierto');
  }

  function cerrar(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-abierto');
    vid.pause(); vid.removeAttribute('src'); vid.load();
  }

  document.querySelectorAll('.work[data-caso]').forEach(card=>{
    card.addEventListener('click', e=>{ e.preventDefault(); abrir(card); });
  });
  modal.querySelectorAll('[data-cerrar]').forEach(b=>b.addEventListener('click', cerrar));
  addEventListener('keydown', e=>{ if(e.key==='Escape' && modal.classList.contains('open')) cerrar(); });
})();


/* =============================================================
   AÑADIDO v6
     13. Carrusel que se rellena solo (sin huecos en pantallas anchas)
     14. Selectores con video (proceso, drone)
     15. Nodos de color
   ============================================================= */

/* ---------- 13. carrusel sin huecos ----------
   El bug: la animación va de 0 a -50%, así que la pista tiene que medir
   como mínimo el doble del viewport. En monitores anchos no alcanzaba y
   se veía el vacío. Ahora se clona el contenido hasta que sobre. */
document.querySelectorAll('.svc-rail').forEach(rail=>{
  const track = rail.querySelector('.svc-track');
  if(!track) return;
  const originales = Array.from(track.children);
  if(!originales.length) return;

  function rellenar(){
    // dejar solo el juego original
    track.innerHTML = '';
    originales.forEach(el=>track.appendChild(el));
    const anchoJuego = track.scrollWidth;
    if(!anchoJuego) return;

    // cuántas copias para que media pista ya cubra la pantalla
    const necesarias = Math.max(2, Math.ceil((innerWidth * 1.25) / anchoJuego));
    for(let i=1;i<necesarias;i++){
      originales.forEach(el=>track.appendChild(el.cloneNode(true)));
    }
    // duplicar el total: la animación -50% recorre exactamente una mitad
    const mitad = Array.from(track.children);
    mitad.forEach(el=>track.appendChild(el.cloneNode(true)));

    // velocidad constante sin importar cuántas copias haya
    const px = track.scrollWidth / 2;
    track.style.setProperty('--rail-dur', (px / 42) + 's');

    // reenganchar el hover de reproducción en los clones
    track.querySelectorAll('.svc').forEach(c=>{
      const v = c.querySelector('video');
      if(!v || v.dataset.listo) return;
      v.dataset.listo = '1';
      c.addEventListener('mouseenter', ()=>v.play().catch(()=>{}));
      c.addEventListener('mouseleave', ()=>{v.pause(); v.currentTime=0;});
    });
  }

  rellenar();
  let t; addEventListener('resize', ()=>{ clearTimeout(t); t=setTimeout(rellenar,250); });
});

/* ---------- 14. selectores con video ----------
   Sin selección va recorriendo solo. Al elegir uno se queda ahí. */
document.querySelectorAll('[data-selector]').forEach(sel=>{
  const botones = Array.from(sel.querySelectorAll('.sel-btn'));
  const stage   = sel.querySelector('[data-stage]');
  const hud     = sel.querySelector('[data-hudout]');
  const aviso   = sel.querySelector('[data-autoout]');
  if(!botones.length || !stage) return;

  let i = 0, auto = sel.dataset.auto === '1', timer = null;

  function poner(n, porClic){
    i = (n + botones.length) % botones.length;
    const b = botones[i];
    botones.forEach(x=>x.classList.toggle('on', x===b));
    stage.poster = b.dataset.poster || '';
    stage.src    = b.dataset.vid;
    stage.load();
    stage.play().catch(()=>{});
    if(hud) hud.textContent = b.dataset.hud || '';
    if(porClic){
      auto = false;
      clearInterval(timer);
      if(aviso) aviso.textContent = 'SELECCIONADO';
    }
  }

  botones.forEach((b,n)=>b.addEventListener('click', ()=>poner(n, true)));

  // arranca cuando entra en pantalla, para no cargar video de más
  const io = new IntersectionObserver(es=>es.forEach(en=>{
    if(!en.isIntersecting) return;
    poner(0, false);
    if(auto) timer = setInterval(()=>{ if(auto) poner(i+1, false); }, 4200);
    io.disconnect();
  }),{threshold:.25});
  io.observe(sel);
});

/* ---------- 15. nodos de color ---------- */
(function(){
  const img = document.getElementById('nodoImg');
  if(!img) return;
  const nodos = document.querySelectorAll('.nodo');
  nodos.forEach(n=>n.addEventListener('click', ()=>{
    nodos.forEach(x=>x.classList.toggle('on', x===n));
    // fundido corto al cambiar de etapa
    img.style.opacity = '0';
    setTimeout(()=>{ img.src = n.dataset.nodo; img.style.opacity = '1'; }, 140);
  }));
  img.style.transition = 'opacity .28s ease';
})();

/* ---------- El Edén / FOOH: reproducir al pasar el mouse ---------- */
document.querySelectorAll('.fooh').forEach(f=>{
  const v = f.querySelector('video');
  if(!v) return;
  f.addEventListener('mouseenter', ()=>v.play().catch(()=>{}));
  f.addEventListener('mouseleave', ()=>{v.pause(); v.currentTime=0;});
});


/* =============================================================
   AÑADIDO v7
     16. Video de fondo del hero (opcional, con parallax 3D)
     17. Hover en selectores y nodos (sin obligar a hacer clic)
   ============================================================= */

/* ---------- 16. video de fondo del hero ----------
   Solo se activa si existe assets/hero-bg.mp4. Si no está, el hero
   queda exactamente como antes: no hay que tocar nada.
   Pon ahí un video que combine (movimiento lento, sin texto) y
   aparece al 30% detrás del diafragma, moviéndose con el mouse. */
(function(){
  const v = document.getElementById('heroBg');
  const hero = document.querySelector('.hero');
  if(!v || !hero) return;

  v.src = 'assets/hero-bg.mp4';

  // si no existe el archivo, se queda invisible y no molesta
  v.addEventListener('error', ()=>{ v.remove(); }, {once:true});
  v.addEventListener('loadeddata', ()=>{
    v.classList.add('listo');
    v.play().catch(()=>{});
  }, {once:true});
  v.load();

  // parallax 3D: acompaña al diafragma en vez de competir con él
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(reduce) return;
  let tx=0,ty=0,cx=0,cy=0;
  hero.addEventListener('pointermove', e=>{
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX-r.left)/r.width - .5);
    ty = ((e.clientY-r.top)/r.height - .5);
  });
  hero.addEventListener('pointerleave', ()=>{ tx=0; ty=0; });
  (function bucle(){
    cx += (tx-cx)*.06; cy += (ty-cy)*.06;
    v.style.transform =
      `perspective(1200px) rotateY(${(cx*5).toFixed(2)}deg) rotateX(${(-cy*4).toFixed(2)}deg) `+
      `scale(1.12) translate3d(${(-cx*26).toFixed(1)}px, ${(-cy*20).toFixed(1)}px, 0)`;
    requestAnimationFrame(bucle);
  })();
})();

/* ---------- 17. hover en selectores y nodos ----------
   Antes había que hacer clic. Ahora basta pasar el mouse; el clic
   sigue sirviendo para fijar la selección. */
document.querySelectorAll('[data-selector]').forEach(sel=>{
  sel.querySelectorAll('.sel-btn').forEach(b=>{
    b.addEventListener('mouseenter', ()=>{
      if(!b.classList.contains('on')) b.click();
    });
  });
});
document.querySelectorAll('.nodo').forEach(n=>{
  n.addEventListener('mouseenter', ()=>{
    if(!n.classList.contains('on')) n.click();
  });
});


/* =============================================================
   AÑADIDO v8
     18. Panel retraído mientras corre el video
     19. Destino real de cada tarjeta
   ============================================================= */

/* ---------- 18. el panel se retrae al reproducir ---------- */
document.querySelectorAll('.work').forEach(card=>{
  const v = card.querySelector('.work-vid');
  if(!v) return;
  // se marca cuando el video ya está dando imagen, no en el mouseenter:
  // así el texto no desaparece antes de que haya algo que mostrar
  v.addEventListener('playing', ()=>card.classList.add('reproduciendo'));
  card.addEventListener('mouseleave', ()=>card.classList.remove('reproduciendo'));
});

/* ---------- 19. destino de cada tarjeta ----------
   data-ir="#seccion"  → baja a esa sección del sitio
   data-url="https://" → abre un enlace externo
   si no tiene ninguno → abre el modal del caso
   El texto del botón se toma de data-cta. */
document.querySelectorAll('.work[data-cta]').forEach(card=>{
  const go = card.querySelector('.go');
  if(go) go.textContent = card.dataset.cta;
});

document.querySelectorAll('.work[data-ir], .work[data-url]').forEach(card=>{
  card.addEventListener('click', e=>{
    e.preventDefault();
    e.stopImmediatePropagation();   // gana al modal
    const url = card.dataset.url;
    if(url){ window.open(url,'_blank','noopener'); return; }
    const destino = document.querySelector(card.dataset.ir);
    if(destino) destino.scrollIntoView({behavior:'smooth', block:'start'});
  }, true);
});
