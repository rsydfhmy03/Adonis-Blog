import bucket from "Config/storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export async function uploadImage(file: any) {
  try {
    // Memeriksa apakah file ada
    console.log("Step 1: Received file metadata:", file);
    if (!file) return "File tidak ada";

    const fileName = `${uuidv4()}_${path.basename(file.clientName)}`;
    console.log(`Step 2: Prepared file name: ${fileName}`);

    // Buat stream untuk meng-upload file ke Google Cloud Storage
    const blob = bucket.file(`articles/${fileName}`);
    const blobStream = blob.createWriteStream({ resumable: false });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (err) => {
        console.error("Step 3: Error uploading file:", err);
        reject(new Error("Error uploading image: " + err.message));
      });

      blobStream.on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        console.log(
          "Step 4: File uploaded successfully, public URL:",
          publicUrl
        );
        resolve(publicUrl);
      });

      // Akhiri stream dan unggah buffer file
      blobStream.end(file.tmpPath ? file.tmpPath : file.buffer);
    });
  } catch (error) {
    console.error("Step 5: Upload process failed with error:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}
