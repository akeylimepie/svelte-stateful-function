<script lang="ts">
    import { lock, observeLock, release } from 'svelte-lock'
    import { stateful } from '$lib'

    const group = 'foo'

    const { fn: firstHandle, isRunning: isFirstRunning } = stateful(() => {
        return new Promise<void>((resolve) => {
            console.log('wait')

            setTimeout(() => {
                console.log('done')
                resolve()
            }, 1000)
        })
    }, {
        preCheck: () => allowHandle && !$isLocked,
        onStart: () => {
            console.log('first start')
            lock(group)
        },
        onFinish: () => {
            console.log('first finish')
            release(group)
        }
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
        preCheck: () => allowHandle && !$isLocked,
        onStart: () => {
            console.log('second start')
            lock(group)
        },
        onFinish: () => {
            console.log('second finish')
            release(group)
        }
    })

    const { fn: thirdHandle } = stateful(undefined)

    let allowHandle = true

    const isLocked = observeLock('group')
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
    <button on:click={thirdHandle} disabled={$isLocked}>third (empty)</button>
</div>