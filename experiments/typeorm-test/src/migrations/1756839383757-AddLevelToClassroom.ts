import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLevelToClassroom1756839383757 implements MigrationInterface {
    name = 'AddLevelToClassroom1756839383757'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classroom" ADD "level" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classroom" DROP COLUMN "level"`);
    }

}
