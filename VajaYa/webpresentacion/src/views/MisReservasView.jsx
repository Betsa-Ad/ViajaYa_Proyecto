import React, { useState } from 'react';
import { getReservaPorCodigo, reprogramarReserva, cancelarReserva } from '../services/api';
import { formatearColones } from '../utils/imagenes';
import Alerta from '../components/Alerta';

// Vista de autogestion de reservas sin contrasenas
export default function MisReservasView() {
  const [codigo, setCodigo] = useState('');
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [reserva, setReserva] = useState(null);

  const [mostrandoModalReprogramar, setMostrandoModalReprogramar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [cargandoAccion, setCargandoAccion] = useState(false);

  // Consulta la reserva por codigo y verifica que el correo coincida
  const handleConsultar = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');
    setReserva(null);

    const codLimpio = codigo.trim();
    const corLimpio = correo.trim().toLowerCase();

    if (!codLimpio || !corLimpio) {
      setError('Por favor ingrese tanto el código de confirmación como su correo electrónico.');
      return;
    }

    setCargando(true);
    try {
      const data = await getReservaPorCodigo(codLimpio);

      if (!data || data.clienteEmail?.toLowerCase() !== corLimpio) {
        throw new Error('No se encontró ninguna reserva que coincida con ese código y correo electrónico.');
      }

      setReserva(data);
    } catch (err) {
      setError(err.message || 'Error al consultar la reserva.');
    } finally {
      setCargando(false);
    }
  };

  // Calcula horas restantes entre la hora actual y la fecha de viaje
  const calcularHorasRestantes = (fechaViajeStr) => {
    if (!fechaViajeStr) return 0;
    const ahora = new Date();
    const viaje = new Date(`${fechaViajeStr}T00:00:00Z`);
    const diffMs = viaje.getTime() - ahora.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const horasRestantes = reserva ? calcularHorasRestantes(reserva.fechaViaje) : 0;
  const permiteModificaciones = horasRestantes > 48 && reserva?.estado !== 'CANCELADA';

  // Cancelacion respetando la ventana de 48 horas
  const handleCancelar = async () => {
    if (!permiteModificaciones) return;

    const confirmar = window.confirm(
      '¿Está seguro de que desea cancelar esta reserva? Esta acción no se puede deshacer.'
    );
    if (!confirmar) return;

    setCargandoAccion(true);
    setError('');
    setMensajeExito('');

    try {
      const actualizada = await cancelarReserva(reserva.id);
      setReserva(actualizada);
      setMensajeExito('La reserva ha sido cancelada exitosamente.');
    } catch (err) {
      setError(err.message || 'Error al cancelar la reserva.');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Reprogramacion de fecha respetando la ventana de 48 horas
  const handleReprogramar = async (e) => {
    e.preventDefault();
    if (!nuevaFecha) {
      setError('Por favor seleccione una nueva fecha de viaje.');
      return;
    }

    setCargandoAccion(true);
    setError('');
    setMensajeExito('');

    try {
      const actualizada = await reprogramarReserva(reserva.id, nuevaFecha);
      setReserva(actualizada);
      setMostrandoModalReprogramar(false);
      setMensajeExito(`Reserva reprogramada exitosamente para la nueva fecha: ${actualizada.fechaViaje}.`);
    } catch (err) {
      setError(err.message || 'Error al reprogramar la reserva.');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Impresion nativa del comprobante formal
  const handleDescargarPDF = () => {
    window.print();
  };

  // Desglose de tarifa de la reserva
  const totalMonto = reserva?.total || 0;
  const subtotalMonto = reserva?.subtotal || (totalMonto > 0 ? Math.round((totalMonto / 1.13) * 100) / 100 : 0);
  const ivaMonto = reserva?.iva || (totalMonto > 0 ? Math.round((totalMonto - subtotalMonto) * 100) / 100 : 0);

  return (
    <section className="seccion">
      <div className="contenedor">
        <div className="seccion-titulo no-print">
          <h2>Mis Reservas</h2>
          <p>
            Consultá, reprogramá o cancelá tu reserva de manera directa sin necesidad de contraseñas.
          </p>
        </div>

        {/* Formulario de consulta */}
        <div className="tarjeta-consulta no-print">
          <form onSubmit={handleConsultar} className="formulario">
            <div className="campo">
              <label htmlFor="codigo">Código de Confirmación *</label>
              <input
                id="codigo"
                type="text"
                placeholder="Ej: VY-1234-56"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
              />
              <small className="campo-ayuda">El código generado al realizar el pago</small>
            </div>

            <div className="campo">
              <label htmlFor="correo">Correo Electrónico del Titular *</label>
              <input
                id="correo"
                type="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
              <small className="campo-ayuda">Debe coincidir con el correo registrado al reservar</small>
            </div>

            <button
              type="submit"
              className="btn btn-oceano"
              disabled={cargando}
              style={{ width: '100%', marginTop: '6px' }}
            >
              {cargando ? 'Buscando reserva...' : 'Consultar Reserva'}
            </button>
          </form>
        </div>

        <div className="no-print" style={{ maxWidth: '650px', margin: '20px auto 0 auto' }}>
          {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} />}
          {mensajeExito && <Alerta tipo="exito" mensaje={mensajeExito} onCerrar={() => setMensajeExito('')} />}
        </div>

        {/* Tarjeta con los datos del comprobante */}
        {reserva && (
          <div className="tarjeta-reserva-detalle" style={{ maxWidth: '650px', margin: '24px auto 0 auto' }}>
            <div className="comprobante-encabezado print-only" style={{ marginBottom: '16px' }}>
              <div>
                <h2 className="comprobante-marca-titulo">ViajaYa Costa Rica</h2>
                <p className="comprobante-marca-subtitulo">Comprobante Oficial de Reserva Turística</p>
              </div>
              <div className="comprobante-emision">
                <span>Emisión: {new Date().toLocaleDateString('es-CR')}</span>
              </div>
            </div>

            <div className="reserva-header-detalle">
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-texto-suave)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Comprobante de Reserva Oficial
                </span>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--color-azul-oceano)' }}>{reserva.codigoConfirmacion}</h3>
              </div>

              <div>
                <span className={`badge-estado badge-${reserva.estado?.toLowerCase()}`}>
                  {reserva.estado}
                </span>
              </div>
            </div>

            <div className="reserva-grid-info">
              <div className="info-item">
                <span className="info-label">Destino</span>
                <span className="info-valor"><strong>{reserva.destinoNombre || `Destino #${reserva.destinoId}`}</strong></span>
              </div>

              <div className="info-item">
                <span className="info-label">Nombre del Cliente</span>
                <span className="info-valor">{reserva.clienteNombre}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Correo Electrónico</span>
                <span className="info-valor">{reserva.clienteEmail}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Fecha del Viaje</span>
                <span className="info-valor" style={{ color: 'var(--color-azul-oceano)', fontWeight: 700 }}>
                  {reserva.fechaViaje}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Cantidad de Personas</span>
                <span className="info-valor">{reserva.numPersonas} persona{reserva.numPersonas > 1 ? 's' : ''}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Estado</span>
                <span className="info-valor" style={{ color: 'var(--color-turquesa)', fontWeight: 700 }}>{reserva.estado}</span>
              </div>
            </div>

            {/* Desglose de tarifa de la reserva */}
            <div className="desglose-tarifa" style={{ marginBottom: '20px' }}>
              <div className="desglose-titulo">Desglose de Tarifa</div>
              <div className="desglose-fila">
                <span>Subtotal:</span>
                <span>{formatearColones(subtotalMonto)}</span>
              </div>
              <div className="desglose-fila">
                <span>IVA (13% ley costarricense):</span>
                <span>{formatearColones(ivaMonto)}</span>
              </div>
              <div className="desglose-fila total">
                <span>Total pagado:</span>
                <span>{formatearColones(totalMonto)}</span>
              </div>
            </div>

            {/* Restriccion temporal de 48 horas */}
            {reserva.estado !== 'CANCELADA' && (
              <div className="no-print">
                {!permiteModificaciones ? (
                  <Alerta
                    tipo="aviso"
                    mensaje={
                      <span>
                        <strong>Restricción Temporal:</strong> Faltan menos de 48 horas para tu fecha de viaje
                        ({horasRestantes <= 0 ? 'fecha ya pasada' : `aprox. ${Math.round(horasRestantes)} horas restantes`}).
                        Por políticas oficiales de la agencia, no se permite reprogramar ni cancelar con menos de 48h de anticipación.
                      </span>
                    }
                  />
                ) : (
                  <Alerta
                    tipo="info"
                    mensaje={`Faltan más de 48 horas para tu viaje (${Math.round(horasRestantes)}h restantes). Puedes reprogramar o cancelar libremente.`}
                  />
                )}
              </div>
            )}

            {/* Acciones disponibles */}
            <div className="acciones-reserva no-print">
              <button
                type="button"
                className="btn btn-turquesa btn-sm"
                onClick={handleDescargarPDF}
              >
                Descargar comprobante en PDF
              </button>

              <button
                type="button"
                className="btn btn-oceano btn-sm"
                onClick={() => {
                  setNuevaFecha(reserva.fechaViaje);
                  setMostrandoModalReprogramar(true);
                }}
                disabled={!permiteModificaciones || cargandoAccion}
                title={!permiteModificaciones ? 'Bloqueado por la regla de 48 horas' : 'Reprogramar fecha'}
              >
                Reprogramar Fecha
              </button>

              <button
                type="button"
                className="btn btn-peligro btn-sm"
                onClick={handleCancelar}
                disabled={!permiteModificaciones || cargandoAccion}
                title={!permiteModificaciones ? 'Bloqueado por la regla de 48 horas' : 'Cancelar reserva'}
              >
                Cancelar Reserva
              </button>
            </div>
          </div>
        )}

        {/* Modal para reprogramar fecha */}
        {mostrandoModalReprogramar && (
          <div className="modal-overlay" onClick={() => setMostrandoModalReprogramar(false)}>
            <div className="modal-caja" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
              <div className="modal-header">
                <h3>Reprogramar Fecha de Viaje</h3>
                <button className="modal-cerrar" onClick={() => setMostrandoModalReprogramar(false)}>✕</button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleReprogramar} className="formulario">
                  <div className="campo">
                    <label htmlFor="nuevaFecha">Seleccione la Nueva Fecha *</label>
                    <input
                      id="nuevaFecha"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={nuevaFecha}
                      onChange={(e) => setNuevaFecha(e.target.value)}
                      required
                    />
                    <small className="campo-ayuda">Se verificará la disponibilidad de cupos en la nueva fecha.</small>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secundario"
                      onClick={() => setMostrandoModalReprogramar(false)}
                      style={{ flex: 1 }}
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="btn btn-turquesa"
                      disabled={cargandoAccion}
                      style={{ flex: 1 }}
                    >
                      {cargandoAccion ? 'Guardando...' : 'Confirmar'}
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
