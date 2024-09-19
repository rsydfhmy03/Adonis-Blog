import { DateTime } from "luxon";
import { BaseModel, column, HasMany, hasMany } from "@ioc:Adonis/Lucid/Orm";
import Account from "./Account";

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public code: string;

  @column()
  public name: string;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

  @hasMany(() => Account)
  public accounts: HasMany<typeof Account>;

  static get table() {
    return "user.roles";
  }
}
