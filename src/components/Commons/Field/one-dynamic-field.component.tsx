import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row, Space } from "antd";
import { useEffect, useState } from "react";
interface PatientFieldsProps {
    textFieldName: string
    linkText: string
    DynamicFieldsNumber?: any
    edit?:any
    maxlength:any
}
export default function OneDynamicField(props: PatientFieldsProps) {
    const [fieldsAdd, setFieldsAdd] = useState<any>([]);
    const [numberFields, setNumberFields] = useState(1);
    const AddFields = () => {
        setFieldsAdd([...fieldsAdd, numberFields]);
        setNumberFields(numberFields + 1);
    }

    useEffect(() => {
        if (props.DynamicFieldsNumber) {
            setNumberFields(props.DynamicFieldsNumber[props.DynamicFieldsNumber.length - 1] + 1 );
            setFieldsAdd(props.DynamicFieldsNumber);
        }
    }, [])

    const RemoveFields = (valueToRemove: any) => {
        const updatedFields = fieldsAdd.filter((item: any) => item !== valueToRemove);
        setFieldsAdd(updatedFields);
    }

    return (
        <Row>
            <Col span={24}>
                {
                    fieldsAdd.map((key: any) => (
                        <div key={key}>
                            <Form.Item
                                label={props.textFieldName}
                                name={`dynamic_id_${key}`}
                                style={{display: 'none'}}
                                initialValue={key}
                            >
                                <Input />
                            </Form.Item>

                            <div style={{ display: "flex", width:'100%'}}>
                                <Row style={{width: '100%'}}>
                                    <Col span={fieldsAdd.length >= 2 ? 23 : 24}>
                                        <Form.Item
                                            label={props.textFieldName}
                                            name={`dynamic_name_${key}`}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Campo obrigatório",
                                                },
                                            ]}
                                        >
                                            <Input style={{ width: "100%" }} maxLength={props.maxlength} showCount/>
                                        </Form.Item>
                                    </Col>
                                    {fieldsAdd.length >= 2 && (
                                        <Col span={1}>
                                           <Button
                                                style={{ marginTop: '30px',
                                                    marginLeft: '10px' }}
                                                type="default"
                                                shape="circle"
                                                icon={<DeleteOutlined />}
                                                size="middle"
                                                onClick={() => RemoveFields(key)}
                                            />
                                        </Col>

                                    )}
                                </Row>
                            </div>
                        </div>
                    ))
                }
                <div className="add_patient_responsible" onClick={AddFields}>
                    <PlusOutlined />
                    <p>{props.linkText}</p>
                </div>
            </Col>
        </Row>
    )
}
