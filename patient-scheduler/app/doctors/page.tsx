"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import FiltersBar from "@/components/FiltersBar";
import DoctorCard from "@/components/DoctorCard";
import { getDoctors } from "@/lib/api";
import type { Doctor } from "@/types";


export default function DoctorsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filters, setFilters] = useState({ name: "", specialization: "", state: "" });


    useEffect(() => {
        setLoading(true);
        getDoctors(filters)
            .then(setDoctors)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, [filters]);


    return (
        <Container>
            <div className="py-10">
                <div className="flex items-baseline justify-between">
                    <h1 className="text-2xl font-semibold">Browse doctors</h1>
                    <Link href="/" className="text-sm text-brand-700 underline">Back to home</Link>
                </div>
                <FiltersBar value={filters} onChange={setFilters} />


                {loading && <p className="mt-6 text-gray-600">Loading…</p>}
                {error && <p className="mt-6 text-red-600">{error}</p>}


                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {doctors.map((d) => (
                        <DoctorCard key={d.id} doctor={d} />
                    ))}
                </div>


                {!loading && doctors.length === 0 && (
                    <p className="mt-8 text-gray-600">No doctors match your filters.</p>
                )}
            </div>
        </Container>
    );
}