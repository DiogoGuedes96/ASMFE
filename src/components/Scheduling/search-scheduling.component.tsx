import { DatePicker, Form, FormInstance, Input } from "antd";

interface SearchClientProps {
    form: FormInstance;
    footer: any
}

export default function SearchScheduling({ form, footer }: SearchClientProps) {
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
                    style={{ marginBottom: 0 }}
                    name="search"
                    label="Pesquisar"
                    colon={false}
                >
                    <Input placeholder="Pesquisar por nome ou nº utente" size="large" style={{ marginBottom: 0 }} />
                </Form.Item>
                <Form.Item
                    style={{ marginBottom: 0 }}
                    name="start_date"
                    label="Data início"
                    colon={false}
                >
                    <DatePicker size="large" format={"DD/MM/YYYY"} placeholder="dd/mm/aaaa"/>
                </Form.Item>
                <Form.Item
                    style={{ marginBottom: 0 }}
                    name="end_date"
                    label="Data fim"
                    colon={false}
                >
                    <DatePicker size="large" format={"DD/MM/YYYY"} placeholder="dd/mm/aaaa"/>
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                    {footer}
                </Form.Item>
            </Form>
        </>
    );
}
