<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements'
    import { writable } from 'svelte/store'

    export let isLocked: boolean
    export let isRunning: boolean
    export let successMessage: string = ''
    export let handle: MouseEventHandler<HTMLButtonElement>

    export function foobar () {
        console.log('foobar')
    }

    const isLockedStore = writable(isLocked)
    $: $isLockedStore = isLocked

    const isRunningStore = writable(isRunning)
    $: $isRunningStore = isRunning

    const isSuccess = writable(false)

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
    {#if $isLockedStore}(locked){/if}
    {#if $isRunningStore}(running){/if}
</button>

{#if successOverflow}{successMessage}{/if}