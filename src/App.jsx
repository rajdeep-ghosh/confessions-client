import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";
import { inject } from "@vercel/analytics";
import { getIP } from "./api/services/ip";
import { getFromLS, setToLS, setToSS } from "./utils/storage";
import { errorHandler } from "./utils/error";
import nanoid from "./lib/nanoid";
import PostProvider from "./context/postContext";
import AlertProvider from "./context/alertContext";
import Home from "./pages/home";
import New from "./pages/new";
import Post from "./pages/post";
import Search from "./pages/search";
import Custom404 from "./pages/404";
import ErrorFallback from "./components/ErrorFallback";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const location = useLocation();

  useEffect(() => {
    getIP().then((ip) => setToSS("ip", ip));

    if (getFromLS("uid", "val") === "") {
      setToLS("uid", nanoid());
    }
  }, []);

  useEffect(() => inject(), []);

  return (
    <ErrorBoundary
      key={location.pathname}
      FallbackComponent={ErrorFallback}
      onError={errorHandler}
    >
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <PostProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="new" element={<New />} />
              <Route path="posts/:id" element={<Post />} />
              <Route path="search" element={<Search />} />
              <Route path="*" element={<Custom404 />} />
            </Routes>
          </PostProvider>
        </AlertProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
