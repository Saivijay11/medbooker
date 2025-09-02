// app/doctor/portal/layout.tsx
"use client";

import RequireDoctorAuth from "@/components/RequireDoctorAuth";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return <RequireDoctorAuth>{children}</RequireDoctorAuth>;
}
