const Product = require('../models/Product');
const Venta = require('../models/Venta');

const crearVenta = async (req, res) => {
  const { productoId, cantidad, usuarioId } = req.body;

  // 1. VALIDACIÓN BÁSICA
  if (!productoId || !cantidad || !usuarioId) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // 2. ACTUALIZACIÓN CONDICIONAL ATÓMICA (Control de stock y concurrencia)
    const productoActualizado = await Product.findOneAndUpdate(
      { 
        _id: productoId, 
        stock: { $gte: cantidad } // Solo actualiza si hay stock suficiente
      },
      { 
        $inc: { stock: -cantidad } 
      },
      { 
        new: true 
      }
    );

    // Si devuelve null, es porque no existe el producto o no hay stock suficiente
    if (!productoActualizado) {
      return res.status(409).json({
        error: 'Conflicto de stock',
        message: 'El producto no existe, el stock cambió o no hay unidades suficientes.'
      });
    }

    // 3. REGISTRO EN EL HISTORIAL DE VENTAS
    // Esto lo mockeamos en las pruebas para que no ensucie tu base de datos real
    const nuevaVenta = await Venta.create({
      productoId,
      cantidad,
      usuarioId,
      fecha: new Date()
    });

    // 4. RESPUESTA DE ÉXITO
    return res.status(201).json({
      success: true,
      message: 'Venta procesada con éxito',
      producto: productoActualizado,
      venta: nuevaVenta
    });

  } catch (error) {
    // 5. MANEJO DE ERRORES DEL SERVIDOR
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { crearVenta };