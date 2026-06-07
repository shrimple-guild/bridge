type StatusResponse = {
    success: boolean,
    uuid: string,
    session: {
        online: boolean,
        gameType: string,
        mode: string,
        map: string
    }
}