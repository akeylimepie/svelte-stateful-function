<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements'
    import { getLocker, type LockKey } from 'svelte-lock'

    export let locked = false
    export let running = false
    export let runKey: LockKey
    export let handle: MouseEventHandler<HTMLButtonElement>

    const locker = getLocker()

    const isRunningByKey = locker.observe([runKey])
</script>
<button on:click={handle}>
    <slot/>
    {#if locked}(locked){/if}
    {#if running}(running){/if}
</button>

{$isRunningByKey ? 'running by key' : ''}