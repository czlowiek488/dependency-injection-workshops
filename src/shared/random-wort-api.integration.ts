import axios from "axios";

export interface RandomWordApiIntegration {
  getRandomWord: () => Promise<string>;
}
export const randomWordApiIntegration = (): RandomWordApiIntegration => ({
  getRandomWord: async () => {
    const randomWordAxiosResponse = await axios({
      url: "https://random-word-api.herokuapp.com/word",
    });
    return randomWordAxiosResponse.data[0];
  },
});
