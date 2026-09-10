const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configuración de credenciales
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración inteligente para aceptar imágenes y videos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Detectamos si el archivo entrante es un video
    const esVideo = file.mimetype.startsWith("video/");

    return {
      folder: "inventario_tienda",
      // Si es video, usamos resource_type "video", de lo contrario "image"
      resource_type: esVideo ? "video" : "image",
      // Permitimos formatos de imagen y de video según corresponda
      allowed_formats: esVideo
        ? ["mp4", "mov", "avi", "mkv", "webm"]
        : ["jpg", "png", "jpeg", "webp"],
    };
  },
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
