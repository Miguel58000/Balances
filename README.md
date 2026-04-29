# Balances - Personal Finance Tracker

![Balances Banner](https://img.shields.io/badge/Balances-Finance_Tracker-6366f1?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-1.5.1-blue?style=for-the-badge)


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
