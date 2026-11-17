// Coleccion de fotografias por defecto para destinos de Costa Rica
const FOTOS_DESTINOS = {

  tortuguero: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/44/dd/b3/stunning.jpg?w=1200&h=1200&s=1',
  'manuel antonio': 'https://www.vyoforestal.com/wp-content/uploads/2024/06/Manuel-Antonio-Entrada-1200x675.jpg',
  'volcán arenal': 'https://ecoterracostarica.com/wp-content/uploads/2025/11/Sceince-behind-arenal-voolcano.jpg',
  'isla uvita': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBYPl6HqTzf1rLmrCWXnynHm0GXmJuLAJKlXupLqiPGrjE1TPTu9rkpAer&s=10',
  'tortugero': 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/44/dd/b3/stunning.jpg?w=1200&h=1200&s=1',
  'bosque nuboso': 'https://www.therealdealtours.com/blog/wp-content/uploads/2021/11/monteverde_cloud_forest_reserve1-696x522.jpg',
  'catarata la fortuna': 'https://fotohiking.com/wp-content/uploads/2020/10/49913542982_24c9b617b5_h.jpg',
  'mirador de orosí': 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/1e/5e/55/caption.jpg?w=900&h=500&s=1',
  
  
  
};

const FOTO_POR_DEFECTO = 'https://pic-2.vpackage.net/viaje_a_Costa%20Rica/intinerariodeviajeaCostaRica6_80665.jpg';

// Redimensiona y comprime una imagen local mediante canvas nativo
export function comprimirImagen(archivo, anchoMax = 600, calidad = 0.7) {
  return new Promise((resolve) => {
    if (!archivo || !archivo.type.startsWith('image/')) {
      resolve('');
      return;
    }

    const lector = new FileReader();
    lector.onload = (evento) => {
      const img = new Image();
      img.onload = () => {
        let ancho = img.width;
        let alto = img.height;

        if (ancho > anchoMax) {
          alto = Math.round((alto * anchoMax) / ancho);
          ancho = anchoMax;
        }

        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(evento.target.result);
          return;
        }

        ctx.drawImage(img, 0, 0, ancho, alto);
        const dataUrlComprimida = canvas.toDataURL('image/jpeg', calidad);
        resolve(dataUrlComprimida);
      };
      img.onerror = () => resolve(evento.target.result);
      img.src = evento.target.result;
    };
    lector.onerror = () => resolve('');
    lector.readAsDataURL(archivo);
  });
}

// Corrige la codificacion de caracteres y errores ortograficos comunes
export function corregirTexto(texto = '') {
  if (!texto || typeof texto !== 'string') return '';
  return texto
    .replace(/paradis[?]acas/gi, 'paradisiacas')
    .replace(/paradisacas/gi, 'paradisiacas')
    .replace(/m[?]s/gi, 'más')
    .replace(/volc[?]n/gi, 'volcán')
    .replace(/atraci[?]n/gi, 'atracción')
    .replace(/ecol[?]gico/gi, 'ecológico')
    .replace(/est[?]/gi, 'está');
}

// Obtiene la fotografia del destino priorizando imagenes personalizadas
export function obtenerFotoDestino(nombre = '', destinoId = null) {
  try {
    if (destinoId) {
      const fotoGuardadaId = localStorage.getItem(`viajaya_img_${destinoId}`);
      if (fotoGuardadaId) return fotoGuardadaId;
    }

    const nombreLimpio = nombre.toLowerCase().trim();
    const fotoGuardadaNombre = localStorage.getItem(`viajaya_img_${nombreLimpio}`);
    if (fotoGuardadaNombre) return fotoGuardadaNombre;
  } catch {
    // Si localStorage no es accesible, continua con el catalogo por defecto
  }

  const nombreBusqueda = nombre.toLowerCase().trim();
  for (const [clave, url] of Object.entries(FOTOS_DESTINOS)) {
    if (nombreBusqueda.includes(clave)) {
      return url;
    }
  }

  return FOTO_POR_DEFECTO;
}

// Guarda la imagen personalizada en localStorage con proteccion try catch
export function guardarFotoDestino(destinoId, nombre, imagenUrlOBase64) {
  if (!imagenUrlOBase64) return;
  try {
    if (destinoId) {
      localStorage.setItem(`viajaya_img_${destinoId}`, imagenUrlOBase64);
    }
    if (nombre) {
      localStorage.setItem(`viajaya_img_${nombre.toLowerCase().trim()}`, imagenUrlOBase64);
    }
  } catch (error) {
    // Evita interrumpir la operacion si la cuota de almacenamiento se excede
    console.warn('Almacenamiento de imagen omitido por limite de cuota:', error);
  }
}

// Formatea montos en colones costarricenses
export function formatearColones(monto) {
  if (monto == null || isNaN(monto)) return '₡0';
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(monto);
}

//* Resuelve el nombre del destino a partir de la reserva o destino asociado (DRY)
export function resolverNombreDestino(reserva, destino = null, catalogoDestinos = []) {
  if (reserva?.nombreDestino) return reserva.nombreDestino;
  if (reserva?.destinoNombre) return reserva.destinoNombre;
  if (destino?.nombre) return destino.nombre;
  if (catalogoDestinos && catalogoDestinos.length > 0 && reserva?.destinoId) {
    const encontrado = catalogoDestinos.find((d) => String(d.id) === String(reserva.destinoId));
    if (encontrado?.nombre) return encontrado.nombre;
  }
  return reserva?.destinoId ? `Destino #${reserva.destinoId}` : 'Destino turístico';
}
