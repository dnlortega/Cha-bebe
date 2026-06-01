/** Telas do painel incluídas ao compartilhar um evento (editor) */
export const EVENT_COLLABORATOR_SCREEN_TITLES = [
  "Dashboard",
  "Convites",
  "Histórico",
  "Cadastrar",
  "Lista Final",
  "Presentes",
] as const;

export const EVENT_COLLABORATOR_PATHS = [
  "/admin",
  "/admin/guests",
  "/admin/history",
  "/admin/add",
  "/admin/final-list",
  "/admin/gifts",
  "/admin/events",
] as const;

export function normalizeUserEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Rotas que um colaborador (não dono) pode acessar no evento ativo */
export function isCollaboratorPathAllowed(pathname: string) {
  if (pathname === "/admin/events") return true;
  return EVENT_COLLABORATOR_PATHS.some((route) =>
    route === "/admin" ? pathname === "/admin" : pathname.startsWith(route)
  );
}

export const EVENT_SHARE_INCLUDES_DESCRIPTION =
  "Status (Dashboard), Convites, Histórico, Cadastrar, Lista Final e Presentes deste evento — apenas os dados vinculados a ele.";
