
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

// Structure pour les informations d'analyse
interface AnalysisResult {
  description: string;
  positioning: {
    suggestedX: number;
    suggestedY: number;
    suggestedScale: number;
  };
}

// Fonction pour convertir une URL data en Blob puis en File
const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

// Fonction pour extraire les caractéristiques de la base doll via l'API OpenAI
const analyzeBaseDoll = async (
  baseDollDataUrl: string,
  apiKey: string
): Promise<AnalysisResult | null> => {
  try {
    console.log("Analyse de la base doll pour une génération optimisée...");
    
    // Conversion de l'URL data en File pour l'envoyer à l'API
    const baseDollFile = await dataUrlToFile(baseDollDataUrl, "base-doll.png");
    
    // Créer un FormData pour envoyer l'image directement
    const formData = new FormData();
    formData.append("model", "gpt-4o");
    
    const messages = [
      {
        role: "system",
        content: "Vous êtes un assistant spécialisé dans l'analyse d'images et la création de prompts pour la génération d'assets compatibles."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analysez cette image de personnage et décrivez brièvement ses caractéristiques principales (style artistique, morphologie, genre, etc.). Formulez ensuite une courte description pour générer des assets complémentaires qui s'intégreraient parfaitement sur ce personnage en PNG transparent. Incluez également des coordonnées suggérées pour le placement (X, Y) et l'échelle appropriée. Répondez avec un JSON au format suivant: {\"description\": \"votre analyse\", \"positioning\": {\"suggestedX\": valeur, \"suggestedY\": valeur, \"suggestedScale\": valeur}}."
          },
          {
            type: "image_url",
            image_url: {
              url: baseDollDataUrl
            }
          }
        ]
      }
    ];
    
    formData.append("messages", JSON.stringify(messages));
    formData.append("max_tokens", "500");
    
    const response = await fetch(AI_CHAT_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erreur lors de l'analyse de l'image");
    }

    const data = await response.json();
    const analysisResult = data.choices[0]?.message?.content;
    console.log("Analyse de la base doll:", analysisResult);
    
    try {
      // Parser le résultat JSON de l'analyse
      const parsedResult = JSON.parse(analysisResult);
      return {
        description: parsedResult.description,
        positioning: {
          suggestedX: parsedResult.positioning.suggestedX || 150,
          suggestedY: parsedResult.positioning.suggestedY || 150,
          suggestedScale: parsedResult.positioning.suggestedScale || 0.5
        }
      };
    } catch (parseError) {
      console.error("Erreur lors du parsing du résultat:", parseError);
      // Si le parsing échoue, retourner un objet avec les valeurs par défaut
      return {
        description: analysisResult || "",
        positioning: {
          suggestedX: 150,
          suggestedY: 150,
          suggestedScale: 0.5
        }
      };
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse de la base doll:", error);
    return null; // En cas d'erreur, retourner null
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
    let dollAnalysis = null;
    if (request.baseDollUrl) {
      toast("Analyse en cours", {
        description: "Analyse du personnage de base pour générer un asset adapté..."
      });
      
      dollAnalysis = await analyzeBaseDoll(request.baseDollUrl, apiKey);
    }
    
    // Construire un prompt plus détaillé basé sur les paramètres et l'analyse
    let enhancedPrompt = `Generate a ${request.style} style ${request.assetType}`;
    
    if (dollAnalysis?.description) {
      enhancedPrompt += ` that matches the following character: ${dollAnalysis.description}`;
    }
    
    if (request.prompt) {
      enhancedPrompt += ` with these specifications: ${request.prompt}`;
    }
    
    if (request.assetType !== 'base-doll') {
      enhancedPrompt += `. Create this as a transparent PNG with no background, showing ONLY the ${request.assetType} itself with complete transparency around it, so it can be perfectly layered on top of a character. Make sure there is no background or border at all. Create it as if it's already properly cropped.`;
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
      // Ajouter les informations de positionnement si disponibles
      positioning: dollAnalysis?.positioning || {
        suggestedX: 150,
        suggestedY: 150,
        suggestedScale: 0.5
      }
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
