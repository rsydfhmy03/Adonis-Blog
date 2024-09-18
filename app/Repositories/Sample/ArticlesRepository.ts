import BaseRepository from "App/Base/Repositories/BaseRepository";
import Articles from "App/Models/Sample/Articles";

export default class ArticlesRepository extends BaseRepository {
  constructor() {
    super(Articles)
  }
}
    