import React, { useState, useEffect } from 'react';
import { useReservationsContext } from '../../context/ReservationsContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { format, parseISO, isAfter } from 'date-fns';


const ReservationForm = ({ reservation, onDone }) => {
    const { addReservation, updateReservation, isSubmitting } = useReservationsContext();
    
    const [formData, setFormData] = useState({
        nombreCliente: '',
        adultos: 1,
        ninos: 0,
        bebes: 0,
        fechaCheckIn: '',
        fechaCheckOut: '',
        temporada: 'Baja',
        tipoCabana: 'Pequeña', // Nuevo campo
        vueloIn: 'LA841',
        vueloOut: 'LA842',
        tipoAbono: 'porcentaje',
        montoAbono: 0,
        precioTotal: 0,
        estado: 'Pendiente',
    });

    useEffect(() => {
        if (reservation) {
            setFormData({
                nombreCliente: reservation.nombreCliente || '',
                adultos: reservation.adultos || 1,
                ninos: reservation.ninos || 0,
                bebes: reservation.bebes || 0,
                fechaCheckIn: reservation.fechaCheckIn ? format(reservation.fechaCheckIn, 'yyyy-MM-dd') : '',
                fechaCheckOut: reservation.fechaCheckOut ? format(reservation.fechaCheckOut, 'yyyy-MM-dd') : '',
                temporada: reservation.temporada || 'Baja',
                tipoCabana: reservation.tipoCabana || 'Pequeña', // Nuevo campo
                vueloIn: reservation.vueloIn || 'LA841',
                vueloOut: reservation.vueloOut || 'LA842',
                tipoAbono: reservation.tipoAbono || 'porcentaje',
                montoAbono: reservation.montoAbono || 0,
                precioTotal: reservation.precioTotal || 0,
                estado: reservation.estado || 'Pendiente',
            });
        }
    }, [reservation]);

    useEffect(() => {
        const { fechaCheckIn, fechaCheckOut, adultos, ninos, temporada } = formData;
        if (fechaCheckIn && fechaCheckOut) {
            const checkInDate = parseISO(fechaCheckIn);
            const checkOutDate = parseISO(fechaCheckOut);

            if (isAfter(checkOutDate, checkInDate)) {
                const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
                const noches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                const precioAdulto = temporada === 'Alta' ? 30000 : 25000;
                const precioNino = 15000;
                const total = noches * ((parseInt(adultos, 10) || 0) * precioAdulto + (parseInt(ninos, 10) || 0) * precioNino);
                setFormData(prev => ({ ...prev, precioTotal: total }));
            } else {
                setFormData(prev => ({ ...prev, precioTotal: 0 }));
            }
        }
    }, [formData.fechaCheckIn, formData.fechaCheckOut, formData.adultos, formData.ninos, formData.temporada]);

    useEffect(() => {
        if (formData.tipoAbono === 'porcentaje') {
            setFormData(prev => ({ ...prev, montoAbono: prev.precioTotal * 0.5 }));
        }
    }, [formData.tipoAbono, formData.precioTotal]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAbonoManualChange = (e) => {
        setFormData(prev => ({ ...prev, montoAbono: parseFloat(e.target.value) || 0 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = { ...formData, adultos: parseInt(formData.adultos, 10), ninos: parseInt(formData.ninos, 10), bebes: parseInt(formData.bebes, 10) };
        if (reservation) {
            await updateReservation(reservation.id, dataToSubmit);
        } else {
            await addReservation(dataToSubmit);
        }
        onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="nombreCliente" className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                <Input id="nombreCliente" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} required />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Pasajeros</h4>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label htmlFor="adultos" className="block text-xs text-gray-600">Adultos</label>
                            <Input id="adultos" name="adultos" type="number" min="0" value={formData.adultos} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="ninos" className="block text-xs text-gray-600">Niños (7-15)</label>
                            <Input id="ninos" name="ninos" type="number" min="0" value={formData.ninos} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="bebes" className="block text-xs text-gray-600">Bebés (0-6)</label>
                            <Input id="bebes" name="bebes" type="number" min="0" value={formData.bebes} onChange={handleChange} />
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Temporada</h4>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center"><Input type="radio" name="temporada" value="Baja" checked={formData.temporada === 'Baja'} onChange={handleChange} className="h-4 w-4" /><span className="ml-2">Baja</span></label>
                        <label className="flex items-center"><Input type="radio" name="temporada" value="Alta" checked={formData.temporada === 'Alta'} onChange={handleChange} className="h-4 w-4" /><span className="ml-2">Alta</span></label>
                    </div>
                </div>
            </div>
            {/* Nueva sección para Tipo de Cabaña */}
            <div>
                <label htmlFor="tipoCabana" className="block text-sm font-medium text-gray-700">Tipo de Cabaña</label>
                <select id="tipoCabana" name="tipoCabana" value={formData.tipoCabana} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option>Pequeña</option>
                    <option>Mediana 1</option>
                    <option>Mediana 2</option>
                    <option>Grande</option>
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vuelo de Llegada</h4>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center"><Input type="radio" name="vueloIn" value="LA841" checked={formData.vueloIn === 'LA841'} onChange={handleChange} className="h-4 w-4" /><span className="ml-2">LA841</span></label>
                        <label className="flex items-center"><Input type="radio" name="vueloIn" value="LA843" checked={formData.vueloIn === 'LA843'} onChange={handleChange} className="h-4 w-4" /><span className="ml-2">LA843</span></label>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vuelo de Salida</h4>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center"><Input type="radio" name="vueloOut" value="LA842" checked={formData.vueloOut === 'LA842'} onChange={handleChange} className="h-4 w-4" /><span className="ml-2">LA842</span></label>
                        <label className="flex items-center"><Input type="radio" name="vueloOut" value="LA844" checked={formData.vueloOut === 'LA844'} onChange={handleChange} className="h-4 w-4" /><span className="ml-2">LA844</span></label>
                    </div>
                </div>
            </div>
            <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Abono</h4>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center"><Input type="radio" name="tipoAbono" value="porcentaje" checked={formData.tipoAbono === 'porcentaje'} onChange={handleChange} className="h-4 w-4" /><span className="ml-2">50%</span></label>
                            <label className="flex items-center"><Input type="radio" name="tipoAbono" value="manual" checked={formData.tipoAbono === 'manual'} onChange={handleChange} className="h-4 w-4" /><span className="ml-2">Manual</span></label>
                        </div>
                        {formData.tipoAbono === 'manual' && (
                            <div className="mt-2">
                                <Input type="number" placeholder="Monto del abono" value={formData.montoAbono} onChange={handleAbonoManualChange} />
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <h4 className="text-sm font-medium text-gray-700">Precio Total</h4>
                        <p className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(formData.precioTotal)}</p>
                        <h4 className="text-sm font-medium text-gray-700 mt-1">Abono</h4>
                        <p className="text-lg font-semibold text-blue-600">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(formData.montoAbono)}</p>
                    </div>
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

export default ReservationForm;
