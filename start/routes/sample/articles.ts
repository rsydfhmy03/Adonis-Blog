import Route from "@ioc:Adonis/Core/Route";

Route.group(function () {
  Route.delete("/", "Sample/ArticlesController.destroyAll").as(
    "articles.destroyAll"
  );
}).prefix("articles");
Route.resource("articles", "Sample/ArticlesController").apiOnly();
