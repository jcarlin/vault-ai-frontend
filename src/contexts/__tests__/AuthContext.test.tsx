import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores API key in localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setApiKey('my-secret-key');
    });

    expect(result.current.apiKey).toBe('my-secret-key');
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('vault_api_key')).toBe('my-secret-key');
  });

  it('clears API key', () => {
    localStorage.setItem('vault_api_key', 'existing-key');

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.apiKey).toBe('existing-key');

    act(() => {
      result.current.clearApiKey();
    });

    expect(result.current.apiKey).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('vault_api_key')).toBeNull();
  });

  it('useAuth hook provides key and setters', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toHaveProperty('apiKey');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('setApiKey');
    expect(result.current).toHaveProperty('clearApiKey');
    expect(typeof result.current.setApiKey).toBe('function');
    expect(typeof result.current.clearApiKey).toBe('function');
  });
});
