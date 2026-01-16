import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, prompt, systemPrompt, ratio, resolution, temperature, style, lighting } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the correct model name for image generation
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
    });

    // Build the prompt with aspect ratio hint
    let finalPrompt = prompt;
    if (style && style !== "Nenhum") finalPrompt += `, ${style} style`;
    if (lighting && lighting !== "Nenhum") finalPrompt += `, ${lighting} lighting`;
    
    // Add aspect ratio as a natural language hint
    const ratioMap: Record<string, string> = {
      "1:1": "square format",
      "16:9": "widescreen landscape format (16:9)",
      "9:16": "vertical portrait format (9:16)",
      "4:3": "classic 4:3 format",
      "3:4": "vertical 3:4 portrait format",
      "3:2": "classic photo 3:2 format",
      "2:3": "vertical 2:3 portrait format",
      "21:9": "ultrawide cinematic format (21:9)"
    };
    
    if (ratio && ratioMap[ratio]) {
      finalPrompt += `. Image should be in ${ratioMap[ratio]}.`;
    }

    // Generation config without unsupported fields
    const generationConfig: any = {
      temperature: parseFloat(temperature) || 0.7,
      responseModalities: ["TEXT", "IMAGE"],
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig,
    });

    const response = await result.response;
    
    // Find inline image data
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    
    // Look for image part in all parts
    const imagePart = parts.find((p: any) => 'inlineData' in p && p.inlineData);

    if (imagePart && 'inlineData' in imagePart && imagePart.inlineData) {
        return NextResponse.json({
            success: true,
            image: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
            metadata: {
                timestamp: new Date().toISOString(),
                finalPrompt,
                resolution,
                ratio,
                model: "gemini-2.0-flash-exp-image-generation"
            }
        });
    }

    // If no image, return text response for debugging
    const textPart = parts.find((p: any) => 'text' in p);
    return NextResponse.json({ 
      error: "No image generated. Model returned text: " + (textPart?.text || "No response"),
      debug: { parts: parts.map((p: any) => Object.keys(p)) }
    }, { status: 500 });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ 
      error: `[GoogleGenerativeAI Error]: ${error.message || "Unknown error"}`,
      details: error.toString()
    }, { status: 500 });
  }
}
