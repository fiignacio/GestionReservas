import React, { useState } from 'react';
import { ReservationsProvider } from './context/ReservationsContext';
import ReservationsTimeline from './features/reservations/ReservationsTimeline';
import UpcomingReservationTable from './features/reservations/ReservationTable'; // Renombrado
import PastReservations from './features/reservations/PastReservations';
import ReservationForm from './features/reservations/ReservationForm';
import UpcomingReservations from './features/reservations/UpcomingReservations';
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';
import { Toaster } from 'react-hot-toast';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [activeTab, setActiveTab] = useState('current'); // 'current' o 'past'

    const handleOpenModal = () => {
        setEditingReservation(null);
        setIsModalOpen(true);
    };

    const handleEdit = (reservation) => {
        setEditingReservation(reservation);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReservation(null);
    };

    return (
        <ReservationsProvider>
            <Toaster position="top-right" reverseOrder={false} />

            <div className="bg-gray-100 min-h-screen font-sans">
                <header className="bg-white shadow-md">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                           <CalendarIcon className="text-blue-500" size={28}/>
                           <h1 className="text-2xl font-bold text-gray-800">Gestión de Reservas</h1>
                        </div>
                        <Button onClick={handleOpenModal}>
                            <Plus size={20} className="inline-block mr-1" />
                            Nueva Reserva
                        </Button>
                    </div>
                    {/* Sistema de Pestañas */}
                    <nav className="container mx-auto px-4 border-b border-gray-200">
                        <div className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('current')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'current' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Actual
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'past' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Historial
                            </button>
                        </div>
                    </nav>
                </header>

                <main className="container mx-auto p-4 space-y-8">
                    {activeTab === 'current' && (
                        <>
                            <UpcomingReservations />
                            <ReservationsTimeline onSelectReservation={handleEdit} />
                            <UpcomingReservationTable onEdit={handleEdit} />
                        </>
                    )}
                    {activeTab === 'past' && (
                        <PastReservations />
                    )}
                </main>

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingReservation ? 'Editar Reserva' : 'Crear Nueva Reserva'}
                >
                    <ReservationForm
                        reservation={editingReservation}
                        onDone={handleCloseModal}
                    />
                </Modal>
            </div>
        </ReservationsProvider>
    );
}

export default App;
