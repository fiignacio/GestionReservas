import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useReservationsContext } from '../../context/ReservationsContext';
import Spinner from '../../components/ui/Spinner';
import { es } from 'date-fns/locale';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfDay, isWithinInterval, differenceInDays, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const cabinColors = {
    'Pequeña': 'bg-blue-500 border-blue-700',
    'Mediana 1': 'bg-purple-500 border-purple-700',
    'Mediana 2': 'bg-indigo-500 border-indigo-700',
    'Grande': 'bg-teal-500 border-teal-700',
    'default': 'bg-gray-500 border-gray-700'
};

const ReservationsTimeline = ({ onSelectReservation }) => {
    const { upcomingReservations, loading, error } = useReservationsContext();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [initialJumpDone, setInitialJumpDone] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const { daysInGrid, monthReservations, reservationLayout } = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        
        const daysInGrid = eachDayOfInterval({ start: gridStart, end: gridEnd });

        const monthReservations = (upcomingReservations || []).filter(res => 
            isWithinInterval(res.fechaCheckIn, { start: gridStart, end: gridEnd }) ||
            isWithinInterval(res.fechaCheckOut, { start: gridStart, end: gridEnd }) ||
            (res.fechaCheckIn < gridStart && res.fechaCheckOut > gridEnd)
        );

        const layout = [];
        const occupiedLanes = [];

        monthReservations.forEach(res => {
            let lane = 0;
            while (occupiedLanes[lane] && isWithinInterval(res.fechaCheckIn, { start: occupiedLanes[lane].start, end: occupiedLanes[lane].end })) {
                lane++;
            }
            
            const startDayIndex = differenceInDays(startOfDay(res.fechaCheckIn), gridStart);
            const endDayIndex = differenceInDays(startOfDay(res.fechaCheckOut), gridStart);

            const duration = endDayIndex - startDayIndex + 1;
            const startColumn = startDayIndex >= 0 ? (startDayIndex % 7) + 1 : 1;
            const startRow = Math.floor(startDayIndex / 7) + 1;

            layout.push({
                ...res,
                startColumn,
                startRow,
                duration: duration > 0 ? duration : 1,
                lane,
            });

            occupiedLanes[lane] = { start: res.fechaCheckIn, end: res.fechaCheckOut };
        });

        return { daysInGrid, monthReservations, reservationLayout: layout };
    }, [currentMonth, upcomingReservations]);
    
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    if (loading && !initialJumpDone) return <Spinner />;
    if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

    // Vista para Móviles
    if (isMobile) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
                    <h2 className="text-xl font-bold text-gray-800 capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
                </div>
                <div className="space-y-4">
                    {daysInGrid.filter(d => isSameMonth(d, currentMonth)).map(day => {
                        const reservationsOnDay = (upcomingReservations || []).filter(res => isWithinInterval(day, {start: startOfDay(res.fechaCheckIn), end: startOfDay(res.fechaCheckOut)}));
                        return (
                            <div key={day.toString()}>
                                <h3 className={`font-bold text-sm ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-700'}`}>
                                    {format(day, 'EEEE dd', { locale: es })}
                                </h3>
                                <div className="pl-2 border-l-2 mt-1 space-y-2">
                                    {reservationsOnDay.length > 0 ? reservationsOnDay.map(res => (
                                        <div key={res.id} onClick={() => onSelectReservation(res)} className={`p-2 rounded text-white text-sm cursor-pointer ${cabinColors[res.tipoCabana] || cabinColors.default}`}>
                                            {res.nombreCliente} ({res.tipoCabana})
                                        </div>
                                    )) : <p className="text-xs text-gray-400 pl-2">Sin reservas</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Vista para Escritorio
    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
                <h2 className="text-xl font-bold text-gray-800 capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
            </div>
            <div className="grid grid-cols-7 text-center font-semibold text-gray-600 text-sm">
                {dayNames.map(day => (
                    <div key={day} className="py-2 border-b">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-px bg-gray-200 relative" style={{height: '600px'}}>
                {daysInGrid.map((day) => (
                    <div key={day.toString()} className={`bg-white p-2 ${!isSameMonth(day, currentMonth) ? 'bg-gray-50' : ''}`}>
                        <span className={`font-medium text-sm ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                            {format(day, 'd')}
                        </span>
                    </div>
                ))}
                <div className="absolute top-0 left-0 w-full h-full grid grid-cols-7 grid-rows-6 gap-px">
                     {reservationLayout.map(res => (
                        <div
                            key={res.id}
                            onClick={() => onSelectReservation(res)}
                            className={`absolute flex items-center p-1 rounded-lg text-white text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${cabinColors[res.tipoCabana] || cabinColors.default}`}
                            style={{
                                gridColumnStart: res.startColumn,
                                gridRowStart: res.startRow,
                                width: `calc(${res.duration} * (100% / 7) + ${res.duration - 1} * 1px)`,
                                top: `calc(${res.lane} * 1.75rem + 2rem)`, // 1.75rem = h-7, 2rem para el número del día
                                height: '1.75rem' // h-7
                            }}
                        >
                           <p className="truncate px-1">{res.nombreCliente}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReservationsTimeline;
