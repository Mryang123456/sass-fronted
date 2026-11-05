import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../shared/lib/auth';
import { Layout, Protected, RoleProtected } from '../shared/components/Layout';
import { Loading } from '../shared/components/ui';
import { allApplicationRoles, applicationApplicantRoles, approvalRoles, auditRoles, organizationRoles } from '../shared/lib/permissions';

const Login = lazy(() => import('../features/auth/Login').then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import('../features/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const Applications = lazy(() => import('../features/applications/Applications').then(module => ({ default: module.Applications })));
const ApplicationDetail = lazy(() => import('../features/applications/ApplicationDetail').then(module => ({ default: module.ApplicationDetail })));
const ApplicationForm = lazy(() => import('../features/applications/ApplicationDetail').then(module => ({ default: module.ApplicationForm })));
const Approvals = lazy(() => import('../features/approvals/Approvals').then(module => ({ default: module.Approvals })));
const Organization = lazy(() => import('../features/organization/Organization').then(module => ({ default: module.Organization })));
const Audit = lazy(() => import('../features/audit/Audit').then(module => ({ default: module.Audit })));
const NotFound = lazy(() => import('../features/not-found/NotFound').then(module => ({ default: module.NotFound })));

export default function App() {
  return <AuthProvider><BrowserRouter><Suspense fallback={<Loading />}><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<Protected />}><Route element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="applications" element={<Applications />} />
      <Route element={<RoleProtected roles={applicationApplicantRoles} />}><Route path="applications/new" element={<ApplicationForm />} /><Route path="applications/:id/edit" element={<ApplicationForm />} /></Route>
      <Route path="applications/:id" element={<ApplicationDetail />} />
      <Route element={<RoleProtected roles={approvalRoles} />}><Route path="approvals" element={<Approvals />} /></Route>
      <Route element={<RoleProtected roles={allApplicationRoles} />}><Route path="all" element={<Applications all />} /></Route>
      <Route element={<RoleProtected roles={organizationRoles} />}><Route path="organization" element={<Organization />} /></Route>
      <Route element={<RoleProtected roles={auditRoles} />}><Route path="audit" element={<Audit />} /></Route>
      <Route path="*" element={<NotFound />} />
    </Route></Route>
  </Routes></Suspense></BrowserRouter></AuthProvider>;
}
