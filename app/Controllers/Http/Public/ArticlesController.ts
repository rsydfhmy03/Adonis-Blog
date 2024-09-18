import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ArticlesService from "App/Services/Public/ArticlesService";
import CreateArticlesValidator from "App/Validators/Public/CreateArticlesValidator";
import UpdateArticlesValidator from "App/Validators/Public/UpdateArticlesValidator";
import { ValidationException } from "@ioc:Adonis/Core/Validator";
import { uploadImage } from "App/Utils/UploadHelper";

export default class ArticlesController {
  service = new ArticlesService();
  FETCHED_ATTRIBUTE = [
    // attribute
    "title",
    "content",
    "image",
  ];

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
      console.log(request.all());
      const data = request.only(this.FETCHED_ATTRIBUTE);
      console.log("===Data===", data.image);

      const imageUpload = request.file("image");
      console.log("===Image Upload===", imageUpload);
      if (imageUpload) {
        const image = await uploadImage(imageUpload);
        console.table(image);
        if (image) data.image = image;
      }
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
      const image = request.file("image");
      if (image) {
        const imageUrl = await uploadImage(image);
        if (imageUrl) data.image_url = imageUrl;
      }
      console.log("Pass 1");
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
