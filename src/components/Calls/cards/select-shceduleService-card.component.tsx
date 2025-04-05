import { Row, Col, Divider, Typography, Button, Input, Form, DatePicker } from 'antd';

import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { CalendarOutlined, CheckCircleOutlined, ExclamationCircleOutlined, RetweetOutlined } from '@ant-design/icons';
import { SelectShceduleCardProps } from '../../../Interfaces/ActiveCalls.interfaces';
import CardError from '../../Commons/Cards/card-error.compoenent';
import CardLoading from '../../Commons/Cards/card-loading.component';
import { getSchedulesFromPatient } from '../../../services/serviceScheduling.service';
import "../../../assets/css/cards.css";
import dayjs from 'dayjs';

const { Text, Title } = Typography;

export default function SelectScheduleServiceCard({ patient, schedule, selectSchedule, handleUnSelectSchedule, scheduleType }: SelectShceduleCardProps) {
    const [scheduleList, setScheduleList] = useState<any[] | undefined>(undefined);
    const [scheduleListFiltered, setScheduleListFiltered] = useState<any[] | undefined>(scheduleList);
    const [formFilterSchedules] = Form.useForm();

    const { isLoading: isLoadingGetSchedulesFromPatient, refetch: refetchGetSchedulesFromPatient, isError: isErrorGetSchedulesFromPatient, isFetching: isFetchingGetSchedulesFromPatient } = useQuery(
        ["getclientFromResponsible", patient?.id],
        () => {
            return patient?.id ? handleQueryCall(patient?.id) : null;
        },
        {
            refetchOnWindowFocus: false,
            onSuccess: async (data: any) => {
                setScheduleList(data?.data);
                setScheduleListFiltered(data?.data);
            },
        }
    );

    const handleQueryCall = (patientId: number) => { //In the case of calling canceled schedules, schedules without a return or normal shcedules
        switch (scheduleType) {
            case 'schedule':
                return getSchedulesFromPatient(patientId)
            case 'reschedule':
                return getSchedulesFromPatient(patientId)
            case 'cancel':
                return getSchedulesFromPatient(patientId)
            case 'return':
                const withoutReturns = true;
                return getSchedulesFromPatient(patientId, withoutReturns)
            default:
                break;
        }
    }

    const handleSelectSchedule = (schedule: any) => {
        selectSchedule?.(schedule);
    }

    const handleUnSelectPatient = () => {
        handleUnSelectSchedule();
        refetchGetSchedulesFromPatient();
    }

    const handleClearFilters = () => {
        formFilterSchedules.resetFields()
        refetchGetSchedulesFromPatient();
    };

    const handleDateTime = (schedule: any): string => {
        const formattedDate = dayjs(schedule.date).format('DD/MM/YYYY');
        const formattedTime = dayjs(schedule.time, 'HH:mm:ss').format('HH:mm');
        const dateTime = formattedDate + ', ' + formattedTime

        return dateTime;
    };

    const handleFormChange = () => {
        const formValues = formFilterSchedules.getFieldsValue();
        const { searchDateRange, search } = formValues;

        let filteredList = scheduleList;

        if (searchDateRange && searchDateRange.length === 2) {
            filteredList = filteredList?.filter(schedule => {
                const scheduleDate = new Date(schedule.date).getTime();
                return scheduleDate >= searchDateRange[0].startOf('day').valueOf() &&
                    scheduleDate <= searchDateRange[1].endOf('day').valueOf();
            });
        }

        if (search) {
            filteredList = filteredList?.filter(schedule => schedule?.service_type?.toLowerCase().includes(search?.toLowerCase()));
        }

        setScheduleListFiltered(filteredList);
    };

    const handleBtnLabel = () => {
        switch (scheduleType) {
            case 'schedule':
                return 'Selecionar Agendamento';
            case 'reschedule':
                return 'Reagendar';
            case 'cancel':
                return 'Cancelar Agendamento';
            case 'return':
                return 'Selecionar Agendamento';
            default:
                break;
        }
    }

    useEffect(() => {
        handleFormChange();
    }, [formFilterSchedules.getFieldsValue()]);

    return (
        <div style={{ marginTop: 24 }}>
            {!schedule ? (
                <>
                    {
                        scheduleListFiltered !== undefined &&
                        <>
                            <Col>
                                <div className='card-container'>
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Title level={3} style={{ margin: '0px 0px 32px 0px' }}>
                                                <ExclamationCircleOutlined style={{ marginRight: '12px', color: '#FAAD14' }} />
                                                Selecione um agendamento
                                            </Title>
                                            <Form
                                                form={formFilterSchedules}
                                                layout="vertical"
                                                autoComplete="off"
                                                initialValues={{ status: true }}
                                                style={{ marginBottom: '32px' }}
                                            >
                                                <Row gutter={[16, 16]} style={{ alignItems: 'center' }}>
                                                    <Col span={6}>
                                                        <Form.Item
                                                            name='searchDateRange'
                                                            label="Periodo da data"
                                                            colon={false}
                                                        >
                                                            <DatePicker.RangePicker
                                                                size="large"
                                                                placeholder={['Data início', 'Data fim']}
                                                                format="DD/MM/YYYY"
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Form.Item
                                                            name="search"
                                                            label="Tipo de Serviço"
                                                            colon={false}
                                                        >
                                                            <Input
                                                                size='large'
                                                                placeholder="Ex: Fisioterapia"
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Button type="link" size="large" style={{ padding: 0 }} onClick={handleClearFilters}>
                                                            Limpar
                                                        </Button>
                                                    </Col>
                                                </ Row>
                                            </Form>
                                        </Col>
                                    </Row>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
                                        {scheduleListFiltered.length > 0 && (
                                            <div>
                                                {scheduleListFiltered?.map((schedule, index) => (
                                                    <div key={index}>
                                                        <Row gutter={[16, 16]}>
                                                            <Col span={6}>
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <Text strong>{handleDateTime(schedule)}</Text>
                                                                    <Text>{schedule?.service_type}</Text>
                                                                </div>
                                                            </Col>
                                                            <Col span={6} offset={12} style={{ alignSelf: 'center' }}>
                                                                <Button type="primary" onClick={() => handleSelectSchedule(schedule)} block size="large"><CalendarOutlined />{handleBtnLabel()}</Button>
                                                            </Col>
                                                        </Row>
                                                        <Divider />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Col>
                        </>
                    }
                    {isErrorGetSchedulesFromPatient && (
                        <CardError title="Erro ao carregar as informações. Tente novamente mais tarde." status="error" />
                    )}
                    {
                        (isLoadingGetSchedulesFromPatient || isFetchingGetSchedulesFromPatient) &&
                        <CardLoading />
                    }
                </>
            ) : (
                <Col>
                    <div className='card-container'>
                        <Row style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <Col>
                                <Title level={3} style={{ margin: '0px 0px 32px 0px', color: '#BFBFBF' }}>
                                    Selecione um agendamento
                                </Title>

                            </Col>
                            <Col>
                                <Button className="secundary-button" onClick={() => handleUnSelectPatient()} block size="small"><RetweetOutlined />Trocar</Button>
                            </Col>
                        </Row>
                        <Row style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <Col>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Text strong style={{ color: '#BFBFBF' }}>{handleDateTime(schedule)}</Text>
                                    <Text style={{ color: '#BFBFBF' }}>{schedule?.service_type}</Text>
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
