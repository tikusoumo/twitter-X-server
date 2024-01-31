import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { Users } from "./users";
import cors from "cors";

export async function startApolloServer() {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  const server = new ApolloServer({
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

  app.use("/graphql", expressMiddleware(server));

  return app;
}
