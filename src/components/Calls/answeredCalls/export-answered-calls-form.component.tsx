import { Col, DatePicker, Form, FormInstance, Input, Row, Typography } from "antd";
import { REQUIRED_FIELD_LABEL } from "../../../services/utils";

const { Title } = Typography;

interface ExportAnsweredCallsProps {
    form: FormInstance;
}

const { RangePicker } = DatePicker;

export default function ExportAnsweredCalls({ form }: ExportAnsweredCallsProps) {
    return (
        <>
            <Row>
                <Col>
                    <Title style={{ marginTop: 0, marginBottom:32 }} level={5}>Chamadas atendidas</Title>
                </Col>
            </Row >
            <Row gutter={[16, 16]}>
                <Form
                    form={form}
                    layout="vertical"
                    style={{ width: "100%" }}
                    autoComplete="off"
                    initialValues={{ status: true }}
                >
                    <Col span={24}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item
                                    name='searchDateRange'
                                    label="Periodo para exportação"
                                    colon={false}
                                    rules={[
                                        {
                                          required: true,
                                          message: REQUIRED_FIELD_LABEL,
                                        }
                                    ]}
                                >
                                    <DatePicker.RangePicker
                                    
                                        size="large"
                                        placeholder={['Data inicial', 'Data final']}
                                        format="DD/MM/YYYY"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="search"
                                    label="Filtrar"
                                    colon={false}
                                >
                                    <Input size="large" placeholder="Filtrar por nome" />
                                </Form.Item>
                            </Col>
                        </ Row>
                    </Col>
                    <Col span={24}>
                        <Row gutter={[16, 16]}>

                        </Row>
                    </Col>
                </Form>
            </Row>
        </>
    );
}