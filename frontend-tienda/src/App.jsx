import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [productos, setProductos] = useState([]);
  
  const userId = "69e94a11daadc496134df33c";

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const respuesta = await axios.get(`http://localhost:5000/api/tienda/${userId}/productos`);
        setProductos(respuesta.data);
      } catch (error) {
        console.error("Error al cargar el catálogo:", error);
      }
    };
    
    cargarProductos();
  }, []);

  const manejarCompra = async (producto, cantidadComprada) => {
    try {
      const respuesta = await axios.post('http://localhost:5000/api/tienda/compra', {
        productoId: producto._id,
        cantidad: cantidadComprada, 
        cliente: "Cliente Web Simulado"
      });

      setProductos((productosActuales) => 
        productosActuales.map((p) => 
          p._id === producto._id ? { ...p, stock: p.stock - cantidadComprada } : p
        )
      );

      alert(`¡Compra de ${cantidadComprada} unidad(es) de ${producto.nombre} exitosa!`);
      
      return true; // <-- Esto le avisa a la tarjeta que todo salió bien
      
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      alert(error.response?.data?.error || "Hubo un problema al realizar la compra");
      
      return false; // <-- Esto le avisa a la tarjeta que hubo un error
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Catálogo de Productos</h1>
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {productos.map((producto) => (
          <TarjetaProducto 
            key={producto._id} 
            producto={producto} 
            manejarCompra={manejarCompra} 
          />
        ))}
      </div>
    </div>
  );
}

function TarjetaProducto({ producto, manejarCompra }) {
  const [cantidad, setCantidad] = useState(1);

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
      <h2>{producto.nombre}</h2>
      <p>{producto.descripcion || "Sin descripción"}</p>
      <h3 style={{ color: 'green' }}>${producto.precioVenta}</h3>
      <p>Stock disponible: {producto.stock}</p>
      
      <input 
        type="number" 
        min="1" 
        max={producto.stock} 
        value={cantidad} 
        onChange={(e) => setCantidad(Number(e.target.value))}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
      />

      <button 
        onClick={async () => {
          // Esperamos a que termine la función principal
          const exito = await manejarCompra(producto, cantidad);
          // Si nos devuelve "true", regresamos el contador a 1
          if (exito) {
            setCantidad(1);
          }
        }}
        disabled={producto.stock <= 0 || cantidad > producto.stock || cantidad < 1}
        style={{ 
          padding: '10px', 
          background: producto.stock > 0 ? '#007bff' : '#ccc', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: producto.stock > 0 ? 'pointer' : 'not-allowed',
          width: '100%'
        }}
      >
        {producto.stock > 0 ? `Comprar ${cantidad} (Simulación)` : "Agotado"}
      </button>
    </div>
  );
}

export default App;