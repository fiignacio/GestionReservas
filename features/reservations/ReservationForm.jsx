// ReservationForm.jsx
const ReservationForm = ({ reservation, onDone }) => {
    const { addReservation, updateReservation, isSubmitting } = useReservationsContext();
    const [formData, setFormData] = useState({
        nombreCliente: reservation?.nombreCliente || '',
        cantidadPasajeros: reservation?.cantidadPasajeros || 1,
        fechaCheckIn: reservation ? format(reservation.fechaCheckIn, 'yyyy-MM-dd') : '',
        fechaCheckOut: reservation ? format(reservation.fechaCheckOut, 'yyyy-MM-dd') : '',
        vueloIn: reservation?.vueloIn || '',
        vueloOut: reservation?.vueloOut || '',
        estado: reservation?.estado || 'Pendiente',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (reservation) {
            await updateReservation(reservation.id, formData);
        } else {
            await addReservation(formData);
        }
        onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="nombreCliente" className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                <Input id="nombreCliente" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="cantidadPasajeros" className="block text-sm font-medium text-gray-700">Pasajeros</label>
                    <Input id="cantidadPasajeros" name="cantidadPasajeros" type="number" min="1" value={formData.cantidadPasajeros} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
                    <select id="estado" name="estado" value={formData.estado} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>Pendiente</option>
                        <option>Confirmada</option>
                        <option>Cancelada</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="fechaCheckIn" className="block text-sm font-medium text-gray-700">Check-in</label>
                    <Input id="fechaCheckIn" name="fechaCheckIn" type="date" value={formData.fechaCheckIn} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="fechaCheckOut" className="block text-sm font-medium text-gray-700">Check-out</label>
                    <Input id="fechaCheckOut" name="fechaCheckOut" type="date" value={formData.fechaCheckOut} onChange={handleChange} required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="vueloIn" className="block text-sm font-medium text-gray-700">Vuelo Entrada</label>
                    <Input id="vueloIn" name="vueloIn" value={formData.vueloIn} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="vueloOut" className="block text-sm font-medium text-gray-700">Vuelo Salida</label>
                    <Input id="vueloOut" name="vueloOut" value={formData.vueloOut} onChange={handleChange} />
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : (reservation ? 'Actualizar Reserva' : 'Crear Reserva')}
                </Button>
            </div>
        </form>
    );
};
