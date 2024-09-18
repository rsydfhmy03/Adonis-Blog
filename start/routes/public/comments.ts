import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'Public/CommentController.destroyAll').as('comments.destroyAll')
}).prefix('comments')
Route.resource('comments', 'Public/CommentController').apiOnly()
