const { obtenerCatalogo, procesarCompraCliente } = require('../controllers/tiendaController');
const Product = require('../models/Product');

// Mockeamos el modelo para no tocar la base de datos real
jest.mock('../models/Product');

describe('Suite de Pruebas Unitarias - E-commerce (Vista Cliente)', () => {
  let req, res;

  // Antes de cada prueba, limpiamos los mocks y preparamos variables
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('1. Debería mostrar solo los productos que tienen stock disponible en la tienda', async () => {
    // Simulamos que la base de datos devuelve un producto con stock
    Product.find.mockResolvedValue([
      { _id: 'prod-001', nombre: 'Laptop', stock: 5 }
    ]);

    await obtenerCatalogo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: [{ _id: 'prod-001', nombre: 'Laptop', stock: 5 }]
    }));
  });

  it('2. Debería procesar la compra del cliente y actualizar el inventario', async () => {
    // Simulamos la petición del cliente con su carrito
    req.body = {
      carrito: [{ productoId: 'prod-001', cantidad: 1 }],
      datosCliente: { nombre: 'Cliente Prueba' } 
    };

    // Simulamos que el stock se reduce correctamente en la base de datos
    Product.findOneAndUpdate.mockResolvedValue({ _id: 'prod-001', stock: 4 });

    await procesarCompraCliente(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    
    // Verificamos que sí se tocó el inventario para actualizar el stock
    expect(Product.findOneAndUpdate).toHaveBeenCalledTimes(1); 
  });
});