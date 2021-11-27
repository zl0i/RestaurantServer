import { MigrationInterface, QueryRunner } from "typeorm";

export class UserInfo1637921857114 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`INSERT INTO users_info (id, name, lastname, login, age, birthday, phone, verify_phone) 
                           SELECT id, name, lastname, login, age, birthday, phone, verify_phone FROM users;`)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
