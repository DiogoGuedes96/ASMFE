import { FormInstance } from 'antd';
import { ReactNode, Dispatch, SetStateAction } from 'react';
import { IPatient } from '../Interfaces/Patients.interfaces'
import { IClient } from '../Interfaces/Clients.interfaces'

export interface ICallsDrawerOptions {
    titleLabel: string;
    submitCallBack?: () => void;
    children?: ReactNode;
    callReason?: string;
}

export interface ActiveCallsDrawerProps {
    form: FormInstance;
    entity?: string;
    submitCallBack?: (value: IPatient | IClient, entity: string | undefined) => void;
    close: (updateCallReason?: boolean, reloadPage?: boolean) => void;
    selectedCall?: any
    activeCallDetails?: any;
    user?:any;
}

export interface ISelectedCalls {
    id?: number;
    caller_phone?: number;
    call_reason?: string;
    call_operator?: string; 
    client_name?: string;
    created_at?: string;
    updated_at?: string;
    hangup_status?: string;
    status?: string; 
    linkedid?: string;
}

export interface SelectEntityCardProps{
    responsible: any;
    entity: any;
    handleSelectEntity: any;
    handleUnSelectEntity:() => void;
}

export interface SelectPatientCardProps{
    responsible?: any;
    client?: any;
    patient: any;
    handleSelectPatient: any;
    unSelectPatient: () => void;
}

export interface SelectShceduleCardProps{
    patient?: any;
    schedule: any;
    scheduleType: string;   
    selectSchedule: any;
    handleUnSelectSchedule:() => void;
}