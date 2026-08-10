import { cleanup,render,screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach,describe,expect,it,vi } from 'vitest';
import { AuthProvider } from '../lib/auth';
import { service } from '../lib/service';
import { sessionStore } from '../lib/session';
import type { Session } from '../lib/types';
import { Applications } from './Applications';

const admin:Session={token:'token',expiresAt:'2026-08-11T00:00:00.000Z',tenant:{id:'t1',slug:'acme',name:'Acme',timezone:'Asia/Shanghai'},user:{id:'admin',username:'admin',displayName:'管理员',role:'TENANT_ADMIN',status:'ACTIVE',department:{id:'d1',name:'管理部',status:'ACTIVE'}}};

describe('Applications administrator empty state',()=>{
 afterEach(()=>{cleanup();sessionStore.clear();vi.restoreAllMocks()});

 it('explains the personal scope and links to all applications',async()=>{
  sessionStore.set(admin);
  vi.spyOn(service,'applications').mockResolvedValue({items:[],total:0});
  render(<AuthProvider><MemoryRouter><Applications/></MemoryRouter></AuthProvider>);
  expect(await screen.findByText('“我的申请”只显示你本人创建的申请。')).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'前往全部申请'})).toHaveAttribute('href','/all');
 });
});
