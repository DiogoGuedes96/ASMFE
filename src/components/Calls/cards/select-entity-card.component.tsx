import { Row, Col, Divider, Typography, Button, Empty } from 'antd';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { SelectEntityCardProps } from '../../../Interfaces/ActiveCalls.interfaces';
import { getClientsFromResponsible } from '../../../services/client.service';
import { BankOutlined, CheckCircleOutlined, ExclamationCircleOutlined, RetweetOutlined } from '@ant-design/icons';
import CardLoading from '../../Commons/Cards/card-loading.component';
import CardError from '../../Commons/Cards/card-error.compoenent';
import "../../../assets/css/cards.css";


const { Text, Title } = Typography;

export default function SelectEntityCard({ responsible, entity, handleUnSelectEntity, handleSelectEntity }: SelectEntityCardProps) {
    const [clientList, setClientList] = useState<any[]>([]);

    const { isLoading: isLoadingGetClientFromResponsible, refetch: refetchGetClientFromResponsible, isError: isErrorGetClientFromResponsible, isFetching: isFetchingGetClientFromResponsible } = useQuery(
        ["getclientFromResponsible", responsible?.id],
        () => {
            return responsible?.id ? getClientsFromResponsible(responsible?.id) : null;
        },
        {
            refetchOnWindowFocus: false,
            onSuccess: async (data: any) => {
                setClientList(data?.data);
            },
        }
    );

    const handleSelectClient = (client: any) => {
        handleSelectEntity(client);
    }

    const handleUnSelectClient = () => {
        handleUnSelectEntity();
        refetchGetClientFromResponsible();
    }
    
    return (
        <div style={{ marginTop: 24 }}>
            {!entity || entity == undefined ? (
                <>
                    {
                        clientList?.length > 0 &&
                        <Col>
                            <div className='card-container'>
                                <Row gutter={16}>
                                    <Col>
                                        <Title level={3} style={{ margin: '0px 0px 32px 0px' }}>
                                            <ExclamationCircleOutlined style={{ marginRight: '12px', color: '#FAAD14' }} />
                                            Selecione um cliente
                                        </Title>
                                    </Col>
                                </Row>
                                {clientList.map((client, index) => (
                                    <div key={index}>
                                        <Row gutter={[16, 16]}>
                                            <Col span={6}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Text strong>{client?.name}</Text>
                                                    <Text>NIF: {client?.nif}</Text>
                                                    <Text>Contacto: {client?.phone}</Text>
                                                </div>
                                            </Col>
                                            <Col span={5} offset={13} style={{ alignSelf: 'center' }}>
                                                <Button type="primary" onClick={() => handleSelectClient(client)} block size="large"><BankOutlined />Selecionar o cliente</Button>
                                            </Col>
                                        </Row>
                                        <Divider />
                                    </div>
                                ))}
                            </div>
                        </Col>
                    }
                    {isErrorGetClientFromResponsible && (
                        <CardError title="Erro ao carregar as informações. Tente novamente mais tarde." status="error" />
                    )}                {
                        (isLoadingGetClientFromResponsible || isFetchingGetClientFromResponsible) &&
                        <CardLoading />
                    }
                </>
            ) : (
                <>
                    <Col>
                        <div className='card-container'>
                            <Row style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                <Col>
                                    <Title level={3} style={{ margin: '0px 0px 32px 0px', color: '#BFBFBF' }}>
                                        Selecione um cliente
                                    </Title>

                                </Col>
                                <Col>
                                    <Button className="secundary-button" onClick={() => handleUnSelectClient()} block size="small"><RetweetOutlined />Trocar</Button>
                                </Col>
                            </Row>
                            <Row style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                <Col>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Text strong style={{ color: '#BFBFBF' }}>{entity?.name}</Text>
                                        <Text style={{ color: '#BFBFBF' }}>NIF: {entity?.nif}</Text>
                                        <Text style={{ color: '#BFBFBF' }}>Contacto: {entity?.phone}</Text>
                                    </div>
                                </Col>
                                <Col offset={12} style={{ alignSelf: 'center' }}>
                                    <Text style={{ color: '#52C41A' }}><CheckCircleOutlined style={{ marginRight: '8px' }} />Selecionada</Text>
                                </Col>
                            </Row>
                            <Divider />
                        </div>
                    </Col>
                </>
            )}
        </div>
    )
}
