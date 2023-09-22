<script lang="ts">
    import { observeLock } from 'svelte-lock'
    import { stateful } from '$lib'

    const lockingKey = 'foo'

    const { fn: firstHandle, isRunning: isFirstRunning } = stateful((e: MouseEvent) => {
        console.log(e)
        return new Promise<void>((resolve) => {
            console.log('wait')

            setTimeout(() => {
                console.log('done')
                resolve()
            }, 1000)
        })
    }, {
        lockingKey,
        preCheck: () => allowHandle,
        onStart: () => console.log('first start'),
        onFinish: () => console.log('first finish')
    })

    const { fn: secondHandle, isRunning: isSecondRunning } = stateful(() => {
        return new Promise<void>((resolve) => {
            console.log('wait')

            setTimeout(() => {
                console.log('done')
                resolve()
            }, 1000)
        })
    }, {
        lockingKey,
        preCheck: () => allowHandle && !$isLocked,
        onStart: () => console.log('second start'),
        onFinish: () => console.log('second finish')
    })

    const { fn: thirdHandle, isRunning: isThirdRunning } = stateful(undefined)

    let allowHandle = true

    const isLocked = observeLock(lockingKey)
</script>

<label>
    <input type="checkbox" bind:checked={allowHandle}> allow handle
</label>

<div>
    <button on:click={firstHandle} disabled={$isLocked}>first
        {#if $isFirstRunning}(running){/if}
    </button>
</div>

<div>
    <button on:click={secondHandle} disabled={$isLocked}>second
        {#if $isSecondRunning}(running){/if}
    </button>
</div>

<div>
    <button on:click={thirdHandle} disabled={$isLocked}>third (empty)
        {#if $isThirdRunning}(running){/if}
    </button>
</div>