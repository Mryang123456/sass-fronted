import { cleanup,render,screen,waitFor } from '@testing-library/react';
import { afterEach,describe,expect,it,vi } from 'vitest';
import { sessionStore } from './lib/session';
import type { Role,Session } from './lib/types';

vi.mock('./pages/Organization',()=>({Organization:()=> <div>organization-route-content</div>}));

import App from './App';

const session=(role:Role):Session=>({
 token:'token',
 expiresAt:'2026-08-11T00:00:00.000Z',
 tenant:{id:'t1',slug:'acme',name:'Acme',timezone:'Asia/Shanghai'},
 user:{id:role.toLowerCase(),username:role.toLowerCase(),displayName:role,role,status:'ACTIVE',department:{id:'d1',name:'研发部',status:'ACTIVE'}},
});

async function renderOrganization(role:Role){
 sessionStore.set(session(role));
 window.history.replaceState({},'', '/organization');
 render(<App/>);
}

describe('/organization role guard',()=>{
 afterEach(()=>{cleanup();sessionStore.clear();window.history.replaceState({},'', '/')});

 it.each<Role>(['EMPLOYEE','DEPT_MANAGER','FINANCE','TENANT_OWNER','AUDITOR'])('redirects %s before rendering organization',async role=>{
  await renderOrganization(role);
  await waitFor(()=>expect(window.location.pathname).toBe('/'));
  expect(screen.queryByText('organization-route-content')).not.toBeInTheDocument();
 });

 it('allows TENANT_ADMIN to render organization',async()=>{
  await renderOrganization('TENANT_ADMIN');
  expect(await screen.findByText('organization-route-content')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/organization');
 });
});
