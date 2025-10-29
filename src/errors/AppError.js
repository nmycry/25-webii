// src/errors/AppError.js

/**
 * Classe base para erros customizados da aplicação
 * Estende Error nativo do JavaScript
 */
class AppError extends Error {
  /**
   * @param {string} message - Mensagem de erro legível para humanos
   * @param {number} statusCode - Código HTTP do erro
   * @param {string} code - Código do erro para máquinas (ex: VALIDATION_ERROR)
   * @param {Array} details - Detalhes adicionais do erro
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Erro operacional (esperado)

    // Captura stack trace (útil para debug)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de validação (400)
 * Usado quando dados de entrada são inválidos
 */
class ValidationError extends AppError {
  constructor(message = 'Dados de entrada inválidos', details = []) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Erro de recurso não encontrado (404)
 * Usado quando um recurso solicitado não existe
 */
class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado', resource = '') {
    super(message, 404, 'NOT_FOUND', [{ resource }]);
  }
}

/**
 * Erro de conflito (409)
 * Usado quando há conflito de estado (ex: email duplicado)
 */
class ConflictError extends AppError {
  constructor(message = 'Conflito de dados', field = '') {
    super(message, 409, 'CONFLICT', [{ field }]);
  }
}

/**
 * Erro de autenticação (401)
 * Usado quando usuário não está autenticado
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Autenticação necessária') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Erro de autorização (403)
 * Usado quando usuário não tem permissão
 */
class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 403, 'FORBIDDEN');
  }
}

export {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
};