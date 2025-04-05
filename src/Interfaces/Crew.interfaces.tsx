export interface ICrew {
    id?:number,
    name: string,
    email: string,
    phoneNumber: number,
    nif?: number,
    driverLicense?: string,
    address?: string,
    contractDate?: Date,
    contractNumber?: number,
    jobTitle?: string,
    status?: boolean
    group?: {
        id: number,
        name: string
    }
}
