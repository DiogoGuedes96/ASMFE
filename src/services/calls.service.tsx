import { download, get, post, put } from "./api.service"

const ASSOCIATE_CLIENT_CALL_REASON: string = 'Associar um Cliente';
const ASSOCIATE_PATIENT_CALL_REASON: string = 'Associar um Utente';
const CREATE_CLIENT_CALL_REASON: string = 'Associar um Cliente';
const CREATE_PATIENT_CALL_REASON: string = 'Associar um Utente';
const MANAGE_PATIENT_CALL_REASON: string = 'Gestão de Utente';

const CREATE_SCHEDULE_CALL_REASON: string = 'Criação de Agendamento';
const RESCHEDULE_CALL_REASON: string = 'Reagendamento';
const CANCEL_SCHEDULE_CALL_REASON: string = 'Cancelamento de Agendamento';
const PRAISE_COMPLAIN_CALL_REASON: string = 'Elogio ou Reclamação';
const RETURN_SCHEDULE_CALL_REASON: string = 'Pedido de Retorno';
const INFORMATION_CALL_REASON: string = 'Pedido de Informação';

const CLIENT_ENTITY: string = 'Cliente';
const PATIENT_ENTITY: string = 'Utente';

const NEW_CLIENT_TITLE: string = 'Novo Cliente';
const PATIENT_TITLE: string = 'Utente';
const NEW_PATIENT_TITLE: string = 'Novo Utente';
const NEW_PRAISE_COMPLAINT_TITLE: string = 'Novo Elogio ou Reclamação';
const NEW_SCHEDULE_TITLE: string = 'Novo Agendamento';
const INFORMATION_TITLE: string = 'Informação do Utente';
const NOT_SCHEDULE_TITLE: string = 'Motivo do Contacto';
const RESCHEDULE_TITLE:string = 'Reagendamento';
const RETURN_SCHEDULE_TITLE:string = 'Retorno de Agendamento';
const CANCEL_SCHEDULE_TITLE:string = 'Cancelar Agendamento';
const ASSOCIATE_CLIENT_TITLE: string = 'Associar um telefone a utente existente';
const ASSOCIATE_PATIENT_TITLE: string = 'Associar um telefone a cliente existente';

const NEW_CLIENT_FOOTER_BUTTON_LABEL: string = 'Criar cliente';
const NEW_PATIENT_FOOTER_BUTTON_LABEL: string = 'Criar utente';
const SAVE_FOOTER_BUTTON_LABEL: string = 'Gravar';
const CALL_HANGUP_STATUS_NOT_MISSED: string = '16';

const getCallsInProgress = () => {
    return get('calls/v2/in-progress')
}

const getBlockedCallsInCache = () => {
    return get('calls/v2/cache/blocked')
}

const blockCallInCache = ( call_id: number) => {
    return post(`calls/v2/cache/add`, { call_id:  call_id});
};

const unblockCallInCache = ( call_id: number ) => {
    return put(`calls/v2/cache/remove`, { call_id:  call_id});
};

const getCallsHangup = (
    currentPage?: number, 
    perPage?: number, 
    search?: string, 
    sorter?: { field: string, order: string } | undefined,
    searchStartDate?: any, 
    searchEndDate?: any 
) => {
    let url = 'calls/v2/hangup';

    const queryParams: {
        currentPage?: string,
        perPage?: string,
        search?: string,
        sorter?: string,
        fieldSorter?: string,
        searchStartDate?: string
        searchEndDate?: string
    } = {};

    if (currentPage)
        queryParams['currentPage'] = currentPage.toString();

    if (perPage)
        queryParams['perPage'] = perPage.toString();

    if (search)
        queryParams['search'] = search;

    if (searchStartDate)
        queryParams['searchStartDate'] = searchStartDate;

    if (sorter && sorter.order && sorter.field) {
        queryParams['sorter'] = sorter.order;
        queryParams['fieldSorter'] = sorter.field;
    }

    if (searchEndDate)
        queryParams['searchEndDate'] = searchEndDate;

    const queryString = new URLSearchParams(queryParams).toString();

    if (queryString) {
        url += `?${queryString}`;
    }

    return get(url);
};


const getCallsMissed = (
    currentPage?: number, 
    perPage?: number, 
    sorter?: { field: string, order: string } | undefined,
    ) => {
    let url = 'calls/v2/missed';

    const queryParams: {
        page?: string,
        perPage?: string,
        sorter?: string,
        fieldSorter?: string,
    } = {};

    if (currentPage)
        queryParams['page'] = currentPage.toString();

    if (perPage)
        queryParams['perPage'] = perPage.toString();

    if (sorter && sorter.order && sorter.field) {
        queryParams['sorter'] = sorter.order;
        queryParams['fieldSorter'] = sorter.field;
    }


    const queryString = new URLSearchParams(queryParams).toString();

    if (queryString) {
        url += `?${queryString}`;
    }

    return get(url);
};

const getLastSalesAndProducts = (clientId: any) => {
    return get(`calls/v2/orders/${clientId}`)
}

const terminateCall = ({ callId }: any) => {
    return put(`calls/v2/closeGhostCall/${callId}`)
}

const getOneCall = (callId: number) => {
    return get(`calls/v2/${callId}`)
}

const updateCall = (data: any) => {
    return put(`calls/v2/update`, data)
}

const exportAnsweredCalls = ({
    search, searchStartDate, searchEndDate
  }: {
    search?: string;
    searchStartDate?: any;
    searchEndDate?: any;
  }) => {
    let url = 'calls/v2/hangup/export';

    const queryParams: {
        search?: string,
        searchStartDate?: any
        searchEndDate?: any
    } = {};

    if (search)
        queryParams['search'] = search;

    if (searchStartDate)
        queryParams['searchStartDate'] = searchStartDate;

    if (searchEndDate)
        queryParams['searchEndDate'] = searchEndDate;

    const queryString = new URLSearchParams(queryParams).toString();

    if (queryString) {
        url += `?${queryString}`;
    }

    return download(url, `chamadas.pdf`);
};

const handlePhoneToUse = (callInfo: any) => {
    if (callInfo?.callee_phone){
        return Number(callInfo?.callee_phone);
    }else if (callInfo?.caller_phone){
        return Number(callInfo?.caller_phone);
    }else{
        return null
    }
}

export {
    getOneCall,
    getCallsInProgress,
    getBlockedCallsInCache,
    blockCallInCache,
    unblockCallInCache,
    getCallsHangup,
    getCallsMissed,
    getLastSalesAndProducts,
    terminateCall,
    updateCall,
    exportAnsweredCalls,
    ASSOCIATE_CLIENT_CALL_REASON,
    ASSOCIATE_PATIENT_CALL_REASON,
    CLIENT_ENTITY,
    PATIENT_ENTITY,
    NEW_CLIENT_TITLE,
    NEW_PATIENT_TITLE,
    NOT_SCHEDULE_TITLE,
    ASSOCIATE_CLIENT_TITLE,
    ASSOCIATE_PATIENT_TITLE,
    NEW_CLIENT_FOOTER_BUTTON_LABEL,
    NEW_PATIENT_FOOTER_BUTTON_LABEL,
    SAVE_FOOTER_BUTTON_LABEL,
    CALL_HANGUP_STATUS_NOT_MISSED,
    CREATE_CLIENT_CALL_REASON,
    CREATE_PATIENT_CALL_REASON,
    CREATE_SCHEDULE_CALL_REASON,
    RESCHEDULE_CALL_REASON,
    CANCEL_SCHEDULE_CALL_REASON,
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
}
