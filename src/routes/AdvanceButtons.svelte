<script lang="ts">
    import type { LockKey } from 'svelte-lock'
    import { stateful } from '$lib'
    import { handle } from './utils/handle'
    import StatefulButton from './StatefulButton.svelte'

    export let commonKey: LockKey
    export let lockKey: LockKey

    const third = stateful(() => {
        return handle()
    }, {
        lock: [lockKey],
        lockedBy: [commonKey]
    })
</script>

<div>
    <StatefulButton {...third} successMessage='great success!'>third</StatefulButton>
</div>
