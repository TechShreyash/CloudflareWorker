async function handleRequest(request) {
    const url = new URL(request.url)
    let apiurl = url.searchParams.get('u')

    if (apiurl === null) {
        return new Response('Cors Proxy Is Working\n\nUsage: https://proxy.techzbots1.workers.dev/?u=https://example.com')
    }
    apiurl = apiurl.replaceAll(' ', '+')

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

function handleOptions(request) {
    if (
        request.headers.get('Origin') !== null &&
        request.headers.get('Access-Control-Request-Method') !== null &&
        request.headers.get('Access-Control-Request-Headers') !== null
    ) {
        return new Response(null, {
            headers: corsHeaders,
        })
    } else {
        return new Response(null, {
            headers: {
                Allow: 'GET, HEAD, POST, OPTIONS',
            },
        })
    }
}


addEventListener('fetch', event => {
    const request = event.request
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') {
        // Handle CORS preflight requests
        event.respondWith(handleOptions(request))
    } else if (
        request.method === 'GET' ||
        request.method === 'HEAD' ||
        request.method === 'POST'
    ) {
        // Handle requests to the API server
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

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}