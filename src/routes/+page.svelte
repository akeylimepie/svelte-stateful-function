<script lang="ts">
    import { initLockContext, getLocker } from 'svelte-lock'
    import { stateful } from '$lib'

    initLockContext()

    const locker = getLocker()
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

    const { fn: secondHandle, isRunning: isSecondRunning } = stateful((e: MouseEvent) => {
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
        onStart: () => console.log('second start'),
        onFinish: () => console.log('second finish')
    })

    const { fn: thirdHandle, isRunning: isThirdRunning } = stateful(undefined)

    let allowHandle = true

    const isLocked = locker.observe(lockingKey)
</script>

<label>
    <input type="checkbox" bind:checked={allowHandle}> allow handle
</label>

<div>
    <button on:click={firstHandle}>first
        {#if $isLocked}(locked){/if}
        {#if $isFirstRunning}(running){/if}
    </button>
</div>

<div>
    <button on:click={secondHandle} disabled={$isLocked}>second
        {#if $isLocked}(locked){/if}
        {#if $isSecondRunning}(running){/if}
    </button>
</div>

<div>
    <button on:click={thirdHandle} disabled={$isLocked}>third (empty)
        {#if $isLocked}(locked){/if}
        {#if $isThirdRunning}(running){/if}
    </button>
</div>