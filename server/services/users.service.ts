import { Users } from "../entity/user.entity"
import { UserPermissions } from "../entity/user_permissions.entity"
import PermissionsBuilder, { Actions, Resources, Scopes } from "../lib/permissionsBuilder"
import bcrypt from 'bcryptjs'
import { FindManyOptions } from "typeorm"
import { BadRequestError, ForbiddenError, NotFoundError } from "../lib/httpErrorHandler"
import ScopeCondition from "../middleware/scopes/ScopeCondition"
import { Serializer } from "../lib/Serializer"
import { UsersInfo } from "../entity/users_info.entity"


export default class UserService {

    static async read(options: FindManyOptions<UsersInfo>) {
        const users: any[] = await UsersInfo.find(options)
        for (const user of users) {
            const permissions = await UserPermissions.find({ id_user: user.id })
            user.permissions = []
            for (const perm of permissions) {
                user.permissions.push(`${perm.resource}:${perm.action}:${perm.scope}`)
            }
        }
        return Serializer.serialize(users, await UsersInfo.count(options))
    }

    static async create(parent: Users, data: any) {

        if (await UsersInfo.findOne({ where: { login: data.login } }))
            throw new BadRequestError('User with this login already exists')

        const user = new Users()
        console.log(user)
        user.password = bcrypt.hashSync(data.password, 5)
        user.info = new UsersInfo()
        user.info.login = data.login
        user.info.name = data.name
        user.info.lastname = data.lastname
        user.info.age = data.age
        user.info.birthday = data.birthday
        user.info.phone = data.phone

        const parentPermissions = await UserPermissions.find({ where: { id_user: parent.id } })

        if (data.permissions.length == 0)
            throw new BadRequestError('Permissions must be defined')

        for (const perm of data.permissions) {
            const [resource, action, scope] = String(perm).split(':')

            if (!resource || !action || !scope)
                throw new BadRequestError('Bad permissions')
            if (!Object.values(Resources).includes(resource as Resources))
                throw new BadRequestError(`The resources "${resource}" does not exist`)
            if (!Object.values(Actions).includes(action as Actions))
                throw new BadRequestError(`The action "${action}" does not exist`)

            const source = parentPermissions.find(item => {
                if (item.resource == resource && item.action == action)
                    return item
            })
            if (!source)
                throw new ForbiddenError('You cannot create a user with more privileges than yours.')

            const parentScope = ScopeCondition.parseScope(source.scope)
            const childScope = ScopeCondition.parseScope(scope)
            if (!Object.values(Scopes).includes(childScope.object as Scopes))
                throw new BadRequestError(`The scope "${childScope.object}" does not exist`)

            if (parentScope.object === childScope.object) {
                childScope.params.forEach(param => {
                    if (parentScope.params.includes(param)) {
                        throw new ForbiddenError('You cannot create a user with more privileges than yours.')
                    }
                })
            }
        }

        await user.save()
        await PermissionsBuilder.setUserPermissions(user.id, data.permissions)
        return user.info
    }

    static async update(id: number, data: any) {
        const user = await UsersInfo.findOne({ id: id })
        if (!user)
            throw new NotFoundError('User not found')

        user.name = data.name ?? user.name
        user.lastname = data.lastname ?? user.lastname
        user.login = data.login ?? user.login
        user.age = Number(data.age) ?? user.age
        user.birthday = new Date(data.birthday) ?? user.birthday
        return await user.save()
    }

    static async delete(id: number) {
        const result = await Users.delete({ id })
        if (result.affected == 0)
            throw new NotFoundError('User not found')

        return result
    }
}