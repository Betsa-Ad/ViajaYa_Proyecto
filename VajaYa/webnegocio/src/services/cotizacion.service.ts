
// Implementa RN-03: cálculo de tarifa SIN persistir en BD.
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

  //! RN-03: Fórmula oficial — Subtotal = PrecioBase * NPersonas; IVA = Subtotal * 0.13; Total = Subtotal + IVA.
  calcular(input: CotizacionInput): CotizacionResult {
    if (input.precioBase <= 0) {
      throw new Error('El precio base debe ser mayor a cero.');
    }
    if (input.numPersonas <= 0 || !Number.isInteger(input.numPersonas)) {
      throw new Error('El número de personas debe ser un entero positivo.');
    }

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
