import { get, readonly, writable } from 'svelte/store'

type Options = {
    preCheck?: () => boolean
    onStart?: () => any
    onFinish?: () => any
}

export const stateful = function (fn?: () => any, options: Options = {}) {
    if (typeof fn === 'undefined')
        return {
            isRunning: undefined,
            fn: undefined
        }

    const isRunning = writable(false)

    return {
        isRunning: readonly(isRunning),
        fn: async () => {
            if (get(isRunning))
                return

            if (options.preCheck && !options.preCheck())
                return

            isRunning.set(true)
            options.onStart && options.onStart()

            try {
                await fn()
            } catch (e) {
                throw e
            } finally {
                isRunning.set(false)
                options.onFinish && options.onFinish()
            }
        }
    }
}