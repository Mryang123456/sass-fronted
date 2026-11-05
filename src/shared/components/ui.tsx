import { Alert,Button as AntButton,Card as AntCard,Empty as AntEmpty,Spin,Tag,Typography } from 'antd';
import type { ButtonProps } from 'antd';
import type { ReactNode } from 'react';
import { money,statusLabel,type Status } from '../../shared/lib/types';

type Variant='primary'|'secondary'|'danger';
type Props=Omit<ButtonProps,'type'|'danger'|'variant'|'htmlType'>&{variant?:Variant;type?:'button'|'submit'|'reset'};

export const Button=({children,variant='primary',type='submit',...props}:Props)=><AntButton htmlType={type} type={variant==='primary'?'primary':'default'} danger={variant==='danger'} {...props}>{children}</AntButton>;
export const Card=({children,className}:{children:ReactNode;className?:string})=><AntCard className={className}>{children}</AntCard>;
const statusColor:Record<Status,string>={DRAFT:'default',PENDING_DEPT_MANAGER:'gold',PENDING_FINANCE:'gold',PENDING_TENANT_OWNER:'gold',APPROVED:'success',REJECTED:'error'};
export const StatusBadge=({status}:{status:Status})=><Tag color={statusColor[status]}>{statusLabel[status]}</Tag>;
export const Amount=({value}:{value:number})=><Typography.Text className="amount" strong>{money(value)}</Typography.Text>;
export const Empty=({text='暂无数据'}:{text?:string})=><AntEmpty image={AntEmpty.PRESENTED_IMAGE_SIMPLE} description={text}/>;
export const Loading=()=> <div className="loading" role="status" aria-live="polite"><Spin/><span>正在加载…</span></div>;
export const ErrorBox=({message}:{message:string})=><Alert title={message} type="error" showIcon role="alert"/>;
