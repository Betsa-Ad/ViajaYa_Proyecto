// Servicio para conectar con la API backend en http://localhost:3000
const API_BASE_URL = 'http://localhost:3000/api';

// Obtiene la cabecera de autenticacion con el token de localStorage
function getAuthHeaders(tokenParam) {
  const token = tokenParam || localStorage.getItem('viajaya_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Peticion HTTP con manejo de errores RFC 7807 y deteccion de sesion expirada (401)
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('viajaya_token');
        localStorage.removeItem('viajaya_admin');
        window.dispatchEvent(new CustomEvent('viajaya_sesion_expirada'));
      }

      const mensajeError = data?.detail || data?.title || data?.message || `Error ${response.status}: ${response.statusText}`;
      const error = new Error(mensajeError);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      error.message = 'No se pudo conectar con el servidor backend en http://localhost:3000. Por favor verifica que esté en ejecución.';
    }
    throw error;
  }
}

// Obtener catalogo de destinos activos
export async function getDestinos() {
  const res = await request('/destinos');
  return res.data || [];
}

// Consultar cupos disponibles para un destino y fecha especifica (RN-01)
export async function getCuposDisponibles(destinoId, fecha) {
  try {
    const res = await request(`/reservas/cupos/${encodeURIComponent(destinoId)}?fecha=${encodeURIComponent(fecha)}`);
    return res.data;
  } catch {
    return null;
  }
}

// Cotizar tarifa sin persistir datos
export async function cotizarTarifa(precioBase, numPersonas) {
  const res = await request('/cotizar', {
    method: 'POST',
    body: JSON.stringify({ precioBase, numPersonas }),
  });
  return res.data;
}

// Registrar nueva reserva con pago simulado
export async function crearReserva(datosReserva) {
  const res = await request('/reservas', {
    method: 'POST',
    body: JSON.stringify(datosReserva),
  });
  return res.data;
}

// Consultar reserva por codigo de confirmacion
export async function getReservaPorCodigo(codigo) {
  const res = await request(`/reservas/codigo/${encodeURIComponent(codigo)}`);
  return res.data;
}

// Consultar reservas por correo electronico
export async function getReservasPorCorreo(correo) {
  const res = await request(`/reservas/correo/${encodeURIComponent(correo)}`);
  return res.data || [];
}

// Reprogramar fecha de viaje
export async function reprogramarReserva(idReserva, nuevaFecha) {
  const res = await request(`/reservas/${idReserva}/reprogramar`, {
    method: 'PATCH',
    body: JSON.stringify({ nuevaFecha }),
  });
  return res.data;
}

// Cancelar reserva
export async function cancelarReserva(idReserva) {
  const res = await request(`/reservas/${idReserva}/cancelar`, {
    method: 'PATCH',
  });
  return res.data;
}

// Autenticacion de administrador
export async function loginAdmin(correo, contrasena) {
  const res = await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ correo, contrasena }),
  });
  return res;
}

// Consulta de reservas para auditoria administrativa con token de localStorage
export async function getAdminReservas(token) {
  const res = await request('/admin/reservas', {
    headers: getAuthHeaders(token),
  });
  return res.data || [];
}

// Crear nuevo destino turistico con token de localStorage
export async function crearDestino(datosDestino, token) {
  const res = await request('/destinos', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(datosDestino),
  });
  return res.data;
}

// Editar destino existente con token de localStorage
export async function editarDestino(id, datosDestino, token) {
  const res = await request(`/destinos/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(datosDestino),
  });
  return res.data;
}

// Desactivar destino con token de localStorage
export async function desactivarDestino(id, token) {
  const res = await request(`/destinos/${id}/desactivar`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
  });
  return res.data;
}
