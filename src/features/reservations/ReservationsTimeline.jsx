import React, { useState, useMemo, useEffect } from 'react';
import { useReservationsContext } from '../../context/ReservationsContext';
import Spinner from '../../components/ui/Spinner';
import { es } from 'date-fns/locale';
import { 
    format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
    eachDayOfInterval, isSameMonth, isSameDay, startOfDay, isWithinInterval, 
    differenceInDays, isBefore, isAfter, subDays
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- Constantes de Estilo ---
const CABIN_COLORS = {
    'Pequeña': 'bg-blue-200 border-l-4 border-blue-500 text-blue-900',
    'Mediana 1': 'bg-purple-200 border-l-4 border-purple-500 text-purple-900',
    'Mediana 2': 'bg-indigo-200 border-l-4 border-indigo-500 text-indigo-900',
    'Grande': 'bg-teal-200 border-l-4 border-teal-500 text-teal-900',
    'default': 'bg-gray-200 border-l-4 border-gray-500 text-gray-900'
};
const DAY_HEADER_HEIGHT = 36; // Altura de la cabecera de días (Lun, Mar, etc.)
const DAY_NUMBER_HEIGHT = 32; // Espacio para el número del día en cada celda
const BAR_HEIGHT = 28;        // Altura de cada barra de reserva
const BAR_GAP = 4;            // Espacio vertical entre barras de reserva

const ReservationsTimeline = ({ onSelectReservation }) => {
    const { upcomingReservations, loading, error } = useReservationsContext();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [initialJumpDone, setInitialJumpDone] = useState(false);

    // Efecto para saltar al mes de la primera reserva al cargar
    useEffect(() => {
        if (!loading && Array.isArray(upcomingReservations) && upcomingReservations.length > 0 && !initialJumpDone) {
            const earliestDate = upcomingReservations.reduce((earliest, current) => {
                const currentDate = new Date(current.fechaCheckIn);
                return currentDate < earliest ? currentDate : earliest;
            }, new Date(upcomingReservations[0].fechaCheckIn));
            
            setCurrentMonth(earliestDate);
            setInitialJumpDone(true);
        }
    }, [loading, upcomingReservations, initialJumpDone]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Genera los días que se mostrarán en la vista del calendario
    const daysInMonth = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);
    
    // Nombres de los días de la semana
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    // --- Lógica de Disposición de Reservas (Layout) ---
    // Este hook calcula la posición (carril) y duración de cada reserva para la vista actual
    const reservationLayout = useMemo(() => {
        if (!upcomingReservations) return [];

        const viewStart = daysInMonth[0];
        const viewEnd = daysInMonth[daysInMonth.length - 1];

        // Filtra solo las reservas visibles en el mes actual y las ordena
        const reservationsInView = upcomingReservations
            .map(res => ({
                ...res,
                // Aseguramos que las fechas sean objetos Date
                fechaCheckIn: new Date(res.fechaCheckIn),
                fechaCheckOut: new Date(res.fechaCheckOut)
            }))
            .filter(res => {
                const resStart = startOfDay(res.fechaCheckIn);
                const resEnd = startOfDay(res.fechaCheckOut);
                return isWithinInterval(resStart, { start: viewStart, end: viewEnd }) ||
                       isWithinInterval(subDays(resEnd, 1), { start: viewStart, end: viewEnd }) ||
                       (isBefore(resStart, viewStart) && isAfter(resEnd, viewEnd));
            })
            .sort((a, b) => a.fechaCheckIn - b.fechaCheckIn);

        const layout = [];
        const lanes = []; // Almacena la fecha de fin de la última reserva en cada carril

        reservationsInView.forEach(res => {
            const resStart = startOfDay(res.fechaCheckIn);
            let assignedLane = -1;

            // Busca un carril libre
            for (let i = 0; i < lanes.length; i++) {
                if (!isAfter(lanes[i], resStart)) {
                    lanes[i] = startOfDay(res.fechaCheckOut);
                    assignedLane = i;
                    break;
                }
            }

            // Si no hay carriles libres, crea uno nuevo
            if (assignedLane === -1) {
                lanes.push(startOfDay(res.fechaCheckOut));
                assignedLane = lanes.length - 1;
            }

            layout.push({ ...res, lane: assignedLane });
        });

        return layout;
    }, [upcomingReservations, daysInMonth]);
    
    // Calcula la altura máxima necesaria para cada semana
    const weekHeights = useMemo(() => {
        const heights = [];
        for (let i = 0; i < daysInMonth.length; i += 7) {
            const weekStart = daysInMonth[i];
            const weekEnd = daysInMonth[i + 6];
            let maxLane = -1;
            reservationLayout.forEach(res => {
                const resStart = startOfDay(res.fechaCheckIn);
                const resEnd = startOfDay(res.fechaCheckOut);
                if (isWithinInterval(resStart, { start: weekStart, end: weekEnd}) ||
                    isWithinInterval(subDays(resEnd, 1), { start: weekStart, end: weekEnd}) ||
                    (isBefore(resStart, weekStart) && isAfter(resEnd, weekEnd))) {
                    if (res.lane > maxLane) {
                        maxLane = res.lane;
                    }
                }
            });
            const height = DAY_NUMBER_HEIGHT + (maxLane + 1) * (BAR_HEIGHT + BAR_GAP);
            heights.push(Math.max(height, 80)); // Altura mínima de 80px
        }
        return heights;
    }, [reservationLayout, daysInMonth]);

    if (loading && !initialJumpDone) return <Spinner />;
    if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            {/* --- Controles de Navegación del Mes --- */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronLeft /></button>
                <h2 className="text-xl font-bold text-gray-800 capitalize w-48 text-center">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronRight /></button>
            </div>

            {/* --- Contenedor del Calendario --- */}
            <div className="relative">
                {/* --- Cabecera con Nombres de Días --- */}
                <div className="grid grid-cols-7 gap-px text-center" style={{ height: `${DAY_HEADER_HEIGHT}px` }}>
                    {dayNames.map(day => (
                        <div key={day} className="font-bold text-xs text-gray-500 py-2">{day}</div>
                    ))}
                </div>

                {/* --- Cuadrícula de Días (Fondo) --- */}
                <div className="grid grid-cols-7 grid-rows-[auto] gap-px border-t border-gray-200">
                    {daysInMonth.map((day, i) => (
                        <div 
                            key={i} 
                            className={`p-1 ${!isSameMonth(day, currentMonth) ? 'bg-gray-50' : 'bg-white'}`}
                            style={{ height: `${weekHeights[Math.floor(i / 7)]}px` }}
                        >
                            <span className={`font-medium text-sm flex items-center justify-center ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white rounded-full w-7 h-7' : 'text-gray-700 w-7 h-7'}`}>
                                {format(day, 'd')}
                            </span>
                        </div>
                    ))}
                </div>

                {/* --- Capa de Barras de Reservas --- */}
                <div className="absolute top-0 left-0 w-full h-full" style={{ top: `${DAY_HEADER_HEIGHT}px` }}>
                    {reservationLayout.map(res => {
                        const resStart = startOfDay(res.fechaCheckIn);
                        const resEnd = startOfDay(res.fechaCheckOut);
                        
                        let startIndex = daysInMonth.findIndex(day => isSameDay(day, resStart));
                        let duration = differenceInDays(resEnd, resStart);

                        // Ajusta para reservas que empiezan antes de la vista actual
                        if (startIndex === -1) {
                            startIndex = 0;
                            duration = differenceInDays(resEnd, daysInMonth[0]);
                        }
                        
                        // Ajusta la duración para reservas que terminan después de la vista
                        if (startIndex + duration > daysInMonth.length) {
                            duration = daysInMonth.length - startIndex;
                        }

                        if (duration <= 0) duration = 1; // Mínimo 1 día de ancho

                        const weekIndex = Math.floor(startIndex / 7);
                        const topOffset = weekHeights.slice(0, weekIndex).reduce((acc, height) => acc + height, 0);

                        return (
                            <div
                                key={res.id}
                                title={`${res.nombreCliente} - ${res.tipoCabana}`}
                                className={`absolute h-7 flex items-center p-1.5 rounded truncate cursor-pointer shadow-sm ${CABIN_COLORS[res.tipoCabana] || CABIN_COLORS.default}`}
                                style={{
                                    top: `${topOffset + DAY_NUMBER_HEIGHT + res.lane * (BAR_HEIGHT + BAR_GAP)}px`,
                                    left: `${(startIndex % 7) * (100 / 7)}%`,
                                    width: `calc(${duration * (100 / 7)}% - 4px)`, // Pequeño ajuste para el espaciado
                                    height: `${BAR_HEIGHT}px`,
                                }}
                                onClick={() => onSelectReservation(res)}
                            >
                                <p className="font-semibold text-xs truncate">{res.nombreCliente}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReservationsTimeline;
