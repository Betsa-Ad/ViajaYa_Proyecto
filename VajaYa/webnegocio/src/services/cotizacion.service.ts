
// Implementa RN-03: cálculo de tarifa SIN persistir en BD.
import { BusinessError, validarCantidadPersonas } from './validaciones';

export interface CotizacionInput {
  precioBase: number;
  numPersonas: number;
}

export interface CotizacionResult {
  subtotal: number;
  iva: number;
  total: number;
}

export class CotizacionService {
  private readonly IVA_RATE = 0.13; // 13% IVA según RN-03

  //! RN-03: Calcula tarifa oficial validando precio base y cantidad de personas.
  calcular(input: CotizacionInput): CotizacionResult {
    if (input.precioBase <= 0) {
      throw new BusinessError('Precio base inválido', 'El precio base debe ser mayor a cero.', 400);
    }
    //! Valida de forma estricta que numPersonas sea entero mayor o igual a 1.
    validarCantidadPersonas(input.numPersonas);

    const subtotal = input.precioBase * input.numPersonas;
    const iva = subtotal * this.IVA_RATE;
    const total = subtotal + iva;

    //* Redondea a 2 decimales para evitar errores de punto flotante.
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }
}
