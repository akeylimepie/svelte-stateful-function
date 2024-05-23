<script lang="ts">
    import { getLocker, initLockContext } from 'svelte-lock'
    import { stateful } from '$lib'
    import Button from './Button.svelte'
    import OtherButton from './OtherButton.svelte'
    import { action } from './utils/action'
    import AdvanceButtons from './AdvanceButtons.svelte'

    initLockContext()

    const locker = getLocker()

    const commonKey = Symbol()
    const lockKey = Symbol()

    const {
        handle: firstHandle,
        isRunning: isFirstRunning,
        isLocked: isFirstLocked,
    } = stateful(() => {
        return action(failure)
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
    } = stateful(() => {
        return action(failure)
    }, {
        lock: [lockKey],
        lockedBy: [commonKey],
        onStart: () => console.log('second start'),
        onFinish: () => console.log('second finish')
    })

    let allowHandle = true
    let failure = false
    let advanced = false

    $: if (allowHandle) {
        locker.release([commonKey])
    } else {
        locker.lock([commonKey])
    }

    let firstFourthLockKey = Symbol()
    let secondFourthLockKey = Symbol()

    let lockFourth = false
    let swapLockFourth = false

    let fourthLockKey = swapLockFourth ? secondFourthLockKey : firstFourthLockKey

    $: if (lockFourth) {
        locker.lock([firstFourthLockKey])
    } else {
        locker.release([firstFourthLockKey])
    }

    $: fourthLockKey = swapLockFourth ? secondFourthLockKey : firstFourthLockKey
</script>

<label>
    <input type="checkbox" bind:checked={allowHandle}> allow handle
</label>

<label>
    <input type="checkbox" bind:checked={failure}> failure
</label>

<label>
    <input type="checkbox" bind:checked={advanced}> advanced
</label>

<div>
    <div>
        <Button isLocked={$isFirstLocked} isRunning={$isFirstRunning} handle={firstHandle}>first
        </Button>
    </div>
    <div>
        <Button isLocked={$isSecondLocked} isRunning={$isSecondRunning} handle={secondHandle}>second
        </Button>
    </div>
</div>

<br/>

<div>
    <label>
        <input type="checkbox" bind:checked={lockFourth}> lock original fourth
    </label>

    <label>
        <input type="checkbox" bind:checked={swapLockFourth}> swap fourth locking key
    </label>

    <div>
        <OtherButton lockedBy={fourthLockKey}>fourth</OtherButton>
    </div>
</div>

{#if advanced}
    <AdvanceButtons {lockKey} {commonKey}/>
{/if}