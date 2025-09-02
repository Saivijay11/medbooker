// app/doctor/portal/calendar/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/Container";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import type {
    DateSelectArg,
    EventClickArg,
    DatesSetArg,
    EventApi,
} from "@fullcalendar/core/index.js";

import {
    fetchMyDoctor,
    fetchMySlots,
    fetchMyAppointments,
    createMySlot,
    deleteMySlot,
    updateMySlot,
} from "@/lib/doctorApi";

import Link from "next/link";

type Slot = { id: number; start: string; end: string };
type Appt = {
    id: number;
    start: string;
    end: string;
    patient_name: string;
    patient_email: string;
    status: string;
};

type EventDropArg = { event: EventApi; view: any };
type EventResizeDoneArg = { event: EventApi; view: any };

export default function DoctorCalendarPage() {
    const [me, setMe] = useState<any>(null);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [appts, setAppts] = useState<Appt[]>([]);
    const [error, setError] = useState<string | null>(null);
    const calRef = useRef<any>(null);

    // ▼ NEW: dropdown state — show only open slots (default) or all
    const [slotFilter, setSlotFilter] = useState<"open" | "all">("open");

    async function load(range?: { start: string; end: string }) {
        try {
            setError(null);
            const [d, s, a] = await Promise.all([
                fetchMyDoctor(),
                fetchMySlots(),
                fetchMyAppointments(range?.start, range?.end),
            ]);
            setMe(d);
            setSlots(Array.isArray(s) ? s : s.results ?? []);
            setAppts(Array.isArray(a) ? a : a.results ?? []);
        } catch {
            setError("Please login again.");
        }
    }

    useEffect(() => {
        load();
    }, []);

    const onDatesSet = (arg: DatesSetArg) => {
        load({ start: arg.start.toISOString(), end: arg.end.toISOString() });
    };

    const onSelect = async (sel: DateSelectArg) => {
        await createMySlot(
            new Date(sel.startStr).toISOString(),
            new Date(sel.endStr).toISOString()
        );
        await load({
            start: sel.view.activeStart.toISOString(),
            end: sel.view.activeEnd.toISOString(),
        });
    };

    const onEventClick = async (click: EventClickArg) => {
        const kind = (click.event.extendedProps as any)["kind"];
        if (kind === "slot") {
            if (confirm("Delete this slot?")) {
                await deleteMySlot(Number(click.event.id));
                await load({
                    start: click.view.activeStart.toISOString(),
                    end: click.view.activeEnd.toISOString(),
                });
            }
        } else {
            const p = click.event.extendedProps as any;
            alert(
                `Appointment\n\nPatient: ${p.patient_name}\nEmail: ${p.patient_email}\nStatus: ${p.status}\n\n${new Date(
                    click.event.start!
                ).toLocaleString()} - ${new Date(click.event.end!).toLocaleString()}`
            );
        }
    };

    const onEventDrop = async (info: EventDropArg) => {
        if ((info.event.extendedProps as any)["kind"] !== "slot") return;
        await updateMySlot(
            Number(info.event.id),
            info.event.start!.toISOString(),
            info.event.end!.toISOString()
        );
    };

    const onEventResize = async (info: EventResizeDoneArg) => {
        if ((info.event.extendedProps as any)["kind"] !== "slot") return;
        await updateMySlot(
            Number(info.event.id),
            info.event.start!.toISOString(),
            info.event.end!.toISOString()
        );
    };

    // ▼ NEW: client-side guard against overlap (used when slotFilter === "open")
    const openSlots = useMemo(() => {
        return slots.filter(
            (s) =>
                !appts.some(
                    (a) =>
                        new Date(s.start) < new Date(a.end) &&
                        new Date(s.end) > new Date(a.start)
                )
        );
    }, [slots, appts]);

    const slotsForEvents = slotFilter === "open" ? openSlots : slots;

    const events = [
        ...slotsForEvents.map((s) => ({
            id: String(s.id),
            start: s.start,
            end: s.end,
            title: "Available",
            backgroundColor: "#dbeafe",
            borderColor: "#93c5fd",
            editable: true,
            extendedProps: { kind: "slot" },
        })),
        ...appts.map((a) => ({
            id: `appt-${a.id}`,
            start: a.start,
            end: a.end,
            title: `Appointment · ${a.patient_name || ""}`,
            backgroundColor: "#fde68a",
            borderColor: "#f59e0b",
            editable: false,
            extendedProps: { kind: "appt", ...a },
        })),
    ];

    return (
        <Container>
            <div className="py-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">My Calendar</h1>
                        {me && (
                            <p className="text-gray-600">
                                {me.first_name} {me.last_name} · {me.specialization} · {me.state}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* ▼ NEW: the dropdown */}
                        <label className="text-sm text-gray-600">
                            Show{" "}
                            <select
                                className="input py-1"
                                value={slotFilter}
                                onChange={(e) =>
                                    setSlotFilter(e.target.value as "open" | "all")
                                }
                            >
                                <option value="open">Open slots only</option>
                                <option value="all">All slots</option>
                            </select>
                        </label>

                        <Link href="/doctor/portal" className="btn btn-ghost">
                            Back to portal
                        </Link>
                    </div>
                </div>

                {error && <p className="mb-4 text-red-600">{error}</p>}

                <div className="card p-2">
                    <FullCalendar
                        ref={calRef}
                        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "timeGridDay,timeGridWeek,dayGridMonth",
                        }}
                        allDaySlot={false}
                        selectable
                        selectMirror
                        select={onSelect}
                        events={events}
                        eventClick={onEventClick}
                        eventDrop={onEventDrop}
                        eventResize={onEventResize}
                        datesSet={onDatesSet}
                        height="auto"
                        slotDuration="00:30:00"
                    />
                </div>
            </div>
        </Container>
    );
}
