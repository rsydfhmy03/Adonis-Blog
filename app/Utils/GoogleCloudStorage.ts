import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

class GoogleCloudStorage {
  private bucketName: string;
  private bucket: any;

  constructor() {
    this.bucketName = "blog_adonis";
    const storage = new Storage();
    this.bucket = storage.bucket(this.bucketName);
  }

  /**
   * Upload file gambar ke Google Cloud Storage
   * @param file Gambar yang diupload
   * @param folder Nama folder di dalam bucket
   * @returns URL publik dari gambar yang diupload
   */
  public async uploadImage(file: any, folder: string): Promise<string> {
    try {
      const fileName = `${uuidv4()}_${path.basename(file.clientName)}`;
      const blob = this.bucket.file(`${folder}/${fileName}`);
      const blobStream = blob.createWriteStream({ resumable: false });

      await new Promise<void>((resolve, reject) => {
        blobStream.on("finish", resolve);
        blobStream.on("error", reject);
        blobStream.end(fs.readFileSync(file.tmpPath!));
      });

      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;
      return publicUrl;
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Menghapus file gambar dari Google Cloud Storage
   * @param fileUrl URL publik dari file yang ingin dihapus
   */
  public async deleteImage(fileUrl: string): Promise<void> {
    try {
      const fileName = fileUrl.split(`${this.bucketName}/`)[1];
      const file = this.bucket.file(fileName);

      await file.delete();
    } catch (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }
}

export default new GoogleCloudStorage();
