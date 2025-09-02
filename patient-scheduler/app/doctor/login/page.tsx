// app/doctor/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { loginDoctor } from "@/lib/doctorApi";
import { saveToken } from "@/lib/auth";

export default function DoctorLogin() {
    const [username, setUsername] = useState("");
    const [pass, setPass] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            setErr(null);
            const token = await loginDoctor(username, pass); // your API expects { username, password }
            saveToken(token);
            router.replace("/doctor/portal"); // <- redirect to portal
        } catch (e: any) {
            setErr(e?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container>
            <div className="py-10">
                <div className="card mx-auto max-w-md p-6">
                    <h1 className="text-2xl font-semibold">Doctor Login</h1>
                    <p className="mt-2 text-gray-600">Sign in to manage your availability.</p>

                    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                        <input
                            className="input"
                            placeholder="Username or email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                        <input
                            type="password"
                            className="input"
                            placeholder="Password"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            autoComplete="current-password"
                        />
                        {err && <p className="text-red-600 text-sm">{err}</p>}
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </form>
                </div>
            </div>
        </Container>
    );
}
