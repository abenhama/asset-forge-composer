
import { toast } from "sonner";
import { Asset, AssetType, AssetStyle } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Configuration pour l'API d'IA
const AI_API_ENDPOINT = "https://api.openai.com/v1/images/generations";

// Types pour les requêtes et réponses
interface AIGenerationRequest {
  assetType: AssetType;
  prompt: string;
  style: AssetStyle;
  baseDollUrl?: string;
}

interface AIGenerationResponse {
  url: string;
  thumbnailUrl: string;
}

export const generateAssetWithAI = async (
  request: AIGenerationRequest,
  apiKey?: string
): Promise<Asset | null> => {
  if (!apiKey) {
    toast.error("Clé API non fournie", {
      description: "Une clé API valide est requise pour la génération d'assets."
    });
    return null;
  }
  
  try {
    // Construire un prompt plus détaillé basé sur les paramètres
    let enhancedPrompt = `Generate a ${request.style} style ${request.assetType}`;
    
    if (request.prompt) {
      enhancedPrompt += ` with these specifications: ${request.prompt}`;
    }
    
    if (request.assetType !== 'base-doll') {
      enhancedPrompt += `. This should be designed as a transparent PNG that can be layered on top of a character.`;
    }

    // Configuration pour DALL-E
    const payload = {
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "url"
    };

    console.log("Envoi de la requête à l'API DALL-E:", payload);

    // Appel à l'API
    const response = await fetch(AI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erreur lors de la génération de l'image");
    }

    const data = await response.json();
    console.log("Réponse de l'API DALL-E:", data);
    const imageUrl = data.data[0].url;

    // Conversion de l'asset généré au format attendu par l'application
    const newAsset: Asset = {
      id: uuidv4(),
      name: `IA ${request.assetType} - ${new Date().toLocaleDateString()}`,
      type: request.assetType,
      style: request.style,
      url: imageUrl,
      thumbnailUrl: imageUrl,
      tags: ["ia", request.style, request.assetType],
      colors: [],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    
    console.log("Asset généré:", newAsset);
    return newAsset;
  } catch (error) {
    console.error("Erreur lors de la génération d'assets:", error);
    
    if (error instanceof Error) {
      toast.error("Erreur de génération", {
        description: error.message
      });
    } else {
      toast.error("Erreur de génération", {
        description: "Une erreur inconnue s'est produite lors de la génération d'assets."
      });
    }
    
    return null;
  }
};
