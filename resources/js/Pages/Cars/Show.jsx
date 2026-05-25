import React, { useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import ConfirmDialog from '../../Components/ConfirmDialog';
import { cn } from '../../lib/cn';
import { CalendarRange, Filter, Plus, ReceiptText, Trash2, Wrench, X } from 'lucide-react';
import { useAppPath } from '../../lib/url';

function Card({ title, subtitle, action, children }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                <div>
                    <div className="font-semibold text-slate-900">{title}</div>
                    {subtitle ? <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div> : null}
                </div>
                {action}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0">
            <div className="text-sm text-slate-600">{label}</div>
            <div className={cn('text-sm font-medium text-slate-900', !value ? 'font-normal text-slate-400' : '')}>
                {value || '—'}
            </div>
        </div>
    );
}

function Input(props) {
    return (
        <input
            {...props}
            className={cn(
                'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
                'focus:border-[#1a576b] focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15'
            )}
        />
    );
}

function Textarea(props) {
    return (
        <textarea
            {...props}
            className={cn(
                'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
                'focus:border-[#1a576b] focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15'
            )}
        />
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="text-xs font-medium text-slate-800">{label}</label>
            <div className="mt-1">{children}</div>
            {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
        </div>
    );
}

function Modal({ open, title, onClose, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 flex items-end justify-center p-4 md:items-center md:p-6">
                <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 md:px-6">
                        <div className="text-base font-semibold text-slate-900">{title}</div>
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            onClick={onClose}
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-4 md:p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}

function money(value) {
    const num = Number(value ?? 0);
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

function displayDate(value) {
    if (!value) return '—';
    return String(value).slice(0, 10);
}

function Pagination({ links }) {
    if (!links || links.length === 0) return null;

    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {links.map((link, index) => (
                <button
                    key={`${link.label}-${index}`}
                    type="button"
                    disabled={!link.url}
                    onClick={() => {
                        if (!link.url) return;
                        router.visit(link.url, { preserveState: true, preserveScroll: true });
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

export default function Show({ car, stats, filters, routes, repairs }) {
    const appPath = useAppPath();
    const [repairOpen, setRepairOpen] = useState(false);
    const [deleteRepair, setDeleteRepair] = useState(null);

    const filterForm = useForm({
        from_date: filters?.from_date || '',
        to_date: filters?.to_date || '',
    });

    const repairForm = useForm({
        repair_type: '',
        quantity: 1,
        unit_cost: '',
        remark: '',
        repaired_on: filters?.to_date || '',
    });

    const repairTotal = useMemo(() => {
        const quantity = Number(repairForm.data.quantity);
        const unitCost = Number(repairForm.data.unit_cost);
        if (!Number.isFinite(quantity) || !Number.isFinite(unitCost)) return 0;
        return quantity * unitCost;
    }, [repairForm.data.quantity, repairForm.data.unit_cost]);

    return (
        <AppLayout title={null}>
            <Head title={`Car ${car.plate_number}`} />

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Car Profile</div>
                    <h1 className="mt-2 text-2xl font-semibold text-slate-900">{car.plate_number}</h1>
                    <div className="mt-2 text-sm text-slate-600">
                        View filtered route profit, repair expenses, and net profit for this car.
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setRepairOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a576b] px-4 py-2 text-sm font-medium text-white hover:bg-[#144a5a]"
                    >
                        <Plus size={16} />
                        Add Repair Cost
                    </button>
                    <Link
                        href={appPath('/cars')}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Back to cars
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <Card title="Vehicle Information" subtitle="Basic details for this car">
                        <Row label="Car Number" value={car.plate_number} />
                        <Row label="Car Type" value={car.car_type} />
                        <Row label="Driver Name" value={car.driver_name} />
                        <Row label="Remark" value={car.remark} />
                        <Row label="Status" value={car.is_active ? 'Active' : 'Inactive'} />
                    </Card>
                </div>

                <div className="lg:col-span-8">
                    <Card
                        title="Date Filter"
                        subtitle="Filter route profit and repair expenses by date range"
                        action={
                            <CalendarRange size={18} className="text-slate-400" />
                        }
                    >
                        <form
                            className="grid grid-cols-1 gap-3 md:grid-cols-4"
                            onSubmit={e => {
                                e.preventDefault();
                                router.get(
                                    appPath(`/cars/${car.id}`),
                                    {
                                        from_date: filterForm.data.from_date || undefined,
                                        to_date: filterForm.data.to_date || undefined,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    }
                                );
                            }}
                        >
                            <Field label="From Date">
                                <Input
                                    type="date"
                                    value={filterForm.data.from_date}
                                    onChange={e => filterForm.setData('from_date', e.target.value)}
                                />
                            </Field>
                            <Field label="To Date" error={filterForm.errors.to_date}>
                                <Input
                                    type="date"
                                    value={filterForm.data.to_date}
                                    onChange={e => filterForm.setData('to_date', e.target.value)}
                                />
                            </Field>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    <Filter size={16} />
                                    Apply Filter
                                </button>
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                                    onClick={() => {
                                        filterForm.setData({
                                            from_date: '',
                                            to_date: '',
                                        });
                                        router.get(appPath(`/cars/${car.id}`), {}, { preserveState: true, preserveScroll: true, replace: true });
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Total Route Profit</div>
                    <div className="mt-2 text-2xl font-semibold text-emerald-700">
                        {money(stats.route_profit_total)} MMK
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{stats.filtered_routes_count} filtered route(s)</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Total Repair Expense</div>
                    <div className="mt-2 text-2xl font-semibold text-rose-700">
                        {money(stats.repair_expense_total)} MMK
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{stats.filtered_repairs_count} filtered repair(s)</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Net Profit</div>
                    <div className={cn('mt-2 text-2xl font-semibold', Number(stats.net_profit) >= 0 ? 'text-slate-900' : 'text-rose-700')}>
                        {money(stats.net_profit)} MMK
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Route profit minus repair expense</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-slate-500">History Count</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {stats.routes_count} / {stats.repairs_count}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Total routes / total repairs</div>
                </div>
            </div>

            <div className="mt-6 space-y-6">
                <Card
                    title="Repair Cost List"
                    subtitle="Filtered repair expenses recorded for this car"
                    action={
                        <button
                            type="button"
                            onClick={() => setRepairOpen(true)}
                            className="ui-action-secondary inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
                        >
                            <Plus size={16} />
                            Add Repair
                        </button>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Repair Type</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Qty</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Unit Cost</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Total</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Remark</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repairs.data?.length > 0 ? (
                                    repairs.data.map(repair => (
                                        <tr key={repair.id} className="border-t border-slate-200">
                                            <td className="px-4 py-3 text-slate-700">{displayDate(repair.repaired_on || repair.created_at)}</td>
                                            <td className="px-4 py-3 font-medium text-slate-900">{repair.repair_type || '—'}</td>
                                            <td className="px-4 py-3 text-right text-slate-700">{Number(repair.quantity ?? 0).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right text-slate-700">{money(repair.unit_cost)} MMK</td>
                                            <td className="px-4 py-3 text-right font-medium text-rose-700">{money(repair.total_cost)} MMK</td>
                                            <td className="px-4 py-3 text-slate-700">{repair.remark || '—'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
                                                    onClick={() => setDeleteRepair(repair)}
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-8 text-slate-500" colSpan={7}>
                                            No repair costs found for the selected date range.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={repairs.links} />
                </Card>

                <Card
                    title="Route Profit List"
                    subtitle="Filtered route income, expense, and profit for this car"
                    action={<ReceiptText size={18} className="text-slate-400" />}
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Route</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Trip</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Cargo</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Expense</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {routes.data?.length > 0 ? (
                                    routes.data.map(routeItem => {
                                        const routeProfit = Number(routeItem.cargo_total ?? 0) - Number(routeItem.expense_total ?? 0);

                                        return (
                                            <tr key={routeItem.id} className="border-t border-slate-200">
                                                <td className="px-4 py-3 font-medium text-slate-900">#{routeItem.id}</td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {(routeItem.origin_location?.name || '—') + ' to ' + (routeItem.destination_location?.name || '—')}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">{displayDate(routeItem.started_at)}</td>
                                                <td className="px-4 py-3 text-right text-slate-700">{money(routeItem.cargo_total)} MMK</td>
                                                <td className="px-4 py-3 text-right text-slate-700">{money(routeItem.expense_total)} MMK</td>
                                                <td
                                                    className={cn(
                                                        'px-4 py-3 text-right font-medium',
                                                        routeProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                                    )}
                                                >
                                                    {money(routeProfit)} MMK
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td className="px-4 py-8 text-slate-500" colSpan={6}>
                                            No routes found for the selected date range.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={routes.links} />
                </Card>
            </div>

            <Modal open={repairOpen} title="Add Repair Cost" onClose={() => setRepairOpen(false)}>
                <form
                    className="space-y-4"
                    onSubmit={e => {
                        e.preventDefault();
                        repairForm.post(appPath(`/cars/${car.id}/repairs`), {
                            preserveScroll: true,
                            onSuccess: () => {
                                repairForm.reset('repair_type', 'quantity', 'unit_cost', 'remark', 'repaired_on');
                                repairForm.setData('quantity', 1);
                                setRepairOpen(false);
                            },
                        });
                    }}
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Repair Type" error={repairForm.errors.repair_type}>
                            <Input
                                value={repairForm.data.repair_type}
                                onChange={e => repairForm.setData('repair_type', e.target.value)}
                                placeholder="e.g. Tire, Engine Oil, Brake Pad"
                                required
                            />
                        </Field>
                        <Field label="Repair Date" error={repairForm.errors.repaired_on}>
                            <Input
                                type="date"
                                value={repairForm.data.repaired_on}
                                onChange={e => repairForm.setData('repaired_on', e.target.value)}
                                required
                            />
                        </Field>
                        <Field label="Quantity" error={repairForm.errors.quantity}>
                            <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={repairForm.data.quantity}
                                onChange={e => repairForm.setData('quantity', e.target.value)}
                                required
                            />
                        </Field>
                        <Field label="Repair Cost" error={repairForm.errors.unit_cost}>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={repairForm.data.unit_cost}
                                onChange={e => repairForm.setData('unit_cost', e.target.value)}
                                placeholder="Cost for one item"
                                required
                            />
                        </Field>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Wrench size={16} />
                            Total Repair Cost
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-slate-900">{money(repairTotal)} MMK</div>
                        <div className="mt-1 text-xs text-slate-500">Calculated from repair cost multiplied by quantity</div>
                    </div>

                    <Field label="Remark" error={repairForm.errors.remark}>
                        <Textarea
                            rows={4}
                            value={repairForm.data.remark}
                            onChange={e => repairForm.setData('remark', e.target.value)}
                            placeholder="Any repair notes..."
                        />
                    </Field>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            onClick={() => setRepairOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={repairForm.processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#1a576b] px-4 py-2 text-sm font-medium text-white hover:bg-[#144a5a]"
                        >
                            <Plus size={16} />
                            Save Repair Cost
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleteRepair}
                title="Delete Repair Cost"
                message="Delete this repair cost? If it came from stock out, the stock quantity will be reversed back into the warehouse."
                onClose={() => setDeleteRepair(null)}
                onConfirm={() => {
                    if (!deleteRepair) return;
                    router.delete(appPath(`/cars/${car.id}/repairs/${deleteRepair.id}`), {
                        preserveScroll: true,
                        onSuccess: () => setDeleteRepair(null),
                        onError: errors => {
                            const firstError = Object.values(errors || {})[0];
                            if (firstError) alert(firstError);
                        },
                    });
                }}
            />
        </AppLayout>
    );
}
