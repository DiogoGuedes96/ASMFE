import { Typography, List, Collapse } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { EnumTransportFeature } from '../../Enums/TransportFeature';
const { Text } = Typography;

interface PropsDetails {
    data: any
    reschedule: () => void
}
export default function FutureScheduleListComponent({data, reschedule}:PropsDetails) {
    const [patientFutureSchedules, setPatientFutureSchedules] = useState<any>();
    const dateFormat = "DD/MM/YYYY";
    const timeFormat = "HH:mm";

    useEffect(() => {
        if (data && Object.keys(data).length > 0) {
            const schedules = data || [];

            const dynamicArray = schedules.map((schedule: any, index: number) => ({
                key: index.toString(),
                label: `Dia ${moment(schedule.date).format(dateFormat)}, às ${moment(schedule.time, 'HH:mm:ss').format(timeFormat)}`,
                children: (
                    <>
                        <List size="small">

                            <List.Item>
                                <div>
                                    <Text strong>{"Tipo de transporte:  "}</Text> <Text>{EnumTransportFeature[schedule?.transport_feature as keyof typeof EnumTransportFeature]}</Text>
                                </div>
                            </List.Item>
                            <List.Item style={{ backgroundColor: "#f5f5f5" }}>
                                <div style={{ width: "100%" }}>
                                    <Text strong>{"Cliente: "}</Text> <Text>{schedule?.client?.name}</Text>
                                </div>
                            </List.Item>
                            <List.Item>
                                <div>
                                    <Text strong>{"Acompanhante: "}</Text> <Text>{schedule.companion_name ? schedule.companion_name : 'Não'}</Text>
                                </div>
                            </List.Item>
                            <List.Item
                                style={{ backgroundColor: "#f5f5f5" }}
                            >
                                <div>
                                    <Text strong>{"Nome: "}</Text> <Text>{schedule?.patient?.name}</Text>
                                </div>
                            </List.Item>
                            <List.Item>
                                <div>
                                    <Text strong>{"Contacto: "}</Text> <Text>{schedule?.patient?.phoneNumber}</Text>
                                </div>
                            </List.Item>
                            <List.Item
                                style={{ backgroundColor: "#f5f5f5" }}
                            >
                                <div>
                                    <Text strong>{"Origem: "}</Text> <Text>{schedule?.origin}</Text>
                                </div>
                            </List.Item>
                            <List.Item>
                                <div>
                                    <Text strong>{"Destino: "}</Text> <Text>{schedule?.destination}</Text>
                                </div>
                            </List.Item>
                            <List.Item
                                style={{ backgroundColor: "#f5f5f5" }}
                            >
                                <div>
                                    <Text strong>{"Operador: "}</Text> <Text>{schedule?.user?.name}</Text>
                                </div>
                            </List.Item>
                        </List>
                    </>
                ),
                extra: reschedule(),
            }));

            setPatientFutureSchedules(dynamicArray);
        }
    }, [data]);

    return (
        <>
            <Collapse className="collapse-box" items={patientFutureSchedules} />
        </>
    )
}
