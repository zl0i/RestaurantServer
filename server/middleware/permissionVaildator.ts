import express from 'express'
import { MoreThan } from 'typeorm'
import { Tokens } from '../entity/tokens.entity'
import { token_permissions } from '../entity/token_permissions.entity'
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
                forbidFields: any,
                condition?: ICondition,
                isOwn: boolean,
                isAll: boolean
            }
        }
    }
}

async function fromCache(token: string) {
    const key = `permissions_token_${token}`
    let data = await getCache(key)
    return JSON.parse(data)
}

async function saveToCache(token: string, user: Users, id_token: number) {
    const key = `permissions_token_${token}`
    setCache(key, JSON.stringify({
        user: user,
        permissions: await token_permissions.find({ id_token })
    }), 1800)
}

function findPermission(permissions: token_permissions[], resource: Resources, action: Actions) {
    return Array<token_permissions>(...permissions).find((value) => {
        if (value.resource == resource && value.action == action)
            return true
    })
}

async function getPermissions(str_token: string, resource: Resources, action: Actions) {
    const token = await Tokens.findOne({ token: str_token, expired_at: MoreThan(new Date()) })

    if (!token)
        throw new UnauthorizedError("Token invalid")

    const data = await fromCache(token.token)

    const user = data ? data.user : await Users.findOne({ id: token?.id_user })
    const permissions = data ? findPermission(data.permissions, resource, action) : await token_permissions.findOne({ resource: resource, action: action, id_token: token?.id })

    if (!user)
        throw new UnauthorizedError("User not found")

    saveToCache(token.token, user, token.id)

    return { user, permissions };
}


export default function allow(resource: Resources, action: Actions) {
    return async (req: express.Request, res: express.Response, next: Function) => {
        try {
            const { user, permissions } = await getPermissions(req.headers.authorization?.split(" ")[1], resource, action);

            if (!permissions)
                throw new ForbiddenError('You don\'t have permissions for it')

            req.context = {
                permission: `${resource}:${action}:${permissions.scope}`,
                forbidFields: JSON.parse(permissions.forbid_fields),
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