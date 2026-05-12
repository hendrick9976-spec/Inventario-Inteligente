const express = require("express");
const {
  register,
  login,
  actualizarPerfil,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/perfil", authMiddleware, actualizarPerfil);

module.exports = router;