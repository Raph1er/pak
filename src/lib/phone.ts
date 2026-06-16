/**
 * Normalise un numéro de téléphone (supprime espaces, tirets, etc.)
 * Ajoute automatiquement +229 (Bénin) si aucun indicatif n'est présent
 * Ex: "56904109" → "+22956904109"
 * Ex: "+229 01 56 90 41 09" → "+2290156904109"
 */
export function normalizePhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si ça commence déjà par +, c'est bon
  if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }
  
  // Si ça commence par 00, remplacer par +
  if (cleanPhone.startsWith('00')) {
    return '+' + cleanPhone.substring(2);
  }
  
  // Sinon, ajouter +229 (Bénin) par défaut
  return '+229' + cleanPhone;
}

/**
 * Formate un numéro de téléphone en email fictif pour Supabase
 * Ex: +22956904109 → phone_22956904109@kiva.app
 */
export function phoneToEmail(phone: string): string {
  const normalized = normalizePhone(phone);
  const cleanPhone = normalized.replace(/\+/g, '');
  return `phone_${cleanPhone}@kiva.app`;
}

/**
 * Extrait le numéro de téléphone d'un email fictif
 * Ex: phone_22956904109@kiva.app → +22956904109
 */
export function emailToPhone(email: string): string {
  const match = email.match(/^phone_(\d+)@kiva\.app$/);
  return match ? `+${match[1]}` : '';
}

/**
 * Valide un numéro de téléphone international
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  // Format international: + suivi de 6 à 15 chiffres
  return /^\+[0-9]{6,15}$/.test(normalized);
}