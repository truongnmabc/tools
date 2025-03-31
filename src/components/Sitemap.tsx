"use client";

import React, { useEffect, useState } from "react";
import { Button, Table, Tag, Spin, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "next/navigation";
import { DownloadOutlined } from "@ant-design/icons";

interface UrlItem {
  key: number;
  url: string;
  status?: number;
  checkUrl?: string;
  devStatus?: number;
}

const Sitemap: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<UrlItem[]>([]);
  const [pageSize, setPageSize] = useState<number>(20);
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "post";

  const crawlSitemap = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sitemap/crawl?type=${type}`);
      const data = await response.json();

      if (data.success) {
        message.success(data.message);
        const formatted = data.urls.map((url: string, index: number) => ({
          key: index + 1,
          url,
          status: -1,
        }));
        setDataSource(formatted);
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi crawl sitemap");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckUrls = async () => {
    const BATCH_SIZE = 50;
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    try {
      setLoading(true);
      message.loading("Đang kiểm tra URLs...");

      const results: { url: string; status: number }[] = [];

      for (let i = 0; i < dataSource.length; i += BATCH_SIZE) {
        const batch = dataSource.slice(i, i + BATCH_SIZE);
        const urls = batch.map((item) => item.url);

        const response = await fetch("/api/sitemap/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls }),
        });

        const data = await response.json();
        if (data.success) {
          results.push(...data.results);
        } else {
          message.error(`Batch ${i / BATCH_SIZE + 1} lỗi: ${data.message}`);
        }

        await delay(200);
      }

      const updated = dataSource.map((item) => {
        const result = results.find((r) => r.url === item.url);
        const status = result?.status ?? -1;
        const devUrl =
          status === 404
            ? item.url.replace(
                "https://asvab-prep.com",
                "https://asvab.cd.worksheetzone.org"
              )
            : undefined;

        return { ...item, status, checkUrl: devUrl };
      });

      setDataSource(updated);

      const statsMap: Record<number, number> = {};
      for (const r of results) {
        statsMap[r.status] = (statsMap[r.status] || 0) + 1;
      }

      const stats = Object.entries(statsMap)
        .map(([status, count]) => `${status}: ${count}`)
        .join(", ");
      message.success(`Đã kiểm tra xong! (${stats})`);
    } catch (error) {
      message.error("Có lỗi xảy ra khi kiểm tra URLs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDevUrls = async () => {
    const BATCH_SIZE = 50;
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    try {
      setLoading(true);
      message.loading("Đang kiểm tra Dev URLs...");

      const toCheck = dataSource.filter(
        (item) => (item.status === 404 || item.status === 500) && item.checkUrl
      );
      const results: { url: string; status: number }[] = [];

      for (let i = 0; i < toCheck.length; i += BATCH_SIZE) {
        const batch = toCheck.slice(i, i + BATCH_SIZE);
        const urls = batch.map((item) => item.checkUrl!);

        const response = await fetch("/api/sitemap/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls }),
        });

        const data = await response.json();
        if (data.success) {
          results.push(...data.results);
        } else {
          message.error(`Batch ${i / BATCH_SIZE + 1} lỗi: ${data.message}`);
        }

        await delay(200);
      }

      const updated = dataSource.map((item) => {
        if (item.status === 404 && item.checkUrl) {
          const result = results.find((r) => r.url === item.checkUrl);
          return { ...item, devStatus: result?.status ?? -1 };
        }
        return item;
      });

      setDataSource(updated);
      message.success("Đã kiểm tra Dev URLs!");
    } catch (error) {
      message.error("Lỗi khi kiểm tra Dev URLs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handle404Export = () => {
    try {
      const errorUrls = dataSource
        .filter((item) => item.status === 404 || item.status === 500)
        .map((item) => ({
          url: item.url,
          status: item.status,
          devUrl: item.checkUrl,
          devStatus: item.devStatus,
        }));

      if (errorUrls.length === 0) {
        message.info("Không có URL nào trả về lỗi");
        return;
      }

      const fileContent = JSON.stringify(errorUrls, null, 2);
      const blob = new Blob([fileContent], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `error-urls-${type}-${timestamp}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(`Đã xuất ${errorUrls.length} URLs lỗi ra file JSON`);
    } catch (error) {
      message.error("Có lỗi xảy ra khi xuất file");
      console.error(error);
    }
  };

  useEffect(() => {
    crawlSitemap();
  }, [type]);

  const columns: ColumnsType<UrlItem> = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 80,
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (text: string) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "Dev URL",
      dataIndex: "checkUrl",
      key: "checkUrl",
      render: (text: string | undefined) =>
        text ? (
          <a href={text} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: number) => {
        if (status === -1) return <Tag color="default">Chưa kiểm tra</Tag>;
        if (status === 200) return <Tag color="green">200 OK</Tag>;
        if (status === 404) return <Tag color="red">404 Not Found</Tag>;
        if (status === 500) return <Tag color="magenta">500 Server Error</Tag>;
        if (status === 0) return <Tag color="volcano">Lỗi mạng</Tag>;
        return <Tag color="orange">{status}</Tag>;
      },
      filters: [
        { text: "Chưa kiểm tra", value: -1 },
        { text: "200 OK", value: 200 },
        { text: "404 Not Found", value: 404 },
        { text: "500 Server Error", value: 500 },
        { text: "Lỗi mạng", value: 0 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Trạng thái Dev",
      dataIndex: "devStatus",
      key: "devStatus",
      width: 130,
      render: (status: number | undefined) => {
        if (status === undefined) return "-";
        if (status === -1) return <Tag color="default">Chưa kiểm</Tag>;
        if (status === 200) return <Tag color="green">200 OK</Tag>;
        if (status === 404) return <Tag color="red">404 Not Found</Tag>;
        if (status === 500) return <Tag color="magenta">500 Server Error</Tag>;
        if (status === 0) return <Tag color="volcano">Lỗi mạng</Tag>;
        return <Tag color="orange">{status}</Tag>;
      },
      filters: [
        { text: "Chưa có Dev URL", value: "none" },
        { text: "Chưa kiểm tra", value: -1 },
        { text: "200 OK", value: 200 },
        { text: "404 Not Found", value: 404 },
        { text: "500 Server Error", value: 500 },
        { text: "Lỗi mạng", value: 0 },
      ],
      onFilter: (value, record) => {
        if (value === "none") {
          return record.devStatus === undefined;
        }
        return record.devStatus === value;
      },
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 space-x-2">
        <h2 className="text-2xl mb-4">
          {type.charAt(0).toUpperCase() + type.slice(1)} Sitemap
        </h2>

        <Button onClick={handleCheckUrls} loading={loading}>
          Kiểm tra URLs
        </Button>

        {dataSource.some(
          (item) => item.status === 404 || item.status === 500
        ) && (
          <Button onClick={handleCheckDevUrls} loading={loading}>
            Kiểm tra Dev URLs
          </Button>
        )}

        <Button
          icon={<DownloadOutlined />}
          onClick={handle404Export}
          disabled={
            !dataSource.some(
              (item) => item.status === 404 || item.status === 500
            )
          }
          type="primary"
          danger
        >
          Xuất URLs Lỗi
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <Spin size="large" />
          <p>Đang xử lý...</p>
        </div>
      ) : dataSource.length > 0 ? (
        <div className="w-full max-w-5xl">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              pageSize: pageSize,
              pageSizeOptions: ["10", "20", "50", "100"],
              showSizeChanger: true,
              showTotal: (total) => `Tổng cộng ${total} URLs`,
              onShowSizeChange: (_, size) => setPageSize(size),
            }}
            bordered
            rowKey="key"
          />
        </div>
      ) : null}
    </div>
  );
};

export default Sitemap;
