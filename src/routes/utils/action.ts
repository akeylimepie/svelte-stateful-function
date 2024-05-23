export function action (failure = false, duration: number = 1000) {
    return new Promise<void>((resolve, reject) => {
        console.log('wait')

        if (failure) {
            console.log('failure')
            reject()
        }

        setTimeout(() => {
            console.log('done')
            resolve()
        }, duration)
    })
}