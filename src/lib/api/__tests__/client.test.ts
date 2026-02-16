import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { apiGet, apiPost, apiPut, apiDelete, ApiClientError } from '../client';

describe('API client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('apiGet', () => {
    it('injects Authorization header from localStorage', async () => {
      localStorage.setItem('vault_api_key', 'test-key-123');

      server.use(
        http.get('/test/auth', ({ request }) => {
          const auth = request.headers.get('Authorization');
          return HttpResponse.json({ auth });
        }),
      );

      const result = await apiGet<{ auth: string }>('/test/auth');
      expect(result.auth).toBe('Bearer test-key-123');
    });

    it('works without API key', async () => {
      server.use(
        http.get('/test/no-auth', ({ request }) => {
          const auth = request.headers.get('Authorization');
          return HttpResponse.json({ auth });
        }),
      );

      const result = await apiGet<{ auth: string | null }>('/test/no-auth');
      expect(result.auth).toBeNull();
    });
  });

  describe('apiPost', () => {
    it('sends JSON body correctly', async () => {
      server.use(
        http.post('/test/post', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({ received: body });
        }),
      );

      const payload = { message: 'hello', count: 42 };
      const result = await apiPost<{ received: typeof payload }>('/test/post', payload);
      expect(result.received).toEqual(payload);
    });
  });

  describe('error handling', () => {
    it('throws ApiClientError with detail on error response', async () => {
      server.use(
        http.get('/test/error', () => {
          return HttpResponse.json(
            { detail: 'Not authorized' },
            { status: 401 },
          );
        }),
      );

      await expect(apiGet('/test/error')).rejects.toThrow(ApiClientError);

      try {
        await apiGet('/test/error');
      } catch (e) {
        const error = e as ApiClientError;
        expect(error.status).toBe(401);
        expect(error.detail).toBe('Not authorized');
        expect(error.message).toBe('Not authorized');
      }
    });
  });

  describe('apiPut', () => {
    it('sends PUT request', async () => {
      server.use(
        http.put('/test/put', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({ updated: body });
        }),
      );

      const payload = { name: 'updated-name' };
      const result = await apiPut<{ updated: typeof payload }>('/test/put', payload);
      expect(result.updated).toEqual(payload);
    });
  });

  describe('apiDelete', () => {
    it('handles 204 No Content', async () => {
      server.use(
        http.delete('/test/delete', () => {
          return new HttpResponse(null, { status: 204 });
        }),
      );

      await expect(apiDelete('/test/delete')).resolves.toBeUndefined();
    });
  });
});
