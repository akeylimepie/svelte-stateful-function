<script lang="ts">
    import { getLocker, initLockContext } from 'svelte-lock'
    import { stateful } from '$lib'
    import Button from './Button.svelte'

    initLockContext()

    const locker = getLocker()

    const commonKey = Symbol()
    const lockKey = Symbol()

    const { fn: firstHandle, isRunning: isFirstRunning, isLocked: isFirstLocked } = stateful((e: MouseEvent) => {
        console.log(e)
        return new Promise<Date>((resolve) => {
            console.log('wait')

            setTimeout(() => {
                console.log('done')
                resolve(new Date())
            }, 1000)
        }).then((result) => {
            console.log(result)
        })
    }, {
        lock: [lockKey],
        lockedBy: [commonKey],
        onStart: () => {console.log('first start')},
        onFinish: () => {console.log('first finish')}
    })

    const { fn: secondHandle, isRunning: isSecondRunning, isLocked: isSecondLocked } = stateful((e: MouseEvent) => {
        console.log(e)
        return new Promise<void>((resolve) => {
            console.log('wait')

            setTimeout(() => {
                console.log('done')
                resolve()
            }, 1000)
        })
    }, {
        lock: [lockKey],
        lockedBy: [commonKey],
        onStart: () => console.log('second start'),
        onFinish: () => console.log('second finish')
    })

    let allowHandle = true

    $: if(allowHandle){
        locker.release([commonKey])
    } else {
        locker.lock([commonKey])
    }
</script>

<label>
    <input type="checkbox" bind:checked={allowHandle}> allow handle
</label>

<div>
    <Button locked={$isFirstLocked} running={$isFirstRunning} handle={firstHandle}>first</Button>
</div>

<div>
    <Button locked={$isSecondLocked} running={$isSecondRunning} handle={secondHandle}>second</Button>
</div>