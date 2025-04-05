import { AutoComplete, Form, FormInstance } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { SizeType } from "antd/lib/config-provider/SizeContext";

interface PropsAutoComplemteComponent {
    name: string,
    size: SizeType,
    label?: string,
    form: FormInstance,
    onAutoComplete: (value: string) => void,
    options: DefaultOptionType[],
    onSelect: (value: any) => void
    bordered?: boolean
    rules?: any
    disabled?: boolean
}

export default function AutoCompleteCustom({
    onAutoComplete,
    size,
    form,
    name,
    label,
    options,
    onSelect,
    bordered,
    rules,
    disabled,
}: PropsAutoComplemteComponent) {
    const handleSearch = async (value: string) => {
        const timeout = setTimeout(() => {
            if (value !== form.getFieldValue(name)) {
                clearTimeout(timeout);
            } else {
                onAutoComplete(value);
            }
        }, 1000);
    }

    return (
        <Form.Item
            label={label}
            name={name}
            rules={rules}
        >
            <AutoComplete
                size={size}
                onSearch={handleSearch}
                options={options}
                onSelect={onSelect}
                bordered={bordered}
                disabled={disabled}
            />
        </Form.Item>
    )
}
