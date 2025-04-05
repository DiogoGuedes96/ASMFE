import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Alert,
  Image,
  Space,
  Typography,
  Checkbox,
  Divider,
} from "antd";
import { authenticate } from "../../services/user.service";

const logo = require("../../assets/images/logotype-fake.svg")

export default function Left() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { Title, Text } = Typography;

  const onFinish = async (values: any) => {
    setLoading(true);
    const login = await authenticate(values);

    if (login?.success && login?.user?.token) {
      await localStorage.setItem("user", JSON.stringify(login.user));

      return window.location.replace("/");
    }

    setError(true);
    setLoading(false);
    return false;
  };

  const onFinishFailed = (errorInfo: any) => {
    setError(true);
  };

  return (
    <Space
      direction="vertical"
      size="large"
      style={{
        display: "flex",
        width: "328px",
        margin: "auto",
        padding: "auto",
      }}
    >
      <Image
        preview={false}
        width={100}
        src="/logotype-fake.svg"
        style={{
          margin: "auto",
        }}
      />

      <Title level={2}>
        Login{" "}
        <Text type="warning" underline strong>
          __
        </Text>
      </Title>
      <Text>Insira seus dados para aceder a sua conta</Text>
      {error && (
        <Alert
          message="Erro ao fazer login"
          type="error"
          showIcon
          banner
          closable
        />
      )}
      <Form
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          name="email"
          label="E-Mail"
          rules={[
            {
              required: true,
              message: "Por favor insira um e-mail válido!",
            },
          ]}
        >
          <Input key="email_input" id="email_input" size="large" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              message: "Por favor insira uma password válida!",
            },
          ]}
        >
          <Input.Password
            key="password_input"
            id="password_input"
            size="large"
          />
        </Form.Item>
        <Form.Item>
          <Checkbox>Manter-me conectado</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
          >
            <Text>Entrar</Text>
          </Button>
        </Form.Item>
      </Form>
      <Text
        type="secondary"
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        © Copyrights, 2023 Todos os direitos reservados
      </Text>
    </Space>
  );
}
