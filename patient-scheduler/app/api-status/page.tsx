"use client";
import { useEffect, useState } from "react";
import Container from "@/components/Container";
import { getDoctors } from "@/lib/api";


export default function ApiStatus() {
    const [ok, setOk] = useState<string>("Checking…");
    useEffect(() => { getDoctors({}).then(() => setOk("OK"), e => setOk(String(e))); }, []);
    return <Container><div className="py-10">API status: <b>{ok}</b></div></Container>;
}