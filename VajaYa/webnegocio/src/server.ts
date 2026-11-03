
// Punto de entrada del servidor — arranca Express en el puerto configurado.
import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT ?? 3000;

//* Inicia el servidor HTTP y muestra la URL base de la API en consola.
app.listen(PORT, () => {
  console.log(`✅ ViajaYa [webnegocio] corriendo en http://localhost:${PORT}`);
  console.log(`   → Destinos:   http://localhost:${PORT}/api/destinos`);
  console.log(`   → Cotizar:    http://localhost:${PORT}/api/cotizar`);
  console.log(`   → Reservas:   http://localhost:${PORT}/api/reservas`);
  console.log(`   → Admin:      http://localhost:${PORT}/api/admin`);
  console.log(`   → Health:     http://localhost:${PORT}/health`);
});
