import { Button, Card, Typography } from "antd";
import { useNavigate } from "react-router";

const { Text } = Typography;

export default function PageNotFound() {
    const navigate = useNavigate();

    return (
        <div className="content_page">
            <Card title="Página não encontrada!" headStyle={{
                color: '#107B99',
                fontWeight: 600
            }}>
                <p>Não foi possível encontrar a página solicitada.</p>
                <p>Clique em qualquer menu, para ser direcionado para a página correta.</p>
            </Card>
        </div>
    )
}
