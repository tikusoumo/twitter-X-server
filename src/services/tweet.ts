import { prismaClient } from "../client/db";

export interface CreateTweetPayload {
    content: string;
    imageUrl?: string;
    userId: string;
  }


export class TweetService {
 public static async createTweet(data: CreateTweetPayload){
    return prismaClient.tweet.create({
        data:{

            content: data.content,
            imageUrl: data.imageUrl,
            author: {connect: {id: data.userId}}
        }
  
 })
}
}