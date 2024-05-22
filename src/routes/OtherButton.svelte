<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements'
    import { getLocker, type LockKey } from 'svelte-lock'
    import { derived, writable } from 'svelte/store'

    export let runningBy: LockKey | null = null
    export let lockedBy: LockKey | null = null
    export let handle: MouseEventHandler<HTMLButtonElement> | null = null

    function generateKeys (key: LockKey | null) {
        return key ? [key] : []
    }

    const locker = getLocker()

    const runningKeys = writable(generateKeys(runningBy))
    const lockingKeys = writable(generateKeys(lockedBy))

    $: $runningKeys = generateKeys(runningBy)
    $: $lockingKeys = generateKeys(lockedBy)

    let isRunningByKey = locker.observe(runningKeys)
    let isLockedByKey = locker.observe(lockingKeys)

    const isRunning = derived([isRunningByKey], (values, set) => {
        set(!!values.some((value) => value))
    }, false)

    const isLocked = derived([isLockedByKey], (values, set) => {
        set(!!values.some((value) => value))
    }, false)
</script>
<button on:click={handle}>
    <slot/>
    {#if $isLocked}(locked){/if}
    {#if $isRunning}(running){/if}
</button>

{$isRunningByKey ? 'running by key' : ''}