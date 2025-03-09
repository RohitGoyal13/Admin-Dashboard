import {
  AuthBindings,
  Authenticated,
  GitHubBanner,
  Refine,
  WelcomePage,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { useAuth0 } from "@auth0/auth0-react";
import { authProvider } from "./providers"; 
import { dataProvider } from "./providers"
import { liveProvider } from "./providers"
import {Home,Login}from "./pages";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import Layout from "./components/layout";
import axios from "axios";
import { createClient } from "graphql-ws";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";



function App() {
  const { isLoading, user, logout, getIdTokenClaims } = useAuth0();

  if (isLoading) {
    return <span>loading...</span>;
  }

  const authProvider: AuthBindings = {
    login: async () => {
      return {
        success: true,
      };
    },
    logout: async () => {
      logout({ returnTo: window.location.origin });
      return {
        success: true,
      };
    },
    onError: async (error) => {
      console.error(error);
      return { error };
    },
    check: async () => {
      try {
        const token = await getIdTokenClaims();
        if (token) {
          axios.defaults.headers.common = {
            Authorization: `Bearer ${token.__raw}`,
          };
          return {
            authenticated: true,
          };
        } else {
          return {
            authenticated: false,
            error: {
              message: "Check failed",
              name: "Token not found",
            },
            redirectTo: "/login",
            logout: true,
          };
        }
      } catch (error: any) {
        return {
          authenticated: false,
          error: new Error(error),
          redirectTo: "/login",
          logout: true,
        };
      }
    },
    getPermissions: async () => null,
    getIdentity: async () => {
      if (user) {
        return {
          ...user,
          avatar: user.picture,
        };
      }
      return null;
    },
  };

  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                 dataProvider={dataProvider}
                 liveProvider={liveProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                authProvider={authProvider}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "HEujo9-19l3Lx-ZzmKkQ",
                  liveMode: "auto",
                }}
              >
                <Routes>
                  
                  <Route path="/login" element={<Login />} />
                  <Route element={
                    <Authenticated
                    key = "authenticated-layout"
                    fallback = {<CatchAllNavigate to= "/login"/>}>
                      <Layout>
                        <Outlet />
                      </Layout>
                      </Authenticated> }>
                    <Route index element={<Home />} />
                      </Route>
                </Routes>
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
