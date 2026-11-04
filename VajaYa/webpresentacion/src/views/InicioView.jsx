import React from 'react';
import Hero from '../components/Hero';
import DestinoCard from '../components/DestinoCard';

// Vista de inicio con portada y destinos destacados
export default function InicioView({ destinos, cargando, error, onNavegarDestinos, onSeleccionarDestino }) {
  const destacados = destinos.slice(0, 4);

  return (
    <div>
      <Hero onExplorarDestinos={onNavegarDestinos} />

      <section className="seccion">
        <div className="contenedor">
          <div className="seccion-titulo">
            <h2>Destinos Destacados</h2>
            <p>
              Explorá algunos de los rincones más impresionantes de Costa Rica, seleccionados
              por su belleza natural y valor ecológico.
            </p>
          </div>

          {cargando && (
            <p style={{ textAlign: 'center', color: 'var(--color-azul-oceano)', fontWeight: 'bold' }}>
              Cargando destinos desde el servidor...
            </p>
          )}

          {error && (
            <div style={{ textAlign: 'center', color: 'var(--color-error)', background: 'var(--color-error-fondo)', padding: '16px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          {!cargando && !error && destacados.length > 0 && (
            <div className="grid-destinos">
              {destacados.map((destino) => (
                <DestinoCard
                  key={destino.id}
                  destino={destino}
                  onVerMas={onSeleccionarDestino}
                />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              type="button"
              className="btn btn-turquesa"
              onClick={onNavegarDestinos}
              style={{ padding: '12px 32px' }}
            >
              Ver todos los destinos ({destinos.length})
            </button>
          </div>
        </div>
      </section>

      <section className="seccion" style={{ backgroundColor: 'var(--color-arena-claro)', borderTop: '1px solid var(--color-borde-suave)' }}>
        <div className="contenedor">
          <div className="seccion-titulo">
            <h2>¿Por qué viajar con ViajaYa?</h2>
            <p>Garantizamos transparencia, seguridad y respeto al medio ambiente.</p>
          </div>

          <div className="agencia-pilares">
            <div className="pilar-card">
              <h3 className="pilar-titulo">Precios Claros y Transparentes</h3>
              <p className="pilar-desc">
                Desglose transparente en cada cotización con el IVA oficial del 13%, sin cobros ocultos.
              </p>
            </div>

            <div className="pilar-card">
              <h3 className="pilar-titulo">Cupos Diarios Controlados</h3>
              <p className="pilar-desc">
                Regulamos la capacidad diaria de visitantes para evitar la sobreexplotación de los parques.
              </p>
            </div>

            <div className="pilar-card">
              <h3 className="pilar-titulo">Flexibilidad con 48 Horas</h3>
              <p className="pilar-desc">
                Autogestioná la cancelación o reprogramación de tu viaje con más de 48 horas de anticipación.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
