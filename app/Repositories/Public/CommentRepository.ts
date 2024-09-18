import BaseRepository from "App/Base/Repositories/BaseRepository";
import Comment from "App/Models/Public/Comment";

export default class CommentRepository extends BaseRepository {
  constructor() {
    super(Comment)
  }
}
    