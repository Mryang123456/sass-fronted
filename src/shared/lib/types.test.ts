import { describe,expect,it } from 'vitest'; import { money,statusLabel } from './types';
describe('展示格式',()=>{it('以人民币元展示契约中的分',()=>{expect(money(123456)).toContain('1,234.56')});it('状态不只依赖颜色',()=>{expect(statusLabel.PENDING_FINANCE).toBe('待财务')})});
