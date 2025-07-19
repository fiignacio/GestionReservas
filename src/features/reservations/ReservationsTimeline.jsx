import React, { useState, useMemo, useEffect } from 'react';
import { useReservationsContext } from '../../context/ReservationsContext';
import Spinner from '../../components/ui/Spinner';
import { es } from 'date-fns/locale';
import { format, addDays, startOfToday,startOfDay, isWithinInterval, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const cabinColors = {
    'Pequeña': 'bg-blue-500 border-blue-700',
    'Mediana 1': 'bg-purple-500 border-purple-700',
    'Mediana 2': 'bg-indigo-500 border-indigo-700',
    'Grande': 'bg-teal-500 border-teal-700',
    'default': 'bg-gray-500 border-gray-700'
};

const CABIN_ORDER = ['Pequeña', 'Mediana 1', 'Mediana 2', 'Grande'];

const ReservationsTimeline = ({ onSelectReservation }) => {
    const { upcomingReservations, loading, error } = useReservationsContext();
    const [startDate, setStartDate] = useState(startOfToday());
    const [numberOfDays, setNumberOfDays] = useState(30); // Default view: 30 days

    const handleDateChange = (days) => {
        setStartDate(addDays(startDate, days));
    };

    const days = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: addDays(startDate, numberOfDays - 1) });
    }, [startDate, numberOfDays]);

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg overflow-x-auto">
            <div className="flex justify-between items-center mb-4 sticky left-0">
                <h2 className="text-xl font-bold text-gray-800">Línea de Tiempo</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleDateChange(-7)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
                    <span className="font-semibold text-gray-700">{format(startDate, 'dd MMM', { locale: es })} - {format(addDays(startDate, numberOfDays - 1), 'dd MMM yyyy', { locale: es })}</span>
                    <button onClick={() => handleDateChange(7)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
                </div>
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${numberOfDays}, 1fr)` }}>
                {/* Header de Cabañas (fijo) */}
                <div className="sticky left-0 bg-white z-10 font-semibold text-sm text-gray-600 border-r border-b">Cabaña</div>
                {/* Header de Fechas */}
                {days.map(day => (
                    <div key={day.toString()} className={`text-center p-2 border-b ${isSameDay(day, new Date()) ? 'bg-blue-100' : ''}`}>
                        <p className="text-xs font-medium text-gray-500">{format(day, 'EEE', { locale: es })}</p>
                        <p className="font-bold text-lg">{format(day, 'd')}</p>
                    </div>
                ))}

                {/* Filas de Cabañas */}
                {CABIN_ORDER.map(cabinName => {
                    const cabinReservations = upcomingReservations.filter(res => res.tipoCabana === cabinName);
                    return (
                        <React.Fragment key={cabinName}>
                            <div className="sticky left-0 bg-white z-10 font-semibold text-sm text-gray-700 border-r flex items-center justify-center p-2">{cabinName}</div>
                            <div className="col-span-full relative grid" style={{ gridTemplateColumns: `repeat(${numberOfDays}, 1fr)` }}>
                                {cabinReservations.map(res => {
                                    const start = startOfDay(res.fechaCheckIn);
                                    const end = startOfDay(res.fechaCheckOut);
                                    const offset = differenceInDays(start, startDate);
                                    const duration = differenceInDays(end, start) + 1;

                                    if (offset + duration <= 0 || offset >= numberOfDays) return null;

                                    return (
                                        <div
                                            key={res.id}
                                            onClick={() => onSelectReservation(res)}
                                            className={`absolute h-10 flex items-center p-2 rounded-lg text-white text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity my-1 ${cabinColors[res.tipoCabana] || cabinColors.default}`}
                                            style={{
                                                left: `calc(${offset} * (100% / ${numberOfDays}))`,
                                                width: `calc(${duration} * (100% / ${numberOfDays}))`,
                                            }}
                                        >
                                            <p className="truncate">{res.nombreCliente}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default ReservationsTimeline;
