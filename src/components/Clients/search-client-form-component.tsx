import { Form, FormInstance, Input, Select, Row, Col } from "antd";
import { useState } from 'react';

interface SearchClientProps {
    form: FormInstance;
    footer: any
}

export default function SearchClient({ form, footer }: SearchClientProps) {
    const [statusValue, setStatusValue] = useState('all');
    const [typeValue, setTypeValue] = useState('all');

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
                gap: "8px",
            }}
            initialValues={{
                status: statusValue,
                type: typeValue
            }}
        >
            <Form.Item
                style={{ width: '30%', marginBottom: 0 }}
                name="search"
                label="Pesquisar"
                colon={false}
            >
                <Input style={{ marginBottom: 0 }} size="large" />
            </Form.Item>
            <Form.Item
                style={{ width: '15%', marginBottom: 0 }}
                name="status"
                label="Status"
                colon={false}
            >
                <Select
                    size="large"
                    placeholder="Selecionar"
                >
                    <Select.Option value="all">Todos</Select.Option>
                    <Select.Option value="1">Ativo</Select.Option>
                    <Select.Option value="0">Inativo</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item
                style={{ width: '15%', marginBottom: 0 }}
                name="type"
                label="Tipo de Cliente"
                colon={false}
            >
                <Select
                    size="large"
                    placeholder="Selecionar"
                >
                    <Select.Option value="all">Todos</Select.Option>
                    <Select.Option value="public">Público</Select.Option>
                    <Select.Option value="private">Privado</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item style={{ width: '10%', marginBottom: 0 }}>
                {footer}
            </Form.Item>
        </Form>
        </div>
    );
}
