import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/AuthStore'

type CarouselSlide = {
    title: string
    subtitle: string
    image: string
    alt: string
}

const slides: CarouselSlide[] = [
    {
        title: 'Express Delivery For Everyday Care',
        subtitle: 'Order in minutes and get your medicines delivered with confidence.',
        image: '/home-slide-1.svg',
        alt: 'Medicine delivery banner',
    },
    {
        title: 'Only Trusted And Verified Stock',
        subtitle: 'Carefully sourced products with transparent details and quality checks.',
        image: '/home-slide-2.svg',
        alt: 'Trusted pharmacy banner',
    },
    {
        title: 'Wellness That Fits Your Routine',
        subtitle: 'Build healthier habits with essentials for every stage of care.',
        image: '/home-slide-3.svg',
        alt: 'Wellness routine banner',
    },
]

const keyHighlights = [
    {
        title: 'Quick Refills',
        text: 'Re-order your regular medicines in a few taps.',
    },
    {
        title: 'Safe Packaging',
        text: 'Secure and careful handling for every order.',
    },
    {
        title: 'Transparent Checkout',
        text: 'Simple order flow with clear totals and order history.',
    },
]

const careCategories = ['Daily Essentials', 'Immunity Support', 'Pain Relief', 'Women Wellness', 'Senior Care', 'First Aid']

export const HomeComponent = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const [activeSlide, setActiveSlide] = useState(0)

    useEffect(() => {
        const interval = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % slides.length)
        }, 4500)

        return () => window.clearInterval(interval)
    }, [])

    const currentSlide = useMemo(() => slides[activeSlide], [activeSlide])

    return (
        <main className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
                <div className="pointer-events-none absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-900/25" />
                <div className="pointer-events-none absolute left-[-90px] bottom-[-110px] h-56 w-56 rounded-full bg-emerald-200/35 blur-3xl dark:bg-emerald-900/30" />

                <div className="relative grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                    <div className="space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">Welcome To PharmaPlus</p>
                        <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl" style={{ fontFamily: 'Trebuchet MS, Verdana, sans-serif' }}>
                            {currentSlide.title}
                        </h1>
                        <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">{currentSlide.subtitle}</p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/pharma-plus/medicines" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                Explore Medicines
                            </Link>
                            <Link
                                to={isAuthenticated ? '/pharma-plus/cart' : '/pharma-plus/login'}
                                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                            >
                                {isAuthenticated ? 'Go To Cart' : 'Login To Start'}
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            {slides.map((slide, index) => (
                                <button
                                    key={slide.title}
                                    type="button"
                                    onClick={() => setActiveSlide(index)}
                                    className={`h-2.5 rounded-full transition-all ${activeSlide === index ? 'w-8 bg-emerald-600' : 'w-2.5 bg-slate-300 dark:bg-slate-700'}`}
                                    aria-label={`Show slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <img
                            src={currentSlide.image}
                            alt={currentSlide.alt}
                            className="h-[220px] w-full rounded-2xl object-cover shadow-md ring-1 ring-slate-200 transition-all duration-500 sm:h-[280px] dark:ring-slate-700"
                        />
                        <div className="absolute bottom-3 left-3 rounded-lg bg-slate-900/75 px-3 py-1.5 text-xs font-semibold text-white">
                            Slide {activeSlide + 1} / {slides.length}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {keyHighlights.map((item) => (
                    <article key={item.title} className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/95">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Trebuchet MS, Verdana, sans-serif' }}>{item.title}</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
                    </article>
                ))}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Trebuchet MS, Verdana, sans-serif' }}>Shop By Care Focus</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {careCategories.map((category) => (
                        <div key={category} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                            {category}
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-cyan-50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900/95 dark:to-slate-900/95 sm:grid-cols-3">
                <article>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Step 1</p>
                    <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">Find What You Need</h3>
                </article>
                <article>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Step 2</p>
                    <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">Add To Cart & Checkout</h3>
                </article>
                <article>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Step 3</p>
                    <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">Track In My Orders</h3>
                </article>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Trebuchet MS, Verdana, sans-serif' }}>Ready To Start?</h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                    Keep your essentials in one place and make your next purchase smoothly.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <Link to="/pharma-plus/medicines" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                        Browse Medicines
                    </Link>
                    <Link to="/pharma-plus/my-orders" className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300">
                        View My Orders
                    </Link>
                </div>
            </section>
        </main>
    )
}
