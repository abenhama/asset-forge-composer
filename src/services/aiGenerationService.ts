
import { toast } from "sonner";
import { Asset, AssetType, AssetStyle, AssetSubType, LAYER_Z_INDEX } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { getAssetZIndex } from "@/utils/assetLayerUtils";

// Configuration pour l'API d'IA
const AI_API_ENDPOINT = "https://api.openai.com/v1/images/generations";
const AI_CHAT_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

// Types pour les requêtes et réponses
interface AIGenerationRequest {
  assetType: AssetType;
  assetSubType?: AssetSubType;
  prompt: string;
  style: AssetStyle;
  baseDollUrl?: string;
}

// Structure pour les informations d'analyse
interface AnalysisResult {
  description: string;
  positioning: {
    suggestedX: number;
    suggestedY: number;
    suggestedScale: number;
    anchorPoints?: {
      head?: { x: number, y: number };
      shoulders?: { x: number, y: number };
      waist?: { x: number, y: number };
      feet?: { x: number, y: number };
    };
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
            text: "Analysez cette image de personnage et décrivez ses caractéristiques principales (style artistique, morphologie, genre, âge, teint de peau, etc.). Identifiez avec précision les points d'ancrage suivants: tête, épaules, taille et pieds. Formulez ensuite une description détaillée pour générer des assets complémentaires qui s'intégreraient parfaitement sur ce personnage en PNG transparent. Les assets doivent être parfaitement découpés avec un fond transparent pour superposition. Répondez avec un JSON au format suivant: {\"description\": \"votre analyse\", \"positioning\": {\"suggestedX\": valeur, \"suggestedY\": valeur, \"suggestedScale\": valeur, \"anchorPoints\": {\"head\": {\"x\": valeur, \"y\": valeur}, \"shoulders\": {\"x\": valeur, \"y\": valeur}, \"waist\": {\"x\": valeur, \"y\": valeur}, \"feet\": {\"x\": valeur, \"y\": valeur}}}}."
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
    
    const response = await fetch(AI_CHAT_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 1000
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
          suggestedX: parsedResult.positioning.suggestedX || 250,
          suggestedY: parsedResult.positioning.suggestedY || 300,
          suggestedScale: parsedResult.positioning.suggestedScale || 0.5,
          anchorPoints: parsedResult.positioning.anchorPoints || {
            head: { x: 250, y: 150 },
            shoulders: { x: 250, y: 200 },
            waist: { x: 250, y: 300 },
            feet: { x: 250, y: 450 }
          }
        }
      };
    } catch (parseError) {
      console.error("Erreur lors du parsing du résultat:", parseError);
      // Si le parsing échoue, retourner un objet avec les valeurs par défaut
      return {
        description: analysisResult || "",
        positioning: {
          suggestedX: 250,
          suggestedY: 300,
          suggestedScale: 0.5,
          anchorPoints: {
            head: { x: 250, y: 150 },
            shoulders: { x: 250, y: 200 },
            waist: { x: 250, y: 300 },
            feet: { x: 250, y: 450 }
          }
        }
      };
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse de la base doll:", error);
    return null; // En cas d'erreur, retourner null
  }
};

// Fonction pour générer un prompt DALL-E adapté au type d'asset
const generateAssetTypePrompt = (
  assetType: AssetType, 
  assetSubType: AssetSubType | undefined,
  basePrompt: string,
  style: AssetStyle,
  dollAnalysis?: string
): string => {
  let typeSpecificInstructions = "";
  
  switch(assetType) {
    case 'base-doll':
      typeSpecificInstructions = "un personnage complet sur fond transparent, corps entier visible, proportions réalistes";
      break;
      
    case 'hair':
      if (assetSubType === 'hair-front') {
        typeSpecificInstructions = "une coiffure frontale uniquement (partie avant des cheveux), parfaitement découpée sur fond transparent";
      } else if (assetSubType === 'hair-back') {
        typeSpecificInstructions = "la partie arrière des cheveux uniquement, parfaitement découpée sur fond transparent";
      } else {
        typeSpecificInstructions = "une coiffure complète (avant et arrière), parfaitement découpée sur fond transparent";
      }
      break;
      
    case 'clothing':
      if (assetSubType === 'clothing-top') {
        typeSpecificInstructions = "un haut de vêtement uniquement (t-shirt, chemise, etc.), parfaitement découpé sur fond transparent";
      } else if (assetSubType === 'clothing-bottom') {
        typeSpecificInstructions = "un bas de vêtement uniquement (pantalon, jupe, etc.), parfaitement découpé sur fond transparent";
      } else if (assetSubType === 'clothing-dress') {
        typeSpecificInstructions = "une robe complète, parfaitement découpée sur fond transparent";
      } else if (assetSubType === 'clothing-outerwear') {
        typeSpecificInstructions = "un vêtement d'extérieur (veste, manteau, etc.), parfaitement découpé sur fond transparent";
      } else {
        typeSpecificInstructions = "un vêtement parfaitement découpé sur fond transparent";
      }
      break;
      
    case 'accessory':
      if (assetSubType === 'glasses') {
        typeSpecificInstructions = "des lunettes uniquement, parfaitement découpées sur fond transparent";
      } else if (assetSubType === 'hat') {
        typeSpecificInstructions = "un chapeau ou une casquette uniquement, parfaitement découpé sur fond transparent";
      } else if (assetSubType === 'jewelry') {
        typeSpecificInstructions = "un bijou uniquement (collier, bracelet, etc.), parfaitement découpé sur fond transparent";
      } else {
        typeSpecificInstructions = "un accessoire parfaitement découpé sur fond transparent";
      }
      break;
      
    case 'facial-hair':
      typeSpecificInstructions = "de la pilosité faciale uniquement (barbe, moustache, etc.), parfaitement découpée sur fond transparent";
      break;
  }
  
  // Construire le prompt complet
  let prompt = `Generate a ${style} style ${typeSpecificInstructions}`;
  
  // Ajouter l'analyse de la base doll si disponible
  if (dollAnalysis) {
    prompt += ` that perfectly matches this character: ${dollAnalysis}`;
  }
  
  // Ajouter le prompt de l'utilisateur
  if (basePrompt) {
    prompt += ` with these specifications: ${basePrompt}`;
  }
  
  // Instructions techniques pour tous les types
  prompt += `. Create this as a PNG with 100% transparent background, no shadows, no borders, showing ONLY the ${assetType} itself. The image must be perfectly pre-cropped with transparency all around it so it can be layered onto a character without any manual cropping needed. The final image should have absolutely no background elements or borders whatsoever, just the isolated ${assetType} asset on a transparent background.`;
  
  return prompt;
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
    // Analyse de la base doll si une URL est fournie
    let dollAnalysis = null;
    if (request.baseDollUrl) {
      toast("Analyse en cours", {
        description: "Analyse du personnage de base pour générer un asset adapté..."
      });
      
      dollAnalysis = await analyzeBaseDoll(request.baseDollUrl, apiKey);
    }
    
    // Générer un prompt optimisé pour le type d'asset
    const enhancedPrompt = generateAssetTypePrompt(
      request.assetType,
      request.assetSubType,
      request.prompt,
      request.style,
      dollAnalysis?.description
    );
    
    toast("Génération en cours", {
      description: "Création de l'asset avec DALL-E..."
    });
    
    console.log("Prompt DALL-E optimisé:", enhancedPrompt);

    // Configuration pour DALL-E
    const payload = {
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json" // Utiliser b64_json au lieu de URL pour éviter les problèmes CORS
    };

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

    // Déterminer le Z-index approprié
    const zIndex = getAssetZIndex(request.assetType, request.assetSubType);
    
    // Extraction des points d'ancrage et positionnement
    const positioning = dollAnalysis?.positioning || {
      suggestedX: 250,
      suggestedY: 300,
      suggestedScale: 0.5
    };
    
    // Tags basés sur le type d'asset
    const assetTags = ["ai-generated", request.style, request.assetType];
    if (request.assetSubType) {
      assetTags.push(request.assetSubType);
    }
    assetTags.push("transparent");
    
    // Générer un nom d'asset descriptif
    const assetName = `IA ${request.assetType}${request.assetSubType ? ' ' + request.assetSubType : ''} - ${new Date().toLocaleDateString()}`;

    // Conversion de l'asset généré au format attendu par l'application
    const newAsset: Asset = {
      id: uuidv4(),
      name: assetName,
      type: request.assetType,
      subType: request.assetSubType,
      style: request.style,
      url: imageUrl,
      thumbnailUrl: imageUrl,
      tags: assetTags,
      colors: [],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      positioning: positioning,
      zIndex: zIndex
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
