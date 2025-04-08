import { json } from '@sveltejs/kit';

export const GET = async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)

    return json(['foo', 'bar']);
};