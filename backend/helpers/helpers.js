// helpers/helpers.js
const { client, deploymentId } = require("../config/config");
const driver = require("../db/db");

async function extractKeywordsFromGPT3(text) {
  try {
    const prompt = `Extract important keywords (only 1 word, name Keywords may not be repeated) separated then with comma from: ${text}`;
    
    const result = await client.getChatCompletions(deploymentId, [{ role: "system", content: prompt }]);
    const generatedText = result.choices[0].message.content;

    // Proses hasil generasi, pecah menjadi kata-kata menggunakan koma sebagai pemisah
    const keywords = generatedText.split(',');

    return keywords;
  } catch (error) {
    console.error("Azure OpenAI Generation Error:", error);
    return [];
  }
}

async function extractKeywordsWithContinuity(text) {
  try {
    const prompt = `
    1. this is the given text : ${text}.
    2. Extract important keywords from the text.
    3. create the relationship between all of keywords.
    4. all keywords must be connected.
    5. The result must be have pattern :
    [
      {"node1": ..., "node2": ...},
      {"node1": ..., "node2": ...},
      ...
    ]
     
    `;
    const result = await client.getChatCompletions(deploymentId, [{ role: "system", content: prompt }]);
    const generatedText = result.choices[0].message.content;

    // Proses hasil generasi
    console.log(generatedText);


    
    return generatedText;
  } catch (error) {
    console.error("Azure OpenAI Generation Error:", error);
    return "";
  }
}

const saveKeywordsWithContinuityToNeo4j = async (keywords) => {

const session = driver.session();
  try {
  

    console.log("=====");
    
    const dataArray = JSON.parse(keywords);
    console.log(typeof(dataArray));
    console.log(dataArray);
    // console.log(dataArray.length);
    
    for (let i = 0; i < dataArray.length; i++)  {
      
      const query = `
      MERGE (source:Node {name: $source})
      MERGE (target:Node {name: $target})
      MERGE (source)-[:CONNECTED_TO]->(target)
      `;
  
      await session.run(query, { source: dataArray[i].node1, target: dataArray[i].node2 });
  
    }

    console.log('Data inserted successfully');
  } 
  finally {
    // Close the session and driver when done
    // await session.close();
    // await driver.close();
  }


};



async function clearNeo4jData() {
  try {
    const session = driver.session();
    // Eksekusi perintah di Neo4j untuk menghapus semua node dan relasi
    const result = await session.run('MATCH (n) DETACH DELETE n');
    // console.log('Cleared data in Neo4j:', result.summary);
    console.log('Cleared data in Neo4j');
    return true;
  } catch (error) {
    console.error('Error clearing data in Neo4j:', error);
    return false;
  }
}

async function getGraphData() {
  const sesi = driver.session();

  try {
    const result = await sesi.run('MATCH (n)-[r]->(m) RETURN n, r, m');

    const graphData = result.records.map(record => {
      return {
        
        nodes: [record.get('n').properties, record.get('m').properties],
        // edges: [record.get('r').properties],
      };
    });

    return { success: true, graphData };
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return { success: false, message: 'Failed to fetch graph data.' };
  } finally {
    await sesi.close();
  }
}


module.exports = {
  extractKeywordsFromGPT3,
  extractKeywordsWithContinuity,
  saveKeywordsWithContinuityToNeo4j,
  clearNeo4jData,
  getGraphData
};
