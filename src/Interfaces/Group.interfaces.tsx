export interface IGroup{
    key?: number,
    id: number,
    name: string,
    crew: {
        id: number,
        name: string
    }
}

export interface IGroupRequest{
    name: string,
    crew: {
        id: number,
    }
}