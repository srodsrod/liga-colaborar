# Liga Asperger 7 · «¡Colabora!» con merchandising solidario

Prototipo académico (ITBA · Comercio Electrónico). Reproduce la sección
[¡Colabora!](https://ligaasperger7.org.ar/colabora/) del sitio oficial y agrega la
sección **«Colaborá y llevate un regalo con propósito»**.

> No es el sitio oficial ni una campaña activa. No procesa pagos, no conecta
> MercadoPago, no envía correos y no guarda datos (todo vive en memoria del navegador).

## Cómo abrirlo

Es un sitio estático (HTML + CSS + JavaScript), **no necesita instalar nada**.

- **En la compu:** doble clic en `index.html`.
- **En GitHub Pages:** subir esta carpeta a un repositorio y activar
  *Settings → Pages → Deploy from a branch → main / (root)*.

Solo necesita internet para la tipografía «Roboto Condensed» (sin conexión usa una fuente similar).

## Estructura

```
index.html        Página: encabezado, sección actual de Colaborar, nueva sección y pie
css/estilos.css   Estilos (Tailwind ya compilado, no se edita a mano)
js/config.js      ← DATOS EDITABLES: montos, aportes, regalos, imágenes, textos
js/app.js         Lógica: tarjetas, formulario, validación y confirmación simulada
img/              Logo e íconos oficiales + ilustraciones de productos
```

## Dónde cambiar cosas

| Qué | Dónde |
| --- | --- |
| Montos, nombres de aportes, regalos, descripciones, etiqueta "Recomendado" | `js/config.js` → `niveles` |
| Textos de la campaña y pasos de "¿Cómo funciona?" | `js/config.js` → `campania` |
| Modalidades de entrega (y cuál está deshabilitada) | `js/config.js` → `entregas` |
| Imágenes de los productos | `img/productos/` (y la ruta `imagen` en `js/config.js`) |

Después de editar, guardar y recargar la página (F5).

**Nota sobre estilos:** `css/estilos.css` incluye solo las clases de Tailwind que usa hoy la página.
Cambiar datos en `js/config.js` no requiere tocar el CSS. Si se agregan clases de Tailwind
nuevas en el HTML/JS, puede que no tengan estilo; en ese caso conviene usar CSS común.

El logo (`img/logo.svg`) y los íconos del pie son los del sitio oficial.
Las ilustraciones de productos son diseños neutros hechos para la demo.
