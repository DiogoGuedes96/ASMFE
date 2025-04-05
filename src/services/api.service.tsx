import axios from "axios";
import { AlertService } from "../services/alert.service";

const userLogged = localStorage.getItem("user");

const defaultHeader = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

const token = userLogged
  ? {
      Authorization: `Bearer ${JSON.parse(userLogged).token}`,
    }
  : {};
  
const client =
  process.env.REACT_APP_CLIENT 
    ? { client: process.env.REACT_APP_CLIENT }
    : {};

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
  headers: { ...defaultHeader, ...token, ...client },
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 422) {
      Object.keys(error.response.data.errors)
              .forEach(key => error.response.data.errors[key]
                  .forEach((messageTxt: any) => AlertService.sendAlert([{ text: messageTxt, type: 'error' }])));
    } else {
      AlertService.sendAlert([{text: error.response.data.error || error.response.data.message || 'Erro ao fazer loading', type: 'error'}]);
    }
    
    return Promise.reject(error)
  }
);

const put = async (url: string, params: any = null) => {
  const response = await api.put(url, params);
  return response.data;
};

const del = async (url: string) => {
  const response = await api.delete(url);
  return response.data;
};

const get = async (url: string, data: any = null) => {
  const response = await api.get(url);
  return response.data;
};

const post = async (url: string, params: any) => {
  const response = await api.post(url, params);
  return response?.data;
};

const download = async (url: string, fileName = `${new Date().getTime()}.pdf`) => {
  const response = await api.get(url, {
      responseType: "blob",
  });

  const urlBlob = window.URL.createObjectURL(new Blob([response.data]));

  const link = document.createElement("a");
  link.href = urlBlob;
  link.setAttribute("download", fileName);

  document.body.appendChild(link);

  link.click();
  window.URL.revokeObjectURL(urlBlob);
};


export { put, del, get, post, download };
