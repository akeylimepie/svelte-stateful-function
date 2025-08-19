<script lang="ts">
    import { stateful } from '$lib'
    import { action } from './utils/action'

    const fn = stateful(() => {
        return action(failure, 2000)
    }, {
        get debounce() {
            return debounce ? debounceValue : 0
        }
    })

    const fnStatus = $derived.by(() => {
        if (fn.pending) {
            return 'pending'
        }

        if (fn.scheduled) {
            return 'scheduled'
        }

        return 'idle'
    })

    let query = $state('')
    let results = $state([])

    const search = stateful(async (query: string) => {
        results = await fetch(`/api/search?q=${encodeURIComponent(query)}`).then(res => res.json());
    }, { debounce: 300 });

    let failure = $state(false)
    let debounce = $state(false)
    let debounceValue = $state(500)

    const concurrencyList = $state(Array(10).fill('idle'))

    const concurrency = stateful(async (i) => {
        concurrencyList[i] = 'pending'

        const delay = Math.floor(Math.random() * 5 + 1) * 1000
        try {
            await action(failure, delay);
        } finally {
            concurrencyList[i] = 'idle'
        }
    }, { allowConcurrent: true })

    function multipleRuns() {
        for (let i = 0; i < concurrencyList.length; i++) {
            concurrency(i)
        }
    }
</script>

<label>
    <input type="checkbox" bind:checked={failure}> failure
</label>

<div class="slider">
    <label>
        <input type="checkbox" bind:checked={debounce}> debounce
    </label>

    <input bind:value={debounceValue} type="range" min="0" max="5000" step="100"/>
    {debounceValue}ms
</div>

<div>
    {#if fn.scheduled}
        <button onclick={fn.cancelScheduled}>Cancel scheduled</button>
    {:else }
        <button onclick={fn}>Run function</button>
    {/if}

    {fnStatus}
</div>

<input bind:value={query} oninput={() => search(query)}/>

{#if search.busy}
    <p>Searching...</p>
{:else if !search.pending}
    <p>Type to search</p>
{/if}

<ul>
    {#each results as result}
        <li>{result}</li>
    {/each}
</ul>

<button onclick={multipleRuns}>Run concurrency</button> {concurrency.pending}

<ul>
    {#each concurrencyList as item, i (i)}
        <li>{item}</li>
    {/each}
</ul>

<style>
    .slider {
        display: inline flex;
        gap: 1ch;
        align-items: center;
    }
</style>