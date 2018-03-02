interface User{
    id: string
}

interface Session{
    userId: string;
    type: string[];
    displayName: string;
    children: User[];
}

export const Me = {
    session: {} as Session
}