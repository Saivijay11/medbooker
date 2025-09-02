// app/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import Header from "@/components/Header";

function PublicChrome({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="min-h-[calc(100vh-72px)]">{children}</main>
            <footer className="border-t bg-white">
                <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-500">
                    © {new Date().getFullYear()} MedBooker. For demo only.
                </div>
            </footer>
        </>
    );
}

/**
 * Only these prefixes get the sidebar chrome.
 * - Patient booking: /doctors
 * - Doctor portal:   /doctor/portal
 * If you kept calendar outside portal, also add "/doctor/calendar".
 */
const SIDEBAR_PREFIXES = ["/doctors", "/doctor/portal"]; // add "/doctor/calendar" only if needed

/** Routes that must never show the sidebar */
const NO_SIDEBAR = ["/doctor/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "/";

    const isBlocked = NO_SIDEBAR.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );

    const allowSidebar = SIDEBAR_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );

    const showSidebar = !isBlocked && allowSidebar;

    return showSidebar ? (
        <SidebarLayout>{children}</SidebarLayout>
    ) : (
        <PublicChrome>{children}</PublicChrome>
    );
}
