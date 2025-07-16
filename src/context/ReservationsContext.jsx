// Se crea el contexto para el estado global.
const ReservationsContext = createContext();

// El proveedor de contexto que envuelve la aplicación.
export const ReservationsProvider = ({ children }) => {
    const { reservations, loading, error } = useReservations();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Función para añadir una nueva reserva.
    const addReservation = async (reservationData) => {
        if (!db) {
            toast.error("Firebase no está configurado. No se puede añadir la reserva.");
            return;
        }
        setIsSubmitting(true);
        try {
            // Convierte las fechas de string a objetos Date y luego a Timestamps de Firestore.
            const newReservation = {
                ...reservationData,
                fechaCheckIn: Timestamp.fromDate(parseISO(reservationData.fechaCheckIn)),
                fechaCheckOut: Timestamp.fromDate(parseISO(reservationData.fechaCheckOut)),
            };
            await addDoc(collection(db, "reservas"), newReservation);
            toast.success("Reserva creada con éxito!");
        } catch (e) {
            console.error("Error adding document: ", e);
            toast.error("Error al crear la reserva.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para actualizar una reserva existente.
    const updateReservation = async (id, reservationData) => {
        if (!db) {
            toast.error("Firebase no está configurado. No se puede actualizar la reserva.");
            return;
        }
        setIsSubmitting(true);
        try {
            const reservationRef = doc(db, "reservas", id);
            const updatedReservation = {
                ...reservationData,
                fechaCheckIn: Timestamp.fromDate(parseISO(reservationData.fechaCheckIn)),
                fechaCheckOut: Timestamp.fromDate(parseISO(reservationData.fechaCheckOut)),
            };
            await updateDoc(reservationRef, updatedReservation);
            toast.success("Reserva actualizada con éxito!");
        } catch (e) {
            console.error("Error updating document: ", e);
            toast.error("Error al actualizar la reserva.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para eliminar una reserva.
    const deleteReservation = async (id) => {
        if (!db) {
            toast.error("Firebase no está configurado. No se puede eliminar la reserva.");
            return;
        }
        if (window.confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
            setIsSubmitting(true);
            try {
                await deleteDoc(doc(db, "reservas", id));
                toast.success("Reserva eliminada con éxito!");
            } catch (e) {
                console.error("Error deleting document: ", e);
                toast.error("Error al eliminar la reserva.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // El valor del contexto que se pasa a los componentes hijos.
    const value = {
        reservations,
        loading,
        error,
        isSubmitting,
        addReservation,
        updateReservation,
        deleteReservation,
    };

    return (
        <ReservationsContext.Provider value={value}>
            {children}
        </ReservationsContext.Provider>
    );
};

// Hook para consumir el contexto fácilmente desde cualquier componente.
export const useReservationsContext = () => {
    return useContext(ReservationsContext);
};
