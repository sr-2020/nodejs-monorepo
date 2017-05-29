export type Callback = (data: any) => void

export type Model = {
    [key: string]: Callback
}
