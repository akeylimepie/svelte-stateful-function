<script lang="ts">
    import type { LockKey } from 'svelte-lock'
    import { stateful } from '$lib'
    import { action } from './utils/action'
    import StatefulButton from './StatefulButton.svelte'
    import { onMount } from 'svelte'

    export let commonKey: LockKey
    export let lockKey: LockKey

    let button: StatefulButton

    const { isRunning, isLocked, handle, onStart } = stateful(() => {
        return action()
    }, {
        lock: [lockKey],
        lockedBy: [commonKey],
        onStart: () => {
            button.foobar()
        }
    })

    onMount(()=>{
        handle()

        onStart(()=>{
            console.log('test')
        })
    })
</script>

<div>
    <StatefulButton bind:this={button} isRunning={$isRunning} isLocked={$isLocked} {handle}
                    successMessage='great success!'>third
    </StatefulButton>
</div>
