import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// Este hook ahora solo se encarga de una cosa: obtener todas las reservas.
export const useReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            setError("La conexión con Firebase ha fallado.");
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(
            collection(db, "reservas"),
            (querySnapshot) => {
                const reservationsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        fechaCheckIn: data.fechaCheckIn?.toDate(),
                        fechaCheckOut: data.fechaCheckOut?.toDate(),
                    };
                }).filter(res => res.fechaCheckIn && res.fechaCheckOut);
                
                // Ordenar por fecha de check-in para asegurar consistencia
                reservationsData.sort((a, b) => a.fechaCheckIn - b.fechaCheckIn);

                setReservations(reservationsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error obteniendo las reservas: ", err);
                setError("No se pudieron cargar las reservas.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { reservations, loading, error };
};
