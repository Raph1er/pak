import { Link, useNavigate } from "@tanstack/react-router";
import { Sprout, Menu, LogOut, LayoutDashboard, ShieldCheck, Mail, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const [open, setOpen] = useState(false);
  const [unreadContactCount, setUnreadContactCount] = useState<number>(0);
  const [unreadRequestsCount, setUnreadRequestsCount] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { isAuthenticated, user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const closeMenu = () => setOpen(false);

  const links = isAdmin
    ? [
      { to: "/", label: "Accueil" },
      { to: "/packs", label: "Packs agricoles" },
      { to: "/kits", label: "Kits artisanaux" },
      { to: "/process", label: "Notre démarche" },
    ] as const
    : [
      { to: "/", label: "Accueil" },
      { to: "/packs", label: "Packs agricoles" },
      { to: "/kits", label: "Kits artisanaux" },
      { to: "/process", label: "Notre démarche" },
      { to: "/contact", label: "Contact" },
    ] as const;

  const initials =
    ((user?.user_metadata?.first_name as string)?.[0] ?? user?.email?.[0] ?? "K").toUpperCase();

  // Charger l'avatar du profil
  useEffect(() => {
    let active = true;
    
    if (!isAuthenticated || !user?.id) {
      setAvatarUrl(null);
      return;
    }

    const fetchAvatar = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (!active) return;
      
      if (error) {
        console.error("Erreur récupération avatar:", error);
        setAvatarUrl(null);
      } else {
        setAvatarUrl(data?.avatar_url || null);
      }
    };

    fetchAvatar();

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id]);

  // Compter les messages non lus
  useEffect(() => {
    let active = true;
    if (!isAdmin) return;

    const fetchCount = async () => {
      const res = await supabase
        .from("contact_messages")
        .select("id", { head: true, count: "exact" })
        .eq("is_seen", false);
      if (!active) return;
      setUnreadContactCount(res.count ?? 0);
    };

    fetchCount();
    window.addEventListener("focus", fetchCount);

    return () => {
      active = false;
      window.removeEventListener("focus", fetchCount);
    };
  }, [isAdmin]);

  // Compter les demandes non analysées (status = 'pending')
  useEffect(() => {
    let active = true;
    if (!isAdmin) return;

    const fetchCount = async () => {
      const res = await supabase
        .from("requests")
        .select("id", { head: true, count: "exact" })
        .eq("status", "pending");
      if (!active) return;
      setUnreadRequestsCount(res.count ?? 0);
    };

    fetchCount();
    window.addEventListener("focus", fetchCount);

    return () => {
      active = false;
      window.removeEventListener("focus", fetchCount);
    };
  }, [isAdmin]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  // Calcul du total des notifications admin
  const totalAdminNotifications = unreadContactCount + unreadRequestsCount;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo - toujours visible */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 shrink-0">
          <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <Sprout className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span className="font-display text-lg sm:text-xl font-semibold tracking-tight">KIVA</span>
        </Link>

        {/* Navigation desktop - cachée sur mobile */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Section desktop - cachée sur mobile */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated && isAdmin && (
            <>
              {/* Bouton Admin avec badge combiné */}
              <Link
                to="/admin"
                className="relative inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/10"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
                {totalAdminNotifications > 0 && (
                  <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-[0.65rem] font-semibold text-destructive-foreground">
                    {totalAdminNotifications}
                  </span>
                )}
              </Link>

              {/* Bouton Messages non lus */}
              <Link
                to="/admin/messages"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                {unreadContactCount > 0 && (
                  <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-2 text-[0.65rem] font-semibold text-destructive-foreground">
                    {unreadContactCount}
                  </span>
                )}
              </Link>

              {/* Bouton Demandes à analyser */}
              <Link
                to="/admin/requests_pending"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <Package className="h-4 w-4" />
                {unreadRequestsCount > 0 && (
                  <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-2 text-[0.65rem] font-semibold text-destructive-foreground">
                    {unreadRequestsCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 pr-3 text-sm shadow-soft hover:bg-muted">
                  <Avatar className="h-7 w-7">
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} alt={user?.user_metadata?.first_name || "Avatar"} />
                    )}
                    <AvatarFallback className="bg-gradient-hero text-xs text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[160px] truncate">{user?.user_metadata?.first_name || user?.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Administration
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/messages">
                        <Mail className="mr-2 h-4 w-4" />
                        Messages
                        {unreadContactCount > 0 && (
                          <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-2 text-[0.65rem] font-semibold text-destructive-foreground">
                            {unreadContactCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/requests_pending">
                        <Package className="mr-2 h-4 w-4" />
                        Demandes à analyser
                        {unreadRequestsCount > 0 && (
                          <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-2 text-[0.65rem] font-semibold text-destructive-foreground">
                            {unreadRequestsCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/signup">Créer un compte</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile : Avatar + Menu hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Avatar sur mobile - toujours visible si connecté */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-full border border-border bg-card px-1.5 py-1 pr-2.5 text-sm shadow-soft hover:bg-muted transition-colors">
                  <Avatar className="h-8 w-8">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={user?.user_metadata?.first_name || "Avatar"} />
                    ) : (
                      <AvatarFallback className="bg-gradient-hero text-xs font-medium text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="max-w-[60px] truncate text-xs font-medium">
                    {user?.user_metadata?.first_name || user?.email?.split('@')[0] || "Compte"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Administration
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/messages">
                        <Mail className="mr-2 h-4 w-4" />
                        Messages
                        {unreadContactCount > 0 && (
                          <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-2 text-[0.65rem] font-semibold text-destructive-foreground">
                            {unreadContactCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/requests_pending">
                        <Package className="mr-2 h-4 w-4" />
                        Demandes à analyser
                        {unreadRequestsCount > 0 && (
                          <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-2 text-[0.65rem] font-semibold text-destructive-foreground">
                            {unreadRequestsCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Bouton Connexion sur mobile si non connecté */
            <Button asChild variant="default" size="sm" className="h-8 px-3 text-xs">
              <Link to="/login">Connexion</Link>
            </Button>
          )}

          {/* Bouton menu hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu className="h-5 w-5" />
            {/* Badge de notifications sur le bouton menu */}
            {isAuthenticated && isAdmin && totalAdminNotifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[0.55rem] font-semibold text-destructive-foreground">
                {totalAdminNotifications > 9 ? "9+" : totalAdminNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bannière notifications non lues (mobile) */}
      {isAuthenticated && isAdmin && totalAdminNotifications > 0 && !open && (
        <div className="border-t border-border/60 bg-destructive/10 px-4 py-2 text-sm text-destructive md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {unreadContactCount > 0 && (
              <Link to="/admin/messages" className="flex items-center justify-between gap-3 py-1">
                <span className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {unreadContactCount} message{unreadContactCount > 1 ? "s" : ""} non lu{unreadContactCount > 1 ? "s" : ""}
                </span>
                <span className="font-medium">Voir →</span>
              </Link>
            )}
            {unreadRequestsCount > 0 && (
              <Link to="/admin/requests_pending" className="flex items-center justify-between gap-3 py-1">
                <span className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {unreadRequestsCount} demande{unreadRequestsCount > 1 ? "s" : ""} à analyser
                </span>
                <span className="font-medium">Voir →</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Menu mobile déroulant */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-x-0 top-16 z-30 h-[calc(100dvh-4rem)] w-full bg-black/20 md:hidden"
            onClick={closeMenu}
          />
          <div id="mobile-menu" className="fixed inset-x-0 top-16 z-40 border-t border-border/60 bg-background md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
              {links.map((l) => (
                <Link key={l.to} to={l.to} onClick={closeMenu} className="rounded-md px-3 py-2.5 text-sm hover:bg-muted transition-colors">
                  {l.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" onClick={closeMenu} className="rounded-md px-3 py-2.5 text-sm hover:bg-muted transition-colors">
                    <LayoutDashboard className="mr-2 inline h-4 w-4" />
                    Tableau de bord
                  </Link>
                  {isAdmin && (
                    <>
                      <Link to="/admin" onClick={closeMenu} className="rounded-md px-3 py-2.5 text-sm hover:bg-muted transition-colors font-medium text-primary">
                        <ShieldCheck className="mr-2 inline h-4 w-4" />
                        Administration
                        {totalAdminNotifications > 0 && (
                          <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-2 text-[0.65rem] font-semibold text-destructive-foreground">
                            {totalAdminNotifications}
                          </span>
                        )}
                      </Link>
                      <Link to="/admin/messages" onClick={closeMenu} className="rounded-md px-3 py-2.5 text-sm hover:bg-muted transition-colors">
                        <Mail className="mr-2 inline h-4 w-4" />
                        Messages
                        {unreadContactCount > 0 && (
                          <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-2 text-[0.65rem] font-semibold text-destructive-foreground">
                            {unreadContactCount}
                          </span>
                        )}
                      </Link>
                      <Link to="/admin/requests_pending" onClick={closeMenu} className="rounded-md px-3 py-2.5 text-sm hover:bg-muted transition-colors">
                        <Package className="mr-2 inline h-4 w-4" />
                        Demandes à analyser
                        {unreadRequestsCount > 0 && (
                          <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-2 text-[0.65rem] font-semibold text-destructive-foreground">
                            {unreadRequestsCount}
                          </span>
                        )}
                      </Link>
                    </>
                  )}
                  <Link to="/profile" onClick={closeMenu} className="rounded-md px-3 py-2.5 text-sm hover:bg-muted transition-colors">
                    <User className="mr-2 inline h-4 w-4" />
                    Mon profil
                  </Link>
                  <Button variant="outline" className="mt-2 w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </Button>
                </>
              )}
              {!isAuthenticated && (
                <div className="mt-2 flex flex-col gap-2">
                  <Button className="w-full" asChild>
                    <Link to="/login" onClick={closeMenu}>Se connecter</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/signup" onClick={closeMenu}>Créer un compte</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}