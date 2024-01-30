
async function SaveError(err) {
    const url = 'https://worker-curly-math-37b8.techzbots1.workers.dev/rM8kBk5lzLropzqxZsaxc3L5ndgDzJ21t7lLreY5yG7sGRj2TH'

    await fetch(url, { headers: { text: err } })

}

export { SaveError }