import BaseService from "App/Base/Services/BaseService"
import ArticlesRepository from "App/Repositories/Sample/ArticlesRepository"

export default class ArticlesService extends BaseService {
  constructor() {
    super(new ArticlesRepository())
  }
}
    