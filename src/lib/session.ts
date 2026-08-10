import type { Session } from './types';
const KEY='procureflow.session';
export const sessionStore={get:():Session|null=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{return null}},set:(s:Session)=>sessionStorage.setItem(KEY,JSON.stringify(s)),clear:()=>sessionStorage.removeItem(KEY)};
