import { Col, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export default function CardLoading() {

    return (

        <Col>
            <div className='card-container'>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                </div>
            </div>
        </Col>
    )
}
