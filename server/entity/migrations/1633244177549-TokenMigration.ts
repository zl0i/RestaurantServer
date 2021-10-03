
import {MigrationInterface, QueryRunner} from "typeorm";

export class TokenMigration1633244177549 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`UPDATE tokens SET expired_at='2021-10-03 06:50:39.323649'`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`UPDATE tokens SET expired_at=NULL`)
    }
}
