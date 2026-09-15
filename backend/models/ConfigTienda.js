const mongoose = require("mongoose");

const configTiendaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Asegura que cada dueño tenga solo 1 configuración activa
    },
    nombreTienda: {
      type: String,
      default: "Tienda", // Valor por defecto si no han configurado nada
    },
    // --- NUEVOS CAMPOS ---
    slug: {
      type: String,
      unique: true,
      sparse: true, // Permite que registros viejos sin slug no rompan la base de datos
      trim: true,
      lowercase: true,
    },
    colorPrincipal: {
      type: String,
      default: "#6366f1", // Color por defecto (puedes poner el violeta de tu maqueta)
    },
    // ---------------------
    // En models/ConfigTienda.js
    logoTienda: {
      type: String,
      default: "⚡",
    },

    // --- NUEVO: IMAGEN DEL MEGA BANNER ---
    imagenBanner: {
      type: String,
      default: "", // Estará vacío por defecto
    },
    mensajeBanner: {
      type: String,
      default: "HASTA X% OFF EN TODA LA TIENDA",
    },
    descripcionBanner: {
      type: String,
      default:
        "Lleva los mejores accesorios al mejor precio con liquidaciones de inventario por tiempo limitado.",
    },
    correoTienda: {
      type: String,
      default: "",
    },
    whatsappTienda: {
      type: String,
      default: "",
    },
    terminosServicio: {
      type: String,
      default: "",
    },
    politicaPrivacidad: {
      type: String,
      default: "",
    },
    politicaReembolso: {
      type: String,
      default: "",
    },
    preguntasFrecuentes: [
      {
        pregunta: String,
        respuesta: String,
      },
    ],
    badgesConfianza: [
      {
        icono: String,
        titulo: String,
        descripcion: String,
      },
    ],

    moneda: {
      type: String,
      default: "MXN",
    },
  },
  { timestamps: true },
);

// Middleware para autogenerar o limpiar el slug antes de guardar
configTiendaSchema.pre("save", function (next) {
  if (this.isModified("nombreTienda") || !this.slug) {
    this.slug = this.nombreTienda
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // Reemplaza espacios y símbolos por guiones
      .replace(/^-+|-+$/g, ""); // Elimina guiones al inicio o final
  }
  next();
});

module.exports = mongoose.model("ConfigTienda", configTiendaSchema);
