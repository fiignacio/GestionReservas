import React, { useState, useMemo } from 'react';
import { useReservationsContext } from '../../context/ReservationsContext';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import { format } from 'date-fns';
import { Search } from 'lucide-react';

const PastReservations = () => {
    const { pastReservations, loading, error } = useReservationsContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredReservations = useMemo(() => {
        if (!pastReservations) return [];
        return pastReservations.filter(res =>
            res.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pastReservations, searchTerm]);

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Reservas</h2>
            <div className="relative mb-4">
                <Input
                    type="text"
                    placeholder="Buscar por nombre de cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Check-in</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Check-out</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pagado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReservations.map(res => (
                            <tr key={res.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{res.nombreCliente}</div>
                                    <div className="text-sm text-gray-500">
                                        {res.tipoCabana ? `${res.tipoCabana} | ` : ''}A: {res.adultos || 0}, N: {res.ninos || 0}, B: {res.bebes || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                    <div className="text-sm text-gray-900">{format(res.fechaCheckIn, 'dd/MM/yyyy')}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                    <div className="text-sm text-gray-900">{format(res.fechaCheckOut, 'dd/MM/yyyy')}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900">
                                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(res.precioTotal)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredReservations.length === 0 && !loading && (
                    <p className="text-center text-gray-500 py-8">No hay reservas en el historial.</p>
                )}
            </div>
        </div>
    );
};

export default PastReservations;
