const mongoose = require("mongoose");

const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    estado: {
      type: Boolean,
      default: true,
    },
    // Este es el campo clave para tu arquitectura multi-usuario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Asegúrate de que coincida con el nombre de tu modelo de usuarios
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Categoria", categoriaSchema);
