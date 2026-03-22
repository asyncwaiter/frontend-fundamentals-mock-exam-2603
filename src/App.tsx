import normalize from 'emotion-normalize';
import { css, Global } from '@emotion/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { GlobalPortal } from './GlobalPortal';
import { OverlayProvider } from '_tosslib/overlay';
import { MessageProvider, getGlobalShowMessage } from 'hooks/useMessage';

import '_tosslib/sass/app.scss';
import { PageLayout } from 'pages/PageLayout';
import { Routes } from 'pages/Routes';

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: () => {
            getGlobalShowMessage()?.({ type: 'error', text: '데이터를 불러오는 데 실패했습니다.' });
          },
        }),
        mutationCache: new MutationCache({
          onError: () => {
            getGlobalShowMessage()?.({ type: 'error', text: '요청 처리에 실패했습니다.' });
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalPortal.Provider>
        <MessageProvider>
          <OverlayProvider>
          <Global
            styles={css`
              ${normalize}
              h1, h2, h3, h4, h5, h6 {
                font-size: 1em;
                font-weight: normal;
                margin: 0;
              }
            `}
          />
          <PageLayout>
            <Routes />
          </PageLayout>
          </OverlayProvider>
        </MessageProvider>
      </GlobalPortal.Provider>
    </QueryClientProvider>
  );
}
