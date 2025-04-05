import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Switch, Typography } from "antd";
import { useEffect, useState } from 'react';
import { EnumTransportFeature } from "../../Enums/TransportFeature";
import { REQUIRED_FIELD_LABEL, isWhitespace } from "../../services/utils";
import TextPhoneDynamicFields from "../Commons/Field/text-phone-dynamic-fields";
import AssociateClientDynamicFields from "../Commons/Field/associate-client-dynamic-fields";
import DisplayAlert from "../Commons/Alert";
import moment from "moment";
import dayjs from "dayjs";
import ReturnButton from "../Commons/Buttons/return-button.components";
import { CreateOrUpdatePatientDrawerProps } from "../../Interfaces/Patients.interfaces";
import { AlertService } from "../../services/alert.service";
import { getPatientDetails, patientEdit, patientPost } from "../../services/patient.service";
import { useMutation, useQuery } from "react-query";

const { TextArea } = Input;
const { Title } = Typography;

export default function CreateOrUpdatePatientDrawer({ form, createOrUpdatePatient, selectedCall, mutateGetOneCall, close, patientId = null, data = null }: CreateOrUpdatePatientDrawerProps) {
  const [statusChecked, setStatusChecked] = useState(true);
  const dateFormat = "DD/MM/YYYY";

  let patientIds: number[] = [];
  let clientIds: number[] = [];

  const { isLoading: isLoadingGetPatientDetails } = useQuery(
    ["getPatientDetalils", patientId],
    () => {
      if (patientId) {
        return getPatientDetails(parseInt(patientId));
      }

      return Promise.resolve(); 
    },
    {
      onSuccess: async (data: any) => {
        if (data?.data && Object.keys(data?.data).length > 0) {
          handlePopulatePatientData(data?.data);
        }
      },
    }
  );

  const newPatient = (frmdetails: {}) => patientPost(frmdetails);
  const { mutate: mutatePostPatient } = useMutation(newPatient, {
    onSuccess: () => {
      close(true, true);
      AlertService.sendAlert([{ text: 'Utente criado com sucesso.' }])
    },
  });

  const editPatient = ({ patient, frmdetails }: { patient: any, frmdetails: {} }) => patientEdit(patient, frmdetails);
  const { mutate: mutatePutPatient } = useMutation(editPatient, {
    onSuccess: () => {
      if (selectedCall?.id)
        mutateGetOneCall?.(selectedCall.id);
      close(true, true);
      AlertService.sendAlert([{ text: 'Utente editado com sucesso.' }])
    }
  });

  const SwitchChange = () => {
    const newStatus = !statusChecked ? true : false;
    setStatusChecked(newStatus);
    form.setFieldValue('status', newStatus);
  }

  const disabledDate = (current: any) => {
    return current && current > moment().startOf("day");
  };

  const handlePopulatePatientData = (data: any) => {
    let initialValue: Record<string, any> = {};
    if (data && Object.keys(data).length > 0) {
      initialValue = {
        id: data.id,
        name: data.name,
        patient_number: data.patientNumber,
        nif: data.nif,
        birthday: data.birthday ?
          dayjs(
            moment(data.birthday).format(
              dateFormat
            ),
            dateFormat
          ) :
          null,
        email: data.email,
        address: data.address,
        postal_code: data.postalCode,
        postal_code_address: data.postalCodeAddress,
        transport_feature: data.transportFeature,
        patient_observations: data.patientObservations,
        status: data.status ? true : false,
        patient_phone_number: data.phoneNumber,
      };

      if (data && data.clients) {
        data.clients.forEach((value: any) => {
          initialValue[`dynamic_entity_${value.id}`] = value.id;
        });
      }

      if (data && data.responsibles) {
        data.responsibles.forEach((value: any) => {
          initialValue[`dynamic_id_${value.id}`] = value.id;
          initialValue[`dynamic_name_${value.id}`] = value.name;
          initialValue[`dynamic_phone_number_${value.id}`] = value.phoneNumber;
        });
      }

      setStatusChecked(initialValue.status);
      form.setFieldsValue(initialValue);
    }
  }

  useEffect(() => {
    handlePopulatePatientData(data);
  }, [data])

  if (data && data.responsibles) {
    patientIds = data.responsibles.map((patient: any) => patient.id);
  }

  if (data && data.clients) {
    clientIds = data.clients.map((client: any) => client.id);
  }

  const handleSubmitForm = () => {
    if (createOrUpdatePatient === 'create') {
      saveNewPatient();
    } else if (createOrUpdatePatient === 'update') {
      saveEditPatient();
    }
  }


  const saveNewPatient = () => {
    form.validateFields().then((values: any) => {
      values.birthday = values.birthday.$y + '-' + (values.birthday.$M + 1) + '-' + values.birthday.$D
      const data = handleDynamicEntities(values);

      mutatePostPatient(data);
      form.resetFields()
      close();
    }).catch((error) => {
      console.info("error: ", error);
    })
  }

  const saveEditPatient = () => {
    form.validateFields().then((values: any) => {
      values.birthday = values.birthday.format('YYYY-MM-DD')
      values.status = values.status ? 1 : 0;

      data = handleDynamicEntities(values);

      mutatePutPatient({ patient: data.id, frmdetails: data });
      form.resetFields()
      close();
    }).catch((error) => {
      console.info("error: ", error);
    })
  }

  const handleDynamicEntities = (data: any): { entities: number[] } => {
    const entities: number[] = [];

    Object.keys(data).forEach((key) => {
      if (key.startsWith("dynamic_entity_")) {
        entities.push(data[key]);
      }
    });

    return { ...data, entities };
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <div>
          <Row>
            <Col>
              <Title style={{ marginTop: 0 }} level={5}>
                Informações do Utente
              </Title>
            </Col>
          </Row>
          <Form
            form={form}
            layout="vertical"
            style={{ width: "100%" }}
            autoComplete="off"
            initialValues={
              {
                'status': statusChecked
              }
            }
          >
            <Row gutter={[16, 16]}>
            <Form.Item
              label="id"
              name="id"
              style={{ display: 'none' }}
            >
              <Input />
            </Form.Item>
              <div style={{ width: '100%' }}>
                <DisplayAlert show={["warning", "error"]} />
              </div>
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item
                      label="Nome utente"
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
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="NIF"
                      name="nif"
                      rules={[
                        {
                          required: true,
                          message: REQUIRED_FIELD_LABEL,
                        },
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
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Número utente"
                      name="patient_number"
                      rules={[
                        {
                          required: true,
                          message: REQUIRED_FIELD_LABEL,
                        },
                        {
                          validator: (_, value: number) => {
                            if (value >= 0 && value?.toString()?.length < 9) {
                              return Promise.reject('O número de utente deve ter 9 dígitos');
                            }
                            return Promise.resolve();
                          },
                        }
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }} maxLength={9} />
                    </Form.Item>
                  </Col>
                </ Row>
              </Col>
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Form.Item
                        label="Telefone"
                        name="patient_phone_number"
                        rules={[
                          {
                            required: true,
                            message: REQUIRED_FIELD_LABEL,
                          },
                          {
                            validator: (_, value: number) => {
                              if (value >= 0 && value?.toString()?.length < 9) {
                                return Promise.reject('O número de telefone deve ter 9 dígitos');
                              }
                              return Promise.resolve();
                            },
                          }
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }} maxLength={11} parser={(value) => `${value}`.replace(/[^0-9]/g, '')}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} />
                      </Form.Item>
                    </div>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Data nascimento"
                      name="birthday"
                      rules={[
                        {
                          required: true,
                          message: REQUIRED_FIELD_LABEL,
                        },
                      ]}
                    >
                      <DatePicker disabledDate={disabledDate} placeholder="ex: 27/08/2015" format={"DD/MM/YYYY"} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        {
                          required: false
                        },
                        {
                          type: 'email',
                          message: 'O email deve conter um formato válido',
                        },
                      ]}
                    >
                      <Input type="email" showCount maxLength={50} />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col span={18}>
                    <Form.Item
                      label="Morada"
                      name="address"
                      rules={[
                        {
                          required: true,
                          message: REQUIRED_FIELD_LABEL,
                        },
                        {
                          validator(_, value) {
                            if (value && isWhitespace(value)) {
                              return Promise.reject('Insira uma morada válida.');
                            }
                            return Promise.resolve();
                          },
                        }
                      ]}
                    >
                      <Input showCount
                        maxLength={255} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Código postal"
                      name="postal_code"
                      rules={[
                        {
                          required: true,
                          message: REQUIRED_FIELD_LABEL,
                        },
                        {
                          validator: (_, value: number) => {
                            if (value >= 0 && value?.toString()?.length < 7) {
                              return Promise.reject('O código-postal deve ter 7 dígitos');
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="xxxx-xxx"
                        formatter={value => `${value}`.replace(/^(\d{4})/, '$1-')}
                        parser={value => value ? value.toString().replace(/[^0-9]/g, '') : ''}
                        maxLength={8}
                      />
                    </Form.Item>
                  </Col>
                </ Row>
              </Col>
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col span={14}>
                    <Form.Item
                      label="Localidade"
                      name="postal_code_address"
                      rules={[
                        {
                          required: true,
                          message: REQUIRED_FIELD_LABEL,
                        },
                        {
                          validator(_, value) {
                            if (value && isWhitespace(value)) {
                              return Promise.reject('Insira uma localidade válida.');
                            }
                            return Promise.resolve();
                          },
                        }
                      ]}
                    >
                      <Input showCount maxLength={255} />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      label="Característica do transporte"
                      name="transport_feature"
                      rules={[
                        {
                          required: true,
                          message: REQUIRED_FIELD_LABEL,
                        },
                      ]}
                    >
                      <Select placeholder="Seleciona">
                        {Object.keys(EnumTransportFeature).map(key => (
                          <Select.Option key={key} value={key}>
                            {EnumTransportFeature[key as keyof typeof EnumTransportFeature]}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </ Row>
              </Col>
              <Title style={{ marginLeft: '0.5Rem', marginBottom: 16 }} level={5}>
                Responsáveis do Utente
              </Title>
              <TextPhoneDynamicFields textFieldName="Responsável" phoneFieldName="Telemóvel" linkText="Adicionar responsável" DynamicFieldsNumber={patientIds} />
              <Title style={{ marginLeft: '0.5rem', marginBottom: 16 }} level={5}>
                Clientes
              </Title>
              <AssociateClientDynamicFields textFieldName="entity" DynamicFieldsNumber={clientIds} />
              <Col span={24}>
                <Form.Item
                  label="Observações"
                  name="patient_observations"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    },
                    {
                      validator(_, value) {
                        if (value && isWhitespace(value)) {
                          return Promise.reject('Insira uma observação válida.');
                        }
                        return Promise.resolve();
                      },
                    }
                  ]}
                >
                  <TextArea autoSize={{ minRows: 3, maxRows: 5 }} showCount
                    maxLength={255} />
                </Form.Item>
              </Col>
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
                  <Switch defaultChecked={true} onClick={SwitchChange} /> {statusChecked ? 'Ativo' : 'Inativo'}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        <div>
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Button
                type="primary"
                size="large"
                block
                onClick={() => handleSubmitForm()}
              >
                {createOrUpdatePatient == 'update' ? "Gravar alterações" : "Criar utente"}
              </Button>
              <ReturnButton closeDrawer={close} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
