import JWT from "jsonwebtoken";
import { prismaClient } from "../client/db";
import { User } from "@prisma/client";

class JWTservices {
  public static generateTokenForUser(user: User) {
   
    const payload = {
      id: user?.id,
      email: user?.email,
    };
    const token = JWT.sign(payload, process.env.JWT_SECRET as string);
    return token;
  }
}

export default JWTservices;

