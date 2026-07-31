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
      default: "TechStore", // Valor por defecto si no han configurado nada
    },
    mensajeBanner: {
      type: String,
      default: "HASTA 30% OFF EN TODA LA TIENDA",
    },
    descripcionBanner: {
      type: String,
      default:
        "Lleva los mejores accesorios tecnológicos al mejor precio con liquidaciones de inventario por tiempo limitado.",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ConfigTienda", configTiendaSchema);
