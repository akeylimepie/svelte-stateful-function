export interface StatefulOptions {
    debounce?: number;
    allowConcurrent?: boolean;
}

export type StatefulFunction = {
    pending: number;
    scheduled: boolean;
    busy: boolean;
    cancelScheduled(): void;
};

/**
 * Wraps a function with reactive status, debounce, and concurrency control.
 */
export function stateful<ArgumentsType extends any[]>(
    fn: (...args: ArgumentsType) => void | Promise<void>,
    options: StatefulOptions = {}
): ((...args: ArgumentsType) => Promise<void>) & StatefulFunction {
    let pending = $state(0);
    let scheduled = $state<ReturnType<typeof setTimeout> | null>(null);

    let pendingResolve: (() => void) | null = null;

    const run = async (args: ArgumentsType): Promise<void> => {
        pending++

        try {
            await fn(...args);
        } finally {
            pending--;
        }
    };

    const wrapper = (...args: ArgumentsType): Promise<void> => {
        if (!options.debounce && pending && !options.allowConcurrent) {
            return Promise.resolve();
        }

        if (options.debounce) {
            if (scheduled) clearTimeout(scheduled);
            pendingResolve?.()

            return new Promise<void>((resolve, reject) => {
                pendingResolve = resolve;

                scheduled = setTimeout(() => {
                    scheduled = null;
                    pendingResolve = null;
                    void run(args).then(resolve).catch(reject);
                }, options.debounce);
            });
        }

        return run(args);
    };

    Object.defineProperties(wrapper, {
        pending: { get: () => pending },
        scheduled: { get: () => scheduled !== null },
        busy: { get: () => pending || scheduled !== null },
        cancelScheduled: {
            value() {
                if (scheduled) {
                    clearTimeout(scheduled);
                    scheduled = null;
                }
                if (pendingResolve) {
                    pendingResolve();
                    pendingResolve = null;
                }
            },
        },
    });

    return wrapper as typeof wrapper & StatefulFunction;
}
