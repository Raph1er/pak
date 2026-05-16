import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import heroImg from "@/assets/hero-farm.jpg";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 lg:p-12">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">KIVA</span>
        </Link>

        <div className="mx-auto w-full max-w-sm py-12">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>

        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} KIVA</p>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={heroImg}
          alt="Champ agricole au coucher du soleil"
          className="h-full w-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 rounded-2xl border border-border/40 bg-background/80 p-6 backdrop-blur">
          <p className="font-display text-2xl">« Du jour de la demande à l'installation, tout a été fluide. »</p>
          <p className="mt-3 text-sm text-muted-foreground">— Mamadou Sow, Aviculteur</p>
        </div>
      </div>
    </div>
  );
}
