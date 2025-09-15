export type TAudienzzInitStatus = {
  status: string;
  description: string;
};

export interface IRNAudienzzModule {
  initialize(companyID: string): Promise<TAudienzzInitStatus>;

  setSchainObject(schain: string): Promise<void>;
}
