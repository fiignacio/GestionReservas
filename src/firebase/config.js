const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa Firebase y Firestore.
// Se exportan para ser usados en otras partes de la aplicación.
// Se comprueba si las variables de entorno están presentes para evitar errores.
let app;
let db;
if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} else {
    console.error("Firebase config not found. Please set up your .env.local file.");
}

// --- /src/hooks/useReservations.js ---
// Hook personalizado para encapsular toda la lógica de interacción con Firestore.
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
