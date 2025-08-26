export default function CustomTimePicker({ value, onChange }: {
    value: { start: string; end: string };
    onChange: (v: { start: string; end: string }) => void;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div>
                <label className="label" htmlFor="start">Start time</label>
                <input id="start" type="datetime-local" className="input" value={value.start} onChange={e => onChange({ ...value, start: e.target.value })} />
            </div>
            <div>
                <label className="label" htmlFor="end">End time</label>
                <input id="end" type="datetime-local" className="input" value={value.end} onChange={e => onChange({ ...value, end: e.target.value })} />
            </div>
            <p className="text-sm text-gray-600 sm:col-span-2">Choose any time range that fits. The backend will validate against clinic rules and overlaps.</p>
        </div>
    );
}