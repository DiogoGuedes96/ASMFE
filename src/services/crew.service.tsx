import { ICrew } from "../Interfaces/Crew.interfaces";
import { del, get, post, put } from "./api.service";
const URL = "ambulance-crew/v1";
const listCrewRole = (currentPage: number, perPage: number, sorter: { field: string, order: string } | undefined, search: string | undefined) => {
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

const postAmbulanceCrew = (data:ICrew) => {
  return post(URL + "/store", data);
}

const putAmbulanceCrew = (data:ICrew, ambulanceCrewId: number) => {
  return put(`${URL}/edit/${ambulanceCrewId}`, data);
}

const delAmbulanceCrew = (ambulanceCrewID: number) => {
  return del(`${URL}/delete/${ambulanceCrewID}`);
}

const CrewListBy = (value: string | undefined) => {
  return get(`${URL}/?search=${value}`);
}
export {
  listCrewRole,
  postAmbulanceCrew,
  putAmbulanceCrew,
  delAmbulanceCrew,
  CrewListBy
}
