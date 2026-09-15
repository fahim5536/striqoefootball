const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    try {
      const vision = getVisionClient();
      const [result] = await vision.textDetection(imageUrl);
      const detections = result.textAnnotations;
      const extractedText = detections.length > 0 ? detections[0].description : '';
      // Dummy parse logic: send to Gemini to parse scores
      const ai = getAi();
      const prompt = \`Extract the home and away scores from this raw OCR text from an eFootball match screenshot. Return ONLY a JSON object with { "homeScore": number, "awayScore": number }. Text: \${extractedText}\`;
      
      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const parsedData = aiResponse.text.replace(/\\x60\\x60\\x60json/g, '').replace(/\\x60\\x60\\x60/g, '').trim();`;

const replacement = `    try {
      const ai = getAi();
      
      // Fetch the image from URL and convert to Base64
      const imageResp = await fetch(imageUrl);
      if (!imageResp.ok) throw new Error("Failed to download image for analysis");
      const arrayBuffer = await imageResp.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';
      
      const prompt = \`Analyze this eFootball match screenshot carefully. Extract the home and away scores. Return ONLY a JSON object with { "homeScore": number, "awayScore": number }. If the image is not a valid score screen or you cannot detect scores, return { "error": "Invalid screenshot" }.\`;
      
      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          { inlineData: { data: base64Data, mimeType } }
        ],
      });
      
      const extractedText = "Processed via Gemini Vision";
      const parsedData = aiResponse.text.replace(/\\x60\\x60\\x60json/g, '').replace(/\\x60\\x60\\x60/g, '').trim();`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
