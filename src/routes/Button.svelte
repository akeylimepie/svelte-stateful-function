<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements'

    export let locked = false
    export let running = false
    export let handle: MouseEventHandler<HTMLButtonElement>
</script>
<button on:click={handle}>
    <slot/>
    {#if locked}(locked){/if}
    {#if running}(running){/if}
</button>