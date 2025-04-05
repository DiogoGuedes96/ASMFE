import { Button, Card, Divider, Form, Input, Modal, Space, Tooltip, Typography, Row, Col } from "antd";
import ListGenericTable from "../../components/Commons/Table/generic-table.component";
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import { delAmbulanceCrew, listCrewRole } from "../../services/crew.service";
import { useMutation, useQuery } from "react-query";
import { IUser } from "../../Interfaces/Users.interfaces";
import ReturnButton from "../../components/Commons/Buttons/return-button.components";

import "../../assets/css/secundary-button.css";
import GenericDrawer from "../../components/Commons/Drawer/generic-drawer.component";
import { AlertService } from "../../services/alert.service";
import DisplayAlert from "../../components/Commons/Alert";
import CrewFormDrawer from "../../components/Crew/crew-form-drawer.component";
import PaginationComponent from "../../components/Commons/Pagination";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";
import { useNavigate } from "react-router-dom";
import ProfilePermissionService from "../../services/profilePermissions.service";
import { ICrew } from "../../Interfaces/Crew.interfaces";
import CrewDetailsDrawer from "../../components/Crew/crew-details.component";
import { render } from "@testing-library/react";
import CopyAction from "../../components/Commons/Actions/copy";
const profilePermissionService = ProfilePermissionService.getInstance();

const { Title } = Typography;

export default function CrewPage() {
  const [crewList, setCrewList] = useState([]);
  const [openFormCrew, setOpenFormCrew] = useState(false);
  const [openEditFormCrew, setOpenEditFormCrew] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState<string | undefined>();
  const [sorter, setSorter] = useState<
    { field: string; order: string } | undefined
  >(undefined);
  const [formCrew] = Form.useForm();
  const [formFilterCrew] = Form.useForm();
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [openDrawerDetails, setOpenDrawerDetails] = useState(false)
  const [crewDetails, setCrewDetails] = useState<ICrew>()

  const resetSearch = () => {
    setCurrentPage(1)
    setPerPage(10)
    setSearch(undefined)
    setSorter(undefined)
    formFilterCrew.resetFields();
    refetchListCrew();
  }

  const { isLoading: crewLoading, refetch: refetchListCrew } = useQuery(
    ["crewList", currentPage, perPage, sorter, search],
    () => listCrewRole(currentPage, perPage, sorter, search),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        let list = [];
        if (data?.data) {
          list = data?.data.map((crew: ICrew) => {
            return crew;
          });
        }
        setMeta(data?.meta);
        setCrewList(list);
      },
    }
  );

  const deleteAmbulanceCrew = (patient: any) => delAmbulanceCrew(patient);
  const { mutate: mutateDeleteAmbulanceCrew} = useMutation(deleteAmbulanceCrew, {
    onSuccess: () => {
      resetSearch();
      AlertService.sendAlert([{ text: 'Tripulante apagado com sucesso.' }]);
    }
  })

  const showDrawerNewCrew = () => {
    setOpenFormCrew(true);
  };

  const showDrawerEditCrew = (data: ICrew) => {
    setCrewDetails(data);
    setOpenEditFormCrew(true);
  };

  const showDrawerDetailsCrew = (data: ICrew) => {
    setCrewDetails(data)
    setOpenDrawerDetails(true)
  }

  const onCloseDrawer = () => {
    formCrew.resetFields();

    setOpenFormCrew(false);
    setOpenEditFormCrew(false);
  };

  const onCloseDrawerDetails = () => {
    setOpenDrawerDetails(false)
  }

  const handleSearchChange = (value:string) => {
    setSearch(value);
  }


  const confirmDeleteCrew = (ambulanceCrew: number) => {
    Modal.confirm({
      title: "Tem a certeza que deseja apagar o tripulante?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sim",
      okType: "primary",
      cancelText: "Não",
      onOk() {
        mutateDeleteAmbulanceCrew(ambulanceCrew);
      },
    });
  };

  const onChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const onChangeSizePage = (perPage: number) => {
    setPerPage(perPage);
  };

  const handleTableChange = (
    pagination: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: any
  ) => {
    if (sorter) {
      console.log("filters", sorter);
      setSorter(sorter);
    }
  };

  const filterCrew = () => {
    formFilterCrew
      .validateFields()
      .then((values: any) => {
        handleSearchChange(values.search);
      })
      .catch((error) => {
        console.error("error: ", error);
      });
  };

  const openEditCloseDetails = (crewDetails: any) => {
    showDrawerEditCrew(crewDetails)
    setOpenDrawerDetails(false)
  }

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
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Telemóvel",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "NIF",
      dataIndex: "nif",
      key: "nif",
    },
    {
      title: "Carta de condução",
      dataIndex: "driverLicense",
      key: "driverLicense",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        status ? 'Ativo' : 'Inativo'
      )
    },
    {
      title: "Ações",
      key: "action",
      render: (_: any, record: any) => {
        const hasPermission = profilePermissionService.hasPermission("users-users:write");
        if (hasPermission) {
          return (
            <Space size="small">
              <Tooltip title="Detalhes">
                <Button
                  type="default"
                  shape="circle"
                  icon={<EyeOutlined />}
                  size="middle"
                  onClick={() => {
                    showDrawerDetailsCrew(record);
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
                    showDrawerEditCrew(record);
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
                    confirmDeleteCrew(record.id);
                  }}
                />
              </Tooltip>
            </Space>
          )
        } else {
          return (<div></div>)
        }
      },
      width: "10%",
    },
  ];
  return (
    <div className="content_page">
      <DisplayAlert show={["success", "info"]} />
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Space direction="horizontal" align="center" size="large">
            <Form
              form={formFilterCrew}
              layout="vertical"
              autoComplete="off"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              <Form.Item
                style={{ marginBottom: 0 }}
                name="search"
                label="Pesquisar"
                colon={false}
              >
                <Input size="large" />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  className="secundary-button"
                  htmlType="submit"
                  size="large"
                  onClick={filterCrew}
                >
                  Pesquisar
                </Button>
                <Button className="reset-button" onClick={resetSearch}>
                  Reset
                </Button>
              </Form.Item>
            </Form>
          </Space>
          {//profilePermissionService.hasPermission("crew-crew:write") && (
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Space>
                <Button type="primary" onClick={showDrawerNewCrew} size="large">
                  Novo tripulante
                </Button>
              </Space>
            </div>
          //)
          }
        </div>
        <Divider />
        <Title level={5}>Resultados: {meta?.total}</Title>
        <Divider />
        <ListGenericTable
          columns={columns}
          dataSource={crewList}
          loading={crewLoading}
          handleTableChange={handleTableChange}
        />
        <GenericDrawer
          title={!openEditFormCrew ? "Novo Tripulante" : "Editar Tripulante"}
          children={<CrewFormDrawer form={formCrew} isEdit={openEditFormCrew} data={crewDetails} onClose={onCloseDrawer} cleanFilters={resetSearch}/>}
          onClose={onCloseDrawer}
          open={openFormCrew || openEditFormCrew}
          footerStyle={{ borderTop: "none" }}
        />
        <GenericDrawer
          title="Detalhes"
          children={<CrewDetailsDrawer crewDetails={crewDetails} />}
          onClose={onCloseDrawerDetails}
          open={openDrawerDetails}
          footer={
            <Button type="primary" block onClick={() => { openEditCloseDetails(crewDetails) }} size="large">
              Editar
            </Button>
          }
          footerStyle={{ borderTop: "none" }}
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
