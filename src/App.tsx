import normalize from 'emotion-normalize';
import { css, Global } from '@emotion/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalPortal } from './GlobalPortal';
import { OverlayProvider } from '_tosslib/overlay';
import { MessageProvider } from 'hooks/useMessage';

import '_tosslib/sass/app.scss';
import { PageLayout } from 'pages/PageLayout';
import { Routes } from 'pages/Routes';

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
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
        <OverlayProvider>
          <MessageProvider>
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
          </MessageProvider>
        </OverlayProvider>
      </GlobalPortal.Provider>
    </QueryClientProvider>
  );
}
