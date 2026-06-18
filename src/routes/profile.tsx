// src/routes/profile.tsx
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, X, User, ArrowLeft, Save, Camera } from "lucide-react";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 Mo
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const schema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(80),
  lastName: z.string().trim().min(1, "Nom requis").max(80),
  phone: z.string().trim().refine(isValidPhone, {
    message: "Numéro de téléphone invalide. Format: 01 56 90 41 09",
  }),
});

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Mon profil — KIVA" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Rediriger si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  // Charger les données du profil
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Erreur chargement profil:", error);
          toast.error("Impossible de charger votre profil");
          return;
        }

        if (data) {
          setProfileId(data.id);
          setForm({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone || "",
          });
          setCurrentAvatarUrl(data.avatar_url || null);
          
          // Si une photo existe déjà, l'afficher en aperçu
          if (data.avatar_url) {
            setAvatarPreview(data.avatar_url);
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  // Gestion du fichier avatar
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("L'image ne doit pas dépasser 1 Mo");
      e.target.value = "";
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG ou WebP");
      e.target.value = "";
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(currentAvatarUrl);
  };

  // Upload de l'avatar vers Supabase Storage
  const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Supprimer l'ancien avatar s'il existe
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${userId}/${oldPath}`])
            .catch(() => {}); // Ignorer les erreurs de suppression
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Erreur upload avatar:", uploadError);
        return null;
      }

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

    if (!profileId) {
      toast.error("Profil non trouvé");
      return;
    }

    setSaving(true);

    let avatarUrl = currentAvatarUrl;
    if (avatarFile) {
      avatarUrl = await uploadAvatar(user!.id, avatarFile);
      if (!avatarUrl) {
        toast.warning("La photo n'a pas pu être mise à jour");
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: normalizePhone(parsed.data.phone),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    setSaving(false);

    if (error) {
      console.error("Erreur mise à jour:", error);
      toast.error("Impossible de mettre à jour le profil");
      return;
    }

    toast.success("Profil mis à jour avec succès !");
    setCurrentAvatarUrl(avatarUrl);
    setAvatarFile(null);
    
    // Rafraîchir la page pour mettre à jour l'affichage
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const initials = ((form.firstName || user?.user_metadata?.first_name || "")[0] ?? 
    (form.lastName || user?.user_metadata?.last_name || "")[0] ?? 
    user?.email?.[0] ?? "U").toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>

        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold md:text-3xl">Mon profil</h1>
            {isAdmin && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Administrateur
              </span>
            )}
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Avatar */}
        <div className="flex flex-col items-center">
  <div className="relative">
    <Avatar className="h-40 w-40 md:h-52 md:w-52 rounded-full border-4 border-primary shadow-2xl">
      <AvatarImage
        src={avatarPreview || undefined}
        alt={form.firstName || "Profil"}
        className="object-cover"
      />
      <AvatarFallback className="bg-gradient-hero text-4xl text-primary-foreground md:text-5xl">
        {initials}
      </AvatarFallback>
    </Avatar>

    {/* Badge décoratif */}
    <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-green-500 border-2 border-white"></div>
  </div>

  <div className="mt-4 text-center">
    <h3 className="text-lg font-semibold">
      {form.firstName} {form.lastName}
    </h3>
    <p className="text-sm text-muted-foreground">
      Photo de profil
    </p>
  </div>
</div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  required
                  value={form.firstName}
                  readOnly
                  onChange={set("firstName")}
                  placeholder="Votre prénom"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  required
                  value={form.lastName}
                  readOnly
                  onChange={set("lastName")}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={form.phone}
                readOnly
                onChange={set("phone")}
                placeholder="01 56 90 41 09"
              />
            </div>

         

            {/* <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button type="submit" className="flex-1" size="lg" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate({ to: "/dashboard" })}
              >
                Annuler
              </Button>
            </div> */}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}