import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
} from "@ioc:Adonis/Lucid/Orm";
// import commands from "commands";
import Account from "../User/Account";
import Category from "./Category";
import Comment from "./Comment";

export default class Articles extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public title: string;

  @column()
  public content: string;

  @column()
  public image: string;

  @column()
  public user_id: number;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

  @belongsTo(() => Account)
  public user: BelongsTo<typeof Account>;

  @manyToMany(() => Category, {
    pivotTable: "article_category",
  })
  public categories: ManyToMany<typeof Category>;

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>;

  static get table() {
    return "articles"; // table name
  }
}
