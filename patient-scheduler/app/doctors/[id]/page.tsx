"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Container from "../../../components/Container";
import SlotPicker from "../../../components/SlotPicker";
import CustomTimePicker from "../../../components/CustomTimePicker";
import BookingModal from "../../../components/BookingModal";
import { getDoctor, getAvailability, bookAppointment } from "../../../lib/api";
import type { BookPayload } from "../../../lib/api";
import type { AvailabilitySlot, Doctor } from "../../../types";

export default function DoctorDetailPage() {
    const params = useParams<{ id: string }>();
    const id = String(params?.id || "");

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [date, setDate] = useState<string>(() =>
        new Date().toISOString().slice(0, 10)
    );
    const [tab, setTab] = useState<"SLOTS" | "CUSTOM">("SLOTS");
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // booking state
    const [patient, setPatient] = useState({ name: "", email: "", phone: "" });
    const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
    const [custom, setCustom] = useState<{ start: string; end: string }>({
        start: "",
        end: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // fetch doctor + availability
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        Promise.all([getDoctor(id), getAvailability(id, date)])
            .then(([doc, avail]) => {
                setDoctor(doc);
                setSlots(avail);
            })
            .catch((e: any) => setError(e?.message || "Failed to load"))
            .finally(() => setLoading(false));
    }, [id, date]);

    const canBook = useMemo(() => {
        if (!patient.name || !patient.email) return false;
        if (tab === "SLOTS") return Boolean(selectedSlot);
        return Boolean(custom.start && custom.end);
    }, [patient, selectedSlot, custom, tab]);

    async function onBook() {
        try {
            setSubmitError(null);

            let payload: BookPayload;

            if (tab === "SLOTS") {
                if (!selectedSlot) throw new Error("No slot selected");

                // Build AVAILABILITY payload as its own const
                const availPayload = {
                    doctorId: Number(id),
                    mode: "AVAILABILITY" as const,
                    availabilitySlotId: Number(selectedSlot.id),
                    patient,
                };

                payload = availPayload; // satisfies BookPayload via discriminant
            } else {
                // Build ON_DEMAND payload as its own const
                const onDemandPayload = {
                    doctorId: Number(id),
                    mode: "ON_DEMAND" as const,
                    start: custom.start, // ensure ISO string
                    end: custom.end,     // ensure ISO string
                    patient,
                };

                payload = onDemandPayload; // satisfies BookPayload via discriminant
            }

            await bookAppointment(payload);
            if (tab === "SLOTS" && selectedSlot) {
                setSlots(prev => prev.filter(s => s.id !== selectedSlot.id));
                setSelectedSlot(null);
            }
            setShowModal(true);
        } catch (e: any) {
            setSubmitError(e?.message || "Booking failed");
        }
    }

    return (
        <Container>
            <div className="py-10">
                {loading && <p>Loading…</p>}
                {error && <p className="text-red-600">{error}</p>}

                {doctor && (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* left column */}
                        <div className="lg:col-span-2">
                            <div className="card p-6">
                                <h1 className="text-2xl font-semibold">
                                    {doctor.first_name} {doctor.last_name}
                                </h1>
                                <p className="mt-1 text-gray-600">
                                    {doctor.specialization} · {doctor.state}
                                </p>

                                <div className="mt-6 flex items-center gap-3">
                                    <label className="label" htmlFor="date">
                                        Select date
                                    </label>
                                    <input
                                        id="date"
                                        type="date"
                                        className="input max-w-xs"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <button
                                        onClick={() => setTab("SLOTS")}
                                        className={`btn ${tab === "SLOTS" ? "btn-primary" : "btn-ghost"}`}
                                    >
                                        Available Slots
                                    </button>
                                    <button
                                        onClick={() => setTab("CUSTOM")}
                                        className={`btn ${tab === "CUSTOM" ? "btn-primary" : "btn-ghost"}`}
                                    >
                                        Custom Time
                                    </button>
                                </div>

                                <div className="mt-6">
                                    {tab === "SLOTS" ? (
                                        <SlotPicker
                                            slots={slots}
                                            selected={selectedSlot}
                                            onSelect={setSelectedSlot}
                                        />
                                    ) : (
                                        <CustomTimePicker value={custom} onChange={setCustom} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* right column */}
                        <aside className="card h-max p-6">
                            <h2 className="text-lg font-semibold">Patient Information</h2>
                            <div className="mt-4 grid gap-4">
                                <div>
                                    <label className="label">Full Name *</label>
                                    <input
                                        className="input"
                                        placeholder="Enter your full name"
                                        value={patient.name}
                                        onChange={(e) =>
                                            setPatient((p) => ({ ...p, name: e.target.value }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="label">Email *</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="you@example.com"
                                        value={patient.email}
                                        onChange={(e) =>
                                            setPatient((p) => ({ ...p, email: e.target.value }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="label">Phone</label>
                                    <input
                                        className="input"
                                        placeholder="(555) 555-5555"
                                        value={patient.phone}
                                        onChange={(e) =>
                                            setPatient((p) => ({ ...p, phone: e.target.value }))
                                        }
                                    />
                                </div>

                                {submitError && (
                                    <p className="text-sm text-red-600">{submitError}</p>
                                )}

                                <button
                                    disabled={!canBook}
                                    onClick={onBook}
                                    className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Book appointment
                                </button>
                                <p className="text-xs text-gray-500">
                                    Confirmation will appear on screen and email will be sent
                                    by the backend.
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </div>

            <BookingModal
                open={showModal}
                onClose={() => setShowModal(false)}
                title="Appointment booked!"
            >
                <p className="text-gray-700">
                    Your appointment has been scheduled. A confirmation email will be sent
                    to the patient address you provided.
                </p>
            </BookingModal>
        </Container>
    );
}
