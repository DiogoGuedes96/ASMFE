import { useEffect, useState } from "react";
import { Layout as LayoutAnt, Menu } from "antd";
import {
  HomeOutlined,
  PhoneOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  CarOutlined,
  BankOutlined,
  MedicineBoxOutlined,
  AlertOutlined
} from "@ant-design/icons";
import { useQuery } from "react-query";
import DrawerSchedule from "../components/schedule/DrawerSchedule";
import ModalAlertEvent from "../components/schedule/ModalAlertEvent";
import { listCurrentMinute } from "../services/schedule.service";
import { useNavigate } from "react-router-dom";
const { Sider } = LayoutAnt;

const routes = [
  {
    key: "dashboard",
    url: "/dashboard",
    icon: <HomeOutlined />,
    label: "Dashboard",
    permissions: ['dashboard-dashboard:read', 'dashboard-dashboard:write'],
  },
  {
    key: "scheduling",
    url: "/scheduling",
    icon: <CalendarOutlined />,
    label: "Agendamento",
    permissions: ['asm_schedule-asm_schedule:read', 'asm_schedule-asm_schedule:write', "asm_schedule-asm_schedule_feedback:read", "asm_schedule-asm_schedule_feedback:write", "asm_schedule-asm_schedule_canceled:read", "asm_schedule-asm_schedule_canceled:write"],
  },
  {
    key: "calls",
    url: "/calls",
    icon: <PhoneOutlined />,
    label: "Central Telefónica",
    permissions: ['calls-calls:read', 'calls-calls:write'],
  },
  {
    key: "manager/utente",
    url: "/manager/utente",
    icon: <MedicineBoxOutlined />,
    label: "Gerir Utentes",
    permissions: ['patients-patients:read', 'patients-patients:write'],
  },
  {
    key: "manager/client",
    url: "/manager/client",
    icon: <BankOutlined />,
    label: "Gerir Clientes",
    permissions: ['clients-clients:read', 'clients-clients:write'],
  },
  {
    key: "crew",
    url: "/crew",
    icon: <AlertOutlined />,
    label: "Gerir Tripulantes",
    permissions: ['clients-clients:read', 'clients-clients:write'],
  },
  {
    key: "manager/user",
    url: "/manager/user",
    icon: <UsergroupAddOutlined />,
    label: "Gerir Utilizadores",
    permissions: ['users-users:read', 'users-users:write'],
  },
];

export default function SiderCustom({ modulePermissions, collapsed, setTitle }: any) {
  const navigate = useNavigate();

  const [currentKey, setCurrentKey]: any = useState(null);
  const [currentComponent, setCurrentComponent] = useState(null);
  const [oldCurrentKey, setOldCurrentKey] = useState(null);
  const [isOnlyModule, setIsOnlyModule] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [authorizedRoutes, setAuthorizedRoutes] = useState<any[]>([]);

  const filterAuthorizedRoutes = (routes: any[]) => {
    return routes.filter((route: any) => {
      if (route?.children?.length) {
        route.children = filterAuthorizedRoutes(route.children);

        if (route.children.length) {
          return route;
        }
      }

      if (route?.permissions?.some((permission: string) => modulePermissions.includes(permission))) {
        return route;
      }
    });
  };

  useEffect(() => {
    if (modulePermissions.length) {
      if (Object.keys(modulePermissions).length === 1) {
        let [module, permission] = Object.keys(modulePermissions)[0].split('-');

        const onlyRoute: any = routes.find(route => route.key === module);

        if (onlyRoute) {
          setIsOnlyModule(true);
          setCurrentKey(onlyRoute.key);
          goToModule(onlyRoute.key);
        }
      } else {
        setAuthorizedRoutes(filterAuthorizedRoutes(routes));
      }
    }
  }, [modulePermissions]);

  const findRouteByPathname = (pathname: String, items: any) => {
    let routeFound = items.find((route: any) => pathname == route.url);

    if (!routeFound) {
      for (let route of items) {
        if (route.children && route.children.length) {
          routeFound = findRouteByPathname(pathname, route.children);

          if (routeFound) {
            routeFound.childLabel = [route.label, routeFound.label].join(' / ');
            return routeFound;
          }
        }
      }
    }

    return routeFound;
  }

  useEffect(() => {
    if (window.location.pathname) {
      let pathname = window.location.pathname;

      let splittedPathname = pathname.substring(1).split('/');

      if (splittedPathname.length > 2) {
        pathname = '/' + splittedPathname.slice(0, 2).join('/');
      }

      let routeFound = findRouteByPathname(pathname, authorizedRoutes);

      if (routeFound) {
        setTitle(routeFound.childLabel || routeFound.label);
        delete routeFound.childLabel;
        setCurrentKey(routeFound.key);
      }
    }
  }, [window.location.pathname]);

  const goToModule = (key: string) => {
    if (!window.location.href.includes(key)) {
      navigate(key);
    }
  };

  const closeSchedule = () => {
    setCurrentKey(oldCurrentKey);
    setCurrentComponent(null);
  };

  function MenuComponent({ routes, ...props }: any) {
    return (
      <Menu
        onClick={({ key }) => {
          const componentRoute = routes.find((route: any) => {
            return route.key === key;
          });

          setTitle(componentRoute.label);

          if (componentRoute?.component) {
            setCurrentComponent(componentRoute.component);
            setOldCurrentKey(currentKey);
            setCurrentKey(key);
            return;
          }

          setCurrentKey(key);
          navigate(key);
        }}
        defaultSelectedKeys={[currentKey]}
        items={routes.map((route: any) => {
          return {
            key: route.key,
            icon: route.icon,
            label: route.label,
          };
        })}
      />
    );
  }

  const closeModalAlertEvent = () => {
    setCurrentReminder(null);
  };

  return (
    <>
      {!isOnlyModule && (
        <>
          <Sider
            collapsible
            collapsed={collapsed}
            trigger={null}
            style={{ background: "#030852" }}
          >
            {!collapsed ? (
              <a href="/" className="nav-link">
                <img
                  src="/santamonica.png"
                  className="client_logo"
                  alt="logo"
                />
              </a>
            ) : (
              <div style={{ marginTop: 69 }}></div>
            )}

            <MenuComponent routes={authorizedRoutes} />
          </Sider>
          <DrawerSchedule
            open={currentComponent === "DrawerSchedule"}
            onclose={closeSchedule}
          />
          <ModalAlertEvent
            open={currentReminder !== null}
            event={currentReminder}
            close={closeModalAlertEvent}
          />
        </>
      )}
    </>
  );
}
