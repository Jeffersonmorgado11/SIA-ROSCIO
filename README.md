# PROYECTO S.I.A ROSCIO

## ¿Qué es S.I.A ROSCIO?

Bienvenido a **S.I.A ROSCIO** (Sistema Integral de inventario y administración Roscio).
Es una plataforma web diseñada para la gestión eficiente del inventario de comedor y el control de asistencia del personal obrero en el Liceo "Juan Germán Roscio".

El sistema permite automatizar procesos administrativos clave, reemplazando registros manuales por una solución digital que facilita el seguimiento de productos, la gestión de entradas y salidas de almacén, y el control diario de asistencia.

---

## ¿Con qué se construyó?

Para desarrollar este proyecto, se han utilizado varias herramientas de programación:

### La parte visual (Frontend)
*   **HTML**: Para la estructura de las páginas y vistas administrativas.
*   **CSS**: Para el diseño visual, estilos responsivos y apariencia profesional.
*   **JavaScript (Vanilla)**: Lógica del cliente, manejo de modales, interacción con la API y funcionalidades dinámicas sin frameworks pesados.
*   **tabler.io**: Se usaron iconos vectoriales para una interfaz limpia y moderna.

### La parte lógica (Backend)
*   **Node.js**: Entorno de ejecución principal.
*   **Express**: Framework para manejar las rutas y la API RESTful.
*   **Seguridad**:
    *   **JWT (Json Web Tokens)**: Para el manejo seguro de sesiones y autenticación.
    *   **Bcrypt**: Para la encriptación segura de contraseñas.

### La Base de Datos
*   **MongoDB**: Base de datos NoSQL utilizada para almacenar toda la información: usuarios, inventario, registros de asistencia y solicitudes.
*   **Mongoose**: ODM para modelar los datos y gestionar la conexión.

## Requisitos de Instalación

Para ejecutar este proyecto, es necesario instalar:

1.  **Node.js**: Entorno de ejecución (Versión 16 o superior recomendada).
2.  **MongoDB**: Base de datos local o cluster en la nube.
3.  **MongoDB Compass**: Herramienta visual recomendada para gestionar la base de datos.
4.  **Visual Studio Code**: Editor de código recomendado.

---

## Guía de Instalación

Pasos a seguir para la instalación y ejecución del proyecto:

1.  **Descargar el código**: Clonar el repositorio o descargar la carpeta del proyecto.
2.  **Instalar dependencias**: Abrir la terminal en la carpeta raíz del proyecto y ejecutar:
    
    ```bash
    npm install
    ```
    Esto descargará todos los paquetes listados en `package.json`.

3.  **Configurar variables de entorno (.env)**:
    Crear un archivo llamado `.env` en la raíz del proyecto y configurar las siguientes variables (ejemplo):
    
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/sistema_roscio
    JWT_SECRET=tu_clave_secreta_segura
    ```

4.  **Iniciar la Base de Datos**:
    Asegurarse de que el servicio de MongoDB esté corriendo localmente:
    ```bash
    mongod
    ```
    *(Si usas Windows y lo instalaste como servicio, ya debería estar activo).*

5.  **Iniciar el proyecto**:
    En la terminal del proyecto ejecutar:
    
    ```bash
    npm run dev
    ```
    Se mostrará un mensaje indicando que el servidor está escuchando en el puerto configurado (ej: 3000) y conectado a la base de datos.

6.  **Acceder a la página**:
    Abrir el navegador y dirigirse a: `http://localhost:5000`

---

## ¿Cómo se usa?

Existen diferentes roles de usuario con permisos específicos:

### 1. Administrador
*   Usuario con control total del sistema.
*   **Gestión de Usuarios**: Puede crear y administrar personal administrativo y obrero.
*   **Solicitudes**: Gestiona restablecimientos de contraseña.
*   **Configuración**: Acceso a paneles de control generales.
*   **Credenciales por defecto**: Si no existen usuarios, el sistema crea uno automáticamente:
    *   **Usuario**: `admin`
    *   **Contraseña**: `Admin`

### 2. Administrativo
*   Encargado de la gestión operativa.
*   **Inventario**: Puede registrar productos, entradas y salidas del almacén de comedor.
*   **Reportes**: Genera reportes de movimientos y existencias.
*   **Personal**: Puede visualizar listados de obreros.

### 3. Obrero / Guardia
*   Personal operativo de la institución.
*   **Asistencia**: Su asistencia es gestionada por el personal administrativo o mediante puntos de control.
*   **Guardias**: En caso de personal de seguridad, se gestionan sus turnos y guardias.

---

## Organización de Carpetas

La estructura del código sigue una arquitectura MVC limpia:

*   **/src**: Carpeta raíz del código fuente.
    *   **/config**: Archivos de configuración general (Base de datos).
    *   **/controladores**: Lógica de negocio para cada entidad (Auth, Inventario, Usuarios).
    *   **/middleware**: Funciones intermedias para validación de tokens y roles.
    *   **/modelos**: Definiciones de esquemas de Mongoose (Usuario, Producto, Asistencia).
    *   **/public**: Archivos estáticos del Frontend.
        *   **/css**: Hojas de estilo.
        *   **/img**: Recursos gráficos.
        *   **/js**: Scripts del lado del cliente (Lógica de vistas).
        *   **/vistas**: Archivos HTML organizados por módulos.
    *   **/rutas**: Definición de endpoints de la API.
*   **app.js**: Configuración principal de la aplicación Express.
*   **server.js**: Punto de entrada del servidor.
*   **.env**: Variables de entorno (no incluido en el repo).

---

# Desarrollo del Proyecto
**Institución**: Liceo "Juan Germán Roscio"
**Desarrollado por**: Jefferson Morgado
**Carrera**: Ing. en Informática
