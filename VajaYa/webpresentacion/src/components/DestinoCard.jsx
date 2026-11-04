import React from 'react';
import { obtenerFotoDestino, formatearColones } from '../utils/imagenes';

// Tarjeta para mostrar la informacion y cupo maximo de cada destino
export default function DestinoCard({ destino, onVerMas }) {
  const foto = obtenerFotoDestino(destino.nombre, destino.id);

  return (
    <article className="tarjeta-destino">
      <div className="tarjeta-imagen-wrapper">
        <img
          src={foto}
          alt={destino.nombre}
          className="tarjeta-imagen"
          loading="lazy"
        />
        <span className="tarjeta-cupo-badge" title="Capacidad diaria regulada">
          Cupo: {destino.capacidadDiaria} pers/día
        </span>
      </div>

      <div className="tarjeta-cuerpo">
        <h3 className="tarjeta-nombre">{destino.nombre}</h3>
        <p className="tarjeta-descripcion">
          {destino.descripcion || 'Descubre la magia natural y los paisajes inolvidables de este destino.'}
        </p>

        <div className="tarjeta-precio-fila">
          <div>
            <span className="tarjeta-precio-etiqueta">Precio base</span>
            <div className="tarjeta-precio-monto">
              {formatearColones(destino.precioBase)}
              <small> / pers</small>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-turquesa"
          onClick={() => onVerMas(destino)}
          style={{ width: '100%' }}
        >
          Ver más y Reservar
        </button>
      </div>
    </article>
  );
}
