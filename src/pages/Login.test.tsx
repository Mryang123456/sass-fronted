import { fireEvent,render,waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach,describe,expect,it } from 'vitest';
import { AuthProvider } from '../lib/auth';
import { Login } from './Login';

describe('Login',()=>{
  beforeEach(()=>sessionStorage.clear());

  it('logs in with the demo administrator account',async()=>{
    const {container}=render(<AuthProvider><MemoryRouter><Login/></MemoryRouter></AuthProvider>);
    const password=container.querySelector<HTMLInputElement>('#password');
    expect(password).not.toBeNull();
    fireEvent.change(password!,{target:{value:'demo-password'}});
    const submit=container.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(submit).not.toBeNull();
    fireEvent.click(submit!);
    await waitFor(()=>expect(sessionStorage.getItem('procureflow.session')).toContain('demo-admin'));
  });
});
