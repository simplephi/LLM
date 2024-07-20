// commands/command.js
const express = require("express");
const helpers = require("../helpers/helpers");
const driver = require("../db/db");
const { client, deploymentId } = require("../config/config");

const router = express.Router();

let conversationContext = [];

router.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message from user is required." });
  }

  conversationContext.push({ role: "user", content: userMessage });

  const messages = [
    ...conversationContext,
    { role: "assistant", content: "" },
  ];

  try {
    const result = await client.getChatCompletions(deploymentId, messages);
    const assistantResponse = result.choices[0].message.content;

    conversationContext.push({ role: "assistant", content: assistantResponse });

    // Ekstrak kata kunci dari jawaban asisten
    const keywords = await helpers.extractKeywordsFromGPT3(assistantResponse);

    // Simpan keywords di variabel global
    global.keywordsFromChat = keywords;
    // global.responsesHasil = assistantResponse;

    res.json({ assistantResponse, keywords });
  } catch (error) {
    console.error("Azure OpenAI Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/saveToNeo4j", async (req, res) => {
    // Gunakan global.keywordsFromChat di sini
    const keywords = global.keywordsFromChat;

    const responsesHasil = req.body.data;


  if (!keywords || !Array.isArray(keywords)) {
    return res.status(400).json({ error: "Keywords array is required." });
  }

  try {
    // Create Realtion Node
    // const hasil = await helpers.extractKeywordsWithContinuity(keywords);
    const hasil = await helpers.extractKeywordsWithContinuity(responsesHasil);
    
    
    // res.json({ success: true, hasil });
    // ===============================INI TES NYA=================================
    const sesi = driver.session();
    
    try {
      const result = await sesi.run('MATCH (n)-[r]->(m) RETURN n, r, m');
      
      // THis is check function
      const graphData = result.records.map(record => {
        return [record.get('n').properties, record.get('m').properties];
        
      });

      var prompt = "";      

      if(graphData.length>0){

        console.log("INIMI1 ",hasil);
        console.log("INIMI2 ",graphData);


        prompt = `
        1. compare ${hasil} and ${graphData}.
        2. create the relationship between all of keywords.
        3. all keywords must be connected.
        4. The result must have pattern :
        [
          {"node1": ..., "node2": ...},
          {"node1": ..., "node2": ...},
          ...
        ]
        
        `;
        const hai = await client.getChatCompletions(deploymentId, [{ role: "system", content: prompt }]);
      const generatedText = hai.choices[0].message.content;
  
      // Proses hasil generasi
      console.log("INIMI3 ",generatedText);

      try {
        // Simpan kata kunci ke dalam Neo4j
        await helpers.saveKeywordsWithContinuityToNeo4j(generatedText);
    
        res.json({ success: true });
      } catch (error) {
        console.error("Neo4j Error:", error);
        res.status(500).json({ error: "Internal server error." });
      }
      }
      else{
        try {
          // Simpan kata kunci ke dalam Neo4j
          await helpers.saveKeywordsWithContinuityToNeo4j(hasil);
      
          res.json({ success: true });
        } catch (error) {
          console.error("Neo4j Error:", error);
          res.status(500).json({ error: "Internal server error." });
        }

      }
      


    } catch (error) {
      console.error('Error fetching graph data:', error);
      return { success: false, message: 'Failed to fetch graph data.' };
    } finally {
      await sesi.close();
    }
    
    // =================================INI TES NYA=================================

    // try {
    //   // Simpan kata kunci ke dalam Neo4j
    //   await helpers.saveKeywordsWithContinuityToNeo4j(hasil);
  
    //   res.json({ success: true });
    // } catch (error) {
    //   console.error("Neo4j Error:", error);
    //   res.status(500).json({ error: "Internal server error." });
    // }


  } catch (error) {
    console.error("Neo4j Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }



 
});

router.post("/clearConversation", async (req, res) => {
  conversationContext = [];

   // Panggil fungsi helper untuk membersihkan data di Neo4j
   const neo4jCleared = await helpers.clearNeo4jData();

   if (neo4jCleared) {
    res.json({ success: true, message: "Conversation context cleared successfully." });
  } else {
    res.status(500).json({ success: false, message: "Failed to clear conversation context." });
  }
});

// Route untuk menampilkan semua graph di Neo4j
router.get("/allGraphs", async (req, res) => {
  try {
    const { success, graphData } = await helpers.getGraphData();

    if (success) {
      res.json({ success: true, graphData });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch all graph data.' });
    }
  } catch (error) {
    console.error('Error fetching all graph data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch all graph data.' });
  }
});

module.exports = router;
