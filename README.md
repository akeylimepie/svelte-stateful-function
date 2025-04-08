# svelte-stateful-function

[![Version](https://img.shields.io/npm/v/svelte-stateful-function)](https://www.npmjs.com/package/svelte-stateful-function)
[![Downloads](https://img.shields.io/npm/dm/svelte-stateful-function)](https://www.npmjs.com/package/svelte-stateful-function)

A lightweight utility to wrap functions with reactive status, debounce, and cancellation for Svelte 5.

---

## Installation

```bash
npm install svelte-stateful-function
```

---

## Usage

```svelte
<script lang="ts">
    import { stateful } from 'svelte-stateful-function';
    
    let query = $state('')
    let results = $state([])

    const search = stateful(async (query: string) => {
        results = await fetch(`/api/search?q=${encodeURIComponent(query)}`).then(res => res.json());
    }, { debounce: 300 });
</script>

<input bind:value={query} oninput={() => search(query)} />

{#if search.isIdle}
  <p>Type to search</p>
{:else}
  <p>Searching...</p>
{/if}

<ul>
    {#each results as result}
        <li>{result}</li>
    {/each}
</ul>
```

---

## Reactive State

Each `stateful()` call returns a function with these **reactive properties**:

```ts
search.status;        // $state<'idle' | 'scheduled' | 'executing'>
search.isIdle;        // $derived<boolean>
search.isScheduled;   // $derived<boolean>
search.isExecuting;   // $derived<boolean>
search.isActive;      // $derived<boolean>
```

You can react to changes in your component logic:

```ts
$effect(() => {
  if (search.status === 'scheduled') {
    console.log('Waiting to search...');
  }
});
```

Or in markup:

```svelte
{#if search.isExecuting}
  <p>Searching in progress...</p>
{/if}
```

---

## Options

| Option             | Type      | Default | Description                                              |
|--------------------|-----------|---------|----------------------------------------------------------|
| `debounce`         | `number`  | `—`     | Debounce delay in ms before executing                   |
| `allowConcurrent`  | `boolean` | `false` | Allow concurrent executions if already running          |

---

## API

### `stateful(fn, options?)`

The wrapped function can be either synchronous or asynchronous — both `fn()` and `async fn()` are supported.

Returns a callable function with attached metadata:

```ts
type Status = 'idle' | 'scheduled' | 'executing';

interface StatefulFunction {
  status: Status;
  cancelScheduled(): void;
  isIdle: boolean;
  isScheduled: boolean;
  isExecuting: boolean;
  isActive: boolean;
}
```

---

## Cancellation

You can cancel a scheduled (when using debounce) call with:

```ts
search.cancelScheduled();
```

If the status is `'scheduled'`, it resets back to `'idle'`.

> If `debounce` is not enabled, calling `cancelScheduled()` has no effect — since nothing is scheduled to run later.

To prevent scheduled calls from executing after a component is destroyed, you should also manually call `cancelScheduled()` inside `onDestroy()`:

```ts 
onDestroy(() => {
    search.cancelScheduled();
});
```

---

## License

MIT