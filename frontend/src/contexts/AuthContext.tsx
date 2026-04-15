import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, } from 'react';
import { authService } from '../services/authService';
import type { AuthUser, LoginRequest, RegisterRequest, UserRole, } from '../types/auth';

// Aquí se definen qué datos y funciones va a exponer el contexto
interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<AuthUser>;
    register: (credentials: RegisterRequest) => Promise<AuthUser>;
    logout: () => void;
    hasRole: (role: UserRole) => boolean;
}

// Se crea el contexto, al principio está undefined porque solo se podrá usar dentro del provider
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Claves que se usan en localstorage para guardar sesion
const TOKEN_KEY = 'di_aa2_token';
const USER_KEY = 'di_aa2_user';

// Provider del contexto
//Envuelve la app y permite compartir el estado de auth globalmente
export function AuthProvider({ children }: { children: ReactNode }) {
    // Usuario autenticado actual
    const [user, setUser] = useState<AuthUser | null>(null);

    // Token actual
    const [token, setToken] = useState<string | null>(null);

    //Estado de carga para saber si se está restaurando sesión
    const [isLoading, setIsLoading] = useState(true);

    //Este useffect se ejecuta al arrancar la app, sirve para restaurar sesion desde localstorage
    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedToken && savedUser) {
            setToken(savedToken);

            try {
                // Se recupera el usuario guardado
                setUser(JSON.parse(savedUser) as AuthUser);
            } catch {
                // Si el JSON esta corrupto, se limpia almacenamiento
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            }
        }

        // Terminamos la carga inicial
        setIsLoading(false);
    }, []);

    //Función para iniciar sesion, guarda token y usuario en estado y en localstorage
    const login = async (credentials: LoginRequest): Promise<AuthUser> => {
        const response = await authService.login(credentials);

        setToken(response.token);
        setUser(response.user);

        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));

        return response.user;
    };

    // Funcion para registrar un usuario, también deja la sesion iniciada automaticamente
    const register = async (data: RegisterRequest): Promise<AuthUser> => {
        const response = await authService.register(data);

        setToken(response.token);
        setUser(response.user);

        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));

        return response.user;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    // Utilidad para comproobar si el susuario tiene un rol concreto
    const hasRole = (role: UserRole) => user?.role === role;

    //usememo para no recrear el objeto value en cada render
    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: !!token && !!user,
            isLoading,
            login,
            register,
            logout,
            hasRole,
        }),
        [user, token, isLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto de auth más comodamente
export function useAuth() {
    const context = useContext(AuthContext);

    // Si alguien usa el hook fuera del provider, avisa
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }

    return context;
}