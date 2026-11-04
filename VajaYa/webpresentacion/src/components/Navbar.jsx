import React, { useState } from 'react';
import Logo from './Logo';

// Encabezado y navegacion principal del sistema ViajaYa
export default function Navbar({ seccionActiva, onCambiarSeccion }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleNavegar = (seccion) => {
    onCambiarSeccion(seccion);
    setMenuAbierto(false);
  };

  return (
    <header className="navbar">
      <div className="contenedor navbar-contenedor">
        <button
          type="button"
          className="navbar-logo-btn"
          onClick={() => handleNavegar('inicio')}
          aria-label="Ir a la página de inicio de ViajaYa"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
        >
          <Logo variante="navbar" />
        </button>

        <button
          className="menu-toggle"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Alternar menú"
        >
          {menuAbierto ? '✕' : '☰'}
        </button>

        <nav className={`navbar-menu ${menuAbierto ? 'abierto' : ''}`}>
          <button
            className={`navbar-link ${seccionActiva === 'inicio' ? 'activo' : ''}`}
            onClick={() => handleNavegar('inicio')}
          >
            Inicio
          </button>
          <button
            className={`navbar-link ${seccionActiva === 'destinos' ? 'activo' : ''}`}
            onClick={() => handleNavegar('destinos')}
          >
            Destinos
          </button>
          <button
            className={`navbar-link ${seccionActiva === 'mis-reservas' ? 'activo' : ''}`}
            onClick={() => handleNavegar('mis-reservas')}
          >
            Mis reservas
          </button>
          <button
            className={`navbar-link ${seccionActiva === 'agencia' ? 'activo' : ''}`}
            onClick={() => handleNavegar('agencia')}
          >
            Agencia
          </button>

          <button
            className={`navbar-admin-btn ${seccionActiva === 'admin' ? 'activo' : ''}`}
            onClick={() => handleNavegar('admin')}
            title="Acceso administrativo restringido"
          >
            Admin
          </button>
        </nav>
      </div>
    </header>
  );
}
