import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ArticlesService from "App/Services/Public/ArticlesService";
import CreateArticlesValidator from "App/Validators/Public/CreateArticlesValidator";
import UpdateArticlesValidator from "App/Validators/Public/UpdateArticlesValidator";
import { ValidationException } from "@ioc:Adonis/Core/Validator";
// import { uploadImage } from "App/Utils/UploadImage";
import bucket from "Config/storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
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

  // public async uploadImage(file: any) {
  //   const fileName = `${new Date().getTime()}_${file.clientName}`;
  //   // const fileUpload = bucket.file(`articles/${fileName}`);
  //   // console.log(fileUpload);
  //   // // Menggunakan file.tmpPath jika tersedia, karena Adonis sering menggunakan file sementara
  //   // if (file.tmpPath) {
  //   //   await fileUpload.save(file.tmpPath);
  //   // } else {
  //   //   throw new Error("File stream atau path tidak tersedia.");
  //   // }
  //   // Buat stream untuk meng-upload file ke Google Cloud Storage
  //   const blob = bucket.file(`articles/${fileName}`);
  //   const blobStream = blob.createWriteStream({ resumable: false });

  //   // Mengembalikan URL file setelah diunggah
  //   // const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  //   // const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
  //   blobStream.on("finish", () => {
  //     const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
  //     console.log("Step 4: File uploaded successfully, public URL:", publicUrl);
  //     resolve(publicUrl);
  //     return publicUrl;
  //   });
  // }

  // public async store({ request, response }: HttpContextContract) {
  //   try {
  //     await request.validate(CreateArticlesValidator);
  //     console.log(request.all());
  //     const data = request.only(this.FETCHED_ATTRIBUTE);
  //     console.log("===Data===", data.image);

  //     const imageUpload = request.file("image");
  //     console.log("===Image Upload===", imageUpload?.size);

  //     const result = await this.service.store(data);
  //     return response.api(result, "Articles created!", 201);
  //   } catch (error) {
  //     if (error instanceof ValidationException) {
  //       const errorValidation: any = error;
  //       return response.error(
  //         errorValidation.message,
  //         errorValidation.messages.errors,
  //         422
  //       );
  //     }
  //     return response.error(error.message);
  //   }
  // }
  public async store({ request, response, auth }: HttpContextContract) {
    try {
      // Validasi input
      await request.validate(CreateArticlesValidator);

      // Mengambil data artikel
      const data = request.only(this.FETCHED_ATTRIBUTE);
      console.log("===Data===", data);
      data.user_id = auth.use("api").user?.id;
      console.log(data.user_id);
      // Proses unggah gambar
      const imageUpload = request.file("image");
      if (!imageUpload) {
        return response.badRequest({ message: "Image is required" });
      }

      // Cek ukuran file, jenis file, dll. (opsional)
      if (imageUpload.size > 2 * 1024 * 1024) {
        // Misal maksimum 2MB
        return response.badRequest({ message: "Image size exceeds the limit" });
      }

      // Membuat nama unik untuk file di Google Cloud Storage
      const fileName = `${uuidv4()}_${path.basename(imageUpload.clientName)}`;
      const blob = bucket.file(`articles/${fileName}`);
      const blobStream = blob.createWriteStream({ resumable: false });

      blobStream.on("error", (err) => {
        throw new Error(`File upload error: ${err.message}`);
      });

      // Menunggu upload selesai
      await new Promise<void>((resolve, reject) => {
        blobStream.on("finish", resolve);
        blobStream.on("error", reject);
        blobStream.end(fs.readFileSync(imageUpload.tmpPath!)); // Membaca buffer file
      });

      // Mendapatkan URL publik file
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      // Menyimpan artikel ke dalam database dengan URL gambar
      // const article = await article.create({
      //   title: data.title,
      //   content: data.content,
      //   image_url: publicUrl,
      // });
      if (!data.image_url) data.image = publicUrl;
      const result = await this.service.store(data);
      return response.api(result, "Articles created!", 201);
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
function resolve(publicUrl: string) {
  throw new Error("Function not implemented.");
}
