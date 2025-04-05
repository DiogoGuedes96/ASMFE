import { Button, Col, Form, Input, Row, Select } from "antd";
import { useState } from "react";
import { EnumContactReason } from "../../../Enums/ActiveCalls.enums";
import { REQUIRED_FIELD_LABEL, isWhitespace } from "../../../services/utils";
import { ActiveCallsDrawerProps } from "../../../Interfaces/ActiveCalls.interfaces";
import ReturnButton from "../../Commons/Buttons/return-button.components";
import { useMutation } from "react-query";
import { AlertService } from "../../../services/alert.service";
import { updateCall } from "../../../services/calls.service";
const { TextArea } = Input;

export default function NotScheduleDrawer({ user, selectedCall, form, close }: ActiveCallsDrawerProps) {
    const [notScheduleOtherReason, setNotScheduleOtherReason] = useState(false);

    const updateCallReason = (frmdetails: {}) => updateCall(frmdetails);
    const { mutate: mutateUpdateCallReason } = useMutation(updateCallReason, {
        onSuccess: () => {
            close(true)
        },
        onError: () => {
            close(true)
        }
    });

    const handleOptionChange = (value: string) => {
        if (value != 'other') {
            setNotScheduleOtherReason(false)
        } else {
            setNotScheduleOtherReason(true)
        }
    };


    const handleSubmitNotScheduleForm = () => {
        form.validateFields().then((values: any) => {
            const data = {
                id: selectedCall.id,
                call_operator: user?.id,
                call_reason: values.not_schedule_reason == 'other' ? values.not_schedule_other_reason : EnumContactReason[values.not_schedule_reason as keyof typeof EnumContactReason],
            }

            updateCall(data);
            close();
        }).catch((error) => {

        });
    }

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <div>
                    <Row gutter={[16, 16]}>
                        <Form
                            form={form}
                            layout="vertical"
                            style={{ width: "100%" }}
                            autoComplete="off"
                        >
                            <Col>
                                <Form.Item
                                    label="Selecione um motivo"
                                    name="not_schedule_reason"
                                    rules={[
                                        {
                                            required: true,
                                            message: REQUIRED_FIELD_LABEL,
                                        },
                                    ]}
                                >

                                    <Select
                                        placeholder="Seleciona"
                                        onChange={handleOptionChange}>
                                        {Object.keys(EnumContactReason).map(key => (
                                            <Select.Option key={key} value={key}>
                                                {EnumContactReason[key as keyof typeof EnumContactReason]}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            {
                                notScheduleOtherReason &&
                                <Col>
                                    <Form.Item
                                        label="Observações"
                                        name="not_schedule_other_reason"
                                        rules={[
                                            {
                                                required: true,
                                                message: REQUIRED_FIELD_LABEL
                                            },
                                            {
                                                validator(_, value) {
                                                    if (value && isWhitespace(value)) {
                                                        return Promise.reject('Insira uma observação válida.');
                                                    }
                                                    return Promise.resolve();
                                                },
                                            }
                                        ]}
                                    >
                                        <TextArea autoSize={{ minRows: 3, maxRows: 5 }} showCount
                                            maxLength={50} />
                                    </Form.Item>
                                </Col>
                            }
                        </Form>
                    </Row>
                </div>
                <div>
                    <Row style={{ marginTop: 16 }}>
                        <Col span={24}>
                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={() => handleSubmitNotScheduleForm()}
                            >
                                Gravar
                            </Button>
                            <ReturnButton closeDrawer={close} />
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
}