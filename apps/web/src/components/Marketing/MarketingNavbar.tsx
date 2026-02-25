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
                        <span>DutyGrid</span>
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

                    <div className="m-navbar-cta">
                        <a href="/account/signin" className="m-btn m-btn-primary m-btn-sm">
                            Inloggen
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
                <a href="/account/signin" className="m-btn m-btn-primary">
                    Inloggen →
                </a>
            </div>
        </>
    );
}
