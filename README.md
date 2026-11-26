# TalentBridge — Frontend (Web & Mobile)

Aplicación cliente multiplataforma (**Web SPA** y **App Móvil Nativa Android/iOS**) de **TalentBridge**, plataforma universitaria de vinculación freelance que conecta a **Estudiantes** con **Clientes / Organizaciones**, respaldada por un módulo de **Administración y Gobernanza**.

Desarrollada por el equipo **CodeBridge** con **Angular**, **Ionic Framework**, **Capacitor** y **SignalR**.

---

## Tabla de Contenidos

1. [Resumen del Proyecto](#-resumen-del-proyecto)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Arquitectura del Frontend](#-arquitectura-del-frontend)
4. [Módulos Funcionales por Rol](#-módulos-funcionales-por-rol)
5. [Experiencia Mobile Nativa (Capacitor)](#-experiencia-mobile-nativa-capacitor)
6. [Estructura del Repositorio](#-estructura-del-repositorio)
7. [Requisitos Previos e Instalación](#-requisitos-previos-e-instalación)
8. [Scripts de Desarrollo, Pruebas y Build](#-scripts-de-desarrollo-pruebas-y-build)
9. [Compilación Móvil con Capacitor](#-compilación-móvil-con-capacitor)
10. [CI/CD — Publicación Automática de APK](#-cicd--publicación-automática-de-apk)
11. [Seguridad en el Cliente](#-seguridad-en-el-cliente)

---

## 🎯 Resumen del Proyecto

El frontend de **TalentBridge** provee una interfaz unificada, reactiva y adaptable para los tres actores principales del ecosistema:

- **Estudiantes:** exploración de oportunidades con cálculo de coincidencias de habilidades (*skill matching*) y desglose de pago neto estimado, postulación a proyectos, administración de portafolio profesional, gestión de contratos, chat en tiempo real con el cliente y sistema de reputación bidireccional.
- **Clientes:** publicación y administración de ofertas de proyectos con catálogo de habilidades, revisión de postulaciones y reputación de candidatos, formalización y cierre de contratos, chat en tiempo real con estudiantes y calificación del desempeño.
- **Administradores:** panel ejecutivo de métricas con visualización gráfica, gestión y suspensión de cuentas con motivo auditable, moderación de contenido y consulta de bitácora de auditoría.

---

## 🛠 Stack Tecnológico

| Categoría | Tecnología | Uso en el proyecto |
|---|---|---|
| **Framework UI & SPA** | Angular 22 (Standalone Components + Signals) | Componentes autónomos, control de flujo `@if` / `@for` y estado reactivo con Signals |
| **Componentes Híbridos** | Ionic Framework 9 + Ionicons 8 | Contenedores de navegación, modales, spinners y adaptación multiplataforma |
| **Runtime Móvil Nativo** | Capacitor 8 (`@capacitor/core`, `android`, `haptics`, `status-bar`, `keyboard`) | Empaquetado nativo Android/iOS, barra de estado nativa y respuesta háptica |
| **Tiempo Real** | `@microsoft/signalr` + RxJS 7.8 | Mensajería instantánea y presencia en vivo por sala de conversación |
| **Visualización de Datos** | Chart.js 4 | Gráficas de métricas y distribución de calificaciones en el panel administrativo |
| **Testing & Calidad** | Vitest 4 + Angular TestBed + ESLint 10 | Pruebas unitarias de ViewModels, Handlers, Servicios, Guards y Componentes |

---

## 🏗 Arquitectura del Frontend

El cliente implementa una arquitectura limpia orientada a *features*, combinando **MVVM (Model-View-ViewModel)** con **CQRS ligero** e **Inversión de Dependencias (DIP)**:

```text
Vista (Standalone Page / Component)
   │  Enlace reactivo vía Angular Signals
   ▼
ViewModel (*.view-model.ts)
   │  Despacha Commands (escritura) y Queries (lectura)
   ▼
Handlers CQRS (ICommandHandler / IQueryHandler)
   │  Dependen de puertos abstractos (InjectionToken)
   ▼
Adaptadores de Infraestructura (*-http.repository.ts / ChatSignalRAdapter)
```

### Principios aplicados
- **Estado reactivo con Angular Signals:** las vistas consumen `signal()` y `computed()` expuestos por su `ViewModel`, evitando suscripciones manuales en las plantillas.
- **Puertos y Adaptadores (DIP):** el acceso a datos y al canal de tiempo real se abstrae mediante contratos (`IChatRepository`, `IChatRealtimePort`, `IContratoRepository`, `IResenaRepository`, `IOportunidadProyectoRepository`), facilitando pruebas unitarias aisladas e intercambio de adaptadores (p. ej. `ChatSignalRAdapter` con degradación automática a HTTP REST si el Hub no está accesible).
- **Rutas con *Lazy Loading* y *Functional Guards*:** cada dominio se carga bajo demanda y está protegido por guardias funcionales (`authGuard`, `estudianteGuard`, `clienteGuard`, `adminGuard`, `marketplaceGuard`, `portafolioGuard`) que validan la vigencia y el rol del JWT.

---

## 🧩 Módulos Funcionales por Rol

### 1. Autenticación y Cuenta (`/auth/*`)
- **Splash interactivo (`/`)** con redirección automática según la sesión activa.
- **Inicio de sesión (`/auth/login`)** con validación reactiva y visualización del motivo de suspensión cuando una cuenta ha sido restringida por administración.
- **Registro (`/auth/registro`)** con selector de rol (`Estudiante` / `Cliente`) e indicador de fortaleza de contraseña.
- **Recuperación y restablecimiento de contraseña (`/auth/recuperar-password`, `/auth/restablecer-password`)**.

### 2. Espacio Estudiante (`/marketplace/*`, `/estudiante/*`, `/portafolio/*`, `/perfil`)
- **Marketplace de Oportunidades (`/marketplace`):** búsqueda y filtrado por disciplina, modalidad, rango de presupuesto, urgencia y habilidades; cálculo automático de compatibilidad (*match* de skills) y estimación de pago neto.
- **Detalle de Oportunidad (`/marketplace/:id`):** desglose financiero, condiciones del proyecto y envío de postulación.
- **Mis Postulaciones (`/estudiante/postulaciones`):** seguimiento por estado (`Pendiente`, `Aceptada`, `Rechazada`, `Retirada`), retiro de propuestas pendientes y acceso directo al chat.
- **Mis Contratos (`/estudiante/contratos`):** control de contratos activos/finalizados/cancelados, finalización o cancelación con confirmación, calificación al cliente (1 a 5 estrellas + comentario) y consulta de reputación del cliente.
- **Chat en Tiempo Real (`/estudiante/chat`):** conexión a SignalR (`Conectado`, `ParticipanteConectado`, `MensajeRecibido`), indicador de presencia `"● En línea"`, deduplicación de mensajes por ID y reconexión automática a la sala activa.
- **Perfil y Portafolio (`/perfil`, `/portafolio`):** edición de perfil académico, selección de habilidades desde catálogo oficial con nivel de dominio, administración de proyectos de portafolio y visualización de reputación recibida.

### 3. Espacio Cliente (`/cliente/*`)
- **Panel de Actividad (`/cliente`):** resumen de ofertas abiertas, contratos activos y accesos rápidos.
- **Publicar y Administrar Ofertas (`/cliente/publicar-oferta`, `/cliente/ofertas`):** creación, edición, publicación de borradores, cierre y eliminación de ofertas con selección de habilidades del catálogo.
- **Gestión de Postulaciones (`/cliente/ofertas/:id/postulaciones`):** revisión de candidatos, consulta de reputación del estudiante, apertura de chat directo, aceptación/rechazo de postulaciones y formalización de contrato con importe acordado y fechas de inicio/compromiso.
- **Contratos del Cliente (`/cliente/contratos`):** seguimiento de contratos, finalización/cancelación y calificación del estudiante en contratos finalizados (con verificación de reseñas emitidas para evitar duplicados).
- **Chat del Cliente (`/cliente/chat`):** mensajería en tiempo real con estudiantes postulados o contratados.
- **Perfil de Empresa (`/cliente/perfil`):** datos de la organización, medios de contacto y consulta de la reputación recibida como cliente.

### 4. Espacio Administrador (`/admin/*`)
- **Panel de Métricas (`/admin/panel`):** indicadores globales del ecosistema y gráficas de distribución de reseñas.
- **Gestión de Usuarios (`/admin/usuarios`):** listado, filtrado y suspensión/reactivación de cuentas con captura de motivo obligatorio.
- **Moderación (`/admin/moderacion`)** y **Bitácora de Auditoría (`/admin/bitacora`)**.

---

## 📱 Experiencia Mobile Nativa (Capacitor)

El proyecto incluye una capa visual y de interacción **exclusiva para compilaciones nativas en Capacitor** (`src/theme/_capacitor-mobile.scss` + detección `Capacitor.isNativePlatform()` en `AppComponent`), manteniendo intacto el diseño de escritorio cuando se ejecuta en un navegador web:

- **Activación condicional:** solo cuando `Capacitor.isNativePlatform() === true` se inyecta la clase raíz `html.tb-capacitor`.
- **Dock inferior flotante con Glassmorphism:** barra de navegación inferior siempre fija en pantalla (fuera del contenedor de scroll de `ion-content`) con desenfoque translúcido, indicador luminoso y animación elástica al cambiar de sección.
- **Paleta oscura + naranja unificada:** cohesión visual completa (`#090909` fondo base con halo cálido, `#141414` tarjetas, `#0e0e0e` campos de entrada y acentos `#fb7f1b` / `#f9943b`) en todas las vistas.
- **Animaciones fluidas y respuesta háptica:** entrada escalonada de tarjetas (*stagger*), apertura de paneles tipo *bottom sheet*, animación de burbujas de chat y vibración táctil ligera (`Haptics.impact`) en controles interactivos.

---

## 📂 Estructura del Repositorio

```text
freelancer-app-frontend/
├── .github/workflows/
│   └── release-apk.yml          # Pipeline CI/CD: compila Angular + Capacitor y publica APK en GitHub Releases
├── src/
│   ├── app/
│   │   ├── core/                # Configuración, contratos CQRS, Guards funcionales, Interceptor JWT y utilidades
│   │   ├── features/
│   │   │   ├── admin/           # Módulo de Administración (panel, usuarios, moderación, bitácora)
│   │   │   ├── clientes/        # Módulo de Cliente (dashboard, ofertas, postulaciones, contratos, chat, perfil)
│   │   │   ├── estudiante/      # Módulo de Estudiante (postulaciones, contratos, chat SignalR, reseñas)
│   │   │   ├── marketplace/     # Exploración y detalle de oportunidades públicas/autenticadas
│   │   │   └── usuarios/        # Auth (splash, login, registro, recuperación), perfil y portafolio
│   │   └── shared/              # Componentes reutilizables (navegación estudiante, reputación, gráficas, spinner)
│   ├── environments/            # Configuraciones de entorno (producción, desarrollo y pruebas locales CI)
│   ├── theme/                   # Variables de diseño, estilos por dominio y tema mobile exclusivo de Capacitor
│   ├── global.scss              # Punto de entrada de estilos globales e integración con Ionic
│   └── main.ts                  # Bootstrap de la aplicación Angular + proveedores globales
├── angular.json                 # Configuración de compilación de Angular CLI
├── capacitor.config.ts          # Configuración de identidad y directorio web (`www`) para Capacitor
└── package.json                 # Dependencias y scripts del proyecto
```

---

## ⚙️ Requisitos Previos e Instalación

- **Node.js:** v22.x LTS (recomendado para Angular 22)
- **npm:** v10+ o v11+
- *(Opcional para compilación móvil local)* **Java JDK 21** y **Android SDK / Android Studio**

```bash
# 1. Clonar el repositorio
git clone https://github.com/Luis-dsc33/freelancer-app-frontend.git
cd freelancer-app-frontend

# 2. Instalar dependencias
npm install
```

---

## 🚀 Scripts de Desarrollo, Pruebas y Build

| Comando | Descripción |
|---|---|
| `npm start` | Levanta el servidor de desarrollo en `http://localhost:4200` |
| `npx ng serve --build-target app:build:ci` | Levanta el frontend apuntando al gateway local (`http://localhost:8080`) |
| `npm run build` | Compila el bundle optimizado de producción en el directorio `www/` |
| `npm test -- --watch=false` | Ejecuta la suite completa de pruebas unitarias con Vitest |
| `npm run lint` | Ejecuta el análisis estático con Angular ESLint / TypeScript ESLint |

---

## 📲 Compilación Móvil con Capacitor

```bash
# 1. Compilar el bundle web en www/
npm run build

# 2. (Primera vez) Generar la plataforma Android si no existe localmente
npx cap add android

# 3. Sincronizar assets web y plugins nativos
npx cap sync android

# 4. Compilar y desplegar directamente en un dispositivo conectado por ADB
npx cap run android --target <DEVICE_ID>
```

---

## 🤖 CI/CD — Publicación Automática de APK

El repositorio cuenta con el flujo de trabajo [`.github/workflows/release-apk.yml`](.github/workflows/release-apk.yml):

1. **Activación:** se dispara automáticamente al integrar cambios de código en la rama `main` (o manualmente vía `workflow_dispatch`), ignorando cambios exclusivos en archivos de documentación (`*.md`).
2. **Construcción:** instala Node.js 22 y Temurin JDK 21, compila el frontend (`npm run build`), genera/sincroniza el proyecto Android con Capacitor y ejecuta `./gradlew assembleRelease assembleDebug`.
3. **Entrega en GitHub Releases:** publica automáticamente una nueva versión `v1.0.<run_number>` en la sección **Releases** del repositorio adjuntando los archivos `.apk` firmados y listos para instalar en Android.

---

## 🔒 Seguridad en el Cliente

- **Interceptor JWT centralizado (`authInterceptor`):** adjunta automáticamente `Authorization: Bearer <token>` en las peticiones hacia el API Gateway y pasa el token mediante `accessTokenFactory` en conexiones WebSocket/SignalR.
- **Validación de sesión y roles en cliente:** decodificación segura de *claims* (`role`, `sub`, `exp`) para proteger rutas con guardias funcionales y expirar sesiones vencidas de forma controlada.
- **Sin secretos en el código fuente:** el repositorio frontend contiene únicamente configuraciones públicas de enrutamiento hacia el API Gateway; ninguna credencial ni llave privada se almacena en el cliente.
