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
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Upload, X, User, ArrowLeft, Save, Camera, Plus, Edit2, Trash2, Users, ChevronRight } from "lucide-react";

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

      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${userId}/${oldPath}`])
            .catch(() => { });
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
      const urlParts = oldAvatarUrl.split('/avatars/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('avatars')
          .remove([filePath])
          .catch(() => {});
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

    let avatarUrl = currentMemberAvatarUrl;
    
    if (memberAvatarFile) {
      const tempId = editingMemberId || `temp_${Date.now()}`;
      avatarUrl = await uploadMemberAvatar(user.id, tempId, memberAvatarFile);
      
      if (!avatarUrl) {
        toast.warning("Le membre a été sauvegardé mais la photo n'a pas pu être envoyée");
      } else if (editingMemberId && currentMemberAvatarUrl && currentMemberAvatarUrl !== avatarUrl) {
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
      const result = await supabase
        .from("family_members")
        .update(memberData)
        .eq("id", editingMemberId);
      error = result.error;
    } else {
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
      <main className="mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-8 lg:py-12">
        {/* Back button */}
        <Button asChild variant="ghost" size="sm" className="mb-4 sm:mb-6 -ml-2 sm:-ml-3">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Retour au tableau de bord</span>
            <span className="sm:hidden ml-1">Retour</span>
          </Link>
        </Button>

        {/* Main card */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-4 sm:p-6 lg:p-8 shadow-soft">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold">Mon profil</h1>
            </div>
            {isAdmin && (
              <Badge variant="secondary" className="text-xs sm:text-sm">
                Administrateur
              </Badge>
            )}
          </div>

          {/* Formulaire */}
          <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-full border-4 border-primary shadow-xl">
                  <AvatarImage
                    src={avatarPreview || undefined}
                    alt={form.firstName || "Profil"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-hero text-2xl sm:text-3xl lg:text-4xl text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                {/* Avatar upload button */}
                <div className="absolute -bottom-1 -right-1">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="rounded-full bg-primary p-2 sm:p-2.5 shadow-lg hover:bg-primary/90 transition-colors">
                      <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Avatar preview actions */}
              {avatarPreview && avatarPreview !== currentAvatarUrl && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Nouvelle photo
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeAvatar}
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Annuler
                  </Button>
                </div>
              )}
              
              <p className="mt-2 text-xs text-muted-foreground text-center">
                JPG, PNG, WebP • Max 1 Mo
              </p>
            </div>

            {/* Informations personnelles */}
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm">Prénom *</Label>
                <Input
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={set("firstName")}
                  placeholder="Votre prénom"
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm">Nom *</Label>
                <Input
                  id="lastName"
                  required
                  value={form.lastName}
                  onChange={set("lastName")}
                  placeholder="Votre nom"
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">Numéro de téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={set("phone")}
                placeholder="01 56 90 41 09"
                className="text-sm sm:text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profession" className="text-sm">Profession *</Label>
              <Input
                id="profession"
                required
                value={form.profession}
                onChange={set("profession")}
                placeholder="Ex: Commerçant, Enseignant, Étudiant..."
                className="text-sm sm:text-base"
              />
            </div>

            {/* Localisation */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Localisation</Label>
              
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-sm">Département *</Label>
                <select
                  id="department"
                  required
                  value={form.department}
                  onChange={set("department")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Sélectionnez un département</option>
                  {beninDepartements.map(dept => (
                    <option key={dept.nom} value={dept.nom}>{dept.nom}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-sm">Commune *</Label>
                <select
                  id="city"
                  required
                  value={form.city}
                  onChange={set("city")}
                  disabled={!form.department}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sélectionnez une commune</option>
                  {communes.map(commune => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="arrondissement" className="text-sm">Arrondissement / Ville *</Label>
                <select
                  id="arrondissement"
                  required
                  value={form.arrondissement}
                  onChange={set("arrondissement")}
                  disabled={!form.city}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sélectionnez un arrondissement</option>
                  {arrondissements.map(arr => (
                    <option key={arr} value={arr}>{arr}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="neighborhood" className="text-sm">Quartier *</Label>
                <Input
                  id="neighborhood"
                  required
                  value={form.neighborhood}
                  onChange={set("neighborhood")}
                  placeholder="Ex: Zongo, Haie Vive, Cadjehoun..."
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-sm">Adresse détaillée *</Label>
                <Input
                  id="address"
                  required
                  value={form.address}
                  onChange={set("address")}
                  placeholder="Ex: Rue 12.45, près du marché central"
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate({ to: "/dashboard" })}
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1" size="lg" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </form>

          {/* Section Membres de famille */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border/60">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="font-display text-lg sm:text-xl lg:text-2xl font-semibold">
                  Membres de l'équipe
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {familyMembers.length}/2
                </Badge>
              </div>
              {familyMembers.length < 2 && (
                <Button onClick={handleAddMember} size="sm" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              )}
            </div>

            {familyMembers.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm sm:text-base">Aucun membre ajouté</p>
                <p className="text-xs sm:text-sm mt-1">Vous pouvez ajouter jusqu'à 2 membres</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-primary/20 shrink-0">
                        <AvatarImage
                          src={member.avatar_url || undefined}
                          alt={`${member.first_name} ${member.last_name}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-hero text-base sm:text-lg text-primary-foreground">
                          {member.first_name[0]}{member.last_name[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {member.first_name} {member.last_name}
                          </h3>
                          <Badge className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 bg-primary/10 text-primary">
                            {member.relationship}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                          {member.phone && (
                            <span className="truncate">{member.phone}</span>
                          )}
                          {member.profession && (
                            <span className="truncate">{member.profession}</span>
                          )}
                          {member.city && member.department && (
                            <span className="hidden sm:inline truncate">
                              {member.city}, {member.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMember(member)}
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                      >
                        <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer {member.first_name} {member.last_name} ?
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteMember(member.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Sheet pour le formulaire membre - plus responsive que la modal */}
      <Sheet open={showMemberForm} onOpenChange={setShowMemberForm}>
        <SheetContent side="bottom" className="h-[95vh] sm:h-auto sm:max-w-lg sm:mx-auto sm:rounded-t-2xl p-4 sm:p-6 overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle className="text-lg sm:text-xl">
              {editingMemberId ? "Modifier le membre" : "Ajouter un membre"}
            </SheetTitle>
            <SheetDescription>
              {editingMemberId ? "Modifiez les informations du membre" : "Ajoutez un nouveau membre à votre équipe"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={onSubmitMember} className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
            {/* Relation */}
            <div className="space-y-1.5">
              <Label htmlFor="relationship" className="text-sm">Relation *</Label>
              <select
                id="relationship"
                required
                value={memberForm.relationship}
                onChange={setMember("relationship")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Sélectionnez une relation</option>
                <option value="Sécrétaire">Sécrétaire</option>
                <option value="Trésorier">Trésorier</option>
              </select>
            </div>

            {/* Avatar du membre */}
            <div className="space-y-1.5">
              <Label className="text-sm">Photo de profil (optionnel)</Label>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  {memberAvatarPreview ? (
                    <div className="relative">
                      <img 
                        src={memberAvatarPreview} 
                        alt="Aperçu" 
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-primary"
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
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full space-y-1.5">
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
                    className="w-full text-sm"
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
                <Label htmlFor="member-firstName" className="text-sm">Prénom *</Label>
                <Input
                  id="member-firstName"
                  required
                  value={memberForm.firstName}
                  onChange={setMember("firstName")}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member-lastName" className="text-sm">Nom *</Label>
                <Input
                  id="member-lastName"
                  required
                  value={memberForm.lastName}
                  onChange={setMember("lastName")}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5">
              <Label htmlFor="member-phone" className="text-sm">Téléphone</Label>
              <Input
                id="member-phone"
                type="tel"
                value={memberForm.phone}
                onChange={setMember("phone")}
                placeholder="01 56 90 41 09"
                className="text-sm sm:text-base"
              />
            </div>

            {/* Profession */}
            <div className="space-y-1.5">
              <Label htmlFor="member-profession" className="text-sm">Profession</Label>
              <Input
                id="member-profession"
                value={memberForm.profession}
                onChange={setMember("profession")}
                placeholder="Ex: Commerçant, Enseignant..."
                className="text-sm sm:text-base"
              />
            </div>

            {/* Localisation membre */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Localisation</Label>
              
              <div className="space-y-1.5">
                <Label htmlFor="member-department" className="text-sm">Département</Label>
                <select
                  id="member-department"
                  value={memberForm.department}
                  onChange={setMember("department")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sélectionnez un département</option>
                  {beninDepartements.map(dept => (
                    <option key={dept.nom} value={dept.nom}>{dept.nom}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member-city" className="text-sm">Commune</Label>
                <select
                  id="member-city"
                  value={memberForm.city}
                  onChange={setMember("city")}
                  disabled={!memberForm.department}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sélectionnez une commune</option>
                  {memberCommunes.map(commune => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member-arrondissement" className="text-sm">Arrondissement</Label>
                <select
                  id="member-arrondissement"
                  value={memberForm.arrondissement}
                  onChange={setMember("arrondissement")}
                  disabled={!memberForm.city}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sélectionnez un arrondissement</option>
                  {memberArrondissements.map(arr => (
                    <option key={arr} value={arr}>{arr}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member-neighborhood" className="text-sm">Quartier</Label>
                <Input
                  id="member-neighborhood"
                  value={memberForm.neighborhood}
                  onChange={setMember("neighborhood")}
                  placeholder="Ex: Zongo, Haie Vive..."
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member-address" className="text-sm">Adresse détaillée</Label>
                <Input
                  id="member-address"
                  value={memberForm.address}
                  onChange={setMember("address")}
                  placeholder="Ex: Rue 12.45, près du marché"
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowMemberForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={savingMember}>
                {savingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {editingMemberId ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}