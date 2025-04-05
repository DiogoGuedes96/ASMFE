import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row, Space, Typography, FormInstance, Alert } from "antd";
import { useEffect, useState } from "react";
import { CrewListBy } from "../../services/crew.service";
import { useQuery } from "react-query";
import { ICrew } from "../../Interfaces/Crew.interfaces";
import AutoCompleteCustom from "../Commons/Autocomplete";
import { IGroup } from "../../Interfaces/Group.interfaces";
const {Text} = Typography;
interface GroupFieldProps {
    textFieldName: string
    linkText: string
    DynamicFieldsNumber?: any
    edit?:any
    form: FormInstance
    disableAlerts: (value:any) => void
}
export default function GroupFieldSelect(props: GroupFieldProps) {
    const [fieldsAdd, setFieldsAdd] = useState<any>([0]);
    const [optionsCrew, setOptionsCrew] = useState([]);
    const [numberFields, setNumberFields] = useState(1);
    const [searchCrew, setSearchCrew] = useState<string | undefined>();
    const [showAlerts, setShowAlerts] = useState<any>([false, 0]);
    useQuery(["get-patient", searchCrew], () => CrewListBy(searchCrew), {
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
          if (data?.data?.length) {
            setOptionsCrew(
              data.data.map((crew: ICrew) => {
                return {
                  value: crew.name,
                  label: (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <Text strong>{crew.name}</Text>
                    </div>
                  ),
                  ...crew,
                };
              })
            );
          }
        },
      });
    const AddFields = () => {
        setNumberFields(numberFields + 1);
        setFieldsAdd([...fieldsAdd, numberFields]);
    }

    useEffect(() => {
        if (props.DynamicFieldsNumber) {
            setNumberFields(props.DynamicFieldsNumber[props.DynamicFieldsNumber.length - 1] + 1 );
            setFieldsAdd(props.DynamicFieldsNumber);
        }
    }, [])

    const handleTurnOffAlerts = () => {
        setShowAlerts([false, 0]);
        props.disableAlerts(false);
    }
    const RemoveFields = (valueToRemove: any) => {
        if (showAlerts) {
            handleTurnOffAlerts();
        }
        const updatedFields = fieldsAdd.filter((item: any) => item !== valueToRemove);
        setFieldsAdd(updatedFields);
    }

    const handleSearchPatientByNumber = async (value: string) => {
        setSearchCrew(value);
    };

    const getCrewSelect = (value: string, field: number) => {
        const selectedCrew:ICrew| undefined = optionsCrew.find(
          (crew: ICrew) => crew.name === value
        );
        if (selectedCrew) {
            setShowAlerts((selectedCrew as ICrew).group ? [true, selectedCrew["id"]]  : [false, 0]);
            if ((selectedCrew as ICrew).group) {
                setShowAlerts([true, selectedCrew["id"]]);
                props.disableAlerts(true);
            }
            props.form.setFieldValue(`search_crew_id_${field}`, selectedCrew["id"]);
        }
    };

    const validateIfWastoDisable = (value: number): boolean => {
        let Ids: number [] = props.DynamicFieldsNumber;
        if ( Ids[0] !== 1) {
          return Ids.includes(value);
        }
        return false;
    };
    
    return (
        <Row>
            <Col span={24}>
                <Text>{props.textFieldName}</Text>
                {
                    fieldsAdd.map((key: any) => (
                        <div key={key}>
                            <div style={{ display: "flex", width:'100%'}}>
                                <Row style={{width: '100%'}}>
                                    <Col span={fieldsAdd.length >= 2 ? 23 : 24}>
                                        <Row gutter={[16,16]}>
                                            <Col span={24}>
                                                <Form.Item
                                                    name={`search_crew_id_${key}`}
                                                    hidden={true}
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <AutoCompleteCustom
                                                form={props.form}
                                                size="large"
                                                onAutoComplete={handleSearchPatientByNumber}
                                                name={`search_crew_${key}`}
                                                options={optionsCrew}
                                                onSelect={(value) => {
                                                    getCrewSelect(value, key);
                                                }}
                                                rules={[
                                                    {
                                                    required: true,
                                                    message: "Campo Obrigatório",
                                                    },
                                                ]}
                                                />
                                                {
                                                    (showAlerts[0] && props.form.getFieldValue(`search_crew_id_${key}`) === showAlerts[1])  && (
                                                        <Alert 
                                                            message="Este utilizador já pertence a um grupo, pretende prosseguir?" 
                                                            type="warning" 
                                                            showIcon 
                                                            action={
                                                                <Space>
                                                                    <Button size="small" type="default" className="group-accept-button" onClick={() => handleTurnOffAlerts()}>
                                                                        <CheckCircleOutlined className="default-green-icon"/> Sim
                                                                    </Button>
                                                                    <Button size="small" type="default" className="group-decline-button" onClick={() => RemoveFields(key)}>
                                                                        <CloseCircleOutlined className="default-red-icon"/> Não
                                                                    </Button>
                                                                </Space>
                                                            }
                                                            style={{ marginTop: '-16px',
                                                            marginBottom: '16px' }}
                                                        />
                                                    )
                                                }
                                                
                                            </Col>
                                        </Row>
                                    </Col>
                                    {fieldsAdd.length >= 2 && (
                                        <Col span={1}>
                                           <Button
                                                style={{ marginTop: '5px',
                                                    marginLeft: '10px' }}
                                                type="default"
                                                shape="circle"
                                                icon={<DeleteOutlined />}
                                                size="middle"
                                                disabled={showAlerts[0]}
                                                onClick={() => RemoveFields(key)}
                                            />
                                        </Col>
                                    )}
                                </Row>
                            </div>
                        </div>
                    ))
                }
                <Button
                    className="secundary-button"
                    style={{ marginBottom: 32}}
                    size="large"
                    block 
                    onClick={AddFields}
                    disabled={showAlerts[0]}
                >
                    <PlusOutlined />
                    Adicionar Tripulante
                </Button>
            </Col>
        </Row>
    )
}