export interface Platform {
    key: string,
    name: string,
    url: string,
    urlAuth: string,
    color: string,
    options: Array<{ label: string, value: string }>,
    estimatedVolume: number,
    lastFetched: {
        date: Date,
        channels: Array<
            {
                name: string,
                qty: number,
            }
        >,
    },
    type: string,
    account: {
        id: string,
        name: string,
        connected: boolean,
    },
    cat: string,
}