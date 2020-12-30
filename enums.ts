export enum LobbyInfoState {
    TeamSelect,
    CommanderSelect,
    GameStarting,
    InGame,
    GameEnded,
    GameCanceled
}

export enum CommanderSelectStatus {
    Unselected,
    Selected,
    Locked
}

export enum ProcessState {
    StartingProcess,
    RunningProcess,
    EndedProcess,
    FailedProcess
}

export enum JobState {
    allocating,
    allocated
}
