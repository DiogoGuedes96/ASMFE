import { Drawer } from "antd";
import { ReactNode } from "react";

import { Modal, Typography } from "antd";
import { CloseOutlined, ExclamationCircleOutlined } from "@ant-design/icons"

const { Title } = Typography;

export interface GenericDrawerProps {
    children: ReactNode;
    title: string;
    onClose?: () => void;
    open?: boolean;
    closeIfClickOutside?: boolean;
    showIconClose?: boolean;
    size?: "default" | "large";
    footer?: ReactNode;
    footerStyle?: React.CSSProperties;
}

const confirmClose = (onClose:any) => {
  Modal.confirm({
    title: 'Tem a certeza que quer sair sem guardar as alterações?',
    content: 'Toda a informação não guardada será perdida.',
    icon: <ExclamationCircleOutlined />,
    okText: 'Sair',
    okType: 'primary',
    cancelText: 'Voltar',
    onOk() {
      onClose()
    }
  });
};

export default function GenericDrawer({
  children,
  title,
  onClose,
  open = false,
  showIconClose = false,
  closeIfClickOutside = true,
  size = "large",
  footer,
  footerStyle
}: GenericDrawerProps) {
  return (
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4}>{title}</Title>
            <CloseOutlined onClick={() => confirmClose(onClose)} style={{ cursor: 'pointer' }} />
          </div>
        }
        placement="right"
        closable={showIconClose}
        destroyOnClose={true}
        maskClosable={closeIfClickOutside}
        onClose={() => confirmClose(onClose)}
        open={open}
        size={size}
        footer={footer}
        footerStyle={footerStyle}
      >
        {children}
      </Drawer>
  );
}
