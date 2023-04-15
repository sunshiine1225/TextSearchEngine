import weaviate from "weaviate-ts-client";
import { readFileSync, readdirSync,writeFileSync } from "fs";

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});

const schemaConfig = {
  class: 'Text',
  vectorizer: 'text2vec-contextionary',
  vectorIndexType: 'hnsw',
  moduleConfig: {
    'text2vec-contextionary': {
      language: 'en',
      vectorSize: 300,
    },
  },
  properties: [
    {
      name: 'text',
      dataType: ['string'],
    },
  ],
};

async function createSchema() {
  try {
    await client.schema.classCreator().withClass(schemaConfig).do();
    console.log('Schema created successfully');
  } catch (err) {
    console.error('Error creating schema:', err.message);
  }
}

async function getSchema() {
  try {
    const schema = await client.schema.getter().do();
    console.log('Schema:', schema);
  } catch (err) {
    console.error('Error fetching schema:', err.message);
  }
}

const addTexts = async () => {
  const txtFiles = readdirSync("./texts");
  const promises = [];
  for (const txtFile of txtFiles) {
    const text = readFileSync(`./texts/${txtFile}`).toString();
    promises.push(
      client.data
        .creator()
        .withClassName("Text")
        .withProperties({
          text,
        })
        .do()
    );
  }
  await Promise.all(promises);
};


const testText = async () => {
  const query = readFileSync("./test.txt").toString();
  if (!query) {
    console.error('Error: query parameter is undefined');
    return;
  }
  const resText = await client.graphql
    .get()
    .withClassName("Text")
    .withFields(["text"])
    .withNearText({ concepts: [query], forceSearch: true })
    .withLimit(1)
    .do();
    const result = resText.data.Get.Text[0].text;
    //console.log(result)
    writeFileSync("./result.txt", result);
    
};

//createSchema();

testText();
