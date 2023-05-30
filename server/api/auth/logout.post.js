import { removeRefreshToken } from "../../db/refreshTokens.js";
import { sendRefreshToken } from "../../utils/jwt.js";

export default defineEventHandler(async (event) => {
  try {
    const cookies = getCookie(event, "refresh_token");
    const refreshToken = cookies.refresh_token;
    await removeRefreshToken(refreshToken);
  } catch (error) {}

  sendRefreshToken(event, null);

  return { message: "Done" };
});
