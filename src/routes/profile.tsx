import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { beninDepartements } from "@/data/benin-locations";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, X, User, ArrowLeft, Save, Camera, Plus, Edit2, Trash2, Users } from "lucide-react";

// Types pour les membres de famille
interface FamilyMember {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  profession: string | null;
  department: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  relationship: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 Mo
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const schema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(80),
  lastName: z.string().trim().min(1, "Nom requis").max(80),
  phone: z.string().trim().refine(isValidPhone, {
    message: "Numéro de téléphone invalide. Format: 01 56 90 41 09",
  }),
  profession: z.string().trim().min(1, "Profession requise").max(100),
  department: z.string().trim().min(1, "Département requis"),
  city: z.string().trim().min(1, "Commune requise"),
  arrondissement: z.string().trim().min(1, "Arrondissement requis"),
  neighborhood: z.string().trim().min(1, "Quartier requis").max(100),
  address: z.string().trim().min(1, "Adresse détaillée requise").max(200),
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
    profession: "",
    department: "",
    city: "",
    arrondissement: "",
    neighborhood: "",
    address: "",
  });

  const [communes, setCommunes] = useState<string[]>([]);
  const [arrondissements, setArrondissements] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    profession: "",
    department: "",
    city: "",
    arrondissement: "",
    neighborhood: "",
    address: "",
    relationship: "",
  });
  const [memberCommunes, setMemberCommunes] = useState<string[]>([]);
  const [memberArrondissements, setMemberArrondissements] = useState<string[]>([]);
  const [savingMember, setSavingMember] = useState(false);
  
  // États pour l'avatar du membre
  const [memberAvatarFile, setMemberAvatarFile] = useState<File | null>(null);
  const [memberAvatarPreview, setMemberAvatarPreview] = useState<string | null>(null);
  const [currentMemberAvatarUrl, setCurrentMemberAvatarUrl] = useState<string | null>(null);

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

          // Extraire l'arrondissement et le quartier depuis neighborhood
          const neighborhoodParts = (data.neighborhood || "").split(", ");
          const arrondissement = neighborhoodParts[0] || "";
          const quartier = neighborhoodParts.slice(1).join(", ") || "";

          setForm({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone || "",
            profession: data.profession || "",
            department: data.department || "",
            city: data.city || "",
            arrondissement: arrondissement,
            neighborhood: quartier,
            address: data.address || "",
          });
          setCurrentAvatarUrl(data.avatar_url || null);

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

  // Mettre à jour les communes quand le département change
  useEffect(() => {
    if (form.department) {
      const dept = beninDepartements.find(d => d.nom === form.department);
      if (dept) {
        setCommunes(dept.communes.map(c => c.nom));
      }
    } else {
      setCommunes([]);
    }
  }, [form.department]);

  // Mettre à jour les arrondissements quand la commune change
  useEffect(() => {
    if (form.department && form.city) {
      const dept = beninDepartements.find(d => d.nom === form.department);
      const commune = dept?.communes.find(c => c.nom === form.city);
      if (commune) {
        setArrondissements(commune.arrondissements);
      }
    } else {
      setArrondissements([]);
    }
  }, [form.city, form.department]);



const set =
  (k: keyof typeof form) =>
  (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) =>
    setForm((s) => ({
      ...s,
      [k]: e.target.value,
    }));


      // Charger les membres de famille
  useEffect(() => {
    if (!user?.id) return;

    const fetchFamilyMembers = async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement membres:", error);
      } else if (data) {
        setFamilyMembers(data);
      }
    };

    fetchFamilyMembers();
  }, [user?.id]);

  // Mettre à jour les communes pour le formulaire membre
  useEffect(() => {
    if (memberForm.department) {
      const dept = beninDepartements.find(d => d.nom === memberForm.department);
      if (dept) {
        setMemberCommunes(dept.communes.map(c => c.nom));
      }
    } else {
      setMemberCommunes([]);
    }
  }, [memberForm.department]);

  // Mettre à jour les arrondissements pour le formulaire membre
  useEffect(() => {
    if (memberForm.department && memberForm.city) {
      const dept = beninDepartements.find(d => d.nom === memberForm.department);
      const commune = dept?.communes.find(c => c.nom === memberForm.city);
      if (commune) {
        setMemberArrondissements(commune.arrondissements);
      }
    } else {
      setMemberArrondissements([]);
    }
  }, [memberForm.city, memberForm.department]);
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
            .catch(() => { }); // Ignorer les erreurs de suppression
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

    // Upload de l'avatar d'un membre vers Supabase Storage
  const uploadMemberAvatar = async (userId: string, memberId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/members/${memberId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Erreur upload avatar membre:", uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Erreur upload avatar membre:", error);
      return null;
    }
  };

  // Supprimer l'ancien avatar d'un membre
  const deleteOldMemberAvatar = async (oldAvatarUrl: string | null) => {
    if (!oldAvatarUrl) return;
    
    try {
      // Extraire le chemin du fichier depuis l'URL
      const urlParts = oldAvatarUrl.split('/avatars/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('avatars')
          .remove([filePath])
          .catch(() => {}); // Ignorer les erreurs
      }
    } catch (error) {
      console.error("Erreur suppression ancien avatar membre:", error);
    }
  };

  // Gestion du fichier avatar du membre
  const handleMemberAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
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

    setMemberAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMemberAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeMemberAvatar = () => {
    setMemberAvatarFile(null);
    setMemberAvatarPreview(currentMemberAvatarUrl);
  }; 

    const setMember = (k: keyof typeof memberForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setMemberForm((s) => ({ ...s, [k]: e.target.value }));

  const handleAddMember = () => {
    if (familyMembers.length >= 2) {
      toast.error("Vous pouvez ajouter au maximum 2 membres");
      return;
    }
    setEditingMemberId(null);
    setMemberForm({
      firstName: "",
      lastName: "",
      phone: "",
      profession: "",
      department: "",
      city: "",
      arrondissement: "",
      neighborhood: "",
      address: "",
      relationship: "",
    });
    // Réinitialiser l'avatar
    setMemberAvatarFile(null);
    setMemberAvatarPreview(null);
    setCurrentMemberAvatarUrl(null);
    setShowMemberForm(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    const neighborhoodParts = (member.neighborhood || "").split(", ");
    const arrondissement = neighborhoodParts[0] || "";
    const quartier = neighborhoodParts.slice(1).join(", ") || "";

    setEditingMemberId(member.id);
    setMemberForm({
      firstName: member.first_name,
      lastName: member.last_name,
      phone: member.phone || "",
      profession: member.profession || "",
      department: member.department || "",
      city: member.city || "",
      arrondissement: arrondissement,
      neighborhood: quartier,
      address: member.address || "",
      relationship: member.relationship,
    });
    // Charger l'avatar actuel
    setCurrentMemberAvatarUrl(member.avatar_url || null);
    setMemberAvatarPreview(member.avatar_url || null);
    setMemberAvatarFile(null);
    setShowMemberForm(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;

    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("Erreur suppression:", error);
      toast.error("Impossible de supprimer le membre");
      return;
    }

    setFamilyMembers(familyMembers.filter(m => m.id !== memberId));
    toast.success("Membre supprimé avec succès");
  };

  const onSubmitMember = async (e: FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    setSavingMember(true);

    // Gérer l'upload de l'avatar
    let avatarUrl = currentMemberAvatarUrl;
    
    if (memberAvatarFile) {
      // Si un nouveau fichier est sélectionné, l'uploader
      const tempId = editingMemberId || `temp_${Date.now()}`;
      avatarUrl = await uploadMemberAvatar(user.id, tempId, memberAvatarFile);
      
      if (!avatarUrl) {
        toast.warning("Le membre a été sauvegardé mais la photo n'a pas pu être envoyée");
      } else if (editingMemberId && currentMemberAvatarUrl && currentMemberAvatarUrl !== avatarUrl) {
        // Supprimer l'ancien avatar si on en a un nouveau
        await deleteOldMemberAvatar(currentMemberAvatarUrl);
      }
    }

    const memberData = {
      user_id: user.id,
      first_name: memberForm.firstName,
      last_name: memberForm.lastName,
      phone: normalizePhone(memberForm.phone),
      profession: memberForm.profession,
      department: memberForm.department,
      city: memberForm.city,
      neighborhood: `${memberForm.arrondissement}, ${memberForm.neighborhood}`,
      address: memberForm.address,
      relationship: memberForm.relationship,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingMemberId) {
      // Mise à jour
      const result = await supabase
        .from("family_members")
        .update(memberData)
        .eq("id", editingMemberId);
      error = result.error;
    } else {
      // Création
      const result = await supabase
        .from("family_members")
        .insert([memberData]);
      error = result.error;
    }

    setSavingMember(false);

    if (error) {
      console.error("Erreur sauvegarde membre:", error);
      toast.error("Impossible de sauvegarder le membre");
      return;
    }

    toast.success(editingMemberId ? "Membre mis à jour" : "Membre ajouté avec succès");
    setShowMemberForm(false);

    // Recharger les membres
    const { data } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setFamilyMembers(data);
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
        profession: parsed.data.profession,
        department: parsed.data.department,
        city: parsed.data.city,
        neighborhood: `${parsed.data.arrondissement}, ${parsed.data.neighborhood}`,
        address: parsed.data.address,
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

            {/* Informations personnelles */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  required
                  value={form.firstName}
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
                onChange={set("phone")}
                placeholder="01 56 90 41 09"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                required
                value={form.profession}
                onChange={set("profession")}
                placeholder="Ex: Commerçant, Enseignant, Étudiant..."
              />
            </div>

            {/* Localisation */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Localisation</Label>
              
              <div className="space-y-1.5">
                <Label htmlFor="department">Département</Label>
                <select
                  id="department"
                  required
                  value={form.department}
                  onChange={set("department")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Sélectionnez un département</option>
                  {beninDepartements.map(dept => (
                    <option key={dept.nom} value={dept.nom}>{dept.nom}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city">Commune</Label>
                <select
                  id="city"
                  required
                  value={form.city}
                  onChange={set("city")}
                  disabled={!form.department}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sélectionnez une commune</option>
                  {communes.map(commune => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="arrondissement">Arrondissement / Ville</Label>
                <select
                  id="arrondissement"
                  required
                  value={form.arrondissement}
                  onChange={set("arrondissement")}
                  disabled={!form.city}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sélectionnez un arrondissement</option>
                  {arrondissements.map(arr => (
                    <option key={arr} value={arr}>{arr}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="neighborhood">Quartier</Label>
                <Input
                  id="neighborhood"
                  required
                  value={form.neighborhood}
                  onChange={set("neighborhood")}
                  placeholder="Ex: Zongo, Haie Vive, Cadjehoun..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Adresse détaillée</Label>
                <Input
                  id="address"
                  required
                  value={form.address}
                  onChange={set("address")}
                  placeholder="Ex: Rue 12.45, près du marché central"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
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
            </div>
          </form>

                    {/* Section Membres de famille */}
          <div className="mt-8 pt-8 border-t border-border/60">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="font-display text-xl font-semibold md:text-2xl">Quelques membres de votre équipe</h2>
              </div>
              {familyMembers.length < 2 && (
                <Button onClick={handleAddMember} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un membre
                </Button>
              )}
            </div>

            {familyMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun membre ajouté</p>
                <p className="text-sm mt-1">Vous pouvez ajouter jusqu'à 2 membres</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-16 w-16 rounded-full border-2 border-primary/20">
                      <AvatarImage
                        src={member.avatar_url || undefined}
                        alt={`${member.first_name} ${member.last_name}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-hero text-lg text-primary-foreground">
                        {member.first_name[0]}{member.last_name[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {member.first_name} {member.last_name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {member.relationship}
                        </span>
                      </div>
                      
                      <div className="grid gap-1 text-sm text-muted-foreground">
                        {member.phone && (
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Téléphone:</span> {member.phone}
                          </p>
                        )}
                        {member.profession && (
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Profession:</span> {member.profession}
                          </p>
                        )}
                        {member.department && member.city && (
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Localisation:</span> {member.city}, {member.department}
                          </p>
                        )}
                        {member.address && (
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Adresse:</span> {member.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMember(member)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Formulaire Membre */}
          {showMemberForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">
                    {editingMemberId ? "Modifier le membre" : "Ajouter un membre"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMemberForm(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={onSubmitMember} className="space-y-4">
                  {/* Relation */}
                  <div className="space-y-1.5">
                    <Label htmlFor="relationship">Relation *</Label>
                    <select
                      id="relationship"
                      required
                      value={memberForm.relationship}
                      onChange={setMember("relationship")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Sélectionnez une relation</option>
                      <option value="Sécrétaire">Sécrétaire</option>
                      <option value="Trésorier">Trésorier</option>
                      {/* <option value="Parent">Parent</option>
                      <option value="Frère/Sœur">Frère/Sœur</option>
                      <option value="Autre">Autre</option> */}
                    </select>
                  </div>

                                  {/* Avatar du membre */}
                  <div className="space-y-1.5">
                    <Label>Photo de profil (optionnel)</Label>
                    <div className="flex items-center gap-4">
                      {memberAvatarPreview ? (
                        <div className="relative">
                          <img 
                            src={memberAvatarPreview} 
                            alt="Aperçu" 
                            className="h-20 w-20 rounded-full object-cover border-2 border-primary"
                          />
                          <button
                            type="button"
                            onClick={removeMemberAvatar}
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
                        <Input
                          id="member-avatar"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleMemberAvatarChange}
                          className="hidden"
                        />
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('member-avatar')?.click()}
                          className="w-full"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Choisir une photo
                        </Button>
                        
                        <p className="text-xs text-muted-foreground text-center">
                          JPG, PNG ou WebP • Max 1 Mo
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nom et Prénom */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="member-firstName">Prénom *</Label>
                      <Input
                        id="member-firstName"
                        required
                        value={memberForm.firstName}
                        onChange={setMember("firstName")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="member-lastName">Nom *</Label>
                      <Input
                        id="member-lastName"
                        required
                        value={memberForm.lastName}
                        onChange={setMember("lastName")}
                      />
                    </div>
                  </div>
                  {/* Téléphone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="member-phone">Téléphone</Label>
                    <Input
                      id="member-phone"
                      type="tel"
                      value={memberForm.phone}
                      onChange={setMember("phone")}
                      placeholder="01 56 90 41 09"
                    />
                  </div>

                  {/* Profession */}
                  <div className="space-y-1.5">
                    <Label htmlFor="member-profession">Profession</Label>
                    <Input
                      id="member-profession"
                      value={memberForm.profession}
                      onChange={setMember("profession")}
                      placeholder="Ex: Commerçant, Enseignant..."
                    />
                  </div>

                  {/* Localisation */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Localisation</Label>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="member-department">Département</Label>
                      <select
                        id="member-department"
                        value={memberForm.department}
                        onChange={setMember("department")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Sélectionnez un département</option>
                        {beninDepartements.map(dept => (
                          <option key={dept.nom} value={dept.nom}>{dept.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="member-city">Commune</Label>
                      <select
                        id="member-city"
                        value={memberForm.city}
                        onChange={setMember("city")}
                        disabled={!memberForm.department}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Sélectionnez une commune</option>
                        {memberCommunes.map(commune => (
                          <option key={commune} value={commune}>{commune}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="member-arrondissement">Arrondissement</Label>
                      <select
                        id="member-arrondissement"
                        value={memberForm.arrondissement}
                        onChange={setMember("arrondissement")}
                        disabled={!memberForm.city}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Sélectionnez un arrondissement</option>
                        {memberArrondissements.map(arr => (
                          <option key={arr} value={arr}>{arr}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="member-neighborhood">Quartier</Label>
                      <Input
                        id="member-neighborhood"
                        value={memberForm.neighborhood}
                        onChange={setMember("neighborhood")}
                        placeholder="Ex: Zongo, Haie Vive..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="member-address">Adresse détaillée</Label>
                      <Input
                        id="member-address"
                        value={memberForm.address}
                        onChange={setMember("address")}
                        placeholder="Ex: Rue 12.45, près du marché"
                      />
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={savingMember}>
                      {savingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      {editingMemberId ? "Mettre à jour" : "Ajouter"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMemberForm(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}