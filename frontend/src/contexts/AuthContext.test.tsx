import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Test del hook personalizado useAuth
// Aquí comprobamos que lanza error si se usa fuera del provider y que funciona correctamente dentro del provider
describe('useAuth', () => {

    it('lanza error si se usa fuera de AuthProvider', () => {
        // renderHook ejecuta el hook como si fuera un componente pero sin envolverlo en el provider
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth debe usarse dentro de AuthProvider');
    });

    it('devuelve el contexto correctamente dentro de AuthProvider', () => {
        // Creamos un wrapper que envuelve el hook en el provider
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{ children }</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Comprobamos que el estado inicial es correcto
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);

        // También comprobamos que las funciones existen
        expect(typeof result.current.login).toBe('function');
        expect(typeof result.current.logout).toBe('function');
        expect(typeof result.current.register).toBe('function');
        expect(typeof result.current.hasRole).toBe('function');
    });
});