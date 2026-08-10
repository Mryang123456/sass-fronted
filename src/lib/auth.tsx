import { createContext,useContext,useState,type ReactNode } from 'react'; import { sessionStore } from './session'; import type { Session } from './types';
const Context=createContext<{session:Session|null;setSession:(s:Session|null)=>void}>({session:null,setSession:()=>{}});
export function AuthProvider({children}:{children:ReactNode}){const [session,setState]=useState(sessionStore.get());const setSession=(s:Session|null)=>{if(s)sessionStore.set(s);else sessionStore.clear();setState(s)};return <Context.Provider value={{session,setSession}}>{children}</Context.Provider>}
export const useAuth=()=>useContext(Context);
