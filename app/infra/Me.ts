interface Session{
    userId: string;
    type: string[];
    displayName: string;
}

export const Me = {
    session: {} as Session
}