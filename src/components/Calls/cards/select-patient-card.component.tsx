import { Row, Col, Divider, Typography, Button, Input, Empty } from 'antd';

import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { getPatientsFromClient, getPatientsFromResponsible } from '../../../services/patient.service';
import { SelectPatientCardProps } from '../../../Interfaces/ActiveCalls.interfaces';
import { CheckCircleOutlined, ExclamationCircleOutlined, RetweetOutlined, UserOutlined } from '@ant-design/icons';
import CardError from '../../Commons/Cards/card-error.compoenent';
import CardLoading from '../../Commons/Cards/card-loading.component';
import "../../../assets/css/cards.css";

const { Text, Title } = Typography;

export default function SelectPatientCard({ responsible, client, patient, handleSelectPatient, unSelectPatient }: SelectPatientCardProps) {
    const [patientList, setPatientList] = useState<any[] | undefined>(undefined);
    
    const { isLoading: isLoadingGetPatients, isError: isErrorGetPatients, refetch: refetchGetPatients, isFetching: isFetchingGetPatients } = useQuery(
        [client ? "getPatientsFromClient" : "getPatientsFromResponsible", client?.id || responsible?.id],
        () => {
            return handleQueryCall(client, responsible);
        },
        {
            refetchOnWindowFocus: false,
            onSuccess: async (data: any) => {
                setPatientList(data?.data);
            },
        }
    );

    const handleQueryCall = (clientId?: any, responsibleId?: any) => {
        if (responsible) {
            return responsible?.id ? getPatientsFromResponsible(responsible?.id) : null;
        } else if (clientId) {
            return client?.id ?  getPatientsFromClient(client?.id) : null;
        }
    }
    
    const handleUnSelectPatient = () => {
        unSelectPatient();
        setPatientList(undefined);
        refetchGetPatients();
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        if (value.trim() === '') {
            refetchGetPatients();
        } else {
            const filteredPatients = patientList?.filter((patient) =>
                patient.name.toLowerCase().includes(value.toLowerCase())
            );
            setPatientList(filteredPatients);
        }
    };

    return (
        <div style={{ marginTop: 24 }}>
            {!patient ? (
                <>
                    {
                        patientList !== undefined &&
                        <>
                            <Col>
                                <div className='card-container'>
                                    <Row gutter={16}>
                                        <Col span={6}>
                                            <Title level={3} style={{ margin: '0px 0px 32px 0px' }}>
                                                <ExclamationCircleOutlined style={{ marginRight: '12px', color: '#FAAD14' }} />
                                                Selecione um utente
                                            </Title>
                                            <Input
                                                size='large'
                                                placeholder="Pesquisar utente"

                                                allowClear={true}
                                                onChange={handleSearch}
                                                style={{ marginBottom: '32px' }}
                                            />
                                        </Col>
                                    </Row>
                                    {
                                        patientList.length > 0 ?
                                            patientList?.map((patient, index) => (
                                                <div key={index}>
                                                    <Row gutter={[16, 16]}>
                                                        <Col span={6}>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <Text strong>{patient?.name}</Text>
                                                                <Text>NIF: {patient?.nif}</Text>
                                                                <Text>Nº Utente: {patient?.patientNumber}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col span={5} offset={13} style={{ alignSelf: 'center' }}>
                                                            <Button type="primary" onClick={() => handleSelectPatient(patient)} block size="large"><UserOutlined />Selecionar Utente</Button>
                                                        </Col>
                                                    </Row>
                                                    <Divider />
                                                </div>
                                            ))
                                            :
                                            <Col>
                                                <div className='card-container'>
                                                    <Empty description={'Não foram encontrados resultados para a pesquisa!'} />
                                                </div>
                                            </Col>
                                    }
                                </div>
                            </Col>
                        </>

                    }

                    {isErrorGetPatients && (
                        <CardError title="Erro ao carregar as informações. Tente novamente mais tarde." status="error" />
                    )}
                    {
                        (isLoadingGetPatients || isFetchingGetPatients) &&
                        <CardLoading />
                    }
                </>
            ) : (
                <Col>
                    <div className='card-container'>
                        <Row style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <Col>
                                <Title level={3} style={{ margin: '0px 0px 32px 0px', color: '#BFBFBF' }}>
                                    Selecione um utente
                                </Title>

                            </Col>
                            <Col>
                                <Button className="secundary-button" onClick={() => handleUnSelectPatient()} block size="small"><RetweetOutlined />Trocar</Button>
                            </Col>
                        </Row>
                        <Row style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <Col>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Text strong style={{ color: '#BFBFBF' }}>{patient?.name}</Text>
                                    <Text style={{ color: '#BFBFBF' }}>NIF: {patient?.nif}</Text>
                                    <Text style={{ color: '#BFBFBF' }}>Nº Utente: {patient?.patientNumber}</Text>
                                </div>
                            </Col>
                            <Col offset={12} style={{ alignSelf: 'center' }}>
                                <Text style={{ color: '#52C41A' }}><CheckCircleOutlined style={{ marginRight: '8px' }} />Selecionado</Text>
                            </Col>
                        </Row>
                        <Divider />
                    </div>
                </Col>
            )}
        </div>
    )
}
