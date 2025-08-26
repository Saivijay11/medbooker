import Link from "next/link";
import type { Doctor } from "@/types";


export default function DoctorCard({ doctor }: { doctor: Doctor }) {
    return (
        <div className="card p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold">{doctor.first_name} {doctor.last_name}</h3>
                    <p className="text-gray-600">{doctor.specialization}</p>
                    <p className="text-gray-500 text-sm mt-1">{doctor.city}, {doctor.state}</p>
                </div>
                <Link className="btn btn-primary" href={`/doctors/${doctor.id}`}>Book</Link>
            </div>
        </div>
    );
}