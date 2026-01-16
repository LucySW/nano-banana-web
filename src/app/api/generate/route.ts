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
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-image-preview",
      systemInstruction: systemPrompt,
    });

    let finalPrompt = prompt;
    if (style && style !== "Nenhum") finalPrompt += `, ${style} style`;
    if (lighting && lighting !== "Nenhum") finalPrompt += `, ${lighting} lighting`;
    finalPrompt += ` --aspect_ratio ${ratio}`;

    // Note: 'image_size' support varies by SDK version. 
    // We pass it in generationConfig. If the SDK types complain, we might need a cast or ts-ignore in local dev,
    // but usually it passes through to the API.
    const generationConfig: any = {
      temperature: parseFloat(temperature),
      image_size: resolution, // 1K, 2K, 4K provided by client
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig,
    });

    const response = await result.response;
    
    // Attempt to find inline image data
    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (part && 'inlineData' in part && part.inlineData) {
        return NextResponse.json({
            success: true,
            image: part.inlineData.data, // Base64 string
            mimeType: part.inlineData.mimeType,
            metadata: {
                timestamp: new Date().toISOString(),
                finalPrompt,
                resolution,
                ratio,
                model: "gemini-3-pro-image-preview"
            }
        });
    }

    return NextResponse.json({ error: "No image generated. The model might have returned text only." }, { status: 500 });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
