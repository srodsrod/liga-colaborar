/**
 * ============================================================
 *  CONFIGURACIÓN EDITABLE DEL PROTOTIPO
 * ============================================================
 *  Todo lo que probablemente quieran cambiar está acá:
 *  montos, nombres de los aportes, regalos, imágenes,
 *  textos de la campaña y modalidades de entrega.
 *
 *  - Las imágenes viven en la carpeta img/productos/.
 *    Para reemplazar una, guarden el archivo nuevo ahí
 *    y actualicen la ruta en `imagen`.
 *  - Los montos son números (sin puntos); el formato
 *    $30.000 se aplica automáticamente.
 *  - color: "green" | "blue" | "zinc" (paleta del sitio).
 *  - etiqueta: texto opcional destacado sobre la tarjeta
 *    (borrar la línea para quitarla).
 *
 *  Después de editar, guardar y recargar la página (F5).
 * ============================================================
 */

window.LIGA_CONFIG = {
  niveles: [
    {
      id: "amigo",
      nombre: "Aporte Amigo",
      monto: 30000,
      regalo: "Un llavero institucional",
      productos: ["Llavero"],
      descripcion:
        "Un pequeño recordatorio de que sos parte de la comunidad de la Liga. Ideal para llevar siempre con vos.",
      imagen: "img/productos/amigo.svg",
      color: "green",
    },
    {
      id: "comunidad",
      nombre: "Aporte Comunidad",
      monto: 45000,
      regalo: "Una bolsa de tela institucional",
      productos: ["Bolsa de tela"],
      descripcion:
        "Una bolsa reutilizable para el día a día, que además ayuda a visibilizar a la Liga donde vayas.",
      imagen: "img/productos/comunidad.svg",
      color: "blue",
      etiqueta: "Recomendado",
    },
    {
      id: "embajador",
      nombre: "Aporte Embajador",
      monto: 60000,
      regalo: "Una bolsa de tela, un cuaderno y un llavero",
      productos: ["Bolsa de tela", "Cuaderno", "Llavero"],
      descripcion:
        "El kit completo para quienes quieren acompañar con más fuerza y llevar el mensaje de la Liga a todos lados.",
      imagen: "img/productos/embajador.svg",
      color: "zinc",
    },
  ],

  campania: {
    titulo: "Colaborá y llevate un regalo con propósito",
    bajada:
      "Sumá un aporte extraordinario y recibí un regalo institucional de la Liga en agradecimiento.",
    pasos: [
      {
        titulo: "Campaña por tiempo limitado",
        texto: "Las solicitudes se reciben solo durante el período de la campaña.",
      },
      {
        titulo: "Producción según demanda",
        texto:
          "Al cerrar la campaña, la Liga encarga los artículos según la cantidad solicitada. Sin stock ni desperdicio.",
      },
      {
        titulo: "Entrega en un encuentro presencial",
        texto:
          "Los regalos se entregan en encuentros de la organización. La fecha se confirma más adelante.",
      },
    ],
  },

  entregas: [
    {
      id: "retiro",
      nombre: "Retiro en encuentro presencial",
      detalle: "Te avisaremos la fecha y el lugar del encuentro una vez cerrada la campaña.",
      habilitada: true,
    },
    {
      id: "envio",
      nombre: "Envío a domicilio (próximamente)",
      detalle: "Esta opción todavía no está disponible.",
      habilitada: false,
    },
  ],
};
