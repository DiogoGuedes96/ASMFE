import { Typography } from "antd";
import { ReactNode } from "react";

const { Text } = Typography;

interface PropsShowDataLength {
    size: number,
    className?: string,
    children?: ReactNode
}

export default function ShowDataLength({ size, className, children }: PropsShowDataLength) {
    return (
        <Text className={className} strong>Resultados: {size}</Text>
    )
}