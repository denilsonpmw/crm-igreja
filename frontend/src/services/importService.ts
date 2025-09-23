import api from './api';

export interface ImportResult {
  createdCount: number;
  created: Array<any>;
  skippedCount: number;
  skipped: Array<any>;
  errorsCount?: number;
  errors?: Array<any>;
}

export const uploadMembersCsv = async (file: File, onUploadProgress?: (percent: number) => void) => {
  const form = new FormData();
  form.append('file', file);

  const resp = await api.post<ImportResult>('/import/members', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percent);
      }
    },
  });

  return resp.data;
};

export default {
  uploadMembersCsv,
};
