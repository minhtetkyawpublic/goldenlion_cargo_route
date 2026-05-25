import { usePage } from '@inertiajs/react';

export function normalizeBasePath(value = '') {
    if (!value || value === '/') return '';

    const trimmed = String(value).trim().replace(/^\/+|\/+$/g, '');

    return trimmed ? `/${trimmed}` : '';
}

export function appPath(path = '', basePath = '') {
    const normalizedBasePath = normalizeBasePath(basePath);
    const normalizedPath = path ? `/${String(path).replace(/^\/+/, '')}` : '';

    if (!normalizedBasePath) {
        return normalizedPath || '/';
    }

    return `${normalizedBasePath}${normalizedPath || ''}`;
}

export function appAsset(path = '', appUrl = '', basePath = '') {
    const normalizedPath = String(path).replace(/^\/+/, '');
    const normalizedAppUrl = String(appUrl || '').trim().replace(/\/+$/, '');

    if (normalizedAppUrl) {
        return `${normalizedAppUrl}/${normalizedPath}`;
    }

    return appPath(`/${normalizedPath}`, basePath);
}

export function stripBasePath(path = '', basePath = '') {
    const normalizedBasePath = normalizeBasePath(basePath);

    if (!normalizedBasePath) {
        return path || '/';
    }

    if (path === normalizedBasePath) {
        return '/';
    }

    return path.startsWith(`${normalizedBasePath}/`) ? path.slice(normalizedBasePath.length) : path || '/';
}

export function useAppBasePath() {
    const page = usePage();

    return normalizeBasePath(page.props.app?.basePath ?? '');
}

export function useAppPath() {
    const basePath = useAppBasePath();

    return path => appPath(path, basePath);
}

export function useAppAsset() {
    const page = usePage();
    const basePath = normalizeBasePath(page.props.app?.basePath ?? '');
    const appUrl = page.props.app?.url ?? '';

    return path => appAsset(path, appUrl, basePath);
}
