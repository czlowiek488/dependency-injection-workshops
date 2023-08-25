import type { Dependencies } from "..";

export class ItemRepository {
  public constructor(private dependencies: Dependencies) {}

  public async insertOne(payload: { itemId: string; userId: string; randomWord: string; itemName: string }) {
    await this.dependencies.database.table("app.items").insert({
      item_id: payload.itemId,
      user_id: payload.userId,
      item_name: payload.itemName,
      random_word: payload.randomWord,
    });
  }

  public async deleteOne(payload: { itemId: string }) {
    await this.dependencies.database
      .table("app.items")
      .where({
        item_id: payload.itemId,
      })
      .delete();
  }

  public async listAll() {
    const items = await this.dependencies.database.table("app.items").select();
    return items.map((item) => ({
      itemId: item.item_id,
      userId: item.user_id,
      createdAt: item.created_at,
      itemName: item.item_name,
      randomWord: item.random_word,
    }));
  }
}
