import React from 'react';
import Logo from './Logo';

// Pie de pagina institucional del sistema ViajaYa
export default function Footer({ onCambiarSeccion }) {
  return (
    <footer className="footer">
      <div className="contenedor">
        <div className="footer-grid">
          <div className="footer-col">
            <button
              type="button"
              onClick={() => onCambiarSeccion('inicio')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', marginBottom: '14px' }}
              aria-label="Ir a la página de inicio"
            >
              <Logo variante="footer" />
            </button>
            <p>
              Agencia de viajes comprometida con experiencias auténticas, turismo sostenible
              y total transparencia en tarifas bajo las regulaciones costarricenses.
            </p>
          </div>

          <div className="footer-col">
            <h4>Navegación</h4>
            <ul className="footer-enlaces">
              <li><button type="button" onClick={() => onCambiarSeccion('inicio')}>Inicio</button></li>
              <li><button type="button" onClick={() => onCambiarSeccion('destinos')}>Catálogo de Destinos</button></li>
              <li><button type="button" onClick={() => onCambiarSeccion('mis-reservas')}>Consultar mis Reservas</button></li>
              <li><button type="button" onClick={() => onCambiarSeccion('agencia')}>Acerca de</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Transparencia</h4>
            <ul className="footer-enlaces">
              <li><span style={{ color: '#D4E7E3' }}>IVA 13% incluido en cotizaciones</span></li>
              <li><span style={{ color: '#D4E7E3' }}>Reprogramación flexible (48h antes)</span></li>
              <li><span style={{ color: '#D4E7E3' }}>Control estricto de cupos diarios</span></li>
              <li>
                <button
                  type="button"
                  onClick={() => onCambiarSeccion('admin')}
                  style={{ color: 'var(--color-verde-agua)', textDecoration: 'underline', marginTop: '6px', fontWeight: 600 }}
                >
                  Acceso Administrativo (/admin)
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ViajaYa — Sistema de Reservas y Gestión Turística.</p>
          <p> Pura Vida</p>
        </div>
      </div>
    </footer>
  );
}
