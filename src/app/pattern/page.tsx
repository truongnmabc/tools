"use client";
import React from "react";
import PatternComponent from "@/components/Pattern";
import { Layout } from "antd";

export default function PatternPage() {
  return (
    <Layout.Content style={{ padding: "24px" }}>
      <PatternComponent />
    </Layout.Content>
  );
}
