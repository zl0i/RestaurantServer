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

        res.set('Cache-Control', `privete, max-age=${seconds}`);
        const key: string = (req.context?.permission || req.baseUrl)

        client.get(key, (err, value) => {
            if (value != null) {
                res.json(JSON.parse(value))
            } else {
                res.json = new Proxy(res.json, {
                    apply(target, thisArg, args) {
                        client.set(key, JSON.stringify(args[0]), 'EX', seconds)
                        target.call(thisArg, args[0])
                    }
                });
                next()
            }
        })
    }
}

//export client
