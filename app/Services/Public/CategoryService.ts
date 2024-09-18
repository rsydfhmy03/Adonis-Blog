import BaseService from "App/Base/Services/BaseService"
import CategoryRepository from "App/Repositories/Public/CategoryRepository"

export default class CategoryService extends BaseService {
  constructor() {
    super(new CategoryRepository())
  }
}
    