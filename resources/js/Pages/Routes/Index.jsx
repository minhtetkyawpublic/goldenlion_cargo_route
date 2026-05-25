import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import ConfirmDialog from '../../Components/ConfirmDialog';
import { EllipsisVertical, Plus, Trash2 } from 'lucide-react';
import { useAppPath } from '../../lib/url';

function Pagination({ links }) {
    if (!links || links.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {links.map(link => (
                <button
                    key={link.label}
                    type="button"
                    disabled={!link.url}
                    onClick={() => {
                        if (link.url) router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                    }}
                    className={
                        link.active
                            ? 'ui-action-primary rounded-xl px-3 py-1.5 text-sm'
                            : 'ui-action-secondary rounded-xl border px-3 py-1.5 text-sm disabled:opacity-40'
                    }
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}

export default function Index({ routes, cars, locations, filters }) {
    const appPath = useAppPath();
    const form = useForm({
        car_id: filters.car_id || '',
        location_id: filters.location_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });
    const [deleteRoute, setDeleteRoute] = React.useState(null);
    const [openMenu, setOpenMenu] = React.useState(null);

    React.useEffect(() => {
        if (!openMenu) return;

        const closeMenu = () => setOpenMenu(null);
        const onKeyDown = event => {
            if (event.key === 'Escape') closeMenu();
        };

        window.addEventListener('click', closeMenu);
        window.addEventListener('resize', closeMenu);
        window.addEventListener('scroll', closeMenu, true);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('click', closeMenu);
            window.removeEventListener('resize', closeMenu);
            window.removeEventListener('scroll', closeMenu, true);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [openMenu]);

    const data = routes?.data ?? [];

    const money = n => {
        const num = Number(n ?? 0);
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    };

    const isFinished = route => {
        const carLoc = route.car?.current_location_id ?? null;
        const mainBase = route.origin_location_id ?? null;
        if (carLoc !== null && mainBase !== null) return String(carLoc) === String(mainBase);
        return route.status === 'finished' || !!route.ended_at;
    };

    const statusBadge = route => {
        const finished = isFinished(route);
        if (finished) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dff4df] px-2.5 py-1 text-[11px] font-medium text-[#24613b]">
                    <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                    Finished
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4efff] px-2.5 py-1 text-[11px] font-medium text-[#2f5a96]">
                <span className="h-2 w-2 rounded-full bg-[#0284c7]" />
                On Way
            </span>
        );
    };

    return (
        <AppLayout title="Routes">
            <Head title="Routes" />

            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-slate-600">Route totals are for the whole route, including outbound and return.</div>
                <Link href={appPath('/routes/create')} className="ui-action-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium">
                    New Route
                </Link>
            </div>

            <div className="mb-4 rounded-2xl border border-[#cfd7df] bg-[#f8fafb] p-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                <form
                    className="grid grid-cols-1 items-end gap-3 md:grid-cols-4"
                    onSubmit={e => {
                        e.preventDefault();
                        router.get(appPath('/routes'), form.data, { preserveState: true, replace: true });
                    }}
                >
                    <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Car</label>
                        <select
                            className="mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm"
                            value={form.data.car_id}
                            onChange={e => form.setData('car_id', e.target.value)}
                        >
                            <option value="">All</option>
                            {cars.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.plate_number}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Location</label>
                        <select
                            className="mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm"
                            value={form.data.location_id}
                            onChange={e => form.setData('location_id', e.target.value)}
                        >
                            <option value="">All</option>
                            {locations.map(location => (
                                <option key={location.id} value={location.id}>
                                    {location.name} {location.type ? `(${location.type})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">From</label>
                        <input
                            type="date"
                            className="mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm"
                            value={form.data.date_from}
                            onChange={e => form.setData('date_from', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">To</label>
                        <input
                            type="date"
                            className="mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm"
                            value={form.data.date_to}
                            onChange={e => form.setData('date_to', e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-4 flex flex-wrap gap-2">
                        <button type="submit" className="ui-action-primary rounded-xl px-4 py-2 text-sm font-medium">
                            Apply
                        </button>
                        <button
                            type="button"
                            className="ui-action-secondary rounded-xl border px-4 py-2 text-sm"
                            onClick={() => router.get(appPath('/routes'), {}, { preserveState: true, replace: true })}
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#cfd7df] bg-[#f8fafb] shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                <table className="min-w-full text-sm">
                    <thead className="bg-[#eef3f7]">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">ID</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Car</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Located At</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-600">Cargo</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-600">Expenses</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-600">Profit</th>
                            <th className="w-14 px-4 py-3 text-right font-medium text-slate-600"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(r => {
                            const cargoTotal = Number(r.cargo_total ?? 0);
                            const expenseTotal = Number(r.expense_total ?? 0);
                            const profit = cargoTotal - expenseTotal;

                            return (
                                <tr
                                    key={r.id}
                                    className="cursor-pointer border-t border-[#e0e5ea] bg-white transition-colors hover:bg-slate-50"
                                    onClick={() => router.visit(appPath(`/routes/${r.id}`), { preserveScroll: true })}
                                >
                                    <td className="px-4 py-3 font-medium text-slate-900">#{r.id}</td>
                                    <td className="px-4 py-3">{statusBadge(r)}</td>
                                    <td className="px-4 py-3 text-slate-700">{r.car?.plate_number}</td>
                                    <td className="px-4 py-3 text-slate-700">{r.car?.current_location?.name || '-'}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{money(cargoTotal)}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{money(expenseTotal)}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{money(profit)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="relative inline-block text-left">
                                            <button
                                                type="button"
                                                className="ui-action-secondary inline-flex h-9 w-9 items-center justify-center rounded-lg border"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setOpenMenu(current =>
                                                        current?.id === r.id
                                                            ? null
                                                            : {
                                                                  id: r.id,
                                                                  top: rect.bottom + 8,
                                                                  left: Math.max(16, rect.right - 160),
                                                              }
                                                    );
                                                }}
                                            >
                                                <EllipsisVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {data.length === 0 ? (
                            <tr>
                                <td className="px-4 py-8 text-slate-500" colSpan={8}>
                                    No routes yet.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <Pagination links={routes?.links ?? []} />
            </div>

            {openMenu ? (
                <div
                    className="fixed z-40 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                    style={{ top: openMenu.top, left: openMenu.left }}
                    onClick={e => e.stopPropagation()}
                >
                    {!isFinished(data.find(route => route.id === openMenu.id) || {}) ? (
                        <Link
                            href={appPath(`/routes/${openMenu.id}/return`)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setOpenMenu(null)}
                        >
                            <Plus size={14} />
                            Add Route
                        </Link>
                    ) : null}
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                        onClick={() => {
                            const route = data.find(item => item.id === openMenu.id);
                            setOpenMenu(null);
                            if (route) setDeleteRoute(route);
                        }}
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            ) : null}

            <ConfirmDialog
                open={!!deleteRoute}
                title="Delete Route"
                message={
                    deleteRoute
                        ? `Delete route #${deleteRoute.id}? This will remove cargos, expenses, and related route records.`
                        : ''
                }
                onClose={() => setDeleteRoute(null)}
                onConfirm={() => {
                    if (!deleteRoute) return;
                    setOpenMenu(null);
                    router.delete(appPath(`/routes/${deleteRoute.id}`), {
                        preserveScroll: true,
                        onSuccess: () => setDeleteRoute(null),
                    });
                }}
            />
        </AppLayout>
    );
}
