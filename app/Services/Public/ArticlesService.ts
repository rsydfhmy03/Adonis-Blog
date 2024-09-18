import BaseService from "App/Base/Services/BaseService"
import ArticlesRepository from "App/Repositories/Public/ArticlesRepository"

export default class ArticlesService extends BaseService {
  constructor() {
    super(new ArticlesRepository())
  }
}
    