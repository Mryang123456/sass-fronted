import { cleanup,fireEvent,render,screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach,describe,expect,it,vi } from 'vitest';
import { service } from '../lib/service';
import type { Application } from '../lib/types';
import { Approvals } from './Approvals';

const task=(id='application-1'):Application=>({id,applicationNo:'PF-20260810-0001',title:'研发设备采购',reason:'扩充研发设备',costCenter:'R&D',currency:'CNY',totalAmountCents:10000,status:'PENDING_DEPT_MANAGER',currentApprovalNode:'DEPT_MANAGER',creator:{id:'alice',username:'alice',displayName:'员工 Alice',role:'EMPLOYEE',status:'ACTIVE',department:{id:'rd',name:'研发部',status:'ACTIVE'}},department:{id:'rd',name:'研发部',status:'ACTIVE'},itemCount:1,items:[],history:[],version:2,submittedAt:'2026-08-10T00:00:00.000Z',createdAt:'2026-08-10T00:00:00.000Z',updatedAt:'2026-08-10T00:00:00.000Z',permissions:{canEdit:false,canDelete:false,canSubmit:false,canApprove:true,canReject:true}});

afterEach(()=>{cleanup();vi.restoreAllMocks()});

describe('Approvals',()=>{
 it('requires a rejection reason before calling the API',async()=>{
  vi.spyOn(service,'tasks').mockResolvedValue({items:[task()],total:1});
  const decide=vi.spyOn(service,'decide');
  render(<MemoryRouter><Approvals/></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button',{name:/驳回申请/}));
  expect(await screen.findByRole('alert')).toHaveTextContent('驳回时必须填写原因');
  expect(decide).not.toHaveBeenCalled();
 });

 it('submits an approval once and refreshes the selected task',async()=>{
  const application=task();
  const tasks=vi.spyOn(service,'tasks').mockResolvedValueOnce({items:[application],total:1}).mockResolvedValueOnce({items:[],total:0});
  const decide=vi.spyOn(service,'decide').mockResolvedValue({...application,status:'PENDING_FINANCE',currentApprovalNode:'FINANCE',version:3});
  render(<MemoryRouter><Approvals/></MemoryRouter>);
  const approve=await screen.findByRole('button',{name:/同意并流转/});
  fireEvent.click(approve);
  fireEvent.click(approve);
  await screen.findByText('当前没有待审批事项');
  expect(decide).toHaveBeenCalledTimes(1);
  expect(decide).toHaveBeenCalledWith(application.id,'APPROVE','',application.version);
  expect(tasks).toHaveBeenCalledTimes(2);
 });

 it('shows a server authorization error without dropping the task',async()=>{
  vi.spyOn(service,'tasks').mockResolvedValue({items:[task()],total:1});
  vi.spyOn(service,'decide').mockRejectedValue(new Error('不能审批本人申请'));
  render(<MemoryRouter><Approvals/></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button',{name:/同意并流转/}));
  expect(await screen.findByRole('alert')).toHaveTextContent('不能审批本人申请');
  expect(screen.getAllByText('研发设备采购')).toHaveLength(2);
 });
});
