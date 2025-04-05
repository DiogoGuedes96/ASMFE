import { Col, Form, FormInstance, Input, Row, Typography, Switch, DatePicker, InputNumber, Button } from "antd";
import { useEffect, useState } from "react";
import { REQUIRED_FIELD_LABEL, isWhitespace } from "../../services/utils";
import dayjs from "dayjs";
import ReturnButton from "../Commons/Buttons/return-button.components";
import { useMutation } from "react-query";
import { AlertService } from "../../services/alert.service";
import { postAmbulanceGroup, putAmbulanceGroup } from "../../services/group.service";
import { IGroup, IGroupRequest } from "../../Interfaces/Group.interfaces";
import DisplayAlert from "../Commons/Alert";
import GroupFieldSelect from "./group-search-crew.component";
import { ICrew } from "../../Interfaces/Crew.interfaces";
const { Title } = Typography;

interface GroupDrawerProps {
  isEdit?: boolean,
  form: FormInstance;
  data?: any
  onClose: () => void
  cleanFilters: () => void
}

export default function GroupFormDrawer({ isEdit = false, form, data, onClose, cleanFilters}: GroupDrawerProps) {
  const [statusChecked, setStatusChecked] = useState(true);
  const [ambulanceGroupId, setAmbulanceGroupId] = useState<number>(0);
  const [disableButton, setDisableButton] = useState(false);

  const newAmbulanceGroup = (frmdetails: IGroupRequest) => postAmbulanceGroup(frmdetails);
  const { mutate: mutatePostAmbulanceGroup } = useMutation(newAmbulanceGroup, {
    onSuccess: () => {
      onClose();
      cleanFilters();
      form.resetFields();
      AlertService.sendAlert([{ text: "Grupo criado com sucesso." }]);
    },
  });

  const editAmbulanceGroup = ({ ambulanceGroup, frmdetails }: { ambulanceGroup: number, frmdetails: IGroupRequest }) => putAmbulanceGroup(frmdetails, ambulanceGroup);
  const { mutate: mutateEditAmbulanceGroup } = useMutation(editAmbulanceGroup, {
    onSuccess: () => {
      onClose();
      cleanFilters();
      form.resetFields();
      AlertService.sendAlert([{ text: 'As informações do grupo foram gravadas com sucesso.' }])
    }
  });

  const handleDisableButton = (value:boolean) => {
    setDisableButton(value);
  }
  useEffect(() => {

    if(isEdit && Object.keys(data).length > 0) {
      setAmbulanceGroupId(data.id);
      let initialValue: Record<string, any> = {};
      initialValue = {
        name: data.name,
      }
      if (data && data.crew) {
        data.crew.forEach((value: any) => {
          initialValue[`search_crew_id_${value.id}`] = value.id;
          initialValue[`search_crew_${value.id}`] = value.name;
        });
      }
      form.setFieldsValue(initialValue);
    }
  }, [data]);
  let crewIds: number[] = [];
  if (data && data.crew && isEdit) {
    crewIds = data.crew.length > 0 ? data.crew.map((item: ICrew) => item.id) : [1];
  } else {
    crewIds = [1];
  }
  const saveEditCrew = () => {
    form.validateFields().then((values: IGroupRequest) => {
      values.crew = getCrewIdsFromfiels(values); 
      console.info(values);
      mutateEditAmbulanceGroup({ ambulanceGroup: ambulanceGroupId, frmdetails: values });
    })
    .catch((error) => {
      console.error("error: ", error);
    });
  }
  const getCrewIdsFromfiels = (values:any) => {
        const dataArray = [];
        const finalData: any = [];

        for (const key in values) {
            if (key.startsWith('search_crew_id_')) {
                const number = key.match(/\d+/);
                if (number) {
                   let id = parseInt(number[0]);
                    dataArray.push(id);
                }
            }
        }
        
        dataArray.map((item:any) => {
          finalData.push(form.getFieldValue(`search_crew_id_${item}`))
        })

        return finalData;
  }
  const saveNewCrew = () => {
    form.validateFields().then((values: any) => {
      values.crew = getCrewIdsFromfiels(values); 
      mutatePostAmbulanceGroup(values);
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
              <GroupFieldSelect form={form} textFieldName="Tripulantes" linkText="Adicionar Tripulante" edit={isEdit} DynamicFieldsNumber={crewIds ?? undefined} disableAlerts={handleDisableButton}/>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Button type="primary" block size="large" disabled={disableButton} onClick={!isEdit ? saveNewCrew : saveEditCrew}>
              {!isEdit ? 'Criar grupo' : 'Gravar alterações'}
            </Button>
            <ReturnButton closeDrawer={onClose}/>
          </Col>
        </Row>

      </Form>
    </>

  );
}
