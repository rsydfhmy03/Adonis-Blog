import BaseRepository from "App/Base/Repositories/BaseRepository";
import Articles from "App/Models/Public/Articles";

export default class ArticlesRepository extends BaseRepository {
  constructor() {
    super(Articles)
  }
}
    