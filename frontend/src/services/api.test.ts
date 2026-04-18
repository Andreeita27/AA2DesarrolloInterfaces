import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

//Este describe agrupa los test de la utilidad de peticiones
// Aqui se comprueba comportamiento normal, error del backend y sesión caducada
describe('apiFetch', () => {
    beforeEach(() => {
        // Limpia los modulos para que cada test importe api.test.ts desde 0
        // Es util porque api.ts lee import.meta.env al cargarse
        vi.resetModules();

        // Mock del fetch global
        vi.stubGlobal('fetch', vi.fn());

        // Se deja limpia la sesión simuldaa
        localStorage.clear();

        // Variable de entorno del backend para las pruebas
        vi.stubEnv('VITE_API_URL', 'http://localhost:8080');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('Devuelve los datos cuando la respuesta es correcta', async () => {
        const mockResponse = {
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ token: 'abc123' }),
        };

        vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

        // Importamos apiFetch dentro del test para que lea el env de este beforeEach
        const { apiFetch } = await import('./api');

        const result = await apiFetch<{ token: string }>('/auth/login', {
            method: 'POST',
            body: { email: 'test@test.com', password: '1234' },
        });

        expect(result).toEqual({ token: 'abc123' });
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:8080/auth/login',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@test.com',
                    password: '1234',
                }),
            })
        );
    });

    it('Lanza el mensaje del backend cuando la petición falla', async () => {
        const mockResponse = {
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({
                message: 'Credenciales incorrectas',
            }),
        };

        vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

        const { apiFetch } = await import ('./api');

        await expect(
            apiFetch('/auth/login', {
                method: 'POST',
                body: { email: 'mal@test.com', password: '1234' },
            })
        ).rejects.toThrow('Credenciales incorrectas');
    });

    it('Cierra sesión y redirige al login si el token ya no es válido', async () => {
        const mockResponse = {
            ok: false,
            status: 403,
            json: vi.fn().mockResolvedValue({
                message: 'Forbidden',
            }),
        };

        vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

        //Simula una sesión previa guardada
        localStorage.setItem('di_aa2_token', 'token-expirado');
        localStorage.setItem('di_aa2_user', JSON.stringify({ email: 'a@a.com' }));

        const { apiFetch } = await import('./api');

        await expect(
            apiFetch('/appointments', {
                method: 'GET',
                token: 'token-expirado',
            })
        ).rejects.toThrow('Tu sesión ha caducado. Vuelve a iniciar sesión.');

        expect(localStorage.getItem('di_aa2_token')).toBeNull();
        expect(localStorage.getItem('di_aa2_user')).toBeNull();
    });
});