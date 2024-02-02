import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { Users } from "./users";
import cors from "cors";
import { GraphqlContext } from "../interfaces";
import JWTservices from "../services/jwt";

export async function startApolloServer() {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  const server = new ApolloServer<GraphqlContext>({
    typeDefs: /*graphql */ `
        ${Users.types}
        type Query {
            ${Users.queries}
        }
  `,
    resolvers: {
      Query: {
        ...Users.resolvers.queries,
      },
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
