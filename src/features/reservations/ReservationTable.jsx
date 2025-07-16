import React, { useState, useMemo } from 'react';
import { useReservationsContext } from '../../context/ReservationsContext';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import { format } from 'date-fns/format';
import { Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

const ReservationTable = ({ onEdit }) => {
    const { reservations, loading, error, deleteReservation } = useReservationsContext();
    const [searchTerm, setSearchTerm] = useState('');

    const handleDeleteClick = (id) => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
              <p className="font-semibold">¿Seguro que quieres eliminar?</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    toast.dismiss(t.id);
                    deleteReservation(id);
                  }}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Eliminar
                </Button>
                <Button
                  onClick={() => toast.dismiss(t.id)}
                  className="bg-gray-300 text-gray-800 hover:bg-gray-400"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ));
    }

    const filteredReservations = useMemo(() => {
        if (!reservations) return [];
        return reservations.filter(res =>
            res.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reservations, searchTerm]);

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Listado de Reservas</h2>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReservations.map(res => (
                            <tr key={res.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{res.nombreCliente}</div>
                                    <div className="text-sm text-gray-500">
                                        A: {res.adultos || 0}, N: {res.ninos || 0}, B: {res.bebes || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                    <div className="text-sm text-gray-900">{format(res.fechaCheckIn, 'dd/MM/yyyy')}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                    <div className="text-sm text-gray-900">{format(res.fechaCheckOut, 'dd/MM/yyyy')}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        res.estado === 'Confirmada' ? 'bg-green-100 text-green-800' :
                                        res.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {res.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(res)} className="text-blue-600 hover:text-blue-900 mr-3">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(res.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredReservations.length === 0 && !loading && (
                    <p className="text-center text-gray-500 py-8">No se encontraron reservas.</p>
                )}
            </div>
        </div>
    );
};

export default ReservationTable;
