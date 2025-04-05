import { get, post, put, del } from "./api.service";

export const patientPost = (data: any) => {
    return post('patients/v1/store', data);
};

export const patientList = ({
  currentPage, perPage, search, status, sorter
}: {
  currentPage?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sorter?: string;
}) => {
    let url = 'patients/v1/list';

    const queryParams: {
        page?: string,
        search?: string,
        sorter?: string,
        perPage?: string,
        status?: string
    } = {};

    if (currentPage)
        queryParams['page'] = currentPage.toString();

    if (perPage)
        queryParams['perPage'] = perPage.toString();

    if (search)
        queryParams['search'] = search;

    if (sorter)
        queryParams['sorter'] = sorter;

    if (status)
        queryParams['status'] = status;

    const queryString = new URLSearchParams(queryParams).toString();

    if (queryString) {
        url += `?${queryString}`;
    }

    return get(url);
};

export const patientEdit = (patient: any, data: any) => {
    return put(`patients/v1/edit/${patient}`, data);
};

export const patientDelete = (patient: number) => {
    return del(`patients/v1/delete/${patient}`);
};

export const patientListBy = (value: string | undefined) => {
    return get(`patients/v1/list?search=${value}`);
}

export const addPatientResponsible = (data: any) => {
    return post('patients/v1/responsible/store', data);
}

export const patientShcedulingHistory = (patientId: number, schedulesNumber?: number | null) => {
    const number = schedulesNumber ?? 3;
    const url = `patients/v1/history/${patientId}?schedulesNumber=${number}`;

    return get(url);
}

export const patientFutureScheduling = (patientId: number, schedulesNumber?: number | null) => {
    const number = schedulesNumber ?? 3;
    const url = `patients/v1/future/${patientId}?schedulesNumber=${number}`;

    return get(url);
}

export const getPatientsFromResponsible = ( responsibleId: number ) => {
    return get(`patients/v1/patients-from-responsible/${responsibleId}`);
}

export const getPatientsFromClient = ( clientId: number ) => {
    return get(`patients/v1/patients-from-client/${clientId}`);
}

export const getPatientDetails = ( patientId: number ) => {
    return get(`patients/v1/details/${patientId}`);
}
