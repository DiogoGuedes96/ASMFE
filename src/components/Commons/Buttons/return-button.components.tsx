import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
interface returnProps {
    closeDrawer?: any
}
export default function ReturnButton({closeDrawer} : returnProps) {
    const confirmClose = (onClose: any) => {
        Modal.confirm({
          title: 'Tem a certeza que quer sair sem guardar as alterações?',
          content: 'Toda a informação não guardada será perdida.',
          icon: <ExclamationCircleOutlined />,
          okText: 'Sair',
          okType: 'primary',
          cancelText: 'Voltar',
          onOk() {
            closeDrawer();
          }
        });
      };
    return (
        <div style={{marginTop: 10}}>
            <Button size="large" style={{background: '#EDF2FF'}} block onClick={confirmClose}>
                Voltar
            </Button>
        </div>
    )
}
