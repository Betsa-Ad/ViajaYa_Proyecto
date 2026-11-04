// Coleccion de fotografias por defecto para destinos de Costa Rica
const FOTOS_DESTINOS = {

  tortuguero: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  'manuel antonio': 'https://images.unsplash.com/photo-1589556264800-08ae9e129a8c?auto=format&fit=crop&w=800&q=80',
};

const FOTO_POR_DEFECTO = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';

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
