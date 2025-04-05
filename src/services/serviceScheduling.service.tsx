import { del, get, post, put } from "./api.service";
const URL = "scheduling/v1"
const CANCELED = `${URL}/canceled`
const getAllServiceScheduling = (currentPage?: number, perPage?: number, search?: string, sorter?: { columnKey: string, order: string } | undefined, searchStartDate?: any, searchEndDate?: any) => {
    let url = URL;

    const queryParams: {
        page?: string,
        search?: string,
        searchStartDate?: any,
        searchEndDate?: any,
        sorter?: string,
        sorterKey?: string,
        perPage?: string,
    } = {};

    if (currentPage)
        queryParams['page'] = currentPage.toString();

    if (perPage)
        queryParams['perPage'] = perPage.toString();

    if (search)
        queryParams['search'] = search;

    if (searchStartDate)
        queryParams['searchStartDate'] = searchStartDate;

    if (searchEndDate)
        queryParams['searchEndDate'] = searchEndDate;

    if (sorter && sorter.order && sorter.columnKey) {
        queryParams['sorter'] = sorter.order;
        queryParams['sorterKey'] = sorter.columnKey;
    }


    const queryString = new URLSearchParams(queryParams).toString();

    if (queryString) {
        url += `?${queryString}`;
    }

    return get(url);
}

const postScheduling = (data:any) => {
    return post(URL + "/store", data);
}

const editScheduling = ({ id, data }: { id: number, data: any }) => {
    return put(URL + `/edit/${id}`, data);
}

const restoreCanceledSchedule = ({ id }: { id: number }) => {
    return put(URL + `/canceled/restore/${id}`);
}

const deleteScheduling = (data:any) => {
    return post(`${URL}/delete`, data);
}

const getSchedulingByItem = (schedule: number) => {
    return get(`${CANCELED}/${schedule}`);
}

const getAllServiceSchedulingCanceled = (currentPage?: number, perPage?: number, search?: string, sorter?: { columnKey: string, order: string } | undefined, searchStartDate?: any, searchEndDate?: any) => {
    let url = CANCELED;

    const queryParams: {
        page?: string,
        search?: string,
        searchStartDate?: any,
        searchEndDate?:any,
        sorter?: string,
        sorterKey?: string,
        perPage?: string,
    } = {};

    if (currentPage)
        queryParams['page'] = currentPage.toString();

    if (perPage)
        queryParams['perPage'] = perPage.toString();

    if (search)
        queryParams['search'] = search;

    if (searchStartDate)
        queryParams['searchStartDate'] = searchStartDate;

    if (searchEndDate)
        queryParams['searchEndDate'] = searchEndDate;

    if (sorter && sorter.order && sorter.columnKey) {
        queryParams['sorter'] = sorter.order;
        queryParams['sorterKey'] = sorter.columnKey;
    }

    const queryString = new URLSearchParams(queryParams).toString();

    if (queryString) {
        url += `?${queryString}`;
    }

    return get(url);
}

const getRepeatSchedulePosition = (schedule: any) => {
    return get(`${URL}/getRepeatSchedulePosition/${schedule}`);
}

const getSchedulesFromPatient = ( patientId: number, withoutReturns: boolean = false ) => {
    if(withoutReturns){
        return get(`${URL}/schedules-from-patient/${patientId}/${withoutReturns}`);
    }
    return get(`${URL}/schedules-from-patient/${patientId}`);
}

export {
    getAllServiceScheduling,
    postScheduling,
    deleteScheduling,
    editScheduling,
    getSchedulingByItem,
    getAllServiceSchedulingCanceled,
    restoreCanceledSchedule,
    getRepeatSchedulePosition,
    getSchedulesFromPatient
}
