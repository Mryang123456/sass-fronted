import { cleanup,render,screen } from '@testing-library/react';
import { MemoryRouter,Route,Routes } from 'react-router-dom';
import { afterEach,describe,expect,it } from 'vitest';
import { AuthProvider } from '../lib/auth';
import { auditRoles } from '../lib/permissions';
import { sessionStore } from '../lib/session';
import type { Role,Session } from '../lib/types';
import { Layout,RoleProtected } from './Layout';

const session=(role:Role):Session=>({token:'token',expiresAt:'2026-08-11T00:00:00.000Z',tenant:{id:'t1',slug:'acme',name:'Acme',timezone:'Asia/Shanghai'},user:{id:'u1',username:'user',displayName:'User',role,status:'ACTIVE',department:{id:'d1',name:'研发部',status:'ACTIVE'}}});
const renderWithRole=(role:Role,initialEntry='/')=>{sessionStore.set(session(role));return render(<AuthProvider><MemoryRouter initialEntries={[initialEntry]}><Routes><Route element={<Layout/>}><Route index element={<div>首页内容</div>}/><Route path="audit" element={<div>审计内容</div>}/><Route element={<RoleProtected roles={auditRoles}/>}><Route path="protected-audit" element={<div>受保护审计内容</div>}/></Route></Route></Routes></MemoryRouter></AuthProvider>)};

describe('Layout role navigation',()=>{
 afterEach(()=>{cleanup();sessionStore.clear()});

 it('makes all applications the administrator primary list entry',()=>{
  renderWithRole('TENANT_ADMIN');
  expect(screen.getByRole('link',{name:/全部申请/})).toHaveAttribute('href','/all');
  expect(screen.queryByRole('link',{name:/我的申请/})).not.toBeInTheDocument();
 });

 it('redirects a role without audit access from a protected route',()=>{
  renderWithRole('EMPLOYEE','/protected-audit');
  expect(screen.getByText('首页内容')).toBeInTheDocument();
  expect(screen.queryByText('受保护审计内容')).not.toBeInTheDocument();
 });
});
