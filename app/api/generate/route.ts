import {GoogleGenAI, Modality} from "@google/genai"
import * as fs from "node:fs";

export async function POST(req: Request) {
    const googleGenAI = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
    });
    const {content} = await req.json();
    const response = await googleGenAI.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: content,
        config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
    })
    if(response.candidates){
        for(const part of response.candidates[0].content.parts){
            if (part.text) {
                console.log(part.text);
            }
        }
    }
}