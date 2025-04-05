import { Button, Layout as LayoutAnt, theme } from "antd";
import { Typography } from "antd";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Header } = LayoutAnt;

export default function HeaderCustom({
  title,
  user,
  collapsed,
  toggleCollapsed,
}: any) {
  return (
    <Header
      style={{
        background: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0px 4px 6px -2px rgba(0, 0, 0, 0.2)",
        zIndex: 1,
      }}
    >
      <Button
        onClick={toggleCollapsed}
        style={{
          position: "relative",
          zIndex: "9999",
          marginLeft: "-68px",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          padding: "0px",
          border: "0px",
        }}
      >
        {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
      </Button>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center"
      }}>
        <Title style={{ marginTop: 0, marginBottom: 0 }} level={4}>
          {title}
        </Title>
        <div>
          <Text style={{ paddingRight: 10 }}>{user?.name}</Text>
          <a href="/login" onClick={() => localStorage.removeItem("user")}>
            <LogoutOutlined /> sair
          </a>
        </div>
      </div>
    </Header>
  );
}
