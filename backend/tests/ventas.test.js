const { crearVenta } = require('../controllers/ventasController');
const Product = require('../models/Product');
const Venta = require('../models/Venta');

// Mockeamos AMBOS modelos para no tocar la base de datos real
jest.mock('../models/Product');
jest.mock('../models/Venta');

describe('Suite de Pruebas Unitarias - API de Ventas', () => {
  let req, res;

  // Antes de cada prueba, limpiamos los mocks y preparamos variables frescas
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: { productoId: 'prod-123', cantidad: 2, usuarioId: 'user-001' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('1. Debería procesar una venta con éxito (Happy Path)', async () => {
    // Simulamos que hay stock y que la venta se registra bien
    Product.findOneAndUpdate.mockResolvedValue({ _id: 'prod-123', stock: 8 });
    Venta.create.mockResolvedValue({ _id: 'venta-001', productoId: 'prod-123', cantidad: 2 });

    await crearVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    expect(Product.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(Venta.create).toHaveBeenCalledTimes(1); // Verificamos que mandó a guardar el historial
  });

  it('2. Debería devolver 400 si faltan datos obligatorios', async () => {
    // Le quitamos la cantidad y el usuario al body
    req.body = { productoId: 'prod-123' }; 

    await crearVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Faltan datos obligatorios' }));
    // Verificamos que NO intentó tocar la base de datos
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled(); 
  });

  it('3. Debería devolver 409 si no hay stock suficiente', async () => {
    // Simulamos que la consulta de stock devuelve null (no se cumplió el $gte)
    Product.findOneAndUpdate.mockResolvedValue(null); 

    await crearVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    // Verificamos que NO registró nada en el historial
    expect(Venta.create).not.toHaveBeenCalled(); 
  });

  it('4. Debería manejar errores de BD y devolver 500', async () => {
    // Simulamos una caída de la base de datos
    Product.findOneAndUpdate.mockRejectedValue(new Error('Se cayó la BD'));

    await crearVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Error interno del servidor' }));
  });

  it('5. Control de Concurrencia: solo procesa una de dos llamadas simultáneas', async () => {
    Product.findOneAndUpdate.mockImplementationOnce(() => Promise.resolve({ _id: 'prod-999', stock: 0 }));
    Product.findOneAndUpdate.mockImplementationOnce(() => Promise.resolve(null));
    Venta.create.mockResolvedValue({});

    const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await Promise.all([
      crearVenta(req, res),
      crearVenta(req, res2)
    ]);

    const respuestas = [
      res.status.mock.calls[0][0], 
      res2.status.mock.calls[0][0]
    ];

    expect(respuestas.filter(code => code === 201).length).toBe(1);
    expect(respuestas.filter(code => code === 409).length).toBe(1);
  });
});