import { getToken } from "./auth";
const API = process.env.NEXT_PUBLIC_API_URL || "";

async function authed(path: string, init?: RequestInit) {
    const token = getToken();
    const headers = new Headers(init?.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    const res = await fetch(new URL(path, API).toString(), { ...init, headers, cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export const loginDoctor = async (user: string, password: string) => {
    const res = await fetch(new URL("/api/auth/token/", API).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    return data.access as string;
};

export const fetchMyDoctor = () => authed("/api/me/doctor/");

export const fetchMySlots = async () => authed("/api/me/slots/");
export const createMySlot = (start: string, end: string) =>
    authed("/api/me/slots/", { method: "POST", body: JSON.stringify({ start, end }) });
export const updateMySlot = (id: number, start: string, end: string) =>
    authed(`/api/me/slots/${id}/`, { method: "PATCH", body: JSON.stringify({ start, end }) });
export const deleteMySlot = (id: number) =>
    authed(`/api/me/slots/${id}/`, { method: "DELETE" });

export const fetchMyAppointments = (startISO?: string, endISO?: string) => {
    const url = new URL("/api/me/appointments/", API);
    if (startISO) url.searchParams.set("start", startISO);
    if (endISO) url.searchParams.set("end", endISO);
    return authed(url.toString().replace(API, "")); // authed expects a path
};