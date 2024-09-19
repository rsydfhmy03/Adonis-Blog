import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ArticlesService from "App/Services/Public/ArticlesService";
import CreateArticlesValidator from "App/Validators/Public/CreateArticlesValidator";
import UpdateArticlesValidator from "App/Validators/Public/UpdateArticlesValidator";
import { ValidationException } from "@ioc:Adonis/Core/Validator";
import GoogleCloudStorage from "App/Utils/GoogleCloudStorage";

export default class ArticlesController {
  service = new ArticlesService();
  FETCHED_ATTRIBUTE = ["title", "content", "image", "user_id"];

  // Helper function to handle image upload
  private async handleImageUpload(
    file: any,
    folder: string,
    oldImageUrl?: string
  ): Promise<string | null> {
    if (file) {
      // Delete old image if exists
      if (oldImageUrl) {
        await GoogleCloudStorage.deleteImage(oldImageUrl);
      }
      // Upload new image
      return await GoogleCloudStorage.uploadImage(file, folder);
    }
    return null;
  }

  // Helper function to process category IDs
  private processCategoryIds(categoryIds: any): number[] {
    if (!Array.isArray(categoryIds)) {
      categoryIds = [categoryIds];
    }
    return categoryIds
      .map((id) => Number(id))
      .filter((id) => !isNaN(id) && id > 0);
  }

  public async index({ request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all());
      const result = await this.service.getAll(options);
      return response.api(result, "OK", 200, request);
    } catch (error) {
      return response.error(error.message);
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    try {
      // Validasi input
      await request.validate(CreateArticlesValidator);
      const data = request.only(this.FETCHED_ATTRIBUTE);
      data.user_id = auth.use("api").user?.id;

      // Proses unggah gambar
      const imageUpload = request.file("image");
      const imageUrl = await this.handleImageUpload(imageUpload, "articles");
      if (imageUrl) data.image = imageUrl;

      // Simpan artikel
      const article = await this.service.store(data);

      // Proses kategori
      const categoryIds = this.processCategoryIds(request.input("category_id"));
      if (categoryIds.length > 0) {
        await article.related("categories").attach(categoryIds);
      }

      return response.api(article, "Articles created!", 201);
    } catch (error) {
      console.error(error);
      return error.messages
        ? response.error(error.messages)
        : response.error(error.message);
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
      // Validasi input
      await request.validate(UpdateArticlesValidator);
      const data = request.only(this.FETCHED_ATTRIBUTE);

      // Ambil artikel lama
      const oldArticle = await this.service.show(params.id);
      if (!oldArticle) {
        return response.api(null, `Articles with id: ${params.id} not found`);
      }

      // Proses unggah gambar baru
      const imageUpload = request.file("image");
      const imageUrl = await this.handleImageUpload(
        imageUpload,
        "articles",
        oldArticle.image
      );
      if (imageUrl) data.image = imageUrl;

      // Update artikel
      const result = await this.service.update(params.id, data);

      // Proses kategori
      const categoryIds = this.processCategoryIds(request.input("category_id"));
      await result.related("categories").sync(categoryIds);

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
