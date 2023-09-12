<script lang="ts">
    import { stateful } from '$lib'

    const {fn: handle, isRunning} = stateful(()=>{
        return new Promise((resolve)=>{
            console.log('wait')

            setTimeout(()=>{
                console.log('done')
                resolve()
            }, 1000)
        })
    }, {
        onStart: ()=>console.log('start'),
        onFinish: ()=>console.log('finish')
    })
</script>

<button on:click={handle}>start {#if $isRunning}(running){/if}</button>