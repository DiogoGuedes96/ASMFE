import { useState } from "react";
import DrawerServiceCanceledRestoreComponent from "../../components/Canceled/drawer-service-canceled-restore.component";
import { getAllServiceSchedulingCanceled } from "../../services/serviceScheduling.service";
import { useQuery } from "react-query";
import {
  Button,
  Card,
  Divider,
  Form,
  PaginationProps,
  Space,
  Tooltip,
} from "antd";
import { Convert } from "../../services/convert.service";
import { HistoryOutlined } from "@ant-design/icons";
import SearchScheduling from "../../components/Scheduling/search-scheduling.component";
import GenericTable from "../../components/Commons/Table/generic-table.component";
import PaginationComponent from "../../components/Commons/Pagination";
import { FilterValue } from "antd/lib/table/interface";
import { AlertService } from "../../services/alert.service";
import ProfilePermissionService from "../../services/profilePermissions.service";
import DisplayAlert from "../../components/Commons/Alert";

const profilePermissionService = ProfilePermissionService.getInstance();

export default function CanceledPage() {
  const [openCanceledForm, setOpenCanceledForm] = useState(false);
  const [sorter, setSorter] = useState<
    { columnKey: string; order: string } | undefined
  >(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState();
  const [serviceSchedulingCanceled, setServiceSchedulingData] = useState([]);
  const [searchCanceledForm] = Form.useForm();
  const [searchValue, setSearchValue] = useState("");
  const [searchStartDate, setSearchStartDate] = useState<string>();
  const [searchEndDate, setSearchEndDate] = useState<string>();
  const [canceledSchedule, setCanceledSchedule] = useState<any>();

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
      getAllServiceSchedulingCanceled(
        currentPage,
        perPage,
        searchValue,
        sorter,
        searchStartDate,
        searchEndDate
      ),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data: any) => {
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
    searchCanceledForm.resetFields();
  }

  const filteredClients = () => {
    searchCanceledForm
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

  const handleOpenCanceledForm = (record: any) => {
    setCanceledSchedule(record);
    setOpenCanceledForm(true);
  };

  const handleCloseCanceledForm = () => {
    setOpenCanceledForm(false);
    onSubmitClearFilters();
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
      render: (patient_name:any) => <p>{patient_name ?? 'Utente eliminado'}</p>
    },
    {
      title: "Nº Utente",
      dataIndex: ["patient", "patientNumber"],
      key: "patient_number",
      render: (patient_number:any) => <p>{patient_number ?? 'Sem dados'}</p>
    },
    {
      title: "Contacto",
      dataIndex: ["patient", "phoneNumber"],
      key: "patient_contact",
      render: (patient_contact:any) => <p>{patient_contact ?? 'Sem dados'}</p>
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
      title: "Motivo",
      dataIndex: ["canceled", "canceled_reason"],
      key: "canceled_reason",
      ellipsis: true,
      render: (canceled_reason:any) => <p>{canceled_reason ?? 'Utente eliminado'}</p>
    },
    {
      title: "CI/UT",
      dataIndex: ["canceled", "canceled_client_patient"],
      key: "canceled_client_patient",
      ellipsis: true,
      render: (canceled_client_patient:any) => <p>{canceled_client_patient ? canceled_client_patient == 'client' ? 'Cliente' : 'Utente' : 'Sem dados'}</p>
    },
    {
      title: "Operador",
      dataIndex: ["user", "name"],
      key: "user_name",
      ellipsis: true,
    },
    {
      title: "Ações",
      key: "action",
      render: (_: any, record: any) => {
        const permission = profilePermissionService.hasPermission(
          "asm_schedule-asm_schedule_canceled:write"
        );
        if (permission) {
          return (
            <Space size="small">
              <Tooltip title="Restaurar">
                <Button
                  type="default"
                  shape="circle"
                  icon={<HistoryOutlined />}
                  size="middle"
                  disabled={!record.patient}
                  onClick={() => {
                    handleOpenCanceledForm(record);
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
  const handleTableChange = (
    pagination: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: any
  ) => {
    if (sorter) {
      setSorter(sorter);
    }
  };

  const onChangePage = (page: number) => {
    setCurrentPage(page);
  };
  const onChangeSizePage = (perPage: number) => {
    setPerPage(perPage);
  };

  return (
    <div className="content_page">
      <DisplayAlert style={{ marginBottom: 16 }} />
      <Card>
        <div className="search_scheduling_space">
          <SearchScheduling
            form={searchCanceledForm}
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
        </div>
        <Divider />
        <GenericTable
          columns={columns}
          dataSource={serviceSchedulingCanceled}
          loading={serviceSchedulingLoading}
          handleTableChange={handleTableChange}
        />
      </Card>
      <PaginationComponent
        meta={meta}
        changePage={onChangePage}
        changePerPage={onChangeSizePage}
      />
      <DrawerServiceCanceledRestoreComponent
        title={"Agendamento Cancelado"}
        open={openCanceledForm}
        close={handleCloseCanceledForm}
        canceledSchedule={canceledSchedule}
        refetchServiceScheduling={refetchServiceScheduling}
        sendAlert={AlertService.sendAlert}
        cleanFilters={onSubmitClearFilters}
      />
    </div>
  );
}
