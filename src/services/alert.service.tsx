import { Subject } from 'rxjs';
const subject = new Subject();

interface Alert {
    text: string,
    type?: "success" | "info" | "warning" | "error",
}

export const AlertService = {
    sendAlert: (message: Alert[]) => {
        message = message.map((item: Alert) => {
            if(!item?.type) {
                item.type = "success";
            }
            return item
        })
        subject.next(message);
    },
    clearAlert: () => subject.next([]),
    getAlert: () => subject.asObservable()
};
