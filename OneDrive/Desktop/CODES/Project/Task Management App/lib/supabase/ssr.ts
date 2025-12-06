// Lightweight shim for the expected '@supabase/ssr' API.
// If the real package is installed, this will delegate to it.
// Otherwise the shim provides noop fallbacks to keep the codebase type-checking.
export function createBrowserClient(...args: any[]) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('@supabase/ssr')
        return mod.createBrowserClient(...args)
    } catch (e) {
        return {} as any
    }
}

export function createServerClient(...args: any[]) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('@supabase/ssr')
        return mod.createServerClient(...args)
    } catch (e) {
        return {} as any
    }
}

export type CookieOptions = any
