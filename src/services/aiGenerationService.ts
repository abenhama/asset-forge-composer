
import { toast } from "sonner";
import { Asset, AssetType, AssetStyle } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Configuration pour l'API d'IA
const AI_API_ENDPOINT = "https://api.openai.com/v1/images/generations";
const AI_CHAT_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

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

// Fonction pour extraire les caractéristiques de la base doll via l'API OpenAI
const analyzeBaseDoll = async (
  baseDollUrl: string,
  apiKey: string
): Promise<string> => {
  try {
    console.log("Analyse de la base doll pour une génération optimisée...");
    
    const response = await fetch(AI_CHAT_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Vous êtes un assistant spécialisé dans l'analyse d'images et la création de prompts pour la génération d'assets compatibles."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analysez cette image de personnage et décrivez brièvement ses caractéristiques principales (style artistique, morphologie, genre, etc.). Formulez ensuite une courte description pour générer des assets complémentaires qui s'intégreraient parfaitement sur ce personnage en PNG transparent."
              },
              {
                type: "image_url",
                image_url: {
                  url: baseDollUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erreur lors de l'analyse de l'image");
    }

    const data = await response.json();
    const analysisResult = data.choices[0]?.message?.content;
    console.log("Analyse de la base doll:", analysisResult);
    
    return analysisResult || "";
  } catch (error) {
    console.error("Erreur lors de l'analyse de la base doll:", error);
    return ""; // En cas d'erreur, retourner une chaîne vide
  }
};

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
    // Analyse de la base doll si une URL est fournie
    let dollAnalysis = "";
    if (request.baseDollUrl) {
      toast("Analyse en cours", {
        description: "Analyse du personnage de base pour générer un asset adapté..."
      });
      
      dollAnalysis = await analyzeBaseDoll(request.baseDollUrl, apiKey);
    }
    
    // Construire un prompt plus détaillé basé sur les paramètres et l'analyse
    let enhancedPrompt = `Generate a ${request.style} style ${request.assetType}`;
    
    if (dollAnalysis) {
      enhancedPrompt += ` that matches the following character: ${dollAnalysis}`;
    }
    
    if (request.prompt) {
      enhancedPrompt += ` with these specifications: ${request.prompt}`;
    }
    
    if (request.assetType !== 'base-doll') {
      enhancedPrompt += `. Create this as a transparent PNG with no background, showing ONLY the ${request.assetType} itself with complete transparency around it, so it can be perfectly layered on top of a character. Make sure there is no background or border at all.`;
    }

    // Configuration pour DALL-E
    const payload = {
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json" // Utiliser b64_json au lieu de URL pour éviter les problèmes CORS
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
    console.log("Réponse de l'API DALL-E reçue");
    
    // Convertir la chaîne base64 en URL de données
    const base64Data = data.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${base64Data}`;

    // Conversion de l'asset généré au format attendu par l'application
    const newAsset: Asset = {
      id: uuidv4(),
      name: `IA ${request.assetType} - ${new Date().toLocaleDateString()}`,
      type: request.assetType,
      style: request.style,
      url: imageUrl,
      thumbnailUrl: imageUrl,
      tags: ["ia", request.style, request.assetType, "transparent"],
      colors: [],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    
    console.log("Asset généré avec succès");
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
