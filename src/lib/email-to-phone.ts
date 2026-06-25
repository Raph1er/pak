/**
 * Convertit un email fictif de type "phone_2290196885136@kiva.app" en numéro de téléphone
 * Si l'email est un vrai email, on le retourne tel quel
 */
export function emailToPhone(email: string | null | undefined): string {
    if (!email) return "";
    
    // Vérifier si c'est un email fictif généré à partir d'un numéro
    if (email.startsWith("phone_") && email.endsWith("@kiva.app")) {
        // Extraire le numéro : phone_2290196885136@kiva.app -> 2290196885136
        const rawNumber = email
            .replace("phone_", "")
            .replace("@kiva.app", "");
        
        // Formater le numéro pour l'affichage
        // Ex: 2290196885136 -> +229 01 96 88 51 36
        if (rawNumber.startsWith("229") && rawNumber.length === 13) {
            const withoutCountry = rawNumber.slice(3); // 0196885136
            const formatted = withoutCountry.match(/.{1,2}/g)?.join(" ") || withoutCountry;
            return `+229 ${formatted}`;
        }
        
        // Fallback : retourner le numéro brut avec +
        return `+${rawNumber}`;
    }
    
    // C'est un vrai email, on le retourne tel quel
    return email;
}