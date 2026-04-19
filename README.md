# 62 Rosas Tattoo - Frontend

Aplicación web desarrollada como parte de la **Actividad de Aprendizaje 2** de la asignatura *Desarrollo de Interfaces* en 2º DAM.

## Descripción del proyecto

62 Rosas Tattoo es una aplicación web orientada a la **gestión de citas de un estudio de tatuajes**, permitiendo a clientes y administradores interactuar con el sistema de forma organizada.

El objetivo del proyecto es construir una aplicación moderna que integre autenticación, gestión de estado, consumo de API, dashboards dinámicos y testing automatizado, siguiendo buenas prácticas de desarrollo frontend.

---

## Tecnologías utilizadas

* **React + TypeScript**
* **Vite**
* **React Router**
* **Context API + useReducer**
* **Fetch API (wrapper personalizado)**
* **CSS modular**
* **Vitest / Testing Library**

---

## Autenticación y autorización

La aplicación implementa un sistema de autenticación basado en **JWT**, que incluye:

* Registro de usuarios
* Inicio de sesión
* Persistencia de sesión mediante `localStorage`
* Protección de rutas (`ProtectedRoute`)
* Control de acceso por roles (`RoleRoute`)

### Roles disponibles

* **CLIENT**

  * Acceso a dashboard personal
  * Consulta de citas

* **ADMIN**

  * Acceso a panel de administración
  * Gestión de citas

---

## 🧠 Gestión de estado

Se ha diferenciado claramente entre estado global y estado local:

### Estado global (Context API)

* Usuario autenticado
* Token JWT
* Rol del usuario
* Estado de autenticación

➡️ Gestionado mediante `AuthContext`

### Estado local (useState / useReducer)

* Formularios (login, registro)
* Estados de carga y error
* Filtros y ordenación en dashboards

➡️ En los dashboards se utiliza **useReducer** para gestionar transiciones de estado complejas (carga, error, datos, filtros, ordenación).

---

## Consumo de API

El acceso a datos se realiza mediante una capa de servicios:

* `api.ts` → wrapper genérico de peticiones
* `authService.ts` → autenticación
* `appointmentService.ts` → gestión de citas

### Características

* Centralización de llamadas HTTP
* Gestión de errores global
* Manejo de estados de carga
* Control de sesión expirada

---

## Dashboards

La aplicación incluye dashboards diferenciados por rol:

### Cliente

* Visualización de sus citas
* Tabla dinámica con:

  * Filtros
  * Búsqueda
  * Ordenación
* Estados de carga, error y vacío
* Componentes de resumen

### Administrador

* Vista global de citas
* Tabla dinámica con:

  * Filtros
  * Búsqueda
  * Ordenación
* Estados de carga, error y vacío
* Componentes de resumen

---

## Testing

Se han implementado pruebas automatizadas para cubrir partes críticas de la aplicación:

* `AuthContext`
* Servicios (`apiFetch`)
* Reducers de dashboards

Se ha priorizado la **calidad de los casos de prueba** frente a la cantidad, validando comportamientos clave.

---

## Servicio externo: Google Maps

Se ha integrado **Google Maps** en la página principal mediante la **Maps Embed API**, mostrando la ubicación real del estudio.

### Motivo de la elección

* Integración ligera sin dependencias adicionales
* Mejora de la experiencia de usuario
* Solución adecuada a la funcionalidad requerida

---

## Estructura del proyecto

```
src/
│
├── components/        # Componentes reutilizables
├── contexts/          # Context API (Auth)
├── pages/             # Vistas principales
├── routes/            # Rutas protegidas
├── services/          # Lógica de acceso a API
├── reducers/          # Reducers locales (dashboard)
├── styles/            # Estilos CSS
└── tests/             # Tests automatizados
```

---

## Flujo de desarrollo (Git Flow)

El proyecto se ha gestionado siguiendo **Git Flow**, utilizando:

* `feature/*` → nuevas funcionalidades
* integración progresiva en `develop`
* versión final en `main`

Los commits siguen una estructura coherente y representan unidades lógicas de trabajo.

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Ejecutar el proyecto

```bash
npm run dev
```

---

## 🧾 Scripts disponibles

```bash
npm run dev      # entorno desarrollo
npm run test     # ejecutar tests
```

---

## 🎯 Conclusiones técnicas

Durante el desarrollo del proyecto se han aplicado buenas prácticas como:

* Separación de responsabilidades
* Uso adecuado de estado global vs local
* Centralización de servicios
* Protección de rutas
* Testing de lógica crítica

Además, se ha hecho un uso **crítico de herramientas de IA**, empleándolas como apoyo para mejorar la calidad del código sin sustituir el razonamiento técnico.

---
