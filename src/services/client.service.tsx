import { get, post, put, del } from "./api.service";

export const getAllClients = ({
    currentPage, perPage, search, status, type, sorter
  }: {
    currentPage?: number;
    perPage?: number;
    search?: string;
    status?: string;
    type?: string;
    sorter?: string;
  }) => {
    let url = 'clients/v2/all';

    const queryParams: {
        page?: string,
        search?: string,
        sorter?: string,
        perPage?: string,
        status?: string
        type?: string
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

    if (type)
        queryParams['type'] = type;

    const queryString = new URLSearchParams(queryParams).toString();

    if (queryString) {
        url += `?${queryString}`;
    }

    return get(url);
};

export const createClient = (data: any) => {
    return post('clients/v2/create', data);
};

export const editClient = (data: any) => {
    return put('clients/v2/edit', data);
};

export const deleteClient = (id: number) => {
    return del(`clients/v2/delete/${id}`);
};

export const listAllClients = () => {
    return get('clients/v2');
}

export const getClientsFromResponsible = ( responsibleId: number ) => {
    return get(`clients/v2/clients-from-responsible/${responsibleId}`);
}