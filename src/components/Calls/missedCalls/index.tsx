import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

import { Card, Button, Form, Tooltip } from 'antd';
import { RightOutlined } from "@ant-design/icons";

import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";

import PaginationComponent from "../../Commons/Pagination";
import { getCallsMissed } from "../../../services/calls.service";
import ListGenericTable from "../../Commons/Table/generic-table.component";

import { NOT_REGISTERED_LABEL } from "../../../services/utils";

export default function MissedCalls() {
  const userLogged: any = localStorage.getItem('user');
  const [user] = useState(localStorage.getItem('user') ? JSON.parse(userLogged) : null);

  const [callsMissed, setCallsMissed]: any = useState();

  const navigate = useNavigate();

  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sorter, setSorter] = useState<
    { field: string; order: string } | undefined
  >(undefined);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  })

  const { isLoading: isloadingGetCallsHangup, refetch: callsMissedRefetch } = useQuery(
    [
      "callsMissed", 
      currentPage, 
      perPage,
      sorter,
    ],
    () => {
      return getCallsMissed(currentPage, perPage, sorter)
    },
    {
    onSuccess: async (data: any) => {
      let list = [];
      const queryCallsData = await data?.calls?.data;
      if (queryCallsData) {
        list = queryCallsData.map((call: any) => {
          call.key        = call.id;
          call.name       = call?.entity?.name ?? NOT_REGISTERED_LABEL;
          call.address    = call?.entity?.address ?? NOT_REGISTERED_LABEL;
          call.nif        = call?.entity?.nif ?? NOT_REGISTERED_LABEL;
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

      setCallsMissed(list);
    },
  })
  
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
      handleCurrentPage();
      setSorter(sorter);
    }
  };

  const tableColumns = [
    {
      title: "Nome",
      dataIndex: "entity_name",
      key: "name",
      sorter: true,
      render: (name: string | null) => name || NOT_REGISTERED_LABEL,
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
      title: "NIF",
      dataIndex: "entity_nif",
      key: "nif",
      render: (nif: string | null) => nif || NOT_REGISTERED_LABEL,
    },
    {
      title: "Hora",
      dataIndex: "hour",
      key: "hour",
    },
    {
      title: "Morada",
      dataIndex: "entity_name_address",
      key: "address",
      render: (address: string | null) => address || NOT_REGISTERED_LABEL,
    },
    {
      title: "Ações",
      key: "action",
      render: (_: any, record: any) => {
        return (
            <>
                <Tooltip title="Detalhes">
                  <Button size="large" shape="circle" onClick={() => navigate(`/calls/missed/${record?.call_id}`)}>
                      <RightOutlined />
                  </Button>
                </Tooltip>
            </>
          );
      },
    },
  ];

  return (
    <div className="content_page">
      <Card>
        <ListGenericTable
          columns={tableColumns}
          dataSource={callsMissed}
          loading={isloadingGetCallsHangup}
          handleTableChange={handleTableChange}
        />
        {
          callsMissed &&
          <PaginationComponent
            meta={meta}
            changePage={onChangePage}
            changePerPage={onChangeSizePage}
          />
        }
      </Card>
    </div>
  );
}
