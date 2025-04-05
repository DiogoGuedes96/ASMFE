import { Button, Col, DatePicker, Form, FormInstance, Input, InputNumber, Row, Typography } from "antd";
import { useEffect } from "react";
import OneDynamicField from "../Commons/Field/one-dynamic-field.component";
import { useMutation } from "react-query";
import TextArea from "antd/es/input/TextArea";
import dayjs from 'dayjs';
import moment from "moment";
import DisplayAlert from "../Commons/Alert";
import { REQUIRED_FIELD_LABEL } from "../../services/utils";

import {
  feedbackEdit,
  feedbackPost,
} from "../../services/feedback.service";
import { AlertService } from "../../services/alert.service";
import { Convert } from "../../services/convert.service";
import ReturnButton from "../Commons/Buttons/return-button.components";

const { Title } = Typography;

interface FeedbackFormProps {
  isEdit?: boolean,
  form: FormInstance;
  close?: () => void,
  openEditFormFeedback?: boolean,
  editData?: any,
  onSubmitClearFilters?: () => void,
  onCloseDrawerFeedback?: (updateCallReason?: boolean) => void,
}

export default function FeedbackForm({
  form,
  editData,
  openEditFormFeedback,
  close,
  onSubmitClearFilters,
  onCloseDrawerFeedback,
  isEdit = false,
}: FeedbackFormProps) {
  let whoIds: number[] = []
  const dateFormat = "DD/MM/YYYY";

  const newFeedback = (frmdetails: {}) => feedbackPost(frmdetails);
  const { mutate: mutatePostFeedback } = useMutation(newFeedback, {
    onSuccess: () => {
      onCloseDrawerFeedback?.(true);
      onSubmitClearFilters?.();
      AlertService.sendAlert([
        { text: "Novo Elogio/Reclamação criado com sucesso." },
      ]);
    },
  });

  const editFeedback = ({
    feedback,
    frmdetails,
  }: {
    feedback: any;
    frmdetails: {};
  }) => feedbackEdit(feedback, frmdetails);
  const { mutate: mutatePutFeedback } = useMutation(editFeedback, {
    onSuccess: () => {
      onCloseDrawerFeedback?.(true);
      onSubmitClearFilters?.();
      AlertService.sendAlert([
        { text: "Elogio/Reclamação editado com sucesso." },
      ]);
    },
  });

  const saveNewFeedback = () => {
    form.validateFields()
      .then((values: any) => {
        const data = Convert.dynamicField(values, "feedbackWho", "name");
        if (data.date) data.date = Convert.date(data.date);
        if (data.time) data.time = Convert.time(data.time);
        mutatePostFeedback(data);
      })
      .catch((error) => {
        console.info("error: ", error);
      });
  };

  const saveEditFeedback = () => {
    form.validateFields()
      .then((values: any) => {
        const data = Convert.dynamicField(values, "feedbackWho", "name");
        if (data.date) data.date = data.date.format("YYYY-MM-DD");
        if (data.time) data.time = data.time.format("HH:mm");
        mutatePutFeedback({ feedback: data.id, frmdetails: data });
      })
      .catch((error) => {
        console.info("error: ", error);
      });
  };

  useEffect(() => {
    if (editData && Object.keys(editData).length > 0) {
      let initialValue: Record<string, any> = {};
      const [hours, minutes] = editData.time ? editData.time.split(":") : [0, 0];
      initialValue = {
        id: editData.id,
        name: editData.name,
        patient_number: editData.patientNumber > 0 ? editData.patientNumber : '',
        reason: editData?.reason,
        date: editData.date ?
          dayjs(
            moment(editData.date).format(dateFormat),
            dateFormat
          )
          : null,
        time: hours && minutes ? dayjs(hours + ":" + minutes, "HH:mm") : '',
        observations: editData?.description
      };
      editData.feedbackWho.forEach((value: any) => {
        initialValue[`dynamic_id_${value.id}`] = value.id;
        initialValue[`dynamic_name_${value.id}`] = value.name;
      });
      form.setFieldsValue(initialValue);
    }
  }, [editData])

  if (openEditFormFeedback) {
    whoIds = editData.feedbackWho.map((who: any) => who.id);
  } else {
    whoIds = [1];
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <div>
          <Title style={{ marginTop: 0 }} level={5}>
            Informações do Utente
          </Title>
          <Form
            form={form}
            layout="vertical"
            style={{ width: "100%" }}
            autoComplete="off"
          >
            <div style={{ width: '100%' }}>
              <DisplayAlert show={['error']} />
            </div>
            <Row gutter={[16, 0]}>
              <Col span={24}>
                {
                  isEdit && (
                    <Form.Item
                      label="id"
                      name="id"
                      style={{ display: 'none' }}
                    >
                      <Input />
                    </Form.Item>
                  )
                }
                <Form.Item
                  label="Nome"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col span={6}>
                <Form.Item
                  label="Número Utente"
                  name="patient_number"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (value >= 0 && value?.toString()?.length < 9) {
                          return Promise.reject('O Número Utente deve ter 9 dígitos');
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
              <Col span={18}>
                <Form.Item
                  label="Motivo"
                  name="reason"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <OneDynamicField textFieldName="A quem" linkText="Adicionar" edit={isEdit} DynamicFieldsNumber={whoIds ?? undefined} maxlength={50} />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  style={{ width: '100%' }}
                  name="date"
                  label="Data"
                >
                  <DatePicker
                    placeholder="Ex: 27/08/2015"
                    format={dateFormat}
                    style={{ width: '100%' }} disabledDate={(current) => current && (current < moment('2000-01-01') || current > moment().endOf("day"))} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  style={{ width: '100%' }}
                  name="time"
                  label="Hora"
                >
                  <DatePicker
                    picker="time"
                    format="HH:mm"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col span={24}>
                <Form.Item
                  label="Observações"
                  name="observations"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL
                    },
                  ]}
                >
                  <TextArea autoSize={{ minRows: 3, maxRows: 5 }} showCount
                    maxLength={255} />
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
                onClick={!openEditFormFeedback ? saveNewFeedback : saveEditFeedback}
              >
                {isEdit ? "Gravar alterações" : "Criar Elogio/Reclamação"}
              </Button>
              <ReturnButton closeDrawer={close} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
