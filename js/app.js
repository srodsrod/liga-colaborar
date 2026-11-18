/**
 * Lógica del prototipo (JavaScript simple, sin librerías ni compilación).
 * Flujo: Colaborar → Formulario → Confirmación.
 * Todo vive en memoria: no se envía nada a ningún servidor ni se guarda.
 */
(function () {
  "use strict";

  const CFG = window.LIGA_CONFIG;
  const $ = (sel) => document.querySelector(sel);

  // ---------- Utilidades ----------
  const formatearMonto = (n) => "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const minusculaInicial = (s) => s.charAt(0).toLowerCase() + s.slice(1);

  // Clases por color (paleta del sitio oficial)
  const COLORES = {
    green: {
      fondoImg: "bg-green-50 dark:bg-green-900/30",
      borde: "border-green-200 dark:border-green-700 hover:border-green-500",
      monto: "text-green-700 dark:text-green-400",
      boton: "bg-green-600 hover:bg-green-700 focus-visible:outline-green-600 text-white",
      chip: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    },
    blue: {
      fondoImg: "bg-blue-50 dark:bg-blue-900/30",
      borde: "border-blue-300 dark:border-blue-600 hover:border-blue-500",
      monto: "text-blue-700 dark:text-blue-400",
      boton: "bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600 text-white",
      chip: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    },
    zinc: {
      fondoImg: "bg-zinc-100 dark:bg-zinc-700/50",
      borde: "border-zinc-300 dark:border-zinc-600 hover:border-zinc-500",
      monto: "text-zinc-900 dark:text-white",
      boton: "bg-zinc-900 hover:bg-zinc-700 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white focus-visible:outline-zinc-900",
      chip: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
    },
  };
  const color = (nivel) => COLORES[nivel.color] || COLORES.blue;
  const buscarNivel = (id) => CFG.niveles.find((n) => n.id === id);
  const buscarEntrega = (id) => CFG.entregas.find((m) => m.id === id);

  // ---------- Estado ----------
  const estado = { datos: null, errores: {}, intentado: false };

  // ---------- Navegación entre vistas ----------
  function mostrarVista(nombre, anclaId) {
    ["colabora", "formulario", "confirmacion"].forEach((v) => {
      $("#vista-" + v).hidden = v !== nombre;
    });
    cerrarMenu();
    if (anclaId) {
      document.getElementById(anclaId).scrollIntoView({ behavior: "instant", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }

  // ---------- Sección de merchandising ----------
  function renderMerch() {
    $("#campania-titulo").textContent = CFG.campania.titulo;
    $("#campania-bajada").textContent = CFG.campania.bajada;

    $("#tarjetas-aporte").innerHTML = CFG.niveles
      .map((n) => {
        const c = color(n);
        return `
        <article class="relative flex flex-col bg-white dark:bg-zinc-800 border-2 ${c.borde} rounded-xl overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
          ${n.etiqueta ? `<span class="absolute top-3 right-3 z-10 text-xs font-semibold uppercase tracking-wide bg-blue-700 text-white rounded-full px-2.5 py-1">${esc(n.etiqueta)}</span>` : ""}
          <div class="${c.fondoImg} aspect-[4/3] flex items-center justify-center p-4">
            <img src="${esc(n.imagen)}" alt="Ilustración: ${esc(n.regalo.toLowerCase())}" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col flex-1 p-5 text-center">
            <h4 class="font-brand text-2xl text-gray-900 dark:text-white">${esc(n.nombre)}</h4>
            <p class="text-3xl lg:text-4xl font-bold mt-1 ${c.monto}">${formatearMonto(n.monto)}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">aporte único</p>
            <div class="flex flex-wrap justify-center gap-1.5 mt-4">
              ${n.productos.map((p) => `<span class="text-xs font-medium rounded-full px-2.5 py-1 ${c.chip}">${esc(p)}</span>`).join("")}
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-3 mb-5 flex-1">
              <strong class="text-gray-800 dark:text-gray-200">Incluye:</strong> ${esc(minusculaInicial(n.regalo))}. ${esc(n.descripcion)}
            </p>
            <button type="button" data-elegir="${esc(n.id)}" class="w-full rounded-lg py-3 px-4 font-medium cursor-pointer transition focus-visible:outline-2 focus-visible:outline-offset-2 ${c.boton}">
              Elegir este aporte
            </button>
          </div>
        </article>`;
      })
      .join("");

    $("#campania-pasos").innerHTML = CFG.campania.pasos
      .map(
        (p, i) => `
        <li class="flex gap-3">
          <span class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center" aria-hidden="true">${i + 1}</span>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">${esc(p.titulo)}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">${esc(p.texto)}</p>
          </div>
        </li>`
      )
      .join("");
  }

  // ---------- Indicador de pasos ----------
  function pasosHtml(actual) {
    const pasos = ["Elegí tu aporte", "Completá tus datos", "Confirmación"];
    return `<ol class="flex items-center gap-2 text-xs sm:text-sm mb-6" aria-label="Progreso">${pasos
      .map((p, i) => {
        const n = i + 1;
        const est = n < actual ? "hecho" : n === actual ? "actual" : "pendiente";
        return `
        <li class="flex items-center gap-2" ${est === "actual" ? 'aria-current="step"' : ""}>
          <span class="w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${est === "pendiente" ? "bg-gray-200 dark:bg-zinc-700 text-gray-500" : "bg-blue-700 text-white"}">${est === "hecho" ? "✓" : n}</span>
          <span class="${est === "actual" ? "font-semibold text-gray-900 dark:text-white" : "hidden sm:inline text-gray-500 dark:text-gray-400"}">${p}</span>
          ${n < pasos.length ? '<span class="w-6 sm:w-10 h-px bg-gray-300 dark:bg-zinc-600" aria-hidden="true"></span>' : ""}
        </li>`;
      })
      .join("")}</ol>`;
  }

  // ---------- Formulario ----------
  const INPUT = "w-full rounded-lg border bg-white dark:bg-zinc-900 px-3 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  function validar(d) {
    const e = {};
    if (d.nombre.trim().split(/\s+/).filter(Boolean).length < 2) e.nombre = "Ingresá tu nombre y apellido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = "Ingresá un correo electrónico válido.";
    if (d.telefono.replace(/\D/g, "").length < 8) e.telefono = "Ingresá un teléfono de al menos 8 dígitos.";
    if (!buscarNivel(d.nivel)) e.nivel = "Elegí un nivel de aporte.";
    const m = buscarEntrega(d.entrega);
    if (!m || !m.habilitada) e.entrega = "Elegí una modalidad de entrega disponible.";
    return e;
  }

  function abrirFormulario(nivelId) {
    const primeraEntrega = CFG.entregas.find((m) => m.habilitada);
    estado.datos = { nombre: "", email: "", telefono: "", nivel: nivelId, entrega: primeraEntrega ? primeraEntrega.id : "" };
    estado.errores = {};
    estado.intentado = false;
    renderFormulario();
    mostrarVista("formulario");
  }

  function campo(id, label, tipo, extra, ayuda) {
    const err = estado.errores[id];
    return `
      <div>
        <label for="${id}" class="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">${label} <span class="text-red-600" aria-hidden="true">*</span></label>
        <input id="${id}" name="${id}" type="${tipo}" ${extra} value="${esc(estado.datos[id])}"
          ${err ? `aria-invalid="true" aria-describedby="${id}-error"` : ""}
          class="${INPUT} ${err ? "border-red-500" : "border-gray-300 dark:border-zinc-600"}" />
        <p id="${id}-error" class="text-sm text-red-600 dark:text-red-400 mt-1 ${err ? "" : "hidden"}" role="alert">${err ? esc(err) : ""}</p>
        ${ayuda ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1 ${err ? "hidden" : ""}" data-ayuda="${id}">${ayuda}</p>` : ""}
      </div>`;
  }

  function renderFormulario() {
    const d = estado.datos;
    const er = estado.errores;

    $("#vista-formulario").innerHTML = `
    <section class="max-w-5xl mx-auto px-4 pt-8 pb-14 animar-entrada">
      <button type="button" data-volver="regalo-con-proposito" class="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mb-4 inline-flex items-center gap-1">← Volver a las opciones para colaborar</button>
      ${pasosHtml(2)}
      <h1 class="text-3xl lg:text-4xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight mb-2">Completá tu solicitud</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">Registrá tu aporte y tu regalo. Te contactaremos al cierre de la campaña para coordinar el aporte y la entrega.</p>

      <div class="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
        <form id="form-aporte" novalidate class="space-y-8">
          <fieldset class="space-y-4">
            <legend class="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Tus datos</legend>
            ${campo("nombre", "Nombre y apellido", "text", 'autocomplete="name" placeholder="Ej.: Ana Pérez"')}
            <div class="grid gap-4 sm:grid-cols-2">
              ${campo("email", "Correo electrónico", "email", 'autocomplete="email" placeholder="nombre@ejemplo.com"')}
              ${campo("telefono", "Teléfono de contacto", "tel", 'autocomplete="tel" inputmode="tel" placeholder="11 1234-5678"', "Con código de área. Ej.: 11 1234-5678")}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Nivel de aporte</legend>
            <div class="grid gap-3 sm:grid-cols-3">
              ${CFG.niveles
                .map((n) => {
                  const sel = d.nivel === n.id;
                  const c = color(n);
                  return `
                <label for="nivel-${n.id}" class="relative cursor-pointer rounded-xl border-2 p-3 transition flex sm:flex-col items-center gap-3 sm:gap-1 sm:text-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 ${sel ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30" : "border-gray-200 dark:border-zinc-600 hover:border-blue-300"}">
                  <input id="nivel-${n.id}" type="radio" name="nivel" value="${n.id}" ${sel ? "checked" : ""} class="sr-only" />
                  <span class="${c.fondoImg} rounded-lg w-16 h-12 sm:w-full sm:h-20 flex-shrink-0 flex items-center justify-center"><img src="${esc(n.imagen)}" alt="" class="h-full object-contain" /></span>
                  <span class="flex-1">
                    <span class="block font-medium text-gray-900 dark:text-white">${esc(n.nombre)}</span>
                    <span class="block font-bold ${c.monto}">${formatearMonto(n.monto)}</span>
                    <span class="block text-xs text-gray-500 dark:text-gray-400">${esc(n.regalo)}</span>
                  </span>
                  ${sel ? '<span class="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center" aria-hidden="true">✓</span>' : ""}
                </label>`;
                })
                .join("")}
            </div>
            ${er.nivel ? `<p class="text-sm text-red-600 dark:text-red-400 mt-2" role="alert">${esc(er.nivel)}</p>` : ""}
          </fieldset>

          <fieldset>
            <legend class="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Modalidad de entrega</legend>
            <div class="space-y-3">
              ${CFG.entregas
                .map((m) => {
                  const sel = d.entrega === m.id;
                  const cls = !m.habilitada
                    ? "cursor-not-allowed opacity-60 border-dashed border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900/40"
                    : sel
                    ? "cursor-pointer border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                    : "cursor-pointer border-gray-200 dark:border-zinc-600 hover:border-blue-300";
                  return `
                <label for="entrega-${m.id}" class="flex items-start gap-3 rounded-xl border-2 p-4 transition ${cls}">
                  <input id="entrega-${m.id}" type="radio" name="entrega" value="${m.id}" ${sel ? "checked" : ""} ${m.habilitada ? "" : "disabled"} class="mt-1 h-4 w-4 accent-blue-600" />
                  <span>
                    <span class="block font-medium text-gray-900 dark:text-white">${esc(m.nombre)}
                      ${m.habilitada ? "" : '<span class="ml-2 text-[11px] uppercase tracking-wide font-semibold bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded px-1.5 py-0.5 align-middle">No disponible</span>'}
                    </span>
                    <span class="block text-sm text-gray-600 dark:text-gray-400">${esc(m.detalle)}</span>
                  </span>
                </label>`;
                })
                .join("")}
            </div>
            ${er.entrega ? `<p class="text-sm text-red-600 dark:text-red-400 mt-2" role="alert">${esc(er.entrega)}</p>` : ""}
          </fieldset>

          <div class="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-900 dark:text-amber-200">
            <strong>Demostración académica:</strong> este formulario es simulado. No se procesan pagos, no se envían correos y los datos no se guardan en ningún lado. Podés usar datos ficticios.
          </div>

          <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button type="button" data-volver="regalo-con-proposito" class="rounded-lg py-3 px-5 font-medium border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition">Cancelar</button>
            <button type="submit" id="boton-enviar" class="rounded-lg py-3 px-6 font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-70 disabled:cursor-wait cursor-pointer transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Confirmar solicitud</button>
          </div>
        </form>

        <aside id="resumen" class="lg:sticky lg:top-32 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 p-5">${resumenHtml()}</aside>
      </div>
    </section>`;
  }

  function resumenHtml() {
    const d = estado.datos;
    const n = buscarNivel(d.nivel);
    if (!n) return `<h2 class="font-semibold text-gray-900 dark:text-white mb-3">Resumen</h2><p class="text-sm text-gray-600 dark:text-gray-400">Elegí un nivel de aporte para ver el resumen.</p>`;
    const m = buscarEntrega(d.entrega);
    const fila = (k, v) => `<div class="flex justify-between gap-3"><dt class="text-gray-600 dark:text-gray-400">${k}</dt><dd class="font-medium text-right">${esc(v)}</dd></div>`;
    return `
      <h2 class="font-semibold text-gray-900 dark:text-white mb-3">Resumen</h2>
      <div class="${color(n).fondoImg} rounded-lg aspect-[4/3] p-3 mb-3"><img src="${esc(n.imagen)}" alt="" class="w-full h-full object-contain" /></div>
      <dl class="text-sm space-y-2">
        ${fila("Aporte", n.nombre)}
        ${fila("Regalo", n.regalo)}
        ${fila("Entrega", m ? m.nombre : "—")}
        <div class="flex justify-between gap-3 pt-2 border-t border-blue-200 dark:border-blue-800">
          <dt class="font-semibold">Total del aporte</dt>
          <dd class="font-bold text-blue-700 dark:text-blue-400 text-lg">${formatearMonto(n.monto)}</dd>
        </div>
      </dl>`;
  }

  // Muestra/oculta el error de un campo de texto sin redibujar todo (para no perder el foco)
  function actualizarErrorCampo(id) {
    const input = document.getElementById(id);
    const p = document.getElementById(id + "-error");
    const ayuda = document.querySelector(`[data-ayuda="${id}"]`);
    const err = estado.errores[id];
    if (!input || !p) return;
    p.textContent = err || "";
    p.classList.toggle("hidden", !err);
    if (ayuda) ayuda.classList.toggle("hidden", !!err);
    input.classList.toggle("border-red-500", !!err);
    input.classList.toggle("border-gray-300", !err);
    input.classList.toggle("dark:border-zinc-600", !err);
    if (err) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", id + "-error");
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  }

  function enviarFormulario() {
    estado.intentado = true;
    estado.errores = validar(estado.datos);
    const claves = Object.keys(estado.errores);
    if (claves.length) {
      renderFormulario();
      const primero = claves[0] === "nivel" ? "nivel-" + CFG.niveles[0].id : claves[0];
      const el = document.getElementById(primero);
      if (el) {
        el.focus();
        el.scrollIntoView({ block: "center" });
      }
      return;
    }
    // Simulación: no se envía nada a ningún servidor ni se guarda.
    const boton = $("#boton-enviar");
    boton.disabled = true;
    boton.textContent = "Registrando solicitud…";
    setTimeout(() => {
      const codigo = "L7-" + Math.random().toString(36).slice(2, 7).toUpperCase();
      renderConfirmacion({ ...estado.datos, nombre: estado.datos.nombre.trim(), email: estado.datos.email.trim(), codigo });
      mostrarVista("confirmacion");
    }, 700);
  }

  // ---------- Confirmación ----------
  function renderConfirmacion(s) {
    const n = buscarNivel(s.nivel);
    const m = buscarEntrega(s.entrega);
    const c = color(n);
    const dato = (k, v, extra) => `<div><dt class="text-gray-500 dark:text-gray-400">${k}</dt><dd class="font-medium ${extra || ""}">${esc(v)}</dd></div>`;

    $("#vista-confirmacion").innerHTML = `
    <section class="max-w-3xl mx-auto px-4 pt-8 pb-14 animar-entrada">
      ${pasosHtml(3)}
      <div class="text-center mb-8">
        <div class="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-4">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-green-600" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h1 class="text-3xl lg:text-4xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight mb-2">¡Gracias, ${esc(s.nombre.split(" ")[0])}!</h1>
        <p class="text-gray-700 dark:text-gray-300 text-lg">Tu solicitud quedó registrada.</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Número de solicitud: <span class="font-mono font-semibold text-gray-800 dark:text-gray-200">${esc(s.codigo)}</span></p>
      </div>

      <div class="rounded-xl border-2 border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div class="grid sm:grid-cols-[220px_1fr]">
          <div class="${c.fondoImg} p-4 flex items-center justify-center">
            <img src="${esc(n.imagen)}" alt="Ilustración: ${esc(n.regalo.toLowerCase())}" class="w-full max-w-60 object-contain" />
          </div>
          <div class="p-5">
            <p class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Aporte elegido</p>
            <p class="font-brand text-2xl text-gray-900 dark:text-white">${esc(n.nombre)}</p>
            <p class="text-3xl font-bold ${c.monto}">${formatearMonto(n.monto)}</p>
            <p class="mt-3 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Tu regalo</p>
            <p class="font-medium text-gray-900 dark:text-white">${esc(n.regalo)}</p>
          </div>
        </div>
        <dl class="border-t border-gray-200 dark:border-zinc-700 p-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
          ${dato("Nombre y apellido", s.nombre, "break-words")}
          ${dato("Correo electrónico", s.email, "break-all")}
          ${dato("Teléfono", s.telefono)}
          ${dato("Modalidad de entrega", m ? m.nombre : "—")}
        </dl>
      </div>

      <div class="mt-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-5">
        <h2 class="font-semibold text-gray-900 dark:text-white mb-3">¿Qué sigue?</h2>
        <ol class="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
          <li>La campaña sigue abierta durante un período limitado.</li>
          <li>Al cerrar, la Liga te contactará para coordinar tu aporte y encargará la producción de los regalos según las solicitudes recibidas.</li>
          <li>Recibirás tu regalo en un encuentro presencial de la organización. La fecha y el lugar se confirmarán más adelante.</li>
        </ol>
      </div>

      <p class="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">Demostración académica: no se generó ningún cobro, no se envió ningún correo y estos datos no se guardaron.</p>

      <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button type="button" data-volver="" class="rounded-lg py-3 px-6 font-medium text-white bg-blue-700 hover:bg-blue-800 cursor-pointer transition">Volver a Colaborar</button>
        <button type="button" data-volver="regalo-con-proposito" class="rounded-lg py-3 px-6 font-medium border-2 border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition">Hacer otra solicitud</button>
      </div>
    </section>`;
    estado.datos = null; // los datos se descartan
  }

  // ---------- Modal de aviso ----------
  let ultimoFoco = null;
  function abrirAviso(destino) {
    ultimoFoco = document.activeElement;
    $("#aviso-destino").textContent = destino;
    const modal = $("#modal-aviso");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    $("#aviso-cerrar").focus();
  }
  function cerrarAviso() {
    const modal = $("#modal-aviso");
    if (modal.classList.contains("hidden")) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    if (ultimoFoco) ultimoFoco.focus();
  }

  // ---------- Menú móvil y tema ----------
  function cerrarMenu() {
    $("#menu").classList.add("hidden");
    $("#encabezado").classList.remove("h-auto", "pb-3");
    $("#boton-menu").setAttribute("aria-expanded", "false");
    $("#boton-menu").setAttribute("aria-label", "Abrir menú");
    $("#icono-menu").setAttribute("d", "M4 6h16M4 12h16M4 18h16");
  }
  function alternarMenu() {
    const abierto = $("#menu").classList.toggle("hidden") === false;
    $("#encabezado").classList.toggle("h-auto", abierto);
    $("#encabezado").classList.toggle("pb-3", abierto);
    $("#boton-menu").setAttribute("aria-expanded", String(abierto));
    $("#boton-menu").setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    $("#icono-menu").setAttribute("d", abierto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16");
  }
  function alternarTema() {
    const oscuro = document.documentElement.classList.toggle("dark");
    try {
      localStorage.theme = oscuro ? "dark" : "light";
    } catch (e) {}
  }

  // ---------- Eventos (delegados) ----------
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-elegir],[data-volver],[data-ir],[data-aviso],#boton-menu,#boton-tema,#aviso-cerrar,#modal-aviso");
    if (!t) return;
    if (t.matches("[data-elegir]")) return abrirFormulario(t.dataset.elegir);
    if (t.matches("[data-volver]")) return mostrarVista("colabora", t.dataset.volver || null);
    if (t.matches("[data-ir]")) {
      e.preventDefault();
      return mostrarVista("colabora");
    }
    if (t.matches("[data-aviso]")) {
      e.preventDefault();
      return abrirAviso(t.dataset.aviso);
    }
    if (t.id === "boton-menu") return alternarMenu();
    if (t.id === "boton-tema") return alternarTema();
    if (t.id === "aviso-cerrar") return cerrarAviso();
    if (t.id === "modal-aviso" && e.target === t) return cerrarAviso(); // clic en el fondo
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarAviso();
  });

  // Campos del formulario
  document.addEventListener("input", (e) => {
    if (!estado.datos || !e.target.closest("#form-aporte")) return;
    const { name, value } = e.target;
    if (!(name in estado.datos)) return;
    estado.datos[name] = value;
    if (estado.intentado) estado.errores = validar(estado.datos);
    if (name === "nivel" || name === "entrega") {
      // Radios: redibujar para marcar la selección y actualizar el resumen
      renderFormulario();
      const r = document.getElementById(name + "-" + value);
      if (r) r.focus({ preventScroll: true });
    } else {
      actualizarErrorCampo(name);
    }
  });

  document.addEventListener("submit", (e) => {
    if (e.target.id !== "form-aporte") return;
    e.preventDefault();
    enviarFormulario();
  });

  // ---------- Burbuja promocional (solo en la página de inicio) ----------
  function iniciarBurbuja() {
    const burbuja = $("#burbuja");
    const mini = $("#burbuja-mini");
    if (!burbuja || !mini) return;

    const minimo = Math.min(...CFG.niveles.map((n) => n.monto));
    $("#burbuja-monto").textContent = formatearMonto(minimo);

    const mostrar = (el, si) => {
      el.classList.toggle("hidden", !si);
      el.classList.toggle(el === mini ? "flex" : "block", si);
    };
    let cerrada = false;
    try {
      cerrada = sessionStorage.getItem("burbujaCerrada") === "1";
    } catch (e) {}

    if (cerrada) {
      mostrar(mini, true);
    } else {
      setTimeout(() => mostrar(burbuja, true), 1200); // aparece después de un momento
    }

    $("#burbuja-cerrar").addEventListener("click", () => {
      mostrar(burbuja, false);
      mostrar(mini, true);
      try {
        sessionStorage.setItem("burbujaCerrada", "1");
      } catch (e) {}
    });
    mini.addEventListener("click", () => {
      mostrar(mini, false);
      mostrar(burbuja, true);
      try {
        sessionStorage.removeItem("burbujaCerrada");
      } catch (e) {}
    });
  }

  // ---------- Inicio ----------
  if ($("#tarjetas-aporte")) renderMerch();
  iniciarBurbuja();
})();
