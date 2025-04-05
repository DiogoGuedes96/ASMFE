import { Button, Checkbox, Col, Divider, Form, Input, Modal, Row, Select, Space, Tag, Typography} from "antd";

import DisplayAlert from "../Commons/Alert";
import ReturnButton from "../Commons/Buttons/return-button.components";
import { Convert } from "../../services/convert.service";
import UploadComponent from "../Commons/Upload";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { deleteScheduling, getSchedulesFromPatient } from "../../services/serviceScheduling.service";
import { ExclamationCircleOutlined, PaperClipOutlined } from "@ant-design/icons";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { EnumCanceledThrough } from "../../Enums/CanceledThrough.enums";
import { AlertService } from "../../services/alert.service";
import moment from "moment";
const { Title, Text } = Typography;

interface formSchedulingCanceled {
    close: any,
    id?: number,
    refetchSchedulingList?: any,
    cleanFilters?: any
}
export default function FormCanceledSchedulingComponent({close, id, refetchSchedulingList, cleanFilters}:formSchedulingCanceled) {
    const [form] = Form.useForm();
    const [newFiles, setNewFiles] = useState<any>();
    const [schedulingData, setCchedulingData] = useState<any>({});
    const [listFiles, setListFiles] = useState<any>();
    const [checkedList, setCheckedList] = useState<CheckboxValueType[]>([]);
    const dateFormat = "DD/MM/YYYY";

    const { } = useQuery(
        ["getclientFromResponsible", id],
        () => {
            return id ? getSchedulesFromPatient(id) : null;
        },
        {
            refetchOnWindowFocus: false,
            onSuccess: async (data: any) => {
                console.log('data', data);
                if (data && data?.data && Object.keys(data?.data.length > 0)) {
                    setCchedulingData(data?.data);
                }
            },
        }
    );

    const canceledScheduling = (frmdetails: {}) => deleteScheduling(frmdetails);
    const { mutate: mutateSchedulingCanceled } = useMutation(canceledScheduling, {
        onSuccess: () => {
            close();
            form.resetFields();
            cleanFilters();
            refetchSchedulingList();
            AlertService.sendAlert([{ text: 'Este agendamento foi cancelado com sucesso.' }])
        }
    });

    const getNewFiles = (files: any[]) => {
        setNewFiles(files);
        setListFiles((prevList:any) => {
            if (Array.isArray(prevList)) {
                const uniqueFiles = files.filter((file) => {
                    return !prevList.some((prevFile:any) => prevFile.id === file.uid);
                });

                return [...prevList, ...uniqueFiles];
            }

            return [...files];
        });

      };

    const checkAll = schedulingData?.length === checkedList?.length;
    const indeterminate = checkedList?.length > 0 && checkedList?.length < schedulingData?.length;

    const onChange = (list: CheckboxValueType[]) => {
        setCheckedList(list);
    };

    const onCheckAllChange = (e: CheckboxChangeEvent) => {
        let list: any[] = [];

        if(checkedList.length > 0){
            setCheckedList([]);
        }else{
            schedulingData?.forEach((element: any) => {
                if (!handleScheduleIsPast(element)) {
                    list.push(element.id);
                }
            });

            setCheckedList(list);
        }
    };

    const cancelSchedule = () => {
        form.validateFields().then((values: any) => {
            if (Array.isArray(listFiles)) {
                const seenUids = new Set();
                const fileFilerByUid = listFiles.filter((file) => {
                    if (!seenUids.has(file.uid)) {
                        seenUids.add(file.uid);
                        return true;
                    }
                    return false;
                });

                values.upload = fileFilerByUid;
            }
            values.checkbox = checkedList;
            mutateSchedulingCanceled(values);
        }).catch((error) => {
            console.info("error: ", error);
        })
    }

    const confirmCanceled = () => {
        Modal.confirm({
          title: "Deseja gravar as alterações?",
          content: "Em caso de erro pode restaurar através do separador cancelados",
          okText: "Continuar",
          okType: "primary",
          cancelText: "Voltar",
          onOk() {
            cancelSchedule();
          },
        });
    };
    const handleScheduleIsPast = (item: any) => {
        const date = moment(item.date).format(dateFormat);
        const combinedDateTime = moment(`${date} ${item.time}`, 'DD/MM/YYYY HH:mm:ss');
        const currentDateTime = moment();

        const isPast = combinedDateTime.isBefore(currentDateTime);

        if(!isPast) {
            return false
        }

        return true;
    }

    return (
        <Form
            form={form}
            layout="vertical"
            >
            <Row gutter={[16, 0]}>
                <Col span={24} style={{ marginBottom: 16 }}>
                    <Title level={5}>Selecione os agendamentos que deseja cancelar:</Title>
                </Col>
            </Row >
            <Row gutter={[16, 0]}>
                <div style={{width: '100%'}}>
                    <DisplayAlert show={["warning", "error"]}/>
                </div>
                <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                    Selecionar todos
                </Checkbox>
                <Divider />

                <Checkbox.Group style={{ width: '100%', display: "block", marginRight: 0 }} value={checkedList} onChange={onChange}>
                    {
                        Object.keys(schedulingData).length > 0 &&
                        schedulingData?.map((item: any, index: any) => (
                            <>
                                <Row gutter={[16, 0]} key={index}>
                                    <Col span={24}>
                                        <Form.Item
                                            name={`select_${item.id}`}
                                        >
                                            {item.repeat_id && (
                                                <>
                                                    <Tag icon={<ExclamationCircleOutlined />} color="warning" style={{marginBottom: '8px'}}>
                                                        Converte em crédito
                                                    </Tag>
                                                    <br />
                                                </> 
                                                
                                            )}
                                            <Checkbox value={item.id} disabled={handleScheduleIsPast(item)}>Dia {Convert.portugueseFormatDate(item.date)}, às {Convert.timeWithouSeconds(item.time)} {item.associated_schedule !== 0 ? '- Retorno' : ''}</Checkbox><br />
                                        </Form.Item>
                                        <Text className="padding-left-25">Origem: {item.origin}</Text><br />
                                        <Text className="padding-left-25">Destino: {item.destination}</Text>
                                        <Form.Item
                                            name={`file_upload_${item.id}`}
                                        >
                                            <UploadComponent type="link" text="Upload de ficheiros" icon={<PaperClipOutlined />} hideDetails={true} getNewFiles={getNewFiles} id={item.id} />
                                        </Form.Item>

                                    </Col>
                                </Row>
                                <Divider />
                            </>
                        ))
                    }
                </Checkbox.Group>
            </Row >
            <Row gutter={[16, 0]}>
                <Col span={12} style={{ marginBottom: 16 }}>
                    <Form.Item
                        name={'reason'}
                        label={'Motivo'}
                        rules={[
                            {
                                required: true,
                                message:'Campo obrigatório'
                            }
                        ]}
                    >
                        <Input size="large" maxLength={255}/>
                    </Form.Item>
                </Col>
                <Col span={12} style={{ marginBottom: 16 }}>
                    <Form.Item
                        name={'client_patient'}
                        label={'Cliente/Utente'}
                        rules={[
                            {
                                required: true,
                                message:'Campo obrigatório'
                            }
                        ]}
                    >
                        <Select size="large" placeholder="Selecione">
                            <Select.Option value="client">
                               Cliente
                            </Select.Option>
                            <Select.Option value="patient">
                               Utente
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[16, 0]}>
                <Col span={12} style={{ marginBottom: 16 }}>
                    <Form.Item
                        name={'name'}
                        label={'Nome'}
                        rules={[
                            {
                                required: true,
                                message:'Campo obrigatório'
                            }
                        ]}
                    >
                        <Input size="large" maxLength={255}/>
                    </Form.Item>
                </Col>
                <Col span={12} style={{ marginBottom: 16 }}>
                    <Form.Item
                        name={'canceled_through'}
                        label={'Cancelado através de:'}
                    >
                        <Select size="large" placeholder="Selecione">
                            {Object.keys(EnumCanceledThrough).map(key => (
                                <Select.Option key={key} value={key}>
                                    {EnumCanceledThrough[key as keyof typeof EnumCanceledThrough]}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Button type="primary" block size="large" onClick={confirmCanceled} disabled={!(checkedList.length > 0)}>Cancelar agendamento</Button>
                    <ReturnButton closeDrawer={close} />
                </Col>
            </Row>
        </Form >
    );
}
