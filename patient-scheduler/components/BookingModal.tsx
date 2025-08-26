"use client";
import { useEffect } from "react";


export default function BookingModal({ open, onClose, title, children }: {
    open: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
}) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);


    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" onClick={onClose}>
            <div className="card max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold">{title}</h3>
                <div className="mt-3">{children}</div>
                <div className="mt-6 flex justify-end">
                    <button className="btn btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}