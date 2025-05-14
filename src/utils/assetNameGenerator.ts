
export const generateAssetName = (
  file: File, 
  assetType: string
): string => {
  // Enlever l'extension du nom de fichier
  const fileName = file.name.replace(/\.[^/.]+$/, "");
  
  // Nettoyer le nom (enlever les caractères spéciaux)
  const cleanName = fileName
    .replace(/[^\w\s]/gi, '')
    .replace(/_/g, ' ')
    .trim();
  
  // Mettre en majuscule la première lettre de chaque mot
  const capitalizedName = cleanName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Si le nom nettoyé est vide, générer un nom basé sur le type d'asset
  if (!capitalizedName) {
    const timestamp = new Date().getTime().toString().slice(-4);
    
    switch (assetType) {
      case 'base-doll':
        return `Personnage ${timestamp}`;
      case 'hair':
        return `Cheveux ${timestamp}`;
      case 'clothing':
        return `Vêtement ${timestamp}`;
      case 'accessory':
        return `Accessoire ${timestamp}`;
      case 'facial-hair':
        return `Pilosité ${timestamp}`;
      default:
        return `Asset ${timestamp}`;
    }
  }
  
  return capitalizedName;
};

export const suggestAssetType = (fileName: string): string => {
  fileName = fileName.toLowerCase();
  
  if (fileName.includes('hair') || fileName.includes('cheveux') || fileName.includes('coiffure')) {
    return 'hair';
  }
  
  if (fileName.includes('clothing') || fileName.includes('clothes') || fileName.includes('vetement') || fileName.includes('vêtement') || fileName.includes('shirt') || fileName.includes('pants')) {
    return 'clothing';
  }
  
  if (fileName.includes('accessory') || fileName.includes('accessoire') || fileName.includes('hat') || fileName.includes('glasses')) {
    return 'accessory';
  }
  
  if (fileName.includes('beard') || fileName.includes('moustache') || fileName.includes('barbe')) {
    return 'facial-hair';
  }
  
  if (fileName.includes('doll') || fileName.includes('character') || fileName.includes('personnage') || fileName.includes('base')) {
    return 'base-doll';
  }
  
  return 'accessory'; // Type par défaut
};
