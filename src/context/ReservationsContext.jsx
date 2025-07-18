import React, { createContext, useContext, useState, useMemo } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useReservations } from '../hooks/useReservations';
import { toast } from 'react-hot-toast';
import { parseISO, isBefore, startOfToday } from 'date-fns';

const ReservationsContext = createContext();

export const useReservationsContext = () => {
    return useContext(ReservationsContext);
};

export const ReservationsProvider = ({ children }) => {
    // 1. Obtenemos TODAS las reservas desde el hook.
    const { reservations, loading, error } = useReservations();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Filtramos y categorizamos las reservas aquí, en el contexto.
    const { upcomingReservations, pastReservations } = useMemo(() => {
        const today = startOfToday();
        const upcoming = reservations.filter(res => !isBefore(res.fechaCheckOut, today));
        const past = reservations.filter(res => isBefore(res.fechaCheckOut, today));
        return { upcomingReservations: upcoming, pastReservations: past };
    }, [reservations]);


    const addReservation = async (reservationData) => {
        if (!db) return toast.error("Firebase no está configurado.");
        setIsSubmitting(true);
        try {
            const dataToSave = {
                ...reservationData,
                fechaCheckIn: Timestamp.fromDate(parseISO(reservationData.fechaCheckIn)),
                fechaCheckOut: Timestamp.fromDate(parseISO(reservationData.fechaCheckOut)),
            };
            await addDoc(collection(db, "reservas"), dataToSave);
            toast.success("Reserva creada con éxito!");
        } catch (e) {
            console.error(e);
            toast.error("Error al crear la reserva.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateReservation = async (id, reservationData) => {
        if (!db) return toast.error("Firebase no está configurado.");
        setIsSubmitting(true);
        try {
             const dataToSave = {
                ...reservationData,
                fechaCheckIn: Timestamp.fromDate(parseISO(reservationData.fechaCheckIn)),
                fechaCheckOut: Timestamp.fromDate(parseISO(reservationData.fechaCheckOut)),
            };
            await updateDoc(doc(db, "reservas", id), dataToSave);
            toast.success("Reserva actualizada con éxito!");
        } catch (e) {
            console.error(e);
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

    // 3. Proveemos las listas ya filtradas al resto de la aplicación.
    const value = {
        upcomingReservations,
        pastReservations,
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
