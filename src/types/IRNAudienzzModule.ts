export type TAudienzzInitStatus = {
  status: string;
  description: string;
};

export interface IRNAudienzzModule {
  initialize(companyID: string, enablePpid: Boolean): Promise<TAudienzzInitStatus>;

  isAutomaticPpidEnabled(): Promise<Boolean>;
  setAutomaticPpidEnabled(enablePpid: Boolean): Promise<void>;
  getPpid(): Promise<string | null>;

  setSchainObject(schain: string): Promise<void>;
}
