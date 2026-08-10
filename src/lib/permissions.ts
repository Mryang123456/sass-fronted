import type { Role } from './types';

export const applicationApplicantRoles = [
  'TENANT_ADMIN',
  'EMPLOYEE',
  'DEPT_MANAGER',
  'FINANCE',
  'TENANT_OWNER',
  'AUDITOR',
] as const satisfies readonly Role[];

export const approvalRoles = [
  'DEPT_MANAGER',
  'FINANCE',
  'TENANT_OWNER',
] as const satisfies readonly Role[];

export const allApplicationRoles = [
  'TENANT_ADMIN',
  'FINANCE',
  'TENANT_OWNER',
  'AUDITOR',
] as const satisfies readonly Role[];

export const auditRoles = [
  'TENANT_ADMIN',
  'AUDITOR',
] as const satisfies readonly Role[];

export const organizationRoles = [
  'TENANT_ADMIN',
] as const satisfies readonly Role[];

export function canApply(role: Role) {
  return (applicationApplicantRoles as readonly Role[]).includes(role);
}

export function canAccessApprovals(role: Role) {
  return (approvalRoles as readonly Role[]).includes(role);
}
