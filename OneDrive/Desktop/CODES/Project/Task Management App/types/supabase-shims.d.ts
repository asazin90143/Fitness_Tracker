declare module '@supabase/ssr' {
    export function createBrowserClient(url?: string, key?: string, opts?: any): any
    export function createServerClient(url?: string, key?: string, opts?: any): any
    export type CookieOptions = any
}

declare module 'next/headers' {
    export const cookies: () => {
        get(name: string): { value: string } | undefined
        set(arg: any): void
    }
}
