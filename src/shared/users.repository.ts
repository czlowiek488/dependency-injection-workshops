import type { Dependencies } from "..";

export class UserRepository {
  public constructor(private dependencies: Dependencies) {}

  public async insertOne(payload: { userId: string; userName: string; randomWord: string }) {
    await this.dependencies.database.table("app.users").insert({
      user_id: payload.userId,
      user_name: payload.userName,
      random_word: payload.randomWord,
    });
  }

  public async deleteOne(payload: { userId: string }) {
    await this.dependencies.database
      .table("app.users")
      .where({
        user_id: payload.userId,
      })
      .delete();
  }

  public async listAll() {
    const users = await this.dependencies.database.table("app.users").select();
    return users.map((user) => ({
      userId: user.user_id,
      userName: user.user_name,
      randomWord: user.random_word,
    }));
  }
}
