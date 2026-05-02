# Balances - Personal Finance Tracker

![Balances Banner](https://img.shields.io/badge/Balances-Finance_Tracker-6366f1?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-1.9.1-blue?style=for-the-badge)


**Balances** es una plataforma profesional de gestión de finanzas personales diseñada con una estética moderna basada en *Glassmorphism*. Permite a los usuarios llevar un control exhaustivo de sus ingresos y gastos, visualizar estadísticas detalladas y personalizar su experiencia a través de múltiples idiomas y temas.

## ✨ Características Principales

- 📊 **Panel de Control Dinámico**: Visualización de balances netos e ingresos/gastos por categoría mediante gráficos interactivos con etiquetas y leyendas.
- 🌐 **Multilingüe (i18n)**: Soporte completo para **Español** e **Inglés**.
- 📝 **CRUD de Movimientos**: Sistema completo para crear, editar y eliminar transacciones con validación de montos.
- 🧠 **Categorías Inteligentes**: Listado dinámico según el tipo de movimiento y memoria de categorías personalizadas.
- 🔍 **Filtros Avanzados**: Búsqueda potente con capacidad de limpiar filtros y selección contextual.
- 📱 **Diseño 100% Responsivo**: Interfaz optimizada para móviles, tablets y escritorio.

## 🚀 Tecnologías Utilizadas

- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Estilos**: Vanilla CSS con variables dinámicas y efectos de desenfoque (*Glassmorphism*).
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/) para transiciones fluidas.
- **Iconografía**: [Lucide React](https://lucide.dev/).
- **Gráficos**: [Recharts](https://recharts.org/).
- **Persistencia**: `localStorage` nativo del navegador.

## 🛠️ Instalación y Uso

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/balances.git
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

4. **Construir para producción**:
   ```bash
   npm run build
   ```

## 📂 Estructura del Proyecto

- `src/components/`: Componentes reutilizables de UI (Navbar, Footer, Forms).
- `src/context/`: Gestión del estado global mediante `AppContext` (Sesión, Idioma, Tema, Movimientos).
- `src/pages/`: Vistas principales (Dashboard, Transactions, Auth).
- `src/constants/`: Diccionario de traducciones y configuraciones.
- `src/index.css`: Sistema de diseño global y variables de tema.

## 📜 Historial de Versiones

### v1.9.1 (02/05/2026)
- **Recuperación de Contraseña por Email**: Implementación completa de flujo de reset de contraseña mediante enlace enviado por correo (nodemailer + Firebase Admin). Incluye página de reset con validación de coincidencia de contraseñas y redirección automática al login.
- **Backend API**: Servidor Express con nodemailer para envío de emails, verificación de usuarios mediante Firebase Admin, y soporte para dominios de producción (Vercel) y desarrollo local.
- **Mensajes de Éxito Visuales**: Iconografía de CheckCircle en mensajes de confirmación (Auth y Reset) con estilo deGlassmorphism consistente.
- **Mejora de Seguridad**: Service Account de Firebase manejado como archivo local y variable de entorno, excluido del repositorio via `.gitignore`.
- **Actualización de Dependencias**: Agregadas `firebase-admin`, `nodemailer`, `express`, `cors`, `dotenv`.

### v1.9.0 (02/05/2026)
- **Solución CORS Histórico**: Implementación de proxy Vercel (`/api/exchange-rate`) para acceder a `exchangerate-api.com` sin restricciones CORS, permitiendo tasas de cambio históricas precisas.
- **Formato Numérico Argentino**: Los montos ahora se muestran con puntos como separador de miles (ej: `1.234,56`) en todas las vistas, mejorando la legibilidad local.
- **Filtro por Moneda**: Nuevo filtro en la lista de transacciones para filtrar por moneda específica (ARS, USD, EUR, etc.), con selector integrado junto a tipo y categoría.
- **Moneda Predeterminada ARS**: Peso argentino establecido como moneda por defecto en todos los selectores (formulario, dashboard y filtros donde corresponda).
- **Validación de Registro Mejorada**: Frontend valida formato de email (regex) y contraseña mínima (6 caracteres) antes de llamar a Firebase, mostrando errores específicos al usuario.
- **Dashboard Responsive Mejorado**: Grid de 4 balances principales ahora usa `repeat(auto-fit, minmax(320px, 1fr))` para adaptarse a 3 columnas en desktop, 2 en tablets, 1 en móvil.
- **Alineación de Niveles Históricos**: En el Resumen Histórico (tabla de períodos), moneda y número ahora se muestran siempre en una misma línea (`whiteSpace: nowrap`).
- **Intercambio de Controles**: El botón "Limpiar Filtros" se movió a la posición del selector de moneda, y el selector de moneda se ubicó en la posición del botón, mejorando el flujo de UX.
- **Corrección de Advertencias de Gráficos**: Solucionada advertencia de dimensiones -1 en Recharts agregando `minHeight` a los contenedores de gráficos.

### v1.8.1 (30/04/2026)
- **Motor de Conversión Mejorado**: Redondeo consistente a 2 decimales en todos los montos convertidos. Tasas de cambio redondeadas a 4 decimales para minimizar errores de punto flotante.
- **Cache Inteligente de Tasas**: Las tasas de cambio se cachean por día (no por transacción) y se guardan en `localStorage`. Solo 1 llamada API por moneda por día, no por transacción.
- **Eliminación de Llamadas Duplicadas**: Sistema de promesas pendientes (`pendingFetches`) evita múltiples requests simultáneos a la misma tasa.
- **Formato Argentino Consistente**: Todos los montos se muestran con coma decimal y sin separador de miles (ej: `525997,00`),eliminando ambigüedad.
- **Persistencia de Tasas**: Las tasas ARS se guardan en `localStorage` por día, permitiendo recargas sin llamar a la API y fallback a la última tasa conocida.

### v1.8.0 (30/04/2026)
- **UX Móvil Maestro-Detalle**: Rediseño de la página de Movimientos para dispositivos móviles. La tabla ahora es más limpia y permite desplegar detalles y acciones (editar/eliminar) al tocar cada fila, optimizando el espacio.
- **Header Responsivo Dinámico**: Ajuste del encabezado en móviles para priorizar el título y ubicar el botón de "Nuevo Movimiento" de forma clara y accesible.
- **Sincronización de UI Automática**: Implementación de detección de tamaño de pantalla en tiempo real para adaptar la lógica de interacción instantáneamente al redimensionar.
- **Refactorización de Estabilidad**: Solución de conflictos de nombres entre variables de transacciones y funciones de traducción, y corrección de advertencias de `framer-motion`.

### v1.7.0 (29/04/2026)
- **Motor de Divisas Universal**: Migración a **ExchangeRate-API**. Ahora el sistema soporta conversiones precisas para todas las monedas latinoamericanas (CLP, COP, UYU, MXN, etc.) eliminando el error de paridad 1:1.
- **Formateo Numérico Limpio**: Eliminación global de los separadores de miles (comas) en todos los montos para una lectura más clara y técnica.
- **Dashboard Visual Pro**: Implementación de desgloses detallados de porcentajes y montos convertidos debajo de los gráficos de torta.
- **Selector de Divisas Nativo**: Optimización del selector de moneda para garantizar la visibilidad de todas las opciones y compatibilidad total en dispositivos móviles.
- **Optimización de Conversión**: Refactorización de la lógica de "puente" de divisas para evitar bucles infinitos y mejorar la velocidad de carga del Panel de Control.

### v1.6.0 (29/04/2026)
- **Sincronización Cloud (Firebase)**: Migración completa de almacenamiento local a **Google Firebase (Firestore & Auth)**. Ahora los movimientos se sincronizan en tiempo real entre múltiples dispositivos (PC, móvil, tablet).
- **Seguridad y Variables de Entorno**: Implementación de archivos `.env` y configuración segura de credenciales para evitar exposiciones en repositorios públicos.
- **Optimización de UX**: Corrección de errores de renderizado en el Navbar y mejoras en la estabilidad de la sesión.

### v1.5.4 (29/04/2026)
- **Localización Integral**: Eliminación de todos los textos "hardcoded". Ahora, todos los nombres de divisas, etiquetas de "Opcional", y títulos dinámicos del Dashboard se traducen automáticamente al cambiar de idioma.
- **Refinamiento de UI**: Corrección de errores menores en los formularios y mejora en la coherencia de las etiquetas de categorías.

### v1.5.3 (29/04/2026)
- **Internacionalización de Errores**: Mensajes de "El usuario ya existe" y "Credenciales inválidas" ahora se muestran correctamente en el idioma seleccionado.
- **Limpieza de Base de Datos Local**: Optimización del motor de unificación para eliminar definitivamente cuentas duplicadas obsoletas y consolidar todos los movimientos en el perfil activo.
- **UX Adaptativa**: Mejoras en la retroalimentación visual durante el proceso de autenticación.

### v1.5.2 (29/04/2026)
- **Solución Error 404 (Vercel)**: Implementación de `vercel.json` con reglas de reescritura para permitir la navegación directa y recargas de página en rutas secundarias de la SPA.
- **Unificación de Cuentas Robusta**: El sistema ahora ignora mayúsculas y espacios en los correos electrónicos, garantizando que `User@mail.com` y `user@mail.com` se unifiquen correctamente sin pérdida de datos.
- **Sincronización de Sesión Crítica**: Corrección de lógica que permite actualizar la sesión activa inmediatamente después de una fusión de cuentas en segundo plano.

### v1.5.1 (29/04/2026)
- **Corrección Crítica de Fusión**: Optimización del motor de unificación para garantizar la sincronización instantánea de movimientos entre cuentas duplicadas.
- **Robustez Multi-pestaña**: Mejora en los listeners de `Storage` para evitar inconsistencias en el estado global.

### v1.5.0 (29/04/2026)
- **Sincronización en Tiempo Real**: Implementación de `Storage Events` para sincronizar movimientos, tema e idioma instantáneamente entre múltiples pestañas.
- **Fusión Inteligente de Cuentas**: Algoritmo de migración que detecta y unifica cuentas con el mismo correo electrónico, combinando sus historiales de transacciones de forma segura.
- **Estabilidad de Sesión**: Mejora en la consistencia de la sesión de usuario en entornos multi-pestaña.

### v1.4.0 (29/04/2026)
- **Navegación Móvil (Hamburger Menu)**: Implementación de un menú lateral animado con `framer-motion` para una experiencia fluida en smartphones.
- **Optimización de Auth**: Soporte completo para el autocompletado del navegador mediante atributos `name` y `autoComplete`, facilitando la persistencia de credenciales entre dispositivos.
- **Seguridad en Registro**: Bloqueo de registros duplicados con el mismo correo electrónico mediante validación en tiempo real.
- **Refinamiento UI/UX**: Reubicación de los selectores de idioma y tema para mejorar la jerarquía visual y accesibilidad.
- **Correcciones de Sintaxis**: Limpieza de propiedades CSS inválidas y optimización de transiciones.

### v1.3.0 (29/04/2026)
- **Categorías Inteligentes**: Las categorías ahora se filtran automáticamente según si el movimiento es un ingreso o un gasto.
- **Memoria de Categorías**: El sistema ahora recuerda y ofrece categorías personalizadas creadas previamente a través de la opción "Otros".
- **Dashboard Mejorado**: Se añadió un gráfico de "Ingresos por Categoría" y se incluyeron etiquetas y leyendas en todos los gráficos.
- **UX en Filtros**: Se implementó el botón "Limpiar Filtros" y la carga dinámica de opciones en los desplegables.
- **Correcciones de UI**: Optimización de modales para evitar solapamientos con el Navbar y mejora de la responsividad en tablas.

### v1.2.0 (28/04/2026)
- Implementación de la edición de movimientos existentes.
- Validación de montos positivos y mejora de inputs numéricos.
- Primera fase de diseño responsivo y corrección de errores de compatibilidad CSS.

### v1.1.0 (27/04/2026)
- Sistema básico de Internacionalización (i18n) en español e inglés.
- Integración de Recharts para visualización de gastos.

---

Desarrollado por **Miguel Rodríguez** - © 2026
