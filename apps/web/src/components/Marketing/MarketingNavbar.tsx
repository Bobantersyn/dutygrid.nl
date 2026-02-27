"use client";

import { useState, useEffect } from "react";

export function MarketingNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [currentPath, setCurrentPath] = useState("/");

    useEffect(() => {
        setCurrentPath(window.location.pathname);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
        { href: "/", label: "Home" },
        { href: "/functies", label: "Functies" },
        { href: "/prijzen", label: "Prijzen" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <>
            <nav
                className="m-navbar"
                style={scrolled ? { background: "rgba(10, 15, 28, 0.95)" } : undefined}
            >
                <div className="m-navbar-inner">
                    <a href="/" className="m-navbar-logo">
                        <img src="/logo.png" alt="DutyGrid" />
                    </a>

                    <ul className="m-navbar-links">
                        {links.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    className={currentPath === link.href ? "active" : ""}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="m-navbar-cta" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <a href="/account/signin" style={{ color: 'var(--m-text-primary)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }} className="m-hidden-mobile">
                            Inloggen
                        </a>
                        <a href="/account/signup" className="m-btn m-btn-primary m-btn-sm">
                            Start 14 dagen gratis
                        </a>
                        <button
                            className={`m-hamburger ${mobileOpen ? "open" : ""}`}
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Menu openen"
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile slide-in menu */}
            <div className={`m-mobile-menu ${mobileOpen ? "open" : ""}`}>
                {links.map((link) => (
                    <a key={link.href} href={link.href}>
                        {link.label}
                    </a>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    <a href="/account/signup" className="m-btn m-btn-primary" style={{ justifyContent: 'center' }}>
                        Start 14 dagen gratis
                    </a>
                    <a href="/account/signin" className="m-btn m-btn-secondary" style={{ justifyContent: 'center' }}>
                        Inloggen
                    </a>
                </div>
            </div>
        </>
    );
}
