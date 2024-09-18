import BaseRepository from "App/Base/Repositories/BaseRepository";
import Category from "App/Models/Public/Category";

export default class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category)
  }
}
    