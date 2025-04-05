import { RcFile } from "antd/lib/upload";
import { format } from "date-fns";

export const Convert = {
    dynamicField: (values: any, indexKey: string, dynamicField: string) => {
        const dataArray = [];
        const finalData: any = {};

        for (const key in values) {
            if (key.startsWith('dynamic_'+dynamicField+'_')) {
                const number = key.match(/\d+/);
                const name = values[key]
                if (number) {
                   let id = parseInt(number[0]);
                    dataArray.push({id, name});
                }else{
                    dataArray.push({name});
                }

            } else if (!key.startsWith('dynamic_')) {
                finalData[key] = values[key];
            }
        }

        finalData[indexKey] = dataArray;

        return finalData;
    },
    date: (e: any) => {return e.$y + '-' + (e.$M + 1) + '-' + e.$D},
    time: (e: any) => {
        let hour = e.$H;
        let minute = e.$m;

        if (hour < 10) {
            hour = '0' + hour;
        }

        if (minute < 10) {
            minute = '0' + minute;
        }
        return hour + ':' + minute;
    },
    //para a data que vem da api para o formato portugues
    portugueseFormatDate: (e: any) => {return format(new Date(e), 'dd/MM/yyyy');},
    timeWithouSeconds: (e:any) => {return e.slice(0, 5);},
    toBase64: async (file: any) => {
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj as RcFile);
          reader.onload = () => resolve(reader.result as string);
        });
    },
};
