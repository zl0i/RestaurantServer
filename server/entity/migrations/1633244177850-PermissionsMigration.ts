
import {MigrationInterface, QueryRunner} from "typeorm";

export class PermissionsMigration1633244177850 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`UPDATE user_permissions SET forbid_fields='[]';`)
        queryRunner.query(`UPDATE token_permissions SET forbid_fields='[]';`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`UPDATE user_permissions SET forbid_fields='';`)
        queryRunner.query(`UPDATE token_permissions SET forbid_fields='';`)
    }
}
