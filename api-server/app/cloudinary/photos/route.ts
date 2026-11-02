import { NextRequest, NextResponse } from "next/server"
import cloudinary from "@/lib/config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const folder = searchParams.get("folder")
    const nextCursor = searchParams.get("next_cursor")

    if (!folder) {
      return NextResponse.json(
        { error: "folder is required" },
        { status: 400 },
      )
    }

    let search = cloudinary.search
      .expression(`folder:"${folder}"`)
      .sort_by("created_at", "desc")
      .max_results(50)

    if (nextCursor) {
      search = search.next_cursor(nextCursor)
    }

    const result = await search.execute()

    const photos = result.resources.map((photo: any) => {
      const thumbnailUrl = cloudinary.url(photo.public_id, {
        secure: true,
        transformation: [
          {
            width: 400,
            height: 300,
            crop: "fill",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      })

      const mediumUrl = cloudinary.url(photo.public_id, {
        secure: true,
        transformation: [
          {
            width: 1200,
            height: 900,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      })

      return {
        id: photo.public_id,

        // Small image for gallery grids
        thumbnailUrl,

        // Larger image for the viewer
        mediumUrl,

        // Original Cloudinary asset
        originalUrl: photo.secure_url,

        width: photo.width,
        height: photo.height,
        filename: photo.filename,
        createdAt: photo.created_at,
      }
    })

    return NextResponse.json(
      {
        photos,
        nextCursor: result.next_cursor ?? null,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    )
  } catch (error) {
    console.error("Failed to load photos:", error)

    return NextResponse.json(
      { error: "Failed to load photos" },
      { status: 500 },
    )
  }
}