const useReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Si no hay configuración de DB, no hacemos nada.
        if (!db) {
            setLoading(false);
            setError("Firebase no está configurado.");
            // Usamos datos de ejemplo para demostración
            console.warn("Usando datos de ejemplo porque Firebase no está configurado.");
            const today = new Date();
            const exampleData = [
                { id: '1', nombreCliente: 'Juan Pérez', cantidadPasajeros: 2, fechaCheckIn: Timestamp.fromDate(today), fechaCheckOut: Timestamp.fromDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)), vueloIn: 'LA123', vueloOut: 'LA456', estado: 'Confirmada' },
                { id: '2', nombreCliente: 'Ana Gómez', cantidadPasajeros: 1, fechaCheckIn: Timestamp.fromDate(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)), fechaCheckOut: Timestamp.fromDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)), vueloIn: 'AV789', vueloOut: 'AV012', estado: 'Pendiente' },
            ];
            setReservations(exampleData.map(res => ({
                ...res,
                fechaCheckIn: res.fechaCheckIn.toDate(),
                fechaCheckOut: res.fechaCheckOut.toDate(),
            })));
            return;
        }

        setLoading(true);
        // onSnapshot establece una escucha en tiempo real a la colección 'reservas'.
        // Cada vez que hay un cambio en Firestore, este código se ejecuta.
        const unsubscribe = onSnapshot(
            collection(db, "reservas"),
            (querySnapshot) => {
                const reservationsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    // Firestore almacena Timestamps, los convertimos a objetos Date de JS.
                    return {
                        id: doc.id,
                        ...data,
                        fechaCheckIn: data.fechaCheckIn.toDate(),
                        fechaCheckOut: data.fechaCheckOut.toDate(),
                    };
                });
                setReservations(reservationsData);
                setLoading(false);
            },
            (err) => {
                // Manejo de errores en la obtención de datos.
                console.error("Error fetching reservations: ", err);
                setError("No se pudieron cargar las reservas.");
                setLoading(false);
            }
        );

        // La función de limpieza se ejecuta cuando el componente se desmonta.
        // Esto previene fugas de memoria al cerrar la conexión con Firestore.
        return () => unsubscribe();
    }, []);

    return { reservations, loading, error };
};


// --- /src/context/ReservationsContext.jsx ---
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