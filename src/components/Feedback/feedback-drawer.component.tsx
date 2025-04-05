import { FormInstance } from "antd";
import GenericDrawer from "../Commons/Drawer/generic-drawer.component";
import FeedbackForm from "./feedback-form.component";

interface propsDrawerFeedBack {
  title: string,
  openFormFeedback: boolean,
  close: () => void,
  openEditFormFeedback: boolean,
  editData?: any,
  feedBackForm: FormInstance,
  onSubmitClearFilters: () => void,
  onCloseDrawerFeedback: () => void,
}

export default function DrawerFeedBackComponent({ title, openFormFeedback, close, openEditFormFeedback, editData, feedBackForm, onSubmitClearFilters, onCloseDrawerFeedback }: propsDrawerFeedBack) {
  return (
    <GenericDrawer
      title={title}
      children={
        <>
          <FeedbackForm
            form={feedBackForm}
            editData={editData}
            openEditFormFeedback={openEditFormFeedback}
            close={close}
            onSubmitClearFilters={onSubmitClearFilters}
            onCloseDrawerFeedback={onCloseDrawerFeedback}
          />
        </>
      }
      onClose={close}
      open={openFormFeedback || openEditFormFeedback}
    />
  )
}
