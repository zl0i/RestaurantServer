import express from 'express'
import client from 'prom-client'

const register = new client.Registry()

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register, prefix: "app_" })

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'app_http_request_duration_seconds',
    help: 'Duration of HTTP requests in microseconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
})

register.registerMetric(httpRequestDurationMicroseconds)

export function middleware(req: express.Request, res: express.Response, next: Function) {
    const end = httpRequestDurationMicroseconds.startTimer()
    const url = req.url
    next()
    res.on('finish', () => {
        end({ route: url, code: res.statusCode, method: req.method })
    })
}

export async function metricsRoute(_req: express.Request, res: express.Response,) {
    res.setHeader('Content-Type', register.contentType)
    res.end(await register.metrics())
}