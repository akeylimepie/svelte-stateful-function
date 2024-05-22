<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements'
    import type { Readable } from 'svelte/store'

    export let isLocked: Readable<boolean>
    export let isRunning: Readable<boolean>
    export let handle: MouseEventHandler<HTMLButtonElement>
</script>
<button on:click={handle}>
    <slot/>
    {#if $isLocked}(locked){/if}
    {#if $isRunning}(running){/if}
</button>