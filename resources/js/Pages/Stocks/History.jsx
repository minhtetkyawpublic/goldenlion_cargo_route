import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import ConfirmDialog from '../../Components/ConfirmDialog';
import { ArrowLeft, EllipsisVertical, Filter, History as HistoryIcon, Trash2 } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import { cn } from '../../lib/cn';
import { useAppPath } from '../../lib/url';

function money(value) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value ?? 0));
}

function quantity(value) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(Number(value ?? 0));
}

function Pagination({ links = [] }) {
    if (!links.length) return null;

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

export default function History({ warehouse, filters, transactions }) {
    const appPath = useAppPath();
    const form = useForm({
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
        movement_type: filters?.movement_type || '',
    });
    const [deleteTransaction, setDeleteTransaction] = React.useState(null);
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

    return (
        <AppLayout title="History">
            <Head title="History" />

            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="text-[1.05rem] font-semibold text-[#111827]">{warehouse?.name || 'Main Warehouse'} Transactions</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={appPath('/stocks')}
                        className="ui-action-secondary inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to Stock
                    </Link>
                </div>
            </div>

            <div className="mb-4 rounded-2xl border border-[#cfd7df] bg-[#f8fafb] p-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                <form
                    className="grid grid-cols-1 items-end gap-3 md:grid-cols-4"
                    onSubmit={e => {
                        e.preventDefault();
                        router.get(appPath('/stocks/history'), form.data, { preserveState: true, replace: true });
                    }}
                >
                    <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Date From</label>
                        <input
                            type="date"
                            className="mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#1a576b] focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15"
                            value={form.data.date_from}
                            onChange={e => form.setData('date_from', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Date To</label>
                        <input
                            type="date"
                            className="mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#1a576b] focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15"
                            value={form.data.date_to}
                            onChange={e => form.setData('date_to', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Movement</label>
                        <select
                            className="mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#1a576b] focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15"
                            value={form.data.movement_type}
                            onChange={e => form.setData('movement_type', e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="in">Stock In</option>
                            <option value="out">Stock Out</option>
                        </select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            className="ui-action-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
                        >
                            <Filter size={16} />
                            Apply
                        </button>
                        <button
                            type="button"
                            className="ui-action-secondary rounded-xl border px-4 py-2 text-sm"
                            onClick={() => router.get(appPath('/stocks/history'), {}, { preserveState: true, replace: true })}
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
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Movement</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Item</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-600">Qty</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-600">Unit Cost</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-600">Total</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Car</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Remark</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.data?.length > 0 ? (
                            transactions.data.map(tx => (
                                <tr key={tx.id} className="border-t border-[#e0e5ea] bg-white">
                                    <td className="px-4 py-3 text-slate-700">{tx.moved_at || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                'inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium',
                                                tx.movement_type === 'in' ? 'bg-[#dff4df] text-[#24613b]' : 'bg-[#f9e0e0] text-[#9b4949]'
                                            )}
                                        >
                                            {tx.movement_type === 'in' ? 'Stock In' : 'Stock Out'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {tx.item_name || '-'}
                                        {tx.item_category ? <div className="text-xs text-slate-500">{tx.item_category}</div> : null}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-700">{quantity(tx.quantity)}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{money(tx.unit_cost)} MMK</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900">{money(tx.total_cost)} MMK</td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {tx.car ? (
                                            <>
                                                <div className="font-medium text-slate-900">{tx.car.plate_number}</div>
                                                <div className="text-xs text-slate-500">{tx.car.car_type || '-'}</div>
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{tx.notes || '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            className="ui-action-secondary inline-flex h-9 w-9 items-center justify-center rounded-lg border"
                                            onClick={e => {
                                                e.stopPropagation();
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setOpenMenu(current =>
                                                    current?.id === tx.id
                                                        ? null
                                                        : {
                                                              id: tx.id,
                                                              top: rect.bottom + 8,
                                                              left: Math.max(16, rect.right - 160),
                                                          }
                                                );
                                            }}
                                        >
                                            <EllipsisVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="px-4 py-8 text-slate-500" colSpan={9}>
                                    <div className="flex items-center gap-2">
                                        <HistoryIcon size={16} />
                                        No stock transactions found for the current filters.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={transactions.links} />

            {openMenu ? (
                <div
                    className="fixed z-40 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                    style={{ top: openMenu.top, left: openMenu.left }}
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                        onClick={() => {
                            const transaction = transactions.data?.find(item => item.id === openMenu.id);
                            setOpenMenu(null);
                            if (transaction) setDeleteTransaction(transaction);
                        }}
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            ) : null}

            <ConfirmDialog
                open={!!deleteTransaction}
                title="Delete Transaction"
                message="Delete this transaction? The stock quantity will be reversed automatically."
                onClose={() => setDeleteTransaction(null)}
                onConfirm={() => {
                    if (!deleteTransaction) return;
                    router.delete(appPath(`/stocks/history/${deleteTransaction.id}`), {
                        preserveScroll: true,
                        onSuccess: () => setDeleteTransaction(null),
                        onError: errors => {
                            const firstError = Object.values(errors || {})[0];
                            if (firstError) {
                                alert(firstError);
                            }
                        },
                    });
                }}
            />
        </AppLayout>
    );
}
