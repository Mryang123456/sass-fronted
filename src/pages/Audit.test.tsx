import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { afterEach,describe,expect,it,vi } from 'vitest';
import { service } from '../lib/service';
import { Audit } from './Audit';

const log=(id:string,eventType='AUTH_LOGIN_SUCCESS')=>({id,eventType,actor:null,targetType:'SESSION',targetId:null,result:'SUCCESS',requestId:`request-${id}`,createdAt:'2026-08-10T00:00:00.000Z'});
const renderAudit=()=>render(<ConfigProvider locale={zhCN}><Audit/></ConfigProvider>);

describe('Audit',()=>{
 afterEach(()=>{cleanup();vi.restoreAllMocks()});

 it('uses server pagination metadata and requests the next page',async()=>{
  const audits=vi.spyOn(service,'audits').mockImplementation(async filters=>({items:[log(`log-${filters.page}`)],page:filters.page??1,pageSize:filters.pageSize??20,total:41,totalPages:3}));
  renderAudit();
  await screen.findByText('共 41 条');
  fireEvent.click(screen.getByRole('listitem',{name:'下一页'}));
  await waitFor(()=>expect(audits).toHaveBeenLastCalledWith(expect.objectContaining({page:2,pageSize:20})));
 });

 it('resets to page one when filters or page size change',async()=>{
  const audits=vi.spyOn(service,'audits').mockImplementation(async filters=>({items:[log(`log-${filters.page}`)],page:filters.page??1,pageSize:filters.pageSize??20,total:60,totalPages:3}));
  renderAudit();
  await screen.findByText('共 60 条');
  fireEvent.click(screen.getByRole('listitem',{name:'下一页'}));
  await waitFor(()=>expect(audits).toHaveBeenLastCalledWith(expect.objectContaining({page:2,pageSize:20})));
  fireEvent.change(screen.getByLabelText('筛选事件'),{target:{value:'APPROVAL'}});
  await waitFor(()=>expect(audits).toHaveBeenLastCalledWith(expect.objectContaining({eventType:'APPROVAL',page:1})));
  fireEvent.mouseDown(screen.getByRole('combobox',{name:'页码'}));
  fireEvent.click(await screen.findByText('50 条/页'));
  await waitFor(()=>expect(audits).toHaveBeenLastCalledWith(expect.objectContaining({page:1,pageSize:50})));
 });
});
