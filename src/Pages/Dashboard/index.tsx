import { Card, Col, Divider, Row, Typography } from "antd";
import React, { useState, useEffect } from "react";
import { RiseOutlined, FallOutlined, HeartFilled } from "@ant-design/icons";
import { getKpis, getTotalUsers, getTotalPatients, getTotalScheduling } from "../../services/dashboard.service";
import { useQuery } from "react-query";

const { Title, Text } = Typography;

const tabPeriod = [
    {
        key: "now",
        tab: "Hoje",
    },
    {
        key: "week",
        tab: "Semana",
    },
    {
        key: "month",
        tab: "Mês",
    },
];

export default function Dashboard() {
    const [ordersPeriod, setOrdersPeriod]: any = useState("now");
    const [invoicePeriod, setInvoicePeriod]: any = useState("now");
    const [callcenterPeriod, setCallcenterPeriod]: any = useState("now");
    const [kpisData, setKpisData]: any = useState({
        clients: { isLoading: true, data: { total: 0 } },
        calls: { isLoading: true, data: { lost: 0, hangup: 0, total: 0 } }
    });
    const [kpisAsmData, setKpisAsmData]: any = useState({
        users: { isLoading: true, data: { total: 0 } },
        patients: { isLoading: true, data: { total: 0 } },
        scheduling: { isLoading: true, data: { total: 0 } }
    });

    const {data:dataTotalUsers} = useQuery('getTotalUsers',getTotalUsers,{refetchOnWindowFocus:false});
    const {data:dataTotalPatients} = useQuery('getTotalPatients',getTotalPatients,{refetchOnWindowFocus:false});
    const {data:dataTotalScheduling} = useQuery('getTotalScheduling',getTotalScheduling,{refetchOnWindowFocus:false});

    useEffect(() => {
        if (dataTotalUsers) {
            setKpisAsmData((prev:any) => ({ ...prev, users: { ...dataTotalUsers,isLoading: false } }));
        }
    }, [dataTotalUsers]);

    useEffect(() => {
        if (dataTotalPatients) {
            setKpisAsmData((prev:any) => ({ ...prev, patients: { ...dataTotalPatients,isLoading: false } }));
        }
    }, [dataTotalPatients]);

    useEffect(() => {
        if (dataTotalScheduling) {
            setKpisAsmData((prev:any) => ({ ...prev, scheduling: { ...dataTotalScheduling,isLoading: false } }));
        }
    }, [dataTotalScheduling]);

    const fetchKpisData = ({ entity, period }: any) => {
        kpisData[entity].isLoading = true;

        getKpis({ entity, period })
            .then((response: any) => {
                let _kpisData = { ...kpisData };

                Object.keys(response).forEach(key => _kpisData[entity].data[key] = response[key]);
                _kpisData[entity].isLoading = false;

                setKpisData(_kpisData);
            })
            .catch((error: any) => console.error('API error 2:', error.response));
    }

    const invoiceTabChange = (key: any) => {
        setInvoicePeriod(key);

        fetchKpisData({ entity: 'invoices', period: key });
    };

    const callcenterTabChange = (key: any) => {
        setCallcenterPeriod(key);

        fetchKpisData({ entity: 'calls', period: key });
    };

    const ordersTabChange = (key: any) => {
        setOrdersPeriod(key);

        fetchKpisData({ entity: 'orders', period: key });
    };

    const calculateValues = (value: any, cash: boolean = true) => {
        if (cash)
            return value.toLocaleString("pt-PT", {
                style: "currency",
                currency: "EUR",
            });

        return value;
    };

    const calculatePercentage = (old_value: any, current_value: any) => {
        return ((100 * current_value / old_value) - 100).toFixed(1).replace('.', ',') + '%';
    }

    useEffect(() => {
        Object.keys(kpisData).forEach(key => fetchKpisData({ entity: key, period: 'now' }));
    }, []);

    return (
        <div
            style={{
                margin: 24,
                display: "flex",
                flexDirection: "column",
                gap: 24,
            }}
        >
            <Row gutter={20}>
                <Col span={18}>
                    <Card
                        tabList={tabPeriod}
                        onTabChange={callcenterTabChange}
                        loading={ kpisData.calls.isLoading }
                        tabBarExtraContent={
                            <Title style={{ margin: 0 }} level={4}>
                                Central telefónica
                            </Title>
                        }
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-around",
                            }}
                        >
                            <div>
                                <Text type="secondary" strong>
                                    Perdidas
                                </Text>
                                <Title style={{ margin: 0 }} level={3}>
                                    {calculateValues(
                                        kpisData.calls.data.lost,
                                        false
                                    )}
                                </Title>
                            </div>
                            <Divider
                                type="vertical"
                                style={{ height: "4em" }}
                            />
                            <div>
                                <Text type="secondary" strong>
                                    Recebidas
                                </Text>
                                <Title style={{ margin: 0 }} level={3}>
                                    {calculateValues(
                                        kpisData.calls.data.hangup,
                                        false
                                    )}
                                </Title>
                            </div>
                            <Divider
                                type="vertical"
                                style={{ height: "4em" }}
                            />
                            <div>
                                <Text type="secondary" strong>
                                    Total de ligações
                                </Text>
                                <Title style={{ margin: 0 }} level={3}>
                                    {calculateValues(
                                        kpisData.calls.data.total,
                                        false
                                    )}
                                </Title>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        style={{ height: "100%" }}
                        loading={ kpisData.clients.isLoading }
                        bodyStyle={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            padding: "16px 24px",
                            minHeight: "160px",
                        }}
                    >
                        <Title style={{ margin: 0 }} level={4}>
                            Total Clientes
                        </Title>
                        <div>
                            <Text type="secondary" strong>
                                Clientes
                            </Text>
                            <Title style={{ margin: 0 }} level={4}>
                                {kpisData.clients.data.total}
                            </Title>
                        </div>
                    </Card>
                </Col>
            </Row>
            <Row gutter={20}>
                <Col span={8}>
                    <Card
                        style={{ height: "100%" }}
                        loading={ kpisAsmData.users.isLoading }
                        bodyStyle={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            padding: "16px 24px",
                            minHeight: "160px",
                        }}
                    >
                        <Title style={{ margin: 0 }} level={4}>
                            Total Utilizadores
                        </Title>
                        <div>
                            <Text type="secondary" strong>
                                Utilizadores
                            </Text>
                            <Title style={{ margin: 0 }} level={4}>
                                {kpisAsmData.users.data.total}
                            </Title>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        style={{ height: "100%" }}
                        loading={ kpisAsmData.patients.isLoading }
                        bodyStyle={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            padding: "16px 24px",
                            minHeight: "160px",
                        }}
                    >
                        <Title style={{ margin: 0 }} level={4}>
                            Total Utentes
                        </Title>
                        <div>
                            <Text type="secondary" strong>
                                Utentes
                            </Text>
                            <Title style={{ margin: 0 }} level={4}>
                                {kpisAsmData.patients.data.total}
                            </Title>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        style={{ height: "100%" }}
                        loading={ kpisAsmData.scheduling.isLoading }
                        bodyStyle={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            padding: "16px 24px",
                            minHeight: "160px",
                        }}
                    >
                        <Title style={{ margin: 0 }} level={4}>
                            Total Agendamento
                        </Title>
                        <div>
                            <Text type="secondary" strong>
                                Agendamentos
                            </Text>
                            <Title style={{ margin: 0 }} level={4}>
                                {kpisAsmData.scheduling.data.total}
                            </Title>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
