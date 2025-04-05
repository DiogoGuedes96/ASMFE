import { DatePicker, Form, FormInstance, Input } from "antd";

interface SearchAnsweredCallsProps {
  form: FormInstance;
  footer: any
}

export default function SearchAnsweredCalls({ form, footer }: SearchAnsweredCallsProps) {
  return (
    <>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: "8px",
        }}
      >
        <Form.Item
          name="search"
          label="Pesquisar"
          colon={false}
          style={{ marginBottom: 0 }}
        >
          <Input size="large" placeholder="Pesquisar por nome"/>
        </Form.Item>
        <Form.Item
          name="searchStartDate"
          label="Data início"
          colon={false}
          style={{ marginBottom: 0 }}
        >
          <DatePicker size="large" placeholder="dd/mm/aaaa" format={"DD/MM/YYYY"}/>
        </Form.Item>
        <Form.Item
          name="searchEndDate"
          label="Data fim"
          colon={false}
          style={{ marginBottom: 0 }}
        >
          <DatePicker size="large" placeholder="dd/mm/aaaa" format={"DD/MM/YYYY"}/>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          {footer}
        </Form.Item>
      </Form>
    </>
  );
}
