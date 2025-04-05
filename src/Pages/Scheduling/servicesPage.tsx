import {
  Button,
  Card,
  Divider,
  Form,
  Modal,
  PaginationProps,
  Space,
  Tooltip,
} from "antd";
import DisplayAlert from "../../components/Commons/Alert";
import { useMutation, useQuery } from "react-query";
import { useState } from "react";
import {
  deleteScheduling,
  getAllServiceScheduling,
} from "../../services/serviceScheduling.service";
import GenericTable from "../../components/Commons/Table/generic-table.component";
import { FilterValue } from "antd/lib/table/interface";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import SearchScheduling from "../../components/Scheduling/search-scheduling.component";
import "../../assets/css/scheduling.css";
import DrawerServiceSchedulingComponent from "../../components/Scheduling/drawer-service-scheduling.component";
import PaginationComponent from "../../components/Commons/Pagination";
import moment from "moment";
import { EnumTypeService } from "../../Enums/TypeService";
import { Convert } from "../../services/convert.service";
import { AlertService } from "../../services/alert.service";
import DrawerServiceSchedulingCanceledComponent from "../../components/Scheduling/drawer-service-canceled-scheduling.component";
import ProfilePermissionService from "../../services/profilePermissions.service";
const profilePermissionService = ProfilePermissionService.getInstance();

export default function ServicePage() {
  const dateFormat = "DD/MM/YYYY";
  const [serviceSchedulingData, setServiceSchedulingData] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [openFormServiceScheduling, setOpenFormUser] = useState(false);
  const [editMany, setEditMany] = useState(false);
  const [openEditFormServiceScheduling, setOpenEditFormUser] = useState(false);
  const [
    openCanceledFormServiceScheduling,
    setOpenCanceledFormServiceScheduling,
  ] = useState(false);
  const [scheduleCanceledId, setScheduleCanceledId] = useState<number>(0);
  const [patientId, setPatientId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sorter, setSorter] = useState<
    { columnKey: string; order: string } | undefined
  >(undefined);
  const [searClientForm] = Form.useForm();
  const [serviceEditData, setServiceEditData] = useState<any>({});
  const [searchValue, setSearchValue] = useState("");
  const [searchStartDate, setSearchStartDate] = useState<string>();
  const [searchEndDate, setSearchEndDate] = useState<string>();
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false);

  const {
    isLoading: serviceSchedulingLoading,
    refetch: refetchServiceScheduling,
  } = useQuery(
    [
      "allServiceScheduling",
      currentPage,
      perPage,
      sorter,
      searchStartDate,
      searchEndDate,
      searchValue,
    ],
    () =>
      getAllServiceScheduling(
        currentPage,
        perPage,
        searchValue,
        sorter,
        searchStartDate,
        searchEndDate
      ),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data?.data) {
          setServiceSchedulingData(data.data);
          setMeta(data?.meta);
        }
      },
    }
  );

  const handleSearchChange = (e: any) => {
    setSearchValue(e);
  };

  const handleSearchStartDate = (e: any) => {
    setSearchStartDate("");
    if (e) {
      const data = e.$y + "-" + (e.$M + 1) + "-" + e.$D;
      setSearchStartDate(data);
    }
  };

  const handleSearchEndDate = (e: any) => {
    setSearchEndDate("");
    if (e) {
      const data = e.$y + "-" + (e.$M + 1) + "-" + e.$D;
      setSearchEndDate(data);
    }
  };

  const handleCurrentPage = () => {
    setCurrentPage(1);
  };

  const onSubmitClearFilters = () => {
    setPerPage(10);
    setSorter(undefined);
    handleSearchChange('');
    handleSearchStartDate("");
    handleSearchEndDate("");
    handleCurrentPage();
    searClientForm.resetFields();
  }

  const deleteSchedule = (feedback: any) => deleteScheduling(feedback);
  const { mutate: mutateDeleteSchedule } = useMutation(deleteSchedule, {
    onSuccess: () => {
      refetchServiceScheduling();
      AlertService.sendAlert([{ text: "Elogio/Reclamação Excluído." }]);
    },
  });
  const handleTableChange = (
    pagination: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: any
  ) => {
    if (sorter) {
      setSorter(sorter);
    }
  };

  const filteredClients = () => {
    searClientForm
      .validateFields()
      .then((values: any) => {
        handleSearchChange(values.search);
        handleSearchStartDate(values.start_date);
        handleSearchEndDate(values.end_date);
        handleCurrentPage();
      })
      .catch((error) => {
        console.error("error: ", error);
      });
  };
  const confirmDeleteFeedback = (scheduleId: number) => {
    Modal.confirm({
      title: "Tem a certeza que deseja cancelar este agendamento?",
      icon: <ExclamationCircleOutlined />,
      okText: "Eliminar",
      okType: "primary",
      cancelText: "Voltar",
      onOk() {
        mutateDeleteSchedule(scheduleId);
      },
    });
  };

  const columns = [
    {
      title: "Nome",
      dataIndex: ["patient", "name"],
      key: "patient_name",
      sorter: true,
      showSorterTooltip: {
        title: "Clique para alterar a ordem",
      },
    },
    {
      title: "Nº Utente",
      dataIndex: ["patient", "patientNumber"],
      key: "patient_number",
    },
    {
      title: "Contacto",
      dataIndex: ["patient", "phoneNumber"],
      key: "patient_contact",
    },
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      sorter: true,
      showSorterTooltip: {
        title: "Clique para alterar a ordem",
      },
      render: (date: any) => <p>{Convert.portugueseFormatDate(date)}</p>,
    },
    {
      title: "Hora",
      dataIndex: "time",
      key: "time",
      render: (time: any) => <p>{Convert.timeWithouSeconds(time)}</p>,
    },
    {
      title: "Origem",
      dataIndex: "origin",
      key: "origin",
      ellipsis: true,
    },
    {
      title: "Destino",
      dataIndex: "destination",
      key: "destination",
      ellipsis: true,
    },
    {
      title: "Tipo de Serviço",
      dataIndex: "service_type",
      key: "service_type",
      render: (service_type: any) => (
        <p>{EnumTypeService[service_type as keyof typeof EnumTypeService]}</p>
      ),
    },
    {
      title: "Ações",
      key: "action",
      render: (_: any, record: any) => {
        const permission = profilePermissionService.hasPermission(
          "asm_schedule-asm_schedule:write"
        );
        if (permission) {
          return (
            <Space size="small">
              <Tooltip title="Editar/Reagendar">
                <Button
                  type="default"
                  shape="circle"
                  icon={<EditOutlined />}
                  size="middle"
                  onClick={() => {
                    if (record?.repeat?.id) {
                      editService(record);
                      setOpenModalEdit(true);
                    } else {
                      setEditMany(false);
                      setOpenEditFormUser(true);
                      editService(record);
                    }
                  }}
                />
              </Tooltip>
              <Tooltip title="Cancelar">
                <Button
                  type="default"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  size="middle"
                  disabled={handleScheduleIsPast(record)}
                  onClick={() => {
                    openDrawerCanceledServiceScheduling(record);
                  }}
                />
              </Tooltip>
            </Space>
          );
        } else {
          return <div></div>;
        }
      },
      width: "10%",
    },
  ];

  const handleScheduleIsPast = (record: any) => {
    const date = moment(record.date).format(dateFormat);
    const combinedDateTime = moment(
      `${date} ${record.time}`,
      "DD/MM/YYYY HH:mm:ss"
    );
    const currentDateTime = moment();

    const isPast = combinedDateTime.isBefore(currentDateTime);

    if (!isPast) {
      return false;
    }

    return true;
  };

  const saveServiceScheduling = () => {
    console.log("saveServiceScheduling");
  };

  const closeDrawerServiceScheduling = () => {
    setOpenFormUser(false);
    setOpenEditFormUser(false);
    setServiceEditData({});
    onSubmitClearFilters();
  };

  const newService = () => {
    setEditMany(true);
    setOpenFormUser(true);
  };

  const editService = (scheduleData: any) => {
    setServiceEditData(scheduleData);
  };

  const onChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const onChangeSizePage = (perPage: number) => {
    setPerPage(perPage);
  };

  const openDrawerCanceledServiceScheduling = (record: any) => {
    setOpenCanceledFormServiceScheduling(true);
    setScheduleCanceledId(record?.id);
    setPatientId(record?.patient?.id);
  };

  const closeDrawerCanceledServiceScheduling = () => {
    setOpenCanceledFormServiceScheduling(false);
    setScheduleCanceledId(0);
    onSubmitClearFilters();
  };

  const handleCancel = () => {
    setOpenModalEdit(false)
    setServiceEditData({});
  }

  const handleEditOne = () => {
    setOpenModalEdit(false);
    setEditMany(false);
    setOpenEditFormUser(true);
  }

  const handleEditMany = () => {
    setOpenModalEdit(false);
    setEditMany(true);
    setOpenEditFormUser(true);
  }

  return (
    <div className="content_page">
      <DisplayAlert show={["success"]} />
      <Card>
        <div className="search_scheduling_space">
          <SearchScheduling
            form={searClientForm}
            footer={
              <Button
                className="secundary-button"
                onClick={filteredClients}
                size="large"
              >
                Pesquisar
              </Button>
            }
          />
          {profilePermissionService.hasPermission(
            "asm_schedule-asm_schedule:write"
          ) && (
            <Button type="primary" size="large" onClick={newService}>
              Novo agendamento
            </Button>
          )}
        </div>
        <Divider />
        <GenericTable
          columns={columns}
          dataSource={serviceSchedulingData}
          loading={serviceSchedulingLoading}
          handleTableChange={handleTableChange}
          rowClassName={(record:any, index:any) => handleScheduleIsPast(record) ? 'table-row-light' :  ''}
        />
      </Card>
      <PaginationComponent
        meta={meta}
        changePage={onChangePage}
        changePerPage={onChangeSizePage}
      />
      <DrawerServiceSchedulingComponent
        title={
          !openEditFormServiceScheduling
            ? "Novo Agendamento"
            : "Editar/Reagendar Agendamento"
        }
        open={openFormServiceScheduling || openEditFormServiceScheduling}
        close={closeDrawerServiceScheduling}
        save={saveServiceScheduling}
        isEdit={openEditFormServiceScheduling}
        repeatEnable={editMany}
        editData={serviceEditData}
        refetchShedulingList={refetchServiceScheduling}
        cleanFilters={onSubmitClearFilters}
      />
      <DrawerServiceSchedulingCanceledComponent
        title={"Cancelar Agendamento"}
        open={openCanceledFormServiceScheduling}
        close={closeDrawerCanceledServiceScheduling}
        patientId={patientId}
        refetchShedulingList={refetchServiceScheduling}
        cleanFilters={onSubmitClearFilters}
      />

      <Modal
        open={openModalEdit}
        title="Editar/Reagendar"
        onOk={handleEditOne}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleEditOne}
          >
            Editar sessão
          </Button>,
          <Button
            key="link"
            type="primary"
            onClick={handleEditMany}
          >
            Editar todas as sessões
          </Button>,
        ]}
      >
        <p>Deseja editar uma sessão ou todas ?</p>
      </Modal>
    </div>
  );
}
