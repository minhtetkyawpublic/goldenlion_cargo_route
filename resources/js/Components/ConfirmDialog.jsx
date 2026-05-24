import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/cn';

export default function ConfirmDialog({
    open,
    title = 'Confirm Delete',
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    onConfirm,
    onClose,
    danger = true,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 flex items-end justify-center p-4 md:items-center md:p-6">
                <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
                                <AlertTriangle size={18} />
                            </div>
                            <div>
                                <div className="text-base font-semibold text-slate-900">{title}</div>
                                <div className="mt-1 text-sm leading-6 text-slate-600">{message}</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                            onClick={onClose}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-4">
                        <button
                            type="button"
                            className="ui-action-secondary rounded-lg border px-4 py-2 text-sm font-medium"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={cn(
                                'rounded-lg px-4 py-2 text-sm font-medium',
                                danger ? 'ui-action-danger border' : 'ui-action-primary'
                            )}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
