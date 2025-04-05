import { Button, Card, Divider, Form, Space, message, Modal, Tooltip, Typography } from "antd";
import { useState } from "react";
import GenericDrawer from "../../components/Commons/Drawer/generic-drawer.component";
import NewPatientDrawer from "../../components/Patient/create-or-update-patient-drawer.component";
import ListGenericTable from "../../components/Commons/Table/generic-table.component";
import { useMutation, useQuery } from "react-query";
import { patientDelete, patientEdit, patientList, patientPost } from "../../services/patient.service";
import { DeleteOutlined, EditOutlined, EyeOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import SeePatientDrawer from "../../components/Patient/see-patient-drawer.component";
import PaginationComponent from "../../components/Commons/Pagination";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";
import { AlertService } from "../../services/alert.service";
import DisplayAlert from "../../components/Commons/Alert";
import CopyAction from "../../components/Commons/Actions/copy";
import SearchPatient from "../../components/Patient/search-patient-form.component";
import ReturnButton from "../../components/Commons/Buttons/return-button.components";
import { Convert } from "../../services/convert.service";
import ProfilePermissionService from "../../services/profilePermissions.service";
import CreateOrUpdatePatientDrawer from "../../components/Patient/create-or-update-patient-drawer.component";
import { IPatientPageOptions } from "../../Interfaces/Patients.interfaces";
const profilePermissionService = ProfilePermissionService.getInstance();

const { Title } = Typography;

export default function PatientsPage() {
  const [openDrawerCreateUpdatePatient, setOpenDrawerCreateUpdatePatient] = useState(false);
  const [openDrawerSeePatient, setOpenDrawerSeePatient] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [patientsList, setPatientsList] = useState([]);
  const [createOrUpdatePatient, setCreateOrUpdatePatient] = useState('');
  const [formPatient] = Form.useForm();
  const [formSearchPatient] = Form.useForm();
  const [searchValue, setSearchValue] = useState('');
  const [statusValue, setStatusValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sorter, setSorter] = useState(undefined);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  })

  const patientPageOptions: { [key: string]: IPatientPageOptions } = {
    create: {
      titleLabel: 'Novo Utente',
      footerBtnLabel: 'Criar utente',
    },
    update: {
      titleLabel: 'Editar Utente',
      footerBtnLabel: 'Gravar alterações',
    },
  };

  const pageOptions = patientPageOptions[createOrUpdatePatient];

  const deletePatient = (patient: any) => patientDelete(patient);
  const { mutate: mutateDeletePatient } = useMutation(deletePatient, {
    onSuccess: () => {
      AlertService.sendAlert([{ text: 'Utente apagado com sucesso.' }])
      resetSearch()
    }
  })

  const { isLoading: patientLoading, refetch: patientRefetch } = useQuery(
    ["patientList", currentPage, perPage, sorter, statusValue, searchValue],
    () => {
      return patientList({ currentPage: currentPage, perPage: perPage, search: searchValue, status: statusValue, sorter: sorter })
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: async (data: any) => {
        let list = [];
        const patientsData = await data;

        if (patientsData?.data) {
          list = patientsData?.data.map((patient: any) => {
            patient.statusText = patient?.status ? 'Ativo' : 'Inativo'
            patient.key = patient.id;
            return patient;
          });
        }

        setMeta(patientsData?.meta);
        setPatientsList(list);
      },
    }
  );

  const handleCurrentPage = () => {
    setCurrentPage(1)
  };
  const handleSearchChange = (e: any) => {
    setSearchValue(e);
  };

  const handleStatusChange = (e: any) => {
    setStatusValue(e);
  };

  const showDrawerSeePatient = (data: any) => {
    setEditData({ ...data });
    setOpenDrawerSeePatient(true);
  };
  const onCloseDrawerSeePatient = () => {
    setOpenDrawerSeePatient(false);
  };

  const onClosePatientDrawer = () => {
    formPatient.resetFields();
    setEditData({});
    onSubmitClearFilters();
    resetSearch();
    setOpenDrawerCreateUpdatePatient(false);
  };

  const onSubmitClearFilters = () => {
    formSearchPatient.resetFields();
    setCurrentPage(1);
    setPerPage(10);
    setSorter(undefined);
    handleSearchChange('');
    handleStatusChange('');
    handleCurrentPage();
    patientRefetch();
  }

  const resetSearch = () => {
    setCurrentPage(1)
    setPerPage(10)
    setSorter(undefined)
    setSearchValue('')
    setStatusValue('all')

    patientRefetch();
  }

  const filteredPatients = () => {
    formSearchPatient.validateFields().then((values: any) => {
      handleSearchChange(values.search);
      handleStatusChange(values.status);
      handleCurrentPage();
    }).catch((error) => {
      console.error("error: ", error);
    })
  };

  const confirmDeletePatient = (patientId: number) => {
    Modal.confirm({
      title: 'Tem a certeza que deseja apagar o utente? ',
      icon: <ExclamationCircleOutlined />,
      okText: 'Sim',
      okType: 'primary',
      cancelText: 'Não',
      onOk() {
        handleDeletePatient(patientId);
      }
    });
  };

  const columns = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: true,
      showSorterTooltip: {
        title: "Clique para alterar a ordem",
      },
      render: (name: string) => (
        <CopyAction text={name} />
      ),
    },
    {
      title: "Número Utente",
      dataIndex: "patientNumber",
      key: "patientNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (email: string) => (
        email ? <CopyAction text={email} /> : 'Sem email'
      ),
    },
    {
      title: "Data Nascimento",
      dataIndex: "birthday",
      key: "birthday",
      render: (birthday: any) => (
        <p>{Convert.portugueseFormatDate(birthday)}</p>
      ),
    },
    {
      title: "Telefone",
      dataIndex: "phoneNumber",
      key: "phoneNumber"
    },
    {
      title: "Status",
      dataIndex: "statusText",
      key: "statusText",
    },
    {
      title: "Ações",
      key: "action",
      render: (_: any, record: any) => {
        const hasPermission = profilePermissionService.hasPermission("patients-patients:write");
        if (hasPermission) {
          return (<Space size="small" style={{width: '100%'}}>
            <Tooltip title="Ver">
              <Button
                type="default"
                shape="circle"
                icon={<EyeOutlined />}
                size="middle"
                onClick={() => {
                  showDrawerSeePatient(record);
                }}
              />
            </Tooltip>
            <Tooltip title="Editar">
              <Button
                type="default"
                shape="circle"
                icon={<EditOutlined />}
                size="middle"
                onClick={() => {
                  handleCreateOrUpdatePatient('update', record);
                }}
              />
            </Tooltip>
            <Tooltip title="Apagar">
              <Button
                type="default"
                shape="circle"
                icon={<DeleteOutlined />}
                size="middle"
                onClick={() => {
                  confirmDeletePatient(record.id);
                }}
              />
            </Tooltip>
          </Space>)
        } else {
          return (<div></div>)
        }
      }
    },
  ];

  const handleCreateOrUpdatePatient = (createOrUpdate: string, data?: any) => {
    setCreateOrUpdatePatient(createOrUpdate);

    if (createOrUpdate === 'create') {
      setOpenDrawerCreateUpdatePatient(true);
    }

    if (createOrUpdate === 'update' && data) {
      setEditData({ ...data });
      setOpenDrawerCreateUpdatePatient(true);
    }
  }

  const handleDeletePatient = (values: number) => {
    try {
      mutateDeletePatient(values);
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const onChangePage = (page: number) => {
    setCurrentPage(page)
  }

  const onChangeSizePage = (perPage: number) => {
    setPerPage(perPage)
  }

  const handleTableChange = (
    pagination: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: any,
  ) => {
    if (sorter) {
      handleCurrentPage();
      setSorter(sorter.order);
    }
  };

  return (
    <div className="content_page">
      <DisplayAlert show={["success"]} />
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%"
          }}
        >
          <SearchPatient
            form={formSearchPatient}
            footer={
              <Button className="secundary-button" size="large" onClick={filteredPatients}>Pesquisar</Button>
            }
          />
          {profilePermissionService.hasPermission("patients-patients:write") &&
            <Button size="large" type="primary" onClick={() => handleCreateOrUpdatePatient('create')}>
              Novo utente
            </Button>
          }
        </div>
        <Divider />
          <Title level={5}>Resultados: {meta?.total}</Title>
        <Divider />
        <ListGenericTable
          columns={columns}
          dataSource={patientsList}
          loading={patientLoading}
          handleTableChange={handleTableChange}
        />
        <GenericDrawer
          title="Informações"
          children={<SeePatientDrawer data={editData} />}
          onClose={onCloseDrawerSeePatient}
          open={openDrawerSeePatient}
          footer={
            <Space direction="vertical" style={{ width: '100%' }}>
              <ReturnButton closeDrawer={onCloseDrawerSeePatient} />
            </Space>
          }
          footerStyle={{ borderTop: "none" }}
        />
        <GenericDrawer
          title={pageOptions?.titleLabel}
          children={<CreateOrUpdatePatientDrawer form={formPatient} createOrUpdatePatient={createOrUpdatePatient} close={onClosePatientDrawer} data={editData} />}
          onClose={onClosePatientDrawer}
          open={openDrawerCreateUpdatePatient}
          closeIfClickOutside={false}
        />
      </Card>
      <PaginationComponent
        meta={meta}
        changePage={onChangePage}
        changePerPage={onChangeSizePage}
      />
    </div>
  );
}
