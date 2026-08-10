import { ArrowRightOutlined,PlusOutlined } from '@ant-design/icons';
import { Button,Card,Col,Empty,Flex,Row,Space,Statistic,Typography } from 'antd';
import { lazy,Suspense,useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { Loading } from '../components/ui';
import { service } from '../lib/service';
import { money } from '../lib/types';

const LazyColumn=lazy(()=>import('@ant-design/plots/es/components/column'));
type Data={summary:{totalCount:number;draftCount:number;pendingCount:number;approvedCount:number;approvedAmountCents:number;rejectedCount:number;myPendingTaskCount:number};submissionTrend:{date:string;amountCents:number;count:number}[];departmentRanking:{department:{name:string};amountCents:number;count:number}[]};

export function Dashboard(){
 const [data,setData]=useState<Data|null>(null);
 useEffect(()=>{service.dashboard().then(value=>setData(value as unknown as Data))},[]);
 if(!data)return <Loading/>;
 const summary=data.summary;
 const chartData=data.submissionTrend.map(item=>({date:item.date.slice(5),amount:item.amountCents/100,count:item.count}));
 return <>
  <div className="page-head"><div><Typography.Text className="eyebrow">OVERVIEW</Typography.Text><Typography.Title level={1}>工作台</Typography.Title><Typography.Paragraph type="secondary">掌握采购进度与审批效率</Typography.Paragraph></div><Link to="/applications/new"><Button type="primary" icon={<PlusOutlined/>}>新建申请</Button></Link></div>
  <Row className="metrics" gutter={[16,16]}><Col xs={12} lg={6}><Card><Statistic title="申请总数" value={summary.totalCount}/><Typography.Text type="secondary">全部可见申请</Typography.Text></Card></Col><Col xs={12} lg={6}><Card><Statistic title="审批中" value={summary.pendingCount}/><Typography.Text type="secondary">等待流程处理</Typography.Text></Card></Col><Col xs={12} lg={6}><Card><Statistic title="已通过金额" value={summary.approvedAmountCents/100} precision={2} prefix="¥"/><Typography.Text type="secondary">{summary.approvedCount} 笔申请</Typography.Text></Card></Col><Col xs={12} lg={6}><Card className="accent"><Statistic title="我的待办" value={summary.myPendingTaskCount}/><Link to="/approvals">立即处理 <ArrowRightOutlined/></Link></Card></Col></Row>
  <Row className="dashboard-grid" gutter={[18,18]}><Col xs={24} lg={15}><Card title="近 7 日提交趋势" extra="金额（元）"><div className="dashboard-chart" role="img" aria-label="最近七日采购金额柱状图"><Suspense fallback={<Loading/>}><LazyColumn data={chartData} xField="date" yField="amount" height={240} tooltip={{title:'date'}}/></Suspense></div></Card></Col><Col xs={24} lg={9}><Card title="部门采购排行" extra="已提交">{data.departmentRanking.length?<Flex vertical role="list" className="department-ranking">{data.departmentRanking.map((item,index)=><Flex role="listitem" className="department-ranking-item" align="center" justify="space-between" gap={12} key={`${item.department.name}-${index}`}><Space><span className="rank-number" aria-label={`第 ${index+1} 名`}>{index+1}</span><div><Typography.Text strong>{item.department.name}</Typography.Text><br/><Typography.Text type="secondary">{item.count} 笔申请</Typography.Text></div></Space><Typography.Text strong>{money(item.amountCents)}</Typography.Text></Flex>)}</Flex>:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无部门采购数据"/>}</Card></Col></Row>
 </>;
}
