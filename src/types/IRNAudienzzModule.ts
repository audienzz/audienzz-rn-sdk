export type TAudienzzInitStatus = {
  status: string;
  description: string;
};

export interface IRNAudienzzModule {
  initialize(): Promise<TAudienzzInitStatus>;
}
