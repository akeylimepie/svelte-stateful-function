import { get, type Readable, readonly, writable } from 'svelte/store'
import { isLocked, lock, release } from 'svelte-lock'

type LockingKey = string | string[]

type Options = {
    lockingKey?: LockingKey
    preCheck?: () => boolean
    onStart?: () => any
    onFinish?: () => any
}

function doIsLocked (id: LockingKey) {
    return Array.isArray(id) ? id.some(_ => isLocked(_)) : isLocked(id)
}

function doLock (id: LockingKey) {
    Array.isArray(id) ? id.forEach(_ => lock(_)) : lock(id)
}

function doRelease (id: LockingKey) {
    Array.isArray(id) ? id.forEach(_ => release(_)) : release(id)
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

    const isRunning = writable(false)

    return {
        isRunning: readonly(isRunning),
        fn: async (...args: ArgumentsType) => {
            if (get(isRunning))
                return

            if (options.lockingKey && doIsLocked(options.lockingKey))
                return

            if (options.preCheck && !options.preCheck())
                return

            isRunning.set(true)
            options.lockingKey && doLock(options.lockingKey)
            options.onStart?.()

            try {
                await fn(...args)
            } catch (e) {
                throw e
            } finally {
                options.onFinish?.()
                options.lockingKey && doRelease(options.lockingKey)
                isRunning.set(false)
            }
        }
    }
}