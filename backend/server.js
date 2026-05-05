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
    const productos = await Product.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Crear producto
app.post("/productos", authMiddleware, async (req, res) => {
  try {
    const { nombre, precio, precioVenta, stock } = req.body;

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
      precio: Number(precio),
      precioVenta: Number(precioVenta),
      stock: Number(stock),
      user: req.user.userId,
    });

    await nuevoProducto.save();

    const reposicionInicial = new Reposicion({
      productoId: nuevoProducto._id,
      nombreProducto: nuevoProducto.nombre,
      cantidad: Number(stock),
      stockAntes: 0,
      stockDespues: Number(stock),
      user: req.user.userId,
    });

    await reposicionInicial.save();

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
    const { nombre, precio, precioVenta } = req.body;

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
        precio: Number(precio),
        precioVenta: Number(precioVenta),
      },
      { returnDocument:"after" }
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
    const { cantidad } = req.body;

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
    const { productoId, cantidad } = req.body;

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

    const ingresoTotal = Number(producto.precioVenta) * Number(cantidad);
    const costoTotal = Number(producto.precio) * Number(cantidad);
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
      user: req.user.userId,
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

// Obtener historial de ventas
app.get("/ventas", authMiddleware, async (req, res) => {
  try {
    const ventas = await Venta.find({ user: req.user.userId }).sort({ createdAt: -1 });
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
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
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

    const ingresosTotales = ventas.reduce((sum, venta) => sum + venta.ingresoTotal, 0);
    const costosTotales = ventas.reduce((sum, venta) => sum + venta.costoTotal, 0);
    const utilidadTotal = ventas.reduce((sum, venta) => sum + venta.utilidad, 0);
    const productosVendidos = ventas.reduce((sum, venta) => sum + venta.cantidad, 0);

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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});