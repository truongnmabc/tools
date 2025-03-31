"use client";
import {
  AppstoreOutlined,
  BugOutlined,
  FontSizeOutlined,
  StarOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const { Header, Content, Sider } = Layout;

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const items: MenuProps["items"] = [
    {
      key: "sitemap",
      icon: <StarOutlined />,
      label: "Sitemap",
      children: [
        {
          key: "sitemap?type=post",
          label: "Post Sitemap",
        },
        {
          key: "sitemap?type=page",
          label: "Page Test",
        },
        {
          key: "sitemap?type=category",
          label: "Category Sitemap",
        },
        {
          key: "sitemap?type=question",
          label: "Question Sitemap",
        },
        {
          key: "sitemap?type=author",
          label: "Author Sitemap",
        },
        {
          key: "sitemap?type=test",
          label: "Test Sitemap",
        },
      ],
    },
    {
      key: "test",
      icon: <BugOutlined />,
      label: "Test",
    },
    {
      key: "icon",
      icon: <FontSizeOutlined />,
      label: "Icon",
    },
    {
      key: "pattern",
      icon: <AppstoreOutlined />,
      label: "Pattern",
    },
  ];

  // Hàm lấy selected key dựa trên pathname và query params
  const getSelectedKey = () => {
    const type = searchParams.get("type");
    if (pathname === "/sitemap" && type) {
      return `sitemap?type=${type}`;
    }
    return pathname.slice(1);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(`/${key}`);
  };

  return (
    <Layout className="w-full min-h-screen flex-1 h-full">
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="text-white text-xl font-bold">MtUi Tools</div>
      </Header>
      <div style={{ padding: "24px 48px" }} className="flex flex-1">
        <Layout
          style={{
            padding: "24px 0",
          }}
        >
          <Sider width={200}>
            <Menu
              mode="inline"
              selectedKeys={[getSelectedKey()]}
              style={{ height: "100%" }}
              items={items}
              onSelect={handleMenuClick}
            />
          </Sider>
          <Content style={{ padding: "0 24px", minHeight: 280 }}>
            {children}
          </Content>
        </Layout>
      </div>
    </Layout>
  );
};

export default App;
