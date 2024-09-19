import supabase from "App/Utils/SupabaseClient";

export async function uploadImageSupabase(file: any) {
  try {
    // Memeriksa apakah file ada
    console.log("Step 1: Received file metadata:", file);
    if (!file) return "File tidak ada";

    // Menampilkan ukuran file asli (sebelum konversi)
    console.log(`Step 2: Original file size: ${file.size} bytes`);

    const imageName = `${new Date().getTime()}_${file.clientName}`;
    const contentType = "image/png";
    console.log(
      `Step 5: Prepared imageName: ${imageName}, contentType: ${contentType}`
    );
    const fileImage = file;

    console.log("file Image ==========", fileImage.size);
    // Upload file langsung ke Supabase tanpa konversi base64
    console.log("Step 6: Uploading file buffer to Supabase");
    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(imageName, fileImage, {
        contentType: contentType,
        upsert: file.size,
      });

    if (uploadError) {
      console.error(
        "Step 7: Error uploading file to Supabase:",
        uploadError.message
      );
      throw new Error("Error uploading image: " + uploadError.message);
    }

    console.log(
      "Step 8: File uploaded successfully, fetching public URL" + file.size
    );
    const { data } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(imageName);

    console.log("Step 9: Public URL fetched:", data);

    return data.publicUrl; // Mengembalikan URL publik gambar
  } catch (error) {
    console.error("Step 10: Upload process failed with error:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}
