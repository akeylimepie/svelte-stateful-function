<script lang="ts">
    import { stateful } from '$lib'
    import { action } from './utils/action'

    const first = stateful(() => {
        return action(failure, 2000)
    }, {
        get debounce() {
            return debounce ? debounceValue : 0
        }
    })

    let query = $state('')
    let results = $state([])

    const search = stateful(async (query: string) => {
        results = await fetch(`/api/search?q=${encodeURIComponent(query)}`).then(res => res.json());
    }, { debounce: 300 });

    let failure = $state(false)
    let debounce = $state(false)
    let debounceValue = $state(500)
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
    <button onclick={first}>Run function</button> {first.status}
</div>

<input bind:value={query} oninput={() => search(query)}/>

{#if search.isActive}
    <p>Searching...</p>
{:else if search.isIdle}
    <p>Type to search</p>
{/if}

<ul>
    {#each results as result}
        <li>{result}</li>
    {/each}
</ul>

<style>
    .slider {
        display: inline flex;
        gap: 1ch;
        align-items: center;
    }
</style>