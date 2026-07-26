const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    descripcion: {
      type: String,
      default: "",
    },

    precio: {
      type: Number,
      required: true,
      min: 0,
    },

    costoEnvio: {
      type: Number,
      default: 0,
    },

    precioVenta: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    stockMinimo: {
      type: Number,
      default: 5,
    },

    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      required: true,
    },
    fotos: [
      {
        type: String,
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
