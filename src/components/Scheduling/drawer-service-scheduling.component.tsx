import GenericDrawer from "../Commons/Drawer/generic-drawer.component";
import FormServiceSchedulingComponent from "./form-service-scheduling.component";
import SeePatientDrawer from "../Patient/see-patient-drawer.component";

interface propsDrawerServiceScheduling {
    title: string,
    open: boolean,
    save: () => void,
    close: () => void,
    refetchShedulingList: () => void
    isEdit: boolean
    editData?:any
    repeatEnable?:boolean
    cleanFilters: () => void
}

export default function DrawerServiceSchedulingComponent({ title, open, close, isEdit, editData, refetchShedulingList, repeatEnable, cleanFilters }: propsDrawerServiceScheduling) {
    const handleCloseDrawer = () => {
        close();
    }

    return (
        <GenericDrawer
            title={title}
            children={
                <>
                    <FormServiceSchedulingComponent close={handleCloseDrawer} isEdit={isEdit} editSerie={false} editData={editData} repeatEnable={repeatEnable} refetchSchedulingList={refetchShedulingList} cleanFilters={cleanFilters}/>
                </>
            }
            onClose={handleCloseDrawer}
            open={open}
        />
    )
}
