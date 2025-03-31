"use client";
import React from "react";
import TestComponent from "@/components/Test";
import { Layout } from "antd";

export default function TestPage() {
  return (
    <Layout.Content style={{ padding: "24px" }}>
      <TestComponent />
    </Layout.Content>
  );
}
