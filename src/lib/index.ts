import { readable, readonly, writable } from 'svelte/store'
import { getLocker, type LockKey } from 'svelte-lock'

type Callback = () => void

type Options = {
    lock?: LockKey[]
    lockedBy?: LockKey[]
    onStart?: Callback
    onFinish?: Callback
    onSuccess?: Callback
    onFailure?: Callback
}

export function stateful<ArgumentsType extends any[]> (fn: (...args: ArgumentsType) => Promise<void>, options: Options = {}) {
    const locker = getLocker()

    const runKey = Symbol()
    const lockKeys = [...(options.lock || []), runKey]
    const observedKeys = [...lockKeys, ...(options.lockedBy || [])]

    const isSuccessful = writable(false)

    return {
        isLocked: locker.observe(readable(observedKeys)),
        isRunning: locker.observe(readable([runKey])),
        isSuccessful: readonly(isSuccessful),
        handle: async (...args: ArgumentsType) => {
            if (locker.isLocked(observedKeys))
                return

            const release = locker.lock(lockKeys)
            isSuccessful.set(false)

            try {
                options.onStart?.()
            } catch (e) {
                release()
                throw e
            }

            try {
                await fn(...args)
                isSuccessful.set(true)
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