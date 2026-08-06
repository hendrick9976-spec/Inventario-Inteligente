import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const STORE_URL = import.meta.env.VITE_STORE_URL || "http://localhost:5174";

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
    JSON.parse(localStorage.getItem("usuario")) || null,
  );

  // ----------------------
  // PERFIL DE USUARIO
  // Edición de nombre, correo y contraseña
  // ----------------------

  const [perfilNombre, setPerfilNombre] = useState(
    JSON.parse(localStorage.getItem("usuario"))?.name || "",
  );
  const [perfilEmail, setPerfilEmail] = useState(
    JSON.parse(localStorage.getItem("usuario"))?.email || "",
  );
  const [perfilPassword, setPerfilPassword] = useState("");
  const [perfilConfirmarPassword, setPerfilConfirmarPassword] = useState("");

  // ----------------------
  // CONFIGURACIÓN DE TIENDA WEB
  // ----------------------
  const [configTienda, setConfigTienda] = useState({
    nombreTienda: "Mi Tienda",
    mensajeBanner: "¡Especial de Verano!",
    descripcionBanner:
      "Lleva los mejores artículos al mejor precio por tiempo limitado.",
    correoTienda: "",
    whatsappTienda: "",
    politicaReembolso: "",
    terminosServicio: "",
    preguntasFrecuentes: [],
  });

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

  const [inventarioExpandido, setInventarioExpandido] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);

  // VARIABLES DEL TICKET (Faltaban estas)
  const [ticketAbierto, setTicketAbierto] = useState(false);
  const [datosTicket, setDatosTicket] = useState(null);
  const [diasGarantia, setDiasGarantia] = useState(7);
  const [ventaConfirmada, setVentaConfirmada] = useState(false); // NUEVO ESTADO DE CONFIRMACIÓN

  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState(null);
  const [precio, setPrecio] = useState("");
  const [costoEnvio, setCostoEnvio] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [precioOferta, setPrecioOferta] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [mostrarOpcionesProducto, setMostrarOpcionesProducto] = useState(false);

  // ESTADOS PARA CATEGORÍAS
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState("");

  // ----------------------
  // GENERADOR DE PEDIDOS (WHATSAPP)
  // ----------------------
  const [modalPedidoAbierto, setModalPedidoAbierto] = useState(false);
  const [itemsPedido, setItemsPedido] = useState([]);
  const [busquedaExtra, setBusquedaExtra] = useState("");

  // ----------------------
  // EDICIÓN DE PRODUCTOS
  // Control del modo edición
  // ----------------------

  const [editandoId, setEditandoId] = useState(null);
  const [productoReposicionId, setProductoReposicionId] = useState("");
  const [cantidadReposicion, setCantidadReposicion] = useState("");
  const [modoRegistro, setModoRegistro] = useState("nuevo");
  const [cantidadesMasivas, setCantidadesMasivas] = useState({});

  // ----------------------
  // NAVEGACIÓN DEL DASHBOARD
  // Sidebar y módulos activos
  // ----------------------

  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  // ----------------------
  // REGISTRO DE VENTAS Y MOVIMIENTOS
  // Ventas normales y mayoreo
  // ----------------------
  const [productoMovimientoId, setProductoMovimientoId] = useState("");
  const [cantidadMovimiento, setCantidadMovimiento] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("venta");
  const [subSeccionVentas, setSubSeccionVentas] = useState("fisicas"); // <--- NUEVO ESTADO PARA PESTAÑAS
  const [tipoVentaSeleccionado, setTipoVentaSeleccionado] = useState("detalle");
  const [precioUnitarioNegociado, setPrecioUnitarioNegociado] = useState("");
  const [precioGlobalMayoreo, setPrecioGlobalMayoreo] = useState("");
  const [porcentajeDescuento, setPorcentajeDescuento] = useState("");
  const [clienteVenta, setClienteVenta] = useState("");
  const [proveedorReposicion, setProveedorReposicion] = useState("");
  const [proveedorProductoNuevo, setProveedorProductoNuevo] = useState("");
  const [mostrarOpcionesVenta, setMostrarOpcionesVenta] = useState(false);

  // ----------------------
  // HISTORIAL Y REPORTES
  // Ventas, reposiciones y métricas
  // ----------------------

  const [ventas, setVentas] = useState([]);
  const [filtroFechaVenta, setFiltroFechaVenta] = useState("");
  const [fechaInicioGrafica, setFechaInicioGrafica] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 9); // Hace 9 días (para mostrar 10 días contando hoy)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [fechaFinGrafica, setFechaFinGrafica] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [ordenVentas, setOrdenVentas] = useState("");
  const [reposiciones, setReposiciones] = useState([]);
  const [datosOrigenVentas, setDatosOrigenVentas] = useState([]);

  // ----------------------
  // FILTROS Y BÚSQUEDAS
  // Inventario e historial
  // ----------------------

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("");
  const [filtroStock, setFiltroStock] = useState("todos");
  const [busquedaVenta, setBusquedaVenta] = useState("");
  const [filtroCategoriaHistorial, setFiltroCategoriaHistorial] =
    useState("todas");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [busquedaReposicion, setBusquedaReposicion] = useState("");
  const [tipoHistorial, setTipoHistorial] = useState("ventas");
  const [topHistorialActivo, setTopHistorialActivo] = useState("ventas");
  const [filtroFechaReposicion, setFiltroFechaReposicion] = useState("");
  const [origenSeleccionadoPie, setOrigenSeleccionadoPie] = useState(null);
  const [categoriaSeleccionadaPie, setCategoriaSeleccionadaPie] =
    useState(null);

  // ----------------------
  // GESTOR DE OFERTAS
  // ----------------------
  const [tipoOferta, setTipoOferta] = useState("categoria"); // "categoria" o "producto"
  const [objetivoOfertaId, setObjetivoOfertaId] = useState("");
  const [porcentajeOferta, setPorcentajeOferta] = useState("");
  const [subSeccionTienda, setSubSeccionTienda] = useState("diseno"); // "diseno" o "ofertas"

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

  const obtenerCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/categorias`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setCategorias([]);
        return;
      }
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
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

  const obtenerDatosOrigen = async () => {
    try {
      // Asegúrate de que la ruta coincida con cómo registraste el endpoint en Node
      const res = await fetch(`${API_URL}/ventas/dashboard/origen`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setDatosOrigenVentas([]);
        return;
      }

      setDatosOrigenVentas(data);
    } catch (error) {
      console.error("Error al obtener el consolidado de origen:", error);
    }
  };

  const cambiarEstadoVenta = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/ventas/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        obtenerVentas(); // Refresca la tabla automáticamente
      } else {
        alert("Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cancelarPedidoWeb = async (id) => {
    const confirmado = window.confirm(
      "¿Seguro que deseas cancelar este pedido? El stock retenido volverá a estar disponible en tu tienda de inmediato.",
    );
    if (!confirmado) return;

    try {
      const res = await fetch(`${API_URL}/api/ventas/${id}/cancelar`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        obtenerVentas(); // Quita el pedido de la pantalla
        obtenerProductos(); // Actualiza los numeritos de stock
        alert("Pedido cancelado. El stock ha sido liberado.");
      } else {
        alert("Error al cancelar el pedido");
      }
    } catch (error) {
      console.error("Error:", error);
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

    // Stock obligatorio
    if (!editandoId && stock === "") {
      alert(
        "El stock inicial es obligatorio. Si es un producto nuevo que aún no llega, coloca 0 explícitamente.",
      );
      return;
    }

    // Precio de venta es obligatorio
    if (precioVenta === "" || Number(precioVenta) < 0) {
      alert("El precio de venta es obligatorio y debe ser mayor o igual a 0");
      return;
    }

    // Costo del producto ya es opcional (solo valida si escribe algo)
    if (precio !== "" && Number(precio) < 0) {
      alert("El costo del producto no puede ser negativo");
      return;
    }

    if (costoEnvio !== "" && Number(costoEnvio) < 0) {
      alert("El costo de envío/manejo no puede ser negativo");
      return;
    }

    const costoTotalUnitario = Number(precio || 0) + Number(costoEnvio || 0);

    // Solo lanza alerta de pérdida si realmente registró costos
    if (costoTotalUnitario > 0 && Number(precioVenta) < costoTotalUnitario) {
      alert(
        "El precio de venta no puede ser menor que el costo total unitario",
      );
      return;
    }

    // 3. Regla del stock mínimo: Si lo deja en blanco, asume 1
    const stockMinimoCalculado = stockMinimo === "" ? 1 : Number(stockMinimo);

    // === LÓGICA DE CATEGORÍAS ANTES DE GUARDAR EL PRODUCTO ===
    let idCategoriaFinal = categoriaId;

    if (creandoCategoria) {
      const nombreLimpio = nombreNuevaCategoria.trim();

      if (!nombreLimpio) {
        alert("Escribe el nombre de la nueva categoría");
        return;
      }

      // 1. Buscamos si ya existe una categoría con ese nombre (ignorando mayúsculas/minúsculas)
      const categoriaExistente = categorias.find(
        (cat) => cat.nombre.toLowerCase() === nombreLimpio.toLowerCase(),
      );

      if (categoriaExistente) {
        // Si ya existe, atrapamos su ID y nos saltamos la creación
        idCategoriaFinal = categoriaExistente._id;
      } else {
        // 2. Si realmente no existe, entonces sí hacemos el fetch al backend para crearla
        try {
          const resCat = await fetch(`${API_URL}/categorias`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nombre: nombreLimpio }),
          });
          const dataCat = await resCat.json();
          if (!resCat.ok) {
            alert(dataCat.error || "Error al crear la categoría");
            return;
          }
          idCategoriaFinal = dataCat._id;
          setCategorias([...categorias, dataCat]); // Actualizamos la lista local
        } catch (error) {
          console.error("Error:", error);
          alert("Error de conexión al crear la categoría");
          return;
        }
      }
    } else if (!idCategoriaFinal && !editandoId) {
      alert("Por favor selecciona o crea una categoría para el producto.");
      return;
    }
    // ==========================================================
    if (editandoId) {
      const confirmado = window.confirm(
        "¿Seguro que quieres actualizar este producto?",
      );
      if (!confirmado) return;

      // 1. Actualizamos los datos de texto (JSON)
      const res = await fetch(`${API_URL}/productos/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          precio: Number(precio || 0),
          costoEnvio: Number(costoEnvio || 0),
          precioVenta: Number(precioVenta),
          precioOferta: Number(precioOferta || 0),
          stockMinimo: stockMinimoCalculado,
          categoria: idCategoriaFinal,
        }),
      });

      // 2. Si el dueño seleccionó una nueva foto, disparamos la ruta de imagen
      if (res.ok && foto) {
        const formDataFoto = new FormData();
        formDataFoto.append("foto", foto);

        await fetch(`${API_URL}/productos/${editandoId}/foto`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // FormData va sin Content-Type
          },
          body: formDataFoto,
        });
      }

      setEditandoId(null);
      setSeccionActiva("inventario");
    } else {
      // Para producto NUEVO, empaquetamos todo en FormData
      const formDataNuevo = new FormData();
      formDataNuevo.append("nombre", nombre.trim());
      formDataNuevo.append(
        "descripción",
        descripcion ? descripcion.trim() : "",
      );
      formDataNuevo.append("precio", Number(precio || 0));
      formDataNuevo.append("costoEnvio", Number(costoEnvio || 0));
      formDataNuevo.append("precioVenta", Number(precioVenta));
      formDataNuevo.append("precioOferta", Number(precioOferta || 0));
      formDataNuevo.append("stock", Number(stock || 0));
      formDataNuevo.append("stockMinimo", stockMinimoCalculado);
      formDataNuevo.append("proveedorInicial", proveedorProductoNuevo || "");
      formDataNuevo.append("categoria", idCategoriaFinal);
      if (foto) {
        formDataNuevo.append("foto", foto);
      }

      const res = await fetch(`${API_URL}/productos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // FormData va sin Content-Type
        },
        body: formDataNuevo,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al crear producto");
        return;
      }
      alert("Producto agregado correctamente");
    }

    // Limpiar el formulario
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setCostoEnvio("");
    setPrecioVenta("");
    setPrecioOferta("");
    setStock("");
    setStockMinimo("");
    setProveedorProductoNuevo("");
    setCategoriaId("");
    setFoto(null);
    setCreandoCategoria(false);
    setNombreNuevaCategoria("");

    obtenerProductos();
  };

  const eliminarProducto = async (id) => {
    const confirmado = window.confirm(
      "¿Seguro que quieres eliminar este producto?",
    );
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
    setCategoriaId(""); // <--- AÑADIR
    setCreandoCategoria(false); // <--- AÑADIR
    setNombreNuevaCategoria(""); // <--- AÑADIR
    setFoto(null);
    setEditandoId(null);
    setSeccionActiva("inventario");
  };

  // ======================================================
  // FUNCIONES DEL GESTOR DE OFERTAS
  // ======================================================
  const aplicarOferta = async (e) => {
    e.preventDefault();
    if (!objetivoOfertaId || !porcentajeOferta) {
      alert("Por favor selecciona un objetivo y un porcentaje válido.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/tienda/ofertas/aplicar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo: tipoOferta,
          objetivoId: objetivoOfertaId,
          porcentaje: porcentajeOferta,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.mensaje);
        setPorcentajeOferta("");
        setObjetivoOfertaId("");
        obtenerProductos(); // Recargamos para ver los nuevos precios
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al aplicar la oferta.");
    }
  };

  const quitarOferta = async (tipo, objetivoId = null) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas retirar la(s) oferta(s)? Los precios volverán a la normalidad.",
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/api/tienda/ofertas/quitar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo, objetivoId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.mensaje);
        obtenerProductos(); // Recargamos para ver los precios restaurados
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al retirar la oferta.");
    }
  };

  // ======================================================
  // GENERADOR DE PEDIDOS PARA PROVEEDORES
  // ======================================================

  const abrirGeneradorPedido = () => {
    // 1. Filtrar los productos que ya necesitan reposición (Agotados o bajos)
    const productosBajos = productos.filter(
      (p) => Number(p.stock) <= Number(p.stockMinimo || 5),
    );

    // 2. Armar la lista inicial
    const itemsIniciales = productosBajos.map((p) => ({
      id: p._id,
      nombre: p.nombre,
      descripcion: p.descripcion || "", // <--- NUEVO
      stockActual: Number(p.stock),
      cantidad: "", // Empieza vacío para que él decida cuánto pedir
    }));

    setItemsPedido(itemsIniciales);
    setBusquedaExtra("");
    setModalPedidoAbierto(true);
  };

  const actualizarCantidadPedido = (id, cantidad) => {
    setItemsPedido((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad } : item)),
    );
  };

  const agregarProductoExtraAlPedido = (producto) => {
    // Evitar duplicados en la lista
    if (!itemsPedido.find((item) => item.id === producto._id)) {
      setItemsPedido([
        ...itemsPedido,
        {
          id: producto._id,
          nombre: producto.nombre,
          descripcion: producto.descripcion || "", // <--- NUEVO
          stockActual: Number(producto.stock),
          cantidad: "",
        },
      ]);
    }
    setBusquedaExtra("");
  };

  const eliminarItemPedido = (id) => {
    setItemsPedido((prev) => prev.filter((item) => item.id !== id));
  };

  const copiarPedidoWhatsapp = () => {
    // Solo tomar los que tengan una cantidad escrita mayor a 0
    const itemsValidos = itemsPedido.filter(
      (item) => item.cantidad !== "" && Number(item.cantidad) > 0,
    );

    if (itemsValidos.length === 0) {
      alert("Ingresa al menos una cantidad para generar el pedido.");
      return;
    }

    let texto = "📦 *Pedido de Mercancía*\n\n";
    itemsValidos.forEach((item) => {
      // Si tiene descripción, la agregamos al mensaje
      const detalle = item.descripcion ? ` (${item.descripcion})` : "";
      texto += `▪️ ${item.cantidad}x ${item.nombre}${detalle}\n`;
    });

    navigator.clipboard
      .writeText(texto)
      .then(() => {
        alert(
          "¡Lista copiada! Ya puedes ir a WhatsApp y pegarla al proveedor. 📱",
        );
        setModalPedidoAbierto(false);
      })
      .catch((err) => {
        console.error("Error al copiar: ", err);
        alert("Hubo un error al copiar el texto.");
      });
  };

  // ======================================================
  // FUNCIONES DE VENTAS Y MOVIMIENTOS
  // Registra ventas normales, mayoreo y reposiciones
  // ======================================================

  const guardarMovimiento = async (e) => {
    if (e) e.preventDefault();
    if (!productoMovimientoId) {
      alert("Selecciona un producto");
      return;
    }
    if (cantidadMovimiento === "" || Number(cantidadMovimiento) <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    // --- VALIDACIÓN DE STOCK ---
    const prodVerificar = productos.find((p) => p._id === productoMovimientoId);
    if (
      prodVerificar &&
      Number(cantidadMovimiento) > Number(prodVerificar.stock)
    ) {
      alert(
        `⚠️ Stock insuficiente: Solo tienes ${prodVerificar.stock} unidades de ${prodVerificar.nombre}.`,
      );
      return;
    }

    if (precioUnitarioNegociado !== "" && Number(precioUnitarioNegociado) < 0) {
      alert("El precio unitario negociado no puede ser negativo");
      return;
    }

    if (tipoMovimiento === "venta") {
      // Calculamos el ingreso total: Si puso un precio negociado, usamos ese; si no, multiplicamos.
      const ingresoEstimado =
        precioUnitarioNegociado !== ""
          ? Number(precioUnitarioNegociado)
          : Number(prodVerificar.precioVenta) * Number(cantidadMovimiento);

      const costoTotal =
        (Number(prodVerificar.precio) + Number(prodVerificar.costoEnvio || 0)) *
        Number(cantidadMovimiento);

      if (ingresoEstimado - costoTotal < 0) {
        const confirmado = window.confirm(
          "⚠ Esta venta generará pérdida. ¿Seguro que quieres registrarla?",
        );
        if (!confirmado) return;
      }

      // --- PRE-VENTA: SOLO ABRIR TICKET ---
      setDatosTicket({
        producto: prodVerificar.nombre,
        cantidad: cantidadMovimiento,
        monto: ingresoEstimado,
        fecha: new Date().toLocaleString(),
      });
      setVentaConfirmada(false);
      setTicketAbierto(true);
      return;
    }

    // --- FLUJO ORIGINAL PARA REPOSICIÓN (tipoMovimiento !== "venta") ---
    try {
      const res = await fetch(
        `${API_URL}/productos/${productoMovimientoId}/reponer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cantidad: Number(cantidadMovimiento),
            proveedor: proveedorReposicion,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al guardar movimiento");
        return;
      }

      alert("¡Inventario repuesto correctamente! 📥");
      setProductoMovimientoId("");
      setCantidadMovimiento("");
      setProveedorReposicion("");
      setTipoMovimiento("venta");
      obtenerProductos();
      obtenerReposiciones();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar movimiento");
    }
  };

  // === NUEVA FUNCIÓN: CONFIRMAR Y DESCONTAR STOCK DESDE EL TICKET ===
  const confirmarVentaFinal = async () => {
    try {
      const res = await fetch(`${API_URL}/ventas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productoId: productoMovimientoId,
          cantidad: Number(cantidadMovimiento),
          tipoVenta: "detalle", // Ya todo es venta normal/detalle
          precioUnitarioNegociado:
            precioUnitarioNegociado !== ""
              ? Number(precioUnitarioNegociado) / Number(cantidadMovimiento)
              : null,
          cliente: clienteVenta,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al procesar la venta");
        return;
      }

      // Si todo sale bien, marcamos como confirmada y refrescamos bases de datos
      setVentaConfirmada(true);
      obtenerProductos();
      obtenerVentas();
      obtenerDatosOrigen();

      // Lanzamos la alerta nativa que ya usas en el resto del sistema
      alert("¡Venta registrada satisfactoriamente! 🎉");

      // Limpiamos la pantalla trasera de ventas
      setProductoMovimientoId("");
      setCantidadMovimiento("");
      setPrecioUnitarioNegociado("");
      setPrecioGlobalMayoreo("");
      setPorcentajeDescuento("");
      setTipoVentaSeleccionado("detalle");
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión al confirmar la venta");
    }
  };

  const guardarReposicion = async (e) => {
    if (e) e.preventDefault();
    if (!productoReposicionId) {
      alert("Selecciona un producto para reponer");
      return;
    }

    if (cantidadReposicion === "" || Number(cantidadReposicion) <= 0) {
      alert("La cantidad a reponer debe ser mayor a 0");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/productos/${productoReposicionId}/reponer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cantidad: Number(cantidadReposicion),
            proveedor: proveedorReposicion,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al reponer inventario");
        return;
      }

      alert("¡Inventario repuesto correctamente! 📥");

      setProductoReposicionId("");
      setCantidadReposicion("");
      setProveedorReposicion("");

      obtenerProductos();
      obtenerReposiciones();
    } catch (error) {
      console.error("Error al reponer inventario:", error);
      alert("Error al reponer inventario");
    }
  };

  const guardarReposicionMasiva = async (e) => {
    e.preventDefault();

    // Filtramos solo los productos a los que el usuario les escribió un número mayor a 0
    const itemsAReponer = Object.entries(cantidadesMasivas).filter(
      ([id, cant]) => Number(cant) > 0,
    );

    if (itemsAReponer.length === 0) {
      alert("Ingresa al menos una cantidad para reponer.");
      return;
    }

    try {
      // Promise.all enviará todas las reposiciones al backend simultáneamente
      await Promise.all(
        itemsAReponer.map(([id, cant]) =>
          fetch(`${API_URL}/productos/${id}/reponer`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cantidad: Number(cant),
              proveedor: proveedorReposicion, // El mismo proveedor global para todo este lote
            }),
          }),
        ),
      );

      alert("¡Inventario repuesto masivamente! 📥✅");
      setCantidadesMasivas({});
      setProveedorReposicion("");
      setSeccionActiva("inventario");
      obtenerProductos();
      obtenerReposiciones();
    } catch (error) {
      console.error("Error en reposición masiva:", error);
      alert("Hubo un error al procesar algunas reposiciones.");
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
      obtenerDatosOrigen();
      obtenerCategorias();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/tienda/config`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setConfigTienda({
              nombreTienda: data.nombreTienda || "",
              mensajeBanner: data.mensajeBanner || "",
              descripcionBanner: data.descripcionBanner || "",
              correoTienda: data.correoTienda || "", // <-- NUEVO
              whatsappTienda: data.whatsappTienda || "",
              politicaReembolso: data.politicaReembolso || "",
              terminosServicio: data.terminosServicio || "",
              preguntasFrecuentes: data.preguntasFrecuentes || [], // <-- NUEVO
            });
          }
        })
        .catch((err) => console.error("Error cargando config:", err));
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
          <br />
          <br />

          <input
            type="password"
            placeholder="Contraseña"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <br />
          <br />

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
          <br />
          <br />

          <input
            placeholder="Email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
          />
          <br />
          <br />

          <input
            type="password"
            placeholder="Contraseña"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
          />
          <br />
          <br />

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
      const terminoBusqueda = busqueda.toLowerCase();
      const coincideNombre = producto.nombre
        .toLowerCase()
        .includes(terminoBusqueda);
      const coincideDesc = producto.descripcion
        ? producto.descripcion.toLowerCase().includes(terminoBusqueda)
        : false;

      const coincideBusqueda = coincideNombre || coincideDesc;
      const stockProducto = Number(producto.stock);

      if (filtroStock === "bajo") {
        return (
          coincideBusqueda && stockProducto <= Number(producto.stockMinimo || 5)
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
    0,
  );

  const stockBajo = productos.filter(
    (producto) => Number(producto.stock) <= Number(producto.stockMinimo || 5),
  ).length;

  const valorInvertidoInventario = productos.reduce(
    (total, producto) =>
      total +
      (Number(producto.precio || 0) + Number(producto.costoEnvio || 0)) *
        Number(producto.stock || 0),
    0,
  );

  const valorPotencialVenta = productos.reduce(
    (total, producto) =>
      total + Number(producto.precioVenta || 0) * Number(producto.stock || 0),
    0,
  );

  const utilidadPotencialInventario =
    valorPotencialVenta - valorInvertidoInventario;
  const productosAgotados = productos.filter(
    (producto) => Number(producto.stock) === 0,
  ).length;

  const porcentajeUtilidadPromedioInventario =
    valorPotencialVenta > 0
      ? (utilidadPotencialInventario / valorPotencialVenta) * 100
      : 0;

  const productoPrioritario =
    productos.length > 0
      ? [...productos].sort((a, b) => Number(a.stock) - Number(b.stock))[0]
      : null;

  const obtenerFechaLocal = (fecha) => {
    const fechaObj = new Date(fecha);

    return `${fechaObj.getFullYear()}-${String(
      fechaObj.getMonth() + 1,
    ).padStart(2, "0")}-${String(fechaObj.getDate()).padStart(2, "0")}`;
  };

  // ----------------------
  // CIERRE DE CAJA (Ventas de Hoy)
  // ----------------------
  const hoy = new Date();
  const fechaHoyLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  const ventasDeHoy = ventas.filter(
    (venta) => obtenerFechaLocal(venta.createdAt) === fechaHoyLocal,
  );

  const ingresosDeHoy = ventasDeHoy.reduce(
    (total, venta) => total + Number(venta.ingresoTotal),
    0,
  );

  const cantidadVentasHoy = ventasDeHoy.length;

  // ----------------------
  // CÁLCULOS DE VENTAS Y MOVIMIENTOS
  // Simulación de ingresos, costos y utilidad
  // ----------------------

  const productoMovimientoSeleccionado = productos.find(
    (producto) => producto._id === productoMovimientoId,
  );

  const stockDespuesMovimiento =
    productoMovimientoSeleccionado && cantidadMovimiento
      ? Number(productoMovimientoSeleccionado.stock) -
        Number(cantidadMovimiento)
      : null;

  const precioUnitarioUsado =
    precioUnitarioNegociado !== ""
      ? Number(precioUnitarioNegociado)
      : Number(productoMovimientoSeleccionado?.precioVenta || 0);

  const ventaListaParaCalcular =
    productoMovimientoSeleccionado && cantidadMovimiento;

  const ingresoVentaNormalMovimiento =
    productoMovimientoSeleccionado && cantidadMovimiento
      ? Number(productoMovimientoSeleccionado.precioVenta || 0) *
        Number(cantidadMovimiento || 0)
      : 0;

  const ingresoEstimadoMovimiento = ventaListaParaCalcular
    ? precioUnitarioNegociado !== ""
      ? Number(precioUnitarioNegociado)
      : Number(productoMovimientoSeleccionado?.precioVenta || 0) *
        Number(cantidadMovimiento || 0)
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

  // ----------------------
  // HISTORIAL FILTRADO DE VENTAS
  // Búsquedas, filtros y ordenamiento
  // ----------------------

  const ventasFiltradas = ventas
    .filter((venta) => venta.estado !== "En proceso")
    .filter((venta) => {
      // 1. Buscamos el producto original para poder leer su descripción
      const productoDeVenta = productos.find((p) => p._id === venta.productoId);

      // 2. Comparamos lo escrito con el nombre o la descripción
      const terminoBusqueda = busquedaVenta.toLowerCase();
      const coincideNombre = (venta.nombreProducto || "")
        .toLowerCase()
        .includes(terminoBusqueda);
      const coincideDesc = productoDeVenta?.descripcion
        ? productoDeVenta.descripcion.toLowerCase().includes(terminoBusqueda)
        : false;
      const coincideBusquedaPrincipal = coincideNombre || coincideDesc;

      const coincideCliente = (venta.cliente || "")
        .toLowerCase()
        .includes(filtroCliente.toLowerCase());

      const idCategoriaVenta =
        productoDeVenta?.categoria?._id || productoDeVenta?.categoria;
      const coincideCategoria =
        filtroCategoriaHistorial === "todas" ||
        idCategoriaVenta === filtroCategoriaHistorial;

      if (!filtroFechaVenta)
        return (
          coincideBusquedaPrincipal && coincideCliente && coincideCategoria
        );

      const fechaVenta = obtenerFechaLocal(venta.createdAt);
      return (
        coincideNombre &&
        coincideCliente &&
        coincideCategoria &&
        fechaVenta === filtroFechaVenta
      );
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
    0,
  );

  const utilidadFiltrada = ventasFiltradas.reduce(
    (total, venta) => total + Number(venta.utilidad),
    0,
  );

  const margenGlobalVentas =
    ingresosFiltrados > 0 ? (utilidadFiltrada / ingresosFiltrados) * 100 : 0;

  // ----------------------
  // HISTORIAL FILTRADO DE REPOSICIONES
  // Filtros y búsqueda de reposiciones
  // ----------------------

  const reposicionesFiltradas = reposiciones.filter((reposicion) => {
    const coincideNombre = (reposicion.nombreProducto || "")
      .toLowerCase()
      .includes(busquedaReposicion.toLowerCase());
    const coincideProveedor = (reposicion.proveedor || "")
      .toLowerCase()
      .includes(filtroProveedor.toLowerCase()); // NUEVO

    if (!filtroFechaReposicion) return coincideNombre && coincideProveedor;

    const fechaReposicion = obtenerFechaLocal(reposicion.createdAt);
    return (
      coincideNombre &&
      coincideProveedor &&
      fechaReposicion === filtroFechaReposicion
    );
  });

  const costosFiltrados = ventasFiltradas.reduce(
    (total, venta) => total + Number(venta.costoTotal),
    0,
  );

  // ----------------------
  // DATOS PARA GRÁFICAS
  // Ventas e ingresos por día
  // ----------------------

  const ventasPorDia = ventas.reduce((acc, venta) => {
    const fechaObj = new Date(venta.createdAt);

    const fecha = `${fechaObj.getFullYear()}-${String(
      fechaObj.getMonth() + 1,
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

  const crearFechaLocalDesdeTexto = (fechaTexto) => {
    const [year, month, day] = fechaTexto.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  let datosGraficaVentas = [];

  if (fechaInicioGrafica && fechaFinGrafica) {
    const fechaActual = crearFechaLocalDesdeTexto(fechaInicioGrafica);
    const fechaFin = crearFechaLocalDesdeTexto(fechaFinGrafica);

    // Seguridad: Asegurar que inicio no sea mayor que fin y limitar a 365 días máx para que no colapse
    if (fechaActual <= fechaFin) {
      let contadorDias = 0;
      while (fechaActual <= fechaFin && contadorDias <= 365) {
        const fechaFormateada = obtenerFechaLocal(fechaActual);

        datosGraficaVentas.push({
          fecha: fechaFormateada,
          ingresos: ventasPorDia[fechaFormateada]?.ingresos || 0,
          utilidad: ventasPorDia[fechaFormateada]?.utilidad || 0,
        });

        fechaActual.setDate(fechaActual.getDate() + 1);
        contadorDias++;
      }
    }
  }

  // ----------------------
  // DATOS PARA GRÁFICA CIRCULAR INTERACTIVA (3 NIVELES)
  // ----------------------
  let tituloGraficoPie = "🌐 Distribución de Ingresos: Web vs Local";
  let datosGraficoPie = [];

  if (!origenSeleccionadoPie) {
    // NIVEL 1: Web vs Local
    const agrupadoOrigen = ventasFiltradas.reduce((acc, venta) => {
      const origen = venta.origenVenta === "Web" ? "Web" : "Local";
      if (!acc[origen]) acc[origen] = { name: origen, id: origen, value: 0 };
      acc[origen].value += Number(venta.ingresoTotal);
      return acc;
    }, {});
    datosGraficoPie = Object.values(agrupadoOrigen).filter((o) => o.value > 0);
  } else if (!categoriaSeleccionadaPie) {
    // NIVEL 2: Categorías (dentro del Origen seleccionado)
    tituloGraficoPie = `📂 Categorías en Ventas ${origenSeleccionadoPie === "Web" ? "Web" : "Locales"}`;
    const agrupadoCategorias = ventasFiltradas
      .filter(
        (v) =>
          (v.origenVenta === "Web" ? "Web" : "Local") === origenSeleccionadoPie,
      )
      .reduce((acc, venta) => {
        const prod = productos.find((p) => p._id === venta.productoId);
        const idCat =
          typeof prod?.categoria === "object"
            ? prod?.categoria?._id
            : prod?.categoria;
        const nombreCat =
          categorias.find((c) => c._id === idCat)?.nombre || "Sin Categoría";

        if (!acc[idCat]) acc[idCat] = { name: nombreCat, id: idCat, value: 0 };
        acc[idCat].value += Number(venta.ingresoTotal);
        return acc;
      }, {});
    datosGraficoPie = Object.values(agrupadoCategorias).filter(
      (c) => c.value > 0,
    );
  } else {
    // NIVEL 3: Productos (dentro de Categoría y Origen)
    const nombreCat =
      categorias.find((c) => c._id === categoriaSeleccionadaPie)?.nombre ||
      "Sin Categoría";
    tituloGraficoPie = `📦 Productos de ${nombreCat} (${origenSeleccionadoPie})`;
    const agrupadoProductos = ventasFiltradas
      .filter(
        (v) =>
          (v.origenVenta === "Web" ? "Web" : "Local") === origenSeleccionadoPie,
      )
      .filter((v) => {
        const prod = productos.find((p) => p._id === v.productoId);
        const idCat =
          typeof prod?.categoria === "object"
            ? prod?.categoria?._id
            : prod?.categoria;
        return idCat === categoriaSeleccionadaPie;
      })
      .reduce((acc, venta) => {
        if (!acc[venta.nombreProducto]) {
          acc[venta.nombreProducto] = {
            name: venta.nombreProducto,
            id: venta.productoId,
            value: 0,
          };
        }
        acc[venta.nombreProducto].value += Number(venta.ingresoTotal);
        return acc;
      }, {});
    datosGraficoPie = Object.values(agrupadoProductos).filter(
      (p) => p.value > 0,
    );
  }

  // ----------------------
  // ANÁLISIS DE PRODUCTOS
  // Productos más vendidos y mayor utilidad
  // ----------------------

  const resumenProductos = Object.values(
    ventas
      .filter((venta) => {
        // NUEVO: Que los "Top" también respeten el filtro de categoría
        if (filtroCategoriaHistorial === "todas") return true;
        const productoDeVenta = productos.find(
          (p) => p._id === venta.productoId,
        );
        const idCategoriaVenta =
          productoDeVenta?.categoria?._id || productoDeVenta?.categoria;
        return idCategoriaVenta === filtroCategoriaHistorial;
      })
      .reduce((acc, venta) => {
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
      }, {}),
  );

  const productoMasVendido = resumenProductos.sort(
    (a, b) => b.cantidad - a.cantidad,
  )[0];

  const productoMayorUtilidad = resumenProductos.sort(
    (a, b) => b.utilidad - a.utilidad,
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
      margen: p.ingresos > 0 ? (p.utilidad / p.ingresos) * 100 : 0,
    }))
    .sort((a, b) => b.margen - a.margen)
    .slice(0, 3);

  // ----------------------
  // AVISOS Y RECOMENDACIONES (Lógica agrupada)
  // ----------------------
  const recomendaciones = [];
  const nombresProductosBajos = [];

  // === NUEVA REGLA AZUL: Pedidos Web Pendientes ===
  const pedidosWebPendientes = ventas.filter((v) => v.estado === "En proceso");
  if (pedidosWebPendientes.length > 0) {
    recomendaciones.push({
      tipo: "pedido_web",
      icono: "🌐",
      mensaje: `¡Tienes ${pedidosWebPendientes.length} pedido(s) web pendiente(s) por atender!`,
      accion: "ir_a_pedidos_web",
    });
  }

  productos.forEach((producto) => {
    const stockNum = Number(producto.stock);
    const stockMin = Number(producto.stockMinimo || 5);

    // REGLA ROJA: Se acabó el stock (Se mantienen individuales por urgencia)
    if (stockNum === 0) {
      recomendaciones.push({
        tipo: "critico",
        icono: "🔴",
        mensaje: `${producto.nombre}: Se acabó. Repón de inmediato.`,
        productoId: producto._id,
      });
    }
    // REGLA AMARILLA: Queda poco stock -> Los mandamos a la lista de espera
    else if (stockNum <= stockMin) {
      nombresProductosBajos.push(producto.nombre);
    }
  });

  // Si hubo productos bajos, creamos UN SOLO aviso amarillo
  if (nombresProductosBajos.length > 0) {
    recomendaciones.push({
      tipo: "medio",
      icono: "🟡",
      mensaje: `Tienes ${nombresProductosBajos.length} producto(s) con inventario bajo: ${nombresProductosBajos.join(", ")}.`,
      productoId: "aviso-agrupado", // Este ID simulado permite que el botón "Pedir 📋" siga funcionando
    });
  }

  // ======================================================
  // ESTILOS GENERALES DEL DASHBOARD
  // Sidebar, encabezado, contenido y diseño base
  // ======================================================

  const esMovil = window.innerWidth <= 768;

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
      height: "100dvh",
      overflowY: "auto",
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
      transform:
        esMovil && !sidebarAbierto ? "translateX(-100%)" : "translateX(0)",

      transition: "0.3s ease",
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
      gap: "12px",
      backgroundColor: "#fef2f2",
      border: "none",
      color: "#dc2626",
      padding: "9px 12px",
      borderRadius: "9px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "12.5px",
      textAlign: "left",
      boxSizing: "border-box",
      boxShadow: "inset 4px 0 0 #dc2626",
    },

    mainContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: esMovil ? "0" : "240px",
    },

    topbar: {
      minHeight: "74px",
      backgroundColor: "white",
      borderBottom: "1px solid #e5e7eb",
      padding: esMovil ? "18px 16px" : "24px 42px",
      gap: "8x",
      display: "flex",
      justifyContent: "flex-start",
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
      padding: esMovil ? "12px 14px 22px" : "12px 42px 26px",
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

    if (esMovil) {
      setSidebarAbierto(false);
    }
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
      : seccionActiva === "tienda"
        ? "🌐 Mi Tienda en Línea"
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
      : seccionActiva === "tienda"
        ? "Personaliza el aspecto de tu escaparate digital y obtén tu enlace" // <-- NUEVO
        : seccionActiva === "inicio"
          ? "Resumen general del negocio"
          : seccionActiva === "inventario"
            ? "Gestiona tus productos y controla tu stock"
            : seccionActiva === "ventas"
              ? "Registra ventas físicas o web"
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
        <div>
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
                seccionActiva === "perfil" ? "#f3f0ff" : "transparent",

              borderLeft:
                seccionActiva === "perfil"
                  ? "4px solid #7c3aed"
                  : "4px solid transparent",

              borderRadius: "10px",
              paddingLeft: "10px",
            }}
            onClick={() => cambiarSeccion("perfil")}
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
                  color: seccionActiva === "perfil" ? "#7c3aed" : "#111827",
                }}
              >
                {usuario?.name}
              </p>

              <p
                style={{
                  margin: "3px 0 0",
                  color: seccionActiva === "perfil" ? "#7c3aed" : "#64748b",
                  fontSize: "13px",
                }}
              >
                Administrador
              </p>
            </div>
          </div>

          <nav style={layoutStyles.sidebarNav}>
            {opcionMenu("inicio", "Inicio", "🏠")}
            {opcionMenu("tienda", "Mi Tienda Web", "🌐")}
            {opcionMenu("inventario", "Inventario", "📦")}
            {opcionMenu("ventas", "Ventas", "🛒")}
            {opcionMenu("historial", "Historial", "📊")}
          </nav>
        </div>
        <button
          type="button"
          onClick={cerrarSesion}
          style={layoutStyles.logoutButton}
        >
          <span>↪</span>
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {esMovil && sidebarAbierto && (
        <div
          onClick={() => setSidebarAbierto(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 5,
          }}
        />
      )}

      <main style={layoutStyles.mainContent}>
        {/* ======================================================
        ENCABEZADO SUPERIOR
        Título dinámico y alertas rápidas
        ====================================================== */}

        <header style={layoutStyles.topbar}>
          {esMovil && (
            <button
              onClick={() => setSidebarAbierto(!sidebarAbierto)}
              style={{
                background: "none",
                border: "none",
                fontSize: "28px",
                cursor: "pointer",
                marginRight: "12px",
              }}
            >
              ☰
            </button>
          )}

          <div
            style={{
              marginLeft: esMovil ? "0px" : "0",
            }}
          >
            <h1 style={layoutStyles.pageTitle}>{tituloSeccion}</h1>
            <p style={layoutStyles.pageSubtitle}>{subtituloSeccion}</p>
          </div>

          {recomendaciones.length > 0 && (
            <div
              onClick={() => cambiarSeccion("inicio")} // NUEVO: Te lleva al inicio
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
                cursor: "pointer", // NUEVO: Muestra la manito al pasar el mouse
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
                {recomendaciones.length}
              </span>
            </div>
          )}
        </header>

        <section style={layoutStyles.contentArea}>
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
                Actualiza tus datos de usuario. La contraseña solo se cambia si
                escribes una nueva.
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
                  <p
                    style={{
                      marginBottom: "6px",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
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
                  <p
                    style={{
                      marginBottom: "6px",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
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
                  <p
                    style={{
                      marginBottom: "6px",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
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
                  <p
                    style={{
                      marginBottom: "6px",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
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
          MÓDULO DE MI TIENDA EN LÍNEA (CMS)
          ====================================================== */}
          {seccionActiva === "tienda" && (
            <div style={{ maxWidth: "800px" }}>
              {/* Botones superiores (Pestañas de la Tienda) */}
              <div
                style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
              >
                <button
                  type="button"
                  onClick={() => setSubSeccionTienda("diseno")}
                  style={{
                    backgroundColor:
                      subSeccionTienda === "diseno"
                        ? "#0d6efd"
                        : "white" /* Azul */,
                    color: subSeccionTienda === "diseno" ? "white" : "#374151",
                    border: "1px solid #d1d5db",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  🎨 Personalizar Diseño
                </button>
                <button
                  type="button"
                  onClick={() => setSubSeccionTienda("ofertas")}
                  style={{
                    backgroundColor:
                      subSeccionTienda === "ofertas"
                        ? "#fd7e14"
                        : "white" /* Naranja */,
                    color: subSeccionTienda === "ofertas" ? "white" : "#374151",
                    border: "1px solid #d1d5db",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  🎁 Gestor de Ofertas
                </button>
              </div>
              {/* Tarjeta del Enlace */}
              <div
                style={{
                  backgroundColor: "#f3f0ff", // Fondo morado muy clarito
                  border: "2px dashed #7c3aed", // Borde punteado para darle importancia
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "25px",
                  boxShadow: "0 6px 16px rgba(124, 58, 237, 0.15)", // Sombra elegante
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "18px",
                    color: "#4c1d95",
                  }}
                >
                  🔗 Tu enlace público de ventas
                </h3>
                <p
                  style={{
                    margin: "0 0 15px 0",
                    fontSize: "14px",
                    color: "#5b21b6",
                    fontWeight: "500",
                  }}
                >
                  Este es el link oficial de tu tienda. Cópialo y compártelo con
                  tus clientes en WhatsApp o tus Redes Sociales para que vean tu
                  catálogo y empiecen a comprar.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    readOnly
                    value={`${STORE_URL}/${usuario?.id}`}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d8b4fe",
                      backgroundColor: "white",
                      color: "#374151", // Texto oscuro y visible
                      fontSize: "15px",
                      fontWeight: "700",
                      outline: "none",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)", // Sombrilla interior
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${STORE_URL}/${usuario?.id}`,
                      );
                      alert(
                        "¡Enlace copiado al portapapeles! Ya puedes pegarlo en WhatsApp.",
                      );
                    }}
                    style={{
                      backgroundColor: "#7c3aed",
                      color: "white",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 4px 6px rgba(124, 58, 237, 0.25)",
                      transition: "0.2s",
                    }}
                  >
                    📋 Copiar Link
                  </button>
                  <button
                    onClick={() =>
                      window.open(`${STORE_URL}/${usuario?.id}`, "_blank")
                    }
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 4px 6px rgba(16, 185, 129, 0.25)",
                    }}
                  >
                    Visitar Tienda ➔
                  </button>
                </div>
              </div>

              {/* Tarjeta de Configuración de Diseño */}
              {subSeccionTienda === "diseno" && (
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <h3 style={{ margin: "0 0 15px 0", color: "#111827" }}>
                    🎨 Personalizar Diseño
                  </h3>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const res = await fetch(
                          `${API_URL}/api/tienda/config`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(configTienda),
                          },
                        );

                        if (res.ok) {
                          alert("¡Configuración guardada correctamente! 💾");
                        } else {
                          alert("Hubo un error al guardar los cambios.");
                        }
                      } catch (error) {
                        console.error(error);
                        alert("Error de red al guardar.");
                      }
                    }}
                  >
                    <div style={{ marginBottom: "15px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Nombre de tu Tienda (Logo)
                      </p>
                      <input
                        type="text"
                        value={configTienda.nombreTienda}
                        onChange={(e) =>
                          setConfigTienda({
                            ...configTienda,
                            nombreTienda: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Mensaje Principal (Banner destacado)
                      </p>
                      <input
                        type="text"
                        value={configTienda.mensajeBanner}
                        onChange={(e) =>
                          setConfigTienda({
                            ...configTienda,
                            mensajeBanner: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxSizing: "border-box",
                        }}
                        placeholder="Ej. ¡Llegaron las rebajas!"
                      />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Subtítulo del Banner
                      </p>
                      <textarea
                        value={configTienda.descripcionBanner}
                        onChange={(e) =>
                          setConfigTienda({
                            ...configTienda,
                            descripcionBanner: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxSizing: "border-box",
                          minHeight: "60px",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Correo de Contacto de la Tienda
                      </p>
                      <input
                        type="email"
                        value={configTienda.correoTienda}
                        onChange={(e) =>
                          setConfigTienda({
                            ...configTienda,
                            correoTienda: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxSizing: "border-box",
                        }}
                        placeholder="ventas@mitienda.com"
                      />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Número de WhatsApp
                      </p>
                      <input
                        type="text"
                        value={configTienda.whatsappTienda}
                        onChange={(e) =>
                          setConfigTienda({
                            ...configTienda,
                            whatsappTienda: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxSizing: "border-box",
                        }}
                        placeholder="Ej. +52 55 1234 5678"
                      />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Política de Reembolso y Devoluciones
                      </p>
                      <textarea
                        value={configTienda.politicaReembolso}
                        onChange={(e) =>
                          setConfigTienda({
                            ...configTienda,
                            politicaReembolso: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxSizing: "border-box",
                          minHeight: "100px",
                        }}
                        placeholder="Ej. Tienes 30 días para solicitar un reembolso si el producto está sellado..."
                      />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Términos de Servicio
                      </p>
                      <textarea
                        value={configTienda.terminosServicio}
                        onChange={(e) =>
                          setConfigTienda({
                            ...configTienda,
                            terminosServicio: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxSizing: "border-box",
                          minHeight: "100px",
                        }}
                        placeholder="Ej. Al comprar en esta tienda aceptas que los tiempos de envío pueden variar..."
                      />
                    </div>

                    {/* === SECCIÓN DE PREGUNTAS FRECUENTES === */}
                    <div
                      style={{
                        marginBottom: "25px",
                        borderTop: "2px dashed #e5e7eb",
                        paddingTop: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "15px",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontWeight: "700",
                            fontSize: "15px",
                            color: "#111827",
                          }}
                        >
                          ❓ Preguntas Frecuentes (FAQ)
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setConfigTienda({
                              ...configTienda,
                              preguntasFrecuentes: [
                                ...configTienda.preguntasFrecuentes,
                                { pregunta: "", respuesta: "" },
                              ],
                            });
                          }}
                          style={{
                            backgroundColor: "#198754",
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          ➕ Añadir nueva pregunta
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const sugerencias = [
                            {
                              pregunta: "¿Cuánto tarda en llegar mi pedido?",
                              respuesta:
                                "El tiempo de entrega estándar es de 3 a 5 días hábiles a todo el país tras procesar tu pago.",
                            },
                            {
                              pregunta: "¿Qué formas de pago aceptan?",
                              respuesta:
                                "Aceptamos transferencias, tarjetas y pagos en efectivo contra entrega.",
                            },
                            {
                              pregunta:
                                "¿Puedo devolver un producto si llega dañado?",
                              respuesta:
                                "Sí, tienes 7 días naturales desde que recibes el paquete para reportar cualquier daño y solicitar un reemplazo.",
                            },
                          ];
                          setConfigTienda({
                            ...configTienda,
                            preguntasFrecuentes: sugerencias,
                          });
                        }}
                        style={{
                          backgroundColor: "#eef2ff",
                          color: "#4f46e5",
                          border: "1px solid #c7d2fe",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          marginBottom: "20px",
                          display: "block",
                          width: "100%",
                        }}
                      >
                        💡 Cargar sugerencias por defecto
                      </button>

                      {configTienda.preguntasFrecuentes.map((faq, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: "#f9fafb",
                            padding: "15px",
                            borderRadius: "10px",
                            border: "1px solid #e5e7eb",
                            marginBottom: "15px",
                            position: "relative",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const nuevasFaqs =
                                configTienda.preguntasFrecuentes.filter(
                                  (_, i) => i !== index,
                                );
                              setConfigTienda({
                                ...configTienda,
                                preguntasFrecuentes: nuevasFaqs,
                              });
                            }}
                            style={{
                              position: "absolute",
                              top: "15px",
                              right: "15px",
                              background: "none",
                              border: "none",
                              color: "#dc3545",
                              cursor: "pointer",
                              fontSize: "16px",
                            }}
                            title="Eliminar pregunta"
                          >
                            🗑️
                          </button>
                          <p
                            style={{
                              margin: "0 0 6px 0",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#4b5563",
                            }}
                          >
                            Pregunta:
                          </p>
                          <input
                            type="text"
                            placeholder="Ej. ¿Tienen envíos gratis?"
                            value={faq.pregunta}
                            onChange={(e) => {
                              const nuevasFaqs = [
                                ...configTienda.preguntasFrecuentes,
                              ];
                              nuevasFaqs[index].pregunta = e.target.value;
                              setConfigTienda({
                                ...configTienda,
                                preguntasFrecuentes: nuevasFaqs,
                              });
                            }}
                            style={{
                              width: "90%",
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1px solid #d1d5db",
                              marginBottom: "10px",
                              fontSize: "13px",
                              boxSizing: "border-box",
                            }}
                          />

                          <p
                            style={{
                              margin: "0 0 6px 0",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#4b5563",
                            }}
                          >
                            Respuesta:
                          </p>
                          <textarea
                            placeholder="Ej. Sí, en compras mayores a $500..."
                            value={faq.respuesta}
                            onChange={(e) => {
                              const nuevasFaqs = [
                                ...configTienda.preguntasFrecuentes,
                              ];
                              nuevasFaqs[index].respuesta = e.target.value;
                              setConfigTienda({
                                ...configTienda,
                                preguntasFrecuentes: nuevasFaqs,
                              });
                            }}
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1px solid #d1d5db",
                              fontSize: "13px",
                              minHeight: "70px",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      ))}

                      {configTienda.preguntasFrecuentes.length === 0 && (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#6b7280",
                            textAlign: "center",
                            padding: "20px",
                            border: "1px dashed #d1d5db",
                            borderRadius: "8px",
                          }}
                        >
                          No has añadido ninguna pregunta frecuente. Puedes
                          escribir una desde cero o usar el botón de
                          sugerencias.
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#0d6efd",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      💾 Guardar Cambios
                    </button>
                  </form>
                </div>
              )}

              {subSeccionTienda === "ofertas" && (
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <h3 style={{ margin: 0, color: "#111827" }}>
                      🎁 Gestor de Ofertas y Promociones
                    </h3>
                    <button
                      onClick={() => quitarOferta("todas")}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      🧹 Limpiar Todas las Ofertas
                    </button>
                  </div>

                  <form
                    onSubmit={aplicarOferta}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "15px",
                      alignItems: "flex-end",
                      paddingBottom: "20px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <div style={{ flex: "1 1 200px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Aplicar oferta a:
                      </p>
                      <select
                        value={tipoOferta}
                        onChange={(e) => {
                          setTipoOferta(e.target.value);
                          setObjetivoOfertaId(""); // Limpiar objetivo al cambiar de tipo
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="categoria">Toda una Categoría</option>
                        <option value="producto">Un Producto Específico</option>
                      </select>
                    </div>

                    <div style={{ flex: "2 1 300px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Selecciona el objetivo:
                      </p>
                      <select
                        value={objetivoOfertaId}
                        onChange={(e) => setObjetivoOfertaId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="">Selecciona...</option>
                        {tipoOferta === "categoria"
                          ? categorias.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.nombre}
                              </option>
                            ))
                          : productos.map((prod) => (
                              <option key={prod._id} value={prod._id}>
                                {prod.nombre} (Normal: ${prod.precioVenta})
                              </option>
                            ))}
                      </select>
                    </div>

                    <div style={{ flex: "1 1 150px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Descuento (%):
                      </p>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={porcentajeOferta}
                        onChange={(e) => setPorcentajeOferta(e.target.value)}
                        placeholder="Ej. 20"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#198754",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        height: "40px",
                      }}
                    >
                      Aplicar Descuento
                    </button>
                  </form>

                  {/* Lista de Ofertas Activas */}
                  <div style={{ marginTop: "20px" }}>
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontWeight: "600",
                        fontSize: "14px",
                        color: "#4b5563",
                      }}
                    >
                      Productos con oferta activa actualmente:
                    </p>
                    <div
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #eee",
                        borderRadius: "8px",
                      }}
                    >
                      {productos.filter(
                        (p) => p.precioOferta && p.precioOferta > 0,
                      ).length === 0 ? (
                        <p
                          style={{
                            padding: "15px",
                            margin: 0,
                            textAlign: "center",
                            color: "#9ca3af",
                            fontSize: "13px",
                          }}
                        >
                          No hay ofertas activas en este momento.
                        </p>
                      ) : (
                        productos
                          .filter((p) => p.precioOferta && p.precioOferta > 0)
                          .map((prod) => (
                            <div
                              key={prod._id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px 15px",
                                borderBottom: "1px solid #eee",
                                fontSize: "13px",
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    fontWeight: "600",
                                    color: "#111827",
                                  }}
                                >
                                  {prod.nombre}
                                </span>
                                <span
                                  style={{
                                    marginLeft: "10px",
                                    textDecoration: "line-through",
                                    color: "#9ca3af",
                                  }}
                                >
                                  ${prod.precioVenta}
                                </span>
                                <span
                                  style={{
                                    marginLeft: "10px",
                                    color: "#198754",
                                    fontWeight: "bold",
                                  }}
                                >
                                  🔥 ${Number(prod.precioOferta).toFixed(2)}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  quitarOferta("producto", prod._id)
                                }
                                style={{
                                  background: "none",
                                  border: "1px solid #dc3545",
                                  color: "#dc3545",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                }}
                              >
                                Quitar
                              </button>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
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

            <h3 style={{ marginTop: 0 }}>📢 Avisos y Recomendaciones</h3>

            {recomendaciones.length === 0 ? (
              <p>Todo está en buen estado. No hay acciones urgentes.</p>
            ) : (
              recomendaciones.slice(0, 5).map((rec, i) => {
                let colorFondo = "#e7f1ff";
                let colorTexto = "#084298";
                let icono = rec.icono || "ℹ️";

                if (rec.tipo === "critico") {
                  colorFondo = "#f8d7da";
                  colorTexto = "#842029";
                  icono = rec.icono || "🔴";
                }

                if (rec.tipo === "medio") {
                  colorFondo = "#fff3cd";
                  colorTexto = "#664d03";
                  icono = rec.icono || "🟡";
                }

                if (rec.tipo === "bajo") {
                  colorFondo = "#d1e7dd";
                  colorTexto = "#0f5132";
                  icono = rec.icono || "🟢";
                }

                if (rec.tipo === "pedido_web") {
                  colorFondo = "#e0e7ff"; // Fondo azul/púrpura suave
                  colorTexto = "#3730a3"; // Texto azul oscuro
                  icono = rec.icono || "🌐";
                }

                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: colorFondo,
                      color: colorTexto,
                      padding: "8px 12px", // Un poco más de espacio a los lados
                      borderRadius: "8px",
                      marginBottom: "8px",
                      display: "flex", // NUEVO: Para alinear en horizontal
                      justifyContent: "space-between", // NUEVO: Texto a la izq, botón a la der
                      alignItems: "center",
                    }}
                  >
                    <div>
                      {icono} {rec.mensaje}
                    </div>

                    {/* NUEVO: Botón que lanza advertencia y abre pedidos */}
                    {rec.productoId && (
                      <button
                        onClick={() => {
                          alert(
                            "💡 Nota: Esto te llevará a generar el pedido. Cuando la mercancía llegue a tu tienda, usa el botón '📥 Reponer todo' en la sección de Inventario.",
                          );
                          setSeccionActiva("inventario"); // ¡Esto soluciona el bug de la pantalla blanca!
                          abrirGeneradorPedido();
                        }}
                        style={{
                          backgroundColor: colorTexto,
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                          marginLeft: "10px",
                        }}
                      >
                        Pedir 📋
                      </button>
                    )}

                    {/* SHORTCUT DIRECTO AL GESTOR DE PEDIDOS WEB */}
                    {rec.accion === "ir_a_pedidos_web" && (
                      <button
                        onClick={() => {
                          setSeccionActiva("ventas");
                          setSubSeccionVentas("web");
                        }}
                        style={{
                          backgroundColor: "#4f46e5",
                          color: "white",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                          marginLeft: "10px",
                          boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                        }}
                      >
                        Atender Pedido 🛒
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {/* ======================================================
              CIERRE DE CAJA (RESUMEN DEL DÍA)
              ====================================================== */}
          {seccionActiva === "inicio" && (
            <div
              style={{
                backgroundColor: "#d1e7dd",
                color: "#0f5132",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #badbcc",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ fontSize: "24px" }}>💵</span>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    Corte de caja de hoy
                  </p>
                  <h2
                    style={{
                      margin: "2px 0 0",
                      fontSize: "20px",
                      fontWeight: "800",
                    }}
                  >
                    ${ingresosDeHoy.toFixed(2)}
                  </h2>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "11px", fontWeight: "600" }}>
                  Operaciones
                </p>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                  {cantidadVentasHoy}
                </p>
              </div>
            </div>
          )}
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
              <h2 style={{ margin: "8px 0 0", color: "#222" }}>
                {totalProductos}
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
              <h2
                style={{
                  margin: "8px 0 0",
                  color: stockBajo > 0 ? "#dc3545" : "#198754",
                }}
              >
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
                  color:
                    utilidadPotencialInventario >= 0 ? "#198754" : "#dc3545",
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
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "12px",
                borderRadius: "10px",
              }}
            >
              <p style={{ margin: 0, color: "#666" }}>🥇 Más vendido</p>
              <h3 style={{ margin: "8px 0 0" }}>
                {productoMasVendido?.nombre || "—"}
              </h3>
              <p style={{ margin: 0 }}>
                {productoMasVendido?.cantidad || 0} unidades
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "12px",
                borderRadius: "10px",
              }}
            >
              <p style={{ margin: 0, color: "#666" }}>💰 Mayor utilidad</p>
              <h3 style={{ margin: "8px 0 0" }}>
                {productoMayorUtilidad?.nombre || "—"}
              </h3>
              <p style={{ margin: 0 }}>
                ${Number(productoMayorUtilidad?.utilidad || 0).toFixed(2)}
              </p>
            </div>
          </div>
          {/* ======================================================
          MÓDULO DE VENTAS
          Ventas normales, mayoreo y simulación financiera
          ====================================================== */}
          <div
            id="zonaVentas"
            style={{
              display: seccionActiva === "ventas" ? "block" : "none",
              backgroundColor: "transparent", // Le quitamos el fondo blanco general
              marginTop: "0",
              marginBottom: "25px",
            }}
          >
            {/* --- PESTAÑAS DEL MÓDULO DE VENTAS --- */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                type="button"
                onClick={() => setSubSeccionVentas("fisicas")}
                style={{
                  backgroundColor:
                    subSeccionVentas === "fisicas" ? "#0d6efd" : "white",
                  color: subSeccionVentas === "fisicas" ? "white" : "#374151",
                  border: "1px solid #d1d5db",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow:
                    subSeccionVentas === "fisicas"
                      ? "0 4px 12px rgba(13, 110, 253, 0.2)"
                      : "none",
                }}
              >
                🏪 Ventas Físicas (Mostrador)
              </button>
              <button
                type="button"
                onClick={() => setSubSeccionVentas("web")}
                style={{
                  backgroundColor:
                    subSeccionVentas === "web" ? "#fd7e14" : "white",
                  color: subSeccionVentas === "web" ? "white" : "#374151",
                  border: "1px solid #d1d5db",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow:
                    subSeccionVentas === "web"
                      ? "0 4px 12px rgba(124, 58, 237, 0.2)"
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🌐 Gestor de Pedidos Web
                {/* Globlito rojo si hay pedidos pendientes */}
                {ventas.filter((v) => v.estado === "En proceso").length > 0 && (
                  <span
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontSize: "11px",
                    }}
                  >
                    {ventas.filter((v) => v.estado === "En proceso").length}
                  </span>
                )}
              </button>
            </div>

            {/* === SUB-MÓDULO: VENTAS FÍSICAS === */}
            {subSeccionVentas === "fisicas" && (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <form onSubmit={guardarMovimiento}>
                  <p
                    style={{
                      color: "#666",
                      marginTop: "0",
                      marginBottom: "18px",
                    }}
                  >
                    Registra ventas en mostrador. Selecciona el producto y la
                    cantidad.
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
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
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
                    Cantidad vendida
                  </p>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ejemplo: 2"
                    value={cantidadMovimiento}
                    onChange={(e) => setCantidadMovimiento(e.target.value)}
                    style={{
                      width: "350px",
                      maxWidth: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      marginBottom: "15px",
                      display: "block",
                    }}
                  />

                  {productoMovimientoSeleccionado && (
                    <>
                      <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                        Precio final negociado{" "}
                        <span
                          style={{
                            color: "#666",
                            fontWeight: "normal",
                            fontSize: "11px",
                          }}
                        >
                          (Opcional)
                        </span>
                      </p>
                      <input
                        type="number"
                        min="0"
                        placeholder="Total a cobrar por esta venta"
                        value={precioUnitarioNegociado}
                        onChange={(e) =>
                          setPrecioUnitarioNegociado(e.target.value)
                        }
                        style={{
                          width: "350px",
                          maxWidth: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                          marginBottom: "15px",
                          display: "block",
                        }}
                      />

                      {cantidadMovimiento !== "" && (
                        <div
                          style={{
                            backgroundColor: "#f8f9fa",
                            border: "2px solid #198754",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            marginBottom: "15px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "350px",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#333",
                            }}
                          >
                            Total a cobrar:
                          </span>
                          <span
                            style={{
                              fontSize: "22px",
                              fontWeight: "900",
                              color: "#198754",
                            }}
                          >
                            ${ingresoEstimadoMovimiento.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div style={{ height: "10px" }} />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#198754",
                      color: "white",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    Registrar venta física
                  </button>
                  <button
                    type="button"
                    onClick={cancelarMovimiento}
                    style={{
                      marginLeft: "10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    Cancelar
                  </button>
                </form>
              </div>
            )}

            {/* === SUB-MÓDULO: GESTOR WEB === */}
            {subSeccionVentas === "web" && (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3 style={{ margin: "0 0 15px 0", color: "#222" }}>
                  📦 Pedidos Pendientes de la Tienda
                </h3>
                <p
                  style={{
                    color: "#666",
                    fontSize: "13px",
                    marginBottom: "20px",
                  }}
                >
                  Aquí aparecen las compras realizadas en tu sitio web. Contacta
                  al cliente para coordinar la entrega/pago y márcalo como
                  entregado cuando lo finalices.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  {ventas.filter((v) => v.estado === "En proceso").length ===
                  0 ? (
                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px dashed #ccc",
                      }}
                    >
                      <span style={{ fontSize: "30px" }}>🙌</span>
                      <p style={{ color: "#666", margin: "10px 0 0" }}>
                        No tienes pedidos web pendientes. ¡Todo al día!
                      </p>
                    </div>
                  ) : (
                    ventas
                      .filter((v) => v.estado === "En proceso")
                      .map((pedido) => (
                        <div
                          key={pedido._id}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            padding: "15px",
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "15px",
                            backgroundColor: "#faf5ff",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "8px",
                              }}
                            >
                              <span
                                style={{
                                  backgroundColor: "#7c3aed",
                                  color: "white",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                }}
                              >
                                NUEVO PEDIDO
                              </span>
                              <span style={{ fontSize: "12px", color: "#666" }}>
                                {new Date(pedido.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <h4
                              style={{
                                margin: "0 0 5px 0",
                                fontSize: "16px",
                                color: "#111827",
                              }}
                            >
                              {pedido.cantidad}x {pedido.nombreProducto}
                            </h4>
                            <p
                              style={{
                                margin: "0 0 5px 0",
                                fontSize: "13px",
                                color: "#4b5563",
                              }}
                            >
                              <strong>Cliente:</strong> {pedido.cliente}
                            </p>
                            <p
                              style={{
                                margin: "0",
                                fontSize: "13px",
                                color: "#4b5563",
                              }}
                            >
                              <strong>Total a cobrar:</strong>{" "}
                              <span
                                style={{ color: "#198754", fontWeight: "bold" }}
                              >
                                ${pedido.ingresoTotal.toFixed(2)}
                              </span>
                            </p>
                          </div>

                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              onClick={() => {
                                const numero = pedido.telefonoCliente.replace(
                                  /\D/g,
                                  "",
                                );
                                // MENSAJE DE WHATSAPP DINÁMICO Y CORREGIDO
                                const mensaje = `Hola ${pedido.cliente}, somos de ${configTienda.nombreTienda}. Hemos recibido tu pedido de ${pedido.cantidad}x ${pedido.nombreProducto} por un total de $${pedido.ingresoTotal.toFixed(2)}. Escríbenos por aquí para coordinar la entrega o recolección de tus artículos. ¡Gracias!`;
                                window.open(
                                  `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
                                  "_blank",
                                );
                              }}
                              style={{
                                backgroundColor: "#25D366",
                                color: "white",
                                border: "none",
                                padding: "10px 15px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              📲 Enviar WhatsApp
                            </button>

                            <button
                              onClick={() =>
                                cambiarEstadoVenta(pedido._id, "Completado")
                              }
                              style={{
                                backgroundColor: "#198754",
                                color: "white",
                                border: "none",
                                padding: "10px 15px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              ✔ Marcar Entregado
                            </button>

                            {/* NUEVO BOTÓN DE CANCELAR */}
                            <button
                              onClick={() => cancelarPedidoWeb(pedido._id)}
                              style={{
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                padding: "10px 15px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              ❌ Cancelar
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
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
                  backgroundColor:
                    tipoHistorial === "ventas" ? "#0d6efd" : "white",
                  color: tipoHistorial === "ventas" ? "white" : "#222",
                  border: "1px solid #ddd",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Ventas
              </button>

              <button
                type="button"
                onClick={() => setTipoHistorial("reposiciones")}
                style={{
                  backgroundColor:
                    tipoHistorial === "reposiciones" ? "#198754" : "white",
                  color: tipoHistorial === "reposiciones" ? "white" : "#222",
                  border: "1px solid #ddd",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
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
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>
                      Ventas filtradas
                    </p>
                    <h3 style={{ margin: "8px 0 0" }}>
                      {ventasFiltradas.length}
                    </h3>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>
                      Ingresos
                    </p>
                    <h3 style={{ margin: "8px 0 0" }}>
                      ${ingresosFiltrados.toFixed(2)}
                    </h3>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>
                      Costos
                    </p>
                    <h3 style={{ margin: "8px 0 0" }}>
                      ${costosFiltrados.toFixed(2)}
                    </h3>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>
                      Utilidad
                    </p>
                    <h3 style={{ margin: "8px 0 0", color: "#198754" }}>
                      ${utilidadFiltrada.toFixed(2)}
                    </h3>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>
                      Margen global
                    </p>

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

                  <h3 style={{ marginBottom: "10px" }}>
                    📦 Top 3 productos más vendidos
                  </h3>

                  <div style={{ marginBottom: "15px" }}>
                    <button
                      type="button"
                      onClick={() => setTopHistorialActivo("ventas")}
                      style={{
                        backgroundColor:
                          topHistorialActivo === "ventas" ? "#0d6efd" : "white",
                        color:
                          topHistorialActivo === "ventas" ? "white" : "#222",
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
                        backgroundColor:
                          topHistorialActivo === "utilidad"
                            ? "#198754"
                            : "white",
                        color:
                          topHistorialActivo === "utilidad" ? "white" : "#222",
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
                        backgroundColor:
                          topHistorialActivo === "margen" ? "#fd7e14" : "white",
                        color:
                          topHistorialActivo === "margen" ? "white" : "#222",
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
                          tableLayout: "fixed", // NUEVO: Congela el diseño de las columnas
                        }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                width: "28%",
                              }}
                            >
                              Producto
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                width: "18%",
                              }}
                            >
                              Unidades
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                width: "18%",
                              }}
                            >
                              Ingresos
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                width: "18%",
                              }}
                            >
                              Utilidad
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                width: "18%",
                              }}
                            >
                              Margen %
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {(topHistorialActivo === "utilidad"
                            ? topProductosUtilidad
                            : topHistorialActivo === "margen"
                              ? topProductosMargen
                              : topProductos
                          ).map((p, index) => {
                            const margen =
                              p.ingresos > 0
                                ? (p.utilidad / p.ingresos) * 100
                                : 0;

                            return (
                              <tr key={index}>
                                <td
                                  style={{
                                    padding: "8px",
                                    textAlign: "center",
                                  }}
                                >
                                  {p.nombre}
                                </td>

                                <td
                                  style={{
                                    padding: "8px",
                                    textAlign: "center",
                                  }}
                                >
                                  {p.cantidad}
                                </td>

                                <td
                                  style={{
                                    padding: "8px",
                                    textAlign: "center",
                                  }}
                                >
                                  ${p.ingresos.toFixed(2)}
                                </td>

                                <td
                                  style={{
                                    padding: "8px",
                                    textAlign: "center",
                                    color:
                                      p.utilidad < 0 ? "#dc3545" : "#198754",
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
                      height: 380, // Subí un poco la altura para dar más respiro
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderRadius: "12px",
                      marginBottom: "25px",
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    <h3 style={{ marginTop: 0, color: "#222" }}>
                      📈 Evolución de ingresos y utilidad por día
                    </h3>

                    <div
                      style={{
                        marginBottom: "15px",
                        display: "flex",
                        gap: "15px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            marginRight: "8px",
                            fontWeight: "600",
                            fontSize: "13px",
                          }}
                        >
                          Desde:
                        </label>
                        <input
                          type="date"
                          value={fechaInicioGrafica}
                          onChange={(e) =>
                            setFechaInicioGrafica(e.target.value)
                          }
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "12.5px",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            marginRight: "8px",
                            fontWeight: "600",
                            fontSize: "13px",
                          }}
                        >
                          Hasta:
                        </label>
                        <input
                          type="date"
                          value={fechaFinGrafica}
                          onChange={(e) => setFechaFinGrafica(e.target.value)}
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "12.5px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Ahora la condición está adentro: Solo se ocultan las líneas, no los controles */}
                    {datosGraficaVentas.length > 0 ? (
                      <ResponsiveContainer width="100%" height="80%">
                        <LineChart
                          data={datosGraficaVentas}
                          margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                        >
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
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "70%",
                          color: "#999",
                          border: "2px dashed #ddd",
                          borderRadius: "8px",
                        }}
                      >
                        <p style={{ fontWeight: "600" }}>
                          No hay ventas en este rango de fechas.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* --- GRÁFICO INTERACTIVO: ORIGEN -> CATEGORÍAS -> PRODUCTOS --- */}
                <div
                  style={{
                    width: "100%",
                    height: 380, // Le subí un poquito la altura para que respire mejor
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "12px",
                    marginBottom: "25px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  <h3 style={{ marginTop: 0, color: "#222" }}>
                    📈 Evolución de ingresos y utilidad por día
                  </h3>

                  <div
                    style={{
                      marginBottom: "15px",
                      display: "flex",
                      gap: "15px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          marginRight: "8px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Desde:
                      </label>
                      <input
                        type="date"
                        value={fechaInicioGrafica}
                        onChange={(e) => setFechaInicioGrafica(e.target.value)}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          fontSize: "12.5px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          marginRight: "8px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Hasta:
                      </label>
                      <input
                        type="date"
                        value={fechaFinGrafica}
                        onChange={(e) => setFechaFinGrafica(e.target.value)}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          fontSize: "12.5px",
                        }}
                      />
                    </div>
                  </div>

                  {/* LA REGLA AHORA SOLO ENVUELVE A LA GRÁFICA, NO A LOS CALENDARIOS */}
                  {datosGraficaVentas.length > 0 ? (
                    <ResponsiveContainer width="100%" height="80%">
                      <LineChart
                        data={datosGraficaVentas}
                        margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                      >
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
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "70%",
                        color: "#999",
                        border: "2px dashed #ddd",
                        borderRadius: "8px",
                      }}
                    >
                      <p style={{ fontWeight: "600" }}>
                        No hay ventas en este rango o la fecha está incompleta.
                      </p>
                    </div>
                  )}
                </div>

                <h3 style={{ marginBottom: "10px", color: "#222" }}>
                  📄 Historial de ventas
                </h3>

                <div
                  style={{
                    marginBottom: "15px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busquedaVenta}
                    onChange={(e) => setBusquedaVenta(e.target.value)}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Buscar por cliente..."
                    value={filtroCliente}
                    onChange={(e) => setFiltroCliente(e.target.value)}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  />

                  {/* ---> AQUÍ ES DONDE ENTRA EL NUEVO SELECTOR DE CATEGORÍA <--- */}
                  <select
                    value={filtroCategoriaHistorial}
                    onChange={(e) =>
                      setFiltroCategoriaHistorial(e.target.value)
                    }
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="todas">Todas las categorías</option>
                    {categorias.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={filtroFechaVenta}
                    onChange={(e) => setFiltroFechaVenta(e.target.value)}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  />

                  <select
                    value={ordenVentas}
                    onChange={(e) => setOrdenVentas(e.target.value)}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="">Más recientes</option>
                    <option value="ingresoMayor">Mayor ingreso</option>
                    <option value="ingresoMenor">Menor ingreso</option>
                    <option value="utilidadMayor">Mayor utilidad</option>
                    <option value="utilidadMenor">Menor utilidad</option>
                    <option value="margenMayor">
                      Mayor margen % de utilidad
                    </option>
                    <option value="margenMenor">
                      Menor margen % de utilidad
                    </option>
                  </select>
                </div>

                {ventasFiltradas.length === 0 ? (
                  <p>No hay ventas registradas todavía.</p>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      overflowX: "auto",
                      maxHeight: "360px",
                      overflowY: "auto",
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
                          {[
                            "Producto",
                            "Descripción",
                            "Categoría",
                            "Origen",
                            "Cliente",
                            "Teléfono", // <--- NUEVO
                            "Cantidad",
                            "Ingreso",
                            "Costo total",
                            "Utilidad",
                            "Margen %",
                            "Fecha",
                          ].map((titulo) => (
                            <th
                              key={titulo}
                              style={{
                                padding: "10px 8px",
                                textAlign: "center",
                                position: "sticky",
                                top: 0,
                                backgroundColor: "#f1f3f5",
                                zIndex: 1,
                                fontSize: "13px",
                                fontWeight: "700",
                                color: "#333",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              {titulo}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {ventasFiltradas.map((venta) => (
                          <tr key={venta._id}>
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {venta.nombreProducto}
                            </td>

                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                maxWidth: "150px",
                                wordBreak: "break-word",
                                color: "#666",
                                fontSize: "12px",
                              }}
                            >
                              {productos.find((p) => p._id === venta.productoId)
                                ?.descripcion || "—"}
                            </td>

                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                              }}
                            >
                              {(() => {
                                const prod = productos.find(
                                  (p) => p._id === venta.productoId,
                                );
                                const idCat =
                                  typeof prod?.categoria === "object"
                                    ? prod?.categoria?._id
                                    : prod?.categoria;
                                return (
                                  categorias.find((c) => c._id === idCat)
                                    ?.nombre || "—"
                                );
                              })()}
                            </td>

                            {/* --- NUEVA CELDA DE ORIGEN --- */}
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              <span
                                style={{
                                  backgroundColor:
                                    venta.origenVenta === "Web"
                                      ? "#cff4fc"
                                      : "#e2e3e5",
                                  color:
                                    venta.origenVenta === "Web"
                                      ? "#055160"
                                      : "#41464b",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                }}
                              >
                                {venta.origenVenta || "Local"}
                              </span>
                            </td>
                            {/* ----------------------------- */}

                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {venta.cliente || "—"}
                            </td>

                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                fontSize: "12px",
                              }}
                            >
                              {venta.telefonoCliente || "—"}
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
                                color:
                                  Number(venta.utilidad) < 0
                                    ? "#dc3545"
                                    : "#198754",
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
                    type="text"
                    placeholder="Buscar por proveedor..."
                    value={filtroProveedor}
                    onChange={(e) => setFiltroProveedor(e.target.value)}
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
                  <div
                    style={{
                      width: "100%",
                      overflowX: "auto",
                      maxHeight: "360px", // Congela la altura igual que las otras
                      overflowY: "auto", // Activa el scroll interno de la tabla
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "separate", // Cambiado a separate para que el sticky funcione mejor
                        borderSpacing: 0,
                        marginTop: "15px",
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            "Producto",
                            "Cantidad",
                            "Stock antes",
                            "Stock después",
                            "Proveedor",
                            "Fecha",
                          ].map((titulo) => (
                            <th
                              key={titulo}
                              style={{
                                padding: "10px 8px",
                                textAlign: "center",
                                position: "sticky",
                                top: 0,
                                backgroundColor: "#f1f3f5",
                                zIndex: 1,
                                fontSize: "13px",
                                fontWeight: "700",
                                color: "#333",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              {titulo}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {reposicionesFiltradas.map((reposicion) => (
                          <tr key={reposicion._id}>
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {reposicion.nombreProducto}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {reposicion.cantidad}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {reposicion.stockAntes}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {reposicion.stockDespues}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {reposicion.proveedor || "—"}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              {new Date(reposicion.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
              <form onSubmit={guardarProducto} style={{}}>
                {/* 1. CAMPOS OBLIGATORIOS (SIEMPRE VISIBLES) */}

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
                  Descripción del producto{" "}
                  <span
                    style={{
                      color: "#666",
                      fontWeight: "normal",
                      fontSize: "11px",
                    }}
                  >
                    (Opcional)
                  </span>
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
                    minHeight: "60px",
                    resize: "vertical",
                  }}
                />
                <div style={{ height: "14px" }} />

                <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                  Foto del producto{" "}
                  <span
                    style={{
                      color: "#666",
                      fontWeight: "normal",
                      fontSize: "11px",
                    }}
                  >
                    (Opcional)
                  </span>
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFoto(e.target.files[0])}
                  style={{
                    width: "350px",
                    maxWidth: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px dashed #ccc",
                    fontSize: "12.5px",
                    marginBottom: "15px",
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                />

                {/* --- SELECTOR DE CATEGORÍAS --- */}
                <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                  Categoría
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    width: "350px",
                    maxWidth: "100%",
                    marginBottom: "15px",
                  }}
                >
                  <select
                    value={creandoCategoria ? "nueva" : categoriaId}
                    onChange={(e) => {
                      if (e.target.value === "nueva") {
                        setCreandoCategoria(true);
                        setCategoriaId("");
                      } else {
                        setCreandoCategoria(false);
                        setCategoriaId(e.target.value);
                      }
                    }}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "12.5px",
                    }}
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categorias.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.nombre}
                      </option>
                    ))}
                    <option value="nueva">➕ Añadir nueva categoría...</option>
                  </select>

                  {creandoCategoria && (
                    <input
                      type="text"
                      placeholder="Escribe el nombre de la nueva categoría"
                      value={nombreNuevaCategoria}
                      onChange={(e) => setNombreNuevaCategoria(e.target.value)}
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #0d6efd",
                        fontSize: "12.5px",
                        backgroundColor: "#f8f9fa",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>

                <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                  Precio de venta
                </p>
                <input
                  type="number"
                  placeholder="Precio al que lo venderás"
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
                {/* -------------------------------------- */}

                <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                  Costo del producto{" "}
                  <span
                    style={{
                      color: "#666",
                      fontWeight: "normal",
                      fontSize: "11px",
                    }}
                  >
                    (Opcional)
                  </span>
                </p>
                <input
                  type="number"
                  placeholder="¿Cuánto te costó?"
                  value={precio}
                  min="0"
                  onChange={(e) => setPrecio(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  style={{
                    width: "340px",
                    maxWidth: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "12.5px",
                  }}
                />
                <div style={{ height: "14px" }} />

                {!editandoId && (
                  <>
                    <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                      Stock inicial
                    </p>
                    <input
                      type="number"
                      required
                      placeholder="¿Cuántos tienes ahora?"
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

                {/* 2. BOTÓN DEL ACORDEÓN */}
                <div
                  onClick={() =>
                    setMostrarOpcionesProducto(!mostrarOpcionesProducto)
                  }
                  style={{
                    cursor: "pointer",
                    color: "#0d6efd",
                    fontWeight: "600",
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                  }}
                >
                  {mostrarOpcionesProducto
                    ? "▲ Ocultar opciones avanzadas"
                    : "▼ Mostrar opciones avanzadas (Costo, Proveedor, etc.)"}
                </div>

                {/* 3. CAMPOS OPCIONALES (DENTRO DEL ACORDEÓN) */}
                {mostrarOpcionesProducto && (
                  <div
                    style={{
                      paddingLeft: "10px",
                      borderLeft: "2px solid #0d6efd",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                      Costo de envío/manejo por unidad{" "}
                      <span
                        style={{
                          color: "#666",
                          fontWeight: "normal",
                          fontSize: "11px",
                        }}
                      >
                        (Opcional)
                      </span>
                    </p>
                    <input
                      type="number"
                      placeholder="Costo de envio"
                      value={costoEnvio}
                      min="0"
                      onChange={(e) => setCostoEnvio(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      style={{
                        width: "340px",
                        maxWidth: "100%",
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "12.5px",
                      }}
                    />
                    <div style={{ height: "14px" }} />

                    {/* Cuadro de utilidad, solo se muestra si metió precios */}
                    {precio !== "" && precioVenta !== "" && (
                      <div
                        style={{
                          backgroundColor:
                            Number(precioVenta) <
                            Number(precio) + Number(costoEnvio || 0)
                              ? "#f8d7da"
                              : "#e7f1ff",
                          color:
                            Number(precioVenta) <
                            Number(precio) + Number(costoEnvio || 0)
                              ? "#842029"
                              : "#084298",
                          padding: "12px",
                          borderRadius: "10px",
                          marginBottom: "15px",
                          fontWeight: "600",
                          width: "316px",
                          maxWidth: "100%",
                        }}
                      >
                        <p style={{ margin: "0 0 6px" }}>
                          Costo total unitario: $
                          {(
                            Number(precio || 0) + Number(costoEnvio || 0)
                          ).toFixed(2)}
                        </p>
                        <p style={{ margin: 0 }}>
                          Utilidad estimada por unidad: $
                          {(
                            Number(precioVenta || 0) -
                            (Number(precio || 0) + Number(costoEnvio || 0))
                          ).toFixed(2)}
                        </p>
                      </div>
                    )}

                    {!editandoId && (
                      <>
                        <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                          Proveedor inicial{" "}
                          <span
                            style={{
                              color: "#666",
                              fontWeight: "normal",
                              fontSize: "11px",
                            }}
                          >
                            (Opcional)
                          </span>
                        </p>
                        <input
                          type="text"
                          placeholder="Nombre del proveedor"
                          value={proveedorProductoNuevo}
                          onChange={(e) =>
                            setProveedorProductoNuevo(e.target.value)
                          }
                          style={{
                            width: "340px",
                            maxWidth: "100%",
                            padding: "8px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "12.5px",
                            marginBottom: "15px",
                            boxSizing: "border-box",
                          }}
                        />
                      </>
                    )}

                    <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                      Stock mínimo recomendado{" "}
                      <span
                        style={{
                          color: "#666",
                          fontWeight: "normal",
                          fontSize: "11px",
                        }}
                      >
                        (Opcional)
                      </span>
                    </p>
                    <input
                      type="number"
                      placeholder="Asume 1 por defecto"
                      value={stockMinimo}
                      min="0"
                      onChange={(e) => setStockMinimo(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      style={{
                        width: "340px",
                        maxWidth: "100%",
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "12.5px",
                      }}
                    />
                    <div style={{ height: "14px" }} />
                  </div>
                )}

                {/* 4. BOTONES DE ACCIÓN */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "5px",
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
                      setCategoriaId("");
                      setCreandoCategoria(false);
                      setNombreNuevaCategoria("");
                      setEditandoId(null);
                      setModoRegistro("nuevo");
                      setSeccionActiva("inventario");
                      setMostrarOpcionesProducto(false);
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
              <form onSubmit={guardarReposicion}>
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

                <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                  Proveedor (opcional)
                </p>

                <input
                  type="text"
                  placeholder="Nombre del proveedor"
                  value={proveedorReposicion}
                  onChange={(e) => setProveedorReposicion(e.target.value)}
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
                  type="submit"
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
                    setProveedorReposicion("");
                    setModoRegistro("nuevo");
                    setSeccionActiva("inventario");
                  }}
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
              </form>
            )}

            {/* ----------------------
            FORMULARIO DE REPOSICIÓN MASIVA
            ---------------------- */}
            {!editandoId && modoRegistro === "reposicionMasiva" && (
              <form onSubmit={guardarReposicionMasiva}>
                <p
                  style={{ color: "#666", marginBottom: "15px", marginTop: 0 }}
                >
                  Agrega unidades a varios productos al mismo tiempo. Deja en
                  blanco los que no vas a reponer hoy.
                </p>

                <p style={{ marginBottom: "6px", fontWeight: "600" }}>
                  Proveedor global{" "}
                  <span
                    style={{
                      color: "#666",
                      fontWeight: "normal",
                      fontSize: "11px",
                    }}
                  >
                    (Opcional)
                  </span>
                </p>
                <input
                  type="text"
                  placeholder="Nombre del proveedor de este lote"
                  value={proveedorReposicion}
                  onChange={(e) => setProveedorReposicion(e.target.value)}
                  style={{
                    width: "350px",
                    maxWidth: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "12.5px",
                    marginBottom: "15px",
                    boxSizing: "border-box",
                  }}
                />

                {/* Lista de todos los productos */}
                <div
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    border: "1px solid #eee",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "15px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  {productos.map((producto) => (
                    <div
                      key={producto._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: "10px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: "600",
                            fontSize: "13px",
                            color: "#333",
                          }}
                        >
                          {producto.nombre}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "11px",
                            color:
                              Number(producto.stock) === 0 ? "#dc3545" : "#666",
                            fontWeight: "500",
                          }}
                        >
                          Stock actual: {producto.stock}
                        </p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="+0"
                        value={cantidadesMasivas[producto._id] || ""}
                        onChange={(e) =>
                          setCantidadesMasivas((prev) => ({
                            ...prev,
                            [producto._id]: e.target.value,
                          }))
                        }
                        onWheel={(e) => e.target.blur()}
                        style={{
                          width: "65px",
                          padding: "6px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          fontSize: "13px",
                          textAlign: "center",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#198754",
                      color: "white",
                      border: "none",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12.5px",
                      fontWeight: "600",
                    }}
                  >
                    Guardar reposición masiva
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCantidadesMasivas({});
                      setProveedorReposicion("");
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
                      fontSize: "12.5px",
                      fontWeight: "600",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
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
              position: inventarioExpandido ? "fixed" : "static",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9999,
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
            }}
          >
            {/* BOTONES DE CONTROL DE VISTA EXPANDIDA */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              <button
                type="button"
                onClick={() => setInventarioExpandido(!inventarioExpandido)}
                style={{
                  backgroundColor: "#0d6efd",
                  color: "white",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {inventarioExpandido
                  ? "↙️ Volver a vista normal"
                  : "↗️ Expandir (Modo Celular)"}
              </button>

              {inventarioExpandido && (
                <button
                  type="button"
                  onClick={() => {
                    const texto = productosFiltrados
                      .map(
                        (p) =>
                          `▪️ ${p.nombre} - ${p.descripcion || "Sin descripción"}`,
                      )
                      .join("\n");
                    navigator.clipboard
                      .writeText(texto)
                      .then(() => alert("¡Lista copiada al portapapeles!"));
                  }}
                  style={{
                    backgroundColor: "#198754",
                    color: "white",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  📋 Copiar Todo
                </button>
              )}
            </div>
            {/* ENVOLVEMOS TODO LO DE ARRIBA (BOTONES Y BUSCADORES) EN UN CONTENEDOR QUE SE OCULTA CON CSS */}
            <div style={{ display: inventarioExpandido ? "none" : "block" }}>
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

                <button
                  type="button"
                  onClick={() => {
                    cancelarEdicion();
                    setCantidadesMasivas({});
                    setProveedorReposicion("");
                    setModoRegistro("reposicionMasiva");
                    setSeccionActiva("registrar");
                  }}
                  style={{
                    backgroundColor: "#198754", // Verde oscuro
                    color: "white",
                    border: "none",
                    padding: "9px 13px",
                    borderRadius: "9px",
                    cursor: "pointer",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    boxShadow: "0 6px 14px rgba(25, 135, 84, 0.22)",
                  }}
                >
                  📥 Reponer todo
                </button>

                <button
                  type="button"
                  onClick={abrirGeneradorPedido}
                  style={{
                    backgroundColor: "#fd7e14", // Azul llamativo para acción
                    color: "white",
                    border: "none",
                    padding: "9px 13px",
                    borderRadius: "9px",
                    cursor: "pointer",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    boxShadow: "0 6px 14px rgba(37, 99, 235, 0.22)",
                  }}
                >
                  📱 Generar Pedido
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
                Mostrando {productosFiltrados.length} de {productos.length}{" "}
                productos
              </p>
            </div>{" "}
            {/* <-- AQUÍ CERRAMOS EL DIV QUE OCULTA LOS FILTROS */}
            {seccionActiva === "inventario" ? (
              inventarioExpandido ? (
                // --- VISTA MÓVIL SIMPLIFICADA ---
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    paddingBottom: "20px",
                  }}
                >
                  {productosFiltrados.map((producto) => (
                    <div
                      key={producto._id}
                      style={{
                        border: "1px solid #ccc",
                        padding: "12px",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ paddingRight: "10px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: "bold",
                            fontSize: "16px",
                            color: "#222",
                          }}
                        >
                          {producto.nombre}
                        </p>
                        <p
                          style={{ margin: 0, color: "#666", fontSize: "12px" }}
                        >
                          {producto.descripcion || "Sin descripción"}
                        </p>
                      </div>
                      <button
                        onClick={() => setProductoDetalle(producto)}
                        style={{
                          backgroundColor: "#eef6ff",
                          color: "#0d6efd",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Detalles
                      </button>
                    </div>
                  ))}
                </div>
              ) : productos.length === 0 ? (
                <p>No hay productos registrados.</p>
              ) : (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "100%", // <--- 2. PONER ESTO AQUÍ (Frena que la tabla desborde la tarjeta)
                    maxHeight: "65vh",
                    overflowX: "auto", // <--- Aquí se queda el scroll horizontal limpio
                    overflowY: "auto", // <--- Aquí se queda el scroll vertical con los títulos fijos
                    borderRadius: "12px",
                    border: "1px solid #eee",
                    backgroundColor: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      minWidth: "1100px",
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
                          "Categoría",
                          "Costo total",
                          "Precio venta",
                          "Utilidad",
                          "Margen %",
                          "Stock",
                          "Recomendación",
                          "Acciones",
                        ].map((titulo) => (
                          <th
                            key={titulo}
                            style={{
                              padding: "10px 8px",
                              textAlign: "center",
                              position: "sticky",
                              top: 0,
                              backgroundColor: "#f1f3f5",
                              zIndex: 1,
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#333",
                              boxShadow: "0 1px 0 0 #e5e7eb",
                            }}
                          >
                            {titulo}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltrados.length === 0 ? (
                        <tr>
                          <td
                            colSpan="10"
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
                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                fontSize: "13px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                {producto.fotos && producto.fotos.length > 0 ? (
                                  <img
                                    src={producto.fotos[0]}
                                    alt={producto.nombre}
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "6px",
                                      objectFit: "cover",
                                      border: "1px solid #eee",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "6px",
                                      backgroundColor: "#f1f3f5",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "16px",
                                    }}
                                  >
                                    📸
                                  </div>
                                )}
                                <span
                                  style={{
                                    fontWeight: "600",
                                    color: "#111827",
                                    textAlign: "center",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {producto.nombre}
                                </span>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                maxWidth: "150px",
                                wordBreak: "break-word",
                                color: "#666",
                                fontSize: "12px",
                              }}
                            >
                              {producto.descripcion || "—"}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                fontSize: "13px",
                                color: "#555",
                              }}
                            >
                              {typeof producto.categoria === "object"
                                ? producto.categoria?.nombre
                                : categorias.find(
                                    (c) => c._id === producto.categoria,
                                  )?.nombre || "—"}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                fontSize: "13px",
                              }}
                            >
                              $
                              {(
                                Number(producto.precio || 0) +
                                Number(producto.costoEnvio || 0)
                              ).toFixed(2)}
                              <div
                                style={{
                                  color: "#777",
                                  fontSize: "11px",
                                  marginTop: "4px",
                                }}
                              >
                                Compra: $
                                {Number(producto.precio || 0).toFixed(2)} ·
                                Envío: $
                                {Number(producto.costoEnvio || 0).toFixed(2)}
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                fontSize: "13px",
                              }}
                            >
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
                                (Number(producto.precio || 0) +
                                  Number(producto.costoEnvio || 0))
                              ).toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                color:
                                  Number(producto.precioVenta || 0) > 0 &&
                                  ((Number(producto.precioVenta || 0) -
                                    (Number(producto.precio || 0) +
                                      Number(producto.costoEnvio || 0))) /
                                    Number(producto.precioVenta || 0)) *
                                    100 <
                                    0
                                    ? "#dc3545"
                                    : ((Number(producto.precioVenta || 0) -
                                          (Number(producto.precio || 0) +
                                            Number(producto.costoEnvio || 0))) /
                                          Number(producto.precioVenta || 0)) *
                                          100 <
                                        10
                                      ? "#fd7e14"
                                      : "#198754",
                                fontWeight: "700",
                                fontSize: "13px",
                              }}
                            >
                              {Number(producto.precioVenta || 0) > 0
                                ? `${(
                                    ((Number(producto.precioVenta || 0) -
                                      (Number(producto.precio || 0) +
                                        Number(producto.costoEnvio || 0))) /
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
                                  Number(producto.stock) <=
                                  Number(producto.stockMinimo || 5)
                                    ? "#dc3545"
                                    : "#198754",
                                fontWeight: "700",
                                fontSize: "13px",
                              }}
                            >
                              {producto.stock}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                fontWeight: "600",
                                fontSize: "13px",
                              }}
                            >
                              {Number(producto.stock) === 0
                                ? "🚫 Reponer"
                                : Number(producto.stock) <=
                                    Number(producto.stockMinimo || 5)
                                  ? "⚠️ Bajo"
                                  : "✅ Suficiente"}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                textAlign: "center",
                              }}
                            >
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
                                    setPrecioOferta(
                                      producto.precioOferta || "",
                                    );
                                    setStock(producto.stock);
                                    setStockMinimo(producto.stockMinimo || "");
                                    const catId =
                                      typeof producto.categoria === "object"
                                        ? producto.categoria?._id
                                        : producto.categoria || "";
                                    setCategoriaId(catId);
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
                                      document
                                        .getElementById("formularioProducto")
                                        ?.scrollIntoView({
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
              )
            ) : null}
            {/* ======================================================
              MODAL DE DETALLES DEL PRODUCTO (VISTA EXPANDIDA)
              ====================================================== */}
            {productoDetalle && (
              <div
                onClick={() => setProductoDetalle(null)} // <-- 1. Cierra al dar clic en el fondo oscuro
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  zIndex: 10000,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "20px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()} // <-- 2. Frena el clic aquí para que la caja blanca no se cierre
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "400px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  }}
                >
                  <h3 style={{ margin: "0 0 15px 0", color: "#222" }}>
                    {productoDetalle.nombre}
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gap: "10px",
                      fontSize: "14px",
                      color: "#333",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px",
                        alignItems: "center",
                      }}
                    >
                      <strong>Categoría:</strong>
                      <span
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {categorias.find(
                          (c) => c._id === productoDetalle.categoria,
                        )?.nombre || "Sin categoría"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px",
                      }}
                    >
                      <strong>Descripción:</strong>{" "}
                      <span style={{ textAlign: "right", maxWidth: "60%" }}>
                        {productoDetalle.descripcion || "—"}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px",
                      }}
                    >
                      <strong>Precio Venta:</strong>{" "}
                      <span style={{ color: "#198754", fontWeight: "bold" }}>
                        ${Number(productoDetalle.precioVenta || 0).toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px",
                      }}
                    >
                      <strong>Costo Total:</strong>{" "}
                      <span>
                        $
                        {(
                          Number(productoDetalle.precio || 0) +
                          Number(productoDetalle.costoEnvio || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px",
                      }}
                    >
                      <strong>Stock Actual:</strong>{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {productoDetalle.stock}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "5px",
                      }}
                    >
                      <strong>Estado:</strong>
                      <span
                        style={{
                          color:
                            Number(productoDetalle.stock) === 0
                              ? "#dc3545"
                              : Number(productoDetalle.stock) <=
                                  Number(productoDetalle.stockMinimo || 5)
                                ? "#fd7e14"
                                : "#198754",
                          fontWeight: "bold",
                        }}
                      >
                        {Number(productoDetalle.stock) === 0
                          ? "Agotado"
                          : Number(productoDetalle.stock) <=
                              Number(productoDetalle.stockMinimo || 5)
                            ? "Bajo"
                            : "Suficiente"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setProductoDetalle(null)}
                    style={{
                      width: "100%",
                      backgroundColor: "#dc3545",
                      color: "white",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Cerrar Detalles
                  </button>
                </div>
              </div>
            )}
            {/* ======================================================
              MODAL GENERADOR DE PEDIDOS (WHATSAPP)
              ====================================================== */}
            {modalPedidoAbierto && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  zIndex: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "20px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "500px",
                    maxHeight: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  }}
                >
                  {/* Cabecera del Modal */}
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#222" }}>
                      📋 Generar Pedido a Proveedor
                    </h3>
                    <button
                      onClick={() => setModalPedidoAbierto(false)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer",
                        color: "#666",
                      }}
                    >
                      ✖
                    </button>
                  </div>

                  {/* Cuerpo del Modal (Scrollable) */}
                  <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
                    <p
                      style={{
                        margin: "0 0 15px",
                        fontSize: "13px",
                        color: "#666",
                      }}
                    >
                      Estos productos tienen stock bajo o están agotados.
                      Ingresa cuántos quieres pedir.
                    </p>

                    {/* Lista de Items */}
                    {itemsPedido.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: "#f8f9fa",
                          padding: "10px",
                          borderRadius: "8px",
                          marginBottom: "8px",
                          border: "1px solid #eee",
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: "10px" }}>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "600",
                              fontSize: "13px",
                              color: "#333",
                            }}
                          >
                            {item.nombre}
                          </p>
                          {/* === NUEVO: Muestra la descripción === */}
                          {item.descripcion && (
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: "11px",
                                color: "#777",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "200px",
                              }}
                            >
                              {item.descripcion}
                            </p>
                          )}
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              color:
                                Number(item.stockActual) === 0
                                  ? "#dc3545"
                                  : "#fd7e14",
                              fontWeight: "600",
                            }}
                          >
                            Stock actual: {item.stockActual}
                          </p>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="number"
                            min="1"
                            placeholder="Cant."
                            value={item.cantidad}
                            onChange={(e) =>
                              actualizarCantidadPedido(item.id, e.target.value)
                            }
                            onWheel={(e) => e.target.blur()}
                            style={{
                              width: "60px",
                              padding: "6px",
                              borderRadius: "6px",
                              border: "1px solid #ccc",
                              fontSize: "13px",
                              textAlign: "center",
                            }}
                          />
                          <button
                            onClick={() => eliminarItemPedido(item.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#dc3545",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Buscador para agregar productos extra */}
                    <div
                      style={{
                        marginTop: "20px",
                        borderTop: "1px dashed #ccc",
                        paddingTop: "15px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        ¿Quieres pedir algo más?
                      </p>
                      <input
                        type="text"
                        placeholder="Buscar otro producto para agregar..."
                        value={busquedaExtra}
                        onChange={(e) => setBusquedaExtra(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />

                      {/* === LISTA PERMANENTE DE PRODUCTOS (Filtrable y ordenada por stock) === */}
                      <div
                        style={{
                          marginTop: "10px",
                          border: "1px solid #eee",
                          borderRadius: "8px",
                          maxHeight: "160px",
                          overflowY: "auto",
                          backgroundColor: "white",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        {productos
                          .filter(
                            (p) => !itemsPedido.find((i) => i.id === p._id),
                          ) // Oculta los que ya están en la lista de arriba
                          .filter((p) =>
                            p.nombre
                              .toLowerCase()
                              .includes(busquedaExtra.toLowerCase()),
                          ) // Aplica el buscador si escribe algo
                          .sort((a, b) => Number(a.stock) - Number(b.stock)) // Ordena del que tiene menos stock al que tiene más
                          .map((p) => (
                            <div
                              key={p._id}
                              onClick={() => agregarProductoExtraAlPedido(p)}
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #eee",
                                fontSize: "13px",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,
                                  paddingRight: "10px",
                                  minWidth: 0,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span
                                    style={{ fontWeight: "600", color: "#333" }}
                                  >
                                    {p.nombre}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color:
                                        Number(p.stock) === 0
                                          ? "#dc3545"
                                          : "#666",
                                      marginLeft: "8px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    (Stock: {p.stock})
                                  </span>
                                </div>
                                {/* === NUEVO: Muestra la descripción === */}
                                {p.descripcion && (
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#888",
                                      marginTop: "2px",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {p.descripcion}
                                  </div>
                                )}
                              </div>
                              <span
                                style={{
                                  color: "#0d6efd",
                                  fontWeight: "700",
                                  fontSize: "12px",
                                  backgroundColor: "#eef6ff",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                + Agregar
                              </span>
                            </div>
                          ))}

                        {/* Mensaje por si la búsqueda no arroja resultados */}
                        {productos.filter(
                          (p) =>
                            !itemsPedido.find((i) => i.id === p._id) &&
                            p.nombre
                              .toLowerCase()
                              .includes(busquedaExtra.toLowerCase()),
                        ).length === 0 && (
                          <div
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#999",
                              fontSize: "12px",
                            }}
                          >
                            No hay más productos para agregar.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pie del Modal (Botón Copiar) */}
                  <div
                    style={{
                      padding: "16px",
                      borderTop: "1px solid #eee",
                      backgroundColor: "#f9fafb",
                      borderRadius: "0 0 12px 12px",
                    }}
                  >
                    <button
                      onClick={copiarPedidoWhatsapp}
                      style={{
                        width: "100%",
                        backgroundColor: "#198754",
                        color: "white",
                        border: "none",
                        padding: "10px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "14px",
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect
                          x="8"
                          y="2"
                          width="8"
                          height="4"
                          rx="1"
                          ry="1"
                        ></rect>
                      </svg>
                      Copiar Pedido para WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>{" "}
          {/* <-- Aquí cierra la zonaInventario */}
          {/* ======================================================
            MODAL DEL TICKET DE VENTA (CONFIRMACIÓN Y COMPROBANTE)
            ====================================================== */}
          {ticketAbierto && datosTicket && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.6)",
                zIndex: 10000,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  width: "100%",
                  maxWidth: "350px",
                  textAlign: "center",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  id="ticket-imprimible"
                  style={{
                    padding: "15px",
                    border: "1px dashed #ccc",
                    marginBottom: "15px",
                    textAlign: "left",
                  }}
                >
                  <h3
                    style={{
                      textAlign: "center",
                      margin: "0 0 10px 0",
                      color: "#222",
                    }}
                  >
                    📄 Ticket de Compra
                  </h3>
                  <p style={{ margin: "2px 0", fontSize: "14px" }}>
                    <strong>Fecha:</strong> {datosTicket.fecha}
                  </p>

                  {/* CAMPO DE CLIENTE AHORA DENTRO DEL TICKET */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      margin: "8px 0",
                    }}
                  >
                    <strong style={{ fontSize: "14px" }}>Cliente:</strong>
                    <input
                      type="text"
                      placeholder="Nombre (Opcional)"
                      value={clienteVenta}
                      onChange={(e) => setClienteVenta(e.target.value)}
                      disabled={ventaConfirmada} // Se bloquea si ya se confirmó la venta
                      style={{
                        flex: 1,
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        fontSize: "13px",
                        backgroundColor: ventaConfirmada ? "#f1f3f5" : "white",
                      }}
                    />
                  </div>

                  <hr
                    style={{ borderTop: "1px dashed #eee", margin: "10px 0" }}
                  />
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>
                    {datosTicket.cantidad}x {datosTicket.producto}
                  </p>
                  <p
                    style={{
                      margin: "10px 0",
                      fontSize: "20px",
                      fontWeight: "900",
                      color: "#198754",
                    }}
                  >
                    Total: ${datosTicket.monto.toFixed(2)}
                  </p>
                  <p style={{ margin: "2px 0", fontSize: "14px" }}>
                    <strong>Pago en:</strong> Efectivo
                  </p>
                  <hr
                    style={{ borderTop: "1px dashed #eee", margin: "10px 0" }}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                      Garantía (días):
                    </label>
                    <input
                      type="number"
                      value={diasGarantia}
                      onChange={(e) => setDiasGarantia(e.target.value)}
                      disabled={ventaConfirmada}
                      style={{
                        width: "60px",
                        padding: "4px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        textAlign: "center",
                        backgroundColor: ventaConfirmada ? "#f1f3f5" : "white",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {!ventaConfirmada ? (
                    // --- BOTONES DE PRE-VENTA (AÚN NO SE DESCUENTA STOCK) ---
                    <>
                      <button
                        onClick={confirmarVentaFinal}
                        style={{
                          backgroundColor: "#198754",
                          color: "white",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "none",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "15px",
                        }}
                      >
                        ✅ Confirmar y Descontar Stock
                      </button>
                      <button
                        onClick={() => {
                          setTicketAbierto(false);
                          setClienteVenta(""); // Reseteamos por si acaso
                        }}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "none",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        ❌ Cancelar Venta
                      </button>
                    </>
                  ) : (
                    // --- BOTONES POST-VENTA (YA SE CONFIRMÓ, SOLO IMPRIMIR/COPIAR) ---
                    <>
                      <button
                        onClick={() => {
                          const textoTicket = `📄 *TICKET DE COMPRA*\nFecha: ${datosTicket.fecha}\nCliente: ${clienteVenta || "Público en general"}\n\n▪️ ${datosTicket.cantidad}x ${datosTicket.producto}\n*Total pagado: $${datosTicket.monto.toFixed(2)} (Efectivo)*\n\n🛡️ Garantía válida por ${diasGarantia} días.\n¡Gracias por su compra!`;
                          navigator.clipboard
                            .writeText(textoTicket)
                            .then(() =>
                              alert(
                                "¡Ticket copiado para enviar por WhatsApp!",
                              ),
                            );
                        }}
                        style={{
                          backgroundColor: "#2563eb",
                          color: "white",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "none",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        📋 Copiar Texto a WhatsApp
                      </button>
                      <button
                        onClick={() => window.print()}
                        style={{
                          backgroundColor: "#198754",
                          color: "white",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "none",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        🖨️ Imprimir / Guardar PDF
                      </button>
                      <button
                        onClick={() => {
                          setTicketAbierto(false);
                          setClienteVenta(""); // Limpiamos para la próxima venta
                        }}
                        style={{
                          backgroundColor: "transparent",
                          color: "#666",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Cerrar Ticket
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
export default App;
