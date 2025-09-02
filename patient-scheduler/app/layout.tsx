// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./AppShell";

export const metadata: Metadata = {
    title: "MedBooker ▢ Patient Appointments",
    description: "Book doctor appointments by availability or custom time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="antialiased bg-gray-50">
                <AppShell>{children}</AppShell>
            </body>
        </html>
    );
}
