import { Button,Result } from 'antd';
import { Link } from 'react-router-dom';
export function NotFound(){return <Result status="404" title="404" subTitle="你访问的页面可能已移动，或当前账号无权访问。" extra={<Link to="/"><Button type="primary">返回工作台</Button></Link>}/>}
