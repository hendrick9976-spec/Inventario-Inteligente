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

// Crear producto
app.post("/productos", authMiddleware, async (req, res) => {
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
    } = req.body;

    if (
      !nombre ||
      !nombre.trim() ||
      precio === undefined ||
      precioVenta === undefined ||
      stock === undefined ||
      Number(precio) < 0 ||
      Number(precioVenta) < 0 ||
      Number(stock) < 0
    ) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const nuevoProducto = new Product({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : "",
      precio: Number(precio),
      costoEnvio: Number(costoEnvio || 0),
      precioVenta: Number(precioVenta),
      stock: Number(stock),
      stockMinimo: Number(stockMinimo || 5),
      user: req.user.userId,
    });

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
    res.status(500).json({ error: "Error al crear producto" });
  }
  
});

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
        stockMinimo: Number(stockMinimo || 5),
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
      estado: "Completado"
    });

    await nuevaVenta.save();

    producto.stock = Number(producto.stock) - Number(cantidad);
    await producto.save();

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
      let categoria = venta.origenVenta === 'Web' ? 'Web' : 'Local';
      
      if (!acc[categoria]) {
        acc[categoria] = { _id: categoria, totalIngresos: 0, cantidadVentas: 0 };
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
// NUEVAS RUTAS PÚBLICAS PARA LA TIENDA (DÍA 2)
// ==========================================

// 1. Obtener productos de forma pública para la tienda (Búsqueda Inteligente - Parche Temporal)
app.get("/api/tienda/productos", async (req, res) => {
  try {
    // Parche temporal: ID de tu cuenta principal forzado para pruebas locales
    const miIdPrincipal = "69e94a11daadc496134df33c";
    
    // Traemos todo el catálogo exclusivamente de este usuario
    const productos = await Product.find({ user: miIdPrincipal }).sort({
      nombre: 1,
    });
    
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos de la tienda" });
  }
});

// 2. Simular una compra desde la tienda (Descuenta stock de forma atómica y registra la venta)
app.post("/api/tienda/compra", async (req, res) => {
  try {
    const { productoId, cantidad, cliente } = req.body;

    if (!productoId || cantidad === undefined || Number(cantidad) <= 0) {
      return res.status(400).json({ error: "Datos de compra inválidos" });
    }

    // === OPERACIÓN ATÓMICA DE CONCURRENCIA ===
    // Intenta buscar el producto Y restar el stock en un solo paso, solo si hay suficiente stock
    const producto = await Product.findOneAndUpdate(
      {
        _id: productoId,
        stock: { $gte: Number(cantidad) } // Condición crítica: stock mayor o igual a la cantidad
      },
      {
        $inc: { stock: -Number(cantidad) } // Resta la cantidad directamente en la BD
      },
      { returnDocument: "after" } // Nos devuelve el producto ya actualizado
    );

    // Si no se pudo hacer la actualización, es porque el producto no existe o no hay stock
    if (!producto) {
      // Hacemos una verificación rápida para responder con el error exacto
      const existeProducto = await Product.findById(productoId);
      if (!existeProducto) {
        return res.status(404).json({ error: "El producto ya no existe" });
      }
      return res.status(400).json({ error: "Lo sentimos, no hay suficiente stock disponible" });
    }

    // Calculamos los aspectos financieros usando los datos del producto actualizado
    // (Como el stock ya se restó, sumamos la cantidad para calcular los costos basados en lo que costaba originalmente)
    const ingresoTotal = Number(producto.precioVenta) * Number(cantidad);
    const costoTotal = (Number(producto.precio || 0) + Number(producto.costoEnvio || 0)) * Number(cantidad);
    const utilidad = ingresoTotal - costoTotal;

    // Registramos la venta en el historial del dueño del producto
    const nuevaVenta = new Venta({
      productoId: producto._id,
      nombreProducto: producto.nombre,
      cantidad: Number(cantidad),
      costoUnitario: Number(producto.precio),
      precioVentaUnitario: Number(producto.precioVenta),
      ingresoTotal,
      costoTotal,
      utilidad,
      tipoVenta: "detalle",
      cliente: cliente || "Cliente Tienda Virtual",
      ventaConPerdida: utilidad < 0,
      user: producto.user,
      origenVenta: "Web",
      estado: "Completado"
    });

    await nuevaVenta.save();

    res.status(201).json({
      mensaje: "¡Compra simulada con éxito! El stock ha sido actualizado.",
      venta: nuevaVenta,
      productoUpdated: producto // Ya lleva el stock descontado de forma segura
    });

  } catch (error) {
    console.error("Error en la compra simulada:", error);
    res.status(500).json({ error: "Error al procesar la compra simulada" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});