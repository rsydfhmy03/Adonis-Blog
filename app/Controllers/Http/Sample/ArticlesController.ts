import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ArticlesService from "App/Services/Sample/ArticlesService";
import CreateArticlesValidator from "App/Validators/Sample/CreateArticlesValidator";
import UpdateArticlesValidator from "App/Validators/Sample/UpdateArticlesValidator";
import { ValidationException } from "@ioc:Adonis/Core/Validator";

export default class ArticlesController {
  service = new ArticlesService();
  FETCHED_ATTRIBUTE = [
    // attribute
  ];

  /**
   * Get all articles
   *
   * @param {HttpContextContract} ctx
   * @param {RequestContract} ctx.request
   * @param {ResponseContract} ctx.response
   * @returns {Promise<ResponseContract>}
   */
  public async index({ request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all());
      const result = await this.service.getAll(options);
      return response.api(result, "OK", 200, request);
    } catch (error) {
      return response.error(error.message);
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      await request.validate(CreateArticlesValidator);
      const data = request.only(this.FETCHED_ATTRIBUTE);
      const result = await this.service.store(data);
      return response.api(result, "Articles created!", 201);
    } catch (error) {
      if (error instanceof ValidationException) {
        const errorValidation: any = error;
        return response.error(
          errorValidation.message,
          errorValidation.messages.errors,
          422
        );
      }
      return response.error(error.message);
    }
  }

  public async show({ params, request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all());
      const result = await this.service.show(params.id, options);
      if (!result) {
        return response.api(null, `Articles with id: ${params.id} not found`);
      }
      return response.api(result);
    } catch (error) {
      return response.error(error.message);
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      await request.validate(UpdateArticlesValidator);
      const data = request.only(this.FETCHED_ATTRIBUTE);
      const result = await this.service.update(params.id, data);
      if (!result) {
        return response.api(null, `Articles with id: ${params.id} not found`);
      }
      return response.api(result, "Articles updated!");
    } catch (error) {
      if (error instanceof ValidationException) {
        const errorValidation: any = error;
        return response.error(
          errorValidation.message,
          errorValidation.messages.errors,
          422
        );
      }
      return response.error(error.message);
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const result = await this.service.delete(params.id);
      if (!result) {
        return response.api(null, `Articles with id: ${params.id} not found`);
      }
      return response.api(null, "Articles deleted!");
    } catch (error) {
      return response.error(error.message);
    }
  }

  public async destroyAll({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll();
      return response.api(null, "All Articles deleted!");
    } catch (error) {
      return response.error(error.message);
    }
  }
}
