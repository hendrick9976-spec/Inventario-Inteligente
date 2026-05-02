const mongoose = require("mongoose");

const reposicionSchema = new mongoose.Schema(
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
    },

    stockAntes: {
      type: Number,
      required: true,
    },

    stockDespues: {
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

module.exports = mongoose.model("Reposicion", reposicionSchema);