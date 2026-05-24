import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDownCircle, ArrowUpCircle, Boxes, EllipsisVertical, History, Pencil, Warehouse, Wrench, X } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import { cn } from '../../lib/cn';

function Card({ title, subtitle, action, children }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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

function Modal({ open, title, onClose, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 flex items-end justify-center p-4 md:items-center md:p-6">
                <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
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

function Field({ label, error, children, hint }) {
    return (
        <div>
            <label className="text-xs font-medium text-slate-800">{label}</label>
            <div className="mt-1">{children}</div>
            {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
            {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
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

function Select(props) {
    return (
        <select
            {...props}
            className={cn(
                'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900',
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

function money(value) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value ?? 0));
}

function quantity(value) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(Number(value ?? 0));
}

export default function Index({ warehouse, stats, stocks, items, cars }) {
    const [stockInOpen, setStockInOpen] = useState(false);
    const [stockOutOpen, setStockOutOpen] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);
    const today = new Date().toISOString().slice(0, 10);

    const stockMap = useMemo(() => {
        const map = new Map();
        (stocks || []).forEach(stock => map.set(String(stock.inventory_item_id), stock));
        return map;
    }, [stocks]);

    const itemMap = useMemo(() => {
        const map = new Map();
        (items || []).forEach(item => map.set(String(item.id), item));
        return map;
    }, [items]);

    const stockInForm = useForm({
        inventory_item_id: '',
        item_name: '',
        category: '',
        unit: '',
        quantity: 1,
        unit_cost: '',
        moved_at: today,
        remark: '',
    });

    const stockOutForm = useForm({
        inventory_item_id: '',
        quantity: 1,
        unit_cost: '',
        moved_at: today,
        car_id: '',
        remark: '',
    });

    const editStockForm = useForm({
        name: '',
        category: '',
        unit: '',
        quantity_on_hand: '',
    });

    const stockInTotal = useMemo(() => {
        const q = Number(stockInForm.data.quantity);
        const c = Number(stockInForm.data.unit_cost);
        if (!Number.isFinite(q) || !Number.isFinite(c)) return 0;
        return q * c;
    }, [stockInForm.data.quantity, stockInForm.data.unit_cost]);

    const stockOutTotal = useMemo(() => {
        const q = Number(stockOutForm.data.quantity);
        const c = Number(stockOutForm.data.unit_cost);
        if (!Number.isFinite(q) || !Number.isFinite(c)) return 0;
        return q * c;
    }, [stockOutForm.data.quantity, stockOutForm.data.unit_cost]);

    const selectedStockOutItem = stockMap.get(String(stockOutForm.data.inventory_item_id || ''));
    const selectedStockInItem = itemMap.get(String(stockInForm.data.inventory_item_id || ''));

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
        <AppLayout title={null}>
            <Head title="Stock" />

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="mt-2 text-2xl font-semibold text-slate-900">{warehouse?.name || 'Main Warehouse'}</h1>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        <Warehouse size={14} />
                        {warehouse?.location_name || 'No location linked'}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setStockInOpen(true)}
                        className="ui-action-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        <ArrowDownCircle size={16} />
                        Stock In
                    </button>
                    <button
                        type="button"
                        onClick={() => setStockOutOpen(true)}
                        className="ui-action-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
                    >
                        <ArrowUpCircle size={16} />
                        Stock Out
                    </button>
                    <Link
                        href="/stocks/history"
                        className="ui-action-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
                    >
                        <History size={16} />
                        History
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Current Items</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{stats.current_item_count}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Stock In Total Qty</div>
                    <div className="mt-2 text-2xl font-semibold text-emerald-700">{quantity(stats.stock_in_total)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Stock Out Total Qty</div>
                    <div className="mt-2 text-2xl font-semibold text-rose-700">{quantity(stats.stock_out_total)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Current Stock Value</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{money(stats.current_stock_value)} MMK</div>
                </div>
            </div>

            <div className="mt-6">
                <Card title="Current Items" action={<Boxes size={18} className="text-slate-400" />}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Item</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Remark</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Unit</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Qty</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Unit Cost</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Value</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.length > 0 ? (
                                    stocks.map(stock => (
                                        <tr key={stock.id} className="border-t border-slate-200">
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {stock.name || '-'}
                                                {stock.sku ? <div className="text-xs font-normal text-slate-500">{stock.sku}</div> : null}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">{stock.remark || '-'}</td>
                                            <td className="px-4 py-3 text-slate-700">{stock.unit || '-'}</td>
                                            <td className="px-4 py-3 text-right text-slate-700">{quantity(stock.quantity_on_hand)}</td>
                                            <td className="px-4 py-3 text-right text-slate-700">{money(stock.unit_cost)} MMK</td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-900">{money(stock.total_cost)} MMK</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    className="ui-action-secondary inline-flex h-9 w-9 items-center justify-center rounded-lg border"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setOpenMenu(current =>
                                                            current?.id === stock.id
                                                                ? null
                                                                : {
                                                                      id: stock.id,
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
                                        <td className="px-4 py-8 text-slate-500" colSpan={7}>
                                            No stock items yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {openMenu ? (
                <div
                    className="fixed z-40 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                    style={{ top: openMenu.top, left: openMenu.left }}
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                            const stock = stocks.find(item => item.id === openMenu.id);
                            setOpenMenu(null);
                            if (!stock) return;
                            setEditingStock(stock);
                            editStockForm.setData({
                                name: stock.name || '',
                                category: stock.category || '',
                                unit: stock.unit || '',
                                quantity_on_hand: String(stock.quantity_on_hand ?? ''),
                            });
                        }}
                    >
                        <Pencil size={14} />
                        Edit
                    </button>
                </div>
            ) : null}

            <Modal open={stockInOpen} title="Stock In" onClose={() => setStockInOpen(false)}>
                <form
                    className="space-y-4"
                    onSubmit={e => {
                        e.preventDefault();
                        stockInForm.post('/stocks/in', {
                            preserveScroll: true,
                            onSuccess: () => {
                                stockInForm.reset();
                                stockInForm.setData({
                                    inventory_item_id: '',
                                    item_name: '',
                                    category: '',
                                    unit: '',
                                    quantity: 1,
                                    unit_cost: '',
                                    moved_at: today,
                                    remark: '',
                                });
                                setStockInOpen(false);
                            },
                        });
                    }}
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Existing Item">
                            <Select
                                value={stockInForm.data.inventory_item_id}
                                onChange={e => stockInForm.setData('inventory_item_id', e.target.value)}
                            >
                                <option value="">Create New Item</option>
                                {items.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} {item.unit ? `(${item.unit})` : ''}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Date" error={stockInForm.errors.moved_at}>
                            <Input
                                type="date"
                                value={stockInForm.data.moved_at}
                                onChange={e => stockInForm.setData('moved_at', e.target.value)}
                                required
                            />
                        </Field>

                        {!stockInForm.data.inventory_item_id ? (
                            <>
                                <Field label="Item" error={stockInForm.errors.item_name}>
                                    <Input
                                        value={stockInForm.data.item_name}
                                        onChange={e => stockInForm.setData('item_name', e.target.value)}
                                        placeholder="e.g. Tire, Engine Oil, Brake Pad"
                                    />
                                </Field>
                                <Field label="Type" error={stockInForm.errors.category}>
                                    <Input
                                        value={stockInForm.data.category}
                                        onChange={e => stockInForm.setData('category', e.target.value)}
                                        placeholder="e.g. Spare Part"
                                    />
                                </Field>
                                <Field label="Unit" error={stockInForm.errors.unit}>
                                    <Input
                                        value={stockInForm.data.unit}
                                        onChange={e => stockInForm.setData('unit', e.target.value)}
                                        placeholder="e.g. pcs, bottle, set"
                                    />
                                </Field>
                            </>
                        ) : (
                            <Field label="Selected Item">
                                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                    {selectedStockInItem?.name || '-'}
                                    {selectedStockInItem?.category ? ` / ${selectedStockInItem.category}` : ''}
                                    {selectedStockInItem?.unit ? ` / ${selectedStockInItem.unit}` : ''}
                                </div>
                            </Field>
                        )}

                        <Field label="Quantity" error={stockInForm.errors.quantity}>
                            <Input
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={stockInForm.data.quantity}
                                onChange={e => stockInForm.setData('quantity', e.target.value)}
                                required
                            />
                        </Field>

                        <Field label="Unit Cost" error={stockInForm.errors.unit_cost}>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={stockInForm.data.unit_cost}
                                onChange={e => stockInForm.setData('unit_cost', e.target.value)}
                                placeholder="MMK"
                                required
                            />
                        </Field>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
                        <div className="mt-1 text-2xl font-semibold text-slate-900">{money(stockInTotal)} MMK</div>
                    </div>

                    <Field label="Remark" error={stockInForm.errors.remark}>
                        <Textarea
                            rows={3}
                            value={stockInForm.data.remark}
                            onChange={e => stockInForm.setData('remark', e.target.value)}
                            placeholder="Any stock in notes..."
                        />
                    </Field>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            className="ui-action-secondary rounded-lg border px-4 py-2 text-sm font-medium"
                            onClick={() => setStockInOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={stockInForm.processing}
                            className="ui-action-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                        >
                            <ArrowDownCircle size={16} />
                            Save Stock In
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal open={stockOutOpen} title="Stock Out" onClose={() => setStockOutOpen(false)}>
                <form
                    className="space-y-4"
                    onSubmit={e => {
                        e.preventDefault();
                        stockOutForm.post('/stocks/out', {
                            preserveScroll: true,
                            onSuccess: () => {
                                stockOutForm.reset();
                                stockOutForm.setData({
                                    inventory_item_id: '',
                                    quantity: 1,
                                    unit_cost: '',
                                    moved_at: today,
                                    car_id: '',
                                    remark: '',
                                });
                                setStockOutOpen(false);
                            },
                        });
                    }}
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Item" error={stockOutForm.errors.inventory_item_id}>
                            <Select
                                value={stockOutForm.data.inventory_item_id}
                                onChange={e => {
                                    const nextId = e.target.value;
                                    const stock = stockMap.get(String(nextId));
                                    stockOutForm.setData(data => ({
                                        ...data,
                                        inventory_item_id: nextId,
                                        unit_cost: stock ? String(stock.unit_cost ?? '') : '',
                                    }));
                                }}
                                required
                            >
                                <option value="">Select Item</option>
                                {stocks.map(stock => (
                                    <option key={stock.inventory_item_id} value={stock.inventory_item_id}>
                                        {stock.name} - {quantity(stock.quantity_on_hand)} {stock.unit || ''}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Date" error={stockOutForm.errors.moved_at}>
                            <Input
                                type="date"
                                value={stockOutForm.data.moved_at}
                                onChange={e => stockOutForm.setData('moved_at', e.target.value)}
                                required
                            />
                        </Field>

                        <Field
                            label="Quantity"
                            error={stockOutForm.errors.quantity}
                            hint={selectedStockOutItem ? `Available: ${quantity(selectedStockOutItem.quantity_on_hand)} ${selectedStockOutItem.unit || ''}` : ''}
                        >
                            <Input
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={stockOutForm.data.quantity}
                                onChange={e => stockOutForm.setData('quantity', e.target.value)}
                                required
                            />
                        </Field>

                        <Field label="Unit Cost" error={stockOutForm.errors.unit_cost}>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={stockOutForm.data.unit_cost}
                                onChange={e => stockOutForm.setData('unit_cost', e.target.value)}
                                placeholder="MMK"
                                required
                            />
                        </Field>

                        <Field label="Car (Optional)" error={stockOutForm.errors.car_id}>
                            <Select
                                value={stockOutForm.data.car_id}
                                onChange={e => stockOutForm.setData('car_id', e.target.value)}
                            >
                                <option value="">No car selected</option>
                                {cars.map(car => (
                                    <option key={car.id} value={car.id}>
                                        {car.plate_number} {car.car_type ? `- ${car.car_type}` : ''}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Wrench size={16} />
                            Total
                        </div>
                        <div className="mt-1 text-2xl font-semibold text-slate-900">{money(stockOutTotal)} MMK</div>
                    </div>

                    <Field label="Remark" error={stockOutForm.errors.remark}>
                        <Textarea
                            rows={3}
                            value={stockOutForm.data.remark}
                            onChange={e => stockOutForm.setData('remark', e.target.value)}
                            placeholder="Any stock out notes..."
                        />
                    </Field>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            className="ui-action-secondary rounded-lg border px-4 py-2 text-sm font-medium"
                            onClick={() => setStockOutOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={stockOutForm.processing}
                            className="ui-action-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                        >
                            <ArrowUpCircle size={16} />
                            Save Stock Out
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal open={!!editingStock} title="Edit Item" onClose={() => setEditingStock(null)}>
                <form
                    className="space-y-4"
                    onSubmit={e => {
                        e.preventDefault();
                        if (!editingStock) return;
                        editStockForm.put(`/stocks/${editingStock.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setEditingStock(null);
                                editStockForm.reset();
                            },
                        });
                    }}
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Item" error={editStockForm.errors.name}>
                            <Input
                                value={editStockForm.data.name}
                                onChange={e => editStockForm.setData('name', e.target.value)}
                                required
                            />
                        </Field>
                        <Field label="Type" error={editStockForm.errors.category}>
                            <Input
                                value={editStockForm.data.category}
                                onChange={e => editStockForm.setData('category', e.target.value)}
                            />
                        </Field>
                        <Field label="Unit" error={editStockForm.errors.unit}>
                            <Input
                                value={editStockForm.data.unit}
                                onChange={e => editStockForm.setData('unit', e.target.value)}
                            />
                        </Field>
                        <Field label="Qty" error={editStockForm.errors.quantity_on_hand}>
                            <Input
                                type="number"
                                min="0"
                                step="0.001"
                                value={editStockForm.data.quantity_on_hand}
                                onChange={e => editStockForm.setData('quantity_on_hand', e.target.value)}
                                required
                            />
                        </Field>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            className="ui-action-secondary rounded-lg border px-4 py-2 text-sm font-medium"
                            onClick={() => setEditingStock(null)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={editStockForm.processing}
                            className="ui-action-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                        >
                            <Pencil size={16} />
                            Save
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
