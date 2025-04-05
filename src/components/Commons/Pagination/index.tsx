import { Pagination } from "antd";

interface MetaPaginationInterface {
    current_page: number;
    total: number;
    per_page?: number;
}

interface PropsPaginationComponent {
    currentPage?: number;
    totalItens?: number;
    changePage: (page: number) => void
    meta?: MetaPaginationInterface
    changePerPage?: (perPage: number) => void
    perPage?: number;
    showSizePage?: boolean;
    paginationStyle?: string;
}

export default function PaginationComponent({
    changePage,
    changePerPage = (perPage) => { },
    showSizePage = true,
    paginationStyle = 'pagination_style_default',
    meta = { current_page: 1, total: 10, per_page: 10 }
}: PropsPaginationComponent) {

    const onChangePage = (page: number) => {
        if (page)
            changePage(page)
    }

    const onChangeSizePage = (current: number, size: number) => {
        if (size)
            changePerPage(size)
    }

    return (
        <Pagination
            className={paginationStyle}
            current={meta.current_page}
            total={meta.total}
            pageSize={meta.per_page}
            showSizeChanger={showSizePage}
            onShowSizeChange={onChangeSizePage}
            onChange={onChangePage}
        />
    )
}
