import { useState } from "react";
import { useQuery, useMutation } from "react-query";

import { Button, Card, Divider, Form } from "antd";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";

import { getCallsHangup, exportAnsweredCalls } from "../../../services/calls.service";
import ListGenericTable from "../../Commons/Table/generic-table.component";
import PaginationComponent from "../../../components/Commons/Pagination";
import { NOT_REGISTERED_LABEL } from "../../../services/utils";
import SearchAnsweredCalls from "./search-answered-calls-form.component";

import "../../../assets/css/calls.css";
import GenericDrawer from "../../Commons/Drawer/generic-drawer.component";
import ReturnButton from "../../Commons/Buttons/return-button.components";
import ExportAnsweredCalls from "./export-answered-calls-form.component";
import { AlertService } from "../../../services/alert.service";
import DisplayAlert from "../../Commons/Alert";
import { ExportOutlined } from "@ant-design/icons";

export default function AnsweredCalls() {
  const [callsHungup, setCallsHungup]: any = useState();
  const [formSearchAnsweredCalls] = Form.useForm();
  const [formExportAnsweredCalls] = Form.useForm();
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sorter, setSorter] = useState<
    { field: string; order: string } | undefined
  >(undefined);
  const [openExportDrawer, setOpenExportDrawer] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchStartDate, setSearchStartDate] = useState<string>();
  const [searchEndDate, setSearchEndDate] = useState<string>();
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  })

  const { isLoading: isloadingGetCallsHangup, refetch: callsHangupRefetch } = useQuery(
    [
      "callsHangup", 
      currentPage, 
      perPage,
      searchValue,
      sorter,
      searchStartDate,
      searchEndDate,
    ],
    () => {
      return getCallsHangup(currentPage, perPage, searchValue, sorter, searchStartDate, searchEndDate)
    }, 
    {
    onSuccess: async (data: any) => {
      let list = [];
      const queryCallsData = await data?.calls?.data;

      if (queryCallsData) {
        list = queryCallsData.map((call: any) => {
          call.key        = call.id;
          call.name       = call?.entity_name ?? NOT_REGISTERED_LABEL;
          call.address    = call?.entity_address ?? NOT_REGISTERED_LABEL;
          call.nif        = call?.entity_nif ?? NOT_REGISTERED_LABEL;
          call.phone      = call?.callee_phone ? call?.callee_phone : call?.caller_phone;
          call.date       = formatDate(call?.call_created_at);
          call.hour       = formatTime(call?.call_created_at);
          call.operator   = call?.operator_name ?? '-';
          call.callReason = call?.call_reason ?? '-';
          return call;
        });
      }

      if (data?.meta) {
        setMeta(data?.meta);
      }

      setCallsHungup(list);
    },
  })

  const { mutate: mutateExportAnsweredCalls } = useMutation(exportAnsweredCalls, {
    onSuccess: () => {
      onCloseDrawer();
      formExportAnsweredCalls.resetFields();
      AlertService.sendAlert([{ text: 'As informações do chamadas foram exportadas com sucesso.' }])
    }
  });

  const formatDate = (dateTimeString: any): string => {
    const date = new Date(dateTimeString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateTimeString: any): string => {
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleCurrentPage = () => {
    setCurrentPage(1)
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
      setSorter(sorter);
    }
  };

  const tableColumns = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Contacto",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      sorter: true,
    },
    {
      title: "Hora",
      dataIndex: "hour",
      key: "hour",
    },
    {
      title: "NIF",
      dataIndex: "nif",
      key: "nif",
    },
    {
      title: "Morada",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Operador",
      dataIndex: "operator",
      key: "operator",
    },
    {
      title: "Motivo da Chamada",
      dataIndex: "callReason",
      key: "callReason",
    },
  ];

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

  const filteredAnwseredCalls = () => {
    formSearchAnsweredCalls
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

  const onCloseDrawer = () => {
    setOpenExportDrawer(false);
  };

  const handleFormatDates = (e: any) => {
    if (e) {
      const data = e.$y + "-" + (e.$M + 1) + "-" + e.$D;
      return data;
    }
  };

  const handleExportAnsweredCalls = () => {
    formExportAnsweredCalls.validateFields().then((values: any) => {
      let startDate = handleFormatDates(values?.searchDateRange[0]);
      let endDate = handleFormatDates(values?.searchDateRange[1]);

      mutateExportAnsweredCalls({ search: values.search, searchStartDate: startDate, searchEndDate:endDate });
    }).catch((error) => {
      console.info("error: ", error);
    })
  }

  return (
    <div className="content_page">
      <DisplayAlert show={["success"]} />
      <Card>
        <div className="search_anwesered_calls_space">
          <SearchAnsweredCalls
            form={formSearchAnsweredCalls}
            footer={
              <Button
                className="secundary-button"
                size="large"
                onClick={filteredAnwseredCalls}
              >
                Pesquisar
              </Button>
            }
          />
          <Button type="link" size="large" onClick={() => setOpenExportDrawer(true)}>
            <ExportOutlined />
            Exportar
          </Button>
        </div>
          <Divider />
        <ListGenericTable
          columns={tableColumns}
          dataSource={callsHungup}
          loading={isloadingGetCallsHangup}
          handleTableChange={handleTableChange}
        />
      </Card>
      {
        callsHungup &&
        <PaginationComponent
          meta={meta}
          changePage={onChangePage}
          changePerPage={onChangeSizePage}
        />
      }
        <GenericDrawer
          title="Exportar"
          children={
            <ExportAnsweredCalls
            form={formExportAnsweredCalls}
          />
          }
          onClose={onCloseDrawer}
          open={openExportDrawer}
          closeIfClickOutside={false}
          footer={
            <div>
              <Button
                type="primary"
                size="large"
                block
                onClick={handleExportAnsweredCalls}
              >
                Exportar
              </Button>
              <ReturnButton closeDrawer={onCloseDrawer} />
            </div>
          }
          footerStyle={{ borderTop: "none" }}
        />
    </div>
  );
}