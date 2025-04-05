import {
  Button,
  Card,
  Divider,
  Form,
  Modal,
  Space,
  Tooltip,
  message,
} from "antd";
import DisplayAlert from "../../components/Commons/Alert";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import CopyAction from "../../components/Commons/Actions/copy";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";
import PaginationComponent from "../../components/Commons/Pagination";
import ListGenericTable from "../../components/Commons/Table/generic-table.component";
import { AlertService } from "../../services/alert.service";
import {
  feedbackDelete,
  feedbackList,
} from "../../services/feedback.service";
import { useMutation, useQuery } from "react-query";
import SearchFeedback from "../../components/Feedback/search-feedback-form.component";
import ProfilePermissionService from "../../services/profilePermissions.service";

import "../../assets/css/scheduling.css";
import { Convert } from "../../services/convert.service";
import DrawerFeedBackComponent from "../../components/Feedback/feedback-drawer.component";

const profilePermissionService = ProfilePermissionService.getInstance();

export default function FeedbackPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [openFormFeedback, setOpenFormFeedback] = useState(false);
  const [openEditFormFeedback, setOpenEditFormFeedback] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [FeedbacksList, setFeedbacksList] = useState([]);
  const [formFeedback] = Form.useForm();
  const [formSearchFeedback] = Form.useForm();
  const [searchValue, setSearchValue] = useState("");
  const [searchStartDate, setSearchStartDate] = useState<string>();
  const [searchEndDate, setSearchEndDate] = useState<string>();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sorter, setSorter] = useState(undefined);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });

  const handleCurrentPage = () => {
    setCurrentPage(1);
  };
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
  const showDrawerNewFeedback = () => {
    setOpenEditFormFeedback(false);
    setEditData({});
    setOpenFormFeedback(true);
  };

  const showDrawerEditFeedback = (data: any) => {
    setEditData({ ...data });
    setOpenEditFormFeedback(true);
  };

  const onChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const onChangeSizePage = (perPage: number) => {
    setPerPage(perPage);
  };

  const onSubmitClearFilters = () => {
    onChangeSizePage(10);
    setSorter(undefined);
    handleSearchChange('');
    handleSearchStartDate("");
    handleSearchEndDate("");
    handleCurrentPage();
    formSearchFeedback.resetFields();
    feedbackRefetch();
  }

  const onCloseDrawer = () => {
    formFeedback.resetFields();
    setOpenFormFeedback(false);
    setOpenEditFormFeedback(false);
    onSubmitClearFilters();
  };

  const { isLoading: feedbackLoading, refetch: feedbackRefetch } = useQuery(
    [
      "feedbackList",
      currentPage,
      perPage,
      sorter,
      searchStartDate,
      searchEndDate,
      searchValue,
    ],
    () => {
      return feedbackList(
        currentPage,
        perPage,
        searchValue,
        searchStartDate,
        searchEndDate,
        sorter
      );
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: async (data: any) => {
        let list = [];
        const feedbackData = await data;
        if (feedbackData?.data) {
          list = feedbackData?.data.map((feedback: any) => {
            feedback.patientNumberText =
              feedback.patientNumber !== 0
                ? feedback.patientNumber
                : "Sem Nº Utente";
            feedback.dateText =
              feedback.date !== null
                ? Convert.portugueseFormatDate(feedback.date)
                : "Sem Data";
            feedback.timeText =
              feedback.time !== null
                ? Convert.timeWithouSeconds(feedback.time)
                : "Sem Hora";
            return feedback;
          });
        }
        setMeta(feedbackData?.meta);
        setFeedbacksList(list);
      },
    }
  );

  const handleTableChange = (
    pagination: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: any
  ) => {
    if (sorter) {
      handleCurrentPage();
      setSorter(sorter.order);
    }
  };

  const deleteFeedback = (feedback: any) => feedbackDelete(feedback);
  const { mutate: mutateDeleteFeedback } = useMutation(deleteFeedback, {
    onSuccess: () => {
      feedbackRefetch();
      AlertService.sendAlert([{ text: "O Elogio/Reclamação foi apagado com sucesso." }]);
    },
  });

  const confirmDeleteFeedback = (feedbackId: number) => {
    Modal.confirm({
      title: "Tem a certeza que deseja apagar o Elogio/Reclamação? ",
      icon: <ExclamationCircleOutlined />,
      okText: "Sim",
      okType: "primary",
      cancelText: "Não",
      onOk() {
        mutateDeleteFeedback(feedbackId);
      },
    });
  };

  const filteredFeedback = () => {
    formSearchFeedback
      .validateFields()
      .then((values: any) => {
        handleSearchChange(values.search);
        handleSearchStartDate(values.searchStartDate);
        handleSearchEndDate(values.searchEndDate);
        handleCurrentPage();
      })
      .catch((error) => {
        console.error("error: ", error);
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
      render: (name: string) => <CopyAction text={name} />,
      width: "20%",
    },
    {
      title: "Nº Utente",
      dataIndex: "patientNumberText",
      key: "patientNumberText",
      width: "10%",
    },
    {
      title: "Motivo",
      dataIndex: "reason",
      key: "reason",
      width: "10%",
    },
    {
      title: "Data",
      dataIndex: "dateText",
      key: "dateText",
      width: "10%",
    },
    {
      title: "Hora",
      dataIndex: "timeText",
      key: "timeText",
      width: "10%",
    },
    {
      title: "Descrição",
      dataIndex: "description",
      key: "description",
      width: "25%",
      ellipsis: {
        showTitle: false,
      },
    },
    {
      title: "Ações",
      key: "action",
      render: (_: any, record: any) => {
        const permission = profilePermissionService.hasPermission(
          "asm_schedule-asm_schedule_feedback:write"
        );
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
                    showDrawerEditFeedback(record);
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
                    confirmDeleteFeedback(record.id);
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

  const onCloseDrawerFeedback = () => {
    setOpenFormFeedback(false);
    setOpenEditFormFeedback(false);
  };

  return (
    <div className="content_page">
      <DisplayAlert show={["success"]} />
      <Card>
        {contextHolder}
        <div className="search_scheduling_space">
          <SearchFeedback
            form={formSearchFeedback}
            footer={
              <Button
                className="secundary-button"
                size="large"
                onClick={filteredFeedback}
              >
                Pesquisar
              </Button>
            }
          />
          {profilePermissionService.hasPermission(
            "asm_schedule-asm_schedule_feedback:write"
          ) && (
              <Button type="primary" size="large" onClick={showDrawerNewFeedback}>
                Novo Elogio/Reclamação
              </Button>
            )}
        </div>
        <Divider />
        <ListGenericTable
          columns={columns}
          dataSource={FeedbacksList}
          loading={feedbackLoading}
          handleTableChange={handleTableChange}
        />
      </Card>
      <DrawerFeedBackComponent
        title={
          (!openEditFormFeedback ? "Novo " : "Editar ") +
          "Elogio ou Reclamação"
        }
        openEditFormFeedback={openEditFormFeedback}
        openFormFeedback={openFormFeedback}
        close={onCloseDrawer}
        feedBackForm={formFeedback}
        onSubmitClearFilters={onSubmitClearFilters}
        onCloseDrawerFeedback={onCloseDrawerFeedback}
        editData={editData}
      />
      <PaginationComponent
        meta={meta}
        changePage={onChangePage}
        changePerPage={onChangeSizePage}
      />
    </div>
  );
}
