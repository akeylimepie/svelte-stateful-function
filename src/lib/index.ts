import { readonly } from 'svelte/store'
import { getLocker, type LockKey } from 'svelte-lock'

type Options = {
    lock?: LockKey[]
    lockedBy?: LockKey[]
    onStart?: () => any
    onFinish?: () => any,
}

export function stateful<ArgumentsType extends any[]> (fn: (...args: ArgumentsType) => Promise<void>, options: Options = {}) {
    const locker = getLocker()

    const primaryKey = Symbol()
    const lockKeys = [...(options.lock || []), primaryKey]
    const observedKeys = [...lockKeys, ...(options.lockedBy || [])]

    const isLocked = locker.observe(observedKeys)
    const isRunning = locker.observe([primaryKey])

    return {
        isLocked: readonly(isLocked),
        isRunning: readonly(isRunning),
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
            } catch (e) {
                release()
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