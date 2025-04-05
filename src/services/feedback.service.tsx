import { del, get, post, put } from "./api.service";
const URL_START = 'feedbacks/v1';
export const feedbackList = (currentPage?: number, perPage?: number, search?:string, searchStartDate?: any, searchEndDate?: any, sorter?: string) => {
    let url = URL_START+'/list';

    const queryParams: {
        page?: string,
        search?: string,
        searchStartDate?: any,
        searchEndDate?:any,
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

    if (searchStartDate)
        queryParams['searchStartDate'] = searchStartDate;

    if (searchEndDate)
        queryParams['searchEndDate'] = searchEndDate;

    if (sorter)
        queryParams['sorter'] = sorter;

    const queryString = new URLSearchParams(queryParams).toString();

    if (queryString) {
        url += `?${queryString}`;
    }

    return get(url);
};

export const feedbackPost = (data: any) => {
    return post(URL_START+'/store', data);
}

export const feedbackEdit = (feedback: any, data: any) => {
    return put(`${URL_START}/edit/${feedback}`, data);
};

export const feedbackDelete = (feedback: number) => {
    return del(`${URL_START}/delete/${feedback}`);
};
