import { Col, Divider, Row } from "antd";
import { ICrew } from "../../Interfaces/Crew.interfaces";
import dayjs from "dayjs";
interface PropsDetails {
    crewDetails: any
}
export default function CrewDetailsDrawer({crewDetails}:PropsDetails) {
  const dateFormat = "YYYY/MM/DD";
    return (<>
        <Row style={{ paddingTop: '5px', paddingBottom: '5px' }}>
          <Col span='12'>
            <strong>Nome</strong>
            <p>{crewDetails.name}</p>
          </Col>
          <Col span='12'>
            <strong>Email</strong>
            <p>{crewDetails.email}</p>
          </Col>
        </Row>
        <Row style={{ paddingTop: '5px', paddingBottom: '5px' }}>
          <Col span='12'>
            <strong>Telemóvel</strong>
            <p>{crewDetails.phoneNumber}</p>
          </Col>
          <Col span='12'>
            <strong>NIF</strong>
            <p>{crewDetails.nif}</p>
          </Col>
        </Row>
        <Row style={{ paddingTop: '5px', paddingBottom: '5px' }}>
          <Col span='24'>
            <strong>Carta de condução</strong>
            <p>{crewDetails.driverLicense}</p>
          </Col>
        </Row>
        <Row style={{ paddingTop: '5px', paddingBottom: '5px' }}>
          <Col span='24'>
            <strong>Morada</strong>
            <p>{crewDetails.address}</p>
          </Col>
        </Row>
        <Divider />
        <Row style={{ paddingTop: '5px', paddingBottom: '5px' }}>
          <Col span='12'>
            <strong>Data da contratação</strong>
            <p>{crewDetails.contractDate ? dayjs(crewDetails.contractDate, dateFormat).format('DD/MM/YYYY') : ''}</p>
          </Col>
          <Col span='12'>
            <strong>Número de contrato</strong>
            <p>{crewDetails.contractNumber}</p>
          </Col>
        </Row>
        <Row style={{ paddingTop: '5px', paddingBottom: '5px' }}>
          <Col span='12'>
            <strong>Cargo</strong>
            <p>{crewDetails.jobTitle}</p>
          </Col>
          <Col span='12'>
            <strong>Status</strong>
            <p>{crewDetails.status ? 'Ativo' : 'Inativo'}</p>
          </Col>
        </Row>
      </>)
}
