// Clases de error y validaciones compartidas del negocio.

//* Error de negocio personalizado con código HTTP y título RFC 7807.
export class BusinessError extends Error {
  constructor(
    public readonly title: string,
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

//! Valida que la cantidad de personas sea un número entero estricto mayor o igual a 1.
export function validarCantidadPersonas(numPersonas: unknown): number {
  if (
    typeof numPersonas !== 'number' ||
    !Number.isInteger(numPersonas) ||
    numPersonas < 1
  ) {
    throw new BusinessError(
      'Cantidad de personas inválida',
      'El número de personas debe ser un entero positivo.',
      400
    );
  }
  return numPersonas;
}
