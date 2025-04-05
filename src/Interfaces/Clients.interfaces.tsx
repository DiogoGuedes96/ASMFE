import { FormInstance } from 'antd';

export interface IClientPageOptions {
    titleLabel: string;
    footerBtnLabel: string;
}

export interface CreateOrUpdateClientDrawerProps {
  form: FormInstance;
  data?: any;
  createOrUpdateClient: string;
  close: (updateCallReason?: boolean, updatePage?: boolean) => void,
  mutateGetOneCall?: (id: any) => void;
  selectedCall?: any
}

export interface IClient {
  name: string;
  phone: number;
  nif: number;
  email: null | string;
  address: string;
  status: null | number;
  id?: null | number;
}