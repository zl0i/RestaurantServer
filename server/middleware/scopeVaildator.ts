import express from 'express'
import { Tokens } from '../entity/tokens'
import { token_permissions } from '../entity/token_permissions'
import { Users } from '../entity/user'
import { ICondition } from './scopes/basicScope'
import ScopeBuilder from './scopes/ScopeBuilder'

declare global {
    namespace Express {
        interface Request {
            context?: {
                user: Users
                permission: string
                condition?: ICondition,
                isOwn: boolean
            }
        }
    }
}

export default function check(atribute: string) {
    return async (req: express.Request, res: express.Response, next: Function) => {
        try {
            const token = await Tokens.findOne({ token: req.headers.authorization?.split(" ")[1] })
            if (!token)
                return res.status(401).json({ message: "Token not found" })

            const user = await Users.findOne({ id: token?.id_user })
            if (!user)
                return res.status(401).json({ message: "User not found" })

            const [resource, action] = atribute.split(":")
            const permissions = await token_permissions.findOne({ resource: resource, action: action, id_token: token?.id })

            req.context = {
                permission: `${resource}:${action}:${permissions.scope}`,
                isOwn: permissions.scope === 'own',
                user: user
            }

            if (permissions) {

                req.context.condition = new ScopeBuilder()
                    .resource(resource || '')
                    .user(user || new Users())
                    .scope(permissions.scope)
                    .init()
                    .build()

                next()
            } else {
                res.status(403).end()
            }
        } catch (e) {
            console.log(e)
            res.status(500).end()
        }
    }
}

