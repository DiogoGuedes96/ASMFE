import { FormInstance } from "antd";

export interface IPatient {
    name: string;
    patient_number: number;
    nif: number;
    birthday: string;
    email: null | string;
    address: string;
    postal_code: string;
    postal_code_address: string;
    transport_feature: string;
    patient_responsible: null | string;
    phone_number: number;
    patient_observations: string;
    status: null | number;
    id?: null | number;
    patientNumber?: null | number
    phoneNumber?: null | number
    credits: number
}

export interface IPatientPageOptions {
    titleLabel: string;
    footerBtnLabel: string;
}

export interface CreateOrUpdatePatientDrawerProps {
    form: FormInstance;
    data?: any;
    createOrUpdatePatient: string;
    close: (mutateCallReason?: boolean, reloadPage?: boolean) => void;
    mutateGetOneCall?: (id: any) => void;
    selectedCall?: any
    patientId?: string | null
}
