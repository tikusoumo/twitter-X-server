import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";

interface CreateTweetPayload {
  content: string;
  imageUrl?: string;
}

export const queries = {
  getAllTweets: (parent: any, args: any, context: GraphqlContext) => {
    if (!context.user) throw new Error("Unauthorized");
    return prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } });
  },
};

export const mutations = {
  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    context: GraphqlContext
  ) => {
    if (!context.user) throw new Error("Unauthorized");
    console.log("context.user", context.user);
    console.log("Payload:", payload);

    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl ? payload.imageUrl : "",
        author: {
          connect: {
            id: context.user.id,
          },
        },
      },
    });
    return tweet;
  },
};
const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) =>
      prismaClient.user.findUnique({
        where: {
          id: parent.authorId,
        },
      }),
  },
};

export const resolvers = { mutations, extraResolvers, queries};
