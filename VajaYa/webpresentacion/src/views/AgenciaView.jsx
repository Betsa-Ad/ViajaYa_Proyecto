import React from 'react';

// Vista institucional de la agencia ViajaYa
export default function AgenciaView() {
  return (
    <section className="seccion">
      <div className="contenedor">
        <div className="seccion-titulo">
          <h2>Sobre la Agencia ViajaYa</h2>
          <p>
            Comprometidos con el desarrollo del turismo sostenible y la transparencia en Costa Rica.
          </p>
        </div>

        <div className="agencia-contenedor">
          <p className="agencia-intro">
            <strong>ViajaYa</strong> es una iniciativa digital diseñada para conectar a viajeros
            nacionales e internacionales con las maravillas naturales de Costa Rica, fomentando un
            turismo ordenado, ético y respetuoso con la rica biodiversidad costarricense.
          </p>

          <p style={{ marginBottom: '24px', color: 'var(--color-texto)', lineHeight: '1.7' }}>
            Nuestra plataforma promueve el acceso a playas, volcanes, parques nacionales y reservas
            biológicas, garantizando a los visitantes información clara de disponibilidad y costos
            antes de emprender su recorrido.
          </p>

          <h3 style={{ color: 'var(--color-azul-oceano)', marginBottom: '16px', fontSize: '1.3rem' }}>
            Nuestros Compromisos Operativos
          </h3>

          <div className="agencia-pilares">
            <div className="pilar-card">
              <h4 className="pilar-titulo">Conservación y Cuidado del Entorno</h4>
              <p className="pilar-desc">
                Respetamos los aforos diarios recomendados por las autoridades ambientales para
                minimizar el impacto de la actividad humana en ecosistemas sensibles.
              </p>
            </div>

            <div className="pilar-card">
              <h4 className="pilar-titulo">Transparencia Fiscal y Tarifaria</h4>
              <p className="pilar-desc">
                Todas nuestras tarifas desglosan de forma exacta el precio base y el Impuesto al Valor
                Agregado (IVA 13%) estipulado en la legislación nacional, sin cargos sorpresa.
              </p>
            </div>

            <div className="pilar-card">
              <h4 className="pilar-titulo">Atención y Flexibilidad</h4>
              <p className="pilar-desc">
                Facilitamos la autogestión de reservas con mecanismos simples para reprogramar fechas
                o cancelar servicios con la debida anticipación de 48 horas.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '36px', padding: '20px', backgroundColor: 'var(--color-arena-claro)', borderRadius: '10px', borderLeft: '4px solid var(--color-azul-oceano)' }}>
            <h4 style={{ color: 'var(--color-azul-oceano)', marginBottom: '6px' }}>Identidad Costarricense</h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-texto)', margin: 0 }}>
              Operamos con orgullo desde Costa Rica para promover el lema <em>Pura Vida</em> en cada
              experiencia, impulsando a las comunidades locales y la economía de las regiones turísticas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
