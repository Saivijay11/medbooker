"use client";
import { useEffect, useState } from "react";
import Container from "../../../components/Container";
import { fetchMyDoctor, fetchMySlots, createMySlot, deleteMySlot } from "../../../lib/doctorApi";
import Link from "next/link";

type Slot = { id: number; start: string; end: string };

export default function DoctorPortal() {
    const [me, setMe] = useState<any>(null);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        try {
            setErr(null);
            const [d, s] = await Promise.all([fetchMyDoctor(), fetchMySlots()]);
            setMe(d);
            setSlots(Array.isArray(s) ? s : (s?.results ?? [])); // ← normalize
        } catch {
            setErr("Please login again.");
        }
    }

    useEffect(() => { load(); }, []);

    async function addSlot() {
        if (!start || !end) return;
        await createMySlot(new Date(start).toISOString(), new Date(end).toISOString());
        setStart(""); setEnd("");
        await load();
    }

    async function removeSlot(id: number) {
        await deleteMySlot(id);
        await load();
    }

    const slotList = Array.isArray(slots) ? slots : []; // ← guard for render

    return (
        <Container>
            <div className="py-8">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">My Availability</h1>
                    <Link href={"/doctor/calendar"} className="btn btn-ghost">Open calendar</Link>
                </div>

                {me && (
                    <p className="mb-4 text-gray-600">
                        {me.first_name} {me.last_name} · {me.specialization} · {me.state}
                    </p>
                )}
                {err && <p className="mb-4 text-red-600">{err}</p>}

                <div className="card p-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <input
                            type="datetime-local"
                            className="input"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                        />
                        <input
                            type="datetime-local"
                            className="input"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary mt-3" onClick={addSlot}>Add slot</button>

                    <h2 className="mt-6 text-lg font-semibold">Existing slots</h2>
                    {slotList.length === 0 && <p className="text-gray-600">No slots yet.</p>}
                    <ul className="space-y-2 mt-2">
                        {slotList.map((s) => (
                            <li key={s.id} className="flex items-center justify-between rounded border p-3">
                                <span className="text-sm">
                                    {new Date(s.start).toLocaleString()} — {new Date(s.end).toLocaleString()}
                                </span>
                                <button className="btn btn-ghost" onClick={() => removeSlot(s.id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Container>
    );
}
