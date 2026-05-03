# Balances - Personal Finance Tracker

![Balances Banner](https://img.shields.io/badge/Balances-Finance_Tracker-6366f1?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-1.9.2-blue?style=for-the-badge)


**Balances** es una plataforma profesional de gestión de finanzas personales diseñada con una estética moderna basada en *Glassmorphism*. Permite a los usuarios llevar un control exhaustivo de sus ingresos y gastos, visualizar estadísticas detalladas y personalizar su experiencia a través de múltiples idiomas y temas.

## ✨ Características Principales

- 📊 **Panel de Control Dinámico**: Visualización de balances netos e ingresos/gastos por categoría mediante gráficos interactivos con etiquetas y leyendas.
- 📈 **Análisis de Composición**: Detalle de porcentajes por categoría dentro de cada grupo (ingresos fijos/variables, gastos fijos/variables) mostrando la contribución relativa de cada categoría.
- 🌐 **Multilingüe (i18n)**: Soporte completo para **Español** e **Inglés**.
- 📝 **CRUD de Movimientos**: Sistema completo para crear, editar y eliminar transacciones con validación de montos.
- 🧠 **Categorías Inteligentes**: Listado dinámico según el tipo de movimiento y memoria de categorías personalizadas. "Otros" es una categoría única compartida entre ingresos y gastos.
- 🔍 **Filtros Avanzados**: Búsqueda potente con capacidad de limpiar filtros y selección contextual. Los filtros se aplican al período, moneda, tipo y categoría.
- 💱 **Conversión de Monedas en Tiempo Real**: Tasas de cambio actualizadas vía API externa con fallback a rates predefinidos. Las conversiones se cachean por día para optimizar rendimiento.
- 📱 **Diseño 100% Responsivo**: Interfaz optimizada para móviles, tablets y escritorio.

## 🚀 Tecnologías Utilizadas

- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Estilos**: Vanilla CSS con variables dinámicas y efectos de desenfoque (*Glassmorphism*).
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/) para transiciones fluidas.
- **Iconografía**: [Lucide React](https://lucide.dev/).
- **Gráficos**: [Recharts](https://recharts.org/).
- **Persistencia**: `localStorage` nativo del navegador.
- **Backend/Auth**: [Firebase](https://firebase.google.com/) (Auth + Firestore).

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
- `src/context/`: Gestión del estado global mediante `AppContext` (Sesión, Idioma, Tema, Movimientos, Tasas de cambio).
- `src/pages/`: Vistas principales (Dashboard, Transactions, Auth).
- `src/constants/`: Diccionario de traducciones y configuraciones de monedas.
- `src/index.css`: Sistema de diseño global y variables de tema.

## 📜 Historial de Versiones

### v2.0.0 (03/05/2026)
- **Análisis de Composición de Gastos/Ingresos**: Nuevas cards que muestran el porcentaje de ingresos fijos, ingresos variables, gastos fijos y gastos variables respecto al total, con desglose detallado de cada categoría y su aporte porcentual dentro de cada subtipo.
- **Clasificación Automática de Categorías**: Las categorías se clasifican automáticamente como fijas (Housing, Services, Salary) o variables (resto, incluyendo "Otros"). La clasificación es completamente dinámica y se recalcula con los filtros.
- **Flujo Completo de Recuperación de Contraseña**: Implementación de página personalizada para reset de contraseña con validación de coincidencia y redirección automática al login. Incluye backend con nodemailer y Firebase Admin.
- **Unificación de Categoría "Otros"**: "Otros" es ahora una categoría única compartida entre ingresos y gastos, apareciendo una sola vez en los filtros. Las variantes "Otros"/"Others" se normalizan internamente.
- **Motor de Conversión Mejorado**: Cambiado a API `open.er-api.com` (sin CORS, soporta ARS) con fallback de tasas hardcoded actualizadas. Cache por día y promesas pendientes para evitar requests duplicados.
- **Gráficos Corregidos**: Solucionados warnings de Recharts y errores de dimensiones usando `ResponsiveContainer` con contenedores de tamaño mínimo.
- **Limpieza de Código**: Eliminación de todos los `console.*` y comentarios revealing. Código más mantenible y listo para producción.
- **Fórmula de Tasa de Ahorro**: Ahora se calcula como `(ingresos - gastos) / ingresos * 100` (antes basado solo en Salary).
- **Internacionalización Completa**: Todos los textos, incluyendo selectores de moneda, están traducidos al español e inglés según el idioma seleccionado por el usuario. Los selectores de fecha nativos (`<input type="month">`, `<input type="date">`) dependen del idioma del navegador/OS y no pueden ser traducidos por la app.

### v1.9.1 (02/05/2026)
- **Recuperación de Contraseña por Email**: Implementación completa de flujo de reset de contraseña mediante enlace enviado por correo (nodemailer + Firebase Admin). Incluye página de reset con validación de coincidencia de contraseñas y redirección automática al login.
- **Backend API**: Servidor Express con nodemailer para envío de emails, verificación de usuarios mediante Firebase Admin, y soporte para dominios de producción (Vercel) y desarrollo local.
- **Mensajes de Éxito Visuales**: Iconografía de CheckCircle en mensajes de confirmación (Auth y Reset) con estilo de Glassmorphism consistente.
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

*(Versiones anteriores disponibles en el historial completo)*

---

Desarrollado por **Miguel Rodríguez** - © 2026
