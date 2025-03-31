"use client";
import React from "react";
import SitemapComponent from "@/components/Sitemap";
import { Layout } from "antd";

export default function SitemapPage() {
  return (
    <Layout.Content style={{ padding: "24px" }}>
      <SitemapComponent />
    </Layout.Content>
  );
}
