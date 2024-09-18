import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import Account from "../User/Account";
import Articles from "./Articles";

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public content: string;

  @column()
  public user_id: number;

  @column()
  public article_id: number;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

  @belongsTo(() => Account)
  public user: BelongsTo<typeof Account>;

  @belongsTo(() => Articles)
  public article: BelongsTo<typeof Articles>;

  static get table() {
    return "comments"; // table name
  }
}
