import { Button, Col, Form, Input, InputNumber, Row, Select, Switch, Typography } from "antd";
import { useEffect, useState } from 'react';
import TextPhoneDynamicFields from "../Commons/Field/text-phone-dynamic-fields";
import { REQUIRED_FIELD_LABEL, isWhitespace } from "../../services/utils";
import { CreateOrUpdateClientDrawerProps } from "../../Interfaces/Clients.interfaces";
import { EnumClientType } from "../../Enums/ClientsType.enums";
import ReturnButton from "../Commons/Buttons/return-button.components";
import { AlertService } from "../../services/alert.service";
import { useMutation } from "react-query";
import { createClient, editClient } from "../../services/client.service";

const { Title } = Typography;

export default function CreateOrdUpdateClientDrawer({ form, createOrUpdateClient, close, mutateGetOneCall, selectedCall, data = null }: CreateOrUpdateClientDrawerProps) {
  const [statusChecked, setStatusChecked] = useState(true);

  let clientIds: number[] = [];

  const { mutate: mutateCreateClient } = useMutation(createClient, {
    onSuccess: () => {
      AlertService.sendAlert([{ text: 'Cliente criado com sucesso.' }]);
      close(true, true)
    }
  });

  const { mutate: mutateEditClient } = useMutation(editClient, {
    onSuccess: () => {
      AlertService.sendAlert([{ text: 'Cliente editado com sucesso.' }]);
      if (selectedCall?.id)
      mutateGetOneCall?.(selectedCall.id);
      close(true, true)
    }
  });

  const SwitchChange = () => {
    setStatusChecked(!statusChecked)
    form.setFieldsValue({ status: !statusChecked });
  }

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {

      let initialValue: Record<string, any> = {};
      initialValue = {
        id: data.id,
        name: data.name,
        nif: data.nif,
        email: data.email,
        address: data.address,
        status: data.status,
        phone: data.phone,
        type: data.type
      };

      if (data?.responsibles) {
        data?.responsibles?.forEach((value: any) => {
          initialValue[`dynamic_id_${value.id}`] = value.id;
          initialValue[`dynamic_name_${value.id}`] = value.name;
          initialValue[`dynamic_phone_number_${value.id}`] = value.phone;
        });
      }
      if (data.status !== undefined) {
        setStatusChecked(data.status ? true : false)
      }
      form.setFieldsValue(initialValue);
    }
  }, [data])

  if (data && data.responsibles) {
    clientIds = data.responsibles.map((client: any) => client.id);
  }

  const handleDynamicValues = (values: any) => {
    const responsibles = [];
    const finalData: any = {};

    for (const key in values) {
      if (key.startsWith('dynamic_name_')) {
        const index = key.replace('dynamic_name_', '');
        const name = values[key];
        const phoneKey = `dynamic_phone_number_${index}`;

        if (phoneKey in values) {
          const phone = values[phoneKey];
          responsibles.push({ name, phone });
        }
      } else if (!key.startsWith('dynamic_')) {
        finalData[key] = values[key];
      }
    }

    finalData.responsibles = responsibles;

    return finalData;
  };

  const handleSubmitForm = () => {
    form.validateFields().then((values: any) => {
      const data = handleDynamicValues(values);

      if (createOrUpdateClient === 'create') {
        mutateCreateClient(data);
      } else if (createOrUpdateClient === 'update') {
        mutateEditClient(data);
      }

      form.resetFields()
      close();
    }).catch((error) => {

    });
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <div>
          <Row>
            <Col>
              <Title style={{ marginTop: 0 }} level={5}>
                Informações do Cliente
              </Title>
            </Col>
          </Row>
          <Form
            form={form}
            layout="vertical"
            style={{ width: "100%" }}
            autoComplete="off"
            initialValues={{ status: true }}
          >
            <Row gutter={[16, 16]}>
              <Form.Item
                label="id"
                name="id"
                style={{ display: 'none' }}
              >
                <Input />
              </Form.Item>
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item
                      label="Nome cliente"
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
                </ Row>
              </Col>
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div style={{ display: "flex", alignItems: "center" }}>
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
                          }
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }} maxLength={9} />
                      </Form.Item>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Telefone"
                      name="phone"
                      rules={[
                        {
                          required: true,
                          message: REQUIRED_FIELD_LABEL,
                        },
                        {
                          validator: (_, value) => {
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
                  </Col>
                  <Col span={8}>
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
                  <Col span={6}>
                    <Form.Item
                      label="Tipo do cliente"
                      name="type"
                      rules={[
                        {
                          required: true,
                          message: REQUIRED_FIELD_LABEL,
                        },
                      ]}
                    >
                      <Select placeholder="Seleciona">
                        {
                          Object.keys(EnumClientType).map(key => {
                            return (
                              <Select.Option key={key} value={key}>
                                {EnumClientType[key as keyof typeof EnumClientType]}
                              </Select.Option>
                            )
                          })
                        }
                      </Select>
                    </Form.Item>
                  </Col>
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
                </ Row>
              </Col>
              <TextPhoneDynamicFields textFieldName="Responsável cliente" phoneFieldName="Telefone" linkText="Adicionar responsável" DynamicFieldsNumber={clientIds} />
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
                {(data && Object.keys(data).length > 0) ? "Gravar alterações" : "Criar cliente"}
              </Button>
              <ReturnButton closeDrawer={close} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
