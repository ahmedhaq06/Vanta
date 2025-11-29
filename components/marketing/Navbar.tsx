"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none" style={{marginTop: 0}}>
        <div className="badge-beta">Beta Product</div>
      </div>
      <header className="fixed left-0 right-0 z-50 transition-all duration-300" style={{ top: '2.5rem' }}>
        <div className={`relative mx-auto px-4 ${scrolled ? "max-w-md" : "max-w-6xl"}`}>
          <nav className={scrolled ? "" : "nav-shell"}>
            {!scrolled ? (
              <div className="grid grid-cols-3 items-center px-4 py-3 md:px-6 transition-all duration-300">
                <Link href="/" className="text-xl font-semibold tracking-wide">Vanta</Link>
                <div className="hidden md:flex gap-6 text-sm justify-center">
                  <a href="#product" className="hover:text-gray-300 transition-colors">Product</a>
                  <a href="#pricing" className="hover:text-gray-300 transition-colors">Pricing</a>
                  <a href="#about" className="hover:text-gray-300 transition-colors">About</a>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Link href="/login" className="btn-small hover:bg-white/10">Log In</Link>
                  <Link
                    href="/signup"
                    className="btn-small font-semibold text-white shadow-md"
                    style={{ minWidth: 90, backgroundColor: '#9475fc' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#7a5de0'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#9475fc'}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-2">
                <div className="nav-tabs" style={{ display: 'flex' }}>
                  <a href="#product" className="nav-tab">Product</a>
                  <a href="#pricing" className="nav-tab">Pricing</a>
                  <a href="#about" className="nav-tab">About</a>
                  <Link href="/login" className="nav-tab">Log In</Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
