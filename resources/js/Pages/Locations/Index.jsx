import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import ConfirmDialog from '../../Components/ConfirmDialog';
import { cn } from '../../lib/cn';
import { EllipsisVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useAppPath } from '../../lib/url';

const LOCATION_TYPES = [
    { value: 'main', label: 'Main (Home Base)' },
    { value: 'destination', label: 'Destination' },
];

function Modal({ open, title, subtitle, onClose, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 flex items-end justify-center p-4 md:items-center md:p-6">
                <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#d9e1e8] px-4 py-3">
                        <div>
                            <div className="text-[1.05rem] font-semibold text-[#111827]">{title}</div>
                            <div className="text-xs text-[#64748b]">{subtitle}</div>
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

export default function Index({ locations, filters }) {
    const appPath = useAppPath();
    const [editingId, setEditingId] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteLocation, setDeleteLocation] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);
    const searchForm = useForm({
        search: filters?.search || '',
    });

    const createForm = useForm({
        name: '',
        type: 'main',
        address: '',
        phone_numbers: [''],
    });

    const editForm = useForm({
        name: '',
        type: 'main',
        address: '',
        phone_numbers: [''],
    });

    const data = locations?.data ?? [];

    const startEdit = loc => {
        setEditingId(loc.id);
        editForm.setData({
            name: loc.name || '',
            type: loc.type || 'main',
            address: loc.address || '',
            phone_numbers: Array.isArray(loc.phone_numbers) && loc.phone_numbers.length ? loc.phone_numbers : [''],
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
        <AppLayout title="Locations">
            <Head title="Locations" />

            <div className="overflow-hidden rounded-2xl border border-[#cfd7df] bg-[#f8fafb] shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e1e8] px-4 py-3">
                    <div>
                        <div className="text-[1.05rem] font-semibold text-[#111827]">Locations</div>
                        <div className="text-xs text-[#64748b]">Edit or delete locations</div>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
                        <button
                            type="button"
                            className="ui-action-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus size={16} />
                            Add Location
                        </button>
                        <form
                            className="flex w-full gap-2 lg:w-auto"
                            onSubmit={e => {
                                e.preventDefault();
                                router.get(appPath('/locations'), { search: searchForm.data.search || undefined }, { preserveState: true, replace: true });
                            }}
                        >
                            <input
                                className={cn(
                                    'w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#64748b] sm:w-72',
                                    'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                )}
                                value={searchForm.data.search}
                                onChange={e => searchForm.setData('search', e.target.value)}
                                placeholder="Search name or address"
                            />
                            <button type="submit" className="ui-action-secondary rounded-xl border px-3 py-2 text-sm">
                                Search
                            </button>
                        </form>
                    </div>
                </div>

                <div className="divide-y divide-[#e0e5ea]">
                    {data.map(loc => {
                        const isEditing = editingId === loc.id;
                        return (
                            <div key={loc.id} className="p-3">
                                {!isEditing ? (
                                    <div className="flex flex-col gap-3 rounded-2xl border border-[#d7dde4] bg-white px-3 py-3 md:flex-row md:items-center md:justify-between">
                                        <div className="min-w-0">
                                            <div className="font-semibold text-[#0f172a]">{loc.name}</div>
                                            <div className="mt-1 text-sm text-[#64748b]">
                                                {loc.type} {loc.address ? `| ${loc.address}` : ''}
                                            </div>
                                            {Array.isArray(loc.phone_numbers) && loc.phone_numbers.length ? (
                                                <div className="mt-1 text-sm text-[#64748b]">
                                                    {loc.phone_numbers.filter(Boolean).join(', ')}
                                                </div>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                type="button"
                                                className="ui-action-secondary inline-flex h-9 w-9 items-center justify-center rounded-lg border"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setOpenMenu(current =>
                                                        current?.id === loc.id
                                                            ? null
                                                            : {
                                                                  id: loc.id,
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
                                            editForm.put(appPath(`/locations/${loc.id}`), {
                                                preserveScroll: true,
                                                onSuccess: () => cancelEdit(),
                                            });
                                        }}
                                    >
                                            <div>
                                                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Name</label>
                                                <input
                                                    className={cn(
                                                        'mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                                        'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                                    )}
                                                    value={editForm.data.name}
                                                    onChange={e => editForm.setData('name', e.target.value)}
                                                    required
                                                />
                                                {editForm.errors.name ? (
                                                    <div className="text-xs text-red-600 mt-1">{editForm.errors.name}</div>
                                                ) : null}
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Type</label>
                                                <select
                                                    className={cn(
                                                        'mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a]',
                                                        'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                                    )}
                                                    value={editForm.data.type}
                                                    onChange={e => editForm.setData('type', e.target.value)}
                                                >
                                                    {LOCATION_TYPES.map(t => (
                                                        <option key={t.value} value={t.value}>
                                                            {t.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Address</label>
                                                <input
                                                    className={cn(
                                                        'mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                                        'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                                    )}
                                                    value={editForm.data.address}
                                                    onChange={e => editForm.setData('address', e.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Phone Numbers</label>
                                                    <button
                                                        type="button"
                                                        className="text-xs font-medium text-[#475569] hover:underline"
                                                        onClick={() => editForm.setData('phone_numbers', [...(editForm.data.phone_numbers || []), ''])}
                                                    >
                                                        Add phone
                                                    </button>
                                                </div>
                                                <div className="mt-2 space-y-2">
                                                    {(editForm.data.phone_numbers || ['']).map((p, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <input
                                                                className={cn(
                                                                    'w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                                                    'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                                                )}
                                                                value={p}
                                                                onChange={e => {
                                                                    const next = [...(editForm.data.phone_numbers || [])];
                                                                    next[idx] = e.target.value;
                                                                    editForm.setData('phone_numbers', next);
                                                                }}
                                                                placeholder="e.g. 09xxxxxxxxx"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="h-10 rounded-xl border border-[#cfd7df] px-3 text-sm text-[#475569] hover:bg-slate-50"
                                                                onClick={() => {
                                                                    const next = (editForm.data.phone_numbers || []).filter((_, i) => i !== idx);
                                                                    editForm.setData('phone_numbers', next.length ? next : ['']);
                                                                }}
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
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
                                                    Save
                                                </button>
                                            </div>
                                    </form>
                                )}
                            </div>
                        );
                    })}

                    {data.length === 0 ? (
                        <div className="p-6 text-sm text-[#64748b]">No locations found.</div>
                    ) : null}
                </div>

                <Pagination links={locations?.links ?? []} />
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
                            const location = data.find(item => item.id === openMenu.id);
                            setOpenMenu(null);
                            if (location) startEdit(location);
                        }}
                    >
                        <Pencil size={14} />
                        Edit
                    </button>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                        onClick={() => {
                            const location = data.find(item => item.id === openMenu.id);
                            setOpenMenu(null);
                            if (location) setDeleteLocation(location);
                        }}
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            ) : null}

            <Modal
                open={createOpen}
                title="Add Location"
                subtitle="Create a main or destination location"
                onClose={() => setCreateOpen(false)}
            >
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        createForm.post(appPath('/locations'), {
                            preserveScroll: true,
                            onSuccess: () => {
                                createForm.reset('name', 'address', 'phone_numbers');
                                createForm.setData('type', 'main');
                                createForm.setData('phone_numbers', ['']);
                                setCreateOpen(false);
                            },
                        });
                    }}
                    className="space-y-3"
                >
                    <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Name</label>
                        <input
                            className={cn(
                                'mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                            )}
                            value={createForm.data.name}
                            onChange={e => createForm.setData('name', e.target.value)}
                            required
                        />
                        {createForm.errors.name ? <div className="mt-1 text-xs text-red-600">{createForm.errors.name}</div> : null}
                    </div>

                    <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Type</label>
                        <select
                            className={cn(
                                'mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a]',
                                'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                            )}
                            value={createForm.data.type}
                            onChange={e => createForm.setData('type', e.target.value)}
                        >
                            {LOCATION_TYPES.map(t => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Address</label>
                        <input
                            className={cn(
                                'mt-1 w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                            )}
                            value={createForm.data.address}
                            onChange={e => createForm.setData('address', e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Phone Numbers</label>
                            <button
                                type="button"
                                className="text-xs font-medium text-[#475569] hover:underline"
                                onClick={() => createForm.setData('phone_numbers', [...(createForm.data.phone_numbers || []), ''])}
                            >
                                Add phone
                            </button>
                        </div>
                        <div className="mt-2 space-y-2">
                            {(createForm.data.phone_numbers || ['']).map((p, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        className={cn(
                                            'w-full rounded-xl border border-[#cfd7df] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#64748b]',
                                            'focus:outline-none focus:ring-4 focus:ring-[#1a576b]/15 focus:border-[#1a576b]'
                                        )}
                                        value={p}
                                        onChange={e => {
                                            const next = [...(createForm.data.phone_numbers || [])];
                                            next[idx] = e.target.value;
                                            createForm.setData('phone_numbers', next);
                                        }}
                                        placeholder="e.g. 09xxxxxxxxx"
                                    />
                                    <button
                                        type="button"
                                        className="h-10 rounded-xl border border-[#cfd7df] px-3 text-sm text-[#475569] hover:bg-slate-50"
                                        onClick={() => {
                                            const next = (createForm.data.phone_numbers || []).filter((_, i) => i !== idx);
                                            createForm.setData('phone_numbers', next.length ? next : ['']);
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

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
                            Add Location
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleteLocation}
                title="Delete Location"
                message={
                    deleteLocation
                        ? `Delete location ${deleteLocation.name}? If this location is still used by routes, route legs, warehouses, or cars, delete those related records first.`
                        : ''
                }
                onClose={() => setDeleteLocation(null)}
                onConfirm={() => {
                    if (!deleteLocation) return;
                    router.delete(appPath(`/locations/${deleteLocation.id}`), {
                        preserveScroll: true,
                        onSuccess: () => setDeleteLocation(null),
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
