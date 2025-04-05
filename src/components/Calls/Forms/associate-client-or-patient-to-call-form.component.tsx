import { Button, Col, Form, Input, Row, Typography, Divider, Empty, Spin } from "antd";
import { useState } from "react";
import { useMutation } from "react-query";

import { ActiveCallsDrawerProps } from "../../../Interfaces/ActiveCalls.interfaces";

import { editClient, getAllClients } from "../../../services/client.service";
import { addPatientResponsible, patientList } from "../../../services/patient.service";
import { REQUIRED_FIELD_LABEL } from "../../../services/utils";
import ReturnButton from "../../Commons/Buttons/return-button.components";
import { ASSOCIATE_CLIENT_CALL_REASON, ASSOCIATE_PATIENT_CALL_REASON, CLIENT_ENTITY, PATIENT_ENTITY, handlePhoneToUse } from "../../../services/calls.service";
import { AlertService } from "../../../services/alert.service";

const { Text } = Typography;

export default function AssociateClientOrPatientDrawer({ activeCallDetails, selectedCall,  form, entity, close }: ActiveCallsDrawerProps) {
    const userLogged: any = localStorage.getItem('user');
    const [user] = useState(localStorage.getItem('user') ? JSON.parse(userLogged) : null);
    const [entityList, setEntityList] = useState<any>({});

    const patientResponsible = (frmdetails: {}) => addPatientResponsible(frmdetails);
    const { mutate: mutateAddPatientResponsible } = useMutation(patientResponsible, {
        onSuccess: () => {
            close(true, true)
            AlertService.sendAlert([{ text: "Utente associado com sucesso." }]);
        },
        onError: () => {
            close()
        }
    });

    const editedClient = (frmdetails: {}) => editClient(frmdetails);
    const { mutate: mutateEditClient } = useMutation(editedClient, {
        onSuccess: () => {
            close(true, true)
            AlertService.sendAlert([{ text: "Cliente associado com sucesso." }]);
        },
        onError: () => {
            close()
        }
    });


    const { mutate: mutateGetClients, isLoading: isLoadingGetClients } = useMutation(getAllClients, {
        onSuccess: (data) => {
            if (data?.data.length) {
                setEntityList(data?.data);
            } else {
                setEntityList({ empty: true });
            }
        }
    });

    const { mutate: mutateGetPatients, isLoading: isLoadingGetPatients } = useMutation(patientList, {
        onSuccess: (data) => {
            if (data?.data.length) {
                setEntityList(data?.data);
            } else {
                setEntityList({ empty: true });
            }
        }
    });

    const handleSearchEntity = async (value: string) => {

        const timeout = setTimeout(() => {
            if (value !== value) {
                clearTimeout(timeout);
            } else {
                searchEntity(value);
            }
        }, 1000)
    }

    const searchEntity = (value: string) => {
        if (!value) {
            setEntityList({});
            return;
        }

        switch (entity) {
            case "Utente":
                mutateGetPatients({ search: value });
                break;
            case "Cliente":
                mutateGetClients({ search: value });
                break;
            default:
                break;
        }
    }

    const handleAssociateClientOrPatient = (entityData: any, entity: any) => {
        form.validateFields().then((formValues: any) => {
            entityData.responsibles = [{
                "name": formValues?.name,
                "phone": handlePhoneToUse(activeCallDetails),
                "phoneNumber": handlePhoneToUse(activeCallDetails),
            },
            ...entityData.responsibles
            ];

            selectedCall.call_operator = user?.id;

            switch (entity) {
                case CLIENT_ENTITY:
                    selectedCall.call_reason = ASSOCIATE_CLIENT_CALL_REASON;
                    mutateEditClient(entityData);
                    break;
                case PATIENT_ENTITY:
                    selectedCall.call_reason = ASSOCIATE_PATIENT_CALL_REASON;
                    mutateAddPatientResponsible(entityData);
                    break;
                default:
                    break;
            }

            close();
        }).catch((error) => {
            console.log('error', error);

        });
    }

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <div>
                    <Form
                        form={form}
                        layout="vertical"
                        style={{ width: "100%" }}
                        autoComplete="off"
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    label="Nome do Responsável"
                                    name="name"
                                    rules={[
                                        {
                                            required: true,
                                            message: REQUIRED_FIELD_LABEL,
                                        },
                                    ]}
                                >
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Text>{`Pesquisar ${entity}`}</Text>
                                <Input
                                    allowClear={true}
                                    size="large"
                                    onChange={(e) => handleSearchEntity(e.target.value)}
                                />
                            </Col>
                            <Col span={24}>
                                {Object.keys(entityList).length !== 0 && entityList.empty !== true &&
                                    entityList.map((entityData: any) => {
                                        return (
                                            <>
                                                <div key={entityData?.name} style={{ marginTop: 32, width: '100%', color: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ marginLeft: 10 }} >
                                                        <Text style={{ fontSize: 20, fontWeight: 600 }}>{entityData?.name}</Text>
                                                        <p style={{ color: '#8C8C8C' }}>Contacto: {'(+351)'} {entityData?.phone}{entityData?.phoneNumber}</p>
                                                        {
                                                            entityData?.patientNumber &&
                                                            <p style={{ color: '#8C8C8C' }}>Nº Utente: {entityData?.patientNumber}</p>
                                                        }
                                                    </div>
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        onClick={() => handleAssociateClientOrPatient?.(entityData, entity)}
                                                    >
                                                        {`Associar ${entity}`}
                                                    </Button>
                                                </div>
                                                <Divider />
                                            </>
                                        )
                                    })
                                }
                            </Col>
                            {entityList.empty === true &&
                                <Col span={24} style={{ marginTop: 32 }}>
                                    <Empty description={'Não foram encontrados resultados para a pesquisa!'} />
                                </Col>
                            }
                            {(isLoadingGetClients || isLoadingGetPatients) &&
                                <Col span={24} style={{ display: 'flex', alignContent: 'center', justifyContent: 'center', marginTop: 32 }}>
                                    <Spin />
                                </Col>
                            }
                        </Row>
                    </Form>
                </div>
                <div>
                    <Row style={{ marginTop: 16 }}>
                        <Col span={24}>
                            <ReturnButton closeDrawer={close} />
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
}
