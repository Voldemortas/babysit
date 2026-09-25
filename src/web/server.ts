import indexHtml from './index.html' with {type: 'text'}

function basicAuth(req: Request) {
  if (Bun.env.BABYSIT_NO_AUTH?.toLowerCase() === 'true') {
    return true
  }

  const header = req.headers.get('Authorization')

  if (!header?.startsWith('Basic ')) {
    return false
  }

  const decoded = atob(header.slice(6))
  const [username, password] = decoded.split(':')

  return (
    username === Bun.env.BABYSIT_AUTH_NAME &&
    password === Bun.env.BABYSIT_AUTH_PASS
  )
}

function unauthorized() {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="babysit"',
    },
  })
}

const server = Bun.serve({
  port: Bun.env.BABYSIT_PORT,
  routes: {
    '/': {
      GET: async (req) => {
        if (!basicAuth(req)) return unauthorized()

        return new Response(indexHtml, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        })
      },
    },

    '/monitor.json': {
      GET: async (req) => {
        if (!basicAuth(req)) return unauthorized()

        const jsonlContent = await Bun.file(
          Bun.env.BABYSIT_PATH + '/monitor.jsonl'
        ).text()
        const json = jsonlContent
          .split('\n')
          .filter((x) => x !== '')
          .map((x) => JSON.parse(x))

        return Response.json(json)
      },
    },
    '/stdout': {
      GET: async (req) => {
        if (!basicAuth(req)) return unauthorized()

        const content = await Bun.file(Bun.env.BABYSIT_PATH + '/out.log').text()

        return new Response(content)
      },
    },
    '/stderr': {
      GET: async (req) => {
        if (!basicAuth(req)) return unauthorized()

        const content = await Bun.file(
          Bun.env.BABYSIT_PATH + '/error.log'
        ).text()

        return new Response(content)
      },
    },
  },
})

console.log(`Listening on ${server.url}`)
