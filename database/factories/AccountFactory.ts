import Factory from "@ioc:Adonis/Lucid/Factory";
import Account from "App/Models/User/Account";
import Hash from "@ioc:Adonis/Core/Hash"; // Untuk hashing password
import { DateTime } from "luxon";

export const AccountFactory = Factory.define(Account, async ({ faker }) => {
  return {
    username: faker.internet.userName(),
    pwd: await Hash.make("password123"), // Ganti password sesuai kebutuhan
    email: faker.internet.email(),
    fullname: faker.internet.userName(),
    avatar: "faker.internet.avatar()",
    is_ban: faker.datatype.boolean(),
    role_id: 1, // Referensi ke ID role yang sudah ada
    created_at: DateTime.now(),
    updated_at: DateTime.now(),
  };
}).build();
