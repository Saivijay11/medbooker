// patient-scheduler/lib/api.ts
import type { Doctor, AvailabilitySlot } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "";

/** Build absolute URL (uses NEXT_PUBLIC_API_URL; falls back to window origin in dev) */
function buildURL(
    path: string,
    query?: Record<string, string | number | undefined>
) {
    const base =
        API || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const url = new URL(path, base);
    if (query) {
        for (const [k, v] of Object.entries(query)) {
            if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
        }
    }
    return url.toString();
}

type MaybePaginated<T> = T[] | { results: T[] };
const unwrap = <T,>(data: MaybePaginated<T>): T[] =>
    Array.isArray(data) ? data : (data as any).results ?? [];

/* ----------------------------- Public fetchers ---------------------------- */

export async function getDoctors(
    filters: Partial<{ name: string; specialization: string; state: string }>
): Promise<Doctor[]> {
    const res = await fetch(buildURL("/api/doctors/", filters), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load doctors");
    const data = (await res.json()) as MaybePaginated<Doctor>;
    return unwrap<Doctor>(data);
}

export async function getDoctor(id: string): Promise<Doctor> {
    const res = await fetch(buildURL(`/api/doctors/${id}/`), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load doctor");
    return res.json();
}

export async function getAvailability(id: string, date: string): Promise<AvailabilitySlot[]> {
    const res = await fetch(buildURL(`/api/doctors/${id}/availability/`, { date }), {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load availability");
    return res.json();
}

/* --------------------------------- Booking -------------------------------- */

/** Payload types match the backend serializer */
type BookAvailPayload = {
    doctorId: number | string;
    mode: "AVAILABILITY";
    availabilitySlotId: number;
    patient: { name: string; email: string; phone?: string };
};

type BookOnDemandPayload = {
    doctorId: number | string;
    mode: "ON_DEMAND";
    start: string; // ISO
    end: string;   // ISO
    patient: { name: string; email: string; phone?: string };
};

export type BookPayload = BookAvailPayload | BookOnDemandPayload;

export async function bookAppointment(payload: BookPayload): Promise<{ id: string | number }> {
    // DRF expects doctorId to be an integer
    const body = { ...payload, doctorId: Number(payload.doctorId) };

    const res = await fetch(buildURL(`/api/appointments/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        // bubble up backend-provided detail if present
        let msg = "Booking failed";
        try {
            const text = await res.text();
            try {
                const j = JSON.parse(text);
                msg = j.detail || j.error || text || msg;
            } catch {
                msg = text || msg;
            }
        } catch {
            /* ignore */
        }
        throw new Error(msg);
    }

    return res.json();
}
