import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";


export const metadata: Metadata = {
    title: "MedBooker – Patient Appointments",
    description: "Book doctor appointments by availability or custom time.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Header />
                <main className="min-h-[calc(100vh-72px)]">{children}</main>
                <footer className="border-t bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-500">
                        © {new Date().getFullYear()} MedBooker. For demo only.
                    </div>
                </footer>
            </body>
        </html>
    );
}