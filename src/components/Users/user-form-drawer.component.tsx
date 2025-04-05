import { Button, Col, Form, FormInstance, Input, Row, Select, Typography } from "antd";
import { useState } from "react";
import { useQuery } from "react-query";
import { getAllProfiles } from "../../services/user.service";
import { Profile } from "../../Interfaces/Users.interfaces";
import { REQUIRED_FIELD_LABEL, isWhitespace } from "../../services/utils";

const { Title } = Typography;

interface UserDrawerProps {
  isEdit?: boolean,
  form: FormInstance;
}

export default function UserFormDrawer({ isEdit = false, form }: UserDrawerProps) {
  const [editPassword, setEditPassword] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const { isLoading: isLoadingProfiles } = useQuery(['profiles'], getAllProfiles, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data?.data?.length > 0) {
        setProfiles(data.data);
      }
    }
  })

  const allowEditPassword = () => {
    setEditPassword(false);
  };

  function PasswordField() {
    return (<Form.Item
      label="Palavra chave"
      name="password"
      rules={[
        {
          required: true,
          message: REQUIRED_FIELD_LABEL,
        },
        {
          min: 6,
          message: "A palavra chave deve conter ao menos 6 carateres."
        }
      ]}
    >
      <Input.Password />
    </Form.Item>)
  }

  return (
    <>
      {isLoadingProfiles ? 'loading' :
        <>
          <Row>
            <Col>
              <Title style={{ marginTop: 0 }} level={5}>
                Informações do Utilizador
              </Title>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Form
              form={form}
              layout="vertical"
              style={{ width: "100%" }}
              autoComplete="off"
            >
              <Col span={24}>
                <Form.Item
                  label="Nome"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    },
                    {
                      validator(_, value) {
                        if (value && isWhitespace(value)) {
                          return Promise.reject('Insira um nome válido.');
                        }
                        return Promise.resolve();
                      },
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD_LABEL,
                    },
                    {
                      type: 'email',
                      message: 'O email deve conter um formato válido',
                    },
                  ]}
                >
                  <Input type="email" showCount maxLength={50}/>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  {
                    isEdit ?
                      <Col span={12}>
                        <PasswordField />
                      </Col> :
                      <Col span={12} style={{ alignItems: "flex-end", display: "grid" }}>
                        {editPassword ? (
                          <Form.Item>
                            <Button
                              onClick={allowEditPassword}
                              className="secundary-button"
                              block
                            >
                              Editar palavra-passe
                            </Button>
                          </Form.Item>
                        ) : (
                          <PasswordField />
                        )}
                      </Col>
                  }
                  <Col span={12}>
                    <Form.Item
                      label="Perfil"
                      name="profile"
                      rules={[
                        {
                          required: true,
                          message: REQUIRED_FIELD_LABEL,
                        },
                      ]}
                    >
                      <Select>
                        {profiles.map((profile) => (
                          <Select.Option key={profile.id} value={profile.id.toString()}>
                            {profile.description}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Form>
          </Row>
        </>
      }
    </>
  );
}
