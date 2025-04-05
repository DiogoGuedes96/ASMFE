import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row, Space } from "antd";
import { useEffect, useState } from "react";
import { REQUIRED_FIELD_LABEL, isWhitespace } from "../../../services/utils";
interface PatientFieldsProps {
    textFieldName: string
    phoneFieldName: string
    linkText: string
    DynamicFieldsNumber?: any
}
export default function TextPhoneDynamicFields(props: PatientFieldsProps) {
    const [fieldsAdd, setFieldsAdd] = useState<any>([]);
    const [numberFields, setNumberFields] = useState(1);
    const AddFields = () => {
        setFieldsAdd([...fieldsAdd, numberFields]);
        setNumberFields(numberFields + 1);
    }

    useEffect(() => {
        if (props.DynamicFieldsNumber && props.DynamicFieldsNumber.length > 0) {
            setNumberFields(props.DynamicFieldsNumber[props.DynamicFieldsNumber.length - 1] + 1 );
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
                            <Form.Item
                                label={props.textFieldName}
                                name={`dynamic_id_${key}`}
                                style={{display: 'none'}}
                                initialValue={key}
                            >
                                <Input />
                            </Form.Item>
                            <Col span={18}>
                                <Form.Item
                                    label={props.textFieldName}
                                    name={`dynamic_name_${key}`}
                                    rules={[
                                        {
                                            required: true,
                                            message: REQUIRED_FIELD_LABEL,
                                        },
                                        {
                                            validator(_, value) {
                                              if (value && isWhitespace(value)) {
                                                return Promise.reject('Insira nome válido.');
                                              }
                                              return Promise.resolve();
                                            },
                                          }
                                    ]}
                                >
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <Space>
                                        <Form.Item
                                            label={props.phoneFieldName}
                                            name={`dynamic_phone_number_${key}`}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: REQUIRED_FIELD_LABEL,
                                                },
                                                {
                                                    validator: (_, value) => {
                                                        if (value >= 0 && value?.toString()?.length < 9) {
                                                            return Promise.reject(`O ${props.phoneFieldName.toLowerCase()} deve 9 dígitos`);
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                }
                                            ]}
                                        >
                                            <InputNumber
                                                size="large"
                                                style={{ width: "100%" }} maxLength={11} parser={(value) => `${value}`.replace(/[^0-9]/g, '')}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} />
                                        </Form.Item>
                                        <Button
                                            style={{ marginTop: "5px" }}
                                            type="default"
                                            shape="circle"
                                            icon={<DeleteOutlined />}
                                            size="middle"
                                            onClick={() => RemoveFields(key)}
                                        />
                                    </Space>
                                </div>
                            </Col>
                        </ Row>
                    </div>
                ))
            }
            <Button
                className="secundary-button"
                style={{ marginBottom: 32}}
                size="large"
                block 
                onClick={AddFields}
              >
                <PlusOutlined />
                {props.linkText}
              </Button>
        </Col>
    )
}
