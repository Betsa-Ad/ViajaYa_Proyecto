"use strict";
//* Expone el endpoint cotizador puro (RN-03) — sin persistir datos.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CotizacionController = void 0;
class CotizacionController {
    constructor(service) {
        this.service = service;
        //! RN-03: Calcula subtotal, IVA (13%) y total SIN guardar en BD — POST /api/cotizar
        this.cotizar = async (req, res, next) => {
            try {
                const { precioBase, numPersonas } = req.body;
                const resultado = this.service.calcular({ precioBase, numPersonas });
                res.status(200).json({ data: resultado });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.CotizacionController = CotizacionController;
//# sourceMappingURL=cotizacion.controller.js.map