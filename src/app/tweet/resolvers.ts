import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import UserService from "../../services/user";
import { CreateTweetPayload, TweetService } from "../../services/tweet";

const s3Client = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_ID!,
    secretAccessKey: process.env.AWS_S3_BUCKET_SECRET!,
  },
});

export const queries = {
  getAllTweets: (parent: any, args: any, context: GraphqlContext) => {
    if (!context.user) throw new Error("Unauthorized");
    return prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } });
  },

  getSignedURLForTweetImage: async (
    parent: any,
    { imageType, imageName }: { imageType: string; imageName: string },
    context: GraphqlContext
  ) => {
    if (!context.user || !context.user.id) throw new Error("Unauthorized");
    const allowedImages = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!allowedImages.includes(imageType))
      throw new Error("Invalid image type");
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `upload/${
        context.user.id
      }/tweets/${imageName}-${Date.now().toString()}.${imageType}`,
      ContentType: `image/${imageType}`,
    });
    const signedURL = await getSignedUrl(s3Client, putObjectCommand);
    return signedURL;
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

    const tweet = await TweetService.createTweet({
      ...payload,
      userId: context.user.id,
    });
    return tweet;
  },
  deleteTweet: async (
    parent: any,
    { id }: { id: string },
    context: GraphqlContext
  ) => {
    if (!context.user) throw new Error("Unauthorized");
    const tweet = await prismaClient.tweet.findUnique({ where: { id } });
    if (!tweet) throw new Error("Tweet not found");
    if (tweet.authorId !== context.user.id)
      throw new Error("Unauthorized to delete this tweet");
    await prismaClient.tweet.delete({ where: { id } });
    return true;
  },
};
const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) => UserService.getUserById(parent.authorId),
  },

};

export const resolvers = { mutations, extraResolvers, queries };
