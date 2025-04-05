import { CheckCircleFilled, CopyOutlined } from "@ant-design/icons";
import copy from 'clipboard-copy';
import React, { useMemo, useState } from 'react';
import { Button, Divider, Popover, Segmented } from 'antd';

export interface CopyProps {
    text: any
    message?: string
}

export default function CopyAction({text, message}: CopyProps) {

    const [showArrow, setShowArrow] = useState(true);
    const [arrowAtCenter, setArrowAtCenter] = useState(false);
    const [success, setSuccess] = useState(false);

    const mergedArrow = useMemo(() => {
      if (arrowAtCenter) return { pointAtCenter: true };
      return showArrow;
    }, [showArrow, arrowAtCenter]);
    const handleCopyName = (name: any) => {
        copy(name);
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
        }, 2500);
    }
    const content = (
        <div style={{ width: '100%' }}>
            {(!success) ? (
                <span className="copy" onClick={() => handleCopyName(text)}>
                    <CopyOutlined className="copy-icon popover-icon-copy"/> {text}
                </span>
            ) : (
                <span className="copy">
                    <CheckCircleFilled className="copy-icon popover-check-copy"/>
                    {
                        message ??
                        'O texto foi copiado'
                    }
                </span>
            )}
        </div>
    );
    return (
        <Popover placement="top" content={content} arrow={mergedArrow}>
            <span className="copy">
                {text}
            </span>
        </Popover>

    );
}
