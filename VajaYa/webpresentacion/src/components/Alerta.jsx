import React from 'react';

// Componente reutilizable para mensajes de alerta y avisos
export default function Alerta({ tipo = 'info', mensaje, onCerrar }) {
  if (!mensaje) return null;

  return (
    <div className={`alerta alerta-${tipo}`}>
      <span className="alerta-icono">!</span>
      <div style={{ flex: 1 }}>{mensaje}</div>
      {onCerrar && (
        <button
          onClick={onCerrar}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit' }}
          title="Cerrar"
        >
          ✕
        </button>
      )}
    </div>
  );
}
