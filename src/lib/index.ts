import { get, type Readable, readonly, writable } from 'svelte/store'
import { getLocker } from 'svelte-lock'

type Locker = ReturnType<typeof getLocker>
type LockingKey = string | string[]

type Options = {
    lockingKey?: LockingKey
    preCheck?: () => boolean
    onStart?: () => any
    onFinish?: () => any
}

function doIsLocked (locker: Locker, id: LockingKey) {
    return Array.isArray(id) ? id.some(_ => locker.isLocked(_)) : locker.isLocked(id)
}

function doLock (locker: Locker, id: LockingKey) {
    Array.isArray(id) ? id.forEach(_ => locker.lock(_)) : locker.lock(id)
}

function doRelease (locker: Locker, id: LockingKey) {
    Array.isArray(id) ? id.forEach(_ => locker.release(_)) : locker.release(id)
}

export function stateful (fn: undefined, options?: Options): {
    isRunning: undefined,
    fn: undefined
}

export function stateful<ArgumentsType extends any[]> (fn: (...args: ArgumentsType) => any, options?: Options): {
    isRunning: Readable<boolean>,
    fn: (...args: ArgumentsType) => Promise<void>
}

export function stateful<ArgumentsType extends any[]> (fn?: (...args: ArgumentsType) => any, options: Options = {}) {
    if (typeof fn === 'undefined')
        return { isRunning: undefined, fn: undefined }

    const locker = getLocker()
    const isRunning = writable(false)

    return {
        isRunning: readonly(isRunning),
        fn: async (...args: ArgumentsType) => {
            if (get(isRunning))
                return

            if (options.lockingKey && doIsLocked(locker, options.lockingKey))
                return

            if (options.preCheck && !options.preCheck())
                return

            isRunning.set(true)
            options.lockingKey && doLock(locker, options.lockingKey)
            options.onStart?.()

            try {
                await fn(...args)
            } catch (e) {
                throw e
            } finally {
                options.onFinish?.()
                options.lockingKey && doRelease(locker, options.lockingKey)
                isRunning.set(false)
            }
        }
    }
}