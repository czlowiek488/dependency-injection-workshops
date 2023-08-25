import express from "express";
import type { Express } from "express";
import http from "http";
import { appConfig } from "./shared/config";
import { v4 } from "uuid";
import { StatusCodes } from "http-status-codes";
import { UserRepository } from "./shared/users.repository";
import type { Knex } from "knex";
import knex from "knex";
import axios from "axios";
import { asClass, asValue, asFunction } from "awilix";
import { createContainer } from "awilix";
import { randomWordApiIntegration, type RandomWordApiIntegration } from "./shared/random-wort-api.integration";
import type { Route } from "./routes/items-add.get.route";
import { itemsAddGetRoute } from "./routes/items-add.get.route";
import { asArray, asProxied } from "./shared/lib/awilix.lib";
import { errorProxy } from "./shared/proxy/dependency-error-decorator.proxy";
import { statsDProxy } from "./shared/proxy/dependency-statsd.proxy";
import { loggerProxy } from "./shared/proxy/dependency-logger.proxy";
import { ItemRepository } from "./shared/items.repository";

export interface Dependencies {
  userRepository: UserRepository;
  itemRepository: ItemRepository;
  randomWordApiIntegration: RandomWordApiIntegration;
  app: Express;
  database: Knex;
  appConfig: typeof appConfig;
  routes: Route[];
}

export const container = createContainer<Dependencies>().register({
  userRepository: asClass(UserRepository),
  itemRepository: asClass(ItemRepository),
  appConfig: asValue(appConfig),
  app: asValue(express()),
  randomWordApiIntegration: asProxied(randomWordApiIntegration, [errorProxy, statsDProxy, loggerProxy]),
  database: asFunction((dependencies: Dependencies) =>
    knex({
      client: "pg",
      connection: {
        user: dependencies.appConfig.user,
        password: dependencies.appConfig.password,
        database: dependencies.appConfig.database,
        host: dependencies.appConfig.host,
        port: dependencies.appConfig.port,
      },
      acquireConnectionTimeout: 30000,
    }),
  ),
  routes: asArray<Route>([itemsAddGetRoute].map((route) => asFunction(route))),
});

container.cradle.routes.forEach((route) => route.loadRoute());

container.cradle.app.use(function (req, res, next) {
  console.log(`App received http request: ${req.method} ${req.url} | ${JSON.stringify(req.params)}`);
  next();
});

container.cradle.app.get("/items/remove/:itemId", async (req, res) => {
  await container.cradle.itemRepository.deleteOne({
    itemId: req.params.itemId,
  });
  res.sendStatus(StatusCodes.OK);
});

container.cradle.app.get("/items/list", async (req, res) => {
  const items = await container.cradle.itemRepository.listAll();
  res.status(StatusCodes.OK).json({
    items,
  });
});

container.cradle.app.get("/users/add/:userName", async (req, res) => {
  const userId = v4();
  const randomWordAxiosResponse = await axios({
    url: "https://random-word-api.herokuapp.com/word",
  });
  await container.cradle.userRepository.insertOne({
    userId,
    userName: req.params.userName,
    randomWord: randomWordAxiosResponse.data[0],
  });
  res.status(StatusCodes.OK).json({ userId });
});

container.cradle.app.get("/users/list", async (req, res) => {
  const users = await container.cradle.userRepository.listAll();
  res.status(StatusCodes.OK).json({ users });
});

container.cradle.app.get("/user-items/list/:userId", async (req, res) => {
  const userItems = await container.cradle.database
    .select("*")
    .from("app.users")
    .leftJoin("app.items", "users.user_id", "items.user_id")
    .where({
      "users.user_id": req.params.userId,
    });
  res.status(StatusCodes.OK).json({
    userItems: userItems.map((userItem) => ({
      itemId: userItem.item_id,
      itemName: userItem.item_name,
      randomWord: userItem.random_word,
      userId: userItem.user_id,
      userName: userItem.user_name,
    })),
  });
});

container.cradle.app.use(function (req, res, next) {
  console.log(`App responded on http request: <${res.statusCode}> ${req.method} ${req.url}`);
  next();
});

container.cradle.app.use([
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err, req, res, next): void => {
    console.warn(err);
    res.status(err.statusCode).send(JSON.stringify(err));
  },
]);

http
  .createServer(container.cradle.app)
  .listen({ port: appConfig.PORT }, () => console.log(`Server is listening on port: ${appConfig.PORT}`));
