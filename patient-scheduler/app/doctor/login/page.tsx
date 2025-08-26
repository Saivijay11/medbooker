"use client";
import { useState } from "react";
import Container from "../../../components/Container";
import { loginDoctor } from "../../../lib/doctorApi";
import { saveToken } from "../../../lib/auth";
import { useRouter } from "next/navigation";
import type { Route } from "next";

export default function DoctorLogin() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit() {
        try {
            setLoading(true);
            setErr(null);
            const token = await loginDoctor(email, pass);
            saveToken(token);
            const portal: Route = "/doctor/portal";
            router.push("/doctor/portal" as Route);
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
                    <div className="mt-6 grid gap-4">
                        <input className="input" placeholder="Email or username"
                            value={email} onChange={e => setEmail(e.target.value)} />
                        <input type="password" className="input" placeholder="Password"
                            value={pass} onChange={e => setPass(e.target.value)} />
                        {err && <p className="text-red-600 text-sm">{err}</p>}
                        <button onClick={onSubmit} disabled={loading} className="btn btn-primary">
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </Container>
    );
}
