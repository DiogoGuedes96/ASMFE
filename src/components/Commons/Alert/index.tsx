import { Alert } from "antd";
import { useState } from "react";
import { AlertService } from "../../../services/alert.service";


interface Alert {
    text: string,
    type?: "success" | "info" | "warning" | "error",
}

interface DisplayProps {
    show?: string[]
    style?: React.CSSProperties | undefined

}

export default function DisplayAlert({ show, style }: DisplayProps) {
    const [messages, setMessages] = useState<Alert[]>([]);

    AlertService.getAlert().subscribe((message) => {
        setMessages(message as Alert[]);
    });

    const onCloseAlert = () => {
        setMessages([])
        AlertService.clearAlert();
    }

    return (
        <>
            {messages.map((message: Alert, index: number) => {
                const showAlert = !show || show.find(val => val === message?.type);
                return (
                    showAlert && (
                        <Alert
                            style={style}
                            key={index}
                            message={message.text}
                            type={message?.type}
                            className="alertMessage"
                            showIcon
                            closable
                            onClose={onCloseAlert}
                        />
                    )
                );
            })}
        </>
    )
}
