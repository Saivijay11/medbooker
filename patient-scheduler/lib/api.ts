// lib/api.ts
import type { Doctor, AvailabilitySlot } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "";

function buildURL(path: string, query?: Record<string, string | number | undefined>) {
    const url = new URL(path, API || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"));
    if (query) Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    });
    return url.toString();
}

type MaybePaginated<T> = T[] | { results: T[] };

function unwrap<T>(data: MaybePaginated<T>): T[] {
    // if backend returns pagination, grab results; else assume array
    return Array.isArray(data) ? data : (data as any).results ?? [];
}

export async function getDoctors(filters: Partial<{ name: string; specialization: string; state: string }>): Promise<Doctor[]> {
    const res = await fetch(buildURL("/api/doctors/", filters), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load doctors");
    const data = await res.json() as MaybePaginated<Doctor>;
    return unwrap<Doctor>(data);
}

export async function getDoctor(id: string): Promise<Doctor> {
    const res = await fetch(buildURL(`/api/doctors/${id}/`), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load doctor");
    return res.json();
}

export async function getAvailability(id: string, date: string): Promise<AvailabilitySlot[]> {
    const res = await fetch(buildURL(`/api/doctors/${id}/availability/`, { date }), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load availability");
    return res.json();
}

export async function bookAppointment(payload: any): Promise<{ id: string }> {
    const res = await fetch(buildURL(`/api/appointments/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Booking failed");
    return res.json();
}
