import { IUser } from "../Interfaces/Users.interfaces";
import { del, get, post, put } from "./api.service";

export const listUserRole = (
  currentPage: number,
  perPage: number,
  sorter: { field: string, order: string } | undefined,
  search: string | undefined
) => {
  let url = `users/v2/list`;

  const queryParams: {
    page?: string,
    search?: string,
    fieldSorter?: string,
    sorter?: string,
    perPage?: string,
  } = {};

  if (currentPage)
    queryParams['page'] = currentPage.toString();

  if (perPage)
    queryParams['perPage'] = perPage.toString();

  if (search)
    queryParams['search'] = search;

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

export const getUser = () => {
  return get("/user");
};

export const authenticate = (data: any) => {
  return post("users/v2/login", data);
};

export const deleteUser = (id: number) => {
  return del(`users/v2/${id}`);
}

export const editUser = ({ id, data }: { id: number, data: IUser }) => {
  return put(`users/v2/${id}`, data);
}

export const saveUser = (data: IUser) => {
  return post(`users/v2`, data);
}

export const getAllProfiles = () => {
  return get('users/v2/profiles');
}

export const getOperatorList = () => {
  return get('users/v2/list/coordinator');
}