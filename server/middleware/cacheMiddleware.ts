import express from 'express'
import redis from 'redis'

const client = redis.createClient({
    host: 'redis'
})

client.on("error", function (error) {
    console.log('[ERROR] Redis isn\'t connected')
    console.error(error);
});

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
                        client.set(key, JSON.stringify(args), 'EX', seconds)
                        target.call(thisArg, args)
                    }
                });
                next()
            }
        })
    }
}

export default client
