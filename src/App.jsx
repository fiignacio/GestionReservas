// ---add coments /src/App.jsx ---
// Componente raíz que ensambla toda la aplicación.
function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);

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
            {/* Toaster para notificaciones globales */}
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
                </header>

                <main className="container mx-auto p-4 space-y-8">
                    <ReservationsTimeline />
                    <ReservationTable onEdit={handleEdit} />
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

// El punto de entrada de la aplicación.
// En un proyecto real, este sería el contenido de /src/main.jsx
// y usaría ReactDOM.createRoot(document.getElementById('root')).render(...);
// Para este ejemplo, exportamos App como el componente principal.
export default App;





