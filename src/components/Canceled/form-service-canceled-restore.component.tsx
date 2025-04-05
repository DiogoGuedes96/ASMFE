import { Alert, Button, Col, Form, Input, Row, Space, Typography } from "antd";
import DisplayAlert from "../Commons/Alert";
import Title from "antd/lib/typography/Title";
import ReturnButton from "../Commons/Buttons/return-button.components";
import { useEffect, useState } from "react";
import moment from "moment";
import { EnumTransportFeature } from "../../Enums/TransportFeature";
import { EnumTypeService } from "../../Enums/TypeService";
import { EnumTypePaymentMethods } from "../../Enums/TypePaymentMethods";
import { restoreCanceledSchedule } from "../../services/serviceScheduling.service";
import { useMutation } from "react-query";
import { EnumCallsReason } from "../../Enums/callReason.enums";
const { Text } = Typography;
interface formCanceling {
    close: any,
    isEdit?: boolean
    canceledSchedule: any,
    refetchServiceScheduling: () => void,
    sendAlert: (alert: any) => void
    cleanFilters: () => void
}

export default function FormServiceCanceledRestoreComponent({ close, canceledSchedule, refetchServiceScheduling, sendAlert, cleanFilters }:formCanceling) {
    const [form] = Form.useForm();
    const dateFormat = "DD/MM/YYYY";
    const timeFormat = "HH:mm";
    const [canRestore, setCanRestore] = useState<boolean>(false);


    const { mutate: mutateRestoreSchedule } = useMutation(restoreCanceledSchedule, {
        onSuccess: () => {
            sendAlert([{ text: 'Agendamento restaurado com sucesso.' }])
            cleanFilters();
            refetchServiceScheduling();
            close();
        }
    });

    useEffect(() => {
        if (canceledSchedule && Object.keys(canceledSchedule).length > 0) {
            let formValues: Record<string, any> = {};
            console.info(canceledSchedule);
            formValues = {
                id: canceledSchedule.id,
                call_reason: EnumCallsReason[canceledSchedule.reason as keyof typeof EnumCallsReason],
                operator: canceledSchedule.user?.name,
                additional_note: canceledSchedule.additional_note,
                transport_feature: EnumTransportFeature[canceledSchedule?.transport_feature as keyof typeof EnumTransportFeature],
                service_type: EnumTypeService[canceledSchedule.service_type as keyof typeof EnumTypeService],
                patient_name: canceledSchedule.patient?.name,
                patient_number: canceledSchedule.patient?.patientNumber,
                patient_email: canceledSchedule.patient?.email,
                patient_nif: canceledSchedule.patient?.nif,
                patient_contact: canceledSchedule.patient?.phoneNumber,
                time: moment(canceledSchedule.time, 'HH:mm:ss').format(timeFormat),
                date: moment(canceledSchedule.date).format(dateFormat),
                origin: canceledSchedule.origin,
                destiny: canceledSchedule.destination,
                vehicle: canceledSchedule.vehicle,
                vehicle_registration: canceledSchedule.license_plate,
                client: canceledSchedule.client?.name,
                responsible_tats_1: canceledSchedule.responsible_tats_1,
                responsible_tats_2: canceledSchedule.responsible_tats_2,
                total_value: canceledSchedule.total_value,
                companion: canceledSchedule.companion_name ? 'Sim' : 'Não',
                companion_name: canceledSchedule.companion_name,
                companion_contact: canceledSchedule.companion_contact,
                payment_mode: EnumTypePaymentMethods[canceledSchedule.payment_method as keyof typeof EnumTypePaymentMethods],
            };

            handleRestoreSchedule();

            form.setFieldsValue(formValues);
        }
    }, [canceledSchedule])

    const handleRestoreSchedule = () => {
        if (canceledSchedule){
            const date = moment(canceledSchedule.date).format(dateFormat);
            const combinedDateTime = moment(`${date} ${canceledSchedule.time}`, 'DD/MM/YYYY HH:mm:ss');
            const currentDateTime = moment();

            const isPast = combinedDateTime.isBefore(currentDateTime);

            if (!isPast) {
                setCanRestore(true);
            }
        }
    }
    const validationIfHasCreditsAndRepeat = !canceledSchedule.patient?.credits && canceledSchedule.repeat_id;
    return (
        <Form
        form={form}
        layout="vertical"
        >
        <Row gutter={[16, 16]}>
            <Col span={24}>
                <div style={{width: '100%'}}>
                    <DisplayAlert show={["warning", "error"]}/>
                </div>
                {(validationIfHasCreditsAndRepeat) && (
                    <Space direction="vertical" style={{ width: '100%' }}>
                            <Alert
                                message="Sem crédito"
                                description="Não é possível restaurar este agendamento, pois não existe crédito disponível."
                                type="warning"
                                showIcon
                            />
                    </Space>
                )}
            </Col>
        </Row>
        <Row gutter={[16,16]}>
            <Col span={24} style={{ marginBottom: 16 }}>
                <Title level={5}>Informações da chamada</Title>
            </Col>
            <Col span={8}>
                <Form.Item
                    name="call_reason"
                    label="Motivo da Chamada"
                >
                    <Input size="large" disabled />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    name="operator"
                    label="Operador"
                >
                    <Input size="large" disabled/>
                </Form.Item>
            </Col>
            <Col span={8}>
            <Form.Item
                    name="additional_note"
                    label="Nota Adicional"
                >
                    <Input size="large" disabled/>
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={[16,16]}>
            <Col span={24} style={{ marginBottom: 16 }}>
                <Row gutter={[16,16]}>
                    <Col span={24}>
                        <Title level={5}>Informações do utente</Title>
                    </Col>
                    <Col span={16}>
                        <Form.Item
                            name="patient_name"
                            label="Nome do utente"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="patient_number"
                            label="Nº Utente"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={8}>
                        <Form.Item
                            name="patient_email"
                            label="Email"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="patient_nif"
                            label="NIF"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="patient_contact"
                            label="Contacto"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row gutter={[16,16]}>
            <Col span={24} style={{ marginBottom: 16 }}>
                <Row gutter={[16,16]}>
                    <Col span={24}>
                        <Title level={5}>Informações do agendamento</Title>
                    </Col>
                    <Col span={16}>
                        <Form.Item
                            name="transport_feature"
                            label="Caracteristicas do transporte"
                        >
                            <Input size="large" disabled />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="service_type"
                            label="Tipo de Serviço"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={8}>
                        <Form.Item
                            name="date"
                            label="Data"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="time"
                            label="Hora"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={24}>
                        <Form.Item
                            name="origin"
                            label="Origem"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="destiny"
                            label="Destino"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={8}>
                        <Form.Item
                            name="vehicle"
                            label="Viatura"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="vehicle_registration"
                            label="Matrícula"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="client"
                            label="Cliente"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={12}>
                        <Form.Item
                            name="responsible_tats_1"
                            label="Responsável TAT's 1"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="responsible_tats_2"
                            label="Responsável TAT's 2"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={8}>
                        <Form.Item
                            name="companion"
                            label="Acompanhante"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="companion_name"
                            label="Nome Acompanhante"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="companion_contact"
                            label="Contacto Acompanhante"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16,16]}>
                    <Col span={16}>
                        <Form.Item
                            name="payment_mode"
                            label="Método de pagamento"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="total_value"
                            label="Valor"
                        >
                            <Input size="large" disabled/>
                        </Form.Item>
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
            <Col span={24}>
                <Button type="primary" block size="large" disabled={!canRestore || validationIfHasCreditsAndRepeat} onClick={() => mutateRestoreSchedule({ id:canceledSchedule?.id })}>
                    {canRestore ? 'Restaurar agendamento' : 'Não é possível restaurar um agendamento passado.'}
                </Button>
                <ReturnButton closeDrawer={close} />
            </Col>
        </Row>
    </Form >
)
}
