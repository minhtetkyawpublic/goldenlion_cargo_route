import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Box, Car, MapPinned, Menu, Route as RouteIcon } from 'lucide-react';
import { cn } from '../lib/cn';

function NavLink({ href, current, icon: Icon, children }) {
    return (
        <Link
            href={href}
            className={cn(
                'ui-nav-link inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium',
                current
                    ? 'bg-[#dbe6f5] text-[#112f52] shadow-sm'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
            )}
        >
            {Icon ? <Icon size={15} /> : null}
            <span>{children}</span>
        </Link>
    );
}

export default function AppLayout({ title, children }) {
    const page = usePage();
    const url = page.url || '';
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#e7ebef] px-3 py-4 text-[#0f172a] md:px-6 md:py-8">
            <div className="app-shell mx-auto rounded-[28px] border border-[#bcc5cf] bg-[#eef2f5] shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
                <header className="rounded-t-[28px] bg-[#103a67] px-4 py-3 text-white md:px-5">
                    <div className="flex items-center justify-between gap-4">
                        <Link href="/routes" className="ui-nav-link flex min-w-0 items-center gap-3 rounded-2xl px-1.5 py-1">
                            <img src="/assets/glicon.jpg" alt="Logo" className="h-10 w-10 rounded-full border border-white/15 object-cover" />
                            <div className="min-w-0">
                                <div className="truncate text-[1.05rem] font-semibold leading-5">Golden Lion</div>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-2 md:flex">
                            <NavLink href="/routes" current={url.startsWith('/routes')} icon={RouteIcon}>
                                Routes
                            </NavLink>
                            <NavLink href="/cars" current={url.startsWith('/cars')} icon={Car}>
                                Cars
                            </NavLink>
                            <NavLink href="/locations" current={url.startsWith('/locations')} icon={MapPinned}>
                                Locations
                            </NavLink>
                            <NavLink href="/stocks" current={url.startsWith('/stocks')} icon={Box}>
                                Stock
                            </NavLink>
                        </nav>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="ui-nav-link inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 md:hidden"
                                onClick={() => setMobileOpen(v => !v)}
                                aria-label="Open menu"
                            >
                                <Menu size={18} />
                            </button>
                        </div>
                    </div>

                    {mobileOpen ? (
                        <div className="mt-3 border-t border-white/10 pt-3 md:hidden">
                            <div className="flex flex-col gap-2">
                                <NavLink href="/routes" current={url.startsWith('/routes')} icon={RouteIcon}>
                                    Routes
                                </NavLink>
                                <NavLink href="/cars" current={url.startsWith('/cars')} icon={Car}>
                                    Cars
                                </NavLink>
                                <NavLink href="/locations" current={url.startsWith('/locations')} icon={MapPinned}>
                                    Locations
                                </NavLink>
                                <NavLink href="/stocks" current={url.startsWith('/stocks')} icon={Box}>
                                    Stock
                                </NavLink>
                            </div>
                        </div>
                    ) : null}
                </header>

                <main className="px-4 py-4 md:px-6 md:py-5">
                    {title ? <h1 className="mb-4 text-[1.55rem] font-semibold tracking-[-0.02em] text-[#111827] sm:text-[1.7rem] md:text-[1.85rem]">{title}</h1> : null}
                    {children}
                </main>
            </div>
        </div>
    );
}
