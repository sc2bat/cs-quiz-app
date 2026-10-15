import { apiClient } from './axiosClient';

type VersionResponse = {
  status: string;
  version: string;
};

export const systemApi = {
  async fetchVersion(): Promise<string> {
    const { data } = await apiClient.get<VersionResponse>('/api/system/version');
    return data.version;
  },
};
