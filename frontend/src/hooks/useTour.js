import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Navega a una ruta y mueve el tour al siguiente paso luego de que React renderiza.
 * Usamos 500ms para dar tiempo al router + TanStack Query a renderizar la página destino.
 */
const goTo = (navigate, path, dr) => {
  navigate(path);
  setTimeout(() => dr.moveNext(), 500);
};

export function useTour() {
  const navigate = useNavigate();
  const driverRef = useRef(null);

  const startTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    driverRef.current = driver({
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Listo!',
      smoothScroll: true,
      overlayOpacity: 0.75,
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'lubricentro-tour-popover',
      steps: [

        // ─── 1. Bienvenida ───────────────────────────────────────────────
        {
          popover: {
            title: '👋 Bienvenido al Sistema Lubricentro',
            description:
              'Este tour te lleva por todas las secciones del sistema, explicando para qué sirve cada una y cómo crear registros.<br/><br/>Podés cerrarlo en cualquier momento con la <strong>✕</strong> y relanzarlo desde el ícono <strong>?</strong> del encabezado.',
            align: 'center',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/dashboard', dr);
          },
        },

        // ─── 2. Dashboard: KPI Cards ─────────────────────────────────────
        {
          element: '#tour-dashboard-kpi',
          popover: {
            title: '📊 Indicadores clave (KPIs)',
            description:
              'Cuatro métricas en tiempo real:<br/><br/>' +
              '• <strong>Clientes atendidos</strong> — mes actual vs semana.<br/>' +
              '• <strong>Ingresos del mes</strong> — con toggle para ocultar el monto.<br/>' +
              '• <strong>Turnos hoy</strong> — completados vs pendientes.<br/>' +
              '• <strong>Ticket promedio</strong> — y tasa de retención de clientes.',
            side: 'bottom',
            align: 'start',
          },
        },

        // ─── 3. Dashboard: Acciones rápidas ─────────────────────────────
        {
          element: '#tour-dashboard-quickactions',
          popover: {
            title: '⚡ Acciones rápidas',
            description:
              'Desde aquí podés crear registros con un clic sin navegar a otra sección:<br/><br/>' +
              '• <strong>Turno</strong> — agenda un nuevo turno.<br/>' +
              '• <strong>Atención</strong> — registrá un servicio realizado.<br/>' +
              '• <strong>Presupuesto</strong> — emití una cotización.<br/>' +
              '• <strong>Clientes</strong> — ir al listado de clientes.',
            side: 'bottom',
            align: 'end',
          },
        },

        // ─── 4. Dashboard: Turnos del día ───────────────────────────────
        {
          element: '#tour-dashboard-today',
          popover: {
            title: '📅 Turnos del día',
            description:
              'Lista de citas programadas para hoy. Podés ver el estado de cada una (programado, confirmado, completado, cancelado) y acceder directamente al detalle del turno o registrar su atención.',
            side: 'top',
            align: 'start',
          },
        },

        // ─── 5. Dashboard: Próximos turnos ──────────────────────────────
        {
          element: '#tour-dashboard-upcoming',
          popover: {
            title: '🗓️ Próximos turnos y presupuestos',
            description:
              'Vista de los turnos más cercanos y un indicador de presupuestos pendientes de aprobación.<br/><br/>Si hay presupuestos <strong>enviados</strong> sin respuesta, aparecen acá para que hagas seguimiento.',
            side: 'top',
            align: 'end',
          },
        },

        // ─── 6. Dashboard: Gráfico ──────────────────────────────────────
        {
          element: '#tour-dashboard-chart',
          popover: {
            title: '📈 Tendencia mensual de atenciones',
            description:
              'Gráfico que muestra la cantidad de servicios realizados mes a mes. Permite identificar picos de demanda y temporadas bajas para tomar decisiones de negocio.',
            side: 'top',
            align: 'start',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/appointments', dr);
          },
        },

        // ─── 7. Turnos: Calendario ──────────────────────────────────────
        {
          element: '#tour-appointments-calendar',
          popover: {
            title: '📆 Agenda de Turnos — Vista Calendario',
            description:
              'Visualizá todos los turnos del mes en formato calendario. Cada evento está coloreado por estado:<br/><br/>' +
              '• Gris → Programado<br/>' +
              '• Violeta → Confirmado<br/>' +
              '• Verde → Completado<br/>' +
              '• Rojo → Cancelado<br/><br/>' +
              'Podés hacer clic en cualquier día para crear un turno, o en un evento para editarlo.',
            side: 'right',
            align: 'start',
          },
        },

        // ─── 8. Turnos: Nuevo turno ─────────────────────────────────────
        {
          element: '#tour-appointments-new-btn',
          popover: {
            title: '➕ Crear un nuevo turno',
            description:
              'Al hacer clic acá se abre un formulario donde ingresás:<br/><br/>' +
              '• Cliente y vehículo<br/>' +
              '• Fecha y hora del turno<br/>' +
              '• Notas adicionales<br/><br/>' +
              'También podés crear turnos desde el Dashboard con el botón de acción rápida.',
            side: 'bottom',
            align: 'end',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/service-records', dr);
          },
        },

        // ─── 9. Atenciones ──────────────────────────────────────────────
        {
          element: '#tour-service-records-page',
          popover: {
            title: '🔧 Atenciones (Service Records)',
            description:
              'Registro completo de cada servicio realizado a un vehículo. Cada atención incluye:<br/><br/>' +
              '• Cliente y vehículo atendido<br/>' +
              '• Fecha del servicio y fecha sugerida del <strong>próximo service</strong><br/>' +
              '• Servicios y productos utilizados con sus precios<br/><br/>' +
              'Las atenciones pueden crearse manualmente o <strong>convertirse automáticamente desde un presupuesto aprobado</strong>.',
            side: 'bottom',
            align: 'start',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/presupuestos', dr);
          },
        },

        // ─── 10. Presupuestos: Tabla ────────────────────────────────────
        {
          element: '#tour-budgets-table',
          popover: {
            title: '📄 Lista de Presupuestos',
            description:
              'Tabla con todos los presupuestos emitidos. Cada fila muestra:<br/><br/>' +
              '• Fecha, cliente y vehículo<br/>' +
              '• Estado actual (<em>Borrador, Enviado, Aprobado, Rechazado</em>)<br/>' +
              '• Total lista y total tarjeta<br/><br/>' +
              'Desde las acciones podés <strong>imprimir</strong>, <strong>editar</strong> o <strong>eliminar</strong> cada presupuesto.',
            side: 'top',
            align: 'start',
          },
        },

        // ─── 11. Presupuestos: Nuevo ────────────────────────────────────
        {
          element: '#tour-budgets-new-btn',
          popover: {
            title: '➕ Crear un Presupuesto',
            description:
              'El flujo de un presupuesto es:<br/><br/>' +
              '<code>Borrador → Enviado → Aprobado → Convertido</code><br/><br/>' +
              '1. Se crea como <strong>Borrador</strong> — podés agregar servicios y productos.<br/>' +
              '2. Al enviarlo al cliente pasa a <strong>Enviado</strong> (ya no editable).<br/>' +
              '3. Si acepta → <strong>Aprobado</strong>. Con un clic se convierte en Atención.<br/>' +
              '4. Si rechaza o vence (30 días) → estado final.<br/><br/>' +
              'El número es único y automático: <strong>B{año}-{NNNN}</strong>.',
            side: 'bottom',
            align: 'end',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/customers', dr);
          },
        },

        // ─── 12. Clientes: Página ───────────────────────────────────────
        {
          element: '#tour-customers-page',
          popover: {
            title: '👥 Gestión de Clientes',
            description:
              'Directorio de todos los clientes del lubricentro. Podés buscar por nombre, email o teléfono.<br/><br/>' +
              'Cada cliente tiene un <strong>perfil completo</strong> con sus vehículos, historial de atenciones y presupuestos asociados.<br/><br/>' +
              'El <strong>teléfono</strong> es obligatorio (se usa para recordatorios por WhatsApp).',
            side: 'bottom',
            align: 'start',
          },
        },

        // ─── 13. Clientes: Nuevo ────────────────────────────────────────
        {
          element: '#tour-customers-new-btn',
          popover: {
            title: '➕ Registrar un Cliente',
            description:
              'El formulario solicita:<br/><br/>' +
              '• <strong>Nombre</strong> y <strong>Teléfono</strong> (obligatorios)<br/>' +
              '• Email (único en el sistema)<br/>' +
              '• Dirección<br/><br/>' +
              'Una vez creado el cliente, podés agregarle vehículos desde su perfil.',
            side: 'bottom',
            align: 'end',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/vehicles', dr);
          },
        },

        // ─── 14. Vehículos ──────────────────────────────────────────────
        {
          element: '#tour-vehicles-page',
          popover: {
            title: '🚗 Gestión de Vehículos',
            description:
              'Catálogo de todos los vehículos registrados. Cada vehículo pertenece a un cliente y se identifica por su <strong>patente única</strong>.<br/><br/>' +
              'Campos registrados:<br/>' +
              '• Marca, modelo y año<br/>' +
              '• Patente (identificador único)<br/>' +
              '• Cliente propietario<br/><br/>' +
              'Desde la columna de acciones podés ver el perfil del cliente dueño del vehículo.',
            side: 'bottom',
            align: 'start',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/services', dr);
          },
        },

        // ─── 15. Servicios ──────────────────────────────────────────────
        {
          element: '#tour-services-page',
          popover: {
            title: '⚙️ Catálogo de Servicios',
            description:
              'Lista de todos los trabajos que ofrece el lubricentro: cambio de aceite, filtros, revisión de frenos, etc.<br/><br/>' +
              'Cada servicio tiene un <strong>precio de referencia</strong> que se usa como valor inicial al armar un presupuesto o atención. El precio puede ajustarse en cada presupuesto.',
            side: 'bottom',
            align: 'start',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/products', dr);
          },
        },

        // ─── 16. Productos ──────────────────────────────────────────────
        {
          element: '#tour-products-page',
          popover: {
            title: '📦 Catálogo de Productos',
            description:
              'Insumos y repuestos usados en los servicios: aceites, filtros, pastillas, etc.<br/><br/>' +
              '• <strong>Precio de referencia</strong> como punto de partida en presupuestos.<br/>' +
              '• <strong>Stock</strong> registrado para control de inventario.<br/><br/>' +
              'Tanto servicios como productos pueden combinarse en un mismo presupuesto o atención (máximo 50 ítems en total).',
            side: 'bottom',
            align: 'start',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/inbox', dr);
          },
        },

        // ─── 17. Inbox ──────────────────────────────────────────────────
        {
          element: '#tour-inbox',
          popover: {
            title: '💬 Inbox Omnicanal',
            description:
              'Bandeja centralizada de mensajes de WhatsApp. Cuando esté activo:<br/><br/>' +
              '• Todos los mensajes entrantes aparecen en la columna izquierda.<br/>' +
              '• El agente de IA clasifica automáticamente las conversaciones.<br/>' +
              '• Podés responder directamente desde esta pantalla.<br/><br/>' +
              '<em>Próximamente disponible — Fase 2 del roadmap.</em>',
            side: 'right',
            align: 'start',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/reminders', dr);
          },
        },

        // ─── 18. Recordatorios: Stats ───────────────────────────────────
        {
          element: '#tour-reminders-stats',
          popover: {
            title: '🔔 Recordatorios de Service',
            description:
              'El sistema envía mensajes por WhatsApp automáticamente cuando se acerca la fecha del próximo service de un vehículo.<br/><br/>' +
              'Acá ves el resumen del mes:<br/>' +
              '• <strong>Enviados</strong> — notificaciones que llegaron correctamente.<br/>' +
              '• <strong>Pendientes</strong> — en cola para enviar.<br/>' +
              '• <strong>Fallidos</strong> — no pudieron enviarse (revisar el número de teléfono).',
            side: 'bottom',
            align: 'start',
          },
        },

        // ─── 19. Recordatorios: Filtros ─────────────────────────────────
        {
          element: '#tour-reminders-filters',
          popover: {
            title: '🔍 Filtros de Recordatorios',
            description:
              'Buscá recordatorios por cliente o patente, filtrá por estado (enviado/pendiente/fallido) y por rango de fechas.<br/><br/>' +
              'Desde la tabla podés navegar directamente al registro de atención que generó el recordatorio.',
            side: 'bottom',
            align: 'start',
          },
          onNextClick: (_el, _step, { driver: dr }) => {
            goTo(navigate, '/dashboard', dr);
          },
        },

        // ─── 20. Header: Botón tour ──────────────────────────────────────
        {
          element: '#tour-btn-tour',
          popover: {
            title: '🎓 ¿Necesitás repasar algo?',
            description:
              'Este ícono <strong>?</strong> siempre está disponible en el encabezado. Hacé clic las veces que quieras para relanzar este tour completo desde cero.',
            side: 'bottom',
            align: 'end',
          },
        },

        // ─── 21. Cierre ─────────────────────────────────────────────────
        {
          popover: {
            title: '✅ ¡Ya conocés el sistema!',
            description:
              'Flujo habitual del día a día:<br/><br/>' +
              '1. Revisá el <strong>Dashboard</strong> al comenzar el turno.<br/>' +
              '2. Confirmá o creá <strong>Turnos</strong> en la agenda.<br/>' +
              '3. Cuando el cliente llega, convertí el turno en una <strong>Atención</strong>.<br/>' +
              '4. Si cotizás primero, emitís un <strong>Presupuesto</strong> y lo convertís al aprobarse.<br/>' +
              '5. El sistema envía <strong>Recordatorios</strong> automáticos cuando se acerca el próximo service.<br/><br/>' +
              '¡Éxitos con el sistema!',
            align: 'center',
          },
        },
      ],
    });

    driverRef.current.drive();
  }, [navigate]);

  return { startTour };
}
