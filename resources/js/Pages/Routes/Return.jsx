import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { cn } from '../../lib/cn';
import { Minus, Plus, Trash2, X } from 'lucide-react';

function Modal({ open, title, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 p-4 md:p-6 flex items-end md:items-center justify-center">
                <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-4 md:px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
                        <div className="text-base md:text-lg font-semibold text-[#0f172a]">{title}</div>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-[#e2e8f0] text-[#475569] hover:bg-slate-50"
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

export default function Return({ route, return_leg_id }) {
    const form = useForm({
        cargos: [],
        expenses: [],
    });

    const [returnDate, setReturnDate] = useState('');

    const [cargoOpen, setCargoOpen] = useState(false);
    const [expenseOpen, setExpenseOpen] = useState(false);
    const [cargoDraft, setCargoDraft] = useState({ cargo_type: '', description: '', quantity: 1, unit: '', unit_price: '' });
    const [expenseDraft, setExpenseDraft] = useState({ category: '', description: '', amount: '', paid_at: '' });

    const cargoTotal = useMemo(() => {
        return (form.data.cargos || []).reduce((sum, c) => {
            const q = Number(c.quantity);
            const p = Number(c.unit_price);
            if (!Number.isFinite(q) || !Number.isFinite(p)) return sum;
            return sum + q * p;
        }, 0);
    }, [form.data.cargos]);

    const expenseTotal = useMemo(() => {
        return (form.data.expenses || []).reduce((sum, ex) => {
            const a = Number(ex.amount);
            if (!Number.isFinite(a)) return sum;
            return sum + a;
        }, 0);
    }, [form.data.expenses]);

    const money = n => {
        const num = Number(n ?? 0);
        const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
        return `${formatted} MMK`;
    };

    const addCargoToList = () => {
        const quantity = Number(cargoDraft.quantity);
        const unitPrice = Number(cargoDraft.unit_price);
        if (!Number.isFinite(quantity) || quantity <= 0) return;
        if (cargoDraft.unit_price !== '' && (!Number.isFinite(unitPrice) || unitPrice < 0)) return;

        form.setData('cargos', [
            ...(form.data.cargos || []),
            {
                cargo_type: cargoDraft.cargo_type || '',
                description: cargoDraft.description || '',
                quantity,
                unit: cargoDraft.unit || '',
                unit_price: cargoDraft.unit_price === '' ? '' : unitPrice,
            },
        ]);
        setCargoDraft({ cargo_type: '', description: '', quantity: 1, unit: '', unit_price: '' });
    };

    const addExpenseToList = () => {
        const amount = Number(expenseDraft.amount);
        if (!Number.isFinite(amount) || amount <= 0) return;

        form.setData('expenses', [
            ...(form.data.expenses || []),
            {
                category: expenseDraft.category || '',
                description: expenseDraft.description || '',
                amount,
                paid_at: expenseDraft.paid_at || '',
            },
        ]);
        setExpenseDraft({ category: '', description: '', amount: '', paid_at: '' });
    };

    return (
        <AppLayout title={`Add Return Route #${route.id}`}>
            <Head title={`Add Return Route #${route.id}`} />

            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-700">
                    <div>
                        <span className="font-medium">Car:</span> {route.car?.plate_number}
                    </div>
                    <div>
                        <span className="font-medium">Return:</span> {route.destination_location?.name} → {route.origin_location?.name}
                    </div>
                </div>
                <Link href={`/routes/${route.id}`} className="text-blue-700 hover:underline text-sm">
                    Back to view
                </Link>
            </div>

            <div className="bg-white border rounded p-4 max-w-3xl">
                <form
                    className="space-y-6"
                    onSubmit={e => {
                        e.preventDefault();
                        const cleanedCargos = (form.data.cargos || [])
                            .filter(c => Number(c.quantity) > 0)
                            .map(c => ({
                                cargo_type: c.cargo_type || null,
                                description: c.description || null,
                                quantity: Number(c.quantity),
                                unit: c.unit || null,
                                unit_price: c.unit_price === '' ? null : Number(c.unit_price),
                            }));

                        const cleanedExpenses = (form.data.expenses || [])
                            .filter(ex => Number(ex.amount) > 0)
                            .map(ex => ({
                                category: ex.category || '',
                                description: ex.description || null,
                                amount: Number(ex.amount),
                                paid_at: ex.paid_at || null,
                            }));

                        form.transform(data => ({
                            ...data,
                            ended_at: returnDate || null,
                            cargos: cleanedCargos,
                            expenses: cleanedExpenses,
                        }));

                        form.post(`/routes/${route.id}/return`, {
                            onFinish: () => {
                                form.transform(data => data);
                            },
                        });
                    }}
                >
                    <div className="border rounded p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm">Return date</label>
                                <input
                                    type="date"
                                    className="mt-1 w-full border rounded px-3 py-2"
                                    value={returnDate}
                                    onChange={e => setReturnDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border rounded p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="font-medium">Return Cargos</div>
                                <div className="text-sm text-gray-600">{(form.data.cargos || []).length} items • {money(cargoTotal)}</div>
                            </div>
                            <button
                                type="button"
                                className="bg-gray-900 text-white rounded px-3 py-2 text-sm"
                                onClick={() => setCargoOpen(true)}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="border rounded p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="font-medium">Return Expenses</div>
                                <div className="text-sm text-gray-600">{(form.data.expenses || []).length} items • {money(expenseTotal)}</div>
                            </div>
                            <button
                                type="button"
                                className="bg-gray-900 text-white rounded px-3 py-2 text-sm"
                                onClick={() => setExpenseOpen(true)}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <input type="hidden" value={return_leg_id || ''} readOnly />

                    <button type="submit" disabled={form.processing} className="bg-gray-900 text-white rounded px-4 py-2">
                        Save Return & Finish Route
                    </button>
                </form>
            </div>

            <Modal open={cargoOpen} title="Add Cargos (Return)" onClose={() => setCargoOpen(false)}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
                            <div className="text-sm font-semibold text-[#0f172a] mb-3">New Cargo</div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-[#0f172a]">Cargo Type</label>
                                    <input
                                        className={cn(
                                            'mt-1 w-full border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                            'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                        )}
                                        value={cargoDraft.cargo_type}
                                        onChange={e => setCargoDraft(d => ({ ...d, cargo_type: e.target.value }))}
                                        placeholder="e.g. Rice"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-[#0f172a]">Quantity</label>
                                        <div className="mt-1 flex">
                                            <button
                                                type="button"
                                                className="h-10 w-10 inline-flex items-center justify-center border border-[#e2e8f0] rounded-l-lg bg-white hover:bg-slate-50"
                                                onClick={() => setCargoDraft(d => ({ ...d, quantity: Math.max(0, Number(d.quantity || 0) - 1) }))}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <input
                                                type="number"
                                                step="0.001"
                                                className="h-10 w-full border-y border-[#e2e8f0] px-3 bg-white text-sm text-[#0f172a] focus:outline-none"
                                                value={cargoDraft.quantity}
                                                onChange={e => setCargoDraft(d => ({ ...d, quantity: e.target.value }))}
                                            />
                                            <button
                                                type="button"
                                                className="h-10 w-10 inline-flex items-center justify-center border border-[#e2e8f0] rounded-r-lg bg-white hover:bg-slate-50"
                                                onClick={() => setCargoDraft(d => ({ ...d, quantity: Number(d.quantity || 0) + 1 }))}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[#0f172a]">Unit</label>
                                        <input
                                            className={cn(
                                                'mt-1 w-full border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                                'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                            )}
                                            value={cargoDraft.unit}
                                            onChange={e => setCargoDraft(d => ({ ...d, unit: e.target.value }))}
                                            placeholder="kg / bag"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#0f172a]">Unit Price (MMK)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={cn(
                                            'mt-1 w-full border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                            'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                        )}
                                        value={cargoDraft.unit_price}
                                        onChange={e => setCargoDraft(d => ({ ...d, unit_price: e.target.value }))}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#0f172a]">Description</label>
                                    <input
                                        className={cn(
                                            'mt-1 w-full border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                            'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                        )}
                                        value={cargoDraft.description}
                                        onChange={e => setCargoDraft(d => ({ ...d, description: e.target.value }))}
                                        placeholder="Any notes..."
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="w-full bg-[#1a576b] hover:bg-[#144a5a] text-white rounded-lg px-4 py-2.5 text-sm"
                                    onClick={addCargoToList}
                                >
                                    Add to List
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
                                <div className="text-sm font-semibold text-[#0f172a]">Live Preview</div>
                                <div className="text-sm text-[#475569]">{money(cargoTotal)}</div>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-auto">
                                {(form.data.cargos || []).length === 0 ? (
                                    <div className="p-4 text-sm text-[#64748b]">No cargos added yet.</div>
                                ) : (
                                    (form.data.cargos || []).map((c, idx) => {
                                        const q = Number(c.quantity) || 0;
                                        const p = Number(c.unit_price) || 0;
                                        const total = q * p;
                                        return (
                                            <div key={idx} className="p-4 flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-[#0f172a] truncate">{c.cargo_type || 'Cargo'}</div>
                                                    <div className="text-sm text-[#64748b] truncate">{c.description || '—'}</div>
                                                    <div className="text-sm text-[#475569] mt-1">Unit price: {money(p)}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center border border-[#e2e8f0] rounded-lg overflow-hidden">
                                                        <button
                                                            type="button"
                                                            className="h-9 w-9 inline-flex items-center justify-center bg-white hover:bg-slate-50"
                                                            onClick={() => {
                                                                const next = [...(form.data.cargos || [])];
                                                                next[idx] = { ...next[idx], quantity: Math.max(0, Number(next[idx].quantity || 0) - 1) };
                                                                form.setData('cargos', next);
                                                            }}
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <div className="px-3 text-sm text-[#0f172a] whitespace-nowrap">
                                                            {q} {c.unit || ''}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="h-9 w-9 inline-flex items-center justify-center bg-white hover:bg-slate-50"
                                                            onClick={() => {
                                                                const next = [...(form.data.cargos || [])];
                                                                next[idx] = { ...next[idx], quantity: Number(next[idx].quantity || 0) + 1 };
                                                                form.setData('cargos', next);
                                                            }}
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="text-sm font-semibold text-[#0f172a] w-28 text-right">{money(total)}</div>
                                                    <button
                                                        type="button"
                                                        className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca]"
                                                        onClick={() => {
                                                            const next = (form.data.cargos || []).filter((_, i) => i !== idx);
                                                            form.setData('cargos', next);
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="px-4 py-3 border-t border-[#e2e8f0] flex items-center justify-between">
                                <button type="button" className="text-sm text-[#475569] hover:underline" onClick={() => form.setData('cargos', [])}>
                                    Clear all
                                </button>
                                <button
                                    type="button"
                                    className="bg-[#1a576b] hover:bg-[#144a5a] text-white rounded-lg px-4 py-2 text-sm"
                                    onClick={() => setCargoOpen(false)}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal open={expenseOpen} title="Add Expenses (Return)" onClose={() => setExpenseOpen(false)}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
                            <div className="text-sm font-semibold text-[#0f172a] mb-3">New Expense</div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-[#0f172a]">Category</label>
                                    <input
                                        className={cn(
                                            'mt-1 w-full border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                            'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                        )}
                                        value={expenseDraft.category}
                                        onChange={e => setExpenseDraft(d => ({ ...d, category: e.target.value }))}
                                        placeholder="e.g. Lunch"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#0f172a]">Amount (MMK)</label>
                                    <div className="mt-1 flex">
                                        <button
                                            type="button"
                                            className="h-10 w-10 inline-flex items-center justify-center border border-[#e2e8f0] rounded-l-lg bg-white hover:bg-slate-50"
                                            onClick={() =>
                                                setExpenseDraft(d => {
                                                    const current = Number(d.amount || 0);
                                                    const next = Math.max(0, current - 1000);
                                                    return { ...d, amount: next ? String(next) : '' };
                                                })
                                            }
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <input
                                            type="number"
                                            step="1"
                                            className="h-10 w-full border-y border-[#e2e8f0] px-3 bg-white text-sm text-[#0f172a] focus:outline-none"
                                            value={expenseDraft.amount}
                                            onChange={e => setExpenseDraft(d => ({ ...d, amount: e.target.value }))}
                                        />
                                        <button
                                            type="button"
                                            className="h-10 w-10 inline-flex items-center justify-center border border-[#e2e8f0] rounded-r-lg bg-white hover:bg-slate-50"
                                            onClick={() =>
                                                setExpenseDraft(d => {
                                                    const current = Number(d.amount || 0);
                                                    const next = current + 1000;
                                                    return { ...d, amount: String(next) };
                                                })
                                            }
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#0f172a]">Paid at</label>
                                    <input
                                        type="date"
                                        className={cn(
                                            'mt-1 w-full border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-sm text-[#0f172a]',
                                            'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                        )}
                                        value={expenseDraft.paid_at}
                                        onChange={e => setExpenseDraft(d => ({ ...d, paid_at: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#0f172a]">Description</label>
                                    <input
                                        className={cn(
                                            'mt-1 w-full border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                            'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                        )}
                                        value={expenseDraft.description}
                                        onChange={e => setExpenseDraft(d => ({ ...d, description: e.target.value }))}
                                        placeholder="Any notes..."
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="w-full bg-[#1a576b] hover:bg-[#144a5a] text-white rounded-lg px-4 py-2.5 text-sm"
                                    onClick={addExpenseToList}
                                >
                                    Add to List
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
                                <div className="text-sm font-semibold text-[#0f172a]">Live Preview</div>
                                <div className="text-sm text-[#475569]">{money(expenseTotal)}</div>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-auto">
                                {(form.data.expenses || []).length === 0 ? (
                                    <div className="p-4 text-sm text-[#64748b]">No expenses added yet.</div>
                                ) : (
                                    (form.data.expenses || []).map((ex, idx) => {
                                        const amount = Number(ex.amount) || 0;
                                        return (
                                            <div key={idx} className="p-4 flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-[#0f172a] truncate">{ex.category || 'Expense'}</div>
                                                    <div className="text-sm text-[#64748b] truncate">{ex.description || '—'}</div>
                                                    <div className="text-sm text-[#475569] mt-1">{ex.paid_at ? `Paid at: ${ex.paid_at}` : 'Paid at: —'}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center border border-[#e2e8f0] rounded-lg overflow-hidden">
                                                        <button
                                                            type="button"
                                                            className="h-9 w-9 inline-flex items-center justify-center bg-white hover:bg-slate-50"
                                                            onClick={() => {
                                                                const next = [...(form.data.expenses || [])];
                                                                next[idx] = { ...next[idx], amount: Math.max(0, Number(next[idx].amount || 0) - 1000) };
                                                                form.setData('expenses', next);
                                                            }}
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <div className="px-3 text-sm text-[#0f172a] whitespace-nowrap">{money(amount)}</div>
                                                        <button
                                                            type="button"
                                                            className="h-9 w-9 inline-flex items-center justify-center bg-white hover:bg-slate-50"
                                                            onClick={() => {
                                                                const next = [...(form.data.expenses || [])];
                                                                next[idx] = { ...next[idx], amount: Number(next[idx].amount || 0) + 1000 };
                                                                form.setData('expenses', next);
                                                            }}
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca]"
                                                        onClick={() => {
                                                            const next = (form.data.expenses || []).filter((_, i) => i !== idx);
                                                            form.setData('expenses', next);
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="px-4 py-3 border-t border-[#e2e8f0] flex items-center justify-between">
                                <button type="button" className="text-sm text-[#475569] hover:underline" onClick={() => form.setData('expenses', [])}>
                                    Clear all
                                </button>
                                <button
                                    type="button"
                                    className="bg-[#1a576b] hover:bg-[#144a5a] text-white rounded-lg px-4 py-2 text-sm"
                                    onClick={() => setExpenseOpen(false)}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
