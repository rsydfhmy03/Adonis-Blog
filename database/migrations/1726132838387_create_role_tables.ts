import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "user.roles";
  public static tags = ["roles"];
  public async up() {
    await this.schema.createSchemaIfNotExists("user");

    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      table.string("code").notNullable();
      table.string("name").notNullable();
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  /**
   * Revert the changes made by the up method.
   *
   * It drops the table created by the up method.
   */

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
