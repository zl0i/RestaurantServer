import express from 'express'
import redis from 'redis'

let client: redis.RedisClient;

if (process.env['NODE_ENV'] !== 'test') {
    client = redis.createClient({
        host: 'redis'
    })

    client.on("error", function (error) {
        console.log('[ERROR] Redis isn\'t connected')
        console.error(error);
    });
}

export function cache(seconds: number) {
    return (req: express.Request, res: express.Response, next: Function) => {

        if (req.context?.isOwn)
            return next()

        res.set('Cache-Control', `private, max-age=${seconds}`);
        const key: string = (req.context?.permission || req.baseUrl + req.url)

        client.get(key, (_err: Error, value: string) => {
            if (value != null) {
                const obj = JSON.parse(value)
                res[obj.method](obj.data)
            } else {
                res.json = new Proxy(res.json, {
                    apply(target, thisArg, args) {
                        client.set(key,  JSON.stringify({
                            method: 'json',
                            data: args[0]
                        }), 'EX', seconds)
                        target.call(thisArg, args[0])
                    }
                });
                res.redirect = new Proxy(res.redirect, {
                    apply(target, thisArg, args) {
                        client.set(key, JSON.stringify({
                            method: 'redirect',
                            data: args[0]
                        }), 'EX', seconds)
                        target.call(thisArg, args[0])
                    }
                });
                next()
            }
        })
    }
}
