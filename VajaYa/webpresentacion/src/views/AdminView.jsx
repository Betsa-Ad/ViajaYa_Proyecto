import React, { useState, useEffect } from 'react';
import {
  loginAdmin,
  getAdminReservas,
  crearDestino,
  editarDestino,
  desactivarDestino,
} from '../services/api';
import {
  formatearColones,
  obtenerFotoDestino,
  guardarFotoDestino,
  comprimirImagen,
  corregirTexto,
} from '../utils/imagenes';
import Alerta from '../components/Alerta';

// Panel administrativo para login, destinos y auditoria de reservas
export default function AdminView({ destinos, onRecargarDestinos }) {
  const [token, setToken] = useState(() => localStorage.getItem('viajaya_token') || '');
  const [adminInfo, setAdminInfo] = useState(() => {
    const guardado = localStorage.getItem('viajaya_admin');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [correoLogin, setCorreoLogin] = useState('betsadasa02@gmail.com');
  const [passwordLogin, setPasswordLogin] = useState('12345');
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  const [tabActiva, setTabActiva] = useState('destinos');
  const [reservas, setReservas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(false);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  const [listaDestinos, setListaDestinos] = useState(destinos);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaCapacidad, setNuevaCapacidad] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [imagenPreview, setImagenPreview] = useState('');
  const [guardandoDestino, setGuardandoDestino] = useState(false);

  const [destinoEditando, setDestinoEditando] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  // Escucha evento global de expiracion de sesion 401 para volver al login limpiamente
  useEffect(() => {
    const handleSesionExpirada = () => {
      setToken('');
      setAdminInfo(null);
      setDestinoEditando(null);
      setErrorLogin('Tu sesión ha expirado o requiere autenticación. Por favor inicia sesión nuevamente.');
    };
    window.addEventListener('viajaya_sesion_expirada', handleSesionExpirada);
    return () => window.removeEventListener('viajaya_sesion_expirada', handleSesionExpirada);
  }, []);

  // Mantiene sincronizada la lista local de destinos sin perder inactivos
  useEffect(() => {
    setListaDestinos((prev) => {
      const mapaInactivos = new Map(
        prev.filter((d) => !d.activo).map((d) => [String(d.id), d])
      );
      const combinados = destinos.map((d) => ({ ...d }));
      mapaInactivos.forEach((inactivo, id) => {
        if (!combinados.some((d) => String(d.id) === id)) {
          combinados.push(inactivo);
        }
      });
      return combinados;
    });
  }, [destinos]);

  // Autenticacion del administrador y almacenamiento del token en localStorage
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    setCargandoLogin(true);

    try {
      const res = await loginAdmin(correoLogin.trim(), passwordLogin.trim());
      setToken(res.token);
      setAdminInfo(res.admin);
      localStorage.setItem('viajaya_token', res.token);
      localStorage.setItem('viajaya_admin', JSON.stringify(res.admin));
      setAlerta({ tipo: 'exito', mensaje: `Bienvenido(a), ${res.admin.nombre}` });
    } catch (err) {
      setErrorLogin(err.message || 'Error al iniciar sesión.');
    } finally {
      setCargandoLogin(false);
    }
  };

  // Cierre de sesion del administrador
  const handleLogout = () => {
    setToken('');
    setAdminInfo(null);
    localStorage.removeItem('viajaya_token');
    localStorage.removeItem('viajaya_admin');
  };

  // Carga lista de reservas registradas para auditoria
  const cargarReservas = async () => {
    setCargandoReservas(true);
    try {
      const data = await getAdminReservas();
      setReservas(data);
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
        setErrorLogin('Tu sesión ha expirado. Por favor ingresa tus credenciales nuevamente.');
        return;
      }
      setAlerta({ tipo: 'error', mensaje: err.message || 'Error al cargar las reservas.' });
    } finally {
      setCargandoReservas(false);
    }
  };

  useEffect(() => {
    if (token && tabActiva === 'reservas') {
      cargarReservas();
    }
  }, [token, tabActiva]);

  // Manejo de archivo de imagen local con compresion a tamano ligero
  const handleSeleccionarArchivo = async (e) => {
    const archivo = e.target.files && e.target.files[0];
    if (!archivo) return;

    try {
      const dataUrlComprimida = await comprimirImagen(archivo, 600, 0.7);
      setImagenPreview(dataUrlComprimida);
      setImagenUrl('');
    } catch {
      const lector = new FileReader();
      lector.onload = (evento) => {
        setImagenPreview(evento.target.result);
        setImagenUrl('');
      };
      lector.readAsDataURL(archivo);
    }
  };

  // Manejo de cambio en la direccion URL de imagen
  const handleCambiarUrl = (e) => {
    const valor = e.target.value;
    setImagenUrl(valor);
    setImagenPreview(valor);
  };

  // Restablece todos los campos del formulario de creacion
  const handleLimpiarCampos = () => {
    setNuevoNombre('');
    setNuevaDescripcion('');
    setNuevoPrecio('');
    setNuevaCapacidad('');
    setImagenUrl('');
    setImagenPreview('');
  };

  // Registro de un nuevo destino turistico
  const handleCrearDestino = async (e) => {
    e.preventDefault();
    setAlerta({ tipo: '', mensaje: '' });

    const precioNum = Number(nuevoPrecio);
    const capacidadNum = Number(nuevaCapacidad);

    if (!nuevoNombre.trim()) {
      setAlerta({ tipo: 'error', mensaje: 'Por favor ingrese el nombre del destino.' });
      return;
    }
    if (isNaN(precioNum) || precioNum <= 0) {
      setAlerta({ tipo: 'error', mensaje: 'El precio base debe ser un número mayor a cero.' });
      return;
    }
    if (isNaN(capacidadNum) || capacidadNum <= 0) {
      setAlerta({ tipo: 'error', mensaje: 'La capacidad diaria debe ser un número mayor a cero.' });
      return;
    }

    setGuardandoDestino(true);
    try {
      const creado = await crearDestino({
        nombre: nuevoNombre.trim(),
        descripcion: corregirTexto(nuevaDescripcion.trim()),
        precioBase: precioNum,
        capacidadDiaria: capacidadNum,
      });

      // Prioriza la direccion URL ingresada o la imagen local comprimida
      const fotoAGuardar = imagenUrl.trim() || imagenPreview;
      if (fotoAGuardar) {
        guardarFotoDestino(creado?.id, nuevoNombre.trim(), fotoAGuardar);
      }

      handleLimpiarCampos();
      setAlerta({ tipo: 'exito', mensaje: `Destino "${creado?.nombre || nuevoNombre.trim()}" guardado y publicado exitosamente.` });
      if (onRecargarDestinos) onRecargarDestinos();
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
        setErrorLogin('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        return;
      }
      setAlerta({ tipo: 'error', mensaje: err.message || 'Error al crear el destino.' });
    } finally {
      setGuardandoDestino(false);
    }
  };

  // Desactivacion logica del destino
  const handleDesactivarDestino = async (id, nombre) => {
    const confirmar = window.confirm(`¿Está seguro de desactivar el destino "${nombre}"?`);
    if (!confirmar) return;

    try {
      await desactivarDestino(id);
      setListaDestinos((prev) =>
        prev.map((dest) => (String(dest.id) === String(id) ? { ...dest, activo: false } : dest))
      );
      setAlerta({ tipo: 'exito', mensaje: `Destino "${nombre}" desactivado exitosamente.` });
      if (onRecargarDestinos) onRecargarDestinos();
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
        setErrorLogin('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        return;
      }
      setAlerta({ tipo: 'error', mensaje: err.message || 'Error al desactivar el destino.' });
    }
  };

  // Abre el modal de edicion inicializando campos limpios y corrigiendo la descripcion
  const handleAbrirEdicion = (dest) => {
    const descCorregida = corregirTexto(dest.descripcion || '');
    setDestinoEditando({
      ...dest,
      descripcion: descCorregida,
      imagenUrl: '',
      nuevaImagen: '',
      imagenPreview: obtenerFotoDestino(dest.nombre, dest.id),
    });
  };

  // Manejo de archivo de imagen local en el modal de edicion con compresion
  const handleSeleccionarArchivoEdicion = async (e) => {
    const archivo = e.target.files && e.target.files[0];
    if (!archivo) return;

    try {
      const dataUrlComprimida = await comprimirImagen(archivo, 600, 0.7);
      setDestinoEditando((prev) => ({
        ...prev,
        nuevaImagen: dataUrlComprimida,
        imagenPreview: dataUrlComprimida,
        imagenUrl: '',
      }));
    } catch {
      const lector = new FileReader();
      lector.onload = (ev) => {
        setDestinoEditando((prev) => ({
          ...prev,
          nuevaImagen: ev.target.result,
          imagenPreview: ev.target.result,
          imagenUrl: '',
        }));
      };
      lector.readAsDataURL(archivo);
    }
  };

  // Manejo de URL de imagen en el modal de edicion
  const handleCambiarUrlEdicion = (e) => {
    const valor = e.target.value;
    setDestinoEditando((prev) => ({
      ...prev,
      imagenUrl: valor,
      imagenPreview: valor || obtenerFotoDestino(prev.nombre, prev.id),
      nuevaImagen: '',
    }));
  };

  // Guardado de edicion del destino
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!destinoEditando) return;

    const precioNum = Number(destinoEditando.precioBase);
    const capacidadNum = Number(destinoEditando.capacidadDiaria);
    const descCorregida = corregirTexto((destinoEditando.descripcion || '').trim());

    if (!destinoEditando.nombre?.trim()) {
      setAlerta({ tipo: 'error', mensaje: 'Por favor complete el nombre del destino.' });
      return;
    }
    if (isNaN(precioNum) || precioNum <= 0) {
      setAlerta({ tipo: 'error', mensaje: 'El precio base debe ser un número mayor a cero.' });
      return;
    }
    if (isNaN(capacidadNum) || capacidadNum <= 0) {
      setAlerta({ tipo: 'error', mensaje: 'La capacidad diaria debe ser un número mayor a cero.' });
      return;
    }

    setGuardandoEdicion(true);
    try {
      await editarDestino(destinoEditando.id, {
        nombre: destinoEditando.nombre.trim(),
        descripcion: descCorregida,
        precioBase: precioNum,
        capacidadDiaria: capacidadNum,
      });

      // Prioriza la URL de imagen pegada o el archivo comprimido cargado
      const urlLimpia = (destinoEditando.imagenUrl || '').trim();
      const fotoAGuardar = urlLimpia || destinoEditando.nuevaImagen;
      if (fotoAGuardar) {
        guardarFotoDestino(destinoEditando.id, destinoEditando.nombre, fotoAGuardar);
      }

      setListaDestinos((prev) =>
        prev.map((d) =>
          String(d.id) === String(destinoEditando.id)
            ? {
                ...d,
                nombre: destinoEditando.nombre.trim(),
                descripcion: descCorregida,
                precioBase: precioNum,
                capacidadDiaria: capacidadNum,
              }
            : d
        )
      );

      setDestinoEditando(null);
      setAlerta({ tipo: 'exito', mensaje: 'Destino actualizado exitosamente.' });
      if (onRecargarDestinos) onRecargarDestinos();
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
        setDestinoEditando(null);
        setErrorLogin('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        return;
      }
      setAlerta({ tipo: 'error', mensaje: err.message || 'Error al editar el destino.' });
    } finally {
      setGuardandoEdicion(false);
    }
  };

  if (!token) {
    return (
      <section className="seccion">
        <div className="contenedor">
          <div className="seccion-titulo">
            <h2>Acceso Administrativo</h2>
            <p>Ingreso restringido para gestores y administradores de ViajaYa.</p>
          </div>

          <div className="admin-login-caja">
            {errorLogin && <Alerta tipo="error" mensaje={errorLogin} />}

            <form onSubmit={handleLogin} className="formulario">
              <div className="campo">
                <label htmlFor="correoAdmin">Correo Electrónico *</label>
                <input
                  id="correoAdmin"
                  type="email"
                  value={correoLogin}
                  onChange={(e) => setCorreoLogin(e.target.value)}
                  placeholder="admin@viajaya.com"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="passAdmin">Contraseña *</label>
                <input
                  id="passAdmin"
                  type="password"
                  value={passwordLogin}
                  onChange={(e) => setPasswordLogin(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-oceano"
                disabled={cargandoLogin}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {cargandoLogin ? 'Autenticando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--color-arena-claro)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--color-texto-suave)', border: '1px solid var(--color-borde-suave)' }}>
              Credenciales de prueba registradas: correo betsadasa02@gmail.com, contraseña 12345
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="seccion">
      <div className="contenedor">
        <div className="admin-header">
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-azul-oceano)' }}>Panel de Control Administrativo</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-texto-suave)' }}>
              Sesión activa: <strong>{adminInfo?.nombre}</strong> ({adminInfo?.correo}) • Rol: <strong>{adminInfo?.rol}</strong>
            </p>
          </div>
          <button className="btn btn-secundario btn-sm" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

        {alerta.mensaje && (
          <Alerta
            tipo={alerta.tipo}
            mensaje={alerta.mensaje}
            onCerrar={() => setAlerta({ tipo: '', mensaje: '' })}
          />
        )}

        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${tabActiva === 'destinos' ? 'activo' : ''}`}
            onClick={() => setTabActiva('destinos')}
          >
            Gestión de Destinos
          </button>
          <button
            className={`admin-tab-btn ${tabActiva === 'reservas' ? 'activo' : ''}`}
            onClick={() => setTabActiva('reservas')}
          >
            Monitoreo de Reservas ({reservas.length})
          </button>
        </div>

        {tabActiva === 'destinos' && (
          <div>
            {/* Formulario para crear nuevo destino con soporte de imagenes */}
            <div style={{ background: 'var(--color-blanco-calido)', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(18, 72, 90, 0.08)', marginBottom: '32px', border: '1px solid var(--color-borde-suave)' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--color-azul-oceano)' }}>+ Crear Nuevo Destino</h3>
              <form onSubmit={handleCrearDestino} className="formulario">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="campo">
                    <label htmlFor="nuevoNombreDestino">Nombre del Destino *</label>
                    <input
                      id="nuevoNombreDestino"
                      type="text"
                      placeholder="Ej: Monteverde Bosque Nuboso"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="nuevoPrecioDestino">Precio Base por Persona (₡) *</label>
                    <input
                      id="nuevoPrecioDestino"
                      type="number"
                      placeholder="Ej: 55000"
                      min="1"
                      value={nuevoPrecio}
                      onChange={(e) => setNuevoPrecio(e.target.value)}
                      required
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="nuevaCapacidadDestino">Capacidad Diaria (Personas) *</label>
                    <input
                      id="nuevaCapacidadDestino"
                      type="number"
                      placeholder="Ej: 12"
                      min="1"
                      value={nuevaCapacidad}
                      onChange={(e) => setNuevaCapacidad(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="campo">
                  <label htmlFor="nuevaDescDestino">Descripción del Destino</label>
                  <textarea
                    id="nuevaDescDestino"
                    rows="2"
                    placeholder="Breve reseña turística, atractivos y recomendaciones..."
                    value={nuevaDescripcion}
                    onChange={(e) => setNuevaDescripcion(e.target.value)}
                  />
                </div>

                {/* Carga de fotografia por archivo local o enlace web */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', background: 'var(--color-arena)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-borde-suave)' }}>
                  <div className="campo">
                    <label htmlFor="archivoImagenDestino">Cargar imagen desde el dispositivo</label>
                    <input
                      id="archivoImagenDestino"
                      type="file"
                      accept="image/*"
                      onChange={handleSeleccionarArchivo}
                    />
                    <small className="campo-ayuda">Formatos JPG, PNG, WEBP (se comprime automáticamente).</small>
                  </div>

                  <div className="campo">
                    <label htmlFor="urlImagenDestino">O ingresar dirección URL de imagen</label>
                    <input
                      id="urlImagenDestino"
                      type="url"
                      placeholder="https://ejemplo.com/fotografia.jpg"
                      value={imagenUrl}
                      onChange={handleCambiarUrl}
                    />
                    <small className="campo-ayuda">Enlace directo a una imagen en internet.</small>
                  </div>
                </div>

                {/* Vista previa de la imagen seleccionada */}
                {imagenPreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--color-blanco-calido)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--color-turquesa)' }}>
                    <img
                      src={imagenPreview}
                      alt="Vista previa"
                      style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: 'var(--color-azul-oceano)', fontSize: '0.9rem' }}>Vista previa de la fotografía</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-suave)', margin: 0 }}>
                        Esta imagen se mostrará de inmediato en el catálogo de destinos.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secundario btn-sm"
                      onClick={() => { setImagenPreview(''); setImagenUrl(''); }}
                    >
                      Quitar
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    className="btn btn-turquesa"
                    disabled={guardandoDestino}
                  >
                    {guardandoDestino ? 'Guardando destino...' : 'Guardar y Publicar Destino'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secundario"
                    onClick={handleLimpiarCampos}
                    disabled={guardandoDestino}
                  >
                    Limpiar campos
                  </button>
                </div>
              </form>
            </div>

            {/* Tabla de destinos */}
            <h3 style={{ marginBottom: '14px', color: 'var(--color-azul-oceano)' }}>Destinos Actuales en el Sistema</h3>
            <div className="tabla-responsive">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Precio Base</th>
                    <th>Cupo Máx/Día</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {listaDestinos.map((dest) => (
                    <tr key={dest.id}>
                      <td style={{ width: '70px' }}>
                        <img
                          src={obtenerFotoDestino(dest.nombre, dest.id)}
                          alt={dest.nombre}
                          style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td>#{dest.id}</td>
                      <td><strong>{dest.nombre}</strong></td>
                      <td>{formatearColones(dest.precioBase)}</td>
                      <td>{dest.capacidadDiaria} personas</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: 'bold',
                          backgroundColor: dest.activo ? 'var(--color-verde-agua-claro)' : 'var(--color-error-fondo)',
                          color: dest.activo ? 'var(--color-turquesa)' : 'var(--color-error)',
                          border: `1px solid ${dest.activo ? 'var(--color-verde-agua)' : 'var(--color-error)'}`,
                        }}>
                          {dest.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secundario btn-sm"
                            onClick={() => handleAbrirEdicion(dest)}
                          >
                            Editar
                          </button>
                          {dest.activo && (
                            <button
                              type="button"
                              className="btn btn-peligro btn-sm"
                              onClick={() => handleDesactivarDestino(dest.id, dest.nombre)}
                            >
                              Desactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tabActiva === 'reservas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: 'var(--color-azul-oceano)' }}>Registro General de Reservas (Auditoría de Reservas)</h3>
              <button className="btn btn-oceano btn-sm" onClick={cargarReservas} disabled={cargandoReservas}>
                {cargandoReservas ? 'Actualizando...' : 'Actualizar Tabla'}
              </button>
            </div>

            <div className="tabla-responsive">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Destino</th>
                    <th>Fecha Viaje</th>
                    <th>Personas</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-texto-suave)' }}>
                        {cargandoReservas ? 'Cargando reservas...' : 'No se encontraron reservas registradas.'}
                      </td>
                    </tr>
                  ) : (
                    reservas.map((r) => (
                      <tr key={r.id}>
                        <td>#{r.id}</td>
                        <td><strong style={{ color: 'var(--color-azul-oceano)' }}>{r.codigoConfirmacion || 'N/A'}</strong></td>
                        <td>
                          <div><strong>{r.clienteNombre}</strong></div>
                          <small style={{ color: 'var(--color-texto-suave)' }}>{r.clienteEmail}</small>
                        </td>
                        <td>{r.destinoNombre || `Destino #${r.destinoId}`}</td>
                        <td><strong>{r.fechaViaje}</strong></td>
                        <td>{r.numPersonas}</td>
                        <td><strong>{formatearColones(r.total)}</strong></td>
                        <td>
                          <span className={`badge-estado badge-${r.estado?.toLowerCase()}`}>
                            {r.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal para editar destino */}
        {destinoEditando && (
          <div className="modal-overlay" onClick={() => setDestinoEditando(null)}>
            <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Editar Destino #{destinoEditando.id}</h3>
                <button className="modal-cerrar" onClick={() => setDestinoEditando(null)}>✕</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleGuardarEdicion} className="formulario">
                  <div className="campo">
                    <label htmlFor="editarNombreDestino">Nombre del Destino *</label>
                    <input
                      id="editarNombreDestino"
                      type="text"
                      value={destinoEditando.nombre}
                      onChange={(e) => setDestinoEditando({ ...destinoEditando, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="editarPrecioDestino">Precio Base por Persona (₡) *</label>
                    <input
                      id="editarPrecioDestino"
                      type="number"
                      min="1"
                      value={destinoEditando.precioBase}
                      onChange={(e) => setDestinoEditando({ ...destinoEditando, precioBase: e.target.value })}
                      required
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="editarCapacidadDestino">Capacidad Diaria (Personas) *</label>
                    <input
                      id="editarCapacidadDestino"
                      type="number"
                      min="1"
                      value={destinoEditando.capacidadDiaria}
                      onChange={(e) => setDestinoEditando({ ...destinoEditando, capacidadDiaria: e.target.value })}
                      required
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="editarDescDestino">Descripción</label>
                    <textarea
                      id="editarDescDestino"
                      rows="3"
                      value={destinoEditando.descripcion || ''}
                      onChange={(e) => setDestinoEditando({ ...destinoEditando, descripcion: e.target.value })}
                    />
                  </div>

                  {/* Carga de fotografia por archivo local o direccion URL */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', background: 'var(--color-arena)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-borde-suave)' }}>
                    <div className="campo">
                      <label htmlFor="editarFotoDestino">Cargar imagen desde el dispositivo</label>
                      <input
                        id="editarFotoDestino"
                        type="file"
                        accept="image/*"
                        onChange={handleSeleccionarArchivoEdicion}
                      />
                      <small className="campo-ayuda">Formatos JPG, PNG, WEBP (se comprime automáticamente).</small>
                    </div>

                    <div className="campo">
                      <label htmlFor="editarUrlFotoDestino">O ingresar dirección URL de imagen</label>
                      <input
                        id="editarUrlFotoDestino"
                        type="url"
                        placeholder="https://ejemplo.com/fotografia.jpg"
                        value={destinoEditando.imagenUrl || ''}
                        onChange={handleCambiarUrlEdicion}
                      />
                      <small className="campo-ayuda">Enlace directo a una imagen en internet.</small>
                    </div>
                  </div>

                  {/* Vista previa de la fotografia seleccionada en edicion */}
                  {destinoEditando.imagenPreview && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--color-blanco-calido)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--color-turquesa)' }}>
                      <img
                        src={destinoEditando.imagenPreview}
                        alt="Vista previa de destino"
                        style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: 'var(--color-azul-oceano)', fontSize: '0.9rem' }}>Vista previa de la fotografía</strong>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-suave)', margin: 0 }}>
                          {destinoEditando.imagenUrl ? 'URL de imagen vinculada' : (destinoEditando.nuevaImagen ? 'Nueva imagen local comprimida' : 'Fotografía actual del destino')}
                        </p>
                      </div>
                      {(destinoEditando.imagenUrl || destinoEditando.nuevaImagen) && (
                        <button
                          type="button"
                          className="btn btn-secundario btn-sm"
                          onClick={() => setDestinoEditando({ ...destinoEditando, imagenUrl: '', nuevaImagen: '', imagenPreview: obtenerFotoDestino(destinoEditando.nombre, destinoEditando.id) })}
                        >
                          Restablecer
                        </button>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secundario"
                      onClick={() => setDestinoEditando(null)}
                      style={{ flex: 1 }}
                      disabled={guardandoEdicion}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-turquesa"
                      style={{ flex: 1 }}
                      disabled={guardandoEdicion}
                    >
                      {guardandoEdicion ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
