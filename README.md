# 🏨 IntimaX - Sistema de Gestión para Albergues Transitorios

IntimaX es un sistema web desarrollado para la gestión operativa de albergues transitorios. Permite administrar habitaciones, turnos, usuarios, pagos, métricas y reportes desde una interfaz centralizada.

## ✨ Características principales

- 🔐 Inicio de sesión para empleados con diferentes roles.
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

### Testing e integración continua
- Cypress
- Pruebas End-to-End (E2E)
- Mochawesome
- GitHub Actions

---

# 🚀 Instalación del proyecto

## 1. Clonar el repositorio

```bash
git clone https://github.com/Nicolas-Veliz/IntimaX.git
```

Ingresar a la carpeta del proyecto:

```bash
cd IntimaX
```

## 2. Instalar dependencias generales y de testing

Desde la carpeta raíz:

```bash
npm install
```

Este comando instala las dependencias generales del proyecto y las herramientas de testing, incluyendo Cypress y Mochawesome.

## 3. Instalar dependencias del backend

Desde la carpeta raíz:

```bash
cd backend
npm install
```

## 4. Instalar dependencias del frontend

Volver a la carpeta raíz y luego ingresar a frontend:

```bash
cd ..
cd frontend
npm install
```

Al finalizar, el proyecto contará con las dependencias necesarias para ejecutar el frontend, el backend y las pruebas automatizadas.

---

# ▶️ Ejecución del sistema

Para utilizar IntimaX durante el desarrollo local, es necesario iniciar el backend y el frontend en terminales separadas.

Antes de iniciar el sistema, se debe contar con MySQL configurado y con la base de datos correspondiente. También deben estar disponibles las variables de entorno requeridas por el backend.

## Desarrollo local

### Iniciar el backend

En PowerShell, desde la carpeta raíz:

```powershell
cd backend
$env:NODE_ENV = "development"
$env:DISABLE_LOGIN_RATE_LIMIT = "true"
npm run dev
```

La variable `DISABLE_LOGIN_RATE_LIMIT` permite desactivar el límite de intentos de inicio de sesión durante las pruebas locales. Es una opción de desarrollo y no omite la validación de credenciales.

### Iniciar el frontend

En otra terminal, desde la carpeta raíz:

```powershell
cd frontend
npm run dev
```

El frontend estará disponible normalmente en:

```text
http://localhost:5173
```

## Producción

Para iniciar el backend en modo producción, desde la carpeta `backend`:

```powershell
$env:NODE_ENV = "production"
$env:DISABLE_LOGIN_RATE_LIMIT = "false"
npm start
```

En otra terminal, desde la carpeta `frontend`, generar y servir la compilación:

```powershell
npm run build
npm run preview
```

La vista previa de Vite estará disponible normalmente en:

```text
http://localhost:4173
```

`vite preview` permite verificar localmente la compilación generada. Para un despliegue real, los archivos de `frontend/dist` deben publicarse en el servidor web correspondiente. Si el backend rechaza las solicitudes por CORS, debe configurarse el origen de la aplicación en `ALLOWED_ORIGINS`.

---

# 🧪 Pruebas automatizadas con Cypress

IntimaX utiliza Cypress para realizar pruebas automatizadas End-to-End (E2E). Estas pruebas permiten simular acciones de los usuarios desde el navegador y verificar las respuestas de la aplicación.

La configuración de Cypress se encuentra en:

```text
cypress.config.js
```

Se utiliza `cypress-mochawesome-reporter` para generar reportes HTML de las ejecuciones.

La dirección base configurada para las pruebas es:

```text
http://localhost:5173
```

## 1. Configuración de credenciales para pruebas locales

Para ejecutar los casos que requieren autenticación, se deben proporcionar credenciales válidas.

Desde la carpeta raíz, crear un archivo llamado:

```text
cypress.env.json
```

Utilizar la siguiente estructura como ejemplo:

```json
{
  "username": "USUARIO_DE_PRUEBA",
  "password": "CONTRASEÑA_DE_PRUEBA",
  "testUserPassword": "Password123!",
  "testUserNewPassword": "Password456!"
}
```

Los valores deben reemplazarse por los datos correspondientes al entorno de pruebas.

El archivo `cypress.env.json` está incluido en `.gitignore`, por lo que no debe incorporarse al repositorio ni compartirse con credenciales reales.

## 2. Ejecutar Cypress en modo interactivo

Desde la carpeta raíz:

```bash
npx cypress open
```

También puede utilizarse el script configurado en el `package.json`:

```bash
npm run cypress:open
```

Una vez abierta la aplicación de Cypress:

1. Seleccionar E2E Testing.
2. Elegir el navegador disponible.
3. Seleccionar el archivo de prueba que se desea ejecutar.

## 3. Ejecutar las pruebas desde la terminal

Para ejecutar la suite completa en modo automático:

```bash
npx cypress run
```

Este comando permite ejecutar los casos sin abrir la interfaz gráfica de Cypress.

## 4. Casos de prueba implementados

Actualmente, el proyecto cuenta con ocho archivos de especificación que contienen nueve casos de prueba.

| Código | Caso de prueba |
|---|---|
| CP01 | Inicio de sesión válido y visualización del formulario |
| CP02 | Inicio de sesión con credenciales incorrectas |
| CP03 | Creación de usuario |
| CP04 | Modificación de usuario |
| CP05 | Inicio de sesión con campos vacíos |
| CP06 | Acceso a usuarios sin autenticación |
| CP07 | Creación de usuario con campos vacíos |
| CP08 | Eliminación de un usuario existente |

Los casos permiten verificar distintos comportamientos de autenticación, validación de formularios y administración de usuarios.

## 5. Selectores y configuración de las pruebas

Los casos utilizan atributos específicos `data-cy` para identificar elementos de la interfaz.

Por ejemplo:

```javascript
cy.get('[data-cy="login-button"]').click()
```

También se utilizan mecanismos de Cypress como `cy.env()`, `cy.session()`, `cy.intercept()` y `cy.wait()` para gestionar credenciales, reutilizar sesiones y sincronizar las pruebas con las solicitudes HTTP.

---

# 📊 Generación y consulta de reportes

El proyecto utiliza Mochawesome para generar informes HTML de las ejecuciones de Cypress.

La configuración del reporter se encuentra en `cypress.config.js`.

Después de ejecutar las pruebas, los informes se generan en:

```text
cypress/reports/html/
```

El archivo principal del reporte es:

```text
cypress/reports/html/index.html
```

Para consultar los resultados localmente, se puede abrir `index.html` con un navegador.

Los reportes generados se encuentran excluidos del control de versiones mediante `.gitignore`, evitando incorporar archivos temporales al repositorio.

---

# ⚙️ Integración continua con GitHub Actions

Se configuró un workflow de integración continua ubicado en:

```text
.github/workflows/cypress-ci.yml
```

Este workflow permite ejecutar automáticamente las pruebas de Cypress ante los eventos `push` y `pull_request` dirigidos a las ramas `main`, `master` y `develop`.

## Funcionamiento del workflow

Durante su ejecución, GitHub Actions realiza las siguientes tareas:

1. Descarga el código del repositorio.
2. Configura Node.js 22.
3. Instala las dependencias generales, del backend y del frontend.
4. Inicia un servicio MySQL 8 para el entorno de pruebas.
5. Importa la estructura de la base de datos de CI.
6. Crea un usuario administrador para las pruebas automatizadas.
7. Configura las credenciales necesarias.
8. Inicia el backend y verifica su disponibilidad.
9. Inicia el frontend y verifica su disponibilidad.
10. Ejecuta la suite de pruebas E2E con Cypress.
11. Guarda el reporte HTML como artefacto descargable.

## Configuración de secretos en GitHub

Para que el workflow pueda utilizar las credenciales de autenticación, se deben configurar los siguientes secretos en el repositorio:

| Nombre del secreto | Descripción |
|---|---|
| `CYPRESS_USERNAME` | Usuario administrador de pruebas |
| `CYPRESS_PASSWORD` | Contraseña del usuario administrador |

Estos valores se configuran desde:

**GitHub → Settings → Secrets and variables → Actions.**

Los secretos permiten utilizar credenciales sin escribirlas directamente en los archivos de prueba o en el workflow.

## Descarga de reportes desde GitHub Actions

Al finalizar una ejecución, el workflow intenta publicar el reporte HTML como un artefacto denominado:

```text
reporte-cypress-intimax
```

Para descargarlo:

1. Ingresar al repositorio de IntimaX en GitHub.
2. Abrir la sección Actions.
3. Seleccionar la ejecución del workflow.
4. Buscar la sección Artifacts.
5. Descargar `reporte-cypress-intimax`.
6. Extraer el archivo y abrir `index.html` con un navegador.

Los artefactos configurados en el workflow se conservan durante 14 días.

---

# 📁 Estructura relacionada con testing

La organización de los archivos principales de Cypress es la siguiente:

```text
IntimaX/
│
├── .github/
│   └── workflows/
│       └── cypress-ci.yml
│
├── cypress/
│   ├── e2e/
│   │   ├── test_CP01_login-valido.cy.js
│   │   ├── test_CP02_login-invalido.cy.js
│   │   ├── test_CP03_crear-usuario.cy.js
│   │   ├── test_CP04_modificar-usuario.cy.js
│   │   ├── test_CP05_login-campos-vacios.cy.js
│   │   ├── test_CP06_acceso-sin-autenticacion.cy.js
│   │   ├── test_CP07_creacion-campos-vacios.cy.js
│   │   └── test_CP08 _Eliminacion-de-un-usuario-existente.cy.js
│   │
│   ├── fixtures/
│   │   └── example.json
│   │
│   ├── support/
│   │   ├── commands.js
│   │   └── e2e.js
│   │
│   └── reports/
│       └── html/
│           └── index.html
│
├── backend/
│   ├── database/
│   │   └── hotel_management_ci.sql
│   └── package.json
│
├── frontend/
│   └── package.json
│
├── cypress.config.js
├── cypress.env.json
├── package.json
└── .gitignore
```

**Nota:** `cypress.env.json` y los reportes son archivos locales o generados durante las ejecuciones; no se incorporan al repositorio.

---

# 🔐 Seguridad

Las credenciales utilizadas para las pruebas automatizadas no deben almacenarse directamente en el código fuente.

Para mantener una configuración más segura:

- Se utiliza `cypress.env.json` para las pruebas locales.
- Se emplean secretos de GitHub Actions para las ejecuciones en CI.
- El archivo de credenciales locales está excluido mediante `.gitignore`.
- Los reportes, capturas y videos generados durante las pruebas también están excluidos del control de versiones.

---

# 🌿 Control de versiones

El proyecto utiliza Git para el control de versiones y GitHub como repositorio remoto.

La rama utilizada para el desarrollo y la integración de los cambios es:

```text
develop
```

El workflow de GitHub Actions permite ejecutar las pruebas automáticamente cuando se incorporan cambios mediante los eventos configurados.

---

# 📋 Resultados de las pruebas automatizadas

Durante una ejecución verificada en el Sprint 3 se obtuvieron los siguientes resultados:

- **8** archivos de especificación.
- **9** casos de prueba ejecutados.
- **9** pruebas aprobadas.
- **0** pruebas fallidas.
- **100 %** de aprobación en esa ejecución.

Estos resultados corresponden a la ejecución verificada y no representan una garantía de ausencia de errores en todas las funcionalidades del sistema.

---

## Proyecto IntimaX

Proyecto desarrollado con fines académicos y de gestión de albergues transitorios.