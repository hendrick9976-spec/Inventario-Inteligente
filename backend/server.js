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

// Crear producto (ACTUALIZADO CON FOTOS Y CATEGORÍA)
app.post(
  "/productos",
  authMiddleware,
  upload.single("foto"),
  async (req, res) => {
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
        precioOferta, // NUEVO CAMPO
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
        !categoria // Validación de la categoría
      ) {
        return res.status(400).json({ error: "Datos inválidos o faltantes" });
      }

      const nuevoProducto = new Product({
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : "",
        precio: Number(precio),
        costoEnvio: Number(costoEnvio || 0),
        precioVenta: Number(precioVenta),
        precioOferta: Number(precioOferta || 0), // <-- NUEVO: Lo guardamos (0 si no hay oferta)
        stock: Number(stock),
        stockMinimo: Number(stockMinimo || 5),
        categoria: categoria, // Guardamos el ID de la categoría
        user: req.user.userId,
      });

      // NUEVO: Si Cloudinary procesó una imagen, guardamos la URL
      if (req.file) {
        nuevoProducto.fotos = [req.file.path];
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
  },
);

// ==========================================
// RUTA TEMPORAL PARA PRUEBA DE FOTOS
// ==========================================
app.post(
  "/productos/:id/foto",
  authMiddleware,
  upload.single("foto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se detectó ninguna imagen" });
      }

      // Usamos findOneAndUpdate para actualizar solo la foto y evitar
      // el error de validación por la falta de 'categoria' en productos antiguos
      const producto = await Product.findOneAndUpdate(
        { _id: req.params.id, user: req.user.userId },
        { $set: { fotos: [req.file.path] } },
        { returnDocument: "after" }, // Esto nos devuelve el producto ya actualizado
      );

      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.json({ mensaje: "Foto guardada con éxito", producto });
    } catch (error) {
      console.error("Error al subir foto:", error);
      res.status(500).json({ error: "Error al procesar la imagen" });
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

// Editar producto
app.put("/productos/:id", authMiddleware, async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      costoEnvio,
      precioVenta,
      stockMinimo,
      categoria,
      precioOferta, // <-- NUEVO
    } = req.body;

    if (
      !nombre ||
      !nombre.trim() ||
      precio === undefined ||
      precioVenta === undefined ||
      Number(precio) < 0 ||
      Number(precioVenta) < 0
    ) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const productoActualizado = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : "",
        precio: Number(precio),
        costoEnvio: Number(costoEnvio || 0),
        precioVenta: Number(precioVenta),
        precioOferta: Number(precioOferta || 0), // <-- NUEVO
        stockMinimo: Number(stockMinimo || 5),
        categoria: categoria,
      },
      { returnDocument: "after" },
    );

    if (!productoActualizado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
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

// 2. Guardar/Actualizar la configuración (Privado - Para el dueño en el CMS)
// Actualizar la ruta PUT /api/tienda/config
app.put("/api/tienda/config", authMiddleware, async (req, res) => {
  try {
    const {
      nombreTienda,
      mensajeBanner,
      descripcionBanner,
      correoTienda,
      whatsappTienda,
      politicaReembolso, // <-- NUEVO
      terminosServicio,
      preguntasFrecuentes, // <-- NUEVO
    } = req.body;

    const configActualizada = await ConfigTienda.findOneAndUpdate(
      { user: req.user.userId },
      {
        nombreTienda,
        mensajeBanner,
        descripcionBanner,
        correoTienda,
        whatsappTienda,
        politicaReembolso, // <-- NUEVO
        terminosServicio,
        preguntasFrecuentes, // <-- NUEVO
      },
      { returnDocument: "after", upsert: true },
    );
    res.json(configActualizada);
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
});

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
app.get("/api/tienda/:usuarioId/config", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const config = await ConfigTienda.findOne({ user: usuarioId });

    if (!config) {
      return res.json({
        nombreTienda: "Mi Tienda Virtual",
        mensajeBanner: "¡Bienvenido a nuestra Tienda en Línea!",
        descripcionBanner:
          "Personaliza este banner desde tu panel de administración en la sección Mi Tienda Web.",
        // <--- NUEVO: PREGUNTAS POR DEFECTO
        preguntasFrecuentes: [
          {
            pregunta: "¿Cuánto tarda en llegar mi pedido?",
            respuesta:
              "El tiempo de entrega estándar es de 3 a 5 días hábiles a todo México tras procesar tu pago.",
          },
          {
            pregunta: "¿Qué formas de pago aceptan?",
            respuesta:
              "Aceptamos tarjetas de crédito/débito, PayPal y pagos en efectivo a través de tiendas de conveniencia.",
          },
          {
            pregunta: "¿Puedo devolver un producto si llega dañado?",
            respuesta:
              "Sí, tienes 7 días naturales desde que recibes el paquete para reportar cualquier daño y solicitar un reemplazo sin costo extra.",
          },
        ],
      });
    }

    res.json(config);
  } catch (error) {
    console.error("Error al obtener config pública:", error);
    res.status(500).json({ error: "Error al cargar la tienda" });
  }
});

// ==========================================
// NUEVAS RUTAS PÚBLICAS PARA LA TIENDA (DÍA 2)
// ==========================================

// 1. Obtener productos de forma pública para la tienda (Ruta Dinámica)
app.get("/api/tienda/:usuarioId/productos", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Se extrae el catálogo exclusivamente del usuario especificado en la URL
    const productos = await Product.find({ user: usuarioId }).sort({
      nombre: 1,
    });

    res.json(productos);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener los productos de la tienda" });
  }
});

// 2. Simular una compra desde la tienda (Ruta Dinámica)
app.post("/api/tienda/:usuarioId/compra", async (req, res) => {
  try {
    const { productoId, cantidad, cliente, telefonoCliente } = req.body;
    const { usuarioId } = req.params;

    if (!productoId || cantidad === undefined || Number(cantidad) <= 0) {
      return res.status(400).json({ error: "Datos de compra inválidos" });
    }

    // === OPERACIÓN ATÓMICA DE CONCURRENCIA ===
    const producto = await Product.findOneAndUpdate(
      {
        _id: productoId,
        user: usuarioId, // Validación extra de seguridad
        stock: { $gte: Number(cantidad) },
      },
      {
        $inc: { stock: -Number(cantidad) },
      },
      { returnDocument: "after" },
    );

    if (!producto) {
      const existeProducto = await Product.findOne({
        _id: productoId,
        user: usuarioId,
      });
      if (!existeProducto) {
        return res
          .status(404)
          .json({ error: "El producto ya no existe en esta tienda" });
      }
      return res
        .status(400)
        .json({ error: "Lo sentimos, no hay suficiente stock disponible" });
    }

    // NUEVO: Verificamos cuál es el precio real que debemos cobrar
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
      precioVentaUnitario: precioRealVenta, // <-- Usamos el precio final detectado
      ingresoTotal,
      costoTotal,
      utilidad,
      tipoVenta: "detalle",
      cliente: cliente || "",
      telefonoCliente: telefonoCliente || "", // <--- NUEVO
      ventaConPerdida: utilidad < 0,
      user: producto.user,
      origenVenta: "Web",
      estado: "En proceso",
    });

    await nuevaVenta.save();

    res.status(201).json({
      mensaje: "¡Pedido registrado correctamente!",
      venta: nuevaVenta,
      productoUpdated: producto,
    });
  } catch (error) {
    console.error("Error en la compra simulada:", error);
    res.status(500).json({ error: "Error al procesar la compra simulada" });
  }
});

// Actualizar estado de la venta
app.put("/ventas/:id/estado", authMiddleware, async (req, res) => {
  try {
    const { estado } = req.body;
    const ventaActualizada = await Venta.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { estado },
      { returnDocument: "after" },
    );
    if (!ventaActualizada) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }
    res.json(ventaActualizada);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

// Cancelar pedido web y devolver stock
app.delete("/api/ventas/:id/cancelar", authMiddleware, async (req, res) => {
  try {
    const venta = await Venta.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!venta) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    // 1. Devolver el stock al producto sumando la cantidad apartada
    await Product.updateOne(
      { _id: venta.productoId },
      { $inc: { stock: venta.cantidad } },
    );

    // 2. Eliminar el registro de la venta para no ensuciar el historial
    await Venta.deleteOne({ _id: venta._id });

    res.json({ mensaje: "Pedido cancelado y stock restaurado" });
  } catch (error) {
    console.error("Error al cancelar pedido:", error);
    res.status(500).json({ error: "Error al cancelar el pedido" });
  }
});

// 3. Obtener categorías de forma pública para la tienda
app.get("/api/tienda/:usuarioId/categorias", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const categorias = await Categoria.find({ user: usuarioId });
    res.json(categorias);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener las categorías de la tienda" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
