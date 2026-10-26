
//Pruebas unitarias para las 4 Reglas de Negocio.
// Usa los Mocks en memoria, no requiere BD ni servidor activo.


import { DestinoService } from '../src/services/destino.service';
import { describe, test, expect, beforeEach } from '@jest/globals';
import { CotizacionService } from '../src/services/cotizacion.service';
import { ReservaService, BusinessError } from '../src/services/reserva.service';
import {MockDestinoRepository,MockReservaRepository} from '../src/mocks/mock.repository';


// Helpers de test
//* Crea una fecha futura con X días a partir de hoy (en formato YYYY-MM-DD).
function fechaFutura(dias: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().split('T')[0];
}

//* Crea un payload de reserva valido para reutilizar en los tests.
function buildReservaPayload(overrides: Record<string, unknown> = {}) {
  return {
    destinoId: 'dest-001',         // existe en MockDestinoRepository, capacidad de 10
    clienteNombre: 'Juan Pérez',
    clienteEmail: 'juan@test.com',
    fechaViaje: fechaFutura(5),    // 5 días en el futuro,supera la ventana de 48h
    numPersonas: 2,
    ultimosDigitosTarjeta: '1234', // ultimo digito par aprob
    ...overrides,
  };
}


//*Peubas Unitarias para las Reglas de Negocio (RN-01, RN-02, RN-03, RN-04)
// RN-01 : Control Estricto de Cupos
describe('RN-01: Control de Cupos', () => {
  let service: ReservaService;

  beforeEach(() => {
    // Instancias frescas antes de cada test para aislar el estado
    service = new ReservaService(
      new MockReservaRepository(),
      new MockDestinoRepository()
    );
  });

  test('debe crear reservas mientras queden cupos disponibles', async () => {
    const reserva = await service.crearReserva(buildReservaPayload({ numPersonas: 5 }));
    expect(reserva.estado).toBe('CONFIRMADA');
    expect(reserva.codigoConfirmacion).toMatch(/^VY-\d{4}-\d{2}$/);
  });

  test('debe rechazar una reserva que excede la capacidad diaria', async () => {
    // dest-001 tiene capacidadDiaria = 10; intentamos reservar 11 personas
    await expect(
      service.crearReserva(buildReservaPayload({ numPersonas: 11 }))
    ).rejects.toThrow(BusinessError);
  });

  test('debe acumular personas de reservas previas y rechazar si se supera el cupo', async () => {
    // Primera reserva, 8 personas, quedan 2 de cupo
    await service.crearReserva(buildReservaPayload({ numPersonas: 8 }));
    // Segunda reserva, 3 personas supera el cupo restante
    await expect(
      service.crearReserva(buildReservaPayload({ numPersonas: 3 }))
    ).rejects.toMatchObject({ title: 'Cupo insuficiente' });
  });

  test('debe permitir completar exactamente la capacidad', async () => {
    // 10 personas exactas en dest-001 (capacidad = 10)
    const reserva = await service.crearReserva(buildReservaPayload({ numPersonas: 10 }));
    expect(reserva.estado).toBe('CONFIRMADA');
  });
});


// RN-02: Ventana Temporal de 48 horas
describe('RN-02: Ventana Temporal de 48h', () => {
  let service: ReservaService;

  beforeEach(() => {
    service = new ReservaService(
      new MockReservaRepository(),
      new MockDestinoRepository()
    );
  });

  test('debe permitir cancelar una reserva con mas de 48h de anticipacion', async () => {
    const reserva = await service.crearReserva(buildReservaPayload());
    const cancelada = await service.cancelarReserva(reserva.id);
    expect(cancelada.estado).toBe('CANCELADA');
  });

  test('debe rechazar la cancelacion si faltan 48h o menos para el viaje', async () => {
    //! RN-02: fechaViaje dentro de 1 día, dentro de la ventana restringida.
    const reserva = await service.crearReserva(buildReservaPayload({ fechaViaje: fechaFutura(1) }));
    await expect(service.cancelarReserva(reserva.id)).rejects.toMatchObject({
      title: 'Ventana temporal vencida',
    });
  });

  test('debe permitir reprogramar una reserva con mas de 48h de anticipacion', async () => {
    const reserva = await service.crearReserva(buildReservaPayload());
    const nuevaFecha = fechaFutura(10);
    const reprogramada = await service.reprogramarReserva(reserva.id, nuevaFecha);
    expect(reprogramada.fechaViaje).toBe(nuevaFecha);
  });

  test('debe rechazar la reprogramacion si faltan 48h o menos para el viaje', async () => {
    //! RN-02: fechaViaje dentro de 1 día, restricción activa.
    const reserva = await service.crearReserva(buildReservaPayload({ fechaViaje: fechaFutura(1) }));
    await expect(
      service.reprogramarReserva(reserva.id, fechaFutura(10))
    ).rejects.toMatchObject({ title: 'Ventana temporal vencida' });
  });
});


// RN-03:Fórmula de Tarifa 
describe('RN-03: Fórmula de Tarifa', () => {
  const service = new CotizacionService();

  test('debe calcular correctamente subtotal, IVA y total', () => {
    // Precio base: 100, personas: 2, Subtotal: 200, IVA: 26, Total: 226
    const resultado = service.calcular({ precioBase: 100, numPersonas: 2 });
    expect(resultado.subtotal).toBe(200);
    expect(resultado.iva).toBe(26);
    expect(resultado.total).toBe(226);
  });

  test('debe aplicar el 13% de IVA correctamente en un caso simple', () => {
    const resultado = service.calcular({ precioBase: 1000, numPersonas: 1 });
    expect(resultado.subtotal).toBe(1000);
    expect(resultado.iva).toBe(130);
    expect(resultado.total).toBe(1130);
  });

  test('debe redondear a 2 decimales cuando el resultado no es exacto', () => {
    // 33.33 * 3 = 99.99; IVA = 12.9987 → 13.00
    const resultado = service.calcular({ precioBase: 33.33, numPersonas: 3 });
    expect(resultado.subtotal).toBe(99.99);
    expect(resultado.iva).toBe(13);
    expect(resultado.total).toBe(112.99);
  });

  test('debe lanzar error si el precio base es cero o negativo', () => {
    expect(() => service.calcular({ precioBase: 0, numPersonas: 1 })).toThrow();
    expect(() => service.calcular({ precioBase: -50, numPersonas: 1 })).toThrow();
  });

  test('debe lanzar error si el número de personas es cero o no entero', () => {
    expect(() => service.calcular({ precioBase: 100, numPersonas: 0 })).toThrow();
    expect(() => service.calcular({ precioBase: 100, numPersonas: 1.5 })).toThrow();
  });
});

// RN-04: Gateway Simulado por Paridad

describe('RN-04: Gateway de Pago por Paridad', () => {
  let service: ReservaService;

  beforeEach(() => {
    service = new ReservaService(
      new MockReservaRepository(),
      new MockDestinoRepository()
    );
  });

  test('tarjeta con ultimo dígito par, pago aprobado y código VY generado', async () => {
    // ultimo digito par
    const reserva = await service.crearReserva(
      buildReservaPayload({ ultimosDigitosTarjeta: '1232' })
    );
    expect(reserva.estado).toBe('CONFIRMADA');
    expect(reserva.codigoConfirmacion).toMatch(/^VY-\d{4}-\d{2}$/);
  });

  test('tarjeta con ultimo dígito impar, pago rechazado con HTTP 422', async () => {
    // ultimo digito impar
    await expect(
      service.crearReserva(buildReservaPayload({ ultimosDigitosTarjeta: '1233' }))
    ).rejects.toMatchObject({
      title: 'Pago rechazado',
      statusCode: 422,
    });
  });

  test('ultimos dígitos terminados en 0, aprobado', async () => {
    // ultimo digito par
    const reserva = await service.crearReserva(
      buildReservaPayload({ ultimosDigitosTarjeta: '5670' })
    );
    expect(reserva.estado).toBe('CONFIRMADA');
  });

  test('ultimos dígitos terminados en 9, rechazado con HTTP 422', async () => {
    // ultimo digito impar
    await expect(
      service.crearReserva(buildReservaPayload({ ultimosDigitosTarjeta: '1239' }))
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  test('código de confirmación sigue el formato VY-XXXX-XX', async () => {
    const reserva = await service.crearReserva(buildReservaPayload());
    // Valida el formato exacto del código de confirmación
    expect(reserva.codigoConfirmacion).toMatch(/^VY-[0-9]{4}-[0-9]{2}$/);
  });
});
