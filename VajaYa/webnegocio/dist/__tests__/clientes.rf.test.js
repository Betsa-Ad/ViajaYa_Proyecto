"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Pruebas unitarias para Requerimientos Funcionales (RF-01 a RF-06) usando el patrón AAA.
const globals_1 = require("@jest/globals");
const destino_service_1 = require("../services/destino.service");
const cotizacion_service_1 = require("../services/cotizacion.service");
const reserva_service_1 = require("../services/reserva.service");
const mock_repository_1 = require("../mocks/mock.repository");
// Función auxiliar para generar fechas futuras en formato YYYY-MM-DD
function generarFechaFutura(dias) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + dias);
    return d.toISOString().split('T')[0];
}
(0, globals_1.describe)('Suite de Pruebas Unitarias RF-01 a RF-06 (Clientes y Reservas)', () => {
    let destinoRepo;
    let reservaRepo;
    let destinoService;
    let cotizacionService;
    let reservaService;
    (0, globals_1.beforeEach)(() => {
        // Arrange global: inicializa repositorios en memoria y servicios
        destinoRepo = new mock_repository_1.MockDestinoRepository();
        reservaRepo = new mock_repository_1.MockReservaRepository();
        destinoService = new destino_service_1.DestinoService(destinoRepo);
        cotizacionService = new cotizacion_service_1.CotizacionService();
        reservaService = new reserva_service_1.ReservaService(reservaRepo, destinoRepo);
    });
    // RF-01: Listar destinos activos y filtrar destinos inactivos
    (0, globals_1.test)('RF-01: debe listar únicamente destinos activos y excluir los desactivados', async () => {
        // Arrange: desactiva el segundo destino del catálogo en memoria
        await destinoService.desactivar('dest-002');
        // Act: consulta el listado de destinos activos
        const destinos = await destinoService.listarActivos();
        // Assert: verifica que solo retorne los destinos con activo = true
        (0, globals_1.expect)(destinos.length).toBe(1);
        (0, globals_1.expect)(destinos[0].id).toBe('dest-001');
        (0, globals_1.expect)(destinos.every((d) => d.activo)).toBe(true);
    });
    // RF-01: Consultar disponibilidad de cupos por destino y fecha
    (0, globals_1.test)('RF-01: debe consultar correctamente los cupos totales, ocupados y disponibles para una fecha', async () => {
        // Arrange: crea una reserva confirmada de 3 personas para una fecha futura
        const fecha = generarFechaFutura(5);
        await reservaService.crearReserva({
            destinoId: 'dest-001',
            clienteNombre: 'Carlos Solís',
            clienteEmail: 'carlos@test.com',
            fechaViaje: fecha,
            numPersonas: 3,
            ultimosDigitosTarjeta: '1234',
        });
        // Act: consulta la disponibilidad de cupos para el destino y la fecha
        const cupos = await reservaService.consultarCuposDisponibles('dest-001', fecha);
        // Assert: valida la capacidad total (10), ocupados (3) y restantes (7)
        (0, globals_1.expect)(cupos.capacidadTotal).toBe(10);
        (0, globals_1.expect)(cupos.ocupados).toBe(3);
        (0, globals_1.expect)(cupos.disponibles).toBe(7);
    });
    // RF-02: Generar cotización con desglose exacto de subtotal, IVA 13% y total
    (0, globals_1.test)('RF-02: debe calcular cotización con desglose exacto de subtotal, IVA 13% y total redondeado', () => {
        // Arrange: define precio base y cantidad de personas
        const precioBase = 50000;
        const numPersonas = 2;
        // Act: ejecuta el cálculo de cotización
        const resultado = cotizacionService.calcular({ precioBase, numPersonas });
        // Assert: valida que aplique la fórmula oficial con 13% de IVA
        (0, globals_1.expect)(resultado.subtotal).toBe(100000);
        (0, globals_1.expect)(resultado.iva).toBe(13000);
        (0, globals_1.expect)(resultado.total).toBe(113000);
    });
    // RF-02: Rechazar cotización si la cantidad de personas es menor o igual a 0
    (0, globals_1.test)('RF-02: debe lanzar error si el número de personas en la cotización es menor o igual a cero', () => {
        // Arrange: define entradas inválidas con 0 y números negativos
        const entradaCero = { precioBase: 50000, numPersonas: 0 };
        const entradaNegativa = { precioBase: 50000, numPersonas: -3 };
        // Act & Assert: verifica que ambas operaciones lancen excepción
        (0, globals_1.expect)(() => cotizacionService.calcular(entradaCero)).toThrow('El número de personas debe ser un entero positivo.');
        (0, globals_1.expect)(() => cotizacionService.calcular(entradaNegativa)).toThrow('El número de personas debe ser un entero positivo.');
    });
    // RF-03: Crear reserva exitosa con tarjeta par (estado CONFIRMADA y código VY-XXXX-XX)
    (0, globals_1.test)('RF-03: debe confirmar reserva y generar código VY-XXXX-XX cuando el último dígito de tarjeta es par', async () => {
        // Arrange: prepara datos de reserva con tarjeta terminada en dígito par (6)
        const datosReserva = {
            destinoId: 'dest-001',
            clienteNombre: 'Ana Mora',
            clienteEmail: 'ana@test.com',
            fechaViaje: generarFechaFutura(4),
            numPersonas: 2,
            ultimosDigitosTarjeta: '4586',
        };
        // Act: envía la creación de la reserva
        const reserva = await reservaService.crearReserva(datosReserva);
        // Assert: verifica estado confirmado y formato oficial del código
        (0, globals_1.expect)(reserva.estado).toBe('CONFIRMADA');
        (0, globals_1.expect)(reserva.codigoConfirmacion).toMatch(/^VY-\d{4}-\d{2}$/);
    });
    // RF-03: Registrar reserva con tarjeta impar (estado RECHAZADO guardado en BD sin descontar cupo)
    (0, globals_1.test)('RF-03: debe registrar la reserva con estado RECHAZADA sin descontar cupos si la tarjeta es impar', async () => {
        // Arrange: prepara reserva con tarjeta terminada en dígito impar (7)
        const fecha = generarFechaFutura(6);
        const datosReserva = {
            destinoId: 'dest-001',
            clienteNombre: 'Pedro Rojas',
            clienteEmail: 'pedro@test.com',
            fechaViaje: fecha,
            numPersonas: 4,
            ultimosDigitosTarjeta: '9997',
        };
        // Act: guarda la reserva y consulta los cupos del destino
        const reserva = await reservaService.crearReserva(datosReserva);
        const cupos = await reservaService.consultarCuposDisponibles('dest-001', fecha);
        // Assert: verifica estado RECHAZADA, código generado y cupos intactos (10 disponibles)
        (0, globals_1.expect)(reserva.estado).toBe('RECHAZADA');
        (0, globals_1.expect)(reserva.codigoConfirmacion).toMatch(/^VY-\d{4}-\d{2}$/);
        (0, globals_1.expect)(cupos.ocupados).toBe(0);
        (0, globals_1.expect)(cupos.disponibles).toBe(10);
    });
    // RF-04: Consultar reserva existente ingresando código único y correo coincidente
    (0, globals_1.test)('RF-04: debe retornar la reserva cuando el código y el correo coinciden', async () => {
        // Arrange: crea una reserva válida
        const reserva = await reservaService.crearReserva({
            destinoId: 'dest-001',
            clienteNombre: 'María Jiménez',
            clienteEmail: 'maria@test.com',
            fechaViaje: generarFechaFutura(7),
            numPersonas: 2,
            ultimosDigitosTarjeta: '2222',
        });
        // Act: consulta la reserva ingresando su código y correo
        const consultada = await reservaService.obtenerPorCodigo(reserva.codigoConfirmacion, 'maria@test.com');
        // Assert: valida que la reserva retornada sea la correcta
        (0, globals_1.expect)(consultada).toBeDefined();
        (0, globals_1.expect)(consultada.id).toBe(reserva.id);
        (0, globals_1.expect)(consultada.clienteEmail).toBe('maria@test.com');
    });
    // RF-04: Denegar consulta si el correo no coincide con el código de reserva
    (0, globals_1.test)('RF-04: debe denegar la consulta con error 403 si el correo no pertenece a la reserva', async () => {
        // Arrange: crea una reserva con correo 'propietario@test.com'
        const reserva = await reservaService.crearReserva({
            destinoId: 'dest-001',
            clienteNombre: 'Propietario Real',
            clienteEmail: 'propietario@test.com',
            fechaViaje: generarFechaFutura(5),
            numPersonas: 2,
            ultimosDigitosTarjeta: '4444',
        });
        // Act & Assert: intenta consultar con correo ajeno y valida rechazo 403
        await (0, globals_1.expect)(reservaService.obtenerPorCodigo(reserva.codigoConfirmacion, 'intruso@test.com')).rejects.toMatchObject({
            title: 'Acceso denegado',
            statusCode: 403,
        });
    });
    // RF-05: Reprogramar fecha de viaje con más de 48 horas de antelación y cupo disponible
    (0, globals_1.test)('RF-05: debe permitir reprogramar fecha de viaje con más de 48h de antelación y cupo disponible', async () => {
        // Arrange: crea una reserva a 5 días en el futuro
        const reserva = await reservaService.crearReserva({
            destinoId: 'dest-001',
            clienteNombre: 'Lucía Vargas',
            clienteEmail: 'lucia@test.com',
            fechaViaje: generarFechaFutura(5),
            numPersonas: 2,
            ultimosDigitosTarjeta: '8888',
        });
        const nuevaFecha = generarFechaFutura(12);
        // Act: reprograma la reserva a una nueva fecha futura
        const reprogramada = await reservaService.reprogramarReserva(reserva.id, nuevaFecha);
        // Assert: verifica que la fecha se actualizó exitosamente
        (0, globals_1.expect)(reprogramada.fechaViaje).toBe(nuevaFecha);
    });
    // RF-05: Bloquear reprogramación si la nueva fecha no tiene cupo suficiente
    (0, globals_1.test)('RF-05: debe bloquear la reprogramación si la fecha destino excede la capacidad diaria', async () => {
        // Arrange: llena la capacidad del destino (10 cupos) en la fecha objetivo
        const fechaDestino = generarFechaFutura(10);
        await reservaService.crearReserva({
            destinoId: 'dest-001',
            clienteNombre: 'Grupo Grande',
            clienteEmail: 'grupo@test.com',
            fechaViaje: fechaDestino,
            numPersonas: 10,
            ultimosDigitosTarjeta: '1112',
        });
        // Crea otra reserva para otra fecha inicial
        const miReserva = await reservaService.crearReserva({
            destinoId: 'dest-001',
            clienteNombre: 'Viajero Solo',
            clienteEmail: 'viajero@test.com',
            fechaViaje: generarFechaFutura(4),
            numPersonas: 2,
            ultimosDigitosTarjeta: '1114',
        });
        // Act & Assert: intenta reprogramar a la fecha sin cupos y valida error 409
        await (0, globals_1.expect)(reservaService.reprogramarReserva(miReserva.id, fechaDestino)).rejects.toMatchObject({
            title: 'Cupo insuficiente',
            statusCode: 409,
        });
    });
    // RF-06: Cancelar reserva con más de 48 horas de antelación y liberar cupos
    (0, globals_1.test)('RF-06: debe cancelar la reserva con más de 48h y liberar los cupos ocupados para esa fecha', async () => {
        // Arrange: crea reserva con 4 personas a 6 días en el futuro
        const fecha = generarFechaFutura(6);
        const reserva = await reservaService.crearReserva({
            destinoId: 'dest-001',
            clienteNombre: 'Esteban Castro',
            clienteEmail: 'esteban@test.com',
            fechaViaje: fecha,
            numPersonas: 4,
            ultimosDigitosTarjeta: '6666',
        });
        // Act: cancela la reserva y vuelve a consultar cupos disponibles
        const cancelada = await reservaService.cancelarReserva(reserva.id);
        const cupos = await reservaService.consultarCuposDisponibles('dest-001', fecha);
        // Assert: verifica estado CANCELADA y liberación de los 4 cupos (10 disponibles)
        (0, globals_1.expect)(cancelada.estado).toBe('CANCELADA');
        (0, globals_1.expect)(cupos.ocupados).toBe(0);
        (0, globals_1.expect)(cupos.disponibles).toBe(10);
    });
    // RF-06: Bloquear cancelación si faltan menos de 48 horas para el viaje
    (0, globals_1.test)('RF-06: debe bloquear la cancelación si faltan 48 horas o menos para el viaje', async () => {
        // Arrange: crea una reserva para mañana (a 1 día, dentro de la ventana de 48h)
        const reserva = await reservaService.crearReserva({
            destinoId: 'dest-001',
            clienteNombre: 'Urgente Gómez',
            clienteEmail: 'urgente@test.com',
            fechaViaje: generarFechaFutura(1),
            numPersonas: 2,
            ultimosDigitosTarjeta: '2222',
        });
        // Act & Assert: intenta cancelar y valida error de ventana temporal vencida
        await (0, globals_1.expect)(reservaService.cancelarReserva(reserva.id)).rejects.toMatchObject({
            title: 'Ventana temporal vencida',
            statusCode: 400,
        });
    });
});
//# sourceMappingURL=clientes.rf.test.js.map