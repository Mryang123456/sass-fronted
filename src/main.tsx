import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntdApp,ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import 'antd/dist/reset.css';
import './styles.css';

const theme={token:{colorPrimary:'#2563eb',colorSuccess:'#138a5b',colorWarning:'#b76b0b',colorError:'#c7374f',borderRadius:10,fontFamily:'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif'},components:{Layout:{bodyBg:'#f4f7fb',headerBg:'rgba(255,255,255,.9)',siderBg:'#10182a'},Card:{borderRadiusLG:14}}};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ConfigProvider locale={zhCN} theme={theme} button={{autoInsertSpace:false}}><AntdApp><App/></AntdApp></ConfigProvider></React.StrictMode>);
