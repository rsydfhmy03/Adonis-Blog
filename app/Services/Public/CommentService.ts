import BaseService from "App/Base/Services/BaseService";
import CommentRepository from "App/Repositories/Public/CommentRepository";

export default class CommentService extends BaseService {
  /**
   * Constructor for CommentService
   *
   * @remarks
   * It uses {@link CommentRepository} to interact with the database.
   */
  constructor() {
    super(new CommentRepository());
  }
}
