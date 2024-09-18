import { schema, validator, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CreateArticlesValidator {
  constructor(protected ctx: HttpContextContract) {}

  public reporter = validator.reporters.api;

  public schema = schema.create({
    // your validation rules
    image: schema.file.optional({
      size: "2mb",
      extnames: ["jpg", "png", "gif"],
    }),
  });
}
