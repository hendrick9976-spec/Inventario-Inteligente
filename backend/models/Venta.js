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

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Venta", ventaSchema);