"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Punto de entrada del servidor — arranca Express en el puerto configurado.
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT ?? 3000;
//* Inicia el servidor HTTP y muestra la URL base de la API en consola.
app_1.default.listen(PORT, () => {
    console.log(`✅ ViajaYa [webnegocio] corriendo en http://localhost:${PORT}`);
    console.log(`   → Destinos:   http://localhost:${PORT}/api/destinos`);
    console.log(`   → Cotizar:    http://localhost:${PORT}/api/cotizar`);
    console.log(`   → Reservas:   http://localhost:${PORT}/api/reservas`);
    console.log(`   → Admin:      http://localhost:${PORT}/api/admin`);
    console.log(`   → Health:     http://localhost:${PORT}/health`);
});
//# sourceMappingURL=server.js.map