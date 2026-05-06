import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null
  );
  const [regNombre, setRegNombre] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [costoEnvio, setCostoEnvio] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [productoReposicionId, setProductoReposicionId] = useState("");
  const [cantidadReposicion, setCantidadReposicion] = useState("");
  const [modoRegistro, setModoRegistro] = useState("nuevo");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("");
  const [filtroStock, setFiltroStock] = useState("todos");
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [productoMovimientoId, setProductoMovimientoId] = useState("");
  const [cantidadMovimiento, setCantidadMovimiento] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("venta");
  const [ventas, setVentas] = useState([]);
  const [filtroFechaVenta, setFiltroFechaVenta] = useState("");
  const [ordenVentas, setOrdenVentas] = useState("");
  const [reposiciones, setReposiciones] = useState([]);
  const [tipoHistorial, setTipoHistorial] = useState("ventas");
  const [filtroFechaReposicion, setFiltroFechaReposicion] = useState("");

  //Función de registro de usuario
  const registrarUsuario = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: regNombre,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al registrar");
        return;
      }

      alert("Usuario registrado correctamente");
      setRegNombre("");
      setRegEmail("");
      setRegPassword("");
    } catch (error) {
      console.error(error);
    }
  };

  //Función de Login
  const iniciarSesion = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al iniciar sesión");
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      localStorage.setItem("usuario", JSON.stringify(data.user));
      setUsuario(data.user);

      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      console.error(error);
    }
  };

  //Función cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken("");
    setUsuario(null);
  };

  const obtenerProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/productos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const obtenerVentas = async () => {
    try {
      const res = await fetch(`${API_URL}/ventas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setVentas(data);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
    }
  };

  const obtenerReposiciones = async () => {
    try {
      const res = await fetch(`${API_URL}/reposiciones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setReposiciones(data);
    } catch (error) {
      console.error("Error al obtener reposiciones:", error);
    }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("El nombre del producto es obligatorio");
      return;
    }

    if (precio === "" || Number(precio) < 0) {
      alert("El precio debe ser un número mayor o igual a 0");
      return;
    }

    if (precioVenta === "" || Number(precioVenta) < 0) {
      alert("El precio de venta debe ser un número mayor o igual a 0");
      return;
    }

    if (costoEnvio !== "" && Number(costoEnvio) < 0) {
      alert("El costo de envío/manejo debe ser mayor o igual a 0");
      return;
    }

    const costoTotalUnitario = Number(precio) + Number(costoEnvio || 0);

    if (Number(precioVenta) < costoTotalUnitario) {
      alert("El precio de venta no puede ser menor que el costo total unitario");
      return;
    }

    if (editandoId) {
      const confirmado = window.confirm("¿Seguro que quieres actualizar este producto?");
      if (!confirmado) return;

      const res = await fetch(`${API_URL}/productos/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          precio: Number(precio),
          costoEnvio: Number(costoEnvio || 0),
          precioVenta: Number(precioVenta),
          stockMinimo: Number(stockMinimo || 0),
        }),
      });

      const data = await res.json();
      console.log("Respuesta al editar:", data);

      setEditandoId(null);
      setSeccionActiva("inventario");
    }
    
    else {
      await fetch(`${API_URL}/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          precio: Number(precio),
          costoEnvio: Number(costoEnvio || 0),
          precioVenta: Number(precioVenta),
          stock: Number(stock),
          stockMinimo: Number(stockMinimo || 0),
        }),
      });
    }

    setNombre("");
    setDescripcion("");
    setPrecio("");
    setCostoEnvio("");
    setPrecioVenta("");
    setStock("");
    setStockMinimo("");

    obtenerProductos();
  };

  const eliminarProducto = async (id) => {
    const confirmado = window.confirm("¿Seguro que quieres eliminar este producto?");
    if (!confirmado) return;

    console.log("Eliminando id:", id);

    try {
      await fetch(`${API_URL}/productos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (editandoId === id) {
        cancelarEdicion();
      }

      obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const cancelarEdicion = () => {
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setCostoEnvio("");
    setPrecioVenta("");
    setStock("");
    setStockMinimo("");
    setEditandoId(null);
    setSeccionActiva("inventario");
  };

  const guardarMovimiento = async () => {
    if (!productoMovimientoId) {
      alert("Selecciona un producto");
      return;
    }

    if (cantidadMovimiento === "" || Number(cantidadMovimiento) <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    try {
      const url =
        tipoMovimiento === "venta"
          ? `${API_URL}/ventas`
          : `${API_URL}/productos/${productoMovimientoId}/reponer`;

      const method = tipoMovimiento === "venta" ? "POST" : "PUT";

      const body =
        tipoMovimiento === "venta"
          ? {
              productoId: productoMovimientoId,
              cantidad: Number(cantidadMovimiento),
            }
          : {
              cantidad: Number(cantidadMovimiento),
            };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al guardar movimiento");
        return;
      }

      alert(
        tipoMovimiento === "venta"
          ? "Venta registrada correctamente"
          : "Inventario repuesto correctamente"
      );

      setProductoMovimientoId("");
      setCantidadMovimiento("");
      setTipoMovimiento("venta");
      setSeccionActiva("inventario");

      obtenerProductos();
      obtenerVentas();
      obtenerReposiciones();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar movimiento");
    }
  };

  const guardarReposicion = async () => {
    if (!productoReposicionId) {
      alert("Selecciona un producto para reponer");
      return;
    }

    if (cantidadReposicion === "" || Number(cantidadReposicion) <= 0) {
      alert("La cantidad a reponer debe ser mayor a 0");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/productos/${productoReposicionId}/reponer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cantidad: Number(cantidadReposicion),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al reponer inventario");
        return;
      }

      alert("Inventario repuesto correctamente");

      setProductoReposicionId("");
      setCantidadReposicion("");

      obtenerProductos();
      obtenerReposiciones();
    } catch (error) {
      console.error("Error al reponer inventario:", error);
      alert("Error al reponer inventario");
    }
  };

  const cancelarMovimiento = () => {
    setProductoMovimientoId("");
    setCantidadMovimiento("");
    setTipoMovimiento("venta");
    setSeccionActiva("inventario");
  };

  useEffect(() => {
  if (token) {
    obtenerProductos();
    obtenerVentas();
    obtenerReposiciones();
  }
}, [token]);

  //si no hay token
  
  if (!token) {
    return (
      <div
        style={{
          padding: "20px",
          maxWidth: "420px",
          margin: "60px auto",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >

      <h1 style={{ color: "#222", marginBottom: "5px" }}>
        Inventario Inteligente
      </h1>

      <p style={{ color: "#555", marginBottom: "30px" }}>
        Control moderno para tu negocio
      </p>

        <hr />

        <h2>Login</h2>
        <form onSubmit={iniciarSesion}>
          <input
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <br /><br />

          <input
            type="password"
            placeholder="Contraseña"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <br /><br />

          <button
            type="submit"
            style={{
              backgroundColor: "#0d6efd",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Iniciar sesión
          </button>
        </form>

        <h2>Registro</h2>
        <form onSubmit={registrarUsuario}>
          <input
            placeholder="Nombre"
            value={regNombre}
            onChange={(e) => setRegNombre(e.target.value)}
          />
          <br /><br />

          <input
            placeholder="Email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
          />
          <br /><br />

          <input
            type="password"
            placeholder="Contraseña"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
          />
          <br /><br />

          <button
            type="submit"
            style={{
              backgroundColor: "#0d6efd",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Registrar
          </button>
        </form>

      </div>
    );
  }

  //Si hay token

  const productosFiltrados = productos
    .filter((producto) => {
      const coincideBusqueda = producto.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      const stockProducto = Number(producto.stock);

      if (filtroStock === "bajo") {
        return (
          coincideBusqueda && 
          stockProducto <= Number(producto.stockMinimo || 5)
        );
      }

      if (filtroStock === "agotado") {
        return coincideBusqueda && stockProducto === 0;
      }

      return coincideBusqueda;
    })
    .sort((a, b) => {
      if (orden === "nombre") {
        return a.nombre.localeCompare(b.nombre);
      }

      if (orden === "stockMayor") {
        return Number(b.stock) - Number(a.stock);
      }

      if (orden === "stockMenor") {
        return Number(a.stock) - Number(b.stock);
      }

      if (orden === "precioMayor") {
        return Number(b.precio) - Number(a.precio);
      }

      if (orden === "precioMenor") {
        return Number(a.precio) - Number(b.precio);
      }

      return Number(a.stock) - Number(b.stock);
    });
  const totalProductos = productos.length;

  const stockTotal = productos.reduce(
    (total, producto) => total + Number(producto.stock),
    0
  );

  const stockBajo = productos.filter(
    (producto) => Number(producto.stock) <= Number(producto.stockMinimo || 5)
  ).length;

  const valorInvertidoInventario = productos.reduce(
    (total, producto) =>
      total +
      (Number(producto.precio || 0) + Number(producto.costoEnvio || 0)) *
        Number(producto.stock || 0),
    0
  );

  const valorPotencialVenta = productos.reduce(
    (total, producto) =>
      total + Number(producto.precioVenta || 0) * Number(producto.stock || 0),
    0
  );

  const utilidadPotencialInventario =
    valorPotencialVenta - valorInvertidoInventario;
    const productosAgotados = productos.filter(
      (producto) => Number(producto.stock) === 0
    ).length;

  const productoPrioritario = productos.length > 0
    ? [...productos].sort(
        (a, b) => Number(a.stock) - Number(b.stock)
      )[0]
    : null;

  const alertas = [];

  if (productosAgotados > 0) {
    alertas.push(`🚫 ${productosAgotados} producto(s) agotado(s). Requieren atención inmediata.`);
  }

  if (stockBajo > 0) {
    alertas.push(`⚠️ ${stockBajo} producto(s) con stock bajo. Conviene revisar reposición.`);
  }

  if (productoPrioritario && Number(productoPrioritario.stock) <= Number(productoPrioritario.stockMinimo || 5)) {
    alertas.push(
      `📌 Prioridad de reposición: ${productoPrioritario.nombre} tiene solo ${productoPrioritario.stock} unidad(es).`
    );
  }

  const productoMovimientoSeleccionado = productos.find(
    (producto) => producto._id === productoMovimientoId
  );

  const stockDespuesMovimiento =
    productoMovimientoSeleccionado && cantidadMovimiento
      ? Number(productoMovimientoSeleccionado.stock) - Number(cantidadMovimiento)
      : null;

  const mensajeAlerta =
    alertas.length > 0
      ? alertas
      : [];

  const ventasFiltradas = ventas
    .filter((venta) => {
      if (!filtroFechaVenta) return true;

      const fechaVenta = new Date(venta.createdAt).toISOString().split("T")[0];

      return fechaVenta === filtroFechaVenta;
    })
    .sort((a, b) => {
      if (ordenVentas === "ingresoMayor") {
        return Number(b.ingresoTotal) - Number(a.ingresoTotal);
      }

      if (ordenVentas === "ingresoMenor") {
        return Number(a.ingresoTotal) - Number(b.ingresoTotal);
      }

      if (ordenVentas === "utilidadMayor") {
        return Number(b.utilidad) - Number(a.utilidad);
      }

      if (ordenVentas === "utilidadMenor") {
        return Number(a.utilidad) - Number(b.utilidad);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const ingresosFiltrados = ventasFiltradas.reduce(
    (total, venta) => total + Number(venta.ingresoTotal),
    0
  );

  const utilidadFiltrada = ventasFiltradas.reduce(
    (total, venta) => total + Number(venta.utilidad),
    0
  );

  const reposicionesFiltradas = reposiciones.filter((reposicion) => {
    if (!filtroFechaReposicion) return true;

    const fechaReposicion = new Date(reposicion.createdAt)
      .toISOString()
      .split("T")[0];

    return fechaReposicion === filtroFechaReposicion;
  });

  const costosFiltrados = ventasFiltradas.reduce(
    (total, venta) => total + Number(venta.costoTotal),
    0
  );

  const datosGraficaVentas = Object.values(
    ventasFiltradas.reduce((acc, venta) => {
      const fechaObj = new Date(venta.createdAt);

      const fecha = `${fechaObj.getFullYear()}-${String(
        fechaObj.getMonth() + 1
      ).padStart(2, "0")}-${String(fechaObj.getDate()).padStart(2, "0")}`;
      if (!acc[fecha]) {
        acc[fecha] = {
          fecha,
          ingresos: 0,
          utilidad: 0,
        };
      }

      acc[fecha].ingresos += Number(venta.ingresoTotal);
      acc[fecha].utilidad += Number(venta.utilidad);

      return acc;
    }, {})
  ).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const resumenProductos = Object.values(
    ventas.reduce((acc, venta) => {
      const nombre = venta.nombreProducto;

      if (!acc[nombre]) {
        acc[nombre] = {
          nombre,
          cantidad: 0,
          ingresos: 0,
          utilidad: 0,
        };
      }

      acc[nombre].cantidad += Number(venta.cantidad);
      acc[nombre].ingresos += Number(venta.ingresoTotal);
      acc[nombre].utilidad += Number(venta.utilidad);

      return acc;
    }, {})
  );

  const productoMasVendido = resumenProductos.sort(
    (a, b) => b.cantidad - a.cantidad
  )[0];

  const productoMayorUtilidad = resumenProductos.sort(
    (a, b) => b.utilidad - a.utilidad
  )[0];

  const topProductos = [...resumenProductos]
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 3);

  const recomendaciones = [];

  productos.forEach((producto) => {
    const ventasProducto = ventas.filter(
      (v) => v.nombreProducto === producto.nombre
    );

    const totalVendido = ventasProducto.reduce(
      (total, v) => total + Number(v.cantidad),
      0
    );

    const utilidadProducto = ventasProducto.reduce(
      (total, v) => total + Number(v.utilidad),
      0
    );

    if (
      totalVendido >= 10 &&
      Number(producto.stock) <= Number(producto.stockMinimo || 5)
    ) {
      recomendaciones.push({
        tipo: "critico",
        mensaje: `${producto.nombre}: alta demanda y bajo stock. Reposición urgente.`,
      });
    }

    const diasDesdeCreacion =
      (new Date() - new Date(producto.createdAt)) / (1000 * 60 * 60 * 24);

    if (totalVendido === 0 && diasDesdeCreacion >= 7) {
      recomendaciones.push({
        tipo: "medio",
        mensaje: `${producto.nombre}: lleva 7 días o más sin ventas. Revisar estrategia.`,
      });
    }

    if (utilidadProducto > 500) {
      recomendaciones.push({
        tipo: "bajo",
        mensaje: `${producto.nombre}: genera alta utilidad. Priorizar disponibilidad.`,
      });
    }
  });

  const prioridadOrden = {
    critico: 1,
    medio: 2,
    bajo: 3,
  };

  recomendaciones.sort(
    (a, b) => prioridadOrden[a.tipo] - prioridadOrden[b.tipo]
  );

  return (
    <div
      id = "top"
      style={{
        maxWidth: "1100px",
        margin: "25px auto",
        padding: "22px",
        backgroundColor: "#f8f9fa",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ color: "#333", marginBottom: "10px" }}>
        Bienvenido, {usuario?.name}
      </h2>

      <button
        onClick={cerrarSesion}
        style={{
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          padding: "10px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          float: "right",
        }}
      >
        Cerrar sesión
      </button>

      <h1
        style={{
          color: "#222",
          fontSize: "22px",
          fontWeight: "700",
          marginBottom: "16px",
        }}
      >
        Panel de Inventario
      </h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        {[
          ["inicio", "🏠 Inicio", "top"],
          ["ventas", "🧾 Ventas", "zonaVentas"],          
          ["historial", "📊 Historial", "zonaHistorial"],        
          [
            "registrar",
            editandoId ? "✏️ Editar producto" : "➕ Registrar / Reponer",
            "formularioProducto"
          ],
          ["inventario", "📦 Inventario", "listaProductos"],
        ].map(([clave, texto, destino]) => (
          <button
            key={clave}
            onClick={() => {

              if (editandoId && clave !== "registrar") {
                cancelarEdicion();
              }

              setSeccionActiva(clave);

              document.getElementById(destino)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            style={{
              backgroundColor:
                seccionActiva === clave
                  ? clave === "historial" && tipoHistorial === "reposiciones"
                    ? "#198754"
                    : clave === "registrar" && modoRegistro === "reposicion"
                    ? "#198754"
                    : "#0d6efd"
                  : "white",
              color: seccionActiva === clave ? "white" : "#222",
              border: "1px solid #ddd",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            {texto}
          </button>
        ))}
      </div>

      <div
        id = "zonaAlertas"
        style={{
          display:
            (seccionActiva === "inicio" || seccionActiva === "alertas") &&
            mensajeAlerta.length > 0
              ? "block"
              : "none",          
          backgroundColor:
            productosAgotados > 0 ? "#f8d7da" : stockBajo > 0 ? "#fff3cd" : "#d1e7dd",
          color:
            productosAgotados > 0 ? "#842029" : stockBajo > 0 ? "#664d03" : "#0f5132",
          padding: "12px 16px",
          borderRadius: "10px",
          marginBottom: "20px",
          fontWeight: "600",
        }}
      >
        {mensajeAlerta.length > 0 &&
          mensajeAlerta.map((mensaje, index) => (
          <p
            key={index}
            style={{
              margin: index === 0 ? "0" : "8px 0 0",
            }}
          >
            {mensaje}
          </p>
        ))}
      </div>

      <div
        style={{
          display: seccionActiva === "inicio" ? "block" : "none",
          backgroundColor: "#eef6ff",
          color: "#084298",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
          fontWeight: "600",
        }}
      >
        <h3 style={{ marginTop: 0 }}>🧠 Recomendaciones inteligentes</h3>

        {recomendaciones.length === 0 ? (
          <p>Todo está en buen estado. No hay acciones urgentes.</p>
        ) : (
          recomendaciones.slice(0, 5).map((rec, i) => {
            let colorFondo = "#e7f1ff";
            let colorTexto = "#084298";
            let icono = "ℹ️";

            if (rec.tipo === "critico") {
              colorFondo = "#f8d7da";
              colorTexto = "#842029";
              icono = "🔴";
            }

            if (rec.tipo === "medio") {
              colorFondo = "#fff3cd";
              colorTexto = "#664d03";
              icono = "🟡";
            }

            if (rec.tipo === "bajo") {
              colorFondo = "#d1e7dd";
              colorTexto = "#0f5132";
              icono = "🟢";
            }

            return (
              <div
                key={i}
                style={{
                  backgroundColor: colorFondo,
                  color: colorTexto,
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                {icono} {rec.mensaje}
              </div>
            );
          })
        )}
      </div>

      <div
        style={{
          display: seccionActiva === "inicio" ? "grid" : "none",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            display: seccionActiva === "inicio" ? "grid" : "none",
            backgroundColor: "white",
            padding: "14px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Total de productos
          </p>
          <h2 style={{ margin: "8px 0 0", color: "#222" }}>{totalProductos}</h2>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "14px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Stock total
          </p>
          <h2 style={{ margin: "8px 0 0", color: "#222" }}>{stockTotal}</h2>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "14px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Productos con stock bajo
          </p>
          <h2 style={{ margin: "8px 0 0", color: stockBajo > 0 ? "#dc3545" : "#198754" }}>
            {stockBajo}
          </h2>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "14px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Valor invertido
          </p>
          <h2 style={{ margin: "8px 0 0", color: "#222" }}>
            ${valorInvertidoInventario.toFixed(2)}
          </h2>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "14px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Valor potencial de venta
          </p>
          <h2 style={{ margin: "8px 0 0", color: "#222" }}>
            ${valorPotencialVenta.toFixed(2)}
          </h2>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "14px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Utilidad potencial
          </p>
          <h2
            style={{
              margin: "8px 0 0",
              color: utilidadPotencialInventario >= 0 ? "#198754" : "#dc3545",
            }}
          >
            ${utilidadPotencialInventario.toFixed(2)}
          </h2>
        </div> 
      </div>

      <div
          style={{
            display: seccionActiva === "inicio" ? "grid" : "none",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "10px" }}>
             <p style={{ margin: 0, color: "#666" }}>🥇 Más vendido</p>
             <h3 style={{ margin: "8px 0 0" }}>
              {productoMasVendido?.nombre || "—"}
            </h3>
            <p style={{ margin: 0 }}>
              {productoMasVendido?.cantidad || 0} unidades
            </p>
          </div>

          <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "10px" }}>
            <p style={{ margin: 0, color: "#666" }}>💰 Mayor utilidad</p>
             <h3 style={{ margin: "8px 0 0" }}>
              {productoMayorUtilidad?.nombre || "—"}
             </h3>
            <p style={{ margin: 0 }}>
              ${Number(productoMayorUtilidad?.utilidad || 0).toFixed(2)}
            </p>
           </div>
        </div>  
      
      <div
        style={{
          display:
          seccionActiva === "inicio" &&
          productoPrioritario &&
          Number(productoPrioritario.stock) <= Number(productoPrioritario.stockMinimo || 5)
            ? "block"
            : "none",
          backgroundColor: "white",
          padding: "14px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: "25px",
        }}
      >
        {productoPrioritario ? (
          <>
            <p style={{ display: seccionActiva === "inicio" ? "block" : "none", margin: 0, color: "#666", fontSize: "14px" }}>
              Producto prioritario
            </p>

            <h3 style={{ margin: "8px 0", color: "#222" }}>
              📌 {productoPrioritario.nombre}
            </h3>

            <p style={{ margin: 0, color: "#dc3545", fontWeight: "600" }}>
              Stock actual: {productoPrioritario.stock}
            </p>
          </>
        ) : (
          <p style={{ margin: 0 }}>✅ No hay productos registrados.</p>
        )}
      </div>

      <div
        id="zonaVentas"
        style={{
          display: seccionActiva === "ventas" ? "block" : "none",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginTop: "25px",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#222" }}>
            🧾 Registrar venta
        </h2>
        <p style={{ color: "#666" }}>
          Registra únicamente salidas de inventario por ventas.        </p>

        <p style={{ marginBottom: "6px", fontWeight: "600" }}>
          Producto
        </p>

        <select
          value={productoMovimientoId}
          onChange={(e) => setProductoMovimientoId(e.target.value)}
          style={{
            width: "350px",
            maxWidth: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            marginBottom: "15px",
          }}
        >
          <option value="">Selecciona un producto...</option>

          {productos.map((producto) => (
            <option key={producto._id} value={producto._id}>
              {producto.nombre} — Stock: {producto.stock}
            </option>
          ))}
        </select>

        <p style={{ marginBottom: "6px", fontWeight: "600" }}>
          Cantidad vendida        </p>

        <input
          type="number"
          min="1"
          placeholder="Ejemplo: 2"
          value={cantidadMovimiento}
          onChange={(e) => setCantidadMovimiento(e.target.value)}
          onWheel={(e) => e.target.blur()}
          style={{
            width: "350px",
            maxWidth: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            marginBottom: "15px",
          }}
        />

        <br />

        {productoMovimientoSeleccionado && cantidadMovimiento && (
          <div
            style={{
              backgroundColor:
                stockDespuesMovimiento < 0 ? "#f8d7da" : "#e7f1ff",
              color:
                stockDespuesMovimiento < 0 ? "#842029" : "#084298",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "15px",
              fontWeight: "600",
            }}
          >
            <p style={{ margin: "0 0 6px" }}>
              Producto: {productoMovimientoSeleccionado.nombre}
            </p>

            <p style={{ margin: "0 0 6px" }}>
              Stock actual: {productoMovimientoSeleccionado.stock}
            </p>

            <p style={{ margin: "0 0 6px" }}>
              Cantidad a vender:{cantidadMovimiento}
            </p>

            <p style={{ margin: 0 }}>
              Stock después del movimiento: {stockDespuesMovimiento}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={guardarMovimiento}
          style={{
            backgroundColor: "#198754",
            color: "white",
            border: "none",
            padding: "10px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Registrar venta
        </button>

        <button
          type="button"
          onClick={cancelarMovimiento}
          style={{
            marginLeft: "10px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "10px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Cancelar
        </button>

      </div>

      <div
        id="zonaHistorial"
        style={{
          display: seccionActiva === "historial" ? "block" : "none",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginTop: "25px",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#222" }}>
          📊 Historial
        </h2>

        <div style={{ marginBottom: "15px" }}>
          <button
            type="button"
            onClick={() => setTipoHistorial("ventas")}
            style={{
              backgroundColor: tipoHistorial === "ventas" ? "#0d6efd" : "white",
              color: tipoHistorial === "ventas" ? "white" : "#222",
              border: "1px solid #ddd",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "10px",
              fontWeight: "600",
            }}
          >
            Ventas
          </button>

          <button
            type="button"
            onClick={() => setTipoHistorial("reposiciones")}
            style={{
            backgroundColor:
            tipoHistorial === "reposiciones"
              ? "#198754"
              : "white",              color: tipoHistorial === "reposiciones" ? "white" : "#222",
              border: "1px solid #ddd",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Reposiciones
          </button>
        </div>

        {tipoHistorial === "ventas" ? (
          <>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="date"
                value={filtroFechaVenta}
                onChange={(e) => setFiltroFechaVenta(e.target.value)}
              />

              <select
                value={ordenVentas}
                onChange={(e) => setOrdenVentas(e.target.value)}
                style={{ marginLeft: "10px" }}
              >
                <option value="">Más recientes</option>
                <option value="ingresoMayor">Mayor ingreso</option>
                <option value="ingresoMenor">Menor ingreso</option>
                <option value="utilidadMayor">Mayor utilidad</option>
                <option value="utilidadMenor">Menor utilidad</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "10px" }}>
                <p style={{ margin: 0, color: "#666" }}>Ventas filtradas</p>
                <h3 style={{ margin: "8px 0 0" }}>{ventasFiltradas.length}</h3>
              </div>

              <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "10px" }}>
                <p style={{ margin: 0, color: "#666" }}>Ingresos</p>
                <h3 style={{ margin: "8px 0 0" }}>${ingresosFiltrados.toFixed(2)}</h3>
              </div>

              <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "10px" }}>
                <p style={{ margin: 0, color: "#666" }}>Costos</p>
                <h3 style={{ margin: "8px 0 0" }}>${costosFiltrados.toFixed(2)}</h3>
              </div>

              <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "10px" }}>
                <p style={{ margin: 0, color: "#666" }}>Utilidad</p>
                <h3 style={{ margin: "8px 0 0", color: "#198754" }}>
                  ${utilidadFiltrada.toFixed(2)}
                </h3>
              </div>
            </div>

            {datosGraficaVentas.length > 0 && (
              <div
                style={{
                  width: "100%",
                  height: 320,
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "12px",
                  marginBottom: "25px",
                }}
              >
                <h3 style={{ marginTop: 0, color: "#222" }}>
                  📈 Evolución de ingresos y utilidad por día
                </h3>

                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={datosGraficaVentas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ingresos"
                      name="Ingresos"
                      stroke="#0d6efd"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="utilidad"
                      name="Utilidad"
                      stroke="#198754"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ marginBottom: "10px" }}>📊 Top 3 productos</h3>

              {topProductos.length === 0 ? (
                <p>No hay datos suficientes.</p>
              ) : (
                <div
                  style={{
                    width: "100%",
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      minWidth: "600px",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ padding: "10px", textAlign: "center" }}>Producto</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>Unidades</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>Ingresos</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>Utilidad</th>
                      </tr>
                    </thead>

                    <tbody>
                      {topProductos.map((p, index) => (
                        <tr key={index}>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            {p.nombre}
                          </td>

                          <td style={{ padding: "10px", textAlign: "center" }}>
                            {p.cantidad}
                          </td>

                          <td style={{ padding: "10px", textAlign: "center" }}>
                            ${p.ingresos.toFixed(2)}
                          </td>

                          <td
                            style={{
                              padding: "10px",
                              textAlign: "center",
                              color: "#198754",
                              fontWeight: "600",
                            }}
                          >
                            ${p.utilidad.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <h3 style={{ marginBottom: "10px", color: "#222" }}>
              📄 Historial de ventas
            </h3>

            {ventasFiltradas.length === 0 ? (
              <p>No hay ventas registradas todavía.</p>
            ) : (
              <div
                style={{
                  width: "100%",
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: "850px",
                    borderCollapse: "collapse",
                    marginTop: "15px",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ padding: "10px", textAlign: "center" }}>Producto</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Cantidad</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Ingreso</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Costo</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Utilidad</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Fecha</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ventasFiltradas.map((venta) => (
                      <tr key={venta._id}>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {venta.nombreProducto}
                        </td>

                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {venta.cantidad}
                        </td>

                        <td style={{ padding: "10px", textAlign: "center" }}>
                          ${Number(venta.ingresoTotal).toFixed(2)}
                        </td>

                        <td style={{ padding: "10px", textAlign: "center" }}>
                          ${Number(venta.costoTotal).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: "10px",
                            textAlign: "center",
                            color: "#198754",
                            fontWeight: "700",
                          }}
                        >
                          ${Number(venta.utilidad).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: "10px",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {new Date(venta.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="date"
                value={filtroFechaReposicion}
                onChange={(e) => setFiltroFechaReposicion(e.target.value)}
              />
            </div>

            {reposicionesFiltradas.length === 0 ? (
              <p>No hay reposiciones registradas todavía.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "15px",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ padding: "10px" }}>Producto</th>
                    <th style={{ padding: "10px" }}>Cantidad</th>
                    <th style={{ padding: "10px" }}>Stock antes</th>
                    <th style={{ padding: "10px" }}>Stock después</th>
                    <th style={{ padding: "10px" }}>Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {reposicionesFiltradas.map((reposicion) => (
                    <tr key={reposicion._id}>
                      <td style={{ padding: "10px", textAlign: "center" }}>{reposicion.nombreProducto}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>{reposicion.cantidad}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>{reposicion.stockAntes}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>{reposicion.stockDespues}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        {new Date(reposicion.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      <div
        style={{
          display: seccionActiva === "registrar" ? "block" : "none",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginTop: "25px",
          marginBottom: "25px",
        }}
      >

      {!editandoId && (
        <div style={{ marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setModoRegistro("nuevo")}
            style={{
              backgroundColor: modoRegistro === "nuevo" ? "#0d6efd" : "white",
              color: modoRegistro === "nuevo" ? "white" : "#222",
              border: "1px solid #ddd",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "10px",
              fontWeight: "600",
            }}
          >
            ➕ Nuevo producto
          </button>

          <button
            type="button"
            onClick={() => setModoRegistro("reposicion")}
            style={{
              backgroundColor: modoRegistro === "reposicion" ? "#198754" : "white",
              color: modoRegistro === "reposicion" ? "white" : "#222",
              border: "1px solid #ddd",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            📥 Reponer producto
          </button>
        </div>
      )}

      <h2
        id="formularioProducto"
        style={{
          marginTop: "10px",
          marginBottom: "15px",
          color: "#222",
          fontSize: "22px",
        }}
      >
        {editandoId
          ? "✏️ Editar producto"
          : modoRegistro === "nuevo"
          ? "➕ Registrar nuevo producto"
          : "📥 Reponer inventario"}
      </h2>

      {!editandoId && modoRegistro === "nuevo" && (
        <p style={{ color: "#666" }}>
          Registra un producto nuevo en tu inventario.
        </p>
      )}

      {(editandoId || modoRegistro === "nuevo") && (

      <form
        onSubmit={guardarProducto}
        style={{
        }}
      >
        <p style={{ marginBottom: "6px", fontWeight: "600" }}>
          Nombre del producto
        </p>
        <input
          type="text"
          placeholder="Nombre del producto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{
            width: "350px",
            maxWidth: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <div style={{ height: "14px" }} />

        <p style={{ marginBottom: "6px", fontWeight: "600" }}>
          Descripción del producto
        </p>

        <textarea
          placeholder="Ejemplo: Audífonos Bluetooth, marca X, color negro"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={{
            width: "350px",
            maxWidth: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            minHeight: "80px",
            resize: "vertical",
          }}
        />
        <div style={{ height: "14px" }} />

        <p style={{ marginBottom: "6px", fontWeight: "600" }}>
          Costo del producto
        </p>
        <input
          type="number"
          placeholder="Costo"
          value={precio}
          min="0"
          onChange={(e) => setPrecio(e.target.value)}
          onWheel={(e) => e.target.blur()}
          style={{
            width: "350px",
            maxWidth: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <div style={{ height: "14px" }} />

        <p style={{ marginBottom: "6px", fontWeight: "600" }}>
          Costo de envío/manejo por unidad
        </p>

        <input
          type="number"
          placeholder="Ejemplo: 15"
          value={costoEnvio}
          min="0"
          onChange={(e) => setCostoEnvio(e.target.value)}
          onWheel={(e) => e.target.blur()}
          style={{
            width: "350px",
            maxWidth: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <div style={{ height: "14px" }} />

        <p style={{ marginBottom: "6px", fontWeight: "600" }}>
          Precio de venta
        </p>
        <input
          type="number"
          placeholder="Precio de venta"
          value={precioVenta}
          min="0"
          onChange={(e) => setPrecioVenta(e.target.value)}
          onWheel={(e) => e.target.blur()}
          style={{
            width: "350px",
            maxWidth: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <div style={{ height: "14px" }} />

        {precio !== "" && precioVenta !== "" && (
          <div
            style={{
              backgroundColor:
                Number(precioVenta) < Number(precio) + Number(costoEnvio || 0)
                  ? "#f8d7da"
                  : "#e7f1ff",
              color:
                Number(precioVenta) < Number(precio) + Number(costoEnvio || 0)
                  ? "#842029"
                  : "#084298",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "15px",
              fontWeight: "600",
            }}
          >
            <p style={{ margin: "0 0 6px" }}>
              Costo del producto por unidad: ${Number(precio || 0).toFixed(2)}
            </p>

            <p style={{ margin: "0 0 6px" }}>
              Costo de envío/manejo por unidad: ${Number(costoEnvio || 0).toFixed(2)}
            </p>

            <p style={{ margin: "0 0 6px" }}>
              Costo total unitario: $
              {(Number(precio || 0) + Number(costoEnvio || 0)).toFixed(2)}
            </p>

            <p style={{ margin: 0 }}>
              Utilidad estimada por unidad: $
              {(Number(precioVenta || 0) -
                (Number(precio || 0) + Number(costoEnvio || 0))).toFixed(2)}
            </p>
          </div>
        )}

        {!editandoId && (
          <>
            <p style={{ marginBottom: "6px", fontWeight: "600" }}>
              Stock inicial
            </p>
            <input
              type="number"
              placeholder="Stock inicial"
              value={stock}
              min="0"
              onChange={(e) => setStock(e.target.value)}
              onWheel={(e) => e.target.blur()}
              style={{
                width: "350px",
                maxWidth: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
            />
            <div style={{ height: "14px" }} />
          </>
        )}

        <p style={{ marginBottom: "6px", fontWeight: "600" }}>
          Stock mínimo recomendado
        </p>

        <input
          type="number"
          placeholder="Ejemplo: 5"
          value={stockMinimo}
          min="0"
          onChange={(e) => setStockMinimo(e.target.value)}
          onWheel={(e) => e.target.blur()}
          style={{
            width: "350px",
            maxWidth: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <div style={{ height: "14px" }} />

        <button
          type="submit"
          style={{
            display: "block",
            backgroundColor: "#0d6efd",
            color: "white",
            border: "none",
            padding: "10px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            marginTop: "10px",
          }}
        >
          {editandoId ? "Actualizar producto" : "Guardar producto"}
        </button>

        {editandoId && (
          <button
            type="button"
            onClick={cancelarEdicion}
            style={{
              display:"block",
              marginTop: "10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Cancelar edición
          </button>
        )}
      </form>
      )}

        {!editandoId && modoRegistro === "reposicion" && (
          <>
            <hr style={{ margin: "25px 0" }} />

            <p style={{ color: "#666" }}>
              Agrega unidades a un producto ya registrado.
            </p>

            <p style={{ marginBottom: "6px", fontWeight: "600" }}>
              Producto a reponer
            </p>

            <select
              value={productoReposicionId}
              onChange={(e) => setProductoReposicionId(e.target.value)}
              style={{
                width: "350px",
                maxWidth: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
                marginBottom: "15px",
              }}
            >
              <option value="">Selecciona un producto...</option>

              {productos.map((producto) => (
                <option key={producto._id} value={producto._id}>
                  {producto.nombre} — Stock: {producto.stock}
                </option>
              ))}
            </select>

            <p style={{ marginBottom: "6px", fontWeight: "600" }}>
              Cantidad a reponer
            </p>

            <input
              type="number"
              min="1"
              placeholder="Ejemplo: 10"
              value={cantidadReposicion}
              onChange={(e) => setCantidadReposicion(e.target.value)}
              onWheel={(e) => e.target.blur()}
              style={{
                width: "350px",
                maxWidth: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
                marginBottom: "15px",
              }}
            />

            <br />

            <button
              type="button"
              onClick={guardarReposicion}
              style={{
                backgroundColor: "#198754",
                color: "white",
                border: "none",
                padding: "10px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Guardar reposición
            </button>
          </>
      )}
    </div>

    <div
      style={{
        display: seccionActiva === "inventario" ? "block" : "none",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        marginTop: "25px",
        marginBottom: "25px",
      }}
    >

      <h2
        id="listaProductos"
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          fontSize: "22px",
          color: "#222",
        }}
      >
        📦 Lista de Productos
      </h2>

      <input
        type="text"
        placeholder="Buscar producto por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "350px",
          maxWidth: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
          marginBottom: "20px",
        }}
      />

      <select
        value={orden}
        onChange={(e) => setOrden(e.target.value)}
        style={{
          width: "220px",
          maxWidth: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
          marginBottom: "20px",
          marginLeft: "10px",
        }}
      >
        <option value="">Ordenar por...</option>
        <option value="nombre">Nombre A-Z</option>
        <option value="stockMayor">Mayor stock</option>
        <option value="stockMenor">Menor stock</option>
        <option value="precioMayor">Mayor precio</option>
        <option value="precioMenor">Menor precio</option>
      </select>

      <select
        value={filtroStock}
        onChange={(e) => setFiltroStock(e.target.value)}
        style={{
          width: "220px",
          maxWidth: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
          marginBottom: "20px",
          marginLeft: "10px",
        }}
      >
        <option value="todos">Ver todos</option>
        <option value="bajo">Solo stock bajo</option>
        <option value="agotado">Solo agotados</option>
      </select>

      <p
        style={{
          marginTop: "-5px",
          marginBottom: "15px",
          color: "#666",
          fontSize: "13px",
        }}
      >
        Mostrando {productosFiltrados.length} de {productos.length} productos
      </p>

      {seccionActiva === "inventario" ? (
        productos.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            borderRadius: "12px",
            border: "1px solid #eee",
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ minWidth: "950px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                backgroundColor: "white",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Nombre",
                    "Descripción",
                    "Costo total",
                    "Precio venta",
                    "Utilidad",
                    "Stock",
                    "Recomendación",
                    "Acciones",
                  ].map((titulo) => (
                    <th
                      key={titulo}
                      style={{
                        padding: "12px 10px",
                        backgroundColor: "#f1f3f5",
                        fontWeight: "700",
                        fontSize: "13px",
                        textAlign: "center",
                        color: "#444",
                      }}
                    >
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>

            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  backgroundColor: "white",
                }}
              >
                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        No se encontraron productos.
                      </td>
                    </tr>
                  ) : (
                    productosFiltrados.map((producto) => (
                      <tr key={producto._id}>
                        <td style={{ padding: "10px", textAlign: "left", fontSize: "13px" }}>
                          {producto.nombre}
                        </td>

                        <td style={{ padding: "10px", textAlign: "left", color: "#555", fontSize: "13px" }}>
                          {producto.descripcion || "—"}
                        </td>

                        <td style={{ padding: "10px", textAlign: "center", fontSize: "13px" }}>
                          <strong>
                            ${(Number(producto.precio || 0) + Number(producto.costoEnvio || 0)).toFixed(2)}
                          </strong>
                          <div style={{ color: "#777", fontSize: "11px", marginTop: "4px" }}>
                            Compra: ${Number(producto.precio || 0).toFixed(2)} · Envío: ${Number(producto.costoEnvio || 0).toFixed(2)}
                          </div>
                        </td>

                        <td style={{ padding: "10px", textAlign: "center", fontSize: "13px" }}>
                          ${Number(producto.precioVenta || 0).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: "10px",
                            textAlign: "center",
                            color: "#198754",
                            fontWeight: "700",
                            fontSize: "13px",
                          }}
                        >
                          $
                          {(
                            Number(producto.precioVenta || 0) -
                            (Number(producto.precio || 0) + Number(producto.costoEnvio || 0))
                          ).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: "10px",
                            textAlign: "center",
                            color:
                              Number(producto.stock) <= Number(producto.stockMinimo || 5)
                                ? "#dc3545"
                                : "#198754",
                            fontWeight: "700",
                            fontSize: "13px",
                          }}
                        >
                          {producto.stock}
                        </td>

                        <td style={{ padding: "10px", textAlign: "center", fontWeight: "600", fontSize: "13px" }}>
                          {Number(producto.stock) === 0
                            ? "🚫 Reponer"
                            : Number(producto.stock) <= Number(producto.stockMinimo || 5)
                            ? "⚠️ Bajo"
                            : "✅ Suficiente"}
                        </td>

                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <button
                            onClick={() => {
                              setNombre(producto.nombre);
                              setDescripcion(producto.descripcion || "");
                              setPrecio(producto.precio);
                              setCostoEnvio(producto.costoEnvio || "");
                              setPrecioVenta(producto.precioVenta || "");
                              setStock(producto.stock);
                              setStockMinimo(producto.stockMinimo || "");
                              setEditandoId(producto._id);
                              setSeccionActiva("registrar");

                              setTimeout(() => {
                                document
                                  .getElementById("formularioProducto")
                                  ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                              }, 100);
                            }}
                            style={{
                              backgroundColor: "#0d6efd",
                              color: "white",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => eliminarProducto(producto._id)}
                            style={{
                              marginLeft: "10px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Eliminar
                          </button>

                          <button
                            onClick={() => {
                              setProductoMovimientoId(producto._id);
                              setCantidadMovimiento("");
                              setTipoMovimiento("reposicion");
                              setSeccionActiva("ventas");

                              setTimeout(() => {
                                document.getElementById("zonaVentas")?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }, 100);
                            }}
                            style={{
                              marginLeft: "10px",
                              backgroundColor: "#198754",
                              color: "white",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Reponer
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
            )
      ) : null}
      </div>
    </div>
  );
}

export default App;