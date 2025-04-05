import {
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  UploadFile,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Typography,
  Modal,
  Alert,
} from "antd";
import UploadComponent from "../Commons/Upload";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { patientListBy } from "../../services/patient.service";
import AutoCompleteCustom from "../Commons/Autocomplete";
import { IPatient } from "../../Interfaces/Patients.interfaces";
import { EnumTransportFeature } from "../../Enums/TransportFeature";
import { EnumTypeService } from "../../Enums/TypeService";
import { EnumTypeVehicle } from "../../Enums/TypeVehicle";
import { EnumTypePaymentMethods } from "../../Enums/TypePaymentMethods";
import { getAllClients } from "../../services/client.service";
import { EnumCallsReason } from "../../Enums/callReason.enums";
import { Convert } from "../../services/convert.service";
import { enumPatientStatusScheduling } from "../../Enums/PatientStatusScheduling.enums";
import DetailsPatientBasicList from "../Patient/details-basic-list.component";
import TextArea from "antd/es/input/TextArea";
import { AlertService } from "../../services/alert.service";
import {
  postScheduling,
  editScheduling,
  getRepeatSchedulePosition,
} from "../../services/serviceScheduling.service";
import ReturnButton from "../Commons/Buttons/return-button.components";
import DisplayAlert from "../Commons/Alert";
import { REQUIRED_FIELD_LABEL, disabledDateMin } from "../../services/utils";
import { EnumWeekDays } from "../../Enums/WeekDays.enums";
import dayjs from "dayjs";
import moment from "moment";
import { set } from "date-fns";
import SeePatientDrawer from "../Patient/see-patient-drawer.component";

const { Title, Text } = Typography;
interface formScheduling {
  close: any;
  isEdit?: boolean;
  editSerie?: boolean;
  refetchSchedulingList?: any;
  editData?: any;
  repeatEnable?: boolean;
  cleanFilters?: any
}

export default function FormServiceSchedulingComponent({
  close,
  isEdit,
  editSerie,
  editData,
  refetchSchedulingList,
  repeatEnable,
  cleanFilters
}: formScheduling) {

  const userStorage: any = JSON.parse(localStorage.getItem("user") || "") ?? "";

  const [enableRepeat, setEnableRepeat] = useState(repeatEnable || false);
  const [isBackService, setBackService] = useState<boolean>(false);
  const [isRepeatScheduling, setRepeatScheduling] = useState<boolean>(false);
  const [useCredits, setUseCredits] = useState<boolean>(false);
  const [finishBy, setFinishBy] = useState<string | undefined>("");
  const [logicFromRepeated, setLogicFromRepeated] = useState<
    string | undefined
  >();
  const [optionsPatients, setOptionsPatients] = useState([]);
  const [searchPatient, setSearchPatient] = useState<string | undefined>();
  const [patientSelected, setPatientSelect] = useState<IPatient>();
  const [hasCompanion, setHasCompanion] = useState(false);
  const [clients, setClients] = useState<any>();
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null);
  const [hasFileError, setHasFileError] = useState(false);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[] | any>([]);
  const [schedulePosition, setSchedulePosition] = useState<number>();
  const [repeatScheduleTotal, setRepeatScheduleTotal] = useState<number>();
  const [scheduleId, setScheduleId] = useState<number>(editData?.id ?? null);
  const [form] = Form.useForm();

  const dateFormat = "DD/MM/YYYY";

  useQuery(["get-patient", searchPatient], () => patientListBy(searchPatient), {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data?.data.length) {
        setOptionsPatients(
          data.data.map((patient: IPatient) => {
            return {
              value: patient.name,
              label: (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Text strong>{patient.name}</Text>
                  <div>
                    <Text strong>NIF: </Text>
                    <Text>{patient.nif}</Text>
                  </div>
                </div>
              ),
              ...patient,
            };
          })
        );
      }
    },
  });

  const newScheduling = (frmdetails: {}) => postScheduling(frmdetails);
  const { mutate: mutatePostScheduling } = useMutation(newScheduling, {
    onSuccess: () => {
      close(true);
      form.resetFields();
      cleanFilters?.();
      refetchSchedulingList?.();
      AlertService.sendAlert([{ text: "Agendamento criado com sucesso." }]);
    },
  });

  const editSchedule = (frmdetails: {}) =>
    editScheduling({ id: editData?.id, data: frmdetails });
  const { mutate: mutateEditScheduling } = useMutation(editSchedule, {
    onSuccess: () => {
      close(true);
      form.resetFields();
      cleanFilters?.();
      refetchSchedulingList?.();
      AlertService.sendAlert([{ text: "Agendamento editado com sucesso." }]);
    },
  });

  const { isLoading: isLoadingClients } = useQuery(
    ["clients"],
    () => {
      return getAllClients({});
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: (value) => {
        if (value?.data) {
          setClients(value.data);
        }
      },
    }
  );

  const handlePopulateUploadFiles = (editData?: any) => {
    if (editData.uploads && editData.uploads.length > 0) {
      const fileList = editData.uploads.map((file: any) => ({
        uid: file.id,
        name: extractFileName(file.path),
        url: file.path,
      }));

      setUploadFileList(fileList);
    }
  };

  function extractFileName(url: string) {
    if (url.includes("/")) {
      const urlParts = url.split("/");

      const fileName = urlParts[urlParts.length - 1];

      return fileName;
    } else {
      return url;
    }
  }


  useQuery(["get-schedule-position", scheduleId], () => scheduleId && getRepeatSchedulePosition(scheduleId), {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data?.data) {
        setSchedulePosition(data?.data.position);
        setRepeatScheduleTotal(data?.data.total);
      }
    },
  });

  useEffect(() => {
    if (isEdit && editData && typeof editData === 'object' && Object.keys(editData).length > 0) {
      let formValues: Record<string, any> = {};
      const [hours, minutes] = editData?.time !== undefined && editData?.time !== null
        ? editData?.time?.split(":")
        : [null, null];
      formValues = {
        id: editData?.id,
        reason: editData?.reason,
        additional_note: editData?.additional_note,
        transport_feature: editData?.transport_feature,
        service_type: editData?.service_type,
        schedule_time: editData?.time !== undefined ? dayjs(hours + ":" + minutes, "HH:mm") : null,
        schedule_date: editData?.time !== undefined ? dayjs(
          moment(editData?.date).format(dateFormat),
          dateFormat
        ) : null,
        origin_address: editData?.origin,
        destiny_address: editData?.destination,
        vehicle: editData?.vehicle,
        vehicle_registration: editData?.license_plate,
        companion: editData?.companion_name ? true : false,
        client: editData?.client?.name,
        tat_1: editData?.responsible_tats_1,
        tat_2: editData?.responsible_tats_2,
        payment_mode: editData?.payment_method,
        total_value: editData?.total_value,
        companion_name: editData?.companion_name,
        companion_number: editData?.companion_contact,
        transport_justification: editData?.transport_justification,
        patients_status: editData?.patients_status,
        is_back_service: "no",
      };


      if (editData?.repeat && enableRepeat) {
        setRepeatScheduling(true);
        handleFinishBy(editData?.repeat.repeat_finish_by);

        const [hours, minutes] = editData?.repeat?.repeat_time?.split(":");

        formValues.is_service_form_repeated = true;
        formValues.repeat_date = dayjs(editData?.date, dateFormat);
        formValues.repeat_time = dayjs(hours + ":" + minutes, "HH:mm");
        formValues.repeat_days = editData?.repeat?.repeat_days;
        formValues.repeat_finish_by = editData?.repeat?.repeat_finish_by;
        formValues.repeat_number_sessions =
          editData?.repeat?.repeat_number_sessions;
        formValues.repeat_final_date = dayjs(
          moment(editData?.repeat?.repeat_final_date).format(dateFormat),
          dateFormat
        );
      }

      if (
        editData?.is_back_service === "yes" &&
        editData?.associated_schedule > 0
      ) {
        formValues.is_back_service = "yes";
        formValues.back_service_origin_address = editData?.destination;
        formValues.back_service_destiny_address = editData?.origin;
        setBackService(true);
      }

      handlePopulateUploadFiles(editData);
      setHasCompanion(formValues.companion);
      setPatientSelect(editData.patient);
      form.setFieldsValue(formValues);
    }

    if(!isEdit && editData && Object.keys(editData).length > 0){
      setPatientSelect(editData?.patient);
    }
  }, [editData]);

  const getPatientSelect = (value: string) => {
    const selectedPatient = optionsPatients.find(
      (patient: IPatient) => patient.name === value
    );
    if (selectedPatient) {
      setPatientSelect(selectedPatient);
    }
  };

  const handleSearchPatientByNumber = async (value: string) => {
    setSearchPatient(value);
  };

  const sortWeekDays = (days: string[]) => {
    days.sort((a: string, b: string) => {
      const daysOfWeek = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b);
    });

    return days;
  };

  const handleLogicFromRepeated = () => {
    let text = "Ocorre ";
    let date = form.getFieldValue("repeat_date");
    let time = form.getFieldValue("repeat_time");
    let days = form.getFieldValue("repeat_days");

    if (days && days.length > 0) {
      const sortedDays = sortWeekDays(days);
      const weekDays = {
        monday: "segunda",
        tuesday: "terça",
        wednesday: "quarta",
        thursday: "quinta",
        friday: "sexta",
        saturday: "sábado",
        sunday: "domingo",
      };

      const workDays = {
        monday: "segunda",
        tuesday: "terça",
        wednesday: "quarta",
        thursday: "quinta",
        friday: "sexta"
      }

      const hollyDays = {
        saturday: "sábado",
        sunday: "domingo",
      }

      if (sortedDays.length > 1) {
        sortedDays.slice(0, -1).forEach((item: string, index: number) => {
          if (index === 0) {
            text += `${hollyDays[item as keyof typeof hollyDays] ? 'todo' : 'toda'} ${weekDays[item as keyof typeof weekDays]}`;
          } else {
            text += `, ${weekDays[item as keyof typeof weekDays]}`;
          }
        });
        let finalDay = workDays[sortedDays.slice(-1)[0] as keyof typeof workDays]
        text += ' e '
        if (finalDay){
          text += `${finalDay}-feiras`;
        } else {
          text += `${weekDays[sortedDays.slice(-1)[0] as keyof typeof weekDays]}`;
        }

      } else {
        let onlyDay = workDays[sortedDays[0] as keyof typeof workDays];
        if (onlyDay) {
          text += `à ${weekDays[sortedDays[0] as keyof typeof weekDays]}-feira`;
        } else {
          text += `ao ${weekDays[sortedDays[0] as keyof typeof weekDays]}`;
        }
      }
    }
    if (date) text += ` a partir de ${date.format("DD/MM/YYYY")}`;
    if (time) text += ` às ${time.format("HH:mm")}`;

    setLogicFromRepeated(text);
  };

  const handleFinishBy = (value: string) => {
    setFinishBy(value);
  };

  const saveNewFeedback = () => {
    setHasFileError(false);
    setFileErrorMessage(null);
    form
      .validateFields()
      .then((values: any) => {
        if (hasErrorBeforeUploadImage(uploadFileList)) {
          return false;
        }
        //values.repeat_finish_by = 'sessions'
        values.uploads = uploadFileList;
        if (!patientSelected) {
          AlertService.sendAlert([{ type: "error" , text: "Utente que tentou associar não existe." }]);
          return false;
        }

        if (patientSelected) {
          values.patient_id = patientSelected.id;
        }

        if (!isRepeatScheduling) {
          values.schedule_date = Convert.date(values.schedule_date);
          values.schedule_time = Convert.time(values.schedule_time);
        }

        if (isRepeatScheduling) {
          values.is_repeat_schedule = isRepeatScheduling;
          values.repeat_date = Convert.date(values.repeat_date);
          values.repeat_time = Convert.time(values.repeat_time);
          if (values.repeat_final_date) {
            values.repeat_final_date = Convert.date(values.repeat_final_date);
          }

          if (useCredits) {
            values.use_credits = useCredits;
          }
        }

        
        mutatePostScheduling(values);
      })
      .catch((error) => {
        console.info("error: ", error);
      });
  };

  const editFeedBack = () => {
    setHasFileError(false);
    setFileErrorMessage(null);
    form
      .validateFields()
      .then((values: any) => {
        if (hasErrorBeforeUploadImage(uploadFileList)) {
          return false;
        }

        values.uploads = uploadFileList;

        values.client = editData.client.id;
        values.patient_nif = editData.patient.nif;
        values.patient_id = editData.patient.id;

        if (!isRepeatScheduling) {
          values.schedule_date = Convert.date(values.schedule_date);
          values.schedule_time = Convert.time(values.schedule_time);
        }

        if (isRepeatScheduling) {
          values.is_repeat_schedule = isRepeatScheduling;
          values.repeat_date = Convert.date(values.repeat_date);
          values.repeat_time = Convert.time(values.repeat_time);
          if (values.repeat_final_date) {
            values.repeat_final_date = Convert.date(values.repeat_final_date);
          }
        }

        mutateEditScheduling(values);
      })
      .catch((error) => {
        console.info("error: ", error);
      });
  };

  const handleEditFeedBack = () => {
    if (editSerie) {
      const confirmSave = () => {
        Modal.confirm({
          title: "Deseja gravar as alterações?",
          content:
            "A edição será aplicada neste e a todos os agendamentos seguintes.",
          okText: "Gravar",
          okType: "primary",
          cancelText: "Voltar",
          onOk() {
            console.log("Edit Serie"); //TODO WHEN EDIT SERRIE OF SCHEDULES
          },
        });
      };
      confirmSave();
    } else {
      const confirmSave = () => {
        Modal.confirm({
          title: "Deseja gravar as alterações?",
          content:
           repeatEnable ? `A edição será aplicada partir do ${schedulePosition}/${repeatScheduleTotal} agendamentos` : "A edição será aplicada apenas a este agendamento e não afetará os restantes.",
          okText: "Gravar",
          okType: "primary",
          cancelText: "Voltar",
          onOk() {
            editFeedBack();
          },
        });
      };

      confirmSave();
    }
  };

    const getNewFiles = (files: any) => {
        setUploadFileList(files)
    }

  const handleInputChange = (e: any) => {
    const inputValue = e.target.value;
    const alphanumericValue = inputValue.replace(/[^A-Za-z0-9]/g, "");
    const formatted = alphanumericValue.replace(
      /(\w{2})(\w{2})(\w{2})/,
      "$1-$2-$3"
    );
    form.setFieldValue("vehicle_registration", formatted);
  };

  function hasErrorBeforeUploadImage(file: any): Boolean {
    let files: any = [];

    if (file !== undefined) {
      files = file;
    }

    let filePosition = 0;
    let error = false;
    if (files.length !== 0) {
      files.forEach((file: any) => {
        if (!file?.url) {
          filePosition += 1;
          const hasRightFormat = ["application/pdf", "image/jpg", "image/jpeg"];
          if (!hasRightFormat.includes(file.type)) {
            error = true;
            setHasFileError(true);
            setFileErrorMessage(
              "O " + filePosition + "º ficheiro deve ser PDF/JPG/JPEG!"
            );
            return false;
          }

          const imageSize = file.size / 1024 / 1024 < 4;
          if (!imageSize) {
            error = true;
            setHasFileError(true);
            setFileErrorMessage(
              "O " + filePosition + "º ficheiro não deve conter mais de 5MB!"
            );
            return false;
          }
        }
      });
    }

    form.validateFields();

    return error;
  }

  const handleOriginAddress = (e: any) => {
    form.setFieldValue("back_service_destiny_address", e.target.value);
  };

  const handleDestinyAddress = (e: any) => {
    form.setFieldValue("back_service_origin_address", e.target.value);
  };

  const handleServiceHasReturn = (hasReturn: boolean) => {
    if (hasReturn) {
      setBackService(true);
      let origin = form.getFieldValue("origin_address");
      let destiny = form.getFieldValue("destiny_address");

      form.setFieldValue("back_service_origin_address", destiny);
      form.setFieldValue("back_service_destiny_address", origin);
    } else {
      setBackService(false);
    }
  };

  const handleChangeStatusPatient = (value: string) => {
    if (value == "not_credential") {
      const confirmClose = () => {
        Modal.confirm({
          title: "Não é possível continuar sem uma credencial do utente.",
          content: "Deseja sair?",
          icon: <ExclamationCircleOutlined />,
          okText: "Sair",
          okType: "primary",
          cancelText: "Voltar",
          onOk() {
            close();
          },
          onCancel() {
            isEdit
              ? form.setFieldValue("patients_status", "credential")
              : form.setFieldValue("patients_status", "");
          },
        });
      };

      confirmClose();
    }
  };

  return (
    <>
    {
      (isEdit || patientSelected) &&
      <SeePatientDrawer key={patientSelected ?? editData.patient} data={patientSelected ?? editData.patient} displaySections={["history"]}/>
    }
    <Form form={form} layout="vertical">
      <Row gutter={[16, 0]}>
        <Col span={24} style={{ marginBottom: 16 }}>
          <Title level={5}>Informações da Chamada</Title>
          <div style={{ width: "100%" }}>
            <DisplayAlert show={["warning", "error"]} />
          </div>
        </Col>
        <Col span={12}>
          <Form.Item
            label={"Motivo chamada"}
            style={{ width: "100%" }}
            name="reason"
            rules={[
              {
                required: true,
                message: REQUIRED_FIELD_LABEL,
              },
            ]}
          >
            <Select size="large" placeholder="Selecione">
              {Object.keys(EnumCallsReason).map((key) => (
                <Select.Option key={key} value={key}>
                  {EnumCallsReason[key as keyof typeof EnumCallsReason]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={"Operador"} style={{ width: "100%" }}>
            <Text strong>{userStorage?.name}</Text>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={"Nota adicional"} name="additional_note">
            <Input size="large" maxLength={255} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 0]}>
        <Col span={24} style={{ marginBottom: 16 }}>
          <Title level={5}>Informações do Utente</Title>
        </Col>
        {(!isEdit && Object.keys(editData).length < 1)  && (
          <Col span={24}>
            <AutoCompleteCustom
              form={form}
              size="large"
              onAutoComplete={handleSearchPatientByNumber}
              name="search_patients"
              label="Associar utente"
              options={optionsPatients}
              onSelect={(value) => {
                getPatientSelect(value);
              }}
              rules={[
                {
                  required: true,
                  message: REQUIRED_FIELD_LABEL,
                },
              ]}
            />
          </Col>
        )}
        {patientSelected && (
          <div
            style={{
              marginLeft: 8,
              width: "95%",
              padding: "8px 8px 0px 8px",
              borderRadius: 16,
              border: "1px solid #d9d9d9",
            }}
          >
            <Col span={24}>
              <DetailsPatientBasicList data={patientSelected} />
            </Col>
            <Col span={12} style={{ marginTop: 15 }}>
              <Form.Item
                label={"Status do utente"}
                style={{ width: "100%" }}
                name="patients_status"
                rules={[
                  {
                    required: true,
                    message: REQUIRED_FIELD_LABEL,
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Selecione"
                  onChange={(value) => handleChangeStatusPatient(value)}
                >
                  {Object.keys(enumPatientStatusScheduling).map((key) => (
                    <Select.Option key={key} value={key}>
                      {
                        enumPatientStatusScheduling[
                          key as keyof typeof enumPatientStatusScheduling
                        ]
                      }
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </div>
        )}
      </Row>
      <Row gutter={[16, 0]}>
        <Col span={24} style={{ marginBottom: 16 }}>
          <Title level={5}>Informações do Agendamento</Title>
        </Col>
        <Col span={16}>
          <Form.Item
            label={"Características do transporte"}
            style={{ width: "100%" }}
            name="transport_feature"
            rules={[
              {
                required: true,
                message: REQUIRED_FIELD_LABEL,
              },
            ]}
          >
            <Select size="large" placeholder="Selecione">
              {Object.keys(EnumTransportFeature).map((key) => (
                <Select.Option key={key} value={key}>
                  {
                    EnumTransportFeature[
                      key as keyof typeof EnumTransportFeature
                    ]
                  }
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="service_type"
            label={"Tipo de serviço"}
            style={{ width: "100%" }}
          >
            <Select size="large" placeholder="Selecione">
              {Object.keys(EnumTypeService).map((key) => (
                <Select.Option key={key} value={key}>
                  {EnumTypeService[key as keyof typeof EnumTypeService]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={"Data"}
            style={{ width: "100%" }}
            name="schedule_date"
            rules={[
              {
                required: !isRepeatScheduling,
                message: REQUIRED_FIELD_LABEL,
              },
            ]}
          >
            <DatePicker
              disabled={isRepeatScheduling}
              picker="date"
              style={{ width: "100%" }}
              format={"DD/MM/YYYY"}
              size="large"
              placeholder="Selecione a data"
              disabledDate={disabledDateMin}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={"Hora"}
            style={{ width: "100%" }}
            name="schedule_time"
            rules={[
              {
                required: !isRepeatScheduling,
                message: REQUIRED_FIELD_LABEL,
              },
            ]}
          >
            <DatePicker
              disabled={isRepeatScheduling}
              picker="time"
              format="HH:mm"
              style={{ width: "100%" }}
              size="large"
              placeholder="Selecione a hora"
            />
          </Form.Item>
        </Col>
        {enableRepeat && (
          <Col span={24}>
            <Form.Item name="is_service_form_repeated">
              <Checkbox
                checked={isRepeatScheduling}
                onClick={() => setRepeatScheduling(!isRepeatScheduling)}
              >
                Repetir serviço
              </Checkbox>
            </Form.Item>
          </Col>
        )}
        {isRepeatScheduling && (
          <Col
            span={24}
            style={{
              background: "#FAFAFA",
              border: "1px solid #e8e8e8",
              borderRadius: 8,
              padding: 24,
              marginBottom: 32,
              marginTop: -10,
            }}
          >

            <Row gutter={[16, 16]}>
            {(!isEdit && (patientSelected && patientSelected.credits > 0)) && (
              <Alert
                message="Créditos disponivéis"
                description={`Este utente possui crédito de ${patientSelected.credits} ${(patientSelected.credits === 1) ? 'sessão' : 'sessões'} disponiveis para utilização`}
                type="info"
                showIcon
              />
            )}
              {isEdit && (
                <Col span={24}>
                  <Alert message={`Esta edição será a partir do ${schedulePosition}/${repeatScheduleTotal} agendamentos`} type="info" showIcon />
                </Col>
              )}
              <Col span={24}>
                <Text strong>Vigência</Text>
                {logicFromRepeated && (
                  <Col span={24} style={{ display: "flex", gap: 8, marginTop: '5px', marginLeft: '-7px'}}>
                    <InfoCircleOutlined style={{ color: "#820014" }} />
                    <Text style={{ color: "#820014" }}>{logicFromRepeated}</Text>
                  </Col>
                )}
              </Col>
              <Col span={8}>
                <Form.Item
                  label={"Data"}
                  style={{ width: "100%" }}
                  name="repeat_date"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    },
                  ]}
                >
                  <DatePicker
                    onChange={handleLogicFromRepeated}
                    picker="date"
                    format={"DD/MM/YYYY"}
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="Selecione a data"
                    disabledDate={disabledDateMin}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={"Hora"}
                  style={{ width: "100%" }}
                  name="repeat_time"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    },
                  ]}
                >
                  <DatePicker
                    onChange={handleLogicFromRepeated}
                    picker="time"
                    format="HH:mm"
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="Selecione a hora"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col span={24}>
                <Form.Item
                  label={<Text strong>Periodicidade</Text>}
                  style={{ width: "100%" }}
                  name="repeat_days"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    },
                  ]}
                >
                  <Checkbox.Group onChange={handleLogicFromRepeated}>
                    <Row gutter={[16, 0]}>
                      {Object.keys(EnumWeekDays).map((key) => (
                        <Col key={key}>
                          <Checkbox value={key}>
                            {EnumWeekDays[key as keyof typeof EnumWeekDays]}
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={"Finaliza em"}
                  style={{ width: "100%", marginBottom: 0 }}
                  name="repeat_finish_by"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Selecione"
                    onChange={handleFinishBy}
                    disabled={isEdit}
                  >
                    <Select.Option value="date">Data</Select.Option>
                    <Select.Option value="sessions">
                      Número de sessões
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                {finishBy === "sessions" && (
                  <Form.Item
                    label={"Sessões"}
                    style={{ width: "100%", marginLeft: "8px", marginBottom: 0 }}
                    name="repeat_number_sessions"
                    rules={[
                      {
                        required: true,
                        message: REQUIRED_FIELD_LABEL,
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      disabled={!(finishBy === "sessions") || (isEdit)}
                      min={1}
                    />
                  </Form.Item>
                )}
                {finishBy === "date" && (
                  <Form.Item
                    label={"Data"}
                    style={{ width: "100%", marginLeft: "8px", marginBottom: 0 }}
                    name="repeat_final_date"
                    rules={[
                      {
                        required: true,
                        message: REQUIRED_FIELD_LABEL,
                      },
                    ]}
                  >
                    <DatePicker
                      picker="date"
                      style={{ width: "100%" }}
                      size="large"
                      format={"DD/MM/YYYY"}
                      placeholder="Selecione a data"
                      disabledDate={disabledDateMin}
                      disabled={isEdit}
                    />
                  </Form.Item>
                )}
              </Col>
              <Col span={24}>
              {
                (!isEdit && (patientSelected && patientSelected.credits > 0)) && (
                  <Col span={24}>
                    <Form.Item name="use_credits" style={{ width: "100%", marginBottom: 0, marginTop: "8px"}}>
                      <Checkbox
                        checked={useCredits}
                        onClick={() => setUseCredits(!useCredits)}
                      >
                        Usar Créditos
                      </Checkbox>
                    </Form.Item>
                  </Col>
                )
              }
              </Col>
            </Row>
          </Col>
        )}
        <Col span={24}>
          <Form.Item
            label={"Origem"}
            name="origin_address"
            rules={[
              {
                required: true,
                message: REQUIRED_FIELD_LABEL,
              },
            ]}
          >
            <Input
              size="large"
              onChange={(e: any) => handleOriginAddress(e)}
              maxLength={255}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label={"Destino"}
            name="destiny_address"
            rules={[
              {
                required: true,
                message: REQUIRED_FIELD_LABEL,
              },
            ]}
          >
            <Input
              size="large"
              onChange={(e: any) => handleDestinyAddress(e)}
              maxLength={255}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="is_back_service"
            label="Deseja adicionar retorno?"
            rules={[
              {
                required: true,
                message: REQUIRED_FIELD_LABEL,
              },
            ]}
          >
            <Radio.Group>
              <Radio onClick={() => handleServiceHasReturn(true)} value="yes">
                Sim
              </Radio>
              <Radio onClick={() => handleServiceHasReturn(false)} value="no">
                Não
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        {isBackService && (
          <Col
            span={24}
            style={{
              background: "#FAFAFA",
              border: "1px solid #e8e8e8",
              borderRadius: 8,
              padding: 24,
              marginBottom: 32,
              marginTop: -10,
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  label={"Origem"}
                  name="back_service_origin_address"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    },
                  ]}
                >
                  <Input size="large" maxLength={255} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={"Destino"}
                  name="back_service_destiny_address"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    },
                  ]}
                >
                  <Input size="large" maxLength={255} />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        )}
        <Col span={8}>
          <Form.Item label={"Viatura"} name="vehicle">
            <Select size="large" placeholder="Selecione">
              {Object.keys(EnumTypeVehicle).map((key) => (
                <Select.Option key={key} value={key}>
                  {EnumTypeVehicle[key as keyof typeof EnumTypeVehicle]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={"Matrícula"}
            name="vehicle_registration"
            rules={[
              {
                validator: (_, value) => {
                  if (value && value.toString().length <= 5) {
                    return Promise.reject(`A matrícula deve 6 dígitos`);
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input size="large" onChange={handleInputChange} maxLength={6} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={"Cliente"}
            name="client"
            rules={[
              {
                required: true,
                message: REQUIRED_FIELD_LABEL,
              },
            ]}
          >
            <Select size="large" placeholder="Selecione">
              {clients &&
                clients.map((client: any, index: number) => (
                  <Select.Option key={index} value={client.id}>
                    {client.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={"Responsável TAT's 1"} name="tat_1">
            <Input size="large" maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={"Responsável TAT's 2"} name="tat_2">
            <Input size="large" maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={"Acompanhante?"}
            name="companion"
            rules={[
              {
                required: true,
                message: REQUIRED_FIELD_LABEL,
              },
            ]}
          >
            <Select
              size="large"
              placeholder="Selecione"
              onChange={(value: any) => setHasCompanion(value)}
            >
              <Select.Option value={true}>Sim</Select.Option>
              <Select.Option value={false}>Não</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={"Modo de pagamento"} name="payment_mode">
            <Select size="large" placeholder="Selecione">
              {Object.keys(EnumTypePaymentMethods).map((key) => (
                <Select.Option key={key} value={key}>
                  {
                    EnumTypePaymentMethods[
                      key as keyof typeof EnumTypePaymentMethods
                    ]
                  }
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={"Valor total"} name="total_value">
            <InputNumber size="large" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={24}>
          {hasCompanion && (
            <div>
              <h3> Dados do acompanhante</h3>
              <Row gutter={[16, 16]}>
                <Col span={18}>
                  <Form.Item
                    label="Nome"
                    name="companion_name"
                    rules={[
                      {
                        required: true,
                        message: "Campo Obrigatório",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Space>
                      <Form.Item
                        label="Contacto"
                        name="companion_number"
                        rules={[
                          {
                            required: true,
                            message: "Campo Obrigatório",
                          },
                          {
                            validator: (_, value) => {
                              if (value && value.toString().length !== 9) {
                                return Promise.reject(
                                  `O contacto deve 9 dígitos`
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          maxLength={11}
                          parser={(value) => `${value}`.replace(/[^0-9]/g, "")}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                          }
                        />
                      </Form.Item>
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Col>
        <Col span={24}>
          <Form.Item
            label="Justificativa do transporte"
            name="transport_justification"
          >
            <TextArea
              autoSize={{ minRows: 3, maxRows: 5 }}
              showCount
              maxLength={255}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label={<Text strong>Upload de ficheiros</Text>}
            name="file_upload"
            rules={[
              {
                validator: (_, value) => {
                  if (hasFileError && fileErrorMessage) {
                    return Promise.reject(fileErrorMessage);
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <UploadComponent
              uploadFileList={uploadFileList}
              getNewFiles={getNewFiles}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Button
            type="primary"
            block
            size="large"
            onClick={isEdit ? handleEditFeedBack : saveNewFeedback}
          >
            {isEdit ? "Gravar alterações" : "Criar agendamento"}
          </Button>
          <ReturnButton closeDrawer={close} />
        </Col>
      </Row>
    </Form>
    </>
  );
}
