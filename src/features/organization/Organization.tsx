import { useEffect, useState } from 'react';
import { Alert, Card, Table, Tabs, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { service } from '../../shared/lib/service';
import type { Department, User } from '../../shared/lib/types';

const departmentColumns: TableColumnsType<Department> = [
  { title: '部门', dataIndex: 'name', key: 'name', render: value => <Typography.Text strong>{value as string}</Typography.Text> },
  { title: '主管', key: 'manager', responsive: ['md'], render: (_, item) => item.manager?.displayName || '未设置' },
  { title: '成员', dataIndex: 'memberCount', key: 'memberCount', width: 100, align: 'right' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: value => <Tag color={value === 'ACTIVE' ? 'green' : 'default'}>{value === 'ACTIVE' ? '启用' : '停用'}</Tag> },
];
const memberColumns: TableColumnsType<User> = [
  { title: '成员', dataIndex: 'displayName', key: 'displayName', render: value => <Typography.Text strong>{value as string}</Typography.Text> },
  { title: '账号', dataIndex: 'username', key: 'username', responsive: ['md'] },
  { title: '部门', key: 'department', responsive: ['lg'], render: (_, item) => item.department.name },
  { title: '角色', dataIndex: 'role', key: 'role', width: 160, render: value => <Tag color="blue">{value as string}</Tag> },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: value => <Tag color={value === 'ACTIVE' ? 'green' : 'default'}>{value === 'ACTIVE' ? '启用' : '停用'}</Tag> },
];

export function Organization() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([service.departments(), service.members()]).then(([departmentResponse, memberResponse]) => {
      if (!active) return;
      setDepartments((departmentResponse as { items: Department[] }).items);
      setMembers((memberResponse as { items: User[] }).items);
    }).catch(cause => {
      if (active) setError(cause instanceof Error ? cause.message : '组织数据加载失败');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const tabs = [
    { key: 'departments', label: `部门（${departments.length}）`, children: <Table<Department> columns={departmentColumns} dataSource={departments} rowKey="id" loading={loading} pagination={false} scroll={{ x: 560 }} /> },
    { key: 'members', label: `成员（${members.length}）`, children: <Table<User> columns={memberColumns} dataSource={members} rowKey="id" loading={loading} pagination={false} scroll={{ x: 680 }} /> },
  ];

  return <>
    <div className="page-head"><div><p className="eyebrow">ORGANIZATION</p><h1>组织管理</h1><p>维护企业部门、成员与审批角色</p></div></div>
    {error ? <Alert type="error" showIcon title={error} /> : null}
    <Card className="list-page-card"><Tabs items={tabs} /><Alert type="info" showIcon title="演示版以只读方式展示组织结构；真实 API 已预留创建与更新能力。" /></Card>
  </>;
}
