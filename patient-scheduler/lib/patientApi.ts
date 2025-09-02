// patient-scheduler/lib/patientApi.ts
const API = process.env.NEXT_PUBLIC_API_URL || "";

// plain fetch for public endpoints (no auth)
async function api(path: string, init?: RequestInit) {
    const res = await fetch(new URL(path, API).toString(), {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
        cache: "no-store",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// list + filters
export function listDoctors(q?: { name?: string; specialization?: string; state?: string }) {
    const url = new URL("/api/doctors/", API);
    if (q?.name) url.searchParams.set("name", q.name);
    if (q?.specialization) url.searchParams.set("specialization", q.specialization);
    if (q?.state) url.searchParams.set("state", q.state);
    return api(url.pathname + url.search);
}

export function getDoctor(id: string | number) {
    return api(`/api/doctors/${id}/`);
}

// availability for a given day
export function getDoctorAvailability(id: string | number, dateISO: string) {
    const url = new URL(`/api/doctors/${id}/availability/`, API);
    url.searchParams.set("date", dateISO);
    return api(url.pathname + url.search);
}

// create appointment (either by slot or on-demand)
export function createAppointment(payload: {
    doctorId: number;
    mode: "AVAILABILITY" | "ON_DEMAND";
    availabilitySlotId?: number;
    start?: string;
    end?: string;
    patient: { name: string; email: string; phone?: string };
}) {
    return api("/api/appointments/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
