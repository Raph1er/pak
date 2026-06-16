import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { phoneToEmail, isValidPhone, normalizePhone } from "@/lib/phone";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, User } from "lucide-react";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 Mo
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const schema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(80),
  lastName: z.string().trim().min(1, "Nom requis").max(80),
  phone: z.string().trim().refine(isValidPhone, {
    message: "Numéro de téléphone invalide. Format: 01 56 90 41 09",
  }),
  password: z.string().min(6, "Au moins 6 caractères").max(72),
});

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Créer un compte — KIVA" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", password: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  // Gestion du fichier avatar
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation taille
    if (file.size > MAX_FILE_SIZE) {
      toast.error("L'image ne doit pas dépasser 1 Mo");
      e.target.value = "";
      return;
    }

    // Validation type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG ou WebP");
      e.target.value = "";
      return;
    }

    setAvatarFile(file);
    
    // Créer un aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  // Upload de l'avatar vers Supabase Storage
  const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
    try {
      // Nom du fichier : userId/timestamp.extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Erreur upload avatar:", uploadError);
        return null;
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Erreur upload avatar:", error);
      return null;
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    
    setLoading(true);

    // Nettoyer une éventuelle session corrompue
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.signOut();
    }
    
    // Formater le téléphone en email fictif
    const fakeEmail = phoneToEmail(parsed.data.phone);

    // Créer l'utilisateur dans Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: fakeEmail,
      password: parsed.data.password,
      options: {
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          phone: parsed.data.phone,
        },
      },
    });
    
    if (error) {
      setLoading(false);
      toast.error(
        error.message.includes("already")
          ? "Ce numéro de téléphone est déjà utilisé"
          : error.message
      );
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      toast.error("Impossible de créer le compte");
      return;
    }

    // Upload de l'avatar si fourni
    let avatarUrl = null;
    if (avatarFile) {
      avatarUrl = await uploadAvatar(userId, avatarFile);
      if (!avatarUrl) {
        toast.warning("Compte créé mais la photo n'a pas pu être envoyée");
      }
    }

    // Créer/mettre à jour le profil
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: normalizePhone(parsed.data.phone),
        avatar_url: avatarUrl,
        email_verified: true,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Erreur mise à jour profil:", profileError);
    }

    setLoading(false);
    toast.success("Compte créé avec succès !");
    navigate({ to: "/login" });
  };

  return (
    <AuthShell
      title="Créer un compte."
      subtitle="Quelques secondes pour rejoindre KIVA."
      footer={
        <span>
          Déjà inscrit ?{" "}
          <Link to="/login" className="font-medium text-foreground hover:text-primary">Se connecter</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">


        {/* Autres champs */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" required value={form.firstName} onChange={set("firstName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" required value={form.lastName} onChange={set("lastName")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Numéro de téléphone</Label>
          <Input 
            id="phone" 
            type="tel" 
            required 
            value={form.phone} 
            onChange={set("phone")} 
            placeholder="01 56 90 41 09" 
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={form.password} 
            onChange={set("password")} 
          />
        </div>

                {/* Avatar upload */}
        <div className="space-y-1.5">
          <Label>Photo de profil (optionnel)</Label>
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <div className="relative">
                <img 
                  src={avatarPreview} 
                  alt="Aperçu" 
                  className="h-20 w-20 rounded-full object-cover border-2 border-primary"
                />
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              {/* Input caché pour caméra */}
              <Input
                id="avatar-camera"
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {/* Input caché pour galerie */}
              <Input
                id="avatar-gallery"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              
              {/* Bouton Prendre une photo */}
              <Button
                type="button"
                variant="default"
                onClick={() => document.getElementById('avatar-camera')?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Prendre une photo
              </Button>
              
              {/* Bouton Choisir une photo */}
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('avatar-gallery')?.click()}
                className="w-full"
              >
                Choisir depuis la galerie
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                JPG, PNG ou WebP • Max 1 Mo
              </p>
            </div>
          </div>
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Créer mon compte
        </Button>
        <p className="text-xs text-muted-foreground">
          En créant un compte, vous acceptez nos conditions d'utilisation.
        </p>
      </form>
    </AuthShell>
  );
}