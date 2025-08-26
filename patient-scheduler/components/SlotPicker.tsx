import { format } from "date-fns";
import type { AvailabilitySlot } from "@/types";


export default function SlotPicker({ slots, selected, onSelect }: {
    slots: AvailabilitySlot[];
    selected: AvailabilitySlot | null;
    onSelect: (s: AvailabilitySlot) => void;
}) {
    if (!slots?.length) return <p className="text-gray-600">No free slots for this date.</p>;
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {slots.map((s) => {
                const start = new Date(s.start);
                const end = new Date(s.end);
                const label = `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;
                const active = selected?.id === s.id;
                return (
                    <button key={s.id} onClick={() => onSelect(s)} className={`w-full rounded-2xl border p-4 text-left hover:border-brand-400 ${active ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"}`}>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-brand-600" />
                            <span className="font-medium">{label}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">{format(start, "EEEE, MMM d")}</div>
                    </button>
                );
            })}
        </div>
    );
}