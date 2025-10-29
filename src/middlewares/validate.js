// src/middlewares/validate.js
import { ValidationError } from '../errors/AppError.js';

/**
 * Middleware factory para validação com Zod
 * Cria um middleware que valida dados contra um schema Zod
 * 
 * @param {Object} schema - Schema Zod para validação
 * @param {string} source - De onde vem os dados ('body', 'params', 'query')
 * @returns {Function} Middleware Express
 */
const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      // Pega os dados da fonte especificada
      const dataToValidate = req[source];
      console.log('aaaaaa');
      console.log(dataToValidate);
      console.log('aaaaaa');
      // Valida usando safeParse (não lança exceção)
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        // Formata erros do Zod
        const details = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        throw new ValidationError('Dados de entrada inválidos', details);
      }

      // Substitui dados originais pelos validados e transformados
      // Zod pode ter aplicado transformações (trim, toLowerCase, etc.)
      req[source] = result.data;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validate;