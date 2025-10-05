import React from "react";
import { Outlet } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Layout from "./Layout";
import LandingPage from "../pages/LandingPage";

function Root() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Layout>
          <Outlet />
        </Layout>
      </SignedIn>
    </>
  );
}

export default Root;
