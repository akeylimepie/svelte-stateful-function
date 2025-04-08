export function action(failure = false, duration: number = 1000) {
    return new Promise<void>((resolve, reject) => {
        console.log('wait')

        setTimeout(() => {
            if (failure) {
                console.log('failure')
                reject()
                return
            }

            console.log('done')
            resolve()
        }, duration)
    })
}