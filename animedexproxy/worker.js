async function handleRequest(request) {
    const url = new URL(request.url)
    let apiurl = url.searchParams.get('u')
    apiurl = apiurl.replaceAll(' ', '+')

    if (apiurl === null) {
        return new Response('Cors Proxy Is Working\n\nUsage: https://proxy.techzbots1.workers.dev/?u=https://example.com')
    }

    request = new Request(apiurl, request)
    request.headers.set('Origin', new URL(apiurl).origin)

    const host = url.searchParams.get('host')
    if (host !== null) {
        request.headers.set('Host', host)
    }

    let response = await fetch(request)
    response = new Response(response.body, response)

    response.headers.set('Access-Control-Allow-Origin', "*")
    response.headers.append('Vary', 'Origin')
    return response
}

addEventListener('fetch', event => {
    const request = event.request
    const url = new URL(request.url)


    if (
        request.method === 'GET'
    ) {
        const response = handleRequest(request)
        event.respondWith(response)
    } else {
        event.respondWith(async () => {
            return new Response(null, {
                status: 405,
                statusText: 'Method Not Allowed',
            })
        })
    }
})