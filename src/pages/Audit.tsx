import { useEffect, useRef, useState } from 'react';
import { Card, DatePicker, Empty, Input, Select, Space, Table, Tag, Typography } from 'antd';
import type { GetProps, TableColumnsType, TablePaginationConfig } from 'antd';
import { service } from '../lib/service';
import type { PagedResponse, User } from '../lib/types';

type Log = { id: string; eventType: string; actor: User | null; targetType: string; targetId: string | null; result: string; requestId: string; createdAt: string };
type RangeValue = GetProps<typeof DatePicker.RangePicker>['value'];
const initialPage: PagedResponse<Log> = { items: [], page: 1, pageSize: 20, total: 0, totalPages: 0 };
const columns: TableColumnsType<Log> = [
  { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 190, render: value => new Date(value as string).toLocaleString('zh-CN') },
  { title: '事件', dataIndex: 'eventType', key: 'eventType', width: 220, render: value => <Typography.Text strong>{value as string}</Typography.Text> },
  { title: '操作者', key: 'actor', width: 130, responsive: ['md'], render: (_, item) => item.actor?.displayName || '匿名' },
  { title: '目标', key: 'target', width: 190, responsive: ['lg'], render: (_, item) => <Space orientation="vertical" size={0}><span>{item.targetType}</span><Typography.Text type="secondary">{item.targetId || '—'}</Typography.Text></Space> },
  { title: '结果', dataIndex: 'result', key: 'result', width: 100, render: value => <Tag color={value === 'SUCCESS' ? 'green' : 'red'}>{value as string}</Tag> },
  { title: '请求 ID', dataIndex: 'requestId', key: 'requestId', width: 240, responsive: ['xl'], render: value => <Typography.Text code>{value as string}</Typography.Text> },
];

export function Audit() {
  const [data, setData] = useState<PagedResponse<Log>>(initialPage);
  const [loading, setLoading] = useState(true);
  const [eventType, setEventType] = useState('');
  const [result, setResult] = useState<string>();
  const [range, setRange] = useState<RangeValue>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const requestSequence = useRef(0);

  useEffect(() => {
    const sequence = ++requestSequence.current;
    const timer = window.setTimeout(() => {
      setLoading(true);
      const from = range?.[0]?.startOf('day').toDate().toISOString() ?? '';
      const to = range?.[1]?.endOf('day').toDate().toISOString() ?? '';
      service.audits<Log>({ eventType: eventType.trim(), result, from, to, page, pageSize }).then(response => {
        if (sequence === requestSequence.current) setData(response);
      }).finally(() => {
        if (sequence === requestSequence.current) setLoading(false);
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [eventType, result, range, page, pageSize]);

  const resetPage = () => setPage(1);
  const handleTableChange = (pagination: TablePaginationConfig) => {
    const nextPageSize = pagination.pageSize ?? pageSize;
    setPageSize(nextPageSize);
    setPage(nextPageSize === pageSize ? pagination.current ?? 1 : 1);
  };

  return <>
    <div className="page-head"><div><p className="eyebrow">AUDIT TRAIL</p><h1>审计日志</h1><p>只读、不可篡改的关键操作记录</p></div></div>
    <Card className="list-page-card">
      <div className="list-filters audit-filters"><Input.Search aria-label="筛选事件" placeholder="筛选事件类型" allowClear value={eventType} onChange={event => { setEventType(event.target.value); resetPage(); }} /><Select aria-label="筛选结果" placeholder="全部结果" allowClear value={result} options={[{ value: 'SUCCESS', label: '成功' }, { value: 'FAILURE', label: '失败' }]} onChange={value => { setResult(value); resetPage(); }} /><DatePicker.RangePicker aria-label="日期范围" value={range} onChange={value => { setRange(value); resetPage(); }} /></div>
      <Table<Log> columns={columns} dataSource={data.items} rowKey="id" loading={loading} locale={{ emptyText: <Empty description="没有符合筛选条件的审计记录" /> }} scroll={{ x: 860 }} pagination={{ current: page, pageSize, total: data.total, showSizeChanger: true, pageSizeOptions: [20, 50, 100], showTotal: total => `共 ${total} 条`, placement: ['bottomEnd'] }} onChange={handleTableChange} />
    </Card>
  </>;
}
