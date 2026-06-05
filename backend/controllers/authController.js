const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: emailNormalizado });

    if (existingUser) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name.trim(),
      email: emailNormalizado,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son obligatorios",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailNormalizado });

    if (!user) {
      return res.status(400).json({
        message: "Usuario no encontrado",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Contraseña incorrecta",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { name, email, password, confirmarPassword } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Nombre y correo son obligatorios",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuarioExistente = await User.findOne({
      email: emailNormalizado,
      _id: { $ne: req.user.userId },
    });

    if (usuarioExistente) {
      return res.status(400).json({
        message: "Ese correo ya está en uso por otro usuario",
      });
    }

    const datosActualizados = {
      name: name.trim(),
      email: emailNormalizado,
    };

    if (password || confirmarPassword) {
      if (password !== confirmarPassword) {
        return res.status(400).json({
          message: "Las contraseñas no coinciden",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message: "La contraseña debe tener al menos 6 caracteres",
        });
      }

      datosActualizados.password = await bcrypt.hash(password, 10);
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.user.userId,
      datosActualizados,
      { new: true },
    ).select("-password");

    return res.json({
      message: "Perfil actualizado correctamente",
      user: {
        id: usuarioActualizado._id,
        name: usuarioActualizado.name,
        email: usuarioActualizado.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar perfil",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  actualizarPerfil,
};
