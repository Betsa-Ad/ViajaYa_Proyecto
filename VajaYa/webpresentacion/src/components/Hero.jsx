import React from 'react';

// Portada principal con imagen de Costa Rica y boton de llamada a la accion
export default function Hero({ onExplorarDestinos }) {
  return (
    <section className="hero">
      <div className="contenedor">
        <div className="hero-contenido">
          <span className="hero-tag">COSTA RICA • EXPERIENCIAS ÚNICAS</span>
          <h1 className="hero-titulo">
            Tu próxima aventura comienza aquí
          </h1>
          <p className="hero-subtitulo">
            Descubrí nuevos destinos y viví experiencias inolvidables por Costa Rica.
            Reserva fácil, sin complicaciones y con total transparencia.
          </p>
          <button
            type="button"
            className="btn btn-turquesa"
            onClick={onExplorarDestinos}
            style={{ fontSize: '1.05rem', padding: '14px 28px' }}
          >
            Explorar destinos
          </button>
        </div>
      </div>
    </section>
  );
}
