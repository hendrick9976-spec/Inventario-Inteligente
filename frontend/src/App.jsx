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

// ======================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// SISTEMA INVENTARIO INTELIGENTE
// ======================================================

function App() {

  // ======================================================
  // ESTADOS GENERALES Y SESIÓN DE USUARIO
  // ======================================================

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null
  );

  // ----------------------
  // PERFIL DE USUARIO
  // Edición de nombre, correo y contraseña
  // ----------------------

  const [perfilNombre, setPerfilNombre] = useState(
    JSON.parse(localStorage.getItem("usuario"))?.name || ""
  );
  const [perfilEmail, setPerfilEmail] = useState(
    JSON.parse(localStorage.getItem("usuario"))?.email || ""
  );
  const [perfilPassword, setPerfilPassword] = useState("");
  const [perfilConfirmarPassword, setPerfilConfirmarPassword] = useState("");

  // ----------------------
  // AUTENTICACIÓN
  // Registro e inicio de sesión
  // ----------------------

  const [regNombre, setRegNombre] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ----------------------
  // INVENTARIO Y PRODUCTOS
  // Lista de productos y formulario principal
  // ----------------------

  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [costoEnvio, setCostoEnvio] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");

  // ----------------------
  // EDICIÓN DE PRODUCTOS
  // Control del modo edición
  // ----------------------

  const [editandoId, setEditandoId] = useState(null);
  const [productoReposicionId, setProductoReposicionId] = useState("");
  const [cantidadReposicion, setCantidadReposicion] = useState("");
  const [modoRegistro, setModoRegistro] = useState("nuevo");

  // ----------------------
  // NAVEGACIÓN DEL DASHBOARD
  // Sidebar y módulos activos
  // ----------------------

  const [seccionActiva, setSeccionActiva] = useState("inicio");

  // ----------------------
  // REGISTRO DE VENTAS Y MOVIMIENTOS
  // Ventas normales y mayoreo
  // ----------------------
  const [productoMovimientoId, setProductoMovimientoId] = useState("");
  const [cantidadMovimiento, setCantidadMovimiento] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("venta");
  const [tipoVentaSeleccionado, setTipoVentaSeleccionado] = useState("detalle");
  const [precioUnitarioNegociado, setPrecioUnitarioNegociado] = useState("");
  const [precioGlobalMayoreo, setPrecioGlobalMayoreo] = useState("");

  // ----------------------
  // HISTORIAL Y REPORTES
  // Ventas, reposiciones y métricas
  // ----------------------

  const [ventas, setVentas] = useState([]);
  const [filtroFechaVenta, setFiltroFechaVenta] = useState("");
  const [ordenVentas, setOrdenVentas] = useState("");
  const [reposiciones, setReposiciones] = useState([]);

  // ----------------------
  // FILTROS Y BÚSQUEDAS
  // Inventario e historial
  // ----------------------

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("");
  const [filtroStock, setFiltroStock] = useState("todos");
  const [busquedaVenta, setBusquedaVenta] = useState("");
  const [busquedaReposicion, setBusquedaReposicion] = useState("");
  const [tipoHistorial, setTipoHistorial] = useState("ventas");
  const [topHistorialActivo, setTopHistorialActivo] = useState("ventas");
  const [filtroFechaReposicion, setFiltroFechaReposicion] = useState("");

  // ======================================================
  // FUNCIONES DE AUTENTICACIÓN
  // Registro, login y cierre de sesión
  // ======================================================

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

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken("");
    setUsuario(null);
  };

  // ======================================================
  // FUNCIÓN DE PERFIL DE USUARIO
  // Actualiza nombre, correo y contraseña
  // ======================================================

  const actualizarPerfil = async (e) => {
    e.preventDefault();

    if (!perfilNombre.trim() || !perfilEmail.trim()) {
      alert("Nombre y correo son obligatorios");
      return;
    }

    if (perfilPassword || perfilConfirmarPassword) {
      if (perfilPassword !== perfilConfirmarPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }

      if (perfilPassword.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: perfilNombre,
          email: perfilEmail,
          password: perfilPassword,
          confirmarPassword: perfilConfirmarPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al actualizar perfil");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(data.user));
      setUsuario(data.user);

      setPerfilPassword("");
      setPerfilConfirmarPassword("");

      alert("Perfil actualizado correctamente");
      setSeccionActiva("inicio");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Error al actualizar perfil");
    }
  };

  // ======================================================
  // FUNCIONES PARA OBTENER DATOS DEL BACKEND
  // Productos, ventas y reposiciones
  // ======================================================

  const obtenerProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/productos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setProductos([]);
        return;
      }

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

      if (!res.ok) {
        setVentas([]);
        return;
      }

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

      if (!res.ok) {
        setReposiciones([]);
        return;
      }

      setReposiciones(data);
    } catch (error) {
      console.error("Error al obtener reposiciones:", error);
    }
  };

  // ======================================================
  // FUNCIONES DE INVENTARIO Y PRODUCTOS
  // Crear, editar, eliminar y cancelar edición
  // ======================================================

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

  // ======================================================
  // FUNCIONES DE VENTAS Y MOVIMIENTOS
  // Registra ventas normales, mayoreo y reposiciones
  // ======================================================

  const guardarMovimiento = async () => {
    if (!productoMovimientoId) {
      alert("Selecciona un producto");
      return;
    }

    if (cantidadMovimiento === "" || Number(cantidadMovimiento) <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    if (
      tipoVentaSeleccionado === "mayoreo" &&
      (precioGlobalMayoreo === "" || Number(precioGlobalMayoreo) < 0)
    ) {
      alert("Ingresa un precio global válido para la venta al mayoreo");
      return;
    }

    if (
      tipoVentaSeleccionado === "detalle" &&
      precioUnitarioNegociado !== "" &&
      Number(precioUnitarioNegociado) < 0
    ) {
      alert("El precio unitario negociado no puede ser negativo");
      return;
    }

    if (tipoMovimiento === "venta" && ventaConPerdida) {
      const confirmado = window.confirm(
        "⚠ Esta venta generará pérdida. ¿Seguro que quieres registrarla?"
      );

      if (!confirmado) {
        return;
      }
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
              tipoVenta: tipoVentaSeleccionado,
              precioUnitarioNegociado:
                tipoVentaSeleccionado === "detalle" &&
                precioUnitarioNegociado !== ""
                  ? Number(precioUnitarioNegociado)
                  : null,
              precioGlobalMayoreo:
                tipoVentaSeleccionado === "mayoreo"
                  ? Number(precioGlobalMayoreo)
                  : null,
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
      setPrecioUnitarioNegociado("");
      setPrecioGlobalMayoreo("");
      setTipoMovimiento("venta");
      setTipoVentaSeleccionado("detalle");
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
    setPrecioUnitarioNegociado("");
    setPrecioGlobalMayoreo("");
    setTipoMovimiento("venta");
    setTipoVentaSeleccionado("detalle");
    setSeccionActiva("inventario");
  };

  // ======================================================
  // CARGA INICIAL DE DATOS
  // Se ejecuta cuando hay sesión activa
  // ======================================================

  useEffect(() => {
  if (token) {
    obtenerProductos();
    obtenerVentas();
    obtenerReposiciones();
  }
}, [token]);

  // ======================================================
  // PANTALLA DE AUTENTICACIÓN
  // Se muestra cuando no hay sesión activa
  // Incluye login y registro de usuario
  // ======================================================
  
  if (!token) {
    return (
      <div
        style={{
          padding: "12px",
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
              padding: "8px 12px",
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
              padding: "8px 12px",
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

  // ======================================================
  // DATOS CALCULADOS CUANDO HAY SESIÓN ACTIVA
  // Filtros, métricas, alertas, ventas e historial
  // ======================================================

  // ----------------------
  // INVENTARIO FILTRADO
  // Búsqueda, ordenamiento y filtros de stock
  // ----------------------

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

      if (orden === "margenMayor") {
        const margenA =
          Number(a.precioVenta || 0) > 0
            ? ((Number(a.precioVenta || 0) -
                (Number(a.precio || 0) + Number(a.costoEnvio || 0))) /
                Number(a.precioVenta || 0)) *
              100
            : 0;

        const margenB =
          Number(b.precioVenta || 0) > 0
            ? ((Number(b.precioVenta || 0) -
                (Number(b.precio || 0) + Number(b.costoEnvio || 0))) /
                Number(b.precioVenta || 0)) *
              100
            : 0;

        return margenB - margenA;
      }

      if (orden === "margenMenor") {
        const margenA =
          Number(a.precioVenta || 0) > 0
            ? ((Number(a.precioVenta || 0) -
                (Number(a.precio || 0) + Number(a.costoEnvio || 0))) /
                Number(a.precioVenta || 0)) *
              100
            : 0;

        const margenB =
          Number(b.precioVenta || 0) > 0
            ? ((Number(b.precioVenta || 0) -
                (Number(b.precio || 0) + Number(b.costoEnvio || 0))) /
                Number(b.precioVenta || 0)) *
              100
            : 0;

        return margenA - margenB;
      }

      return Number(a.stock) - Number(b.stock);
    });

  // ----------------------
  // MÉTRICAS PRINCIPALES DEL DASHBOARD
  // Totales generales y estado del inventario
  // ----------------------

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

  const porcentajeUtilidadPromedioInventario =
    valorPotencialVenta > 0
      ? (utilidadPotencialInventario / valorPotencialVenta) * 100
      : 0;

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

  // ----------------------
  // CÁLCULOS DE VENTAS Y MOVIMIENTOS
  // Simulación de ingresos, costos y utilidad
  // ----------------------

  const productoMovimientoSeleccionado = productos.find(
    (producto) => producto._id === productoMovimientoId
  );

  const stockDespuesMovimiento =
    productoMovimientoSeleccionado && cantidadMovimiento
      ? Number(productoMovimientoSeleccionado.stock) - Number(cantidadMovimiento)
      : null;

  const precioUnitarioUsado =
    precioUnitarioNegociado !== ""
      ? Number(precioUnitarioNegociado)
      : Number(productoMovimientoSeleccionado?.precioVenta || 0);

  const ventaListaParaCalcular =
    productoMovimientoSeleccionado &&
    cantidadMovimiento &&
    (
      tipoVentaSeleccionado === "detalle" ||
      precioGlobalMayoreo !== ""
    );

  const ingresoVentaNormalMovimiento =
    productoMovimientoSeleccionado && cantidadMovimiento
      ? Number(productoMovimientoSeleccionado.precioVenta || 0) *
        Number(cantidadMovimiento || 0)
      : 0;

  const ingresoEstimadoMovimiento =
    ventaListaParaCalcular
      ? tipoVentaSeleccionado === "mayoreo"
        ? Number(precioGlobalMayoreo)
        : precioUnitarioUsado * Number(cantidadMovimiento || 0)
      : 0;

  const costoEstimadoMovimiento =
    productoMovimientoSeleccionado && cantidadMovimiento
      ? (Number(productoMovimientoSeleccionado.precio || 0) +
          Number(productoMovimientoSeleccionado.costoEnvio || 0)) *
        Number(cantidadMovimiento || 0)
      : 0;

  const utilidadEstimadaMovimiento =
    ingresoEstimadoMovimiento - costoEstimadoMovimiento;

  const ventaConPerdida =
    productoMovimientoSeleccionado &&
    cantidadMovimiento &&
    utilidadEstimadaMovimiento < 0;

  const obtenerFechaLocal = (fecha) => {
    const fechaObj = new Date(fecha);

    return `${fechaObj.getFullYear()}-${String(
      fechaObj.getMonth() + 1
    ).padStart(2, "0")}-${String(fechaObj.getDate()).padStart(2, "0")}`;
  };

  const mensajeAlerta =
    alertas.length > 0
      ? alertas
      : [];

  // ----------------------
  // HISTORIAL FILTRADO DE VENTAS
  // Búsquedas, filtros y ordenamiento
  // ----------------------

  const ventasFiltradas = ventas
    .filter((venta) => {
      const coincideNombre = (venta.nombreProducto || "")
        .toLowerCase()
        .includes(busquedaVenta.toLowerCase());

      if (!filtroFechaVenta) return coincideNombre;

      const fechaVenta = obtenerFechaLocal(venta.createdAt);

      return coincideNombre && fechaVenta === filtroFechaVenta;
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

      if (ordenVentas === "margenMayor") {
        const margenA =
          Number(a.ingresoTotal) > 0
            ? (Number(a.utilidad) / Number(a.ingresoTotal)) * 100
            : 0;

        const margenB =
          Number(b.ingresoTotal) > 0
            ? (Number(b.utilidad) / Number(b.ingresoTotal)) * 100
            : 0;

        return margenB - margenA;
      }

      if (ordenVentas === "margenMenor") {
        const margenA =
          Number(a.ingresoTotal) > 0
            ? (Number(a.utilidad) / Number(a.ingresoTotal)) * 100
            : 0;

        const margenB =
          Number(b.ingresoTotal) > 0
            ? (Number(b.utilidad) / Number(b.ingresoTotal)) * 100
            : 0;

        return margenA - margenB;
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

  const margenGlobalVentas =
    ingresosFiltrados > 0
      ? (utilidadFiltrada / ingresosFiltrados) * 100
      : 0;

  // ----------------------
  // HISTORIAL FILTRADO DE REPOSICIONES
  // Filtros y búsqueda de reposiciones
  // ----------------------

  const reposicionesFiltradas = reposiciones.filter((reposicion) => {
    const coincideNombre = (reposicion.nombreProducto || "")
      .toLowerCase()
      .includes(busquedaReposicion.toLowerCase());

    if (!filtroFechaReposicion) return coincideNombre;

    const fechaReposicion = obtenerFechaLocal(reposicion.createdAt);

    return coincideNombre && fechaReposicion === filtroFechaReposicion;
  });

  const costosFiltrados = ventasFiltradas.reduce(
    (total, venta) => total + Number(venta.costoTotal),
    0
  );

  // ----------------------
  // DATOS PARA GRÁFICAS
  // Ventas e ingresos por día
  // ----------------------

  const ventasPorDia = ventas.reduce((acc, venta) => {
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
  }, {});

  const fechasVentas = Object.keys(ventasPorDia).sort();

  let datosGraficaVentas = [];

  const crearFechaLocalDesdeTexto = (fechaTexto) => {
    const [year, month, day] = fechaTexto.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  if (fechasVentas.length > 0) {
    const fechaInicio = crearFechaLocalDesdeTexto(fechasVentas[0]);
    const fechaFin = crearFechaLocalDesdeTexto(fechasVentas[fechasVentas.length - 1]);

    const fechaActual = new Date(fechaInicio);

    while (fechaActual <= fechaFin) {
      const fecha = obtenerFechaLocal(fechaActual);

      datosGraficaVentas.push({
        fecha,
        ingresos: ventasPorDia[fecha]?.ingresos || 0,
        utilidad: ventasPorDia[fecha]?.utilidad || 0,
      });

      fechaActual.setDate(fechaActual.getDate() + 1);
    }
  }

  // ----------------------
  // ANÁLISIS DE PRODUCTOS
  // Productos más vendidos y mayor utilidad
  // ----------------------

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

  const topProductosUtilidad = [...resumenProductos]
    .sort((a, b) => b.utilidad - a.utilidad)
    .slice(0, 3);

  const topProductosMargen = [...resumenProductos]
    .map((p) => ({
      ...p,
      margen:
        p.ingresos > 0
          ? (p.utilidad / p.ingresos) * 100
          : 0,
    }))
    .sort((a, b) => b.margen - a.margen)
    .slice(0, 3);

  // ----------------------
  // RECOMENDACIONES INTELIGENTES
  // Alertas y sugerencias automáticas
  // ----------------------

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

  // ======================================================
  // ESTILOS GENERALES DEL DASHBOARD
  // Sidebar, encabezado, contenido y diseño base
  // ======================================================

  const layoutStyles = {
    appShell: {
      minHeight: "100vh",
      display: "flex",
      backgroundColor: "#f5f7fb",
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: "13px",
      color: "#111827",
    },

    sidebar: {
      width: "240px",
      height: "100vh",
      backgroundColor: "white",
      borderRight: "1px solid #e5e7eb",
      padding: "18px 12px",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 10,
    },

    logoBox: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "0 8px 16px",
      borderBottom: "1px solid #eef0f4",
      marginBottom: "14px",
    },

    logoIcon: {
      width: "34px",
      height: "34px",
      borderRadius: "10px",
      background: "linear-gradient(135deg, #7c3aed, #2563eb)",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      fontWeight: "800",
    },

    userBox: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px 8px",
      marginBottom: "12px",
    },

    avatar: {
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      backgroundColor: "#dbeafe",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#2563eb",
      fontWeight: "800",
    },

    sidebarNav: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },

    sidebarButton: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: "transparent",
      border: "none",
      padding: "9px 12px",
      borderRadius: "9px",
      cursor: "pointer",
      color: "#374151",
      fontSize: "12.5px",
      fontWeight: "600",
      textAlign: "left",
      boxSizing: "border-box",
    },

    sidebarButtonActive: {
      backgroundColor: "#f1ecff",
      color: "#6d28d9",
      boxShadow: "inset 4px 0 0 #7c3aed",
    },
    
    logoutButton: {
      marginTop: "auto",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      backgroundColor: "transparent",
      border: "none",
      color: "#dc2626",
      padding: "9px 12px",
      borderRadius: "9px",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "12.5px",
    },

    mainContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: "240px",
    },

    topbar: {
      minHeight: "74px",
      backgroundColor: "white",
      borderBottom: "1px solid #e5e7eb",
      padding: "24px 42px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxSizing: "border-box",
    },

    pageTitle: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "700",
      color: "#111827",
    },

    pageSubtitle: {
      margin: "4px 0 0",
      color: "#6b7280",
      fontSize: "13px",
      fontWeight: "400",
    },

    contentArea: {
      padding: "12px 42px 26px",
      boxSizing: "border-box",
    },
  };

  // ======================================================
  // FUNCIONES DE NAVEGACIÓN
  // Cambia entre módulos del sistema
  // ======================================================

  const cambiarSeccion = (seccion) => {
    if (editandoId && seccion !== "registrar") {
      cancelarEdicion();
    }

    setSeccionActiva(seccion);
  };

  const opcionMenu = (clave, texto, icono) => (
    <button
      type="button"
      onClick={() => cambiarSeccion(clave)}
      style={{
        ...layoutStyles.sidebarButton,
        ...(seccionActiva === clave ? layoutStyles.sidebarButtonActive : {}),
      }}
    >
      <span>{icono}</span>
      <span>{texto}</span>
    </button>
  );

  // ======================================================
  // TÍTULOS DINÁMICOS DEL ENCABEZADO
  // Cambian según el módulo activo
  // ======================================================

  const tituloSeccion =
    seccionActiva === "perfil"
      ? "Mi Perfil"
      : seccionActiva === "inicio"
      ? "🏠 Inicio"
      : seccionActiva === "inventario"
      ? "📦 Inventario"
      : seccionActiva === "ventas"
      ? "🛒 Ventas"
      : seccionActiva === "historial"
      ? "📊 Historial"
      : editandoId
      ? "Editar Producto"
      : "Agregar Producto";

  const subtituloSeccion =
    seccionActiva === "perfil"
      ? "Configuración de usuario y seguridad"
      : seccionActiva === "inicio"
      ? "Resumen general del negocio"
      : seccionActiva === "inventario"
      ? "Gestiona tus productos y controla tu stock"
      : seccionActiva === "ventas"
      ? "Registra ventas normales o al mayoreo"
      : seccionActiva === "historial"
      ? "Consulta ventas, reposiciones y rendimiento"
      : editandoId
      ? "Actualiza la información del producto seleccionado"
      : "Formulario de productos dentro del módulo de inventario";

  // ======================================================
  // RENDER PRINCIPAL DE LA APLICACIÓN
  // Estructura visual completa del sistema
  // ======================================================

  return (
    <div id="top" style={layoutStyles.appShell}>

      {/* ======================================================
      SIDEBAR LATERAL
      Logo, usuario, navegación y cierre de sesión
      ====================================================== */}

      <aside style={layoutStyles.sidebar}>
        <div style={layoutStyles.logoBox}>
          <div style={layoutStyles.logoIcon}>⚡</div>

          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: "#6d28d9" }}>
              Inventario
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
              Inteligente
            </p>
          </div>
        </div>

        <div
          style={{
            ...layoutStyles.userBox,
            cursor: "pointer",

            backgroundColor:
              seccionActiva === "perfil"
                ? "#f3f0ff"
                : "transparent",

            borderLeft:
              seccionActiva === "perfil"
                ? "4px solid #7c3aed"
                : "4px solid transparent",

            borderRadius: "10px",
            paddingLeft: "10px",
          }}
          onClick={() => setSeccionActiva("perfil")}
        >
          <div style={layoutStyles.avatar}>
            {usuario?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontWeight: "800",
                fontSize: "12.5px",
                color:
                  seccionActiva === "perfil"
                    ? "#7c3aed"
                    : "#111827",
              }}
            >
              {usuario?.name}
            </p>

            <p
              style={{
                margin: "3px 0 0",
                color:
                  seccionActiva === "perfil"
                    ? "#7c3aed"
                    : "#64748b",
                fontSize: "13px",
              }}
            >
              Administrador
            </p>
          </div>
        </div>

        <nav style={layoutStyles.sidebarNav}>
          {opcionMenu("inicio", "Inicio", "🏠")}
          {opcionMenu("inventario", "Inventario", "📦")}
          {opcionMenu("ventas", "Ventas", "🛒")}
          {opcionMenu("historial", "Historial", "📊")}
        </nav>

        <button type="button" onClick={cerrarSesion} style={layoutStyles.logoutButton}>
          <span>↪</span>
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      <main style={layoutStyles.mainContent}>

        {/* ======================================================
        ENCABEZADO SUPERIOR
        Título dinámico y alertas rápidas
        ====================================================== */}

        <header style={layoutStyles.topbar}>
          <div>
            <h1 style={layoutStyles.pageTitle}>{tituloSeccion}</h1>
            <p style={layoutStyles.pageSubtitle}>{subtituloSeccion}</p>
          </div>

          {mensajeAlerta.length > 0 && (
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                fontSize: "20px",
              }}
            >
              🔔
              <span
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "7px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                }}
              >
                {mensajeAlerta.length}
              </span>
            </div>
          )}
        </header>

        <section style={layoutStyles.contentArea}>

      {/* ======================================================
      PANEL DE ALERTAS INTELIGENTES
      Stock bajo, agotados y prioridades
      ====================================================== */}

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

      {/* ======================================================
      MÓDULO DE PERFIL DE USUARIO
      Edición de nombre, correo y contraseña
      ====================================================== */}

      {seccionActiva === "perfil" && (
        <form
          onSubmit={actualizarPerfil}
          style={{
            backgroundColor: "white",
            padding: "18px",
            borderRadius: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #edf0f5",
            maxWidth: "720px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "6px",
              fontSize: "18px",
              color: "#111827",
            }}
          >
            Información del usuario
          </h2>

          <p
            style={{
              marginTop: 0,
              marginBottom: "18px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Actualiza tus datos de usuario. La contraseña solo se cambia si escribes una nueva.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "14px",
              marginBottom: "18px",
            }}
          >
            <div>
              <p style={{ marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>
                Nombre
              </p>

              <input
                type="text"
                value={perfilNombre}
                onChange={(e) => setPerfilNombre(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <p style={{ marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>
                Correo
              </p>

              <input
                type="email"
                value={perfilEmail}
                onChange={(e) => setPerfilEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <p style={{ marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>
                Nueva contraseña
              </p>

              <input
                  type="password"
                  placeholder="Opcional"
                  value={perfilPassword}
                  onChange={(e) => setPerfilPassword(e.target.value)}
                  style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <p style={{ marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>
                Confirmar contraseña
              </p>

              <input
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={perfilConfirmarPassword}
                  onChange={(e) => setPerfilConfirmarPassword(e.target.value)}
                  style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              style={{
                backgroundColor: "#198754",
                color: "white",
                border: "none",
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "500",
                lineHeight: "1",
                cursor: "pointer",
              }}
            >
              Actualizar perfil
            </button>

            <button
              type="button"
              onClick={() => setSeccionActiva("inicio")}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "500",
                lineHeight: "1",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ======================================================
      DASHBOARD PRINCIPAL
      Resumen general del negocio
      ====================================================== */}

      <div
        style={{
          display: seccionActiva === "inicio" ? "block" : "none",
          backgroundColor: "#eef6ff",
          color: "#084298",
          padding: "12px",
          borderRadius: "10px",
          marginBottom: "20px",
          fontWeight: "600",
        }}
      >

        {/* ----------------------
        RECOMENDACIONES INTELIGENTES
        Análisis automático del inventario
        ---------------------- */}

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
                  padding: "8px",
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
          marginBottom: "10px",
        }}
      >

        {/* ----------------------
        MÉTRICAS PRINCIPALES
        Resumen financiero y estado del inventario
        ---------------------- */}

        <div
          style={{
            display: seccionActiva === "inicio" ? "grid" : "none",
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "12.5px" }}>
            Total de productos
          </p>
          <h2 style={{ margin: "8px 0 0", color: "#222" }}>{totalProductos}</h2>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "12.5px" }}>
            Stock total
          </p>
          <h2 style={{ margin: "8px 0 0", color: "#222" }}>{stockTotal}</h2>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "12.5px" }}>
            Productos con stock bajo
          </p>
          <h2 style={{ margin: "8px 0 0", color: stockBajo > 0 ? "#dc3545" : "#198754" }}>
            {stockBajo}
          </h2>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "12.5px" }}>
            Valor invertido
          </p>
          <h2 style={{ margin: "8px 0 0", color: "#222" }}>
            ${valorInvertidoInventario.toFixed(2)}
          </h2>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "12.5px" }}>
            Valor potencial de venta
          </p>
          <h2 style={{ margin: "8px 0 0", color: "#222" }}>
            ${valorPotencialVenta.toFixed(2)}
          </h2>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "12.5px" }}>
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

        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "12.5px" }}>
            Margen promedio inventario
          </p>

          <h2
            style={{
              margin: "8px 0 0",
              color:
                porcentajeUtilidadPromedioInventario < 0
                  ? "#dc3545"
                  : porcentajeUtilidadPromedioInventario < 10
                  ? "#fd7e14"
                  : "#198754",
            }}
          >
            {porcentajeUtilidadPromedioInventario.toFixed(2)}%
          </h2>
        </div>
      </div>

      {/* ----------------------
      PRODUCTOS DESTACADOS
      Más vendido y mayor utilidad
      ---------------------- */}

      <div
          style={{
            display: seccionActiva === "inicio" ? "grid" : "none",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "10px" }}>
             <p style={{ margin: 0, color: "#666" }}>🥇 Más vendido</p>
             <h3 style={{ margin: "8px 0 0" }}>
              {productoMasVendido?.nombre || "—"}
            </h3>
            <p style={{ margin: 0 }}>
              {productoMasVendido?.cantidad || 0} unidades
            </p>
          </div>

          <div style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "10px" }}>
            <p style={{ margin: 0, color: "#666" }}>💰 Mayor utilidad</p>
             <h3 style={{ margin: "8px 0 0" }}>
              {productoMayorUtilidad?.nombre || "—"}
             </h3>
            <p style={{ margin: 0 }}>
              ${Number(productoMayorUtilidad?.utilidad || 0).toFixed(2)}
            </p>
           </div>
        </div>  
      
      {/* ----------------------
      PRODUCTO PRIORITARIO
      Producto con reposición urgente
      ---------------------- */}

      <div
        style={{
          display:
          seccionActiva === "inicio" &&
          productoPrioritario &&
          Number(productoPrioritario.stock) <= Number(productoPrioritario.stockMinimo || 5)
            ? "block"
            : "none",
          backgroundColor: "white",
          padding: "12px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: "25px",
        }}
      >
        {productoPrioritario ? (
          <>
            <p style={{ display: seccionActiva === "inicio" ? "block" : "none", margin: 0, color: "#666", fontSize: "12.5px" }}>
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

      {/* ======================================================
      MÓDULO DE VENTAS
      Ventas normales, mayoreo y simulación financiera
      ====================================================== */}

      <div
        id="zonaVentas"
        style={{
          display: seccionActiva === "ventas" ? "block" : "none",
          backgroundColor: "white",
          padding: "12px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginTop: "0",
          marginBottom: "25px",
        }}
      >

        <div style={{ marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setTipoVentaSeleccionado("detalle")}
            style={{
              backgroundColor:
                tipoVentaSeleccionado === "detalle"
                  ? "#0d6efd"
                  : "white",
              color:
                tipoVentaSeleccionado === "detalle"
                  ? "white"
                  : "#222",
              border: "1px solid #ddd",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "10px",
              fontWeight: "600",
            }}
          >
            🛒 Venta normal
          </button>

          <button
            type="button"
            onClick={() => setTipoVentaSeleccionado("mayoreo")}
            style={{
              backgroundColor:
                tipoVentaSeleccionado === "mayoreo"
                  ? "#fd7e14"
                  : "white",
              color:
                tipoVentaSeleccionado === "mayoreo"
                  ? "white"
                  : "#222",
              border: "1px solid #ddd",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            📦 Venta al mayoreo
          </button>
        </div>

        <p style={{ color: "#666", marginTop: "0", marginBottom: "18px" }}>
          {tipoVentaSeleccionado === "detalle"
            ? "Registra ventas unitarias o por cantidad usando el precio de venta establecido. También puedes indicar un precio negociado si aplica."
            : "Registra ventas al por mayor usando un precio global negociado para toda la operación."}
        </p>

        <p style={{ marginBottom: "6px", fontWeight: "600" }}>
          Producto
        </p>

        <select
          value={productoMovimientoId}
          onChange={(e) => setProductoMovimientoId(e.target.value)}
          style={{
            width: "350px",
            maxWidth: "100%",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "12.5px",
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
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "12.5px",
            marginBottom: "15px",
          }}
        />

        {tipoVentaSeleccionado === "detalle" && productoMovimientoSeleccionado && (
          <>
            <p style={{ marginBottom: "6px", fontWeight: "600" }}>
              Precio unitario negociado opcional
            </p>

            <input
              type="number"
              min="0"
              placeholder={`Precio normal: $${Number(
                productoMovimientoSeleccionado.precioVenta || 0
              ).toFixed(2)}`}
              value={precioUnitarioNegociado}
              onChange={(e) => setPrecioUnitarioNegociado(e.target.value)}
              onWheel={(e) => e.target.blur()}
              style={{
                width: "350px",
                maxWidth: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "12.5px",
                marginBottom: "15px",
              }}
            />
          </>
        )}

        {tipoVentaSeleccionado === "mayoreo" && (
          <>
            <p style={{ marginBottom: "6px", fontWeight: "600" }}>
              Precio global negociado
            </p>

            <input
              type="number"
              min="0"
              placeholder="Ejemplo: 850"
              value={precioGlobalMayoreo}
              onChange={(e) => setPrecioGlobalMayoreo(e.target.value)}
              onWheel={(e) => e.target.blur()}
              style={{
                width: "350px",
                maxWidth: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "12.5px",
                marginBottom: "15px",
              }}
            />
          </>
        )}

        {productoMovimientoSeleccionado && cantidadMovimiento && (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              color: "#333",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "15px",
              fontWeight: "600",
              border: "1px solid #ddd",
            }}
          >
            <h3 style={{ margin: "0 0 10px", color: "#222" }}>
              Referencia con precio normal
            </h3>

            <p style={{ margin: "0 0 6px" }}>
              Ingreso normal: ${ingresoVentaNormalMovimiento.toFixed(2)}
            </p>

            <p style={{ margin: "0 0 6px" }}>
              Costo total: ${costoEstimadoMovimiento.toFixed(2)}
            </p>

            <p style={{ margin: 0, color: "#198754" }}>
              Utilidad normal estimada: $
              {(ingresoVentaNormalMovimiento - costoEstimadoMovimiento).toFixed(2)}
            </p>
          </div>
        )}

        {productoMovimientoSeleccionado && cantidadMovimiento && ventaListaParaCalcular && (
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

            {/* ----------------------
            RESUMEN FINANCIERO DE VENTA
            Cálculo automático de ingresos y utilidad
            ---------------------- */}

            <h3 style={{ margin: "0 0 10px", color: "#084298" }}>
              Resumen de la operación
            </h3>

            <p style={{ margin: "0 0 6px" }}>
              Stock después del movimiento: {stockDespuesMovimiento}
            </p>

            <p style={{ margin: "0 0 6px" }}>
              Ingreso de esta venta: ${ingresoEstimadoMovimiento.toFixed(2)}
            </p>

            {tipoVentaSeleccionado === "mayoreo" && (
              <p style={{ margin: "0 0 6px" }}>
                Ingreso si fuera venta normal: ${ingresoVentaNormalMovimiento.toFixed(2)}
              </p>
            )}

            <p style={{ margin: "0 0 6px" }}>
              Costo total de esta venta: ${costoEstimadoMovimiento.toFixed(2)}
            </p>

            <p
              style={{
                margin: 0,
                color: utilidadEstimadaMovimiento < 0 ? "#dc3545" : "#198754",
                fontWeight: "700",
              }}
            >
              Utilidad real estimada: ${utilidadEstimadaMovimiento.toFixed(2)}
            </p>

            {/* ----------------------
            ALERTA DE VENTA CON PÉRDIDA
            Validación financiera preventiva
            ---------------------- */}

            {ventaConPerdida && (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  color: "#842029",
                  padding: "8px",
                  borderRadius: "8px",
                  marginTop: "10px",
                  fontWeight: "700",
                }}
              >
                ⚠ Advertencia: esta venta generará pérdida.
              </div>
            )}

          </div>
        )}

        <div style={{ height: "10px" }} />

        <button
          type="button"
          onClick={guardarMovimiento}
          style={{
            backgroundColor: "#198754",
            color: "white",
            border: "none",
            padding: "8px 12px",
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
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          Cancelar
        </button>

      </div>

      {/* ======================================================
      MÓDULO DE HISTORIAL
      Ventas, reposiciones y análisis financiero
      ====================================================== */}

      <div
        id="zonaHistorial"
        style={{
          display: seccionActiva === "historial" ? "block" : "none",
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginTop: "0",
          marginBottom: "20px",
        }}
      >

        <div style={{ marginBottom: "15px" }}>
          <button
            type="button"
            onClick={() => setTipoHistorial("ventas")}
            style={{
              backgroundColor: tipoHistorial === "ventas" ? "#0d6efd" : "white",
              color: tipoHistorial === "ventas" ? "white" : "#222",
              border: "1px solid #ddd",
              padding: "9px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "500",
              lineHeight: "1",
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
              padding: "9px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "500",
              lineHeight: "1",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Reposiciones
          </button>
        </div>

        {/* ----------------------
        RESUMEN DE VENTAS
        Tarjetas financieras del historial
        ---------------------- */}

        {tipoHistorial === "ventas" ? (
          <>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "10px" }}>
                <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>Ventas filtradas</p>
                <h3 style={{ margin: "8px 0 0" }}>{ventasFiltradas.length}</h3>
              </div>

              <div style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "10px" }}>
                <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>Ingresos</p>
                <h3 style={{ margin: "8px 0 0" }}>${ingresosFiltrados.toFixed(2)}</h3>
              </div>

              <div style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "10px" }}>
                <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>Costos</p>
                <h3 style={{ margin: "8px 0 0" }}>${costosFiltrados.toFixed(2)}</h3>
              </div>

              <div style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "10px" }}>
                <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>Utilidad</p>
                <h3 style={{ margin: "8px 0 0", color: "#198754" }}>
                  ${utilidadFiltrada.toFixed(2)}
                </h3>
              </div>

              <div style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "10px" }}>
                <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>Margen global</p>

                <h3
                  style={{
                    margin: "8px 0 0",
                    color:
                      margenGlobalVentas < 0
                        ? "#dc3545"
                        : margenGlobalVentas < 10
                        ? "#fd7e14"
                        : "#198754",
                  }}
                >
                  {margenGlobalVentas.toFixed(2)}%
                </h3>
              </div>
            </div>

            {/* ----------------------
            TOP DE PRODUCTOS
            Más vendidos, utilidad y margen
            ---------------------- */}

            <div style={{ marginBottom: "25px" }}>

              {/* ----------------------
              ANÁLISIS DE PRODUCTOS
              Productos más vendidos, utilidad y margen
              ---------------------- */}

              <h3 style={{ marginBottom: "10px" }}>📦 Top 3 productos más vendidos</h3>

              <div style={{ marginBottom: "15px" }}>
                <button
                  type="button"
                  onClick={() => setTopHistorialActivo("ventas")}
                  style={{
                    backgroundColor: topHistorialActivo === "ventas" ? "#0d6efd" : "white",
                    color: topHistorialActivo === "ventas" ? "white" : "#222",
                    border: "1px solid #ddd",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginRight: "8px",
                    fontWeight: "600",
                  }}
                >
                  🛒 Más vendidos por unidad
                </button>

                <button
                  type="button"
                  onClick={() => setTopHistorialActivo("utilidad")}
                  style={{
                    backgroundColor: topHistorialActivo === "utilidad" ? "#198754" : "white",
                    color: topHistorialActivo === "utilidad" ? "white" : "#222",
                    border: "1px solid #ddd",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginRight: "8px",
                    fontWeight: "600",
                  }}
                >
                  💰 Mayor utilidad
                </button>

                <button
                  type="button"
                  onClick={() => setTopHistorialActivo("margen")}
                  style={{
                    backgroundColor: topHistorialActivo === "margen" ? "#fd7e14" : "white",
                    color: topHistorialActivo === "margen" ? "white" : "#222",
                    border: "1px solid #ddd",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  📈 Mayor margen
                </button>
              </div>

              {topProductos.length === 0 ? (
                <p>No hay datos suficientes.</p>
              ) : (
                <div
                  style={{
                    width: "100%",
                    overflowX: "auto",
                  }}
                >

                  {/* ----------------------
                  TABLA DE HISTORIAL DE VENTAS
                  Listado completo de operaciones
                  ---------------------- */}

                  <table
                    style={{
                      width: "100%",
                      minWidth: "700px",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ padding: "8px", textAlign: "center" }}>Producto</th>
                        <th style={{ padding: "8px", textAlign: "center" }}>Unidades</th>
                        <th style={{ padding: "8px", textAlign: "center" }}>Ingresos</th>
                        <th style={{ padding: "8px", textAlign: "center" }}>Utilidad</th>
                        <th style={{ padding: "8px", textAlign: "center" }}>Margen %</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(
                        topHistorialActivo === "utilidad"
                          ? topProductosUtilidad
                          : topHistorialActivo === "margen"
                          ? topProductosMargen
                          : topProductos
                      ).map((p, index) => {
                        const margen =
                          p.ingresos > 0 ? (p.utilidad / p.ingresos) * 100 : 0;

                        return (
                          <tr key={index}>
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {p.nombre}
                            </td>

                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {p.cantidad}
                            </td>

                            <td style={{ padding: "8px", textAlign: "center" }}>
                              ${p.ingresos.toFixed(2)}
                            </td>

                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                color: p.utilidad < 0 ? "#dc3545" : "#198754",
                                fontWeight: "700",
                              }}
                            >
                              ${p.utilidad.toFixed(2)}
                            </td>

                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                color:
                                  margen < 0
                                    ? "#dc3545"
                                    : margen < 10
                                    ? "#fd7e14"
                                    : "#198754",
                                fontWeight: "700",
                              }}
                            >
                              {margen.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {datosGraficaVentas.length > 0 && (
              <div
                style={{
                  width: "100%",
                  height: 320,
                  backgroundColor: "#f8f9fa",
                  padding: "12px",
                  borderRadius: "12px",
                  marginBottom: "25px",
                }}
              >
                <h3 style={{ marginTop: 0, color: "#222" }}>
                  📈 Evolución de ingresos y utilidad por día
                </h3>

                {/* ----------------------
                GRÁFICA FINANCIERA
                Ingresos y utilidad por día
                ---------------------- */}

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

            <h3 style={{ marginBottom: "10px", color: "#222" }}>
              📄 Historial de ventas
            </h3>

            <div style={{ marginBottom: "15px" }}>

              <input
                type="text"
                placeholder="Buscar producto..."
                value={busquedaVenta}
                onChange={(e) => setBusquedaVenta(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  marginRight: "10px",
                }}
              />

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
                <option value="margenMayor">Mayor porcentaje de utilidad</option>
                <option value="margenMenor">Menor porcentaje de utilidad</option>
              </select>
            </div>

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
                      <th style={{ padding: "8px", textAlign: "center" }}>Producto</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Tipo</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Cantidad</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Ingreso</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Costo total</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Utilidad</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Margen %</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Fecha</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ventasFiltradas.map((venta) => (
                      <tr key={venta._id}>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {venta.nombreProducto}
                        </td>

                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {venta.tipoVenta === "mayoreo" ? "Mayoreo" : "Normal"}
                        </td>

                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {venta.cantidad}
                        </td>

                        <td style={{ padding: "8px", textAlign: "center" }}>
                          ${Number(venta.ingresoTotal).toFixed(2)}
                        </td>

                        <td style={{ padding: "8px", textAlign: "center" }}>
                          ${Number(venta.costoTotal).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            color: "#198754",
                            fontWeight: "700",
                          }}
                        >
                          ${Number(venta.utilidad).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            color: Number(venta.utilidad) < 0 ? "#dc3545" : "#198754",
                            fontWeight: "700",
                          }}
                        >
                          {Number(venta.ingresoTotal) > 0
                            ? `${((Number(venta.utilidad) / Number(venta.ingresoTotal)) * 100).toFixed(2)}%`
                            : "0.00%"}
                        </td>

                        <td
                          style={{
                            padding: "8px",
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

            {/* ----------------------
            TABLA DE HISTORIAL DE REPOSICIONES
            Listado de entradas y reposiciones
            ---------------------- */}

            <div style={{ marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="Buscar producto repuesto..."
                value={busquedaReposicion}
                onChange={(e) => setBusquedaReposicion(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  marginRight: "10px",
                }}
              />

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
                    <th style={{ padding: "8px" }}>Producto</th>
                    <th style={{ padding: "8px" }}>Cantidad</th>
                    <th style={{ padding: "8px" }}>Stock antes</th>
                    <th style={{ padding: "8px" }}>Stock después</th>
                    <th style={{ padding: "8px" }}>Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {reposicionesFiltradas.map((reposicion) => (
                    <tr key={reposicion._id}>
                      <td style={{ padding: "8px", textAlign: "center" }}>{reposicion.nombreProducto}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{reposicion.cantidad}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{reposicion.stockAntes}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{reposicion.stockDespues}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
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
          padding: "12px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginTop: "25px",
          marginBottom: "25px",
        }}
      >


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

      {/* ----------------------
      FORMULARIO DE PRODUCTOS
      Crear y editar productos
      ---------------------- */}

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
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "12.5px",
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
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "12.5px",
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
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "12.5px",
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
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "12.5px",
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
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "12.5px",
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
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "12.5px",
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
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "12.5px",
          }}
        />
        <div style={{ height: "14px" }} />

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
            flexWrap: "wrap",
          }}
        >

          <button
            type="submit"
            style={{
              display: "block",
              backgroundColor: editandoId ? "#0d6efd" : "#7c3aed",
              color: "white",
              border: "none",
              padding: "9px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {editandoId ? "Actualizar producto" : "Guardar producto"}
          </button>

        
          <button
            type="button"
            onClick={() => {
              setNombre("");
              setDescripcion("");
              setPrecio("");
              setCostoEnvio("");
              setPrecioVenta("");
              setStock("");
              setStockMinimo("");
              setProductoReposicionId("");
              setCantidadReposicion("");
              setEditandoId(null);
              setModoRegistro("nuevo");
              setSeccionActiva("inventario");
            }}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "9px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            Cancelar
          </button>

        </div>

      </form>
      )}

        {/* ----------------------
        FORMULARIO DE REPOSICIÓN
        Entrada rápida de inventario
        ---------------------- */}

        {!editandoId && modoRegistro === "reposicion" && (
          <>

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
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "12.5px",
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
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "12.5px",
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
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Guardar reposición
            </button>

            <button
              type="button"
              onClick={() => {
                setProductoReposicionId("");
                setCantidadReposicion("");
                setModoRegistro("nuevo");
                setSeccionActiva("inventario");
              }}
              style={{
                marginLeft: "10px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "8x 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              Cancelar
            </button>
          </>
      )}
    </div>

    {/* ======================================================
    MÓDULO DE INVENTARIO
    Listado, filtros y gestión de productos
    ====================================================== */}

    <div
      id="zonaInventario"
      style={{
        display: seccionActiva === "inventario" ? "block" : "none",
        backgroundColor: "white",
        padding: "12px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        marginTop: "0",
        marginBottom: "25px",
      }}
    >

      <div
        id="listaProductos"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginTop: "4px",
          marginBottom: "16px",
        }}
      >

        <button
          type="button"
          onClick={() => {
            cancelarEdicion();
            setModoRegistro("nuevo");
            setSeccionActiva("registrar");
          }}
          style={{
            backgroundColor: "#7c3aed",
            color: "white",
            border: "none",
            padding: "9px 13px",
            borderRadius: "9px",
            cursor: "pointer",
            fontSize: "12.5px",
            fontWeight: "700",
            boxShadow: "0 6px 14px rgba(124, 58, 237, 0.22)",
          }}
        >
          + Agregar producto
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar producto por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "350px",
          maxWidth: "100%",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "12.5px",
          marginBottom: "20px",
        }}
      />

      <select
        value={orden}
        onChange={(e) => setOrden(e.target.value)}
        style={{
          width: "220px",
          maxWidth: "100%",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "12.5px",
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
        <option value="margenMayor">Mayor porcentaje utilidad</option>
        <option value="margenMenor">Menor porcentaje utilidad</option>
      </select>

      <select
        value={filtroStock}
        onChange={(e) => setFiltroStock(e.target.value)}
        style={{
          width: "220px",
          maxWidth: "100%",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "12.5px",
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
          <div style={{ minWidth: "800px" }}>

            {/* ----------------------
            TABLA DE INVENTARIO
            Listado general de productos
            ---------------------- */}

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
                  <th
                    style={{
                      padding: "7px 5px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >                    
                    Nombre
                  </th>

                  <th
                    style={{
                      padding: "7px 5px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >                    
                    Descripción
                  </th>

                  <th
                    style={{
                      padding: "7px 5px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >                    
                    Costo total
                  </th>

                  <th
                    style={{
                      padding: "7px 5px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >                    
                    Precio venta
                  </th>

                  <th
                    style={{
                      padding: "7px 5px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >                    
                    Utilidad
                  </th>

                  <th
                    style={{
                      padding: "7px 5px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >                    
                    Margen %
                  </th>

                  <th
                    style={{
                      padding: "7px 5px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >                    
                    Stock
                  </th>

                  <th
                    style={{
                      padding: "7px 5px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "11x",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >                    
                    Recomendación
                  </th>

                  <th
                    style={{
                      padding: "7px 5px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >                    
                    Acciones
                  </th>
                </tr>
              </thead>
            </table>

            <div
              style={{
                maxHeight: "360px",
                overflowY: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  tableLayout: "fixed",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  backgroundColor: "white",
                }}
              >
                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        style={{
                          padding: "12px",
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
                        <td style={{ padding: "8px", textAlign: "left", fontSize: "13px" }}>
                          {producto.nombre}
                        </td>

                        <td style={{ padding: "8px", textAlign: "left", maxWidth: "120px", wordBreak: "break-word", color: "#555", fontSize: "13px" }}>
                          {producto.descripcion || "—"}
                        </td>

                        <td style={{ padding: "8px", textAlign: "center", fontSize: "13px" }}>
                          
                          ${(Number(producto.precio || 0) + Number(producto.costoEnvio || 0)).toFixed(2)}
                          
                          <div style={{ color: "#777", fontSize: "11px", marginTop: "4px" }}>
                            Compra: ${Number(producto.precio || 0).toFixed(2)} · Envío: ${Number(producto.costoEnvio || 0).toFixed(2)}
                          </div>
                        </td>

                        <td style={{ padding: "8px", textAlign: "center", fontSize: "13px" }}>
                          ${Number(producto.precioVenta || 0).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: "8px",
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
                            padding: "8px",
                            textAlign: "center",
                            color:
                              Number(producto.precioVenta || 0) > 0 &&
                              ((Number(producto.precioVenta || 0) -
                                (Number(producto.precio || 0) + Number(producto.costoEnvio || 0))) /
                                Number(producto.precioVenta || 0)) *
                                100 < 0
                                ? "#dc3545"
                                : ((Number(producto.precioVenta || 0) -
                                    (Number(producto.precio || 0) + Number(producto.costoEnvio || 0))) /
                                    Number(producto.precioVenta || 0)) *
                                    100 < 10
                                ? "#fd7e14"
                                : "#198754",
                            fontWeight: "700",
                            fontSize: "13px",
                          }}
                        >
                          {Number(producto.precioVenta || 0) > 0
                            ? `${(
                                ((Number(producto.precioVenta || 0) -
                                  (Number(producto.precio || 0) + Number(producto.costoEnvio || 0))) /
                                  Number(producto.precioVenta || 0)) *
                                100
                              ).toFixed(2)}%`
                            : "0.00%"}
                        </td>

                        <td
                          style={{
                            padding: "8px",
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

                        <td style={{ padding: "8px", textAlign: "center", fontWeight: "600", fontSize: "13px" }}>
                          {Number(producto.stock) === 0
                            ? "🚫 Reponer"
                            : Number(producto.stock) <= Number(producto.stockMinimo || 5)
                            ? "⚠️ Bajo"
                            : "✅ Suficiente"}
                        </td>

                        {/* ----------------------
                        ACCIONES DE PRODUCTO
                        Editar, eliminar y reponer inventario
                        ---------------------- */}

                        <td style={{ padding: "8px", textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            justifyContent: "center",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
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
                              padding: "5px 7px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "10px",
                            }}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => eliminarProducto(producto._id)}
                            style={{
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              padding: "5px 7px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "10px",
                            }}
                          >
                            Eliminar
                          </button>

                          <button
                            onClick={() => {
                              setModoRegistro("reposicion");
                              setProductoReposicionId(producto._id);
                              setCantidadReposicion("");
                              setSeccionActiva("registrar");

                              setTimeout(() => {
                                document.getElementById("formularioProducto")?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }, 100);
                            }}
                            style={{
                              backgroundColor: "#198754",
                              color: "white",
                              border: "none",
                              padding: "5px 7px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "10px",
                            }}
                          >
                            Reponer
                          </button>
                        </div>
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
        </section>
      </main>
    </div>
  );
}

export default App;