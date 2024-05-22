<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements'
    import type { Readable } from 'svelte/store'

    export let isLocked: Readable<boolean>
    export let isRunning: Readable<boolean>
    export let isSuccess: Readable<boolean>
    export let successMessage: string = ''
    export let handle: MouseEventHandler<HTMLButtonElement>

    $: console.log('is success', $isSuccess)

    let successOverflowTimer: number
    let successOverflow = false

    $: if ($isSuccess) {
        successOverflow = true
        // clearTimeout(successOverflowTimer)
        successOverflowTimer = setTimeout(() => {
            console.log('hide')
            successOverflow = false
        }, 2000)
    } else {
        console.log('clear')
        successOverflow = false
        clearTimeout(successOverflowTimer)
    }
</script>
<button on:click={handle}>
    <slot/>
    {#if $isLocked}(locked){/if}
    {#if $isRunning}(running){/if}
</button>

{#if successOverflow}{successMessage}{/if}