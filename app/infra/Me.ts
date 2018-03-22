interface User{
    id: string
}

interface Session{
    userId: string;
    type: string[];
    displayName: string;
    children: User[];
    login: string;
}

export const Me = {
    session: {} as Session
}