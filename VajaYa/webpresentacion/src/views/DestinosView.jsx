import React, { useState, useMemo } from 'react';
import DestinoCard from '../components/DestinoCard';

// Vista de catalogo de destinos turisticos
export default function DestinosView({ destinos, cargando, error, onSeleccionarDestino }) {
  const [busqueda, setBusqueda] = useState('');

  const destinosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return destinos;
    const termino = busqueda.toLowerCase().trim();
    return destinos.filter(
      (d) =>
        d.nombre.toLowerCase().includes(termino) ||
        (d.descripcion && d.descripcion.toLowerCase().includes(termino))
    );
  }, [destinos, busqueda]);

  return (
    <section className="seccion">
      <div className="contenedor">
        <div className="seccion-titulo">
          <h2>Catálogo de Destinos en Costa Rica</h2>
          <p>
            Elegí el lugar perfecto para tu próximo viaje. Todas las tarifas muestran su precio
            base por persona y su cupo máximo diario disponible.
          </p>
        </div>

        <div style={{ maxWidth: '500px', margin: '0 auto 36px auto' }}>
          <input
            type="text"
            placeholder="Buscar destino (ej: Tamarindo, Arenal, Volcán)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '25px',
              border: '2px solid var(--color-borde-suave)',
              fontSize: '0.95rem',
              backgroundColor: 'var(--color-blanco-calido)',
              boxShadow: 'var(--sombra-suave)',
            }}
          />
        </div>

        {cargando && (
          <p style={{ textAlign: 'center', color: 'var(--color-azul-oceano)', fontWeight: 'bold' }}>
            Consultando destinos en el catálogo...
          </p>
        )}

        {error && (
          <div style={{ textAlign: 'center', color: 'var(--color-error)', background: 'var(--color-error-fondo)', padding: '16px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {!cargando && !error && destinosFiltrados.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-texto-suave)', padding: '40px 0' }}>
            No se encontraron destinos que coincidan con "{busqueda}".
          </p>
        )}

        {!cargando && !error && destinosFiltrados.length > 0 && (
          <div className="grid-destinos">
            {destinosFiltrados.map((destino) => (
              <DestinoCard
                key={destino.id}
                destino={destino}
                onVerMas={onSeleccionarDestino}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
