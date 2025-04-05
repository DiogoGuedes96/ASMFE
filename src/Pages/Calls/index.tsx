import React from "react";
import { Tabs } from "antd";
import ActiveCalls from "../../components/Calls/activeCalls";
import AnsweredCalls from "../../components/Calls/answeredCalls";
import MissedCalls from "../../components/Calls/missedCalls";

export default function Calls() {
  const tabsItems = [
    {
      key: "1",
      label: `Chamadas ativas`,
      children: <ActiveCalls />,
    },
    {
      key: "2",
      label: `Atendidas`,
      children: <AnsweredCalls />,
    },
    {
      key: "3",
      label: `Não atendidas`,
      children: <MissedCalls />,
    },
  ];

  return (
    <div>
      <Tabs
        defaultActiveKey="1"
        items={tabsItems}
        tabBarStyle={{
          backgroundColor: "#FFF",
          padding: "8px 32px 0px 32px",
          color: "#000",
        }}
        style={{ zIndex: -1 }}
      />
    </div>
  );
}
