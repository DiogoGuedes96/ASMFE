import { Button, Card, Divider, Form, Input, Modal, Space, Tooltip, Typography, Row, Col } from "antd";
import ListGenericTable from "../../components/Commons/Table/generic-table.component";
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import { delAmbulanceGroup, listGroupRole } from "../../services/group.service";
import { useMutation, useQuery } from "react-query";
import { IUser } from "../../Interfaces/Users.interfaces";
import ReturnButton from "../../components/Commons/Buttons/return-button.components";

import "../../assets/css/secundary-button.css";
import GenericDrawer from "../../components/Commons/Drawer/generic-drawer.component";
import { AlertService } from "../../services/alert.service";
import DisplayAlert from "../../components/Commons/Alert";
import GroupFormDrawer from "../../components/Group/group-form-drawer.component";
import PaginationComponent from "../../components/Commons/Pagination";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";
import { useNavigate } from "react-router-dom";
import ProfilePermissionService from "../../services/profilePermissions.service";
import { IGroup } from "../../Interfaces/Group.interfaces";
import GroupDetailsDrawer from "../../components/Group/group-details.component";
const profilePermissionService = ProfilePermissionService.getInstance();

const { Title } = Typography;

export default function GroupGroupPage() {
  const [GroupList, setGroupList] = useState([]);
  const [openFormGroup, setOpenFormGroup] = useState(false);
  const [openEditFormGroup, setOpenEditFormGroup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState<string | undefined>();
  const [sorter, setSorter] = useState<
    { field: string; order: string } | undefined
  >(undefined);
  const [formGroup] = Form.useForm();
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [openDrawerDetails, setOpenDrawerDetails] = useState(false)
  const [groupDetails, setGroupDetails] = useState<IGroup>()

  const resetSearch = () => {
    setCurrentPage(1)
    setPerPage(10)
    setSearch(undefined)
    setSorter(undefined)

    refetchListGroup();
  }

  const { isLoading: GroupLoading, refetch: refetchListGroup } = useQuery(
    ["GroupList", currentPage, perPage, sorter, search],
    () => listGroupRole(currentPage, perPage, sorter, search),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        let list = [];
        if (data?.data) {
          list = data?.data.map((crew: IGroup) => {
            crew.key = crew.id;
            return crew;
          });
        }
        setMeta(data?.meta);
        console.info(list);
        setGroupList(list);
      },
    }
  );

  const deleteAmbulanceGroup = (group: number) => delAmbulanceGroup(group);
  const { mutate: mutateDeleteAmbulanceGroup} = useMutation(deleteAmbulanceGroup, {
    onSuccess: () => {
      resetSearch();
      AlertService.sendAlert([{ text: 'Grupo apagado com sucesso.' }]);
    }
  })
  const showSuccessMutate = (text: string) => {
    onCloseDrawer();
    AlertService.sendAlert([{ text }]);

    refetchListGroup();
  };

  const showErrorMutate = (text: string) => {
    AlertService.sendAlert([{ text, type: "error" }]);
  };

  const showDrawerNewGroup = () => {
    setOpenFormGroup(true);
  };

  const showDrawerEditGroup = (data: IGroup) => {
    setGroupDetails(data);
    setOpenEditFormGroup(true);
  };

  const showDrawerDetailsGroup = (data: IGroup) => {
    setGroupDetails({
      id: data.id,
      name: data.name,
      crew: data.crew
    })
    setOpenDrawerDetails(true)
  }

  const onCloseDrawer = () => {
    formGroup.resetFields();

    setOpenFormGroup(false);
    setOpenEditFormGroup(false);
  };

  const onCloseDrawerDetails = () => {
    setOpenDrawerDetails(false)
  }

  const confirmDeleteGroup = (group: any) => {
    Modal.confirm({
      title: "Tem a certeza que deseja apagar o tripulante?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sim",
      okType: "primary",
      cancelText: "Não",
      onOk() {
        mutateDeleteAmbulanceGroup(group.id)
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

  const filterGroup = (values: { search: string }) => {
    setSearch(values.search);
  };

  const openEditCloseDetails = (groupDetails: any) => {
    showDrawerEditGroup(groupDetails)
    setOpenDrawerDetails(false)
  }

  const columns = [
    {
      title: "Grupo",
      dataIndex: "name",
      key: "name",
      sorter: true,
      showSorterTooltip: {
        title: "Clique para alterar a ordem",
      },
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
                    showDrawerDetailsGroup(record);
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
                    showDrawerEditGroup(record);
                  }}
                />
              </Tooltip>
              <Tooltip title="Apagar">
                <Button
                  type="default"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  size="middle"
                  disabled={record.crew.length > 0}
                  onClick={() => {
                    confirmDeleteGroup(record);
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
              onFinish={filterGroup}
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
          {//profilePermissionService.hasPermission("Group-Group:write") && (
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Space>
                <Button type="primary" onClick={showDrawerNewGroup} size="large">
                  Novo Grupo
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
          dataSource={GroupList}
          loading={GroupLoading}
          handleTableChange={handleTableChange}
        />
        <GenericDrawer
          title={!openEditFormGroup ? "Novo grupo" : "Editar grupo"}
          children={<GroupFormDrawer form={formGroup} isEdit={openEditFormGroup} data={groupDetails} onClose={onCloseDrawer} cleanFilters={resetSearch}/>}
          onClose={onCloseDrawer}
          open={openFormGroup || openEditFormGroup}
          footerStyle={{ borderTop: "none" }}
        />
        <GenericDrawer
          title="Detalhes"
          children={<GroupDetailsDrawer groupDetails={groupDetails} />}
          onClose={onCloseDrawerDetails}
          open={openDrawerDetails}
          footer={
            <Button type="primary" block onClick={() => { openEditCloseDetails(groupDetails) }} size="large">
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
