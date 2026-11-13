import { es } from 'react-day-picker/locale/es';
import { Calendar } from '@/components/ui/primitives/calendar';

/**
 * Calendario de DateInput (react-day-picker en español, semana desde el lunes).
 * Va en un archivo aparte para cargarlo con lazy() al abrir el popover: react-day-picker y su locale
 * no entran en el bundle inicial.
 */
const DateCalendar = (props) => <Calendar mode="single" locale={es} weekStartsOn={1} {...props} />;

export default DateCalendar;
