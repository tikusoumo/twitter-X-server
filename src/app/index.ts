import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { User } from "./users";
import cors from "cors";
import { GraphqlContext } from "../interfaces";
import JWTservices from "../services/jwt";
import { Tweet } from "./tweet";

export async function startApolloServer() {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  const server = new ApolloServer<GraphqlContext>({
    typeDefs: /*graphql */ `
        ${User.types}
        ${Tweet.types}
        type Query {
            ${User.queries}
            ${Tweet.queries}
        }
        type Mutation {
            ${Tweet.mutations}
        }
  `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries
        
      },
      Mutation: {
        ...Tweet.resolvers.mutations,
      },
      ...Tweet.resolvers.extraResolvers,
      ...User.resolvers.extraResolvers,
    },
  });
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return {
          user: (req.headers.authorization)
            ? JWTservices.decodeToken(req.headers.authorization.split("Bearer ")[1])
            : undefined,
        };
      },
    })
  );

  return app;
}
