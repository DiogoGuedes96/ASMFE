import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import Layout from "./Layout/Layout";
import Login from "./Pages/Login/login";
import { ConfigProvider } from "antd";
import ptPT from 'antd/lib/locale/pt_PT';
import './laravel-echo';

export default function App({ children, header }: any) {
  const queryClient = new QueryClient();
  const userStorage = localStorage.getItem("user") || null;
  const [user] = useState(userStorage ? JSON.parse(userStorage) : null);

  return (
    <ConfigProvider
      locale={ptPT}
      theme={{
        token: {
          colorPrimary: "#597EF7",
        },
        components: {
          Button: {
          },
          Menu: {
            itemSelectedBg: '#597EF7',
            itemSelectedColor: '#ffffff',
            itemHoverColor: '#597ef7',
            itemBg: '#030852',
            itemColor: '#ffffff',
          }
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        {!user ? <Login /> : <Layout />}
      </QueryClientProvider>
    </ConfigProvider>
  );
}
