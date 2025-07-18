import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useReservationsContext } from '../../context/ReservationsContext';
import Spinner from '../../components/ui/Spinner';
import { es } from 'date-fns/locale';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfDay, differenceInDays, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const cabinColors = {
    'Pequeña': 'bg-blue-200 text-blue-900 border-l-4 border-blue-500',
    'Mediana 1': 'bg-purple-200 text-purple-900 border-l-4 border-purple-500',
    'Mediana 2': 'bg-indigo-200 text-indigo-900 border-l-4 border-indigo-500',
    'Grande': 'bg-teal-200 text-teal-900 border-l-4 border-teal-500',
    'default': 'bg-gray-200 text-gray-900 border-l-4 border-gray-500'
};

const ReservationsTimeline = ({ onSelectReservation }) => {
    const { upcomingReservations, loading, error } = useReservationsContext();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [initialJumpDone, setInitialJumpDone] = useState(false);

    useEffect(() => {
        if (!loading && Array.isArray(upcomingReservations) && upcomingReservations.length > 0 && !initialJumpDone) {
            const earliestDate = upcomingReservations.reduce((earliest, current) => {
                return current.fechaCheckIn < earliest ? current.fechaCheckIn : earliest;
            }, upcomingReservations[0].fechaCheckIn);
            
            setCurrentMonth(earliestDate);
            setInitialJumpDone(true);
        }
    }, [loading, upcomingReservations, initialJumpDone]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const daysInMonth = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);
    
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    // MODIFICADO: La función getReservationsForDay ahora incluye el check-out para el cálculo de la duración.
    const getReservationsForDay = useCallback((day) => {
        if (!upcomingReservations) return [];
        return upcomingReservations.filter(res => {
            if (!res.fechaCheckIn || !res.fechaCheckOut) {
                return false;
            }
            // El intervalo es [check-in, check-out). No incluye el día de check-out.
            const interval = {
                start: startOfDay(res.fechaCheckIn),
                end: startOfDay(res.fechaCheckOut)
            };
            // Comprobamos si el día está DENTRO del intervalo, sin incluir el final.
            return isSameDay(day, interval.start) || (isAfter(day, interval.start) && isBefore(day, interval.end));
        });
    }, [upcomingReservations]);

    if (loading && !initialJumpDone) return <Spinner />;
    if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
                <h2 className="text-xl font-bold text-gray-800 capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
            </div>
            {/* AÑADIDO: 'relative' para que las reservas se posicionen sobre la grilla */}
            <div className="grid grid-cols-7 gap-px text-center relative bg-gray-100 border border-gray-100">
                {dayNames.map(day => (
                    <div key={day} className="font-bold text-xs text-gray-500 py-2 bg-white">{day}</div>
                ))}
                {daysInMonth.map((day, dayIndex) => {
                    const reservationsOnDay = getReservationsForDay(day);
                    return (
                        <div key={dayIndex} className={`h-28 flex flex-col bg-white ${!isSameMonth(day, currentMonth) ? 'bg-gray-50' : ''}`}>
                            <span className={`font-medium text-sm self-center mt-1 ${isSameDay(day, new Date()) ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                                {format(day, 'd')}
                            </span>
                        </div>
                    );
                })}

                {/* AÑADIDO: Bloque para renderizar las barras de reserva continuas */}
                {daysInMonth.map((day, dayIndex) => {
                    // Determina si estamos al inicio de una semana (Lunes)
                    const isWeekStartDay = dayIndex % 7 === 0;

                    // Encuentra las reservas que comienzan en este día
                    const startingReservations = upcomingReservations.filter(res => 
                        res.fechaCheckIn && isSameDay(startOfDay(res.fechaCheckIn), day)
                    );
                    
                    // Encuentra las reservas que continúan de la semana anterior
                    const continuingReservations = isWeekStartDay ? upcomingReservations.filter(res => 
                        res.fechaCheckIn && isBefore(startOfDay(res.fechaCheckIn), day) && res.fechaCheckOut && isAfter(startOfDay(res.fechaCheckOut), day)
                    ) : [];

                    const reservationsToRender = [...startingReservations, ...continuingReservations];

                    return (
                        <div
                            key={`reservations-${dayIndex}`}
                            className="absolute"
                            style={{
                                top: `${Math.floor(dayIndex / 7) * 7}rem`, // 7rem es h-28
                                left: `${(dayIndex % 7) * (100 / 7)}%`,
                                paddingTop: '2rem' // Espacio para el número del día
                            }}
                        >
                            {reservationsToRender.map((res, resIndex) => {
                                const weekEndDate = endOfWeek(day, { weekStartsOn: 1 });
                                const reservationStartDateOnGrid = isBefore(startOfDay(res.fechaCheckIn), day) ? day : startOfDay(res.fechaCheckIn);
                                const reservationEndDateOnGrid = isBefore(startOfDay(res.fechaCheckOut), weekEndDate) ? startOfDay(res.fechaCheckOut) : addDays(weekEndDate, 1);
                                
                                // El span no debe exceder los días restantes en la semana
                                const span = Math.min(
                                    differenceInDays(reservationEndDateOnGrid, reservationStartDateOnGrid),
                                    7 - (dayIndex % 7)
                                );
                                
                                if (span <= 0) return null;

                                return (
                                    <div
                                        key={res.id}
                                        title={`${res.nombreCliente} - ${res.tipoCabana || ''}`}
                                        className={`absolute text-xs p-1 rounded truncate cursor-pointer h-6 z-10 ${cabinColors[res.tipoCabana] || cabinColors.default}`}
                                        style={{
                                            // Ancho calculado en base al span y el ancho de la celda
                                            width: `calc(${span * 100}% + ${span -1}px)`,
                                            // Apilamiento vertical simple para evitar solapamientos
                                            top: `${resIndex * 1.6}rem`,
                                        }}
                                        onClick={() => onSelectReservation(res)}
                                    >
                                        {res.nombreCliente}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReservationsTimeline;
