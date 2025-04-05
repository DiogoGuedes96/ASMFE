import { UploadOutlined } from "@ant-design/icons";
import { Button, Upload, Typography, UploadFile, Space, UploadProps } from "antd";
import { Convert } from "../../../services/convert.service";
import { useState, useEffect } from "react";
import { ButtonType } from "antd/lib/button";

interface uploadProps {
    getNewFiles: (file: any, id?:any) => void;
    type?: string
    text?: string
    hideDetails?:boolean
    icon?:any
    id?: any
    uploadFileList?:any

}

const { Text } = Typography;

export default function UploadComponent({ uploadFileList, getNewFiles, type, text, hideDetails, icon, id } : uploadProps) {
    const [fileList, setFileList] = useState<UploadFile[] | any>([]);

    useEffect(() => {
        if (uploadFileList && uploadFileList.length > 0) {
          setFileList(uploadFileList);
        }
      }, [uploadFileList]);

    const onChange: UploadProps["onChange"] = async ({ fileList: newFileList }) => {
        const objectFiles = await Promise.all(
            newFileList.map(async (file) => {
                if(file?.url){
                    return file
                }

                return {
                    ...file,
                    base64: await Convert.toBase64(file),
                }
            })
        );

        getNewFiles(objectFiles);
        setFileList(objectFiles);
    };

    return (
        <Upload fileList={fileList} onChange={onChange}  beforeUpload={() => false} maxCount={2}>
            <Space style={{ margin: '8px 0px 8px 0px' }}>
                <Button size="large" type={type as ButtonType ?? "default"} icon={icon ?? <UploadOutlined />}>{text ?? "Upload"}</Button>
                {
                    hideDetails ?? (
                        <Text type="secondary">PDF, JPG ou JPEG de até 4mb</Text>
                    )
                }
            </Space>
        </Upload>
    )
}
