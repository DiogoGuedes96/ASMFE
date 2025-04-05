import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "react-query";

import { Empty, Typography } from 'antd';
import { PlayCircleOutlined, ClockCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

import emptyCalls from '../../../assets/images/empty-calls.svg';
import ListGenericTable from "../../Commons/Table/generic-table.component";
import { AlertService } from "../../../services/alert.service";
import { NOT_REGISTERED_LABEL } from "../../../services/utils";
import {
    getCallsInProgress,
    getBlockedCallsInCache,
    blockCallInCache,
} from "../../../services/calls.service";

const { Text } = Typography;

export default function ActiveCalls() {
    const userLogged: any = localStorage.getItem('user');
    const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(userLogged) : null);
    const [callsInProgress, setCallsInProgress]: any = useState();
    const [callsInCache, setCallsInCache]: any = useState();
    const [activeCallDetails, setActiveCallDetails] = useState<any>({});
    const [openCallDetails, setOpenCallDetails] = useState<any>(false);
    const [terminatedCall, setTerminatedCall] = useState(false);
    const navigate = useNavigate();

    const { data } = useQuery(['callsInProgress'], getCallsInProgress, {
        refetchInterval: 3000,
        onSuccess: async (data: any) => {
            let list = [];
            const queryCallsData = await data?.calls;
            if (queryCallsData) {
                list = queryCallsData.map((call: any) => {
                    call.key = call?.call_id;
                    call.name = call?.entity?.name ?? NOT_REGISTERED_LABEL;
                    call.address = call?.entity?.address ?? NOT_REGISTERED_LABEL;
                    call.nif = call?.entity?.nif ?? NOT_REGISTERED_LABEL;
                    call.phone = call?.callee_phone ? call?.callee_phone : call?.caller_phone;

                    return call;
                });
            }

            if (activeCallDetails?.call_id !== undefined) {
                const foundCall = list.find((callData: any) => callData?.call_id === activeCallDetails?.call_id);
                if (!foundCall) {
                    setTerminatedCall(true);
                } else {
                    setTerminatedCall(false);
                }
            }
            setCallsInProgress(list);
        },
    })

    const { data: cachedCalls } = useQuery(['getCachedCalls'], getBlockedCallsInCache, {
        refetchInterval: 3000,
        onSuccess: async (data: any) => {
            setCallsInCache(data?.calls);
        },
    })

    const { mutate: mutateblockCallInCache } = useMutation(blockCallInCache, {
        onSuccess: () => {
            setOpenCallDetails(true);
        },
        onError: () => {
            AlertService.sendAlert([{ type: "error", text: "Erro ao iniciar atendimento." }]);
        }
    })

    const pickupCall = (call: any) => {
        mutateblockCallInCache(call?.call_id)
        navigate(`/calls/${call?.call_id}`);
    }

    const tableColumns = [
        {
            title: "Atendimento",
            key: "pickupCall",
            render: (_: any, record: any) => {
                if (callsInCache?.length > 0) {
                    const call = callsInCache.find((call: any) => call?.call_id == record?.call_id);

                    if (call) {
                        if (call.user_id === user.id) {
                            return (
                                <a onClick={() => pickupCall(record)}><PauseCircleOutlined style={{ marginRight: 6 }} />Retomar atendimento</a>
                            );
                        } else {
                            return (
                                <Text><ClockCircleOutlined style={{ marginRight: 6 }} />Em atendimento</Text>
                            );
                        }
                    } else {
                        return (
                            <a onClick={() => pickupCall(record)}><PlayCircleOutlined style={{ marginRight: 6 }} />Iniciar atendimento</a>
                        );
                    }
                } else {
                    return (
                        <a onClick={() => pickupCall(record)}><PlayCircleOutlined style={{ marginRight: 6 }} />Iniciar atendimento</a>
                    );
                }
            },
        },
        {
            title: "Nome",
            dataIndex: "entity_name",
            key: "name",
            render: (name: string | null) => name || NOT_REGISTERED_LABEL,
        },
        {
            title: "Contacto",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "NIF",
            dataIndex: "entity_nif",
            key: "nif",
            render: (nif: string | null) => nif || NOT_REGISTERED_LABEL,
        },
        {
            title: "Morada",
            dataIndex: "entity_name_address",
            key: "address",
            render: (address: string | null) => address || NOT_REGISTERED_LABEL,
        },
    ];

    return (
        <div style={{ margin: '16px 32px' }}>
            {!openCallDetails &&
                <>
                    {
                        (callsInProgress?.length == undefined || callsInProgress?.length == 0) ?
                            <Empty
                                style={{
                                    width: '100%',
                                    marginTop: "35vh",
                                    padding: "10px"
                                }}
                                image={emptyCalls}
                                imageStyle={{ height: 50 }}
                                description={
                                    <span style={{ textAlign: 'center', color: '#00000073', opacity: '1' }}>
                                        Não há chamadas ativas
                                    </span>

                                }
                            />
                            :
                            <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #fff", padding: 8 }}>
                                <ListGenericTable
                                    columns={tableColumns}
                                    dataSource={callsInProgress}
                                />
                            </div>
                    }
                </>
            }
        </div>
    )
}
