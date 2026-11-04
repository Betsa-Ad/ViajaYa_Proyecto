import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ModalReserva from './components/ModalReserva';
import InicioView from './views/InicioView';
import DestinosView from './views/DestinosView';
import MisReservasView from './views/MisReservasView';
import AgenciaView from './views/AgenciaView';
import AdminView from './views/AdminView';
import { getDestinos } from './services/api';

// Componente principal de la aplicacion frontend ViajaYa
export default function App() {
  const getSeccionDesdeHash = () => {
    const hash = window.location.hash.replace('#', '').trim();
    const validas = ['inicio', 'destinos', 'mis-reservas', 'agencia', 'admin'];
    return validas.includes(hash) ? hash : 'inicio';
  };

  const [seccionActiva, setSeccionActiva] = useState(getSeccionDesdeHash);
  const [destinos, setDestinos] = useState([]);
  const [cargandoDestinos, setCargandoDestinos] = useState(true);
  const [errorDestinos, setErrorDestinos] = useState('');
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);

  // Carga inicial y recarga de destinos desde el backend
  const cargarDestinos = useCallback(async () => {
    setCargandoDestinos(true);
    setErrorDestinos('');
    try {
      const data = await getDestinos();
      setDestinos(data);
    } catch (err) {
      setErrorDestinos(err.message || 'No se pudieron cargar los destinos desde la API.');
    } finally {
      setCargandoDestinos(false);
    }
  }, []);

  useEffect(() => {
    cargarDestinos();
  }, [cargarDestinos]);

  // Sincronizacion con el hash de navegacion del navegador
  useEffect(() => {
    const handleHashChange = () => {
      setSeccionActiva(getSeccionDesdeHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Cambio de vista activa
  const cambiarSeccion = (seccion) => {
    setSeccionActiva(seccion);
    window.location.hash = seccion;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-layout">
      <Navbar
        seccionActiva={seccionActiva}
        onCambiarSeccion={cambiarSeccion}
      />

      <main className={destinoSeleccionado ? 'modal-activo-main' : ''}>
        {seccionActiva === 'inicio' && (
          <InicioView
            destinos={destinos}
            cargando={cargandoDestinos}
            error={errorDestinos}
            onNavegarDestinos={() => cambiarSeccion('destinos')}
            onSeleccionarDestino={(dest) => setDestinoSeleccionado(dest)}
          />
        )}

        {seccionActiva === 'destinos' && (
          <DestinosView
            destinos={destinos}
            cargando={cargandoDestinos}
            error={errorDestinos}
            onSeleccionarDestino={(dest) => setDestinoSeleccionado(dest)}
          />
        )}

        {seccionActiva === 'mis-reservas' && (
          <MisReservasView />
        )}

        {seccionActiva === 'agencia' && (
          <AgenciaView />
        )}

        {seccionActiva === 'admin' && (
          <AdminView
            destinos={destinos}
            onRecargarDestinos={cargarDestinos}
          />
        )}
      </main>

      {destinoSeleccionado && (
        <ModalReserva
          destino={destinoSeleccionado}
          onCerrar={() => setDestinoSeleccionado(null)}
          onReservaExitosa={() => {
            cargarDestinos();
          }}
        />
      )}

      <Footer onCambiarSeccion={cambiarSeccion} />
    </div>
  );
}
