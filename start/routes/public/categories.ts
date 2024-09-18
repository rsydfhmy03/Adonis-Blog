import Route from "@ioc:Adonis/Core/Route";

Route.group(function () {
  Route.delete("/", "Public/CategoryController.destroyAll").as(
    "categories.destroyAll"
  );
}).prefix("categories");
Route.resource("categories", "Public/CategoryController")
  .apiOnly()
  .middleware({
    store: ["auth"],
    update: ["auth"],
    destroy: ["auth"],
  });
