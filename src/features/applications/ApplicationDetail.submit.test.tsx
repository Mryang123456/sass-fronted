import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { MemoryRouter,Route,Routes } from 'react-router-dom';
import { afterEach,describe,expect,it,vi } from 'vitest';
import { demo } from '../../shared/lib/demo';
import { service } from '../../shared/lib/service';
import type { Application } from '../../shared/lib/types';
import { ApplicationDetail,ApplicationForm } from './ApplicationDetail';

const submitted=(application:Application):Application=>({
 ...application,
 status:'PENDING_DEPT_MANAGER',
 currentApprovalNode:'DEPT_MANAGER',
 applicationNo:'PF-20260808-TEST',
 version:application.version+1,
 submittedAt:new Date().toISOString(),
 history:[...application.history,{type:'SUBMITTED',actor:application.creator,fromStatus:'DRAFT',toStatus:'PENDING_DEPT_MANAGER',createdAt:new Date().toISOString()}],
 permissions:{...application.permissions,canEdit:false,canDelete:false,canSubmit:false},
});

function detailRoutes(id:string){
 return render(<MemoryRouter initialEntries={[`/applications/${id}`]}><Routes>
  <Route path="/applications/:id" element={<ApplicationDetail/>}/>
  <Route path="/applications/:id/edit" element={<ApplicationForm/>}/>
 </Routes></MemoryRouter>);
}

async function freshDraft(){return demo.create(`QA 重复提交 ${Date.now()}-${Math.random()}`)}

afterEach(()=>{cleanup();vi.restoreAllMocks()});

describe('ApplicationDetail submit concurrency',()=>{
 it('single click creates one submitted history entry in demo state',async()=>{
 const application=await freshDraft();
 detailRoutes(application.id);
 fireEvent.click(await screen.findByRole('button',{name:'提交审批'}));
  await waitFor(()=>expect(screen.queryByRole('button',{name:'提交审批'})).not.toBeInTheDocument());
  const stored=await demo.application(application.id);
  expect(stored).not.toBe(application);
  expect(stored.history.filter(item=>item.type==='SUBMITTED')).toHaveLength(1);
 expect(screen.getAllByText('提交审批')).toHaveLength(1);
 });

 it('rejects a stale demo version without changing the draft and then allows a valid retry',async()=>{
  const application=await freshDraft();
  await expect(demo.submit(application.id,application.version+1)).rejects.toThrow('申请已被更新');
  const unchanged=await demo.application(application.id);
  expect(unchanged.status).toBe('DRAFT');
  expect(unchanged.history).toHaveLength(0);
  const result=await demo.submit(application.id,application.version);
  expect(result).not.toBe(application);
  expect(result.history.filter(item=>item.type==='SUBMITTED')).toHaveLength(1);
 });

 it('disables submit and edit while the request is pending so a concurrent double click sends one request',async()=>{
  const application=await freshDraft();
  vi.spyOn(service,'application').mockResolvedValue(application);
  vi.spyOn(service,'submit').mockImplementation(()=>new Promise(()=>undefined));
  detailRoutes(application.id);
  const button=await screen.findByRole('button',{name:'提交审批'});
  fireEvent.click(button);
  fireEvent.click(button);
  expect(service.submit).toHaveBeenCalledTimes(1);
  expect(button).toBeDisabled();
  expect(screen.getByRole('button',{name:/正在提交/})).toBeDisabled();
  expect(screen.getByRole('button',{name:'编辑草稿'})).toBeDisabled();
 });

 it('does not allow a sequential second submit after the first demo request completes',async()=>{
  const application=await freshDraft();
  detailRoutes(application.id);
  fireEvent.click(await screen.findByRole('button',{name:'提交审批'}));
  await waitFor(()=>expect(screen.queryByRole('button',{name:'提交审批'})).not.toBeInTheDocument());
  const stored=await demo.application(application.id);
  expect(stored.history).toHaveLength(1);
  await expect(demo.submit(application.id,stored.version)).rejects.toThrow('申请已提交');
  expect((await demo.application(application.id)).history).toHaveLength(1);
 });

 it('allows a retry after a failed request and applies only the successful response',async()=>{
  const application=await freshDraft(),response=submitted(application);
  vi.spyOn(service,'application').mockResolvedValue(application);
  vi.spyOn(service,'submit').mockRejectedValueOnce(new Error('网络暂时不可用')).mockResolvedValueOnce(response);
  detailRoutes(application.id);
  fireEvent.click(await screen.findByRole('button',{name:'提交审批'}));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button',{name:'提交审批'}));
  await waitFor(()=>expect(screen.queryByRole('button',{name:'提交审批'})).not.toBeInTheDocument());
  expect(service.submit).toHaveBeenCalledTimes(2);
  expect(screen.getAllByText('提交审批')).toHaveLength(1);
 });

 it('does not render submit for an application whose status already changed',async()=>{
  const application=submitted(await freshDraft());
  vi.spyOn(service,'application').mockResolvedValue(application);
  detailRoutes(application.id);
  await screen.findByText(application.applicationNo!);
  expect(screen.queryByRole('button',{name:'提交审批'})).not.toBeInTheDocument();
 });

 it('shows one submitted node immediately after rapid clicks',async()=>{
  const application=await freshDraft();
  detailRoutes(application.id);
  const button=await screen.findByRole('button',{name:'提交审批'});
  fireEvent.click(button);
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(()=>expect(screen.queryByRole('button',{name:'提交审批'})).not.toBeInTheDocument());
  const stored=await demo.application(application.id);
  expect(stored.history.filter(item=>item.type==='SUBMITTED')).toHaveLength(1);
  expect(screen.getAllByText('提交审批')).toHaveLength(1);
  expect(screen.queryByRole('link',{name:'编辑草稿'})).not.toBeInTheDocument();
 });

 it('keeps one submitted node and removes draft actions after navigation reload',async()=>{
  const application=await freshDraft();
  const view=detailRoutes(application.id);
  const button=await screen.findByRole('button',{name:'提交审批'});
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(()=>expect(screen.queryByRole('button',{name:'提交审批'})).not.toBeInTheDocument());
  view.unmount();
  detailRoutes(application.id);
  await screen.findByText(application.title);
  expect(screen.getAllByText('提交审批')).toHaveLength(1);
  expect(screen.queryByRole('button',{name:'提交审批'})).not.toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'编辑草稿'})).not.toBeInTheDocument();
 });
});

describe('ApplicationForm draft values',()=>{
 it('keeps four quantity decimals and converts yuan to cents exactly for multiple lines',async()=>{
  const created=await freshDraft();
  const create=vi.spyOn(service,'create').mockResolvedValue(created);
  render(<MemoryRouter initialEntries={['/applications/new']}><Routes>
   <Route path="/applications/new" element={<ApplicationForm/>}/>
   <Route path="/applications/:id" element={<div>saved</div>}/>
  </Routes></MemoryRouter>);

  fireEvent.change(screen.getByLabelText('申请标题'),{target:{value:'精确金额采购'}});
  fireEvent.change(screen.getByLabelText('物品名称'),{target:{value:'精密零件'}});
  fireEvent.change(screen.getByLabelText('数量'),{target:{value:'1.2345'}});
  fireEvent.change(screen.getByLabelText('单价（元）'),{target:{value:'10.01'}});
  fireEvent.click(screen.getByRole('button',{name:/添加明细/}));
  const names=screen.getAllByLabelText('物品名称');
  const quantities=screen.getAllByLabelText('数量');
  const prices=screen.getAllByLabelText('单价（元）');
  fireEvent.change(names[1],{target:{value:'适配器'}});
  fireEvent.change(quantities[1],{target:{value:'2'}});
  fireEvent.change(prices[1],{target:{value:'0.29'}});
  fireEvent.click(screen.getByRole('button',{name:'保存草稿'}));

  await waitFor(()=>expect(create).toHaveBeenCalledTimes(1));
  expect(create).toHaveBeenCalledWith(expect.objectContaining({
   title:'精确金额采购',
   items:[
    expect.objectContaining({name:'精密零件',quantity:'1.2345',unitPriceCents:1001}),
    expect.objectContaining({name:'适配器',quantity:'2',unitPriceCents:29}),
   ],
  }));
 });

 it('reopens every saved line and version for editing',async()=>{
  const draft=await freshDraft();
  draft.version=7;
  draft.items=[
   {id:'line-1',lineNo:1,name:'显示器',quantity:'1.25',unitPriceCents:12345,lineAmountCents:15431,note:'主屏'},
   {id:'line-2',lineNo:2,name:'支架',quantity:'2',unitPriceCents:999,lineAmountCents:1998,note:null},
  ];
  vi.spyOn(service,'application').mockResolvedValue(draft);
  render(<MemoryRouter initialEntries={[`/applications/${draft.id}/edit`]}><Routes>
   <Route path="/applications/:id/edit" element={<ApplicationForm/>}/>
  </Routes></MemoryRouter>);

  expect((await screen.findAllByLabelText('物品名称')).map(input=>(input as HTMLInputElement).value)).toEqual(['显示器','支架']);
  expect(screen.getAllByLabelText('数量').map(input=>(input as HTMLInputElement).value)).toEqual(['1.2500','2.0000']);
  expect(screen.getAllByLabelText('单价（元）').map(input=>(input as HTMLInputElement).value)).toEqual(['123.45','9.99']);
 });
});
