export type AudienzzInitStatus = {
  status: string;
  description: string;
};

export interface RNAudienzzModule {
  initialize(companyId: string, enablePpid: boolean): Promise<AudienzzInitStatus>;

  isAutomaticPpidEnabled(): Promise<boolean>;
  setAutomaticPpidEnabled(enablePpid: boolean): Promise<void>;
  getPpid(): Promise<string | null>;

  setSchainObject(schain: string): Promise<void>;

  configureRemote(remoteUrl: string, publisherId: string): Promise<void>;
  fetchPublisherConfig(publisherId: string, enablePpid: boolean): Promise<void>;

  /**
   * Initialize SDK with remote configuration
   * This method combines initialize(), configureRemote(), and fetchPublisherConfig()
   * @param remoteUrl - The remote configuration API URL
   * @param publisherId - The publisher ID
   * @param enablePpid - Whether to enable automatic PPID (default: false)
   */
  initializeRemote(remoteUrl: string, publisherId: string, enablePpid?: boolean): Promise<AudienzzInitStatus>;
}
