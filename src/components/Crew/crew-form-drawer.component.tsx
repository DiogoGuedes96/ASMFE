import { Col, Form, FormInstance, Input, Row, Typography, Switch, DatePicker, InputNumber, Button } from "antd";
import { useEffect, useState } from "react";
import { REQUIRED_FIELD_LABEL, isWhitespace } from "../../services/utils";
import dayjs from "dayjs";
import ReturnButton from "../Commons/Buttons/return-button.components";
import { useMutation } from "react-query";
import { AlertService } from "../../services/alert.service";
import { postAmbulanceCrew, putAmbulanceCrew } from "../../services/crew.service";
import { ICrew } from "../../Interfaces/Crew.interfaces";
import DisplayAlert from "../Commons/Alert";
const { Title } = Typography;

interface CrewDrawerProps {
  isEdit?: boolean,
  form: FormInstance;
  data?: any
  onClose: () => void
  cleanFilters: () => void

}

export default function CrewFormDrawer({ isEdit = false, form, data, onClose, cleanFilters}: CrewDrawerProps) {
  const [statusChecked, setStatusChecked] = useState(true);
  const [ambulanceCrewId, setAmbulanceCrewId] = useState<number>(0);
  const SwitchChange = () => {
    const newStatus = !statusChecked ? true : false;
    setStatusChecked(newStatus);
    form.setFieldsValue({ status: newStatus });
  }
  const dateFormat = "YYYY/MM/DD";
  form.setFieldsValue({ status: !statusChecked });

  const newAmbulanceCrew = (frmdetails: ICrew) => postAmbulanceCrew(frmdetails);
  const { mutate: mutatePostAmbulanceCrew } = useMutation(newAmbulanceCrew, {
    onSuccess: () => {
      onClose();
      cleanFilters();
      form.resetFields();
      AlertService.sendAlert([{ text: "Tripulante criado com sucesso." }]);
    },
  });

  const editAmbulanceCrew = ({ ambulanceCrew, frmdetails }: { ambulanceCrew: number, frmdetails: ICrew }) => putAmbulanceCrew(frmdetails, ambulanceCrew);
  const { mutate: mutateEditAmbulanceCrew } = useMutation(editAmbulanceCrew, {
    onSuccess: () => {
      onClose();
      cleanFilters();
      form.resetFields();
      AlertService.sendAlert([{ text: 'As informações do tripulante foram gravadas com sucesso.' }])
    }
  });
  useEffect(() => {

    if(isEdit && Object.keys(data).length > 0) {
      setAmbulanceCrewId(data.id);
      let initialValue: Record<string, any> = {};
      initialValue = {
        name: data.name,
        email: data.email,
        phone_number: data.phoneNumber,
        nif: data.nif,
        driver_license: data.driverLicense,
        address: data.address,
        contract_date: data.contractDate ? dayjs(
          data.contractDate,
          dateFormat
        ) : '',
        contract_number: data.contractNumber,
        job_title: data.jobTitle,
        status: data.status
      }
      setStatusChecked(initialValue.status);
      form.setFieldsValue(initialValue);
    }
  }, [data])

  const saveEditCrew = () => {
    form.validateFields().then((values: any) => {
      values.status = statusChecked;
      mutateEditAmbulanceCrew({ ambulanceCrew: ambulanceCrewId, frmdetails: values });
    })
    .catch((error) => {
      console.error("error: ", error);
    });
  }
  const saveNewCrew = () => {
    form.validateFields().then((values: any) => {
      values.status = statusChecked;
      mutatePostAmbulanceCrew(values);
    })
    .catch((error) => {
      console.error("error: ", error);
    });
  }
  return (
    <>
      <div style={{ width: "100%" }}>
        <DisplayAlert show={["warning", "error"]} />
      </div>
      <Form
        form={form}
        layout="vertical"
        style={{ width: "100%" }}
        autoComplete="off"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Nome"
              name="name"
              rules={[
                {
                  required: true,
                  message: REQUIRED_FIELD_LABEL,
                },
                {
                  validator(_, value) {
                    if (value && isWhitespace(value)) {
                      return Promise.reject('Insira um nome válido.');
                    }
                    return Promise.resolve();
                  },
                }
              ]}
            >
              <Input size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: REQUIRED_FIELD_LABEL,
                },
                {
                  type: 'email',
                  message: 'O email deve conter um formato válido',
                },
              ]}
            >
              <Input type="email" size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
                label="Telemóvel"
                name="phone_number"
                rules={[
                  {
                    required: true,
                    message: REQUIRED_FIELD_LABEL,
                  },
                  {
                    validator: (_, value:number) => {
                      if (value >= 0 && value?.toString()?.length < 9) {
                        return Promise.reject('O número de telefone deve ter 9 dígitos');
                      }
                      return Promise.resolve();
                    },
                  }
                ]}
              >
                <InputNumber
                  size="large" style={{ width: "100%" }} maxLength={11} parser={(value) => `${value}`.replace(/[^0-9]/g, '')}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} />
              </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="NIF"
              name="nif"
              rules={[
                {
                  validator: (_, value) => {
                    if (value >= 0 && value?.toString()?.length < 9) {
                      return Promise.reject('O NIF deve ter 9 dígitos');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                maxLength={9}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Carta de condução"
              name="driver_license"
            >
              <Input size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Morada"
              name="address"
            >
              <Input size="large" showCount maxLength={255} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Data da contratação"
              name="contract_date"
            >
              <DatePicker size="large" placeholder="" format={"DD/MM/YYYY"} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Número de contrato"
              name="contract_number"
            >
              <InputNumber size="large" style={{ width: '100%' }} maxLength={9}/>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Cargo"
              name="job_title"
            >
              <Input size="large" maxLength={100}/>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label=""
              name="status"
              rules={[
                {
                  required: false,
                },
              ]}
            >
              <Switch checked={statusChecked} onClick={SwitchChange} /> {statusChecked ? 'Ativo' : 'Inativo'}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Button type="primary" block size="large" onClick={!isEdit ? saveNewCrew : saveEditCrew}>
              {!isEdit ? 'Criar tripulante' : 'Gravar alterações'}
            </Button>
            <ReturnButton closeDrawer={onClose}/>
          </Col>
        </Row>

      </Form>
    </>

  );
}
