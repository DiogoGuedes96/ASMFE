import { Button, Card, Divider, Form, Modal, Space, Tooltip, Typography } from "antd";
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

import { useState } from "react";
import { useMutation, useQuery } from "react-query";

import "../../assets/css/secundary-button.css";
import GenericDrawer from "../../components/Commons/Drawer/generic-drawer.component";
import CreateOrdUpdateClientDrawer from "../../components/Clients/create-or-update-client-drawer-component";
import ListGenericTable from "../../components/Commons/Table/generic-table.component";
import SearchClient from "../../components/Clients/search-client-form-component";
import { IClientPageOptions } from "../../Interfaces/Clients.interfaces";
import { getAllClients, createClient, editClient, deleteClient } from "../../services/client.service";
import PaginationComponent from "../../components/Commons/Pagination";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";
import DisplayAlert from "../../components/Commons/Alert";
import CopyAction from "../../components/Commons/Actions/copy";
import { AlertService } from "../../services/alert.service";
import ProfilePermissionService from "../../services/profilePermissions.service";
const profilePermissionService = ProfilePermissionService.getInstance();

const { Title } = Typography;

export default function ClientsPage() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [clientsList, setClientsList] = useState([]);
  const [editData, setEditData] = useState<any>({});
  const [clientForm] = Form.useForm();
  const [searClientForm] = Form.useForm();
  const [searchValue, setSearchValue] = useState('');
  const [statusValue, setStatusValue] = useState('all');
  const [typeValue, setTypeValue] = useState('all');
  const [createOrUpdateClient, setCreateOrUpdateClient] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sorter, setSorter] = useState(undefined);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  })

  const handleCurrentPage = () => {
    setCurrentPage(1)
  };

  const clientPageOptions: { [key: string]: IClientPageOptions } = {
    create: {
      titleLabel: 'Novo Cliente',
      footerBtnLabel: 'Criar cliente',
    },
    update: {
      titleLabel: 'Editar Cliente',
      footerBtnLabel: 'Gravar alterações',
    },
  };

  const pageOptions = clientPageOptions[createOrUpdateClient];

  const { mutate: mutateDeleteClient } = useMutation(deleteClient, {
    onSuccess: () => {
      AlertService.sendAlert([{ text: "Cliente apagado com sucesso." }]);
      resetSearch()
    }
  });

  const { isLoading: getClientsLoading, refetch: clientsRefresh } = useQuery(
    ["getAllClients", currentPage, perPage, sorter, statusValue, typeValue, searchValue],
    () => {
      return getAllClients({ currentPage: currentPage, perPage: perPage, search: searchValue, status: statusValue, type: typeValue, sorter: sorter })
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: async (data: any) => {
        let list = [];
        const clientData = await data;
        if (clientData?.data) {
          list = clientData?.data.map((client: any) => {
            client.statusText = client?.status ? 'Ativo' : 'Inativo';
            client.typeText = client?.type === 'public' ? 'Público' : 'Privado';
            client.key = client.id;
            return client;
          });
        }

        if (clientData?.meta) {
          setMeta(clientData?.meta);
        }
        setClientsList(list);
      },
    }
  );

  const handleCloseClientDrawer = () => {
    clientForm.resetFields();
    setEditData({});
    resetSearch();
    setOpenDrawer(false);
  };

  const handleCreateOrUpdateClient = (createOrUpdate: string, data?: any) => {
    setCreateOrUpdateClient(createOrUpdate);

    if (createOrUpdate === 'create') {
      setOpenDrawer(true);
    }

    if (createOrUpdate === 'update' && data) {
      setEditData({ ...data });
      setOpenDrawer(true);
    }
  }


  const resetSearch = () => {
    setCurrentPage(1)
    setPerPage(10)
    setSorter(undefined)
    setSearchValue('')
    setStatusValue('all')
    setTypeValue('all')
    searClientForm.resetFields();
    clientsRefresh();
  }

  const handleSearchChange = (e: any) => {
    setSearchValue(e);
  };

  const handleStatusChange = (e: any) => {
    setStatusValue(e);
  };

  const handleTypeChange = (e: any) => {
    setTypeValue(e);
  };

  const filteredClients = () => {
    searClientForm.validateFields().then((values: any) => {
      handleSearchChange(values.search);
      handleStatusChange(values.status);
      handleTypeChange(values.type);
      handleCurrentPage();
      clientsRefresh();
    }).catch((error) => {
      console.error("error: ", error);
    })
  };

  const confirmDeleteClient = (clientId: number) => {
    Modal.confirm({
      title: 'Tem a certeza que deseja apagar o cliente?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Apagar',
      okType: 'primary',
      cancelText: 'Voltar',
      onOk() {
        mutateDeleteClient(clientId);
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
      title: "Morada",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "NIF",
      dataIndex: "nif",
      key: "nif",
    },
    {
      title: "Tipo de Cliente",
      dataIndex: "typeText",
      key: "typeText",
    },
    {
      title: "Telefone",
      dataIndex: "phone",
      key: "phone",
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
        const permission = profilePermissionService.hasPermission("clients-clients:write");
        if (permission) {
          return (
            <Space size="small">
              <Tooltip title="Editar">
                <Button
                  type="default"
                  shape="circle"
                  icon={<EditOutlined />}
                  size="middle"
                  onClick={() => {
                    handleCreateOrUpdateClient('update', record);
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
                    confirmDeleteClient(record?.id)
                  }}
                />
              </Tooltip>
            </Space>
          )
        } else {
          return (
            <div></div>
          )
        }
      },
      width: "10%",
    },
  ];


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
      <DisplayAlert />
      <Card>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          width: "100%"
        }}>
          <SearchClient
            form={searClientForm}
            footer={
              <Button size="large" className="secundary-button" onClick={filteredClients}>Pesquisar</Button>
            }
          />
          {profilePermissionService.hasPermission("clients-clients:write") && (
            <Button size="large" type="primary" onClick={() => handleCreateOrUpdateClient('create')}>
              Novo cliente
            </Button>
          )}
        </div>
        <Divider />
          <Title level={5}>Resultados: {meta?.total}</Title>
        <Divider />
        <ListGenericTable
          columns={columns}
          dataSource={clientsList}
          loading={getClientsLoading}
          handleTableChange={handleTableChange}
        />
        <GenericDrawer
          title={pageOptions?.titleLabel}
          children={<CreateOrdUpdateClientDrawer form={clientForm} createOrUpdateClient={createOrUpdateClient} close={handleCloseClientDrawer} data={editData} />}
          onClose={() => handleCloseClientDrawer()}
          open={openDrawer}
          closeIfClickOutside={false}
        />
        <PaginationComponent
          meta={meta}
          changePage={onChangePage}
          changePerPage={onChangeSizePage}
        />
      </Card>
    </div>
  );
}
