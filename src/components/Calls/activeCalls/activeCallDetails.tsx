import { useState, useEffect } from "react";
import { Menu, Row, Col, Form, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";

import AssociateClientOrPatientDrawer from "../Forms/associate-client-or-patient-to-call-form.component";
import FormCanceledSchedulingComponent from "../../Scheduling/form-canceled-scheduling.component";
import CreateOrUpdatePatientDrawer from "../../Patient/create-or-update-patient-drawer.component";
import CreateOrdUpdateClientDrawer from "../../Clients/create-or-update-client-drawer-component";
import FormServiceSchedulingComponent from "../../Scheduling/form-service-scheduling.component";
import SelectScheduleServiceCard from "../cards/select-shceduleService-card.component";
import NotScheduleDrawer from "../Forms/not-schedule-form-drawer.component";
import GenericDrawer from "../../Commons/Drawer/generic-drawer.component";
import SeePatientDrawer from "../../Patient/see-patient-drawer.component";
import SelectPatientCard from "../cards/select-patient-card.component";
import SelectEntityCard from "../cards/select-entity-card.component";
import CardLoading from "../../Commons/Cards/card-loading.component";
import FeedbackForm from "../../Feedback/feedback-form.component";
import CallInfoCard from "../cards/call-info-card.component";
import DisplayAlert from "../../Commons/Alert";

import { ICallsDrawerOptions } from "../../../Interfaces/ActiveCalls.interfaces";

import { associatedContactOptionsItems, notAssociatedContactOptionsItems } from "../assets/actions-menu-columns.asset";

import { AlertService } from "../../../services/alert.service";

import {
    updateCall,
    ASSOCIATE_CLIENT_CALL_REASON,
    ASSOCIATE_PATIENT_CALL_REASON,
    CREATE_CLIENT_CALL_REASON,
    CREATE_PATIENT_CALL_REASON,
    CLIENT_ENTITY,
    PATIENT_ENTITY,
    NEW_CLIENT_TITLE,
    NEW_PATIENT_TITLE,
    NOT_SCHEDULE_TITLE,
    ASSOCIATE_CLIENT_TITLE,
    ASSOCIATE_PATIENT_TITLE,
    unblockCallInCache,
    getOneCall,
    CREATE_SCHEDULE_CALL_REASON,
    CANCEL_SCHEDULE_CALL_REASON,
    RESCHEDULE_CALL_REASON,
    PRAISE_COMPLAIN_CALL_REASON,
    RETURN_SCHEDULE_CALL_REASON,
    INFORMATION_CALL_REASON,
    NEW_PRAISE_COMPLAINT_TITLE,
    handlePhoneToUse,
    NEW_SCHEDULE_TITLE,
    INFORMATION_TITLE,
    RESCHEDULE_TITLE,
    RETURN_SCHEDULE_TITLE,
    CANCEL_SCHEDULE_TITLE,
    PATIENT_TITLE,
    MANAGE_PATIENT_CALL_REASON
} from "../../../services/calls.service";

const { Title } = Typography;

export default function ActiveCallDetails() {
    const { id } = useParams<string>();
    const [urlCallId] = useState<string | undefined>(id);
    const userLogged: any = localStorage.getItem('user');
    const [user] = useState(localStorage.getItem('user') ? JSON.parse(userLogged) : null);
    const navigate = useNavigate();

    const [selectDrawerOptions, setSelectDrawerOptions] = useState<string>('');
    const [drawerOption, setDrawerOption] = useState<any>(null);
    const [callDetailsData, setCallDetailsData] = useState<any | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const [entity, setEntity] = useState<any | undefined>(undefined);
    const [patient, setPatient] = useState<any | undefined>(undefined);
    const [schedule, setSchedule] = useState<any | undefined>(undefined);

    const [clientResponsible, setClientResponsible] = useState<any | undefined>(undefined);
    const [patientResponsible, setPatientResponsible] = useState<any | undefined>(undefined);

    const [scheduleType, setScheduleType] = useState<string>('');
    const [showActionCards, setShowActionCards] = useState<boolean>(false);
    const [showSelectEntityCard, setShowSelectEntityCard] = useState<boolean>(false);
    const [showSelectPatientCard, setShowSelectPatientCard] = useState<boolean>(false);
    const [showSelectScheduleCard, setShowSelectScheduleCard] = useState<boolean>(false);

    const [drawerForm] = Form.useForm();
    let selectDrawerOptionsAux = ''; //Only used to mutate call option 


    const updateCallReason = (frmdetails: {}) => updateCall(frmdetails);
    const { mutate: mutateUpdateCallReason } = useMutation(updateCallReason, {
        onSuccess: () => {
            handleClearPage()
        },
        onError: () => {
            handleClearPage()
        }
    });

    const { isLoading: isLoadingGetOneCall, refetch: refetchGetOneCall, isError: isErrorGetOneCall, isFetching: isFetchingGetOneCall } = useQuery(
        ["getclientFromResponsible", urlCallId],
        () => {
            return getOneCall(parseInt(urlCallId ? urlCallId : ''));
        },
        {
            refetchOnWindowFocus: false,
            refetchInterval: 3000,
            onSuccess: async (data: any) => {
                handleCallData(data);
            },
        }
    );

    const { mutate: mutateUnblockCallInCache } = useMutation(unblockCallInCache, {
        onSuccess: () => {
            handleClearPage()
        },
        onError: () => {
            handleClearPage()
        }
    })

    const { mutate: mutateGetOneCall } = useMutation(getOneCall, {
        onSuccess: (data) => {
            if (!callDetailsData || data?.status !== callDetailsData?.status) {
                handleCallData(data);
            }
        }
    })

    const handleCallData = (newCallData: any) => {
        if (!callDetailsData || newCallData?.call_status !== callDetailsData?.call_status ||  newCallData?.entity !== callDetailsData?.entity) {
            if (newCallData?.call_status !== 'connected') {
                AlertService.sendAlert([{ type: "warning", text: "A chamada em curso foi finalizada." }]);
            }
            setCallDetailsData(newCallData);
        }
    }

    const handleClearPage = () => {
        setShowActionCards(false);
        setShowSelectPatientCard(false);
        setShowSelectEntityCard(false);
        setShowSelectScheduleCard(false);

        setPatient(undefined);
        setEntity(undefined);
        setSchedule(undefined);
    }

    const handleCloseDrawer = (updateCallReason?: boolean) => {
        if(updateCallReason){
            const callData = {
                id: callDetailsData?.call_id,
                call_reason: hanldeActiveCallsDrawerOptions({ key: selectDrawerOptionsAux })?.callReason,
                call_operator: user?.id
            }

            mutateUpdateCallReason(callData);
        }

        drawerForm.resetFields();

        handlePageSelectCards(callDetailsData);

        handleClearPage();
        setOpenDrawer(false);
        setSelectDrawerOptions('')
        selectDrawerOptionsAux = ''
    };

    const onClickOption = (item: any) => {
        let key = item?.key;
        const phone = handlePhoneToUse(callDetailsData);
        setSelectDrawerOptions(key);
        selectDrawerOptionsAux = key;

        const callerPhoneData = { phone: phone, phoneNumber: phone, status: true }

        if (selectDrawerOptions !== '' && key !== selectDrawerOptions) {
            handleClearPage();
        }

        if (item?.showActionCards) {
            setShowActionCards(true);
            setOpenDrawer(false);
        } else {
            setOpenDrawer(true);
            setShowActionCards(false);
        }

        const drawerOptionAux = hanldeActiveCallsDrawerOptions({ patient:patient, entity:entity, schedule:schedule, key:key, callerPhoneData:callerPhoneData });
        setDrawerOption(drawerOptionAux);
        handlePageSelectCards(callDetailsData, key);
    };

    const handlePageSelectCards = (activeCallDetails: any, key?: string) => {
        let entity = activeCallDetails?.entity_type ?? null;

        switch (entity){
            case 'client':
                setEntity({ id: activeCallDetails?.entity_id });
                setShowSelectPatientCard(true);
                break;
            case 'patient':
                setShowSelectScheduleCard(true);
                handleSelectPatient({ id:activeCallDetails?.entity_id}, key)
                break;
            case 'client responsible':
                setClientResponsible({ id: activeCallDetails?.entity_id });
                setShowSelectEntityCard(true);
                break;
            case 'patient responsible':
                setPatientResponsible({ id: activeCallDetails?.entity_id });
                setShowSelectPatientCard(true);setShowSelectPatientCard(true);
                break;
        }
    }

    const handleSelectPatient = (patientAux:any, key?: string) => {
        setPatient(patientAux);

        const option = key ? key : selectDrawerOptions;
        const drawerOptionAux = hanldeActiveCallsDrawerOptions({ patient:patientAux, key:option, entity:entity, schedule:schedule });
        setDrawerOption(drawerOptionAux);

        if (option) {
            switch (option) {
                case 'schedule':
                    setOpenDrawer(true);
                    setShowSelectScheduleCard(false);
                    break;
                case 'information':
                    setOpenDrawer(true);
                    setShowSelectScheduleCard(false);
                    break;
                case 'reschedule':
                    setScheduleType(option);
                    setShowSelectScheduleCard(true);
                    setOpenDrawer(false);
                    break;
                case 'cancel':
                    setScheduleType(option);
                    setShowSelectScheduleCard(false);
                    setOpenDrawer(true);
                    break;
                case 'return':
                    setScheduleType(option);
                    setShowSelectScheduleCard(true);
                    setOpenDrawer(false);
                    break;
                case 'managePatient':
                    setOpenDrawer(true);
                    setShowSelectScheduleCard(false);
                    break;
            }
        }
    }

    const handleSelectEntity = (entityAux: any) =>{
        setEntity(entityAux);

        const drawerOptionAux = hanldeActiveCallsDrawerOptions({patient:patient, entity:entityAux, schedule:schedule});
        setDrawerOption(drawerOptionAux);

        if (selectDrawerOptions) {
            setOpenDrawer(false);

            switch (selectDrawerOptions) {
                case 'schedule':
                    setShowSelectPatientCard(true);
                    break;
                case 'information':
                    setShowSelectPatientCard(true);
                    break;
                case 'reschedule':
                    setShowSelectPatientCard(true);
                    break;
                case 'cancel':
                    setShowSelectPatientCard(true);
                    break;
                case 'return':
                    setShowSelectPatientCard(true);
                    break;
                case 'managePatient':
                    setShowSelectPatientCard(true);
                    break;
            }
        }
    }

    const handleSelectSchedule = (scheduleAux: any) =>{
        setEntity(scheduleAux);

        const drawerOptionAux = hanldeActiveCallsDrawerOptions({patient:patient, entity:entity, schedule:scheduleAux})
        setDrawerOption(drawerOptionAux);

        if (selectDrawerOptions && (selectDrawerOptions === 'reschedule' || selectDrawerOptions === 'return')) {
            setOpenDrawer(true);
        }
    }

    const handleUnSelectEntity = () =>{
        setEntity(undefined);
        handleUnSelectPatient();
        handleUnSelectSchedule();
    }

    const handleUnSelectPatient = () =>{
        setPatient(undefined);
        handleUnSelectSchedule();
    }

    const handleUnSelectSchedule = () =>{
        setPatient(undefined);
    }

    const handleEndUnblockCall = () => {
        mutateUnblockCallInCache(callDetailsData?.call_id);
    }

    const renderOptions = (options: any[]) => {
        return options.map((item) => {

            return (
                <>
                    {(item.divider) &&
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <Menu.Divider style={{ marginTop: 8, marginBottom: 8, width: '90%', alignContent: 'center', border: '1px solid #D9D9D9' }} />
                        </div>
                    }
                   <Menu.Item key={item?.key} onClick={() => onClickOption(item)}>
                        <span>
                            {item.label}
                        </span>
                    </Menu.Item>
                </>
            )
        });
    };

    const hanldeActiveCallsDrawerOptions = ({patient, entity, schedule, key, callerPhoneData}: any) =>{
        const activeCallsDrawerOptions: { [key: string]: ICallsDrawerOptions } = {
            schedule: {
                titleLabel: NEW_SCHEDULE_TITLE,
                children: <FormServiceSchedulingComponent close={handleCloseDrawer} editData={{ patient: patient, client: entity }} repeatEnable={true} isEdit={false} editSerie={false} />,
                callReason: CREATE_SCHEDULE_CALL_REASON
            },
            reschedule: {
                titleLabel: RESCHEDULE_TITLE,
                children: <FormServiceSchedulingComponent close={handleCloseDrawer} editData={schedule} isEdit={true} editSerie={false} />,
                callReason: RESCHEDULE_CALL_REASON
            },
            return: {
                titleLabel: RETURN_SCHEDULE_TITLE,
                children: <FormServiceSchedulingComponent close={handleCloseDrawer} editData={schedule} isEdit={true} editSerie={false} />,
                callReason: RETURN_SCHEDULE_CALL_REASON
            },
            cancel: {
                titleLabel: CANCEL_SCHEDULE_TITLE,
                children: <FormCanceledSchedulingComponent close={handleCloseDrawer} id={patient?.id}/>,
                callReason: CANCEL_SCHEDULE_CALL_REASON
            },
            praise_complain: {
                titleLabel: NEW_PRAISE_COMPLAINT_TITLE,
                children: <FeedbackForm form={drawerForm} onCloseDrawerFeedback={handleCloseDrawer} />,
                callReason: PRAISE_COMPLAIN_CALL_REASON
            },
            information: {
                titleLabel: INFORMATION_TITLE,
                children: <SeePatientDrawer data={patient} />,
                callReason: INFORMATION_CALL_REASON
            },
            other: {
                titleLabel: NOT_SCHEDULE_TITLE,
                children: <NotScheduleDrawer user={user} selectedCall={callDetailsData} close={handleCloseDrawer} form={drawerForm} />,
            },
            managePatient: {
                titleLabel: PATIENT_TITLE,
                children: <CreateOrUpdatePatientDrawer form={drawerForm} createOrUpdatePatient='update' close={handleCloseDrawer} data={callerPhoneData} selectedCall={callDetailsData} patientId={patient?.id} mutateGetOneCall={mutateGetOneCall}/>,
                callReason: MANAGE_PATIENT_CALL_REASON
            },
            newClient: {
                titleLabel: NEW_CLIENT_TITLE,
                children: <CreateOrdUpdateClientDrawer form={drawerForm} createOrUpdateClient='create' close={handleCloseDrawer} data={callerPhoneData} selectedCall={callDetailsData} mutateGetOneCall={mutateGetOneCall}/>,
                callReason: CREATE_CLIENT_CALL_REASON
            },
            newPatient: {
                titleLabel: NEW_PATIENT_TITLE,
                children: <CreateOrUpdatePatientDrawer form={drawerForm} createOrUpdatePatient='create' close={handleCloseDrawer} data={callerPhoneData} selectedCall={callDetailsData} mutateGetOneCall={mutateGetOneCall}/>,
                callReason: CREATE_PATIENT_CALL_REASON
            },
            associatePatient: {
                titleLabel: ASSOCIATE_CLIENT_TITLE,
                children: <AssociateClientOrPatientDrawer activeCallDetails={callDetailsData} selectedCall={callDetailsData} close={handleCloseDrawer} entity={PATIENT_ENTITY} form={drawerForm} />,
                callReason: ASSOCIATE_PATIENT_CALL_REASON
            },
            associateClient: {
                titleLabel: ASSOCIATE_PATIENT_TITLE,
                children: <AssociateClientOrPatientDrawer activeCallDetails={callDetailsData} selectedCall={callDetailsData}  close={handleCloseDrawer} entity={CLIENT_ENTITY} form={drawerForm} />,
                callReason: ASSOCIATE_CLIENT_CALL_REASON
            },
        };
        
        const option = key ? key : selectDrawerOptions;
        const drawerOptionAux = activeCallsDrawerOptions[option];

        return drawerOptionAux
    }

    return (
        <div style={{ margin: '32px 32px' }}>
            <div>
                <a onClick={() => navigate(`/calls`)}><ArrowLeftOutlined style={{ marginRight: 6 }} />Ver lista de chamadas</a>
            </div>
            <Title level={3} style={{ marginTop:16 , marginBottom:16 }}>Chamadas Ativas</Title>
            <div >
                <DisplayAlert style={{ marginBottom: 16 }}/>
            </div>
            <Row gutter={[16, 16]}>
                <Col xs={4} sm={4} md={4} lg={4} xl={4}>
                    <div style={{
                        background:
                            '#FAFAFA',
                        padding: '8px 0px',
                        border: '1.5px solid #D9D9D9',
                        borderRadius: 8,
                    }}>
                        <Menu
                            selectedKeys={[selectDrawerOptions]}
                            style={{
                                backgroundColor: '#FAFAFA',
                                color: '#000000',
                                border: 'none',
                            }}
                        >
                            {
                                callDetailsData?.entity_id ?
                                    renderOptions(associatedContactOptionsItems) : renderOptions(notAssociatedContactOptionsItems)
                            }
                        </Menu>
                    </div>
                </Col>
                <div style={{ width: '83%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {
                        isLoadingGetOneCall ?
                            <CardLoading />
                            :
                            <CallInfoCard isLoading={isLoadingGetOneCall || isFetchingGetOneCall} callDetailsData={callDetailsData} handleEndUnblockCall={handleEndUnblockCall} />

                    }
                    {showActionCards && (
                        <>
                            {
                                (showSelectEntityCard && clientResponsible) &&
                                <SelectEntityCard responsible={clientResponsible} entity={entity} handleUnSelectEntity={handleUnSelectEntity} handleSelectEntity={handleSelectEntity} />
                            }
                            {
                                (showSelectPatientCard && (entity || patientResponsible)) &&
                                <SelectPatientCard responsible={patientResponsible} client={entity} patient={patient} handleSelectPatient={handleSelectPatient} unSelectPatient={handleUnSelectPatient} />
                            }
                            {
                                (showSelectScheduleCard && patient) &&
                                <SelectScheduleServiceCard schedule={schedule} selectSchedule={handleSelectSchedule} handleUnSelectSchedule={handleUnSelectSchedule} patient={patient} scheduleType={scheduleType} />
                            }
                        </>
                    )}
                </div>
            </Row>
            <GenericDrawer
                title={drawerOption?.titleLabel}
                children={drawerOption?.children}
                onClose={() => handleCloseDrawer()}
                open={openDrawer}
                closeIfClickOutside={false}
            />
        </div>
    )
}
