import React, { useState, useEffect, useMemo } from 'react';
import { crearReserva, getCuposDisponibles } from '../services/api';
import { formatearColones } from '../utils/imagenes';
import Alerta from './Alerta';

// Modal de cotizacion, pago y emision de comprobante con calculo de cupos disponibles (RN-01)
export default function ModalReserva({ destino, onCerrar, onReservaExitosa }) {
  const hoyStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [fechaViaje, setFechaViaje] = useState(hoyStr);
  const [numPersonas, setNumPersonas] = useState(1);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [ultimosDigitosTarjeta, setUltimosDigitosTarjeta] = useState('');

  const [cuposDisponibles, setCuposDisponibles] = useState(destino.capacidadDiaria);
  const [cargandoCupos, setCargandoCupos] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');
  const [reservaCreada, setReservaCreada] = useState(null);

  // Consulta el cupo real disponible para la fecha seleccionada
  useEffect(() => {
    let activo = true;
    const consultarDisponibilidad = async () => {
      if (!fechaViaje) return;
      setCargandoCupos(true);
      try {
        const resultado = await getCuposDisponibles(destino.id, fechaViaje);
        if (activo && resultado && typeof resultado.disponibles === 'number') {
          setCuposDisponibles(resultado.disponibles);
        }
      } catch {
        if (activo) setCuposDisponibles(destino.capacidadDiaria);
      } finally {
        if (activo) setCargandoCupos(false);
      }
    };

    consultarDisponibilidad();
    return () => {
      activo = false;
    };
  }, [destino.id, destino.capacidadDiaria, fechaViaje]);

  // Calculo de tarifa con desglose de subtotal, iva 13% y total
  const personasNumerico = Number(numPersonas) > 0 ? Number(numPersonas) : 1;

  const subtotal = useMemo(() => {
    return destino.precioBase * personasNumerico;
  }, [destino.precioBase, personasNumerico]);

  const iva = useMemo(() => {
    return Math.round(subtotal * 0.13 * 100) / 100;
  }, [subtotal]);

  const total = useMemo(() => {
    return Math.round((subtotal + iva) * 100) / 100;
  }, [subtotal, iva]);

  // Validacion de cupo maximo disponible para la fecha
  const sinCupos = cuposDisponibles <= 0;
  const superaCapacidad = personasNumerico > cuposDisponibles;

  // Envio del formulario con procesamiento bancario simulado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMensaje('');

    if (!clienteNombre.trim() || !clienteEmail.trim() || !fechaViaje) {
      setErrorMensaje('Por favor complete todos los campos del formulario.');
      return;
    }

    if (superaCapacidad) {
      setErrorMensaje(`La cantidad solicitada supera los cupos disponibles para esta fecha (${cuposDisponibles} cupo(s) restantes).`);
      return;
    }

    const digitosLimpios = ultimosDigitosTarjeta.trim();
    if (digitosLimpios.length !== 4 || isNaN(Number(digitosLimpios))) {
      setErrorMensaje('Por favor ingrese exactamente los últimos 4 dígitos numéricos de su tarjeta.');
      return;
    }

    setCargando(true);
    setProcesandoPago(true);

    try {
      // Simula el tiempo de respuesta de la pasarela bancaria
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const respuesta = await crearReserva({
        destinoId: String(destino.id),
        clienteNombre: clienteNombre.trim(),
        clienteEmail: clienteEmail.trim().toLowerCase(),
        fechaViaje,
        numPersonas: personasNumerico,
        ultimosDigitosTarjeta: digitosLimpios,
      });

      // Descuenta de inmediato los cupos en la pantalla para reflejar la disponibilidad actualizada
      setCuposDisponibles((prev) => Math.max(0, prev - personasNumerico));

      setReservaCreada(respuesta);
      if (onReservaExitosa) onReservaExitosa(respuesta);
    } catch (err) {
      setErrorMensaje(err.message || 'Error al procesar la reserva.');
    } finally {
      setCargando(false);
      setProcesandoPago(false);
    }
  };

  // Impresion nativa del comprobante formal
  const handleDescargarPDF = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header no-print">
          <div>
            <h3>{reservaCreada ? 'Comprobante de Reserva' : `Reservar: ${destino.nombre}`}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-texto-suave)' }}>
              Capacidad máxima permitida: {destino.capacidadDiaria} personas por día
            </span>
          </div>
          <button className="modal-cerrar no-print" onClick={onCerrar}>✕</button>
        </div>

        <div className="modal-body">
          {/* Indicador de procesamiento de pago */}
          {procesandoPago && (
            <div className="procesando-caja">
              <div className="procesando-spinner"></div>
              <div className="procesando-texto">Procesando pago, por favor espere un momento...</div>
              <div className="procesando-subtexto">Verificando datos con la pasarela bancaria simulada</div>
            </div>
          )}

          {/* Comprobante formal de reserva */}
          {!procesandoPago && reservaCreada && (
            <div className="comprobante-reserva-formal">
              {/* Membrete formal para impresion */}
              <div className="comprobante-encabezado">
                <div>
                  <h2 className="comprobante-marca-titulo">ViajaYa Costa Rica</h2>
                  <p className="comprobante-marca-subtitulo">Comprobante Oficial de Reserva Turística</p>
                </div>
                <div className="comprobante-emision">
                  <span>Emisión: {new Date().toLocaleDateString('es-CR')}</span>
                </div>
              </div>

              <div className="no-print" style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div className="reserva-exito-icono">✓</div>
                <h3 style={{ color: 'var(--color-azul-oceano)', marginBottom: '4px' }}>
                  ¡Pago y Reserva Aprobados!
                </h3>
                <p style={{ color: 'var(--color-texto-suave)', fontSize: '0.92rem' }}>
                  Tu viaje a <strong>{destino.nombre}</strong> ha sido confirmado con éxito.
                </p>
              </div>

              {/* Codigo oficial de confirmacion */}
              <div className="reserva-codigo-caja">
                <div className="reserva-codigo-etiqueta">Código de Confirmación Oficial</div>
                <div className="reserva-codigo-valor">{reservaCreada.codigoConfirmacion}</div>
              </div>

              {/* Datos principales de la reserva */}
              <div className="comprobante-tabla-datos">
                <div className="comprobante-dato-fila">
                  <span className="comprobante-dato-etiqueta">Destino:</span>
                  <span className="comprobante-dato-valor"><strong>{destino.nombre}</strong></span>
                </div>
                <div className="comprobante-dato-fila">
                  <span className="comprobante-dato-etiqueta">Nombre del Cliente:</span>
                  <span className="comprobante-dato-valor">{reservaCreada.clienteNombre}</span>
                </div>
                <div className="comprobante-dato-fila">
                  <span className="comprobante-dato-etiqueta">Correo Electrónico:</span>
                  <span className="comprobante-dato-valor">{reservaCreada.clienteEmail}</span>
                </div>
                <div className="comprobante-dato-fila">
                  <span className="comprobante-dato-etiqueta">Fecha del Viaje:</span>
                  <span className="comprobante-dato-valor"><strong>{reservaCreada.fechaViaje}</strong></span>
                </div>
                <div className="comprobante-dato-fila">
                  <span className="comprobante-dato-etiqueta">Cantidad de Personas:</span>
                  <span className="comprobante-dato-valor">{reservaCreada.numPersonas}</span>
                </div>
                <div className="comprobante-dato-fila">
                  <span className="comprobante-dato-etiqueta">Estado de la Reserva:</span>
                  <span className="comprobante-dato-valor">
                    <span className="badge-estado badge-confirmada">{reservaCreada.estado || 'CONFIRMADA'}</span>
                  </span>
                </div>
              </div>

              {/* Desglose de tarifa formal */}
              <div className="desglose-tarifa">
                <div className="desglose-titulo">Desglose de Tarifa</div>
                <div className="desglose-fila">
                  <span>Subtotal ({reservaCreada.numPersonas} persona{reservaCreada.numPersonas > 1 ? 's' : ''}):</span>
                  <span>{formatearColones(subtotal)}</span>
                </div>
                <div className="desglose-fila">
                  <span>IVA (13% ley costarricense):</span>
                  <span>{formatearColones(iva)}</span>
                </div>
                <div className="desglose-fila total">
                  <span>Total Pagado:</span>
                  <span>{formatearColones(total)}</span>
                </div>
              </div>

              <div className="comprobante-pie-nota">
                <p>Este documento certifica su reserva oficial con ViajaYa. Presente este comprobante o su código el día del viaje.</p>
                <p>Costa Rica • Pura Vida</p>
              </div>

              <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-turquesa"
                  onClick={handleDescargarPDF}
                  style={{ width: '100%' }}
                >
                  Descargar comprobante en PDF
                </button>
                <button
                  type="button"
                  className="btn btn-secundario"
                  onClick={onCerrar}
                  style={{ width: '100%' }}
                >
                  Entendido y Finalizar
                </button>
              </div>
            </div>
          )}

          {/* Formulario de reserva cuando no esta creada */}
          {!procesandoPago && !reservaCreada && (
            <form onSubmit={handleSubmit} className="formulario">
              {errorMensaje && <Alerta tipo="error" mensaje={errorMensaje} />}

              {sinCupos && (
                <Alerta
                  tipo="error"
                  mensaje="No hay cupos disponibles para la fecha seleccionada. Por favor selecciona otra fecha de viaje."
                />
              )}

              {superaCapacidad && !sinCupos && (
                <Alerta
                  tipo="aviso"
                  mensaje={`La cantidad de personas (${numPersonas}) supera los cupos disponibles para este día (${cuposDisponibles} cupos restantes).`}
                />
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="campo">
                  <label htmlFor="fechaViaje">Fecha del Viaje *</label>
                  <input
                    id="fechaViaje"
                    type="date"
                    min={hoyStr}
                    value={fechaViaje}
                    onChange={(e) => setFechaViaje(e.target.value)}
                    required
                  />
                  {/* Visualizacion clara del cupo disponible real para la fecha */}
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      backgroundColor: cuposDisponibles > 0 ? 'var(--color-verde-agua-claro)' : 'var(--color-error-fondo)',
                      color: cuposDisponibles > 0 ? 'var(--color-azul-oceano)' : 'var(--color-error)',
                      border: `1px solid ${cuposDisponibles > 0 ? 'var(--color-verde-agua)' : 'var(--color-error)'}`,
                      display: 'inline-block',
                    }}
                  >
                    {cargandoCupos ? 'Consultando disponibilidad...' : `Cupos disponibles: ${cuposDisponibles} de ${destino.capacidadDiaria}`}
                  </div>
                </div>

                <div className="campo">
                  <label htmlFor="numPersonas">N° de Personas *</label>
                  <input
                    id="numPersonas"
                    type="number"
                    min="1"
                    max={Math.max(1, cuposDisponibles)}
                    value={numPersonas}
                    onChange={(e) => setNumPersonas(e.target.value)}
                    onBlur={() => {
                      if (!numPersonas || Number(numPersonas) < 1) {
                        setNumPersonas(1);
                      }
                    }}
                    required
                  />
                  <small className="campo-ayuda">
                    {cuposDisponibles > 0 ? `Máximo ${cuposDisponibles} cupo(s) para esta fecha` : 'Sin cupos disponibles'}
                  </small>
                </div>
              </div>

              <div className="desglose-tarifa">
                <div className="desglose-titulo">Cotización Automática</div>
                <div className="desglose-fila">
                  <span>Precio base ({personasNumerico} persona{personasNumerico > 1 ? 's' : ''}):</span>
                  <span>{formatearColones(subtotal)}</span>
                </div>
                <div className="desglose-fila">
                  <span>IVA (13% ley costarricense):</span>
                  <span>{formatearColones(iva)}</span>
                </div>
                <div className="desglose-fila total">
                  <span>Total a pagar:</span>
                  <span>{formatearColones(total)}</span>
                </div>
              </div>

              <div className="campo">
                <label htmlFor="nombre">Nombre Completo *</label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ej: María Rodríguez"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="email">Correo Electrónico *</label>
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                  required
                />
                <small className="campo-ayuda">Lo usarás junto a tu código para gestionar tu viaje</small>
              </div>

              <div className="campo" style={{ background: 'var(--color-arena-claro)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-borde-suave)' }}>
                <label htmlFor="tarjeta">Últimos 4 dígitos de tarjeta *</label>
                <input
                  id="tarjeta"
                  type="text"
                  maxLength="4"
                  placeholder="Ej: 4242"
                  value={ultimosDigitosTarjeta}
                  onChange={(e) => setUltimosDigitosTarjeta(e.target.value.replace(/\D/g, ''))}
                  required
                  style={{ letterSpacing: '4px', fontWeight: 'bold' }}
                />
                <small className="campo-ayuda" style={{ marginTop: '6px', display: 'block', color: 'var(--color-azul-oceano)' }}>
                  Simulador de pago: tarjeta terminada en dígito par aprueba; en dígito impar rechaza
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-turquesa"
                disabled={cargando || superaCapacidad || sinCupos}
                style={{ width: '100%', marginTop: '10px', fontSize: '1rem' }}
              >
                {cargando ? 'Procesando pago...' : `Confirmar y Pagar ${formatearColones(total)}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
