const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configuración de credenciales (se leerán de tu archivo .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de la carpeta destino y formatos permitidos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "inventario_tienda",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
