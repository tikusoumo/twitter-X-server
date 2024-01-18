import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";

export async function startApolloServer() {
  const app = express();
  app.use(bodyParser.json());
  const server = new ApolloServer({
    typeDefs: `
        type Query {
            hello: String
            helloToMe(name: String!): String
        }
  `,
    resolvers: {
      Query: {
        hello: () => "Hello, Tiku!",
        helloToMe: (parent: any, { name }: {name:String}) => `Hello, ${name}!`,
      },
    },
  });
  await server.start();

  app.use("/graphql", expressMiddleware(server));

  return app;
}
