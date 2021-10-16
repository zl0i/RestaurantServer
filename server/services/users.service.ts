import { Tokens } from "../entity/tokens"
import { token_permissions } from "../entity/token_permissions"
import { Users } from "../entity/user"
import { user_permissions } from "../entity/user_permissions"
import HttpError from "../lib/httpError"
import PermissionsBuilder, { UserRoles } from "../lib/permissionsBuilder"
import bcrypt from 'bcryptjs'
import { ICondition } from "../middleware/scopes/basicScope"
import { In } from "typeorm"


export default class UserService {

    static async read(icondition: ICondition) {
        const condition: object = {}
        if (icondition.value.length > 0) {
            condition[icondition.key] = In(icondition.value)
        }

        const users: any = await Users.find(condition)
        for (const user of users) {
            const permissions = await user_permissions.find({ id_user: user.id })
            user.permissions = new Array()
            user.removePrivateData()
            for (const perm of permissions) {
                user.permissions.push(`${perm.resource}:${perm.action}:${perm.scope}`)
            }
        }
        return users;
    }

    static async create(login: string, password: string) {
        const user = new Users()
        user.login = login
        user.password = bcrypt.hashSync(password, 5)
        await user.save()
        PermissionsBuilder.setUserRolePermissions(user.id, UserRoles.admin)
        return user
    }

    static async update(id: number, data: object) {
        const user = await Users.findOne({ id: id })
        user.name = data['name'] || user.name
        user.lastname = data['lastname'] || user.lastname
        user.login = data['login'] || user.login
        user.age = Number(data['age']) || user.age
        user.birthday = new Date(data['birthday']) || user.birthday
        await user.save()
        return user.removePrivateData()
    }

    static async delete(id: number) {
        const user = await Users.findOne({ id })
        if (user) {
            await user.remove()
            await user_permissions.delete({ id_user: id })
            const token = await Tokens.findOne({ id_user: id })
            if (token) {
                await token_permissions.delete({ id_token: token.id })
                await token.remove()
            }
        } else {
            throw new HttpError(400, 'User not found')
        }

    }
}