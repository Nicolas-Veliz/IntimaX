# 🏨 IntimaX - Sistema de Gestión para Albergues Transitorios

IntimaX es un sistema web desarrollado para la gestión operativa de albergues transitorios. Permite administrar habitaciones, turnos, usuarios, pagos, métricas y reportes desde una interfaz centralizada.

## ✨ Características principales

- 🔐 Login para empleados con diferentes roles.
- 🏠 Gestión y control de habitaciones.
- ⏱️ Administración de turnos.
- 💰 Registro y control de operaciones.
- 🧹 Gestión del estado de las habitaciones.
- 📊 Métricas en tiempo real.
- 🔔 Comunicación mediante Socket.IO.
- 📈 Generación de reportes.
- 👥 Administración de usuarios.

## 🛠️ Tecnologías utilizadas

### Frontend

- React
- Vite
- React Router
- Axios
- Bootstrap
- Socket.IO Client

### Backend

- Node.js
- Express
- MySQL
- JWT
- bcryptjs
- Socket.IO

### Testing

- Cypress
- Pruebas End-to-End (E2E)

---

# 🚀 Instalación del proyecto

## 1. Clonar el repositorio

bash
git clone https://github.com/Nicolas-Veliz/IntimaX.git


Ingresar al proyecto:

bash
cd IntimaX


## 2. Instalar dependencias del backend

bash
cd backend
npm install


## 3. Instalar dependencias del frontend

Desde la carpeta raíz del proyecto:

bash
cd frontend
npm install


## 4. Instalar las dependencias de testing

Desde la carpeta raíz del proyecto:

bash
npm install


Cypress se encuentra incluido como dependencia de desarrollo del proyecto.

---

# ▶️ Ejecución del sistema

Para utilizar IntimaX, ejecuta el backend y el frontend en terminales separadas.

## Desarrollo local

En PowerShell, inicia el backend desde `backend`. El bypass es opcional y solo desactiva los límites de intentos de inicio de sesión para pruebas locales; no omite la validación de credenciales.

```powershell
$env:NODE_ENV = "development"
$env:DISABLE_LOGIN_RATE_LIMIT = "true"
cd backend
npm run dev
```

En otra terminal, inicia el frontend:

```powershell
cd frontend
npm run dev
```

El frontend de desarrollo estará disponible en `http://localhost:5173`.

## Producción

En PowerShell, inicia el backend en modo producción desde `backend`. En este modo el bypass queda desactivado y se conservan los límites de intentos.

```powershell
$env:NODE_ENV = "production"
$env:DISABLE_LOGIN_RATE_LIMIT = "false"
cd backend
npm start
```

En otra terminal, genera y sirve la compilación de producción del frontend:

```powershell
cd frontend
npm run build
npm run preview
```

La vista previa de Vite estará disponible normalmente en `http://localhost:4173`. Si el backend rechaza las solicitudes por CORS, agrega ese origen a `ALLOWED_ORIGINS` en la configuración del backend. `vite preview` sirve la compilación para verificación local; para desplegar en producción, publica los archivos generados en `frontend/dist` en el servidor web elegido.

---

# 🧪 Pruebas automatizadas con Cypress

El proyecto utiliza Cypress para realizar pruebas automatizadas End-to-End.

El primer artefacto funcional desarrollado se encuentra en:

text
cypress/e2e/primer-test.cy.js


Este archivo contiene pruebas sobre el proceso de autenticación de IntimaX.

## Configuración de credenciales de prueba

Para ejecutar el test de inicio de sesión es necesario disponer de credenciales válidas.

Crear en la raíz del proyecto un archivo:

text
cypress.env.json


con la siguiente estructura:

json
{
  "username": "USUARIO_DE_PRUEBA",
  "password": "CONTRASEÑA_DE_PRUEBA"
}


Por razones de seguridad, cypress.env.json se encuentra incluido en .gitignore y no debe ser incorporado al repositorio.

## Ejecutar Cypress

Desde la raíz del proyecto:

bash
npx cypress open


Seleccionar:

1. *E2E Testing*
2. *Google Chrome*
3. El archivo primer-test.cy.js

El test verifica:

- La visualización del formulario de inicio de sesión.
- La presencia del campo de usuario.
- La presencia del campo de contraseña.
- La presencia del botón de ingreso.
- El inicio de sesión utilizando credenciales válidas.
- La redirección al Dashboard de IntimaX.

Una ejecución correcta debe finalizar con los dos casos de prueba aprobados.

---

# 📁 Estructura relacionada con Cypress

text
IntimaX/
├── cypress/
│   ├── e2e/
│   │   └── primer-test.cy.js
│   ├── fixtures/
│   │   └── example.json
│   └── support/
│       ├── commands.js
│       └── e2e.js
├── cypress.config.js
├── cypress.env.json     # Archivo local, no se sube a Git (está incluido en .gitignore)
├── package.json
└── .gitignore


---

# 🔐 Seguridad

Las credenciales utilizadas para las pruebas automatizadas no se almacenan directamente en el código fuente.

El archivo cypress.env.json utilizado localmente para las pruebas se encuentra excluido del control de versiones mediante .gitignore.

---

# 🌿 Control de versiones

El proyecto utiliza Git para el control de versiones y GitHub como repositorio remoto.

El desarrollo y la incorporación inicial de Cypress se realizaron sobre la rama:

text
develop


---

## Proyecto IntimaX

Proyecto desarrollado con fines académicos y de gestión de albergues transitorios.