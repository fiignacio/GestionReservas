const ReservationTable = ({ onEdit }) => {
    const { reservations, loading, error, deleteReservation } = useReservationsContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredReservations = useMemo(() => {
        return reservations.filter(res =>
            res.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reservations, searchTerm]);

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500">{error}</p>;

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
                                    <div className="text-sm text-gray-500">{res.cantidadPasajeros} pasajero(s)</div>
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
                                    <button onClick={() => deleteReservation(res.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredReservations.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No se encontraron reservas.</p>
                )}
            </div>
        </div>
    );
};