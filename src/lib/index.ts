import { readonly } from 'svelte/store'
import { getLocker, type LockKey } from 'svelte-lock'

type Options = {
    lock?: LockKey[]
    lockedBy?: LockKey[]
    onStart?: () => any
    onFinish?: () => any,
    onSuccess?: () => any,
    onFailure?: () => any,
}

export function stateful<ArgumentsType extends any[]> (fn: (...args: ArgumentsType) => Promise<void>, options: Options = {}) {
    const locker = getLocker()

    const runKey = Symbol()
    const lockKeys = [...(options.lock || []), runKey]
    const observedKeys = [...lockKeys, ...(options.lockedBy || [])]

    const isLocked = locker.observe(observedKeys)
    const isRunning = locker.observe([runKey])

    return {
        isLocked: readonly(isLocked),
        isRunning: readonly(isRunning),
        runKey,
        fn: async (...args: ArgumentsType) => {
            if (locker.isLocked(observedKeys))
                return

            const release = locker.lock(lockKeys)

            try {
                options.onStart?.()
            } catch (e) {
                release()
                throw e
            }

            try {
                await fn(...args)
                options.onSuccess?.()
            } catch (e) {
                release()
                options.onFailure?.()
                throw e
            }

            try {
                options.onFinish?.()
            } catch (e) {
                throw e
            } finally {
                release()
            }
        }
    }
}