import { NextResponse } from "next/server";
import axios from "axios";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!Array.isArray(urls)) {
      return NextResponse.json(
        {
          success: false,
          message: "URLs must be an array",
        },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await axios.head(url, {
            validateStatus: () => true, // Chấp nhận mọi status code
            timeout: 5000, // Timeout sau 5 giây
          });

          return {
            url,
            status: response.status,
          };
        } catch (error) {
          console.log("🚀 ~ urls.map ~ error:", error);
          return {
            url,
            status: 0, // 0 đại diện cho lỗi mạng/timeout
            checkUrl: url.replace(
              "https://asvab-prep.com/",
              "https://asvab.cd.worksheetzone.org/"
            ),
          };
        }
      })
    );

    // Thống kê kết quả
    const stats = results.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return NextResponse.json({
      success: true,
      message: "Kiểm tra URLs hoàn tất",
      results,
      stats,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Có lỗi xảy ra khi kiểm tra URLs",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
