import { Col, Result } from 'antd';


export default function CardError({ title, status }: any) {
    return (
        <Col>
            <div className='card-container'>
                <Result
                    status={status}
                    title={title}
                />
            </div>
        </Col>
    )
}
