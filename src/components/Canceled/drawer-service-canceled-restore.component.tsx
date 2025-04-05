import GenericDrawer from "../Commons/Drawer/generic-drawer.component";
import FormServiceCanceledRestoreComponent from "./form-service-canceled-restore.component";
interface propsDrawerServiceScheduling {
    title: string,
    open: boolean,
    close: () => void,
    canceledSchedule: any,
    refetchServiceScheduling: () => void,
    sendAlert: (alert: any) => void
    cleanFilters: () => void
}

export default function DrawerServiceCanceledRestoreComponent({ title, open, close, canceledSchedule, refetchServiceScheduling, sendAlert, cleanFilters }: propsDrawerServiceScheduling) {
    const handleCloseDrawer = () => {
        close();
    }

    return (
        <GenericDrawer
            title={title}
            children={
                <>
                    <FormServiceCanceledRestoreComponent close={handleCloseDrawer} canceledSchedule={canceledSchedule}  refetchServiceScheduling={refetchServiceScheduling} sendAlert={sendAlert} cleanFilters={cleanFilters}/>
                </>
            }
            onClose={handleCloseDrawer}
            open={open}
        />
    )
}
