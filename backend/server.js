require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const Product = require("./models/Product");
const Venta = require("./models/Venta");
const Reposicion = require("./models/Reposicion");
const ConfigTienda = require("./models/ConfigTienda");

const Categoria = require("./models/Categoria");
const { upload } = require("./config/cloudinary");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// conexion la Database
connectDB();

// Ruta principal
app.get("/", (req, res) => {
  res.send("Backend de Inventario Inteligente funcionando");
});

app.use("/api/auth", authRoutes);
app.get("/perfil", authMiddleware, (req, res) => {
  res.json({
    message: "Ruta protegida funcionando",
    user: req.user.userId,
  });
});

// ==========================================
// CATEGORÍAS
// ==========================================

// Obtener todas las categorías del usuario
app.get("/categorias", authMiddleware, async (req, res) => {
  try {
    const categorias = await Categoria.find({
      user: req.user.userId,
      estado: true,
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

// Crear una nueva categoría
app.post("/categorias", authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res
        .status(400)
        .json({ error: "El nombre de la categoría es obligatorio" });
    }

    const nuevaCategoria = new Categoria({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : "",
      user: req.user.userId, // Vinculamos la categoría al usuario actual
    });

    await nuevaCategoria.save();
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la categoría" });
  }
});

// Editar una categoría existente
app.put("/categorias/:id", authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const categoriaActualizada = await Categoria.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : "",
      },
      { new: true },
    );

    if (!categoriaActualizada) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(categoriaActualizada);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la categoría" });
  }
});

// Eliminar una categoría
app.delete("/categorias/:id", authMiddleware, async (req, res) => {
  try {
    // Opcional: Podríamos verificar si hay productos usando esta categoría antes de borrarla
    const categoriaEliminada = await Categoria.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!categoriaEliminada) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json({ mensaje: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
});

// Obtener todos los productos
app.get("/productos", authMiddleware, async (req, res) => {
  try {
    const productos = await Product.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Configuración para recibir foto y video simultáneamente
const uploadProductFiles = upload.fields([
  { name: "foto", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

// Crear producto (ACTUALIZADO CON FOTOS, VIDEO Y CATEGORÍA)
app.post("/productos", authMiddleware, uploadProductFiles, async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      costoEnvio,
      precioVenta,
      stock,
      stockMinimo,
      proveedorInicial,
      categoria,
      precioOferta,
      condicion,
    } = req.body;
    if (
      !nombre ||
      !nombre.trim() ||
      precio === undefined ||
      precioVenta === undefined ||
      stock === undefined ||
      Number(precio) < 0 ||
      Number(precioVenta) < 0 ||
      Number(stock) < 0 ||
      !categoria
    ) {
      return res.status(400).json({ error: "Datos inválidos o faltantes" });
    }
    const nuevoProducto = new Product({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : "",
      precio: Number(precio),
      costoEnvio: Number(costoEnvio || 0),
      precioVenta: Number(precioVenta),
      precioOferta: Number(precioOferta || 0),
      stock: Number(stock),
      stockMinimo: Number(stockMinimo || 5),
      categoria: categoria,
      condicion: condicion || "Nuevo",
      user: req.user.userId,
    });

    // Guardamos las URLs de Cloudinary si vienen los archivos
    if (req.files) {
      if (req.files["foto"] && req.files["foto"][0]) {
        nuevoProducto.fotos = [req.files["foto"][0].path];
      }
      if (req.files["video"] && req.files["video"][0]) {
        nuevoProducto.videoUrl = req.files["video"][0].path;
      }
    }

    await nuevoProducto.save();
    if (Number(stock) > 0) {
      const nuevaReposicion = new Reposicion({
        productoId: nuevoProducto._id,
        nombreProducto: nuevoProducto.nombre,
        cantidad: Number(stock),
        stockAntes: 0,
        stockDespues: Number(stock),
        proveedor: proveedorInicial || "",
        user: req.user.userId,
      });
      await nuevaReposicion.save();
    }
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// Editar producto (Actualizado para procesar textos, foto y video juntos)
app.put(
  "/productos/:id",
  authMiddleware,
  uploadProductFiles,
  async (req, res) => {
    try {
      //console.log("FILES RECIBIDOS:", req.files); // <--- AÑADE ESTO

      const {
        nombre,
        descripcion,
        precio,
        costoEnvio,
        precioVenta,
        stockMinimo,
        categoria,
        precioOferta,
        condicion,
      } = req.body;

      const updateData = {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : "",
        precio: Number(precio),
        costoEnvio: Number(costoEnvio || 0),
        precioVenta: Number(precioVenta),
        precioOferta: Number(precioOferta || 0),
        stockMinimo: Number(stockMinimo || 5),
        categoria: categoria,
        condicion: condicion || "Nuevo",
      };

      if (req.files) {
        if (req.files["foto"] && req.files["foto"][0]) {
          updateData.fotos = [req.files["foto"][0].path];
        }
        if (req.files["video"] && req.files["video"][0]) {
          updateData.videoUrl = req.files["video"][0].path;
          //console.log("URL DEL VIDEO A GUARDAR:", req.files["video"][0].path); // <--- Y ESTO
        }
      }

      const productoActualizado = await Product.findOneAndUpdate(
        { _id: req.params.id, user: req.user.userId },
        { $set: updateData },
        { new: true },
      );

      //console.log("PRODUCTO EN MONGODB TRAS GUARDAR:", productoActualizado); // <--- Y ESTO

      res.json(productoActualizado);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      res.status(500).json({ error: "Error al actualizar producto" });
    }
  },
);

// Eliminar producto
app.delete("/productos/:id", authMiddleware, async (req, res) => {
  try {
    const productoEliminado = await Product.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!productoEliminado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// Reponer inventario
app.put("/productos/:id/reponer", authMiddleware, async (req, res) => {
  try {
    const { cantidad, proveedor } = req.body;

    if (cantidad === undefined || Number(cantidad) <= 0) {
      return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
    }

    const producto = await Product.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const stockAntes = Number(producto.stock);
    const stockDespues = stockAntes + Number(cantidad);

    producto.stock = stockDespues;

    await producto.save();

    const nuevaReposicion = new Reposicion({
      productoId: producto._id,
      nombreProducto: producto.nombre,
      cantidad: Number(cantidad),
      stockAntes,
      stockDespues,
      proveedor: proveedor || "",
      user: req.user.userId,
    });

    await nuevaReposicion.save();

    res.json({
      mensaje: "Inventario repuesto correctamente",
      producto,
      reposicion: nuevaReposicion,
    });
  } catch (error) {
    console.error("Error al reponer inventario:", error);
    res.status(500).json({ error: "Error al reponer inventario" });
  }
});

// Obtener historial de reposiciones
app.get("/reposiciones", authMiddleware, async (req, res) => {
  try {
    const reposiciones = await Reposicion.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });

    res.json(reposiciones);
  } catch (error) {
    console.error("Error al obtener reposiciones:", error);
    res.status(500).json({ error: "Error al obtener reposiciones" });
  }
});

// Registrar venta
app.post("/ventas", authMiddleware, async (req, res) => {
  try {
    const {
      productoId,
      cantidad,
      tipoVenta,
      precioUnitarioNegociado,
      precioGlobalMayoreo,
      porcentajeDescuento,
      cliente,
    } = req.body;

    if (!productoId || cantidad === undefined || Number(cantidad) <= 0) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const producto = await Product.findOne({
      _id: productoId,
      user: req.user.userId,
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (Number(producto.stock) < Number(cantidad)) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    let ingresoTotal = 0;

    if (tipoVenta === "mayoreo") {
      // Precio negociado manual
      if (
        precioGlobalMayoreo !== null &&
        precioGlobalMayoreo !== undefined &&
        precioGlobalMayoreo !== ""
      ) {
        ingresoTotal = Number(precioGlobalMayoreo);
      }

      // Descuento porcentual
      else {
        const precioBase = Number(producto.precioVenta) * Number(cantidad);

        const descuento = Number(porcentajeDescuento || 0);

        ingresoTotal = precioBase - (precioBase * descuento) / 100;
      }
    }

    // VENTA NORMAL
    else {
      const precioUnitarioFinal =
        precioUnitarioNegociado !== null &&
        precioUnitarioNegociado !== undefined &&
        precioUnitarioNegociado !== ""
          ? Number(precioUnitarioNegociado)
          : Number(producto.precioVenta);

      ingresoTotal = precioUnitarioFinal * Number(cantidad);
    }

    const costoUnitarioTotal =
      Number(producto.precio) + Number(producto.costoEnvio || 0);
    const costoTotal =
      (Number(producto.precio || 0) + Number(producto.costoEnvio || 0)) *
      Number(cantidad);
    const utilidad = ingresoTotal - costoTotal;

    const nuevaVenta = new Venta({
      productoId: producto._id,
      nombreProducto: producto.nombre,
      cantidad: Number(cantidad),
      costoUnitario: Number(producto.precio),
      precioVentaUnitario: Number(producto.precioVenta),
      ingresoTotal,
      costoTotal,
      utilidad,
      tipoVenta: tipoVenta || "detalle",
      precioUnitarioNegociado:
        precioUnitarioNegociado !== null &&
        precioUnitarioNegociado !== undefined
          ? Number(precioUnitarioNegociado)
          : null,
      precioGlobalMayoreo:
        tipoVenta === "mayoreo" ? Number(precioGlobalMayoreo) : null,
      porcentajeDescuento:
        tipoVenta === "mayoreo" ? Number(porcentajeDescuento || 0) : 0,
      cliente: cliente || "",
      ventaConPerdida: utilidad < 0,
      user: req.user.userId,
      origenVenta: "Fisica",
      estado: "Completado",
    });

    await nuevaVenta.save();

    await Product.updateOne(
      { _id: producto._id },
      { $inc: { stock: -Number(cantidad) } },
    );

    res.status(201).json({
      mensaje: "Venta registrada correctamente",
      venta: nuevaVenta,
      producto,
    });
  } catch (error) {
    console.error("Error al registrar venta:", error);
    res.status(500).json({ error: "Error al registrar venta" });
  }
});

// ==========================================
// NUEVO: Consolidado de ventas por origen (Dashboard E-business)
// ==========================================
app.get("/ventas/dashboard/origen", authMiddleware, async (req, res) => {
  try {
    const ventasUsuario = await Venta.find({ user: req.user.userId });

    const consolidado = ventasUsuario.reduce((acc, venta) => {
      // Unificamos: Todo lo que NO sea 'Web' se convierte en 'Local'
      let categoria = venta.origenVenta === "Web" ? "Web" : "Local";

      if (!acc[categoria]) {
        acc[categoria] = {
          _id: categoria,
          totalIngresos: 0,
          cantidadVentas: 0,
        };
      }

      acc[categoria].totalIngresos += Number(venta.ingresoTotal);
      acc[categoria].cantidadVentas += 1;

      return acc;
    }, {});

    res.json(Object.values(consolidado));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener consolidado" });
  }
});

// Obtener historial de ventas
app.get("/ventas", authMiddleware, async (req, res) => {
  try {
    const ventas = await Venta.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
});

// Resumen financiero
app.get("/ventas/resumen", authMiddleware, async (req, res) => {
  try {
    const { periodo } = req.query;

    let fechaInicio = null;
    const ahora = new Date();

    if (periodo === "dia") {
      fechaInicio = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
      );
    }

    if (periodo === "mes") {
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    }

    const filtro = {
      user: req.user.userId,
    };

    if (fechaInicio) {
      filtro.createdAt = { $gte: fechaInicio };
    }

    const ventas = await Venta.find(filtro);

    const ingresosTotales = ventas.reduce(
      (sum, venta) => sum + venta.ingresoTotal,
      0,
    );
    const costosTotales = ventas.reduce(
      (sum, venta) => sum + venta.costoTotal,
      0,
    );
    const utilidadTotal = ventas.reduce(
      (sum, venta) => sum + venta.utilidad,
      0,
    );
    const productosVendidos = ventas.reduce(
      (sum, venta) => sum + venta.cantidad,
      0,
    );

    res.json({
      ingresosTotales,
      costosTotales,
      utilidadTotal,
      productosVendidos,
      totalVentas: ventas.length,
    });
  } catch (error) {
    console.error("Error al obtener resumen financiero:", error);
    res.status(500).json({ error: "Error al obtener resumen financiero" });
  }
});

// ==========================================
// CONFIGURACIÓN DE LA TIENDA VIRTUAL (CMS)
// ==========================================

// 1. Obtener la configuración actual (Privado - Para el dueño en el CMS)
app.get("/api/tienda/config", authMiddleware, async (req, res) => {
  try {
    let config = await ConfigTienda.findOne({ user: req.user.userId });

    // Si el dueño es nuevo y no tiene configuración, creamos una por defecto
    if (!config) {
      config = new ConfigTienda({ user: req.user.userId });
      await config.save();
    }

    res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ error: "Error al obtener configuración" });
  }
});

// 2. Guardar/Actualizar la configuración
// Actualizar la ruta PUT /api/tienda/config

// 2. Guardar/Actualizar la configuración (Backend)
app.put("/api/tienda/config", authMiddleware, async (req, res) => {
  try {
    const {
      nombreTienda,
      colorPrincipal, // <--- ¡AQUÍ ESTÁ LA MAGIA DEL COLOR!
      logoTienda,
      mensajeBanner,
      descripcionBanner,
      correoTienda,
      whatsappTienda,
      politicaReembolso,
      terminosServicio,
      politicaPrivacidad,
      preguntasFrecuentes,
      badgesConfianza,
      moneda,
    } = req.body;

    // Generar slug basado en el nombre de la tienda para la URL amigable
    let slug;
    if (nombreTienda) {
      slug = nombreTienda
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-") // Cambia espacios por guiones
        .replace(/^-+|-+$/g, ""); // Limpia guiones en los bordes
    }

    const camposActualizar = {
      nombreTienda,
      colorPrincipal: colorPrincipal || "#7c3aed", // <--- ¡AQUÍ SE GUARDA EN MONGODB!
      logoTienda,
      mensajeBanner,
      descripcionBanner,
      correoTienda,
      whatsappTienda,
      politicaReembolso,
      terminosServicio,
      politicaPrivacidad,
      preguntasFrecuentes,
      badgesConfianza,
      moneda,
    };

    // Si generamos un slug, lo añadimos a lo que se va a guardar
    if (slug) {
      camposActualizar.slug = slug;
    }

    const configActualizada = await ConfigTienda.findOneAndUpdate(
      { user: req.user.userId },
      { $set: camposActualizar },
      { returnDocument: "after", upsert: true },
    );
    res.json(configActualizada);
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
});

// 3. Subir el logo de la tienda (Imagen)
app.post(
  "/api/tienda/config/logo",
  authMiddleware,
  upload.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se detectó ninguna imagen" });
      }

      const configActualizada = await ConfigTienda.findOneAndUpdate(
        { user: req.user.userId },
        { $set: { logoTienda: req.file.path } },
        { returnDocument: "after", upsert: true },
      );

      res.json({
        mensaje: "Logo guardado con éxito",
        config: configActualizada,
      });
    } catch (error) {
      console.error("Error al subir logo:", error);
      res.status(500).json({ error: "Error al procesar la imagen" });
    }
  },
);

// Subir la imagen principal del Mega Banner
app.post(
  "/api/tienda/config/banner",
  authMiddleware,
  upload.single("banner"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se detectó ninguna imagen" });
      }
      const configActualizada = await ConfigTienda.findOneAndUpdate(
        { user: req.user.userId },
        { $set: { imagenBanner: req.file.path } },
        { returnDocument: "after", upsert: true },
      );
      res.json({
        mensaje: "Banner guardado con éxito",
        config: configActualizada,
      });
    } catch (error) {
      console.error("Error al subir banner:", error);
      res.status(500).json({ error: "Error al procesar la imagen" });
    }
  },
);

// ==========================================
// GESTOR DE OFERTAS (MARKETING)
// ==========================================

// 1. Aplicar descuento masivo (por producto o categoría)
app.post("/api/tienda/ofertas/aplicar", authMiddleware, async (req, res) => {
  try {
    const { tipo, objetivoId, porcentaje } = req.body;

    if (!porcentaje || Number(porcentaje) <= 0 || Number(porcentaje) >= 100) {
      return res
        .status(400)
        .json({ error: "El porcentaje debe estar entre 1 y 99" });
    }

    const descuento = Number(porcentaje) / 100;
    let filtro = { user: req.user.userId }; // Solo modificamos los del usuario actual

    if (tipo === "categoria") {
      filtro.categoria = objetivoId;
    } else if (tipo === "producto") {
      filtro._id = objetivoId;
    } else {
      return res
        .status(400)
        .json({ error: "Debes especificar si es a un producto o categoría" });
    }

    // Buscamos los productos afectados
    const productosAfectados = await Product.find(filtro);

    // Si no hay productos, avisamos
    if (productosAfectados.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron productos para aplicar la oferta" });
    }

    // Calculamos el nuevo precio para cada uno y lo guardamos
    const promesas = productosAfectados.map((prod) => {
      const nuevoPrecioOferta = Number(prod.precioVenta) * (1 - descuento);
      prod.precioOferta = nuevoPrecioOferta;
      return prod.save();
    });

    await Promise.all(promesas);
    res.json({
      mensaje: `¡Oferta del ${porcentaje}% aplicada a ${productosAfectados.length} producto(s)!`,
    });
  } catch (error) {
    console.error("Error al aplicar oferta:", error);
    res.status(500).json({ error: "Error al aplicar el descuento" });
  }
});

// 2. Retirar descuentos (por producto, categoría o limpiar todo)
app.post("/api/tienda/ofertas/quitar", authMiddleware, async (req, res) => {
  try {
    const { tipo, objetivoId } = req.body;
    let filtro = { user: req.user.userId };

    if (tipo === "categoria") {
      filtro.categoria = objetivoId;
    } else if (tipo === "producto") {
      filtro._id = objetivoId;
    } else if (tipo === "todas") {
      // Busca todos los que tengan una oferta aplicada
      filtro.precioOferta = { $gt: 0 };
    }

    // updateMany actualiza todo de un solo golpe (más rápido que un map)
    const resultado = await Product.updateMany(filtro, {
      $set: { precioOferta: 0 },
    });

    res.json({
      mensaje: `Se han retirado las ofertas de ${resultado.modifiedCount} producto(s).`,
    });
  } catch (error) {
    console.error("Error al retirar oferta:", error);
    res.status(500).json({ error: "Error al retirar las ofertas" });
  }
});

// ==========================================
// RUTA PÚBLICA PARA EL FRONTEND DE LA TIENDA
// ==========================================
// 3. El e-commerce consulta los datos de su dueño (Público)

// Función auxiliar para buscar la tienda por Slug o por ID
async function resolverTienda(identificador) {
  let config = null;
  // Si el texto tiene 24 caracteres (es un ID de MongoDB)
  if (identificador.match(/^[0-9a-fA-F]{24}$/)) {
    config = await ConfigTienda.findOne({ user: identificador });
  }
  // Si no es un ID, asumimos que es el nombre (slug)
  if (!config) {
    config = await ConfigTienda.findOne({ slug: identificador.toLowerCase() });
  }
  return config;
}

// 1. Obtener Configuración Pública
app.get("/api/tienda/:identificador/config", async (req, res) => {
  try {
    const config = await resolverTienda(req.params.identificador);
    if (!config) {
      return res.status(404).json({ error: "Tienda no encontrada" });
    }
    res.json(config);
  } catch (error) {
    console.error("Error al obtener config pública:", error);
    res.status(500).json({ error: "Error al cargar la tienda" });
  }
});

// 2. Obtener Productos Públicos
app.get("/api/tienda/:identificador/productos", async (req, res) => {
  try {
    const config = await resolverTienda(req.params.identificador);
    if (!config) {
      return res.status(404).json({ error: "Tienda no encontrada" });
    }
    const productos = await Product.find({ user: config.user }).sort({
      nombre: 1,
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

// 3. Simular una compra desde la tienda
app.post("/api/tienda/:identificador/compra", async (req, res) => {
  try {
    const config = await resolverTienda(req.params.identificador);
    if (!config) {
      return res.status(404).json({ error: "Tienda no encontrada" });
    }
    const usuarioId = config.user;
    const { productoId, cantidad, cliente, telefonoCliente } = req.body;

    if (!productoId || cantidad === undefined || Number(cantidad) <= 0) {
      return res.status(400).json({ error: "Datos de compra inválidos" });
    }

    const producto = await Product.findOneAndUpdate(
      { _id: productoId, user: usuarioId, stock: { $gte: Number(cantidad) } },
      { $inc: { stock: -Number(cantidad) } },
      { returnDocument: "after" },
    );

    if (!producto) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    const precioRealVenta =
      producto.precioOferta && producto.precioOferta > 0
        ? Number(producto.precioOferta)
        : Number(producto.precioVenta);

    const ingresoTotal = precioRealVenta * Number(cantidad);
    const costoTotal =
      (Number(producto.precio || 0) + Number(producto.costoEnvio || 0)) *
      Number(cantidad);
    const utilidad = ingresoTotal - costoTotal;

    const nuevaVenta = new Venta({
      productoId: producto._id,
      nombreProducto: producto.nombre,
      cantidad: Number(cantidad),
      costoUnitario: Number(producto.precio),
      precioVentaUnitario: precioRealVenta,
      ingresoTotal,
      costoTotal,
      utilidad,
      tipoVenta: "detalle",
      cliente: cliente || "",
      telefonoCliente: telefonoCliente || "",
      ventaConPerdida: utilidad < 0,
      user: producto.user,
      origenVenta: "Web",
      estado: "En proceso",
    });

    await nuevaVenta.save();
    res.status(201).json({ mensaje: "¡Pedido registrado!", venta: nuevaVenta });
  } catch (error) {
    console.error("Error en la compra simulada:", error);
    res.status(500).json({ error: "Error al procesar la compra simulada" });
  }
});

// 4. Obtener categorías de forma pública
app.get("/api/tienda/:identificador/categorias", async (req, res) => {
  try {
    const config = await resolverTienda(req.params.identificador);
    if (!config) {
      return res.status(404).json({ error: "Tienda no encontrada" });
    }
    const categorias = await Categoria.find({ user: config.user });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
