import Link from "next/link";
import Container from "@/components/Container";


export default function Home() {
    return (
        <>
            <section className="relative isolate">
                <div className="bg-gradient-to-b from-brand-50 to-white">
                    <Container>
                        <div className="grid items-center gap-10 py-20 md:grid-cols-2">
                            <div>
                                <h1 className="text-4xl font-semibold tracking-tight text-brand-800 md:text-5xl">
                                    Book an appointment with trusted doctors.
                                </h1>
                                <p className="mt-4 text-lg text-gray-600">
                                    Search by name, specialization, or state. Choose a preset slot or
                                    request a custom time.
                                </p>
                                <div className="mt-8 flex gap-3">
                                    <Link href="/doctors" className="btn btn-primary">Browse doctors</Link>
                                    <a href="#how" className="btn btn-ghost">How it works</a>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="card p-6">
                                    <div className="h-64 rounded-xl bg-[url('https://images.unsplash.com/photo-1583912267550-fb2b0c3ecf50?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
                                    <p className="mt-3 text-sm text-gray-500">Calm, clean, accessible UI inspired by major health systems.</p>
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>
            </section>


            <section id="how" className="py-16">
                <Container>
                    <h2 className="text-2xl font-semibold">How it works</h2>
                    <div className="mt-6 grid gap-6 md:grid-cols-3">
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold">1) Find a doctor</h3>
                            <p className="mt-2 text-gray-600">Filter by name, specialization, and state.</p>
                        </div>
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold">2) Pick time</h3>
                            <p className="mt-2 text-gray-600">Choose from available slots or request a custom time.</p>
                        </div>
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold">3) Confirm</h3>
                            <p className="mt-2 text-gray-600">Instant confirmation on screen; email sent by backend.</p>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}