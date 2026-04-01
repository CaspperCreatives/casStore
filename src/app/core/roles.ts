export const ROLES = {
  ADMIN: 1,
  MANAGER: 2,
  USER: 3
} as const;

export type RoleId = (typeof ROLES)[keyof typeof ROLES];

export function isValidRoleId(v: unknown): v is RoleId {
  const n = Number(v);
  return n === ROLES.ADMIN || n === ROLES.MANAGER || n === ROLES.USER;
}

export function canAccessAdmin(roleId: unknown): boolean {
  const n = Number(roleId);
  return n === ROLES.ADMIN || n === ROLES.MANAGER;
}



