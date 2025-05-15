
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

// Structure améliorée pour les informations d'analyse
interface AnalysisResult {
  description: string;
  style: {
    detectedStyle: string;
    artStyle: string;
    colorPalette: string[];
    lineWeight: 'thin' | 'medium' | 'thick';
  };
  viewAngle: 'front' | 'profile' | 'three-quarter' | 'back';
  dimensions: {
    imageWidth: number;
    imageHeight: number;
    headWidth: number;
    headHeight: number;
    shoulderWidth: number;
    torsoHeight: number;
    totalHeight: number;
  };
  keyPoints: {
    head: { x: number, y: number };
    forehead: { x: number, y: number };
    crown: { x: number, y: number };
    temples: { x: number, y: number };
    eyes: { x: number, y: number };
    nose: { x: number, y: number };
    mouth: { x: number, y: number };
    chin: { x: number, y: number };
    neck: { x: number, y: number };
    shoulders: { x: number, y: number };
    chest: { x: number, y: number };
    waist: { x: number, y: number };
    hips: { x: number, y: number };
    knees: { x: number, y: number };
    feet: { x: number, y: number };
  };
  positioning: {
    suggestedX: number;
    suggestedY: number;
    suggestedScale: number;
    anchorPoints?: Record<string, { x: number, y: number }>;
  };
  characterAttributes: {
    gender: string;
    ageGroup: string; 
    skinTone: string;
    hairColor: string;
    facialShape: string;
    bodyType: string;
  };
  resolution: {
    dpi: number;
    clarity: string;
  };
}

// Valeurs par défaut pour l'analyse
const DEFAULT_ANALYSIS_RESULT: AnalysisResult = {
  description: "",
  style: {
    detectedStyle: "cartoon",
    artStyle: "simple",
    colorPalette: ["#000000", "#FFFFFF"],
    lineWeight: "medium"
  },
  viewAngle: "front",
  dimensions: {
    imageWidth: 500,
    imageHeight: 600,
    headWidth: 100,
    headHeight: 120,
    shoulderWidth: 200,
    torsoHeight: 250,
    totalHeight: 500
  },
  keyPoints: {
    head: { x: 250, y: 100 },
    forehead: { x: 250, y: 80 },
    crown: { x: 250, y: 50 },
    temples: { x: 200, y: 100 },
    eyes: { x: 250, y: 120 },
    nose: { x: 250, y: 140 },
    mouth: { x: 250, y: 160 },
    chin: { x: 250, y: 180 },
    neck: { x: 250, y: 200 },
    shoulders: { x: 250, y: 220 },
    chest: { x: 250, y: 270 },
    waist: { x: 250, y: 320 },
    hips: { x: 250, y: 370 },
    knees: { x: 250, y: 450 },
    feet: { x: 250, y: 550 }
  },
  positioning: {
    suggestedX: 250,
    suggestedY: 300,
    suggestedScale: 0.5
  },
  characterAttributes: {
    gender: "non-binary",
    ageGroup: "adult",
    skinTone: "medium",
    hairColor: "brown",
    facialShape: "oval",
    bodyType: "average"
  },
  resolution: {
    dpi: 72,
    clarity: "clear"
  }
};

// Fonction pour convertir une URL data en Blob puis en File
const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

// Fonction améliorée pour extraire les caractéristiques de la base doll via l'API OpenAI
const analyzeBaseDoll = async (
  baseDollDataUrl: string,
  apiKey: string
): Promise<AnalysisResult | null> => {
  try {
    console.log("Analyse détaillée de la base doll pour une génération optimisée...");
    
    // Conversion de l'URL data en File pour l'envoyer à l'API
    const baseDollFile = await dataUrlToFile(baseDollDataUrl, "base-doll.png");
    
    const messages = [
      {
        role: "system",
        content: `Vous êtes un expert en analyse d'images et en generation d'assets pour des personnages virtuels. 
        Analysez minutieusement chaque détail de cette image de personnage (base doll).`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analysez cette image de personnage de façon extrêmement détaillée pour permettre la génération d'assets parfaitement adaptés.
            
            Veuillez fournir:
            1. Dimensions exactes: largeur/hauteur de la tête, épaules, torse et personnage entier en pixels
            2. Points d'ancrage précis avec coordonnées (x,y) pour: tête, front, couronne, tempes, yeux, nez, bouche, menton, cou, épaules, poitrine, taille, hanches, genoux et pieds
            3. Style artistique: style détecté, poids des lignes, palette de couleurs
            4. Angle de vue: face, profil, trois-quarts ou dos
            5. Caractéristiques du personnage: genre, groupe d'âge, teint de peau, couleur de cheveux, forme du visage, type corporel
            6. Résolution: DPI estimé, clarté de l'image
            
            Ces informations permettront de générer des assets (vêtements, cheveux, accessoires) qui s'intégreront parfaitement sur ce personnage avec un fond transparent.
            
            Répondez uniquement avec un JSON valide et structuré selon ce format exact:
            {
              "description": "description générale concise",
              "style": {
                "detectedStyle": "cartoon/anime/realistic/minimalist",
                "artStyle": "description du style artistique",
                "colorPalette": ["hex1", "hex2", "hex3"],
                "lineWeight": "thin/medium/thick"
              },
              "viewAngle": "front/profile/three-quarter/back",
              "dimensions": {
                "imageWidth": valeur en pixels,
                "imageHeight": valeur en pixels,
                "headWidth": valeur en pixels,
                "headHeight": valeur en pixels,
                "shoulderWidth": valeur en pixels,
                "torsoHeight": valeur en pixels,
                "totalHeight": valeur en pixels
              },
              "keyPoints": {
                "head": {"x": valeur, "y": valeur},
                "forehead": {"x": valeur, "y": valeur},
                "crown": {"x": valeur, "y": valeur},
                "temples": {"x": valeur, "y": valeur},
                "eyes": {"x": valeur, "y": valeur},
                "nose": {"x": valeur, "y": valeur},
                "mouth": {"x": valeur, "y": valeur},
                "chin": {"x": valeur, "y": valeur},
                "neck": {"x": valeur, "y": valeur},
                "shoulders": {"x": valeur, "y": valeur},
                "chest": {"x": valeur, "y": valeur},
                "waist": {"x": valeur, "y": valeur},
                "hips": {"x": valeur, "y": valeur},
                "knees": {"x": valeur, "y": valeur},
                "feet": {"x": valeur, "y": valeur}
              },
              "positioning": {
                "suggestedX": valeur,
                "suggestedY": valeur,
                "suggestedScale": valeur
              },
              "characterAttributes": {
                "gender": "description",
                "ageGroup": "infant/child/teen/young-adult/adult/senior", 
                "skinTone": "description",
                "hairColor": "description",
                "facialShape": "description",
                "bodyType": "description"
              },
              "resolution": {
                "dpi": valeur estimée,
                "clarity": "low/medium/high"
              }
            }`
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
        max_tokens: 3000,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erreur lors de l'analyse de l'image");
    }

    const data = await response.json();
    const analysisResult = data.choices[0]?.message?.content;
    console.log("Analyse détaillée de la base doll:", analysisResult);
    
    try {
      // Parser le résultat JSON de l'analyse
      const parsedResult = JSON.parse(analysisResult);
      
      // Valider que le résultat contient au moins les propriétés essentielles
      const validationResult = validateAnalysisResult(parsedResult);
      
      if (!validationResult.valid) {
        console.warn("Analyse incomplète:", validationResult.missing);
        toast.warning("Analyse partielle", {
          description: "Certains éléments n'ont pas pu être analysés correctement."
        });
        
        // Fusion avec les valeurs par défaut pour les propriétés manquantes
        return mergeWithDefaults(parsedResult, DEFAULT_ANALYSIS_RESULT);
      }
      
      return parsedResult;
    } catch (parseError) {
      console.error("Erreur lors du parsing du résultat:", parseError);
      toast.error("Erreur d'analyse", {
        description: "Le format de l'analyse n'est pas valide. Utilisation des valeurs par défaut."
      });
      
      // En cas d'erreur de parsing, retourner les valeurs par défaut avec la description
      return {
        ...DEFAULT_ANALYSIS_RESULT,
        description: analysisResult?.substring(0, 100) || "Personnage"
      };
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse de la base doll:", error);
    toast.error("Échec de l'analyse", {
      description: error instanceof Error ? error.message : "Une erreur inconnue s'est produite"
    });
    return DEFAULT_ANALYSIS_RESULT; // En cas d'erreur, retourner les valeurs par défaut
  }
};

// Valider que le résultat de l'analyse contient toutes les propriétés nécessaires
const validateAnalysisResult = (result: any): { valid: boolean; missing: string[] } => {
  const requiredProperties = [
    'description',
    'style',
    'viewAngle',
    'dimensions',
    'keyPoints',
    'positioning',
    'characterAttributes',
    'resolution'
  ];
  
  const missing = requiredProperties.filter(prop => !result[prop]);
  
  return {
    valid: missing.length === 0,
    missing
  };
};

// Fusionner les valeurs par défaut avec les valeurs analysées
const mergeWithDefaults = (analyzed: Partial<AnalysisResult>, defaults: AnalysisResult): AnalysisResult => {
  // Fonction récursive pour fusionner des objets imbriqués
  const deepMerge = (target: any, source: any): any => {
    for (const key in source) {
      if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
        deepMerge(target[key], source[key]);
      } else if (!(key in target)) {
        target[key] = source[key];
      }
    }
    return target;
  };
  
  return deepMerge({ ...analyzed }, defaults);
};

// Fonction pour générer un prompt DALL-E adapté au type d'asset
const generateAssetTypePrompt = (
  assetType: AssetType, 
  assetSubType: AssetSubType | undefined,
  basePrompt: string,
  style: AssetStyle,
  dollAnalysis?: AnalysisResult
): string => {
  let typeSpecificInstructions = "";
  let styleModifier = "";
  
  // Déterminer le style en fonction de l'analyse
  if (dollAnalysis) {
    styleModifier = `${dollAnalysis.style.detectedStyle} style, ${dollAnalysis.style.lineWeight} line weight, `;
    
    // Ajout d'informations sur la palette de couleurs si disponible
    if (dollAnalysis.style.colorPalette && dollAnalysis.style.colorPalette.length > 0) {
      styleModifier += `using a color palette similar to [${dollAnalysis.style.colorPalette.join(', ')}], `;
    }
  } else {
    styleModifier = `${style} style, `;
  }
  
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
  let prompt = `Generate a ${styleModifier}${typeSpecificInstructions}`;
  
  // Ajouter l'analyse de la base doll si disponible
  if (dollAnalysis) {
    // Ajouter des détails sur le personnage analysé
    prompt += ` that perfectly matches this character: ${dollAnalysis.description}`;
    
    // Ajouter des détails sur l'angle de vue
    prompt += `, shown from a ${dollAnalysis.viewAngle} view`;
    
    // Ajouter des détails sur les attributs du personnage si nécessaire
    if (assetType === 'hair' || assetType === 'facial-hair') {
      prompt += `, appropriate for a ${dollAnalysis.characterAttributes.gender} 
      ${dollAnalysis.characterAttributes.ageGroup} with ${dollAnalysis.characterAttributes.facialShape} face shape`;
    }
    
    if (assetType === 'clothing') {
      prompt += `, properly sized to fit a ${dollAnalysis.characterAttributes.bodyType} 
      ${dollAnalysis.characterAttributes.gender} ${dollAnalysis.characterAttributes.ageGroup}`;
    }
    
    // Spécifier les dimensions
    if (assetType === 'hair') {
      prompt += `. The head dimensions are approximately ${dollAnalysis.dimensions.headWidth}x${dollAnalysis.dimensions.headHeight} pixels`;
    } else if (assetType === 'clothing') {
      prompt += `. The torso/body dimensions are approximately ${dollAnalysis.dimensions.shoulderWidth}x${dollAnalysis.dimensions.torsoHeight} pixels`;
    }
  }
  
  // Ajouter le prompt de l'utilisateur
  if (basePrompt) {
    prompt += ` with these additional specifications: ${basePrompt}`;
  }
  
  // Instructions techniques pour tous les types - spécifiques et détaillées
  prompt += `. 
  IMPORTANT TECHNICAL REQUIREMENTS:
  - Create this as a PNG with 100% transparent background
  - NO shadows, NO borders, NO background elements whatsoever
  - The image must be PERFECTLY pre-cropped with transparency around it
  - ONLY the requested ${assetType}${assetSubType ? ' ' + assetSubType : ''} should be visible, nothing else
  - Ensure PERFECT edge transparency with no white fringing or artifacts around the edges
  - The output MUST have proper alpha channel transparency, NOT white or colored background
  - The final image must be directly usable without any further cropping or editing`;
  
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
        description: "Analyse détaillée du personnage pour générer un asset parfaitement adapté..."
      });
      
      dollAnalysis = await analyzeBaseDoll(request.baseDollUrl, apiKey);
    }
    
    // Générer un prompt optimisé pour le type d'asset
    const enhancedPrompt = generateAssetTypePrompt(
      request.assetType,
      request.assetSubType,
      request.prompt,
      request.style,
      dollAnalysis
    );
    
    toast("Génération en cours", {
      description: "Création de l'asset avec DALL-E selon les caractéristiques détectées..."
    });
    
    console.log("Prompt DALL-E optimisé:", enhancedPrompt);

    // Configuration pour DALL-E
    const payload = {
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json", // Utiliser b64_json au lieu de URL pour éviter les problèmes CORS
      quality: "hd", // Utiliser la qualité HD pour des résultats optimaux
      style: "natural" // Utiliser le style naturel pour plus de cohérence
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
      suggestedScale: 0.5,
      anchorPoints: dollAnalysis?.keyPoints
    };
    
    // Tags basés sur le type d'asset et l'analyse
    const assetTags = ["ai-generated", request.style, request.assetType];
    if (request.assetSubType) {
      assetTags.push(request.assetSubType);
    }
    assetTags.push("transparent");
    
    // Ajouter des tags basés sur l'analyse
    if (dollAnalysis) {
      assetTags.push(dollAnalysis.viewAngle);
      assetTags.push(dollAnalysis.style.detectedStyle);
      
      if (dollAnalysis.characterAttributes) {
        assetTags.push(dollAnalysis.characterAttributes.gender);
        assetTags.push(dollAnalysis.characterAttributes.ageGroup);
      }
    }
    
    // Générer un nom d'asset descriptif
    const assetName = `IA ${request.assetType}${request.assetSubType ? ' ' + request.assetSubType : ''} - ${new Date().toLocaleDateString()}`;

    // Conversion de l'asset généré au format attendu par l'application
    const newAsset: Asset = {
      id: uuidv4(),
      name: assetName,
      type: request.assetType,
      subType: request.assetSubType,
      style: dollAnalysis?.style?.detectedStyle as AssetStyle || request.style,
      url: imageUrl,
      thumbnailUrl: imageUrl,
      tags: assetTags.filter((tag, index) => assetTags.indexOf(tag) === index), // Éliminer les doublons
      colors: dollAnalysis?.style?.colorPalette || [],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      positioning: positioning,
      zIndex: zIndex,
      metadata: {
        originalPrompt: enhancedPrompt,
        dollAnalysis: dollAnalysis ? JSON.stringify(dollAnalysis) : undefined,
        generationModel: "dall-e-3"
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
