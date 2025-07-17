import React, { useState, useMemo } from 'react';
import { useReservationsContext } from '../../context/ReservationsContext';
import { isWithinInterval, startOfToday, addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, X } from 'lucide-react';

const UpcomingReservations = () => {
    const { reservations, loading } = useReservationsContext();
    const [dismissedAlerts, setDismissedAlerts] = useState([]);

    const upcomingReservations = useMemo(() => {
        if (loading || !reservations) {
            return [];
        }
        const today = startOfToday();
        const nextSevenDays = addDays(today, 7);

        return reservations.filter(res => {
            if (!res.fechaCheckIn) return false;
            const checkInDate = res.fechaCheckIn;
            // Filtra solo las reservas que no han sido confirmadas o canceladas
            return isWithinInterval(checkInDate, { start: today, end: nextSevenDays }) && res.estado === 'Pendiente';
        });
    }, [reservations, loading]);

    const handleDismiss = (id) => {
        setDismissedAlerts(prev => [...prev, id]);
    };

    const visibleAlerts = upcomingReservations.filter(res => !dismissedAlerts.includes(res.id));

    if (visibleAlerts.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {visibleAlerts.map(res => {
                const totalPasajeros = (res.adultos || 0) + (res.ninos || 0) + (res.bebes || 0);
                return (
                    <div key={res.id} className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg shadow-md flex items-start justify-between">
                        <div className="flex items-start">
                            <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
                            <div>
                                <p className="font-bold">Próxima Llegada: {res.nombreCliente}</p>
                                <p className="text-sm">
                                    Llega el <span className="font-semibold">{format(res.fechaCheckIn, 'EEEE dd \'de\' MMMM', { locale: es })}</span>.
                                </p>
                                <p className="text-sm">
                                    Pasajeros: <span className="font-semibold">{totalPasajeros}</span> | Vuelo de llegada: <span className="font-semibold">{res.vueloIn}</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => handleDismiss(res.id)} className="text-yellow-600 hover:text-yellow-800">
                            <X size={20} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default UpcomingReservations;
