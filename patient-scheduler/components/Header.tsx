"use client";
import Link from "next/link";
import Image from "next/image";


export default function Header() {
    return (
        <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
            <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="MedBooker" width={28} height={28} />
                    <span className="text-xl font-semibold tracking-tight">MedBooker</span>
                </Link>
                <nav className="flex items-center gap-3">
                    <Link href="/doctors" className="btn btn-ghost">Browse doctors</Link>
                    <Link href="/doctor/login" className="btn btn-primary">Doctor login</Link>
                </nav>
            </div>
        </header>
    );
}