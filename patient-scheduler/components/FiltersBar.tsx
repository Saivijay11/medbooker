"use client";
import { useEffect, useState } from "react";


export default function FiltersBar({ value, onChange }: {
    value: { name: string; specialization: string; state: string };
    onChange: (v: { name: string; specialization: string; state: string }) => void;
}) {
    const [local, setLocal] = useState(value);
    useEffect(() => setLocal(value), [value]);


    function apply() { onChange(local); }


    return (
        <div className="mt-6 card p-4">
            <div className="grid gap-4 md:grid-cols-4">
                <input className="input" placeholder="Search by name" value={local.name} onChange={e => setLocal(v => ({ ...v, name: e.target.value }))} />
                <input className="input" placeholder="Specialization (e.g. Cardiology)" value={local.specialization} onChange={e => setLocal(v => ({ ...v, specialization: e.target.value }))} />
                <input className="input" placeholder="State (e.g. CA)" value={local.state} onChange={e => setLocal(v => ({ ...v, state: e.target.value }))} />
                <div className="flex gap-2">
                    <button className="btn btn-primary w-full" onClick={apply}>Apply</button>
                    <button className="btn btn-ghost w-full" onClick={() => onChange({ name: "", specialization: "", state: "" })}>Reset</button>
                </div>
            </div>
        </div>
    );
}