import { Typography, List, Spin } from 'antd';
import { getPatientDetails } from '../../services/patient.service';
import { useMutation } from 'react-query';
import { useEffect, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
const { Text } = Typography;


interface PropsDetails {
    data: any,
    showCredits?: any
}
export default function DetailsPatientBasicList({ data, showCredits }: PropsDetails) {
    const [patient, setPatient] = useState<any | undefined>(undefined);

    const { mutate: mutateGetPatientDetails } = useMutation(getPatientDetails, {
        onSuccess: (data: any) => {
            setPatient(data?.data)
        },
        onError: () => {

        }
    })

    useEffect(() => {
        if (data && Object.keys(data).length > 0) {
            mutateGetPatientDetails(data?.id)
        }
    }, [data]);


    return (
        <>
            <List size="small" >
                <List.Item>
                    <div style={{ width: "100%" }}>
                        <Text strong>{"Nome: "}</Text> <Text>{patient?.name}</Text>
                    </div>
                </List.Item>
                <List.Item
                    style={{ backgroundColor: "#f5f5f5" }}
                >
                    <div style={{ width: "100%" }}>
                        <Text strong>{"Contacto: "}</Text> <Text>{patient?.phoneNumber}</Text>
                    </div>
                </List.Item>
                <List.Item>
                    <div style={{ width: "100%" }}>
                        <Text strong>{"N° utente: "}</Text> <Text>{patient?.patientNumber}</Text>
                    </div>
                </List.Item>
                <List.Item
                    style={{ backgroundColor: "#f5f5f5" }}
                >
                    <div style={{ width: "100%" }}>
                        <Text strong>{"Email: "}</Text> <Text>{patient?.email}</Text>
                    </div>
                </List.Item>
                <List.Item>
                    <div style={{ width: "100%" }}>
                        <Text strong>{"NIF: "}</Text> <Text>{patient?.nif}</Text>
                    </div>
                </List.Item>
                {showCredits && (
                    <List.Item style={{ backgroundColor: "#f5f5f5" }}>
                        <div style={{ width: "100%" }}>
                            <Text strong>{"Créditos: "}</Text> <Text>{patient?.credits > 0 ? patient?.credits : 'Sem Créditos'}</Text>
                        </div>
                    </List.Item>
                )}
            </List>
        </>
    )
}
