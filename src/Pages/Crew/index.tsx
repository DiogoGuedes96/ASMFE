import { Tabs } from "antd";
import CrewPage from "./crew";
import GroupPage from "./group";
import ProfilePermissionService from "../../services/profilePermissions.service";
const profilePermissionService = ProfilePermissionService.getInstance();


export default function CrewTabPage() {

    const items = [];
    if (profilePermissionService.hasPermission(["asm_schedule-asm_schedule:read", "asm_schedule-asm_schedule:write"])) {
        items.push({
            key: 'crew',
            label: 'Tripulantes',
            children: <CrewPage />,
        });
    }
    if (profilePermissionService.hasPermission(["asm_schedule-asm_schedule_feedback:read", "asm_schedule-asm_schedule_feedback:write"])) {
        items.push({
            key: 'group',
            label: 'Grupo',
            children: <GroupPage />
        });
    }

    return (
        <Tabs
            tabBarStyle={{
                backgroundColor: '#FFF',
                padding: '8px 52px 0px 52px',
                color: '#000',
            }}
            defaultActiveKey="1"
            destroyInactiveTabPane={true}
            items={items}
        />
    )
}
