import { sessionStore } from './session'; import type { ApiError } from './types'; import { appConfig } from './config';
const base=appConfig.apiBaseUrl;
export class RequestError extends Error{constructor(public status:number,public payload:ApiError){super(payload.message)}}
export async function request<T>(path:string,init:RequestInit={}){const s=sessionStore.get();const headers=new Headers(init.headers);headers.set('Content-Type','application/json');headers.set('X-Request-Id',crypto.randomUUID());if(s)headers.set('Authorization',`Bearer ${s.token}`);const res=await fetch(`${base}${path}`,{...init,headers});if(res.status===204)return undefined as T;const body=await res.json();if(!res.ok){if(body.error?.code==='UNAUTHENTICATED')sessionStore.clear();throw new RequestError(res.status,body.error)}return body.data as T}
export const idem=()=>({'Idempotency-Key':crypto.randomUUID()});
