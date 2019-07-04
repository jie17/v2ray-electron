interface LogLine {
  id: number;
  line: string;
}

declare namespace NodeJS {
  interface Global {
    ROOT: string;
    store: LogLine[];
  }
}
