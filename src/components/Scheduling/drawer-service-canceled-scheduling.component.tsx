import GenericDrawer from "../Commons/Drawer/generic-drawer.component";
import FormCanceledSchedulingComponent from "./form-canceled-scheduling.component";

interface propsDrawerServiceSchedulingCanceled {
    title: string,
    open: boolean,
    patientId?: number
    close: () => void,
    refetchShedulingList: () => void
    cleanFilters: () => void
}

export default function DrawerServiceSchedulingCanceledComponent({ title, open, close, patientId, refetchShedulingList, cleanFilters}: propsDrawerServiceSchedulingCanceled) {
    const handleCloseDrawer = () => {
        close();
    }
    return (
        <GenericDrawer
            title={title}
            children={
                <>
                    <FormCanceledSchedulingComponent close={handleCloseDrawer} id={patientId} refetchSchedulingList={refetchShedulingList} cleanFilters={cleanFilters}/>
                </>
            }
            onClose={handleCloseDrawer}
            open={open}
        />
    )
}
