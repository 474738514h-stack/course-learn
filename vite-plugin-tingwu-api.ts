import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

export function tingwuApiPlugin(): Plugin {
  return {
    name: 'tingwu-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (!url?.startsWith('/api/tingwu')) {
          next()
          return
        }

        try {
          const mod = await import('./server/tingwuService.mjs')

          if (url === '/api/tingwu/status' && req.method === 'GET') {
            sendJson(res, 200, { configured: mod.tingwuConfigured() })
            return
          }

          if (url === '/api/tingwu/start' && req.method === 'POST') {
            const data = await mod.startRealtimeTask()
            sendJson(res, 200, data)
            return
          }

          if (url === '/api/tingwu/stop' && req.method === 'POST') {
            const raw = await readBody(req)
            const { taskId } = JSON.parse(raw || '{}') as { taskId?: string }
            if (!taskId) {
              sendJson(res, 400, { error: '缺少 taskId' })
              return
            }
            const data = await mod.stopRealtimeTask(taskId)
            sendJson(res, 200, data)
            return
          }

          sendJson(res, 404, { error: 'Not found' })
        } catch (err) {
          const message = err instanceof Error ? err.message : '听悟 API 错误'
          sendJson(res, 500, { error: message })
        }
      })
    },
  }
}
