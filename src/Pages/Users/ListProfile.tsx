import { Button, Card, Space, Tooltip } from "antd";
import { useState, useEffect } from 'react';
import { ArrowLeftOutlined, CloseCircleFilled, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from "react-query";
import { getAll, remove } from "../../services/profiles.service";
import { AlertService } from "../../services/alert.service";
import DisplayAlert from "../../components/Commons/Alert";
import GenericTable from "../../components/Commons/Table/generic-table.component";
import ConfirmModal from "../../components/Commons/Modal/confirm-modal.component";

export default function ProfilePage(props: any) {
    const [removeProfileId, setRemoveProfileId] = useState<number | undefined>(undefined);
    const [warnRemoveProfileId, setWarnRemoveProfileId] = useState<boolean>(false);

    const navigate = useNavigate();

    const toPage = (page: string, profile_id: number = 0) => {
        let pages = {
            create: '/manager/user/profile/create',
            edit: `/manager/user/profile/${profile_id}/edit`,
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const goToUsers = () => {
        navigate('/manager/user');
    }

    const removeProfile = (record: any) => {
        if (record.total_users > 0) {
            setWarnRemoveProfileId(true)
        } else {
            setRemoveProfileId(record.id)
        }
    }

    const columns = [
        { title: "Perfil", dataIndex: "description", sorter: false, key: "description" },
        { title: "Utilizadores atribuídos", dataIndex: "total_users", sorter: false, key: "total_users" },
        {
            title: "Ações",
            key: "action",
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button type="default" shape="circle" size="middle"
                            icon={<EditOutlined />}
                            onClick={() => toPage('edit', record.id)}
                        />
                    </Tooltip>

                    {!record.readonly &&
                        <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle"
                            icon={<DeleteOutlined />}
                            onClick={() => removeProfile(record)}/>
                        </Tooltip>
                    }
                </Space>
            ),
            width: 100,
        },
    ];

    const [profileList, setProfileList] = useState<{ id: number, name: string }[]>([]);

    const { data: dataProfileList, refetch: RefetchProfileList, isLoading: profileLoading } = useQuery(
        ['profileList'],
        () => getAll(),
        { refetchOnWindowFocus: false }
    );

    const { mutate: RemoveProfileMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: 'Perfil apagado com sucesso.' }
                ]);
                setRemoveProfileId(undefined);
                RefetchProfileList();
            }
        }
    );

    useEffect(() => {
        if (dataProfileList) {
            setProfileList(dataProfileList.data.map((profile: any) => {
                return {
                    key: profile.id,
                    ...profile
                }
            }));
        }
    }, [dataProfileList])

    return (
        <div className="content_page">
            <DisplayAlert />
            <div style={{ marginBottom: "16px" }}>
                <a onClick={() => goToUsers()}><ArrowLeftOutlined style={{ marginRight: 6 }}/>Volta a lista de utilizadores</a>
            </div>
            <Card
                bodyStyle={{ padding: 8 }}
                title="Lista de perfis"
                extra={<Button type="primary" size="large" onClick={() => toPage('create')}>Criar novo</Button>}
                headStyle={{
                    paddingTop: 20,
                    paddingBottom: 20,
                    color: '#107B99',
                    fontWeight: 600
                }}
            >
                <div className="profile_table">
                    <GenericTable
                        columns={columns}
                        dataSource={profileList}
                        loading={profileLoading}
                    />

                    <ConfirmModal
                        open={!!removeProfileId}
                        title="Tem a certeza que deseja apagar o perfil?"
                        content="Nenhum utilizador será afetado."
                        okText="Apagar" cancelText="Voltar"
                        onOk={() => RemoveProfileMutate(removeProfileId)}
                        onCancel={() => setRemoveProfileId(undefined)}
                    ></ConfirmModal>

                    <ConfirmModal
                        open={!!warnRemoveProfileId}
                        title="Não é possível apagar este perfil pois existem utilizadores associados à ele."
                        content="Antes de continuar, aceda à secção de gestão de utilizadores para editar as associações."
                        okText="Editar associações" cancelText="Voltar"
                        icon={<CloseCircleFilled style={{ color: '#f5222d', marginRight: 10, fontSize: 18 }} />}
                        onOk={() => {
                            setWarnRemoveProfileId(false);
                            navigate('/management/users');
                        }}
                        onCancel={() => setWarnRemoveProfileId(false)}
                    ></ConfirmModal>
                </div>
            </Card>
        </div>
    )
}
