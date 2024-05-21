<script lang="ts">
    import { getLocker, initLockContext } from 'svelte-lock'
    import { stateful } from '$lib'
    import Button from './Button.svelte'
    import OtherButton from './OtherButton.svelte'

    initLockContext()

    const locker = getLocker()

    const commonKey = Symbol()
    const lockKey = Symbol()

    const {
        handle: firstHandle,
        isRunning: isFirstRunning,
        isLocked: isFirstLocked,
        runKey: firstRunKey
    } = stateful((e: MouseEvent) => {
        console.log(e)
        return new Promise<Date>((resolve, reject) => {
            console.log('wait')

            setTimeout(() => {
                if (failure)
                    reject()

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
        onFinish: () => {console.log('first finish')},
        onSuccess: () => {console.log('first success')},
        onFailure: () => {console.log('first failure')},
    })

    const {
        handle: secondHandle,
        isRunning: isSecondRunning,
        isLocked: isSecondLocked,
        runKey: secondRunKey
    } = stateful((e: MouseEvent) => {
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

    const third = stateful((e: MouseEvent) => {
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
    let failure = false

    $: if (allowHandle) {
        locker.release([commonKey])
    } else {
        locker.lock([commonKey])
    }

    let firstThirdLockKey = Symbol()
    let secondThirdLockKey = Symbol()

    let lockThird = false
    let swapLockThird = false

    let thirdLockKey = swapLockThird ? secondThirdLockKey : firstThirdLockKey

    $: if (lockThird) {
        locker.lock([firstThirdLockKey])
    } else {
        locker.release([firstThirdLockKey])
    }

    $: thirdLockKey = swapLockThird ? secondThirdLockKey : firstThirdLockKey
</script>

<label>
    <input type="checkbox" bind:checked={allowHandle}> allow handle
</label>

<label>
    <input type="checkbox" bind:checked={failure}> failure
</label>

<div>
    <Button locked={$isFirstLocked} running={$isFirstRunning} handle={firstHandle}
            runKey={firstRunKey}>first
    </Button>
</div>
<div>
    <Button locked={$isSecondLocked} running={$isSecondRunning} handle={secondHandle}
            runKey={secondRunKey}>first
    </Button>
</div>

<label>
    <input type="checkbox" bind:checked={lockThird}> lock original third
</label>

<label>
    <input type="checkbox" bind:checked={swapLockThird}> swap third locking key
</label>

<div>
    <OtherButton lockedBy={thirdLockKey}>third</OtherButton>
</div>