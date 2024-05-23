import { readable } from 'svelte/store'
import { getLocker, type LockKey } from 'svelte-lock'
import { onDestroy } from 'svelte'

type EventListeners = {
    onStart: Set<Function>
    onFinish: Set<Function>
    onSuccess: Set<Function>
    onFailure: Set<Function>
}

type Options = {
    lock?: LockKey[]
    lockedBy?: LockKey[]
} & Partial<{
    [E in keyof EventListeners]: Function
}>

function executeListeners (listeners: EventListeners, eventName: keyof EventListeners) {
    listeners[eventName].forEach((callback) => {
        try {
            callback()
        } catch (e) {
            console.log(e)
        }
    })

}

function addListeners (listeners: EventListeners, eventName: keyof EventListeners, callback: Function) {
    listeners[eventName].add(callback)

    return () => {
        listeners[eventName].delete(callback)
    }
}

export function stateful<ArgumentsType extends any[]> (fn: (...args: ArgumentsType) => Promise<void>, options: Options = {}) {
    const locker = getLocker()

    const runKey = Symbol()
    const lockKeys = [...(options.lock || []), runKey]
    const observedKeys = [...lockKeys, ...(options.lockedBy || [])]

    const listeners: EventListeners = {
        onStart: new Set(options.onStart ? [options.onStart] : null),
        onFinish: new Set(options.onFinish ? [options.onFinish] : null),
        onSuccess: new Set(options.onSuccess ? [options.onSuccess] : null),
        onFailure: new Set(options.onFailure ? [options.onFailure] : null),
    }

    onDestroy(() => {
        let eventName: keyof EventListeners
        for (eventName in listeners) {
            listeners[eventName].clear()
        }
    })

    return {
        isLocked: locker.observe(readable(observedKeys)),
        isRunning: locker.observe(readable([runKey])),
        onStart: addListeners.bind(undefined, listeners, 'onStart'),
        onFinish: addListeners.bind(undefined, listeners, 'onFinish'),
        onSuccess: addListeners.bind(undefined, listeners, 'onSuccess'),
        onFailure: addListeners.bind(undefined, listeners, 'onFailure'),
        handle: async (...args: ArgumentsType) => {
            if (locker.isLocked(observedKeys))
                return

            const release = locker.lock(lockKeys)

            try {
                executeListeners(listeners, 'onStart')
            } catch (e) {
                release()
                throw e
            }

            try {
                await fn(...args)
                executeListeners(listeners, 'onSuccess')
            } catch (e) {
                release()
                try {
                    executeListeners(listeners, 'onFailure')
                } catch (e) {
                    throw e
                }
                throw e
            }

            try {
                executeListeners(listeners, 'onFinish')
            } catch (e) {
                throw e
            } finally {
                release()
            }
        }
    }
}