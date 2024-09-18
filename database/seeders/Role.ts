import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Role from "App/Models/User/Role";
export default class extends BaseSeeder {
  public async run() {
    await Role.createMany([
      {
        code: "admin",
        name: "Admin",
      },
      {
        code: "user",
        name: "User",
      },
    ]);
  }
}
