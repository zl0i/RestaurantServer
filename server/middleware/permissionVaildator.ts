import express from 'express'
import { MoreThan } from 'typeorm'
import { Tokens } from '../entity/tokens.entity'
import { TokenPermissions } from '../entity/token_permissions.entity'
import { Users } from '../entity/user.entity'
import { ForbiddenError, UnauthorizedError } from '../lib/errors'
import HttpErrorHandler from '../lib/httpErrorHandler'
import { Actions, Resources, Scopes } from '../lib/permissionsBuilder'
import { getCache, setCache } from './cacheMiddleware'
import { ICondition } from './scopes/basicScope'
import ScopeCondition from './scopes/ScopeCondition'

declare global {
    namespace Express {
        interface Request {
            context?: {
                user: Users
                permission: string
                condition?: ICondition,
                isOwn: boolean,
                isAll: boolean
            }
        }
    }
}


export default function allow(resource: Resources, action: Actions) {
    return async (req: express.Request, res: express.Response, next: Function) => {
        try {
            const token = await Tokens.findOne({ token: req.headers.authorization?.split(" ")[1], expired_at: MoreThan(new Date()) })
            if (!token)
                throw new UnauthorizedError('Token invalid')

            const key_cache = `permissions_token_${token.token}`
            let data_cache = await getCache(key_cache)
            let user: Users, permissions: TokenPermissions;

            if (data_cache) {
                data_cache = (JSON.parse(data_cache))
                permissions = Array<TokenPermissions>(...data_cache.permissions).find((value) => {
                    if (value.resource == resource && value.action == action)
                        return true
                })
                user = data_cache.user
            } else {
                user = await Users.findOne({ id: token?.id_user })
                if (!user)
                    throw new UnauthorizedError('User not found')

                permissions = await TokenPermissions.findOne({ resource: resource, action: action, id_token: token?.id })

                setCache(key_cache, JSON.stringify({
                    user: user,
                    permissions: await TokenPermissions.find({ id_token: token?.id })
                }), 1800)
            }

            if (!permissions)
                throw new ForbiddenError('You don\'t have permissions for it')

            req.context = {
                permission: `${resource}:${action}:${permissions.scope}`,
                isOwn: permissions.scope === Scopes.own,
                isAll: permissions.scope === Scopes.all,
                user: user
            }

            const condition = new ScopeCondition(resource, permissions.scope, user)
            req.context.condition = condition.getCondition()
            next()
        } catch (e) {
            HttpErrorHandler.handle(e, res)
        }
    }
}