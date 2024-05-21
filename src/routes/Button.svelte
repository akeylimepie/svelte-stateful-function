<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements'
    import { getLocker, type LockKey } from 'svelte-lock'
    import { writable } from 'svelte/store'

    export let locked = false
    export let running = false
    export let runKey: LockKey
    export let handle: MouseEventHandler<HTMLButtonElement>

    const locker = getLocker()

    const lockingKeys = writable([runKey])
    $: $lockingKeys = [runKey]

    const isRunningByKey = locker.observe(lockingKeys)
</script>
<button on:click={handle}>
    <slot/>
    {#if locked}(locked){/if}
    {#if running}(running){/if}
</button>

{$isRunningByKey ? 'running by key' : ''}