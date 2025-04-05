import { Form, FormInstance, Input, Select } from "antd";
import { useState } from 'react';

interface SearchPatientProps {
  form: FormInstance;
  footer: any
}

export default function SearchPatient({ form, footer }: SearchPatientProps) {
  const [statusValue, setStatusValue] = useState('all');
  return (
    <div style={{ width: '100%' }}>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: "16px",
        }}
        initialValues={{
          status: statusValue
        }}
      >
        <Form.Item
          style={{ width: '30%', marginBottom: 0 }}
          name="search"
          label="Pesquisar"
          colon={false}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          style={{ marginBottom: 0, width: '200px' }}
          name="status"
          label="Status"
          colon={false}
        >
          <Select
            placeholder="Selecionar"
            size="large"
          >
            <Select.Option value="all">Todos</Select.Option>
            <Select.Option value="1">Ativo</Select.Option>
            <Select.Option value="0">Inativo</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          {footer}
        </Form.Item>
      </Form>
    </div>
  );
}
