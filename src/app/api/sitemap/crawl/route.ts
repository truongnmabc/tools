import axios from "axios";
import { parseStringPromise } from "xml2js";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
interface SitemapUrl {
  loc: string[];
  lastmod?: string[];
  changefreq?: string[];
  priority?: string[];
}

interface SitemapData {
  urlset: {
    url: SitemapUrl[];
    $?: {
      xmlns?: string;
      "xmlns:xsi"?: string;
      "xsi:schemaLocation"?: string;
    };
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "post";
    console.log("🚀 ~ GET ~ type:", type);

    // Xác định URL sitemap dựa trên type
    const sitemapUrls = {
      post: "https://asvab-prep.com/post-sitemap.xml",
      page: "https://asvab-prep.com/page-sitemap.xml",
      category: "https://asvab-prep.com/category-sitemap.xml",
      question: "https://asvab-prep.com/question-sitemap.xml",
      author: "https://asvab-prep.com/authors-sitemap.xml",
      test: "https://asvab-prep.com/test-asvab-sitemap.xml",
    };

    // Kiểm tra type có hợp lệ
    if (!sitemapUrls[type as keyof typeof sitemapUrls]) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sitemap type",
        },
        { status: 400 }
      );
    }

    const { data } = await axios.get(
      sitemapUrls[type as keyof typeof sitemapUrls]
    );

    const parsed = (await parseStringPromise(data)) as SitemapData;
    const urls = parsed.urlset.url.map((entry: SitemapUrl) => entry.loc[0]);

    return NextResponse.json({
      success: true,
      message: `Đã lưu ${urls.length} links từ ${type} sitemap vào sitemap-${type}-urls.json`,
      type,
      urls,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Có lỗi xảy ra khi crawl sitemap",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
