// tests/users.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

/**
 * Testes de Integração - User API (com Validação e Error Handling)
 * Testa os endpoints de usuários com validação Zod e erros customizados
 */

describe('User API - Endpoints com Validação', () => {
  let createdUserId; // Para armazenar ID de usuário criado nos testes

  describe('GET /users', () => {
    it('deve retornar lista de usuários com status 200', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve retornar usuários sem campo senha', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);

      if (response.body.data.length > 0) {
        const primeiroUsuario = response.body.data[0];
        expect(primeiroUsuario).not.toHaveProperty('senha');
        expect(primeiroUsuario).toHaveProperty('id');
        expect(primeiroUsuario).toHaveProperty('nome');
        expect(primeiroUsuario).toHaveProperty('email');
      }
    });
  });

  describe('GET /users/:id', () => {
    it('deve retornar usuário específico com status 200', async () => {
      // Cria um usuário para o teste
      const novoUsuario = await request(app).post('/users').send({
        nome: 'Usuario GetById Test',
        email: `getbyid${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      const userId = novoUsuario.body.data.id;

      const response = await request(app).get(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', userId);
      expect(response.body.data).not.toHaveProperty('senha');
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const response = await request(app).get('/users/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error.message).toContain('não encontrado');
    });

    it('deve retornar 400 para ID inválido (letras)', async () => {
      const response = await request(app).get('/users/abc');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details.length).toBeGreaterThan(0);
    });

    it('deve retornar 400 para ID negativo', async () => {
      const response = await request(app).get('/users/-1');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('POST /users - Validações', () => {
    it('deve criar novo usuário com dados válidos', async () => {
      const novoUsuario = {
        nome: 'Prof. Teste Completo',
        email: `teste${Date.now()}@escola.com`,
        senha: 'senha123',
        papel: 'PROFESSOR',
      };

      const response = await request(app).post('/users').send(novoUsuario);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nome).toBe(novoUsuario.nome);
      expect(response.body.data.email).toBe(novoUsuario.email.toLowerCase());
      expect(response.body.data).not.toHaveProperty('senha');

      // Salva ID para testes futuros
      createdUserId = response.body.data.id;
    });

    it('deve aplicar transformações do Zod (trim, toLowerCase)', async () => {
      const novoUsuario = {
        nome: '  Prof. Com Espaços  ',
        email: `MAIUSCULO${Date.now()}@ESCOLA.COM`,
        senha: 'senha123',
      };

      const response = await request(app).post('/users').send(novoUsuario);

      expect(response.status).toBe(201);
      expect(response.body.data.nome).toBe('Prof. Com Espaços'); // trimmed
      expect(response.body.data.email).not.toContain(' '); // trimmed
      expect(response.body.data.email).toBe(
        response.body.data.email.toLowerCase(),
      ); // lowercase
    });

    it('deve retornar 400 quando nome estiver ausente', async () => {
      const usuarioInvalido = {
        email: `teste${Date.now()}@escola.com`,
        senha: 'senha123',
      };

      const response = await request(app).post('/users').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
      const nomeError = response.body.error.details.find(
        d => d.field === 'nome',
      );
      expect(nomeError).toBeDefined();
      expect(nomeError.message).toContain('obrigatório');
    });

    it('deve retornar 400 quando nome for muito curto', async () => {
      const usuarioInvalido = {
        nome: 'Jo', // Menos de 3 caracteres
        email: `teste${Date.now()}@escola.com`,
        senha: 'senha123',
      };

      const response = await request(app).post('/users').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      const nomeError = response.body.error.details.find(
        d => d.field === 'nome',
      );
      expect(nomeError.message).toContain('pelo menos 3 caracteres');
    });

    it('deve retornar 400 quando email for inválido', async () => {
      const usuarioInvalido = {
        nome: 'Teste',
        email: 'emailsemarroba', // Sem @
        senha: 'senha123',
      };

      const response = await request(app).post('/users').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      const emailError = response.body.error.details.find(
        d => d.field === 'email',
      );
      expect(emailError).toBeDefined();
      expect(emailError.message).toContain('Email inválido');
    });

    it('deve retornar 400 quando senha for muito curta', async () => {
      const usuarioInvalido = {
        nome: 'Teste',
        email: `teste${Date.now()}@escola.com`,
        senha: '123', // Menos de 6 caracteres
      };

      const response = await request(app).post('/users').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      const senhaError = response.body.error.details.find(
        d => d.field === 'senha',
      );
      expect(senhaError.message).toContain('pelo menos 6 caracteres');
    });

    it('deve retornar 400 quando papel for inválido', async () => {
      const usuarioInvalido = {
        nome: 'Teste',
        email: `teste${Date.now()}@escola.com`,
        senha: 'senha123',
        papel: 'HACKER', // Papel inválido
      };

      const response = await request(app).post('/users').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      const papelError = response.body.error.details.find(
        d => d.field === 'papel',
      );
      expect(papelError).toBeDefined();
    });

    it('deve retornar 400 com múltiplos erros de validação', async () => {
      const usuarioInvalido = {
        nome: 'Jo', // Muito curto
        email: 'invalido', // Sem @
        senha: '123', // Muito curta
      };

      const response = await request(app).post('/users').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details.length).toBe(3); // 3 erros
    });

    it('deve retornar 409 ao criar usuário com email duplicado', async () => {
      const email = `duplicado${Date.now()}@escola.com`;

      // Cria primeiro usuário
      await request(app).post('/users').send({
        nome: 'Primeiro',
        email: email,
        senha: 'senha123',
      });

      // Tenta criar segundo com mesmo email
      const response = await request(app).post('/users').send({
        nome: 'Segundo',
        email: email,
        senha: 'senha123',
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toHaveProperty('code', 'CONFLICT');
      expect(response.body.error.message).toContain('já cadastrado');
    });

    it('deve aceitar foto como URL válida (opcional)', async () => {
      const novoUsuario = {
        nome: 'Usuario com Foto',
        email: `foto${Date.now()}@escola.com`,
        senha: 'senha123',
        foto: 'https://example.com/foto.jpg',
      };

      const response = await request(app).post('/users').send(novoUsuario);

      expect(response.status).toBe(201);
      expect(response.body.data.foto).toBe(novoUsuario.foto);
    });

    it('deve retornar 400 quando foto for URL inválida', async () => {
      const usuarioInvalido = {
        nome: 'Teste',
        email: `teste${Date.now()}@escola.com`,
        senha: 'senha123',
        foto: 'nao-e-uma-url', // URL inválida
      };

      const response = await request(app).post('/users').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      const fotoError = response.body.error.details.find(
        d => d.field === 'foto',
      );
      expect(fotoError).toBeDefined();
    });
  });

  describe('PUT /users/:id - Validações', () => {
    it('deve atualizar usuário com dados válidos', async () => {
      // Cria usuário para atualizar
      const novoUsuario = await request(app).post('/users').send({
        nome: 'Usuario Original',
        email: `original${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      const userId = novoUsuario.body.data.id;

      // Atualiza
      const response = await request(app).put(`/users/${userId}`).send({
        nome: 'Usuario Atualizado',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.nome).toBe('Usuario Atualizado');
      expect(response.body.data.id).toBe(userId);
    });

    it('deve retornar 400 quando nenhum campo for fornecido', async () => {
      // Cria usuário
      const novoUsuario = await request(app).post('/users').send({
        nome: 'Usuario Teste',
        email: `teste${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      const userId = novoUsuario.body.data.id;

      // Tenta atualizar sem dados
      const response = await request(app).put(`/users/${userId}`).send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error.details[0].message).toContain('Pelo menos um campo');
    });

    it('deve retornar 404 ao atualizar usuário inexistente', async () => {
      const response = await request(app).put('/users/99999').send({
        nome: 'Teste',
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('deve retornar 409 ao tentar usar email já existente', async () => {
      // Cria dois usuários
      const usuario1 = await request(app).post('/users').send({
        nome: 'Usuario 1',
        email: `user1${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      const usuario2 = await request(app).post('/users').send({
        nome: 'Usuario 2',
        email: `user2${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      // Tenta atualizar usuario2 com email do usuario1
      const response = await request(app)
        .put(`/users/${usuario2.body.data.id}`)
        .send({
          email: usuario1.body.data.email,
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toHaveProperty('code', 'CONFLICT');
      expect(response.body.error.message).toContain('já está em uso');
    });

    it('deve retornar 400 para validações de campos no update', async () => {
      // Cria usuário
      const novoUsuario = await request(app).post('/users').send({
        nome: 'Usuario Teste',
        email: `teste${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      const userId = novoUsuario.body.data.id;

      // Tenta atualizar com dados inválidos
      const response = await request(app).put(`/users/${userId}`).send({
        nome: 'Jo', // Muito curto
        email: 'invalido', // Sem @
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error.details.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /users/:id - Validações', () => {
    it('deve deletar usuário existente', async () => {
      // Cria usuário para deletar
      const novoUsuario = await request(app).post('/users').send({
        nome: 'Usuario Para Deletar',
        email: `deletar${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      const userId = novoUsuario.body.data.id;

      // Deleta
      const response = await request(app).delete(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('removido com sucesso');

      // Verifica que não existe mais
      const busca = await request(app).get(`/users/${userId}`);
      expect(busca.status).toBe(404);
    });

    it('deve retornar 404 ao deletar usuário inexistente', async () => {
      const response = await request(app).delete('/users/99999');

      expect(response.status).toBe(404);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('deve retornar 400 para ID inválido no delete', async () => {
      const response = await request(app).delete('/users/abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('Formato de Erro Padronizado', () => {
    it('deve retornar erro com estrutura padronizada', async () => {
      const response = await request(app).get('/users/99999');

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });

    it('deve incluir detalhes em erros de validação', async () => {
      const response = await request(app).post('/users').send({
        nome: 'Jo',
        email: 'invalido',
      });

      expect(response.body.error).toHaveProperty('details');
      expect(Array.isArray(response.body.error.details)).toBe(true);
      expect(response.body.error.details[0]).toHaveProperty('field');
      expect(response.body.error.details[0]).toHaveProperty('message');
    });
  });

  describe('GET /health', () => {
    it('deve retornar status da API', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('api', 'OK');
      expect(response.body.services).toHaveProperty('database');
    });
  });

  describe('Rota 404', () => {
    it('deve retornar 404 para rota inexistente', async () => {
      const response = await request(app).get('/rota-inexistente');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error.message).toContain('não encontrada');
    });
  });
});