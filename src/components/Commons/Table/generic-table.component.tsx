import { Table, TablePaginationConfig, Typography } from "antd";
import { ColumnProps } from "antd/es/table";
import {
  FilterValue,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import { PaginationProps } from "antd/lib";
import { ReactNode, useEffect, useState } from "react";

interface TableParams {
  pagination?: PaginationProps;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue | null>;
}

interface DataSource {
  [key: string]: any;
}

interface ListParameters {
  columns: ColumnProps<any>[];
  dataSource: DataSource[];
  loading?: boolean;
  pagination?: PaginationProps;
  totalChildren?: ReactNode;
  handleTableChange?: (pagination: PaginationProps, filters: Record<string, FilterValue | null>, sorter: any) => void;
  rowClassName?: any,
}

export default function GenericTable({
  columns,
  dataSource,
  loading,
  pagination,
  totalChildren,
  handleTableChange,
  rowClassName
}: ListParameters) {
  const [data, setData] = useState<DataSource[]>(dataSource);
  const [tableParams, setTableParams] = useState<TableParams>({});

  useEffect(() => {
    setData(dataSource);

    if (pagination) {
      setTableParams({
        pagination
      })
    }

  }, [dataSource, pagination]);

  const handleTableChangeDefault = (
    pagination: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: any,
    extra: TableCurrentDataSource<DataSource>
  ) => {
    setTableParams({
      filters,
      ...sorter,
    });

    let data: DataSource[] = [];

    if (extra.action === "sort") {
      const isAscending = sorter.order === "ascend";
      const sorterKey = sorter.columnKey;

      data = extra.currentDataSource.sort((a, b) => {
        const propertyA = a[sorterKey];
        const propertyB = b[sorterKey];

        if (isAscending) {
          if (propertyA < propertyB) return -1;
          if (propertyA > propertyB) return 1;
          return 0;
        } else {
          if (propertyA > propertyB) return -1;
          if (propertyA < propertyB) return 1;
          return 0;
        }
      });
    }

    setData(data);
  };

  return (
    <>
      {totalChildren}
      <Table
        columns={columns}
        dataSource={data}
        pagination={tableParams.pagination || false}
        loading={loading}
        onChange={handleTableChange ?? handleTableChangeDefault}
        rowClassName={rowClassName ?? ''}
      />
    </>
  );
}
