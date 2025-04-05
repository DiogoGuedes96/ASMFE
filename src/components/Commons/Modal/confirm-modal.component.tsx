import { ExclamationCircleFilled } from "@ant-design/icons";
import { Modal } from "antd";
import { ReactNode } from "react";

interface PropsModal {
    title: string
    open: boolean
    okText: string
    content?: string | undefined
    cancelText: string
    icon?: ReactNode
    onOk?: () => void
    onCancel?: () => void
}

export default function ConfirmModal({
    title,
    open,
    okText,
    cancelText,
    content,
    icon = <ExclamationCircleFilled style={{ color: '#faad14', marginRight: 10, fontSize: 18 }} />,
    onOk,
    onCancel
}: PropsModal) {
    return (
        <Modal
            title={<>
                <p style={{ display: 'flex', alignItems: 'start' }}>
                    {icon}
                    <span style={{ marginTop: -5 }}>{title}</span>
                </p>
            </>}
            okText={okText} cancelText={cancelText}
            okButtonProps={{size: 'large'}}
            cancelButtonProps={{size: 'large'}}
            open={open} okType='primary'
            onOk={onOk} onCancel={onCancel}>
                {!!content && <p style={{ marginLeft: 31 }}>{content}</p>}
        </Modal>
    )
}