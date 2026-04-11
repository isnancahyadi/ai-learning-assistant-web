import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { Suspense } from "solid-js";
import "./assets/styles/index.css";

import { TIME_FIVE_MINUTE } from "./lib/constants/defined-time";

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: TIME_FIVE_MINUTE,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router
        root={(props) => (
          <>
            <MetaProvider>
              <Suspense fallback={<div class="p-4">Loading app...</div>}>{props.children}</Suspense>
            </MetaProvider>

            <SolidQueryDevtools initialIsOpen={false} />
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </QueryClientProvider>
  );
}
