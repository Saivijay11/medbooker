// components/SidebarLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarLink from "./SidebarLink";
import { getToken } from "@/lib/auth";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "/";
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        // if a doctor token exists in storage, consider authenticated
        try {
            setAuthed(Boolean(getToken()));
        } catch {
            setAuthed(false);
        }
    }, [pathname]);

    return (
        <div className="min-h-screen grid grid-cols-[260px_1fr]">
            <aside className="border-r bg-white/70 backdrop-blur p-4">
                <div className="font-semibold text-lg mb-4">MedBooker</div>
                <nav className="space-y-2">
                    {/* Always visible for patients */}
                    <SidebarLink href="/doctors">Book appointment</SidebarLink>

                    {/* Show login only when NOT authenticated */}
                    {!authed && <SidebarLink href="/doctor/login">Doctor login</SidebarLink>}

                    {/* Show portal only when authenticated */}
                    {authed && <SidebarLink href="/doctor/portal">Doctor portal</SidebarLink>}
                </nav>
            </aside>

            <main className="p-6 bg-gray-50">{children}</main>
        </div>
    );
}
