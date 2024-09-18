import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import AuthService from "App/Services/Auth/AuthService";
import AccountService from "App/Services/User/AccountService";
import Base64 from "base-64";

export default class AuthController {
  service = new AuthService();
  accountService = new AccountService();

  /**
   * Handle user login
   *
   * @remarks
   * Expect `Authorization` header with value `Basic <base64 email:password>`
   * and optional `remember_me` in request body
   *
   * @example
   * */
  public async login({ auth, request, response }: HttpContextContract) {
    try {
      const credentials = this.getBasicAuth(request.header("authorization"));
      console.log(credentials);
      if (!credentials) {
        return response.badRequest("Authorization header is missing");
      }
      console.log("PASS1");
      const rememberMe = request.body().remember_me ?? false;
      const token = await this.service.login(credentials, auth, rememberMe);
      console.log("PASS2");
      return response.api(token, "OK", 200, request);
    } catch (error) {
      console.log(error);
      return response.error(error.message);
    }
  }
  public async register({ request, response }: HttpContextContract) {
    try {
      const { email, pwd, fullname, username, role_id } = request.only([
        "email",
        "pwd",
        "fullname",
        "username",
        "role_id",
      ]);
      console.log(email);
      if (!email || !pwd || !fullname || !username) {
        return response.badRequest("Missing required fields");
      }
      const existingUser = await this.accountService.findByEmail(email);
      if (existingUser) {
        // return response.badRequest("Email is already registered");
        return response.error("Email is already registered");
      }
      const newUser = await this.accountService.store({
        email,
        pwd,
        fullname,
        username,
        role_id,
      });

      console.log(newUser);
      return response.api(newUser, "User registered successfully");
    } catch (error) {
      console.log(error);
      return response.error(error.message);
    }
  }
  public async logout({ auth, response }: HttpContextContract) {
    try {
      await auth.use("api").revoke();
      return response.api(null, "Logout successful!");
    } catch (error) {
      return response.error(error.message);
    }
  }

  public async oauthRedirect({ ally, response }) {
    try {
      return ally.use("google").redirect();
    } catch (error) {
      return response.error(error.message);
    }
  }

  public async oauthCallback({ ally, auth, response }) {
    try {
      const google = await ally.use("google").user();
      let user = await this.accountService.findByEmail(google.email);
      if (!user) {
        return response.error("akun tidak terdaftar");
      } else {
        if (!user.google_id) {
          await this.accountService.update(user.id, {
            google_id: google.id,
            status: true,
          });
        }
        await user.load("role");
        const authResult = await this.service.generateToken(auth, user, true);
        const encodeToken = Base64.encode(JSON.stringify(authResult));
        return response
          .redirect()
          .toPath(`http://localhost:4200/google-redirect?token=${encodeToken}`);
      }
    } catch (error) {
      return response.error(error.message);
    }
  }
  public async forgotPassword({ request, response }) {
    try {
      const data = await request.all();
      await this.service.forgotPassword(data.credential, request);
      return response.api(
        null,
        "Forgot password link has been sent to your email"
      );
    } catch (error) {
      return response.error(error.message);
    }
  }

  public async restorePassword({ request, response }) {
    try {
      const data = await request.all();
      await this.service.restorePassword(data);
      return response.api(null, "Password restored!");
    } catch (error) {
      return response.error(error.message);
    }
  }
  getBasicAuth(authHeader: any) {
    const data = Base64.decode(authHeader.split(" ")[1]).split(":");
    return { email: data[0], password: data[1] };
  }
}
