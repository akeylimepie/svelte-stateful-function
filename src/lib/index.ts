import { get, readonly, writable } from 'svelte/store'
import { isLocked, lock, release } from 'svelte-lock'

type LockingKey = string | string[]

type Options = {
    lockingKey?: LockingKey
    preCheck?: () => boolean
    onStart?: () => any
    onFinish?: () => any
}

function doIsLocked (id: LockingKey) {
    if (Array.isArray(id)) {
        return id.some(_ => isLocked(_))
    } else {
        return isLocked(id)
    }
}

function doLock (id: LockingKey) {
    if (Array.isArray(id)) {
        id.forEach(_ => lock(_))
    } else {
        lock(id)
    }
}

function doRelease (id: LockingKey) {
    if (Array.isArray(id)) {
        id.forEach(_ => release(_))
    } else {
        release(id)
    }
}

export const stateful = function <ArgumentsType extends any[]> (fn?: (...args: ArgumentsType) => any, options: Options = {}) {
    if (typeof fn === 'undefined')
        return {
            isRunning: undefined,
            fn: undefined
        }

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
            options.onStart && options.onStart()

            try {
                await fn(...args)
            } catch (e) {
                throw e
            } finally {
                options.onFinish && options.onFinish()
                options.lockingKey && doRelease(options.lockingKey)
                isRunning.set(false)
            }
        }
    }
}