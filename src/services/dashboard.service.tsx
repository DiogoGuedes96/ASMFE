import { get } from "./api.service";

const getKpis = ({ entity, period }: any) => {
    return get(`/dashboard/v2/${entity}/kpis?period=${period}`);
}

const getTotalUsers = () => {
    return get(`/users/v2/total`)
}

const getTotalPatients = () => {
    return get(`/patients/v1/total`)
}

const getTotalScheduling = () => {
    return get(`/servicescheduling/v1/total`)
}

export {
    getKpis,
    getTotalUsers,
    getTotalPatients,
    getTotalScheduling
}
