export type Status = 'idle' | 'scheduled' | 'executing';

export interface StatefulOptions {
    debounce?: number;
    allowConcurrent?: boolean;
}

export type StatefulFunction = {
    status: Status;
    cancelScheduled(): void;
    isIdle: boolean;
    isScheduled: boolean;
    isExecuting: boolean;
    isActive: boolean;
};

/**
 * Wraps a function with reactive status, debounce, and concurrency control.
 */
export function stateful<ArgumentsType extends any[]>(
    fn: (...args: ArgumentsType) => void | Promise<void>,
    options: StatefulOptions = {}
): ((...args: ArgumentsType) => Promise<void>) & StatefulFunction {
    let status = $state<Status>('idle');

    const isIdle = $derived(status === 'idle');
    const isScheduled = $derived(status === 'scheduled');
    const isExecuting = $derived(status === 'executing');
    const isActive = $derived(isScheduled || isExecuting);

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingResolve: (() => void) | null = null;

    const run = async (args: ArgumentsType): Promise<void> => {
        status = 'executing';
        try {
            await fn(...args);
        } finally {
            status = debounceTimer ? 'scheduled' : 'idle';
        }
    };

    const wrapper = (...args: ArgumentsType): Promise<void> => {
        if (!options.debounce && status === 'executing' && !options.allowConcurrent) {
            return Promise.resolve();
        }

        if (options.debounce) {
            if (debounceTimer) clearTimeout(debounceTimer);
            pendingResolve?.()

            return new Promise<void>((resolve, reject) => {
                pendingResolve = resolve;

                if (status !== 'executing') {
                    status = 'scheduled';
                }

                debounceTimer = setTimeout(() => {
                    debounceTimer = null;
                    pendingResolve = null;
                    void run(args).then(resolve).catch(reject);
                }, options.debounce);
            });
        }

        return run(args);
    };

    Object.defineProperties(wrapper, {
        status: { get: () => status },
        isIdle: { get: () => isIdle },
        isScheduled: { get: () => isScheduled },
        isExecuting: { get: () => isExecuting },
        isActive: { get: () => isActive },
        cancelScheduled: {
            value() {
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                    debounceTimer = null;
                }
                if (pendingResolve) {
                    pendingResolve();
                    pendingResolve = null;
                }
                if (status === 'scheduled') {
                    status = 'idle';
                }
            },
        },
    });

    return wrapper as typeof wrapper & StatefulFunction;
}
