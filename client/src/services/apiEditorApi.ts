import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiEditorApi = createApi({
    reducerPath: 'apiEditorApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
    endpoints: (builder) => ({
        getPackageDataByName: builder.query<string, string>({
            query: (packageName) => `packageData/${packageName}`,
        }),
    }),
});

export const { useGetPackageDataByNameQuery } = apiEditorApi;
