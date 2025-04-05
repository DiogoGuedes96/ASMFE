import { IGroupRequest } from "../Interfaces/Group.interfaces";
import { del, get, post, put } from "./api.service";
const URL = "ambulance-crew/v1/group";
const listGroupRole = (currentPage: number, perPage: number, sorter: { field: string, order: string } | undefined, search: string | undefined) => {
  let url = URL;

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

const postAmbulanceGroup = (data:IGroupRequest) => {
  return post(URL + "/store", data);
}

const putAmbulanceGroup = (data:IGroupRequest, ambulanceGroupId: number) => {
  return put(`${URL}/edit/${ambulanceGroupId}`, data);
}

const delAmbulanceGroup = (ambulanceGroupID: number) => {
  return del(`${URL}/delete/${ambulanceGroupID}`);
}
export {
  listGroupRole,
  postAmbulanceGroup,
  putAmbulanceGroup,
  delAmbulanceGroup
}
