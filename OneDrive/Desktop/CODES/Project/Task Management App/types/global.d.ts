declare module '@supabase/ssr' {
    export function createBrowserClient(...args: any[]): any
    export function createServerClient(...args: any[]): any
    export type CookieOptions = any
}

declare module 'next/headers' {
    export const cookies: () => {
        get(name: string): { value: string } | undefined
        set(arg: any): void
    }
}

declare const process: any
