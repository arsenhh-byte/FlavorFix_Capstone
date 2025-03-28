// pages/api/chat.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ message: "Method not allowed" });
    }
  
    const { conversation } = req.body;
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ message: "Invalid conversation data" });
    }
  
    try {
      // Use the versioned base URL, e.g.:
      const baseURL = "https://api.aimlapi.com/v1";
      // Example free model name:
      const model = "mistralai/Mistral-7B-Instruct-v0.2";
  
      // Make the request to AIML API
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AIML_API_KEY}`, // from .env.local
        },
        body: JSON.stringify({
          model,
          messages: conversation,
          temperature: 0.7,
          max_tokens: 256,
        }),
      });
  
      if (!response.ok) {
        console.error("AIML API error:", response.status, response.statusText);
        throw new Error("AIML API error");
      }
  
      // Log the raw JSON from AIML to see its shape
      const data = await response.json();
      console.log("AIML API raw data:", data);
  
      // If the AIML API is OpenAI-like, the assistant text is often in data.choices[0].message.content
      // Adjust if the docs differ
      const assistantText = data.choices?.[0]?.message?.content || "";
  
      // Return that text to the front-end as "reply"
      return res.status(200).json({ reply: assistantText });
    } catch (error) {
      console.error("AIML API error:", error);
      return res.status(500).json({ message: "Error from AIML API" });
    }
  }