import { Col, Divider, Row } from "antd";
import { ICrew } from "../../Interfaces/Crew.interfaces";
interface PropsDetails {
    groupDetails: any
}
export default function GroupDetailsDrawer({groupDetails}:PropsDetails) {
    console.info(groupDetails);
    return (<>
        <Row style={{ paddingTop: '5px', paddingBottom: '5px' }}>
          <Col span='12'>
            <strong>Nome</strong>
            <p>{groupDetails.name}</p>
          </Col>
          <Col span='12'>
            <strong>Tripulantes</strong>
            {groupDetails.crew?.map((item: ICrew) => (
              <p key={item.id}>{item.name}</p>
            ))}
          </Col>
        </Row>
      </>)
}
