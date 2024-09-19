import Route from "@ioc:Adonis/Core/Route";

Route.group(function () {
  Route.delete("/", "Public/ArticlesController.destroyAll").as(
    "article.destroyAll"
  );
}).prefix("article");
Route.resource("article", "Public/ArticlesController")
  .apiOnly()
  .middleware({
    store: ["auth"],
    update: ["auth"],
    destroy: ["auth"],
  });

// Route.post("/articleImages", "Public/ArticlesController.storeImage");
