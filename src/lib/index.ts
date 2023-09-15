import { get, readonly, writable } from 'svelte/store'
import { isLocked, lock, release } from 'svelte-lock'

type Options = {
    lockingKey?: string
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

            if (options.lockingKey && isLocked(options.lockingKey))
                return

            if (options.preCheck && !options.preCheck())
                return

            isRunning.set(true)
            options.lockingKey && lock(options.lockingKey)
            options.onStart && options.onStart()

            try {
                await fn()
            } catch (e) {
                throw e
            } finally {
                options.onFinish && options.onFinish()
                options.lockingKey && release(options.lockingKey)
                isRunning.set(false)
            }
        }
    }
}