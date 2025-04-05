import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Space,
  Tooltip,
  Typography,
} from "antd";
import ListGenericTable from "../../components/Commons/Table/generic-table.component";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  listUserRole,
  deleteUser,
  saveUser,
  editUser,
} from "../../services/user.service";
import { useMutation, useQuery } from "react-query";
import { IUser } from "../../Interfaces/Users.interfaces";
import { EnumProfile } from "../../Enums/Profile.enums";

import "../../assets/css/secundary-button.css";
import GenericDrawer from "../../components/Commons/Drawer/generic-drawer.component";
import { AlertService } from "../../services/alert.service";
import DisplayAlert from "../../components/Commons/Alert";
import UserFormDrawer from "../../components/Users/user-form-drawer.component";
import PaginationComponent from "../../components/Commons/Pagination";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";
import { useNavigate } from "react-router-dom";
import ProfilePermissionService from "../../services/profilePermissions.service";
const profilePermissionService = ProfilePermissionService.getInstance();

const { Title } = Typography;

export default function UsersPage() {
  const [userList, setUserList] = useState([]);
  const [openFormUser, setOpenFormUser] = useState(false);
  const [openEditFormUser, setOpenEditFormUser] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState<string | undefined>();
  const [sorter, setSorter] = useState<
    { field: string; order: string } | undefined
  >(undefined);
  const [formUser] = Form.useForm();
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });

  const navigate = useNavigate();

  const { mutate: DeleteUserMutate } = useMutation(deleteUser, {
    onSuccess: () => {
      showSuccessMutate("Utilizador apagado com sucesso.");
    },
    onError: () => {
      showErrorMutate("Erro ao apagar utilizador.");
    },
  });
  const { mutate: editUserMutate } = useMutation(editUser, {
    onSuccess: () => {
      showSuccessMutate("Alterações gravadas com sucesso.");
    },
    onError: () => {
      showErrorMutate("Erro ao editar utilizador.");
    },
  });
  const { mutate: saveUserMutate } = useMutation(saveUser, {
    onSuccess: () => {
      resetSearch();
      showSuccessMutate("Novo utilizador gravado com sucesso.");
    },
    onError: () => {
      showErrorMutate("Erro ao criar utilizador.");
    },
  });

  const resetSearch = () => {
    setCurrentPage(1)
    setPerPage(10)
    setSearch(undefined)
    setSorter(undefined)

    refetchListUser();
  }

  const { isLoading: userLoading, refetch: refetchListUser } = useQuery(
    ["userList", currentPage, perPage, sorter, search],
    () => listUserRole(currentPage, perPage, sorter, search),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        let list = [];
        if (data?.data) {
          list = data?.data.map((user: IUser) => {
            user.role = user?.profile?.description || null;
            user.key = user.id;
            return user;
          });
        }
        setMeta(data?.meta);
        setUserList(list);
      },
    }
  );

  const showSuccessMutate = (text: string) => {
    onCloseDrawer();
    AlertService.sendAlert([{ text }]);

    refetchListUser();
  };

  const showErrorMutate = (text: string) => {
    AlertService.sendAlert([{ text, type: "error" }]);
  };

  const showDrawerNewUser = () => {
    setOpenFormUser(true);
  };

  const showDrawerEditUser = (data: IUser) => {
    formUser.setFieldValue("id", data.id);
    formUser.setFieldValue("name", data.name);
    formUser.setFieldValue("email", data.email);
    formUser.setFieldValue("profile", data.profile?.id.toString());

    setOpenEditFormUser(true);
  };

  const onCloseDrawer = () => {
    formUser.resetFields();

    setOpenFormUser(false);
    setOpenEditFormUser(false);
  };

  const saveEditUser = () => {
    formUser
      .validateFields()
      .then((values) => {
        editUserMutate({ id: formUser.getFieldValue("id"), data: values });
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  };

  const saveNewUser = () => {
    formUser
      .validateFields()
      .then((values) => {
        saveUserMutate(values);
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  };

  const confirmDeleteUser = (user: any) => {
    Modal.confirm({
      title: "Tem a certeza que deseja apagar o utilizador?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sim",
      okType: "primary",
      cancelText: "Não",
      onOk() {
        DeleteUserMutate(user.id);
      },
    });
  };

  const goToProfile = () => {
    navigate("profile");
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

  const filterUser = (values: { search: string }) => {
    setSearch(values.search);
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
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      showSorterTooltip: {
        title: "Clique para alterar a ordem",
      },
    },
    {
      title: "Perfil",
      dataIndex: "role",
      key: "role",
      width: "15%",
    },
    {
      title: "Ações",
      key: "action",
      render: (_: any, record: any) => {
        const hasPermission = profilePermissionService.hasPermission("users-users:write");
        if (hasPermission) {
          return (
            <Space size="small">
              <Tooltip title="Editar">
                <Button
                  type="default"
                  shape="circle"
                  icon={<EditOutlined />}
                  size="middle"
                  onClick={() => {
                    showDrawerEditUser(record);
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
                    confirmDeleteUser(record);
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
      <DisplayAlert />
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
              onFinish={filterUser}
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
                >
                  Pesquisar
                </Button>
              </Form.Item>
            </Form>
          </Space>
          {profilePermissionService.hasPermission("users-users:write") && (
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Space>
                <Button type="link" size="large" onClick={goToProfile}>
                  <SettingOutlined />
                  Gerir perfis
                </Button>
              </Space>
              <Space>
                <Button type="primary" onClick={showDrawerNewUser} size="large">
                  Novo utilizador
                </Button>
              </Space>
            </div>
          )}
        </div>
        <Divider />
        <Title level={5}>Resultados: {meta?.total}</Title>
        <Divider />
        <ListGenericTable
          columns={columns}
          dataSource={userList}
          loading={userLoading}
          handleTableChange={handleTableChange}
        />
        <GenericDrawer
          title={!openEditFormUser ? "Novo Utilizador" : "Editar Utilizador"}
          children={
            <UserFormDrawer form={formUser} isEdit={!openEditFormUser} />
          }
          onClose={onCloseDrawer}
          open={openFormUser || openEditFormUser}
          footer={
            !openEditFormUser ? (
              <Button type="primary" block onClick={saveNewUser} size="large">
                Criar utilizador
              </Button>
            ) : (
              <Button type="primary" block onClick={saveEditUser} size="large">
                Gravar alterações
              </Button>
            )
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
