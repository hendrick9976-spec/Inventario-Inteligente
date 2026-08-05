const mongoose = require("mongoose");

const ventaSchema = new mongoose.Schema(
  {
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    nombreProducto: {
      type: String,
      required: true,
    },

    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },

    costoUnitario: {
      type: Number,
      required: true,
      min: 0,
    },

    precioVentaUnitario: {
      type: Number,
      required: true,
      min: 0,
    },

    ingresoTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    costoTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    utilidad: {
      type: Number,
      required: true,
    },

    tipoVenta: {
      type: String,
      enum: ["detalle", "mayoreo"],
      default: "detalle",
    },

    precioUnitarioNegociado: {
      type: Number,
      default: null,
    },

    precioGlobalMayoreo: {
      type: Number,
      default: null,
    },

    porcentajeDescuento: {
      type: Number,
      default: 0,
    },

    cliente: {
      type: String,
      default: "",
    },

    ventaConPerdida: {
      type: Boolean,
      default: false,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    origenVenta: {
      type: String,
      enum: ["Web", "App", "Fisica", "Simulador Tienda"],
      default: "Simulador Tienda",
    },

    estado: {
      type: String,
      enum: ["Completado", "En proceso"],
      default: "Completado", // Como es venta directa, puede caer en completado directo
    },

    telefonoCliente: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  },
);

ventaSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Venta", ventaSchema);
