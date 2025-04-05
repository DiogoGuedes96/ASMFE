import React from 'react';
import { Col, Row } from 'antd';

import Left from "../../components/Login/left";
import Right from "../../components/Login/right";

export default function Login() {
    return (
        <Row align='middle'>
            <Col id='login-left' span={24} lg={{span: 14}}>
                <Left />
            </Col>
            <Col id='login-right' span={0} lg={{span: 10}}>
                <Right />
            </Col>
        </Row>
    );
}
