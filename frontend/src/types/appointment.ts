// Tipo basado en el DTO que usa el backend para citas
// Se usa para tipar la respuesta del servicio y la tabla
export interface Appointment {
    id: number;
    appointmentType: string;
    startDateTime: string;
    professionalName: string;
    professionalId: number;
    clientId: number;
    clientName: string;
    clientSurname: string;
    clientFullName: string;
    bodyPlacement: string | null;
    ideaDescription: string;
    firstTime: boolean;
    tattooSize: string | null;
    referenceImageUrl: string | null;
    durationMinutes: number;
    state: string;
    depositPaid: boolean;
    showroomTattooCreated: boolean;
    showroomTattooId: number | null;
}