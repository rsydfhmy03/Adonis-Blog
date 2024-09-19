import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ArticlesService from "App/Services/Public/ArticlesService";
import CreateArticlesValidator from "App/Validators/Public/CreateArticlesValidator";
import UpdateArticlesValidator from "App/Validators/Public/UpdateArticlesValidator";
import { ValidationException } from "@ioc:Adonis/Core/Validator";
import GoogleCloudStorage from "App/Utils/GoogleCloudStorage";
export default class ArticlesController {
  service = new ArticlesService();
  FETCHED_ATTRIBUTE = [
    // attribute
    "title",
    "content",
    "image",
    "user_id",
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

  public async store({ request, response, auth }: HttpContextContract) {
    try {
      // Validasi input
      await request.validate(CreateArticlesValidator);

      // Mengambil data artikel
      const data = request.only(this.FETCHED_ATTRIBUTE);
      data.user_id = auth.use("api").user?.id;

      // Ambil array ID kategori dari input
      let categoryIds = request.input("category_id");
      console.log("==Category id:", categoryIds);
      // Pastikan categoryIds adalah array
      if (!Array.isArray(categoryIds)) {
        categoryIds = [categoryIds]; // Ubah menjadi array jika bukan
      }

      // Proses unggah gambar
      const imageUpload = request.file("image");
      if (imageUpload) {
        const imageUrl = await GoogleCloudStorage.uploadImage(
          imageUpload,
          "articles"
        );
        data.image = imageUrl;
      }

      // Simpan artikel
      const article = await this.service.store(data);

      // Menyimpan relasi kategori (many-to-many)
      if (categoryIds && categoryIds.length > 0) {
        await article
          .related("categories")
          .attach(categoryIds.map((id) => Number(id)));
      }

      return response.api(article, "Articles created!", 201);
    } catch (error) {
      console.error(error);
      if (error.messages) {
        return response.error(error.messages);
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
      // Validasi input
      await request.validate(UpdateArticlesValidator);
      const data = request.only(this.FETCHED_ATTRIBUTE);

      // Proses unggah gambar
      const imageUpload = request.file("image");
      let oldImageUrl: string | null = null;
      if (imageUpload) {
        // Dapatkan artikel lama untuk mengambil gambar lama
        const oldArticle = await this.service.show(params.id);
        if (oldArticle && oldArticle.image) {
          oldImageUrl = oldArticle.image;
        }

        // Unggah gambar baru
        const imageUrl = await GoogleCloudStorage.uploadImage(
          imageUpload,
          "articles"
        );
        data.image = imageUrl;
      }

      // Update artikel
      const result = await this.service.update(params.id, data);
      if (!result) {
        return response.api(null, `Articles with id: ${params.id} not found`);
      }

      // Menghapus gambar lama jika ada
      if (oldImageUrl) {
        await GoogleCloudStorage.deleteImage(oldImageUrl);
      }

      // Mengupdate kategori
      let categoryIds = request.input("category_id");
      if (!Array.isArray(categoryIds)) {
        categoryIds = [categoryIds];
      }
      console.log("==Category id:", categoryIds);

      // Filter dan validasi categoryIds agar hanya berisi angka valid
      categoryIds = categoryIds
        .map((id) => Number(id))
        .filter((id) => !isNaN(id) && id > 0); // Pastikan bukan NaN dan angka positif

      // Update relasi kategori (many-to-many)
      if (categoryIds.length > 0) {
        await result.related("categories").sync(categoryIds);
      } else {
        await result.related("categories").detach();
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
