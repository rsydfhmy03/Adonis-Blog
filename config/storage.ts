import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const bucketName = "blog_adonis";
const bucket = storage.bucket(bucketName);

export default bucket;

// async function listBuckets() {
//   try {
//     const [buckets] = await storage.getBuckets();
//     console.log("Buckets:");
//     buckets.forEach((bucket) => console.log(bucket.name));
//   } catch (error) {
//     console.error("Error listing buckets:", error);
//   }
// }

// listBuckets();
