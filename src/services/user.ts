import axios from "axios";
import { prismaClient } from "../client/db";
import JWTservices from "./jwt";

interface GoogleTokenResult {
    iss?: string;
    azp?: string;
    aud?: string;
    sub?: string;
    email: string;
    email_verified: string;
    nbf?: string;
    name?: string;
    picture: string;
    given_name: string;
    family_name: string;
    locale?: string;
    iat?: string;
    exp?: string;
    jti?: string;
    alg?: string;
    kid?: string;
    typ?: string;
  }
  

export default class UserService {
  public static async verifyGoogleAuthToken(token: string) {
    const googleToken = token;
    const googleOAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleOAuthURL.searchParams.set("id_token", googleToken);
    const { data } = await axios.get<GoogleTokenResult>(
      googleOAuthURL.toString(),
      {
        responseType: "json",
      }
    );
    console.log(data);
    const user = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageUrl: data.picture,
        },
      });
    }
    const userInDb = await prismaClient.user.findUnique({
      where: { email: data.email },
    });
    if (!userInDb) throw new Error("User not found");
    const userToken = JWTservices.generateTokenForUser(userInDb);

    return userToken;
  }
  public static async getUserById(id: string) {
    const user = await prismaClient.user.findUnique({ where: { id } });
    return user;
  }
  public static followUser(from: string, to: string) {
    return prismaClient.follows.create({
      data: {
        follower: {connect: {id: from}},
        following: {connect: {id: to}},
      },
    });
    
  }
  public static unfollowUser(from: string,to: string){
    return prismaClient.follows.delete({
      where:{followerId_followingId: {followerId: from, followingId: to}}
    })
  }
}
