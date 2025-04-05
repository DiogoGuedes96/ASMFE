import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row, Select, Typography } from "antd";
import { useEffect, useState } from "react";
import { REQUIRED_FIELD_LABEL, isWhitespace } from "../../../services/utils";
import { useQuery } from "react-query";
import { getAllClients } from "../../../services/client.service";
interface ClientFieldsProps {
    textFieldName: string
    DynamicFieldsNumber?: any
}

const { Text } = Typography;
export default function AssociateClientDynamicFields(props: ClientFieldsProps) {
    const [fieldsAdd, setFieldsAdd] = useState<any>([]);
    const [numberFields, setNumberFields] = useState(1);
    const [clients, setClients] = useState<any>();

    const { isLoading: isLoadingClients } = useQuery(
        ["clients"],
        () => {
            return getAllClients({});
        },
        {
            refetchOnWindowFocus: false,
            onSuccess: (value) => {
                if (value?.data) {
                    setClients(value.data);
                }
            },
        }
    );
    const AddFields = () => {
        setFieldsAdd([...fieldsAdd, numberFields]);
        setNumberFields(numberFields + 1);
    }

    useEffect(() => {
        if (props.DynamicFieldsNumber && props.DynamicFieldsNumber.length > 0) {
            setNumberFields(props.DynamicFieldsNumber[props.DynamicFieldsNumber.length - 1] + 1);
            setFieldsAdd(props.DynamicFieldsNumber);
        }

    }, [])

    const RemoveFields = (valueToRemove: any) => {
        const updatedFields = fieldsAdd.filter((item: any) => item !== valueToRemove);
        setFieldsAdd(updatedFields);
    }

    return (
        <Col span={24}>
            {
                fieldsAdd.map((key: any) => (
                    <div key={key}>
                        <Row gutter={[16, 16]}>
                            <Col span={22}>
                                <Form.Item
                                    label="Cliente"
                                    name={`dynamic_entity_${key}`}
                                    rules={[
                                        {
                                            required: true,
                                            message: REQUIRED_FIELD_LABEL,
                                        },
                                    ]}
                                >
                                    <Select size="large" placeholder="Selecione">
                                        {clients &&
                                            clients.map((client: any) => (
                                                <Select.Option key={client.id} value={client.id}>
                                                    {client.name}
                                                </Select.Option>
                                            ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={2} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                <Button
                                    style={{ marginTop: "5px" }}
                                    type="default"
                                    shape="circle"
                                    icon={<DeleteOutlined />}
                                    size="middle"
                                    onClick={() => RemoveFields(key)}
                                />
                            </Col>
                        </ Row>
                    </div>
                ))
            }
            <Button
                className="secundary-button"
                style={{ marginBottom: 32 }}
                size="large"
                block
                onClick={AddFields}
            >
                <PlusOutlined />
                Associar a um cliente
            </Button>
        </Col>
    )
}
