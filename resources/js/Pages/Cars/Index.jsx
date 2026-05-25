import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import ConfirmDialog from '../../Components/ConfirmDialog';
import { cn } from '../../lib/cn';
import { CarFront, EllipsisVertical, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useAppPath } from '../../lib/url';

function Field({ label, children, error }) {
    return (
        <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">{label}</label>
            <div className="mt-1">{children}</div>
            {error ? <div className="text-xs text-red-600 mt-1">{error}</div> : null}
        </div>
    );
}

function Input(props) {
    return (
        <input
            {...props}
            className={cn(
                'w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#64748b]',
                'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
            )}
        />
    );
}

function Textarea(props) {
    return (
        <textarea
            {...props}
            className={cn(
                'w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#64748b]',
                'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
            )}
        />
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <label className="flex items-center gap-3 text-sm select-none">
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-5 w-10 items-center rounded-full border transition-colors',
                    checked ? 'bg-[#22c55e] border-[#22c55e]' : 'bg-white border-[#cbd5e1]'
                )}
                aria-pressed={checked}
            >
                <span
                    className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                        checked ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                />
            </button>
            <span className="text-sm text-[#0f172a]">{label}</span>
        </label>
    );
}

function Modal({ open, title, onClose, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 flex items-end justify-center p-4 md:items-center md:p-6">
                <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#d9e1e8] px-4 py-3">
                        <div>
                            <div className="text-[1.05rem] font-semibold text-[#111827]">{title}</div>
                            <div className="text-xs text-[#64748b]">Car Number, Car Type, Driver Name are required</div>
                        </div>
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#cfd7df] bg-white text-[#475569] hover:bg-slate-50"
                            onClick={onClose}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="p-4">{children}</div>
                </div>
            </div>
        </div>
    );
}

function Pagination({ links }) {
    if (!links || links.length === 0) return null;

    return (
        <div className="mt-4 flex flex-wrap gap-2 px-3 pb-3">
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

export default function Index({ cars, filters }) {
    const appPath = useAppPath();
    const [editingId, setEditingId] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteCar, setDeleteCar] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);
    const searchForm = useForm({
        search: filters?.search || '',
    });

    const createForm = useForm({
        plate_number: '',
        car_type: '',
        driver_name: '',
        remark: '',
        is_active: true,
    });

    const editForm = useForm({
        plate_number: '',
        car_type: '',
        driver_name: '',
        remark: '',
        is_active: true,
    });

    const data = cars?.data ?? [];

    const startEdit = car => {
        setEditingId(car.id);
        editForm.setData({
            plate_number: car.plate_number || '',
            car_type: car.car_type || '',
            driver_name: car.driver_name || '',
            remark: car.remark || '',
            is_active: !!car.is_active,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        editForm.clearErrors();
    };

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
        <AppLayout title="Car Profiles">
            <Head title="Cars" />

            <div className="overflow-hidden rounded-2xl border border-[#cfd7df] bg-[#f8fafb] shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e1e8] px-4 py-3">
                    <div>
                        <div className="text-[1.05rem] font-semibold text-[#111827]">Vehicle Fleet List</div>
                        <div className="text-xs text-[#64748b]">Tap a vehicle to open its profile</div>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
                        <button
                            type="button"
                            className="ui-action-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus size={16} />
                            Add Car
                        </button>
                        <form
                            className="flex w-full gap-2 lg:w-auto"
                            onSubmit={e => {
                                e.preventDefault();
                                router.get(appPath('/cars'), { search: searchForm.data.search || undefined }, { preserveState: true, replace: true });
                            }}
                        >
                            <div className="w-full lg:w-64">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
                                        <Search size={15} />
                                    </span>
                                    <Input
                                        value={searchForm.data.search}
                                        onChange={e => searchForm.setData('search', e.target.value)}
                                        placeholder="Search vehicle ID, type, or driver"
                                        style={{ paddingLeft: 36 }}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="ui-action-secondary rounded-xl border px-3 py-2 text-sm">
                                Search
                            </button>
                        </form>
                    </div>
                </div>

                <div className="divide-y divide-[#e0e5ea]">
                    {data.map(car => {
                        const isEditing = editingId === car.id;
                        return (
                            <div key={car.id} className="p-3">
                                {!isEditing ? (
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                        <Link
                                            href={appPath(`/cars/${car.id}`)}
                                            className={cn(
                                                'ui-clickable-card min-w-0 flex-1 rounded-2xl border border-[#d7dde4] bg-white px-3 py-3'
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="text-lg font-semibold leading-5 text-[#0f172a]">
                                                            {car.plate_number}
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
                                                                car.is_active ? 'bg-[#dff4df] text-[#24613b]' : 'bg-slate-100 text-[#64748b]'
                                                            )}
                                                        >
                                                            {car.is_active ? (
                                                                <span className="h-2 w-2 rounded-full bg-[#4cae4f]" />
                                                            ) : (
                                                                <span className="h-2 w-2 rounded-full bg-[#64748b]" />
                                                            )}
                                                            {car.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#0f172a]">
                                                        <span className="inline-flex items-center gap-2">
                                                            <CarFront size={15} className="text-[#64748b]" />
                                                            <span>
                                                                <span className="text-[#64748b]">Type:</span>{' '}
                                                                {car.car_type || '—'}
                                                            </span>
                                                        </span>
                                                        <span className="text-[#cbd5e1]">|</span>
                                                        <span>
                                                            <span className="text-[#64748b]">Driver:</span>{' '}
                                                            {car.driver_name || '—'}
                                                        </span>
                                                    </div>
                                                    {car.remark ? (
                                                        <div className="mt-1 line-clamp-1 text-sm text-[#64748b]">
                                                            {car.remark}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </Link>

                                        <div className="flex items-center self-end lg:self-auto">
                                            <button
                                                type="button"
                                                className="ui-action-secondary inline-flex h-9 w-9 items-center justify-center rounded-lg border"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setOpenMenu(current =>
                                                        current?.id === car.id
                                                            ? null
                                                            : {
                                                                  id: car.id,
                                                                  top: rect.bottom + 8,
                                                                  left: Math.max(16, rect.right - 160),
                                                              }
                                                    );
                                                }}
                                            >
                                                <EllipsisVertical size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <form
                                        className="grid grid-cols-1 gap-3 md:grid-cols-2"
                                        onSubmit={e => {
                                            e.preventDefault();
                                            editForm.put(appPath(`/cars/${car.id}`), {
                                                preserveScroll: true,
                                                onSuccess: () => cancelEdit(),
                                            });
                                        }}
                                    >
                                        <Field label="Car Number" error={editForm.errors.plate_number}>
                                            <Input
                                                value={editForm.data.plate_number}
                                                onChange={e => editForm.setData('plate_number', e.target.value)}
                                                required
                                            />
                                        </Field>
                                        <Field label="Car Type" error={editForm.errors.car_type}>
                                            <Input
                                                value={editForm.data.car_type}
                                                onChange={e => editForm.setData('car_type', e.target.value)}
                                                required
                                            />
                                        </Field>
                                        <Field label="Driver Name" error={editForm.errors.driver_name}>
                                            <Input
                                                value={editForm.data.driver_name}
                                                onChange={e => editForm.setData('driver_name', e.target.value)}
                                                required
                                            />
                                        </Field>
                                        <div className="flex items-end">
                                            <Toggle
                                                checked={!!editForm.data.is_active}
                                                onChange={v => editForm.setData('is_active', v)}
                                                label="Active"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Field label="Remark" error={editForm.errors.remark}>
                                                <Textarea
                                                    rows={3}
                                                    value={editForm.data.remark}
                                                    onChange={e => editForm.setData('remark', e.target.value)}
                                                />
                                            </Field>
                                        </div>
                                        <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-2 pt-1">
                                            <button
                                                type="button"
                                                className="ui-action-secondary inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                                                onClick={cancelEdit}
                                            >
                                                <X size={16} />
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={editForm.processing}
                                                className={cn(
                                                    'ui-action-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium'
                                                )}
                                            >
                                                <Pencil size={16} />
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        );
                    })}

                    {data.length === 0 ? (
                        <div className="p-6 text-sm text-[#64748b]">No cars found.</div>
                    ) : null}
                </div>

                <Pagination links={cars?.links ?? []} />
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
                            const car = data.find(item => item.id === openMenu.id);
                            setOpenMenu(null);
                            if (car) startEdit(car);
                        }}
                    >
                        <Pencil size={14} />
                        Edit
                    </button>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                        onClick={() => {
                            const car = data.find(item => item.id === openMenu.id);
                            setOpenMenu(null);
                            if (car) setDeleteCar(car);
                        }}
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            ) : null}

            <Modal open={createOpen} title="Add New Vehicle Profile" onClose={() => setCreateOpen(false)}>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        createForm.post(appPath('/cars'), {
                            preserveScroll: true,
                            onSuccess: () => {
                                createForm.reset('plate_number', 'car_type', 'driver_name', 'remark');
                                createForm.setData('is_active', true);
                                setCreateOpen(false);
                            },
                        });
                    }}
                    className="space-y-3"
                >
                    <Field label="Car Number" error={createForm.errors.plate_number}>
                        <Input
                            value={createForm.data.plate_number}
                            onChange={e => createForm.setData('plate_number', e.target.value)}
                            placeholder="e.g. 4L/1234"
                            required
                        />
                    </Field>

                    <Field label="Car Type" error={createForm.errors.car_type}>
                        <Input
                            value={createForm.data.car_type}
                            onChange={e => createForm.setData('car_type', e.target.value)}
                            placeholder="e.g. Tipper, 10-wheels trailer"
                            required
                        />
                    </Field>

                    <Field label="Driver Name" error={createForm.errors.driver_name}>
                        <Input
                            value={createForm.data.driver_name}
                            onChange={e => createForm.setData('driver_name', e.target.value)}
                            placeholder="e.g. U Aung Min"
                            required
                        />
                    </Field>

                    <Field label="Remark" error={createForm.errors.remark}>
                        <Textarea
                            rows={3}
                            value={createForm.data.remark}
                            onChange={e => createForm.setData('remark', e.target.value)}
                            placeholder="Any notes..."
                        />
                    </Field>

                    <div className="space-y-3 pt-1">
                        <Toggle
                            checked={!!createForm.data.is_active}
                            onChange={v => createForm.setData('is_active', v)}
                            label="Active"
                        />
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                                type="button"
                                className="ui-action-secondary inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                                onClick={() => setCreateOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createForm.processing}
                                className={cn(
                                    'ui-action-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium'
                                )}
                            >
                                <Plus size={16} />
                                Add Car Profile
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleteCar}
                title="Delete Car"
                message={
                    deleteCar
                        ? `Delete car ${deleteCar.plate_number}? If this car still has routes, repair costs, or stock transactions, delete those records first.`
                        : ''
                }
                onClose={() => setDeleteCar(null)}
                onConfirm={() => {
                    if (!deleteCar) return;
                    router.delete(appPath(`/cars/${deleteCar.id}`), {
                        preserveScroll: true,
                        onSuccess: () => setDeleteCar(null),
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
