import { StatusCodes } from "http-status-codes";
import type { Dependencies } from "..";
import { v4 } from "uuid";

export interface Route {
  loadRoute: () => void;
}

export const itemsAddGetRoute = (dependencies: Dependencies): Route => ({
  loadRoute: () =>
    dependencies.app.get("/items/add/:itemName/:userId", async (req, res) => {
      const itemId = v4();
      const randomWord = await dependencies.randomWordApiIntegration.getRandomWord();
      await dependencies.itemRepository.insertOne({
        itemId,
        userId: req.params.userId,
        itemName: req.params.itemName,
        randomWord,
      });
      res.status(StatusCodes.OK).json({ itemId });
    }),
});
