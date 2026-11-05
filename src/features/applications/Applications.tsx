import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Input, Select, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { Link } from 'react-router-dom';
import { service } from '../../shared/lib/service';
import { useAuth } from '../../shared/lib/auth';
import { money, statusLabel } from '../../shared/lib/types';
import type { Application, Status } from '../../shared/lib/types';

const statusOptions = (Object.keys(statusLabel) as Status[]).map(value => ({ value, label: statusLabel[value] }));
const statusColors: Record<Status, string> = { DRAFT: 'default', PENDING_DEPT_MANAGER: 'gold', PENDING_FINANCE: 'orange', PENDING_TENANT_OWNER: 'blue', APPROVED: 'green', REJECTED: 'red' };

const columns: TableColumnsType<Application> = [
  { title: '申请', key: 'application', width: 260, render: (_, item) => <Space orientation="vertical" size={0}><Typography.Text strong>{item.title}</Typography.Text><Typography.Text type="secondary">{item.applicationNo || '尚未生成编号'}</Typography.Text></Space> },
  { title: '部门 / 申请人', key: 'owner', width: 180, responsive: ['md'], render: (_, item) => <Space orientation="vertical" size={0}><span>{item.department.name}</span><Typography.Text type="secondary">{item.creator.displayName}</Typography.Text></Space> },
  { title: '金额', dataIndex: 'totalAmountCents', key: 'amount', width: 140, align: 'right', render: value => money(value as number) },
  { title: '状态', dataIndex: 'status', key: 'status', width: 130, render: value => <Tag color={statusColors[value as Status]}>{statusLabel[value as Status]}</Tag> },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 130, responsive: ['lg'], render: value => new Date(value as string).toLocaleDateString('zh-CN') },
  { title: '操作', key: 'action', width: 90, fixed: 'right', render: (_, item) => <Link to={`/applications/${item.id}`}>查看</Link> },
];

export function Applications({ all = false }: { all?: boolean }) {
  const { session } = useAuth();
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status | undefined>();

  useEffect(() => {
    let active = true;
    setLoading(true);
    service.applications(all ? 'all' : 'mine').then(response => {
      if (active) setItems(response.items);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [all]);

  const shown = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(item => (!normalized || `${item.applicationNo ?? ''} ${item.title}`.toLowerCase().includes(normalized)) && (!status || item.status === status));
  }, [items, query, status]);
  const adminOwnEmpty = !loading && !all && !query && !status && !items.length && session?.user.role === 'TENANT_ADMIN';
  const emptyText = adminOwnEmpty
    ? <Empty description="“我的申请”只显示你本人创建的申请。"><Link to="/all"><Button>前往全部申请</Button></Link></Empty>
    : <Empty description="没有匹配的申请" />;

  return <>
    <div className="page-head"><div><p className="eyebrow">APPLICATIONS</p><h1>{all ? '全部申请' : '我的申请'}</h1><p>{all ? '查看权限范围内的所有采购申请' : '创建和跟踪你的采购需求'}</p></div>{!all && <Link to="/applications/new"><Button type="primary">＋ 新建申请</Button></Link>}</div>
    <Card className="list-page-card">
      <div className="list-filters"><Input.Search aria-label="搜索申请" placeholder="搜索申请编号或标题" allowClear value={query} onChange={event => setQuery(event.target.value)} /><Select aria-label="筛选状态" placeholder="全部状态" allowClear options={statusOptions} value={status} onChange={setStatus} /></div>
      <Table<Application> columns={columns} dataSource={shown} rowKey="id" loading={loading} pagination={false} locale={{ emptyText }} scroll={{ x: 760 }} />
    </Card>
  </>;
}
