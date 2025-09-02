// components/RequireDoctorAuth.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { fetchMyDoctor } from "@/lib/doctorApi";

export default function RequireDoctorAuth({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [ok, setOk] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.replace("/doctor/login");
            return;
        }
        let cancelled = false;
        fetchMyDoctor()
            .then(() => !cancelled && setOk(true))
            .catch(() => router.replace("/doctor/login"));
        return () => {
            cancelled = true;
        };
    }, [router]);

    if (!ok) {
        return <div className="py-12 text-center text-gray-600">Checking your session…</div>;
    }
    return <>{children}</>;
}
