const Product = require('../models/Product');

const obtenerCatalogo = async (req, res) => {
  try {
    const productos = await Product.find({ stock: { $gt: 0 } });
    res.status(200).json({ success: true, data: productos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error interno al obtener el catálogo' });
  }
};

const procesarCompraCliente = async (req, res) => {
  try {
    const { carrito } = req.body;
    const item = carrito[0];

    await Product.findOneAndUpdate(
      { _id: item.productoId },
      { $inc: { stock: -item.cantidad } }
    );

    res.status(201).json({ success: true, mensaje: 'Compra procesada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error interno al procesar la compra' });
  }
};

module.exports = {
  obtenerCatalogo,
  procesarCompraCliente
};