import weaviate from "weaviate-ts-client";
import { readFileSync, readdirSync, writeFileSync } from "fs";
const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});

const configureSchema = async () => {
  const schemaConfig = {
    class: "Meme",
    vectorizer: "img2vec-neural",
    verctorIndexType: "hnsw",
    moduleConfig: {
      "img2vec-neural": {
        imageFields: ["image"],
      },
    },
    properties: [
      {
        name: "image",
        dataType: ["blob"],
      },
      {
        name: "text",
        dataType: ["string"],
      },
    ],
  };

  await client.schema.classCreator().withClass(schemaConfig).do();
};
const getSchema = async () => {
  const schemaRes = await client.schema.getter().do();
  console.log(schemaRes);
};

const addMemes = async () => {
  const imgFiles = readdirSync("./images");
  const promises = [];
  for (const imgFile of imgFiles) {
    const b64 = readFileSync(`./images/${imgFile}`).toString("base64");
    // promises.push(

    // );
    promises.push(
      client.data
        .creator()
        .withClassName("Meme")
        .withProperties({
          image: b64,
          text: imgFile.split(".")[0],
        })
        .do()
    );
  }
  await Promise.all(promises);
};

// addMemes();

const testImage = async () => {
  const testImg = Buffer.from(readFileSync("./test.jpg")).toString("base64");
  const resImage = await client.graphql
    .get()
    .withClassName("Meme")
    .withFields(["image"])
    .withNearImage({ image: testImg })
    .withLimit(1)
    .do();
  const result = resImage.data.Get.Meme[0].image;
  writeFileSync("./result.jpg", result, "base64");
};

testImage();
// await getSchema();
