

// allow parsing strings as int
declare function parseInt(data:any, radix?:number);

declare interface Blob{
    name: string;
}

declare interface Object{
    toJSON(): string | {}
}