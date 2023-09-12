import { get, readonly, writable } from 'svelte/store'

type Options = {
    onStart?: () => any
    onFinish?: () => any
}

export const stateful = function (fn?: () => any, options: Options = {}) {
    if (typeof fn === 'undefined')
        return {
            isRunning: undefined,
            fn: async () => {}
        }

    const isRunning = writable(false)

    return {
        isRunning: readonly(isRunning),
        fn: async () => {
            if (get(isRunning))
                return

            isRunning.set(true)
            options.onStart?.call(undefined)

            try {
                await fn()
            } catch (e) {
                throw e
            } finally {
                isRunning.set(false)
                options.onFinish?.call(undefined)
            }
        }
    }
}