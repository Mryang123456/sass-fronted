import { cleanup,render,screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach,describe,expect,it,vi } from 'vitest';
import { service } from '../../shared/lib/service';
import { Dashboard } from './Dashboard';

vi.mock('@ant-design/plots/es/components/column',()=>({default:()=> <div>chart</div>}));

const summary={totalCount:3,draftCount:0,pendingCount:1,approvedCount:2,approvedAmountCents:30000,rejectedCount:0,myPendingTaskCount:1};

describe('Dashboard department ranking',()=>{
 afterEach(()=>{cleanup();vi.restoreAllMocks()});

 it('preserves server order and accessible list semantics',async()=>{
  vi.spyOn(service,'dashboard').mockResolvedValue({summary,submissionTrend:[],departmentRanking:[{department:{name:'研发部'},amountCents:20000,count:2},{department:{name:'市场部'},amountCents:10000,count:1}]});
  render(<MemoryRouter><Dashboard/></MemoryRouter>);
  const list=await screen.findByRole('list');
  expect(list).toBeInTheDocument();
  expect(screen.getAllByRole('listitem').map(item=>item.textContent)).toEqual(expect.arrayContaining([expect.stringContaining('研发部'),expect.stringContaining('市场部')]));
  expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('研发部');
  expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('市场部');
 });

 it('renders a clear empty state',async()=>{
  vi.spyOn(service,'dashboard').mockResolvedValue({summary,submissionTrend:[],departmentRanking:[]});
  render(<MemoryRouter><Dashboard/></MemoryRouter>);
  expect(await screen.findByText('暂无部门采购数据')).toBeInTheDocument();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
 });
});
