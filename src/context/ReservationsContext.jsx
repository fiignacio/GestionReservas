import React, { createContext, useContext, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useReservations } from '../hooks/useReservations';
import { toast } from 'react-hot-toast';
import { parseISO } from 'date-fns';

const ReservationsContext = createContext();

export const useReservationsContext = () => {
    return useContext(ReservationsContext);
};

export const ReservationsProvider = ({ children }) => {
    const { reservations, loading, error } = useReservations();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addReservation = async (reservationData) => {
        if (!db) return toast.error("Firebase no está configurado.");
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "reservas"), {
                ...reservationData,
                fechaCheckIn: Timestamp.fromDate(parseISO(reservationData.fechaCheckIn)),
                fechaCheckOut: Timestamp.fromDate(parseISO(reservationData.fechaCheckOut)),
            });
            toast.success("Reserva creada con éxito!");
        } catch (e) {
            toast.error("Error al crear la reserva.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateReservation = async (id, reservationData) => {
        if (!db) return toast.error("Firebase no está configurado.");
        setIsSubmitting(true);
        try {
            await updateDoc(doc(db, "reservas", id), {
                ...reservationData,
                fechaCheckIn: Timestamp.fromDate(parseISO(reservationData.fechaCheckIn)),
                fechaCheckOut: Timestamp.fromDate(parseISO(reservationData.fechaCheckOut)),
            });
            toast.success("Reserva actualizada con éxito!");
        } catch (e) {
            toast.error("Error al actualizar la reserva.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteReservation = async (id) => {
        if (!db) return toast.error("Firebase no está configurado.");
        setIsSubmitting(true);
        try {
            await deleteDoc(doc(db, "reservas", id));
            toast.success("Reserva eliminada con éxito!");
        } catch (e) {
            toast.error("Error al eliminar la reserva.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
