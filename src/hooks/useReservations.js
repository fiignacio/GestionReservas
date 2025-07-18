import { useState, useEffect } from 'react';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

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
                setReservations(reservationsData);
                setLoading(false);
                console.log(doc.data());
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
