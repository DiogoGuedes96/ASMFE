import { Collapse, CollapseProps, Button, Empty } from "antd";
import { useState, useEffect } from "react";
import DetailsPatientBasicList from "./details-basic-list.component";
import { useMutation } from "react-query";
import { getPatientDetails, patientFutureScheduling, patientShcedulingHistory } from "../../services/patient.service";
import ScheduleHistoryListComponent from "./schedule-history-list-component";
import FutureScheduleListComponent from "./future-schedule-list-component";

interface SeePatientDrawerProps {
  data?: any;
  displaySections?: Array<string> | null;
}

export default function SeePatientDrawer({ data, displaySections }: SeePatientDrawerProps) {
  const [items, setItems] = useState<CollapseProps['items']>([]);
  const [patient, setPatient] = useState<any | undefined>(undefined);
  const [patientScheduleHistory, setPatientScheduleHistory] = useState<any>([]);
  const [patientFutureSchedules, setPatientFutureSchedules] = useState<any>([]);
  const defaultProps: SeePatientDrawerProps = {
    data: data ? data : {},
    displaySections: displaySections ? displaySections : ['details', 'history', 'future']
  };

  const { mutate: mutateGetPatientScheduleHistory } = useMutation(patientShcedulingHistory, {
    onSuccess: (data) => {
      setPatientScheduleHistory(data?.data);
    },
  })

  const { mutate: mutateGetPatientFutureSchedules } = useMutation(patientFutureScheduling, {
    onSuccess: (data) => {
      setPatientFutureSchedules(data?.data);
    },
  })

  const { mutate: mutateGetPatientDetails } = useMutation(getPatientDetails, {
    onSuccess: (data: any) => {
      setPatient(data?.data)
    },
    onError: () => {

    }
  })

  const compliment = () => (
    <Button type="link"
      onClick={(event) => {
        event.stopPropagation();

        alert('Evento Elogio');
      }}
    >Elogio / Reclamação</Button>
  );

  const reschedule = () => (
    <>
      <Button type="link"
        onClick={(event) => {
          event.stopPropagation();

          alert('Evento Cancelar');
        }}
      >Cancelar</Button>
      <Button type="link"
        onClick={(event) => {
          event.stopPropagation();

          alert('Evento Reagendar');
        }}
      >Reagendar</Button>
    </>
  );


  const handleSections = () => {
    if (defaultProps.displaySections?.includes('history')) {
      mutateGetPatientScheduleHistory(data.id);
    }

    if (defaultProps.displaySections?.includes('future')) {
      mutateGetPatientFutureSchedules(data.id)
    }
  }

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      mutateGetPatientDetails(data?.id)
      handleSections();
    }
  }, [data])

  useEffect(() => {
    const itemsAux: CollapseProps['items'] = [
      (patient && Object.keys(patient).length > 0 && defaultProps.displaySections?.includes('details')) && {
        key: '1',
        label: 'Informações do Utente',
        children: <DetailsPatientBasicList data={patient} showCredits={true} />,
      },
      (defaultProps.displaySections?.includes('history')) && {
        key: '2',
        label: 'Histórico do Utente',
        children: (patientScheduleHistory && Object.keys(patientScheduleHistory).length > 0) ? <ScheduleHistoryListComponent data={patientScheduleHistory} compliment={compliment} /> : <Empty description="Sem agendamentos passados" />,
      },
      (defaultProps.displaySections?.includes('future')) && {
        key: '3',
        label: 'Agendamentos Futuros',
        children: (patientFutureSchedules && Object.keys(patientFutureSchedules).length > 0) ? <FutureScheduleListComponent data={patientFutureSchedules} reschedule={reschedule} /> : <Empty description="Sem agendamentos futuros" />,
      }
    ].filter(Boolean);

    setItems(itemsAux);
  }, [data, patientScheduleHistory, patientFutureSchedules])

  return (
    <>
      <Collapse className="collapse-box" items={items} defaultActiveKey={['1']} />
    </>
  );
}
