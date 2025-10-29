// src/middlewares/errorHandler.js
import { AppError } from '../errors/AppError.js';

/**
 * Middleware centralizado de tratamento de erros
 * Captura TODOS os erros da aplicação e formata resposta
 * 
 * IMPORTANTE: Deve ser o ÚLTIMO middleware registrado no Express!
 */
const errorHandler = (error, req, res, next) => {
  // Log do erro para debugging
  console.error('❌ Erro capturado:', {
    message: error.message,
    code: error.code,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Se é um erro operacional (esperado), trata adequadamente
  if (error instanceof AppError && error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  // Erro do Prisma (banco de dados)
  if (error.code && error.code.startsWith('P')) {
    return handlePrismaError(error, req, res);
  }

  // Erro de validação do Zod
  if (error.name === 'ZodError') {
    return handleZodError(error, req, res);
  }

  // Erro não tratado (500)
  // Em produção, NÃO expor detalhes internos
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Erro interno do servidor',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * Trata erros específicos do Prisma
 */
const handlePrismaError = (error, req, res) => {
  const errorMap = {
    P2002: {
      // Unique constraint violation
      status: 409,
      code: 'CONFLICT',
      message: 'Registro duplicado. Este valor já existe no sistema.',
    },
    P2025: {
      // Record not found
      status: 404,
      code: 'NOT_FOUND',
      message: 'Registro não encontrado.',
    },
    P2003: {
      // Foreign key constraint
      status: 400,
      code: 'INVALID_REFERENCE',
      message: 'Referência inválida a outro registro.',
    },
  };

  const mappedError = errorMap[error.code] || {
    status: 500,
    code: 'DATABASE_ERROR',
    message: 'Erro no banco de dados.',
  };

  return res.status(mappedError.status).json({
    success: false,
    error: {
      code: mappedError.code,
      message: mappedError.message,
      ...(process.env.NODE_ENV === 'development' && {
        prismaCode: error.code,
        details: error.meta,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * Trata erros de validação do Zod
 */
const handleZodError = (error, req, res) => {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Dados de entrada inválidos',
      details,
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

export default errorHandler;