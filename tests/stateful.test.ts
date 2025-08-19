import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stateful } from '$lib';

function delay(ms: number) {
    return new Promise<void>((res) => setTimeout(res, ms));
}

describe('stateful', () => {
    let calls: string[];

    beforeEach(() => {
        calls = [];
    });

    it('executes async function and tracks status', async () => {
        const fn = vi.fn(async () => {
            calls.push('start');
            await delay(10);
            calls.push('done');
        });

        const wrapped = stateful(fn);

        const result = wrapped();
        expect(wrapped.pending).gt(0);
        await result;

        expect(calls).toEqual(['start', 'done']);
        expect(wrapped.pending).eq(0);
    });

    it('debounces calls correctly', async () => {
        let count = 1;

        const fn = vi.fn((count: number) => {
            calls.push('debounced ' + count);
        });
        const wrapped = stateful(fn, { debounce: 30 });

        const result = Promise.all([
            wrapped(count++),
            wrapped(count++),
            wrapped(count++)
        ])

        expect(wrapped.pending).eq(0);
        expect(wrapped.scheduled).not.eq(null);
        await result;

        expect(fn).toHaveBeenCalledTimes(1);
        expect(calls).toEqual(['debounced 3']);
        expect(wrapped.pending).eq(0);
    });

    it('cancels scheduled call', async () => {
        const fn = vi.fn(() => {
        });
        const wrapped = stateful(fn, { debounce: 50 });

        const result = wrapped();
        wrapped.cancelScheduled();

        expect(wrapped.pending).eq(0);
        await result;

        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('prevents execution if already running (no debounce)', async () => {
        let count = 1;

        const fn = vi.fn(async () => {
            calls.push('run ' + count++);
            await delay(20);
        });

        const wrapped = stateful(fn);

        await Promise.all([wrapped(), wrapped()])

        expect(fn).toHaveBeenCalledTimes(1);
        expect(calls).toEqual(['run 1']);
    });

    it('allows concurrent execution when enabled', async () => {
        const fn = vi.fn(async () => {
        });

        const wrapped = stateful(fn, { allowConcurrent: true });

        await Promise.all([wrapped(), wrapped(), wrapped()])

        expect(fn).toHaveBeenCalledTimes(3);
    });
});