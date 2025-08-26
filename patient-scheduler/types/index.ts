export type Doctor = {
    id: string | number;
    practitioner_id?: string;
    first_name: string;
    last_name: string;
    specialization: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
};


export type AvailabilitySlot = {
    id: string | number;
    start: string; // ISO datetime
    end: string; // ISO datetime
};