import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useReservationsContext } from '../../context/ReservationsContext';
import Spinner from '../../components/ui/Spinner';
import { es } from 'date-fns/locale';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, isEqual, startOfDay, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const cabinColors = {
    'Pequeña': 'bg-blue-200 text-blue-900',
    'Mediana 1': 'bg-purple-200 text-purple-900',
    'Mediana 2': 'bg-indigo-200 text-indigo-900',
    'Grande': 'bg-teal-200 text-teal-900',
    'default': 'bg-gray-200 text-gray-900'
};

const ReservationsTimeline = ({ onSelectReservation }) => {
    const { upcomingReservations, loading, error } = useReservationsContext();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [initialJumpDone, setInitialJumpDone] = useState(false);

    useEffect(() => {
        if (!loading && upcomingReservations && upcomingReservations.length > 0 && !initialJumpDone) {
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

    const getReservationsForDay = useCallback((day) => {
        if (!upcomingReservations) return [];
        
        return upcomingReservations.filter(res => {
            if (!res.fechaCheckIn || !res.fechaCheckOut) {
                return false;
            }
            // Corrección: Usar isWithinInterval para una lógica más clara y robusta.
            return isWithinInterval(day, {
                start: startOfDay(res.fechaCheckIn),
                end: startOfDay(res.fechaCheckOut)
            });
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
            <div className="grid grid-cols-7 gap-1 text-center">
                {dayNames.map(day => (
                    <div key={day} className="font-bold text-xs text-gray-500 py-2">{day}</div>
                ))}
                {daysInMonth.map((day, i) => {
                    const reservationsOnDay = getReservationsForDay(day);
                    return (
                        <div key={i} className={`border-t p-1 h-24 flex flex-col ${!isSameMonth(day, currentMonth) ? 'bg-gray-50' : ''}`}>
                            <span className={`font-medium text-sm self-center ${isSameDay(day, new Date()) ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                                {format(day, 'd')}
                            </span>
                            <div className="flex-grow overflow-y-auto text-left mt-1 space-y-1">
                                {reservationsOnDay.map(res => (
                                    <div 
                                        key={res.id} 
                                        title={`${res.nombreCliente} - ${res.tipoCabana || ''}`}
                                        className={`text-xs p-0.5 rounded truncate cursor-pointer ${cabinColors[res.tipoCabana] || cabinColors.default}`}
                                        onClick={() => onSelectReservation(res)}
                                    >
                                        {res.nombreCliente}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReservationsTimeline;
