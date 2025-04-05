import { Layout as LayoutAnt, theme } from "antd";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../Pages/Dashboard";
import Calls from "../Pages/Calls";
import PatientsPage from "../Pages/Patients";
import ClientsPage from "../Pages/Clients";
import ServiceCarsPage from "../Pages/ServiceCars";
import UsersPage from "../Pages/Users";
import CrewTabPage from "../Pages/Crew";
import SchedulingPage from "../Pages/Scheduling";
import ProfilePage from "../Pages/Users/ListProfile";
import FormProfilePage from "../Pages/Users/FormProfile";
import { authorizedAccess } from "../services/utils";
import PageNotFound from "../Pages/Errors/PageNotFound";
import ActiveCallDetails from "../components/Calls/activeCalls/activeCallDetails";
import MissedCallDetails from "../components/Calls/missedCalls/MissedCallDetails";

const { Content } = LayoutAnt;

export default function ContentCustom({
  content,
  modulePermissions = [],
}: any) {
  const verifyAuthorizedAccess = (permissions: string[]) =>
    authorizedAccess(modulePermissions, permissions);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Content style={{ background: "#F5F5F5" }}>
      <Routes>
        {verifyAuthorizedAccess(["dashboard-dashboard:read", "dashboard-dashboard:write"]) && (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </>
        )}
        {verifyAuthorizedAccess(["calls-calls:read", "calls-calls:write"]) && (
          <>
            <Route path="/calls" element={<Calls />} />
            <Route path="/calls/:id" element={<ActiveCallDetails />} />
            <Route path="/calls/missed/:id" element={<MissedCallDetails />} />
          </>
        )}
        {verifyAuthorizedAccess(["patients-patients:read", "patients-patients:write"]) && (
          <>
            <Route path="/manager/utente" element={<PatientsPage />} />
          </>
        )}
        {verifyAuthorizedAccess(["clients-clients:read", "clients-clients:write"]) && (
          <>
            <Route path="/manager/client" element={<ClientsPage />} />
          </>
        )}
        {verifyAuthorizedAccess([
          "asm_schedule-asm_schedule:read", "asm_schedule-asm_schedule:write",
          "asm_schedule-asm_schedule_feedback:read", "asm_schedule-asm_schedule_feedback:write",
          "asm_schedule-asm_schedule_canceled:read", "asm_schedule-asm_schedule_canceled:write"
        ]) && (
          <>
            <Route path="/scheduling" element={<SchedulingPage />} />
          </>
        )}
        {verifyAuthorizedAccess(["users-users:read", "users-users:write"]) && (
          <>
            <Route path="/manager/user" element={<UsersPage />} />
          </>
        )}
        {//verifyAuthorizedAccess(["crew-crew:read", "crew-crew:write"]) && (
          <>
            <Route path="/crew" element={<CrewTabPage />} />
          </>
        //)
        }
        {verifyAuthorizedAccess(["users-users:read", "users-users:write"]) && (
          <>
            <Route path="/manager/user/profile" element={<ProfilePage />} />
            <Route
              path="/manager/user/profile/:id/edit"
              element={<FormProfilePage action="edit" />}
            />
            <Route
              path="/manager/user/profile/create"
              element={<FormProfilePage action="create" />}
            />
          </>
        )}

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Content>
  );
}
