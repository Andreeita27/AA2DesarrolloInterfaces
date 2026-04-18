// URl base del backend
const API_URL = import.meta.env.VITE_API_URL;

// Claves de localstorage de la sesión
const TOKEN_KEY = 'di_aa2_token';
const USER_KEY = 'di_aa2_user';

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

    const url = `${API_URL}${endpoint}`;

    // Se hace la peticion al endpoint indicado
    const response = await fetch(url, {
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

    //Si el backend responde 401 y la peticion llevaba token, la sesion ya no es valida
    if ((response.status === 401 || response.status === 403) && token) {
        //Limpiamos la sesión guardada
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        //Redirige al login indicando que la sesión ha caducado y se usa replace para que no pueda volver atrás a una ruta protegida
        window.location.replace('/login?sessionExpired=1');

        //Lanzo error igualmente por si acaso
        throw new Error('Tu sesión ha caducado. Vuelve a iniciar sesión.')
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