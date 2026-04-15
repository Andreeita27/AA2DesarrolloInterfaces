// URl base del backend
const API_URL = import.meta.env.VITE_API_URL;

// Tipo los métodos HTTP permitidos
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Opciones que podrá recibir la función genérica de fetch
interface ApiFetchOptions {
    method?: HttpMethod;
    body?: unknown;
    token?: string | null;
}

// Función reutilizable para hacer peticiones al backend
export async function apiFetch<T>( // La T indica el tipo de dato que esperamos recibir
    endpoint: string,
    options: ApiFetchOptions = {}
): Promise<T> {
    const { method = 'GET', body, token } = options;

    // Cabeceras comunes para todas las peticiones JSON
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Si recibimos token lo añadimos al header Authorization (necesario para rutas protegidas)
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Se hace la peticion al endpoint indicado
    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        //Si hay body se convierte a JSON
        body: body ? JSON.stringify(body) : undefined,
    });

    // Variable donde se guarda la respuesta del backend
    let data: unknown = null;

    try {
        // Se intenta parsear la respuesta como JSON
        data = await response.json();
    } catch {
        // Si falla se deja data a null
        // Esto evita que la app se rompa si el backend no devuelve JSON
        data = null;
    }

    // Si la respuesta HTTP no fue correcta
    if (!response.ok) {
        // Se intenta sacar un mensaje de error del backed
        const message = 
            typeof data === 'object' &&
            data !== null &&
            'message' in data &&
            typeof (data as { message?: unknown }).message === 'string'
                ? (data as { message: string }).message
                : 'Ha ocurrido un error en la petición';
        
        // Se lanza un error para que el componente o servicio lo gestione
        throw new Error(message);
    }

    // Si todo fue bien se devuelven los datos tipados
    return data as T;
}