import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/components/site/Stub";
export const Route = createFileRoute("/process")({ component: makeStub("Notre démarche", "Le détail de notre démarche d'accompagnement sera publié prochainement.") });
