import { Tag, Row, Col, Divider, Typography, Button } from 'antd';
import { NOT_REGISTERED_LABEL } from '../../../services/utils';
import { handlePhoneToUse, updateCall } from '../../../services/calls.service';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { AlertService } from '../../../services/alert.service';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const useTimer = (createdAt: string, callStatus?: string) => {
    const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

    useEffect(() => {
        if(callStatus === 'connected'){
            const startDate = new Date(createdAt);
            const updateElapsedTime = () => {
                const currentDate = new Date();
                const timeDifference = currentDate.getTime() - startDate.getTime();
    
                const seconds = Math.floor(timeDifference / 1000) % 60;
                const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
                const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
    
                const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
                setElapsedTime(formattedTime);
            };
    
            const intervalId = setInterval(updateElapsedTime, 1000);
    
            return () => clearInterval(intervalId);
        }else {
            setElapsedTime('Chamada Terminada');
        }
    }, [createdAt, callStatus]);

    return elapsedTime;
};

const CallInfoCard = ({ callDetailsData, handleEndUnblockCall, isHungupCall = false }: any) => {
    const elapsedTime = useTimer(callDetailsData?.call_created_at, callDetailsData?.call_status);
    const navigate = useNavigate();

    const updateCallReason = (frmdetails: {}) => updateCall(frmdetails);
    const { mutate: mutateUpdateCallReason } = useMutation(updateCallReason, {
        onSuccess: () => {
            navigate(`/calls`)
        },
        onError: () => {
            AlertService.sendAlert([{ type: "error", text: "Ocorreu um erro." }]);
        }
    });

    const handleEntityLabel = (data: any) => {
        let entity = data?.entity_type ?? null;

        switch (entity){
            case 'client':
                return "Cliente";
            case 'patient':
                return "Utente";
            case 'client responsible':
                return "Responsável do cliente";
            case 'patient responsible':
                return "Responsável do utente";
        }
    };

    const formatHour = (date: any) => {
        const formattedTime = dayjs(date).format('HH:mm:ss');
        return formattedTime;
    };

    const handleFinishCall = () => {
        mutateUpdateCallReason({ id: callDetailsData?.call_id, hangup_status: '16' }) // 16 = Finished
    }

    return (
        <Col>
            <div style={{
                border: '1px solid #0000000',
                borderRadius: 8,
                background: '#FFFFFF',
                padding: 24,
            }}>
                <Row gutter={16}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                            <Col>
                                <Title level={3} style={{ margin: '0px 0px 32px 0px' }}>{callDetailsData?.entity_name ?? NOT_REGISTERED_LABEL}</Title>
                            </Col>
                            <Col>
                                {
                                    callDetailsData?.entity_id &&
                                    <Tag bordered={true} style={{ marginBottom: 16 }}><Text>{handleEntityLabel(callDetailsData)}</Text></Tag>
                                }
                            </Col>
                        </div>
                        {
                            isHungupCall ?
                                <div>
                                    <Col>
                                        <Button danger type="primary" size="large" onClick={() => handleFinishCall()} style={{ width: '100%' }}>Concluir</Button>
                                    </Col>
                                </div>

                                :
                                <div>
                                    <Col>
                                        <Button danger type="primary" size="large" onClick={() => handleEndUnblockCall()} style={{ width: '100%' }}>Encerrar atendimento</Button>
                                    </Col>
                                </div>
                        }
                    </div>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <Text>Contacto</Text>
                        <div>
                            <Text strong>
                                {handlePhoneToUse(callDetailsData) ? handlePhoneToUse(callDetailsData) : NOT_REGISTERED_LABEL}
                            </Text>
                        </div>
                    </Col>
                    <Col span={6}>
                        <Text>NIF</Text>
                        <div>
                            <Text strong>{callDetailsData?.entity_nif ?? NOT_REGISTERED_LABEL}</Text>
                        </div>
                    </Col>
                </Row>
                <Divider />
                {
                    !isHungupCall &&
                    <Row gutter={[16, 16]}>
                        <Col span={6}>
                            <Text>Hora de atendimento</Text>
                            <div>
                                <Text strong>{formatHour(callDetailsData?.call_created_at) ?? NOT_REGISTERED_LABEL}</Text>
                            </div>
                        </Col>
                        <Col span={6}>
                            <Text>Duração</Text>
                            <div>
                                <Text strong>{elapsedTime}</Text>
                            </div>
                        </Col>
                    </Row>
                }
            </div>
        </Col>
    )
}

export default CallInfoCard;
