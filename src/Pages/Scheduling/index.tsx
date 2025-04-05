import { Tabs } from "antd";
import FeedbackPage from "./feedback";
import ServicePage from "./servicesPage";
import CanceledPage from "./canceled";
import ProfilePermissionService from "../../services/profilePermissions.service";
const profilePermissionService = ProfilePermissionService.getInstance();


export default function SchedulingPage() {
    
    const items = [];
    if (profilePermissionService.hasPermission(["asm_schedule-asm_schedule:read", "asm_schedule-asm_schedule:write"])) {
        items.push({
            key: 'scheduling',
            label: 'Lista Agendamentos',
            children: <div className="content_page"><ServicePage /></div>,
        });
    }
    if (profilePermissionService.hasPermission(["asm_schedule-asm_schedule_feedback:read", "asm_schedule-asm_schedule_feedback:write"])) {
        items.push({
            key: 'compliment',
            label: 'Elogio/Reclamação',
            children: <div className="content_page"><FeedbackPage /></div>
        });
    }
    if (profilePermissionService.hasPermission(["asm_schedule-asm_schedule_canceled:read", "asm_schedule-asm_schedule_canceled:write"])) {
        items.push({
            key: 'calceled',
            label: 'Cancelados',
            children: <div className="content_page"><CanceledPage /></div>,
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
