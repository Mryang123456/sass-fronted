import { describe,expect,it } from 'vitest';
import type { Role } from './types';
import { canAccessApprovals,canApply } from './permissions';

const roles: Role[] = ['TENANT_ADMIN','EMPLOYEE','DEPT_MANAGER','FINANCE','TENANT_OWNER','AUDITOR'];

describe('role capabilities',()=>{
  it.each(roles)('%s can create and edit its own application drafts',role=>{
    expect(canApply(role)).toBe(true);
  });

  it.each([
    ['TENANT_ADMIN',false],
    ['EMPLOYEE',false],
    ['DEPT_MANAGER',true],
    ['FINANCE',true],
    ['TENANT_OWNER',true],
    ['AUDITOR',false],
  ] as const)('keeps approval access for %s unchanged', (role, expected) => {
    expect(canAccessApprovals(role)).toBe(expected);
  });
});
