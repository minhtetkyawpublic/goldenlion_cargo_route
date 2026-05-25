import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const appUrl = process.env.APP_URL || ''
const appUrlPath = (() => {
    try {
        return new URL(appUrl).pathname.replace(/\/$/, '')
    } catch {
        return ''
    }
})()

export default defineConfig({
    base: appUrlPath ? `${appUrlPath}/build/` : '/build/',
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
})
