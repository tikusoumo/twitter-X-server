import axios from "axios";
import { prismaClient } from "../../client/db";
import JWTservices from "../../services/jwt";
import { GraphqlContext } from "../../interfaces";
import UserService from "../../services/user";
import { User } from "@prisma/client";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const resultToken = await UserService.verifyGoogleAuthToken(token);
    return resultToken;
  },
  getCurrentUser: async (parent: any, args: any, context: GraphqlContext) => {
    const id = context.user?.id;
    if (!id) return null;

    const user = await UserService.getUserById(id);
    return user;
  },
  getUserById: async (
    parent: any,
    { id }: { id: string },
    context: GraphqlContext
  ) => {
    const user = await UserService.getUserById(id);
    return user;
  },
};

const extraResolvers = {
  User: {
    tweets: (parent: User) =>
      prismaClient.tweet.findMany({ where: { authorId: parent.id } }),
    followers: async(parent: User) =>{

      const result = await prismaClient.follows.findMany({
        where: { following: { id: parent.id } },
        include : {
          follower: true
        }
      })
      return result.map((ele) => ele.follower);
    },

    following: async (parent: User) => {
      const result = await prismaClient.follows.findMany({
        where: { follower: { id: parent.id } },
        include: { following: true },
      });

      return result.map((ele) => ele.following);
    },
  },
};

const mutations = {
  followUser: async (
    parent: any,
    { to }: { to: string },
    context: GraphqlContext
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new Error("User not found");
    await UserService.followUser(userId, to);
    return true;
  },
  unfollowUser: async (
    parent: any,
    { to }: { to: string },
    context: GraphqlContext
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new Error("User not found");
    await UserService.unfollowUser(userId, to);
    return true;
  },
};

export const resolvers = {
  queries,
  extraResolvers,
  mutations,
};
