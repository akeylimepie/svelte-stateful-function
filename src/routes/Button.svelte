<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements'

    export let isLocked = false
    export let isRunning = false
    export let handle: MouseEventHandler<HTMLButtonElement>
</script>
<button on:click={handle}>
    <slot/>
    {#if isLocked}(locked){/if}
    {#if isRunning}(running){/if}
</button>