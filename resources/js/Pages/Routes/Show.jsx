import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

function Money({ value }) {
    const num = Number(value ?? 0);
    const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    return <span>{formatted}</span>;
}

function StatusBadge({ status, endedAt }) {
    const isFinished = status === 'finished' || !!endedAt;
    if (isFinished) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-medium text-[#166534]">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                Finished
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-2.5 py-1 text-xs font-medium text-[#075985]">
            <span className="h-2 w-2 rounded-full bg-[#0284c7]" />
            On Way
        </span>
    );
}

function formatDirection(direction) {
    if (!direction) return '-';
    return direction.charAt(0).toUpperCase() + direction.slice(1);
}

function sumValues(items, key) {
    return items.reduce((total, item) => total + Number(item?.[key] ?? 0), 0);
}

function sortByNewest(items) {
    return [...items].sort((a, b) => (a.id > b.id ? -1 : 1));
}

function VoucherSection({ title, leg, cargos, expenses, fallbackFrom, fallbackTo, accentClasses, emptyLabel }) {
    const cargoTotal = sumValues(cargos, 'total_price');
    const expenseTotal = sumValues(expenses, 'amount');
    const sectionProfit = cargoTotal - expenseTotal;
    const fromName = leg?.from_location?.name || fallbackFrom || '-';
    const toName = leg?.to_location?.name || fallbackTo || '-';
    const hasContent = !!leg || cargos.length > 0 || expenses.length > 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className={`border-b px-5 py-4 ${accentClasses}`}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">
                            <span>{fromName}</span>
                            <span className="text-slate-400">to</span>
                            <span>{toName}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-white/80 px-3 py-1">Leg #{leg?.sequence ?? '-'}</span>
                            <span className="rounded-full bg-white/80 px-3 py-1">{formatDirection(leg?.direction)}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:text-right">
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">Started</div>
                            <div className="font-medium text-slate-900">{leg?.started_at || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">Ended</div>
                            <div className="font-medium text-slate-900">{leg?.ended_at || '-'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Cargo Total</div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                        <Money value={cargoTotal} /> MMK
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Expense Total</div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                        <Money value={expenseTotal} /> MMK
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Profit</div>
                    <div className={`mt-1 text-xl font-semibold ${sectionProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        <Money value={sectionProfit} /> MMK
                    </div>
                </div>
            </div>

            {!hasContent ? (
                <div className="px-5 py-8 text-sm text-slate-500">{emptyLabel}</div>
            ) : (
                <div className="space-y-6 px-5 py-5">
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">Cargo Items</h3>
                            <span className="text-xs text-slate-500">{cargos.length} item(s)</span>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                                        <th className="px-4 py-3 text-right font-medium text-slate-600">Qty</th>
                                        <th className="px-4 py-3 text-right font-medium text-slate-600">Unit Price</th>
                                        <th className="px-4 py-3 text-right font-medium text-slate-600">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargos.length > 0 ? (
                                        cargos.map(cargo => (
                                            <tr key={cargo.id} className="border-t border-slate-200">
                                                <td className="px-4 py-3 text-slate-700">{cargo.cargo_type || '-'}</td>
                                                <td className="px-4 py-3 text-slate-700">{cargo.description || '-'}</td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {Number(cargo.quantity ?? 0).toFixed(3)} {cargo.unit || ''}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    <Money value={cargo.unit_price} /> MMK
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                    <Money value={cargo.total_price} /> MMK
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="px-4 py-6 text-slate-500" colSpan={5}>
                                                No cargos yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">Expense Items</h3>
                            <span className="text-xs text-slate-500">{expenses.length} item(s)</span>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Paid At</th>
                                        <th className="px-4 py-3 text-right font-medium text-slate-600">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length > 0 ? (
                                        expenses.map(expense => (
                                            <tr key={expense.id} className="border-t border-slate-200">
                                                <td className="px-4 py-3 text-slate-700">{expense.category || '-'}</td>
                                                <td className="px-4 py-3 text-slate-700">{expense.description || '-'}</td>
                                                <td className="px-4 py-3 text-slate-700">{expense.paid_at || '-'}</td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                    <Money value={expense.amount} /> MMK
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="px-4 py-6 text-slate-500" colSpan={4}>
                                                No expenses yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default function Show({ route, cargo_total, expense_total, profit }) {
    const legs = route.legs || [];

    const voucherSections = useMemo(() => {
        const sortedLegs = [...legs].sort((a, b) => Number(a.sequence ?? 0) - Number(b.sequence ?? 0));
        const cargos = sortByNewest(route.cargos || []);
        const expenses = sortByNewest(route.expenses || []);

        const outboundLeg = sortedLegs.find(leg => leg.direction === 'outbound') || null;
        const returnLeg = sortedLegs.find(leg => leg.direction === 'return') || null;

        return {
            outbound: {
                leg: outboundLeg,
                cargos: cargos.filter(item => item.leg?.direction === 'outbound'),
                expenses: expenses.filter(item => item.leg?.direction === 'outbound'),
            },
            returnTrip: {
                leg: returnLeg,
                cargos: cargos.filter(item => item.leg?.direction === 'return'),
                expenses: expenses.filter(item => item.leg?.direction === 'return'),
            },
        };
    }, [legs, route.cargos, route.expenses]);

    return (
        <AppLayout title={null}>
            <Head title={`Route #${route.id}`} />

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Route Detail</div>
                    <h1 className="mt-2 text-2xl font-semibold text-slate-900">Route #{route.id}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                            Car: {route.car?.plate_number || '-'}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                            {route.origin_location?.name || '-'} to {route.destination_location?.name || '-'}
                        </span>
                        <StatusBadge status={route.status} endedAt={route.ended_at} />
                    </div>
                </div>

                <Link
                    href="/routes"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    Back to routes
                </Link>
            </div>

            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-900">Route Summary</div>
                <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                    <div className="space-y-4 border-b border-slate-200 px-5 py-5 md:border-b-0 md:border-r">
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">Car</div>
                            <div className="mt-1 text-sm font-medium text-slate-900">{route.car?.plate_number || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">Started At</div>
                            <div className="mt-1 text-sm font-medium text-slate-900">{route.started_at || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">Ended At</div>
                            <div className="mt-1 text-sm font-medium text-slate-900">{route.ended_at || '-'}</div>
                        </div>
                    </div>
                    <div className="space-y-4 px-5 py-5">
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">Origin</div>
                            <div className="mt-1 text-sm font-medium text-slate-900">{route.origin_location?.name || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">Destination</div>
                            <div className="mt-1 text-sm font-medium text-slate-900">{route.destination_location?.name || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">Status</div>
                            <div className="mt-2">
                                <StatusBadge status={route.status} endedAt={route.ended_at} />
                            </div>
                        </div>
                    </div>
                </div>
                {route.notes ? (
                    <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                        <div className="text-xs uppercase tracking-wide text-slate-500">Notes</div>
                        <div className="mt-1 text-sm text-slate-700">{route.notes}</div>
                    </div>
                ) : null}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Cargo total</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">
                        <Money value={cargo_total} /> MMK
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Expense total</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">
                        <Money value={expense_total} /> MMK
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Total profit</div>
                    <div className={`mt-1 text-2xl font-semibold ${Number(profit) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        <Money value={profit} /> MMK
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <VoucherSection
                    title="Outbound Voucher"
                    leg={voucherSections.outbound.leg}
                    cargos={voucherSections.outbound.cargos}
                    expenses={voucherSections.outbound.expenses}
                    fallbackFrom={route.origin_location?.name}
                    fallbackTo={route.destination_location?.name}
                    accentClasses="bg-[#eff6ff]"
                    emptyLabel="No outbound cargos or expenses yet."
                />

                <VoucherSection
                    title="Return Voucher"
                    leg={voucherSections.returnTrip.leg}
                    cargos={voucherSections.returnTrip.cargos}
                    expenses={voucherSections.returnTrip.expenses}
                    fallbackFrom={route.destination_location?.name}
                    fallbackTo={route.origin_location?.name}
                    accentClasses="bg-[#f8fafc]"
                    emptyLabel="Return voucher will appear after the car starts the return trip."
                />
            </div>
        </AppLayout>
    );
}
