import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "user.accounts";
  public static tags = ["accounts"];
  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.integer("role_id").notNullable().unsigned(); // Remove the second role_id column
      table.string("username", 100).notNullable().unique();
      table.text("pwd").notNullable();
      table.string("email", 255).notNullable().unique();
      table.string("google_id", 255);
      table.string("fullname", 100);
      table.string("avatar", 255);
      table.boolean("is_ban").defaultTo(false);
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
      table.timestamp("deleted_at");
      table
        .foreign("role_id") // Reference the remaining role_id column
        .references("id")
        .inTable("user.roles")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
