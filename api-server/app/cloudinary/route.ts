import { NextResponse } from "next/server"
import cloudinary from "@/lib/config"
import { corsHeaders } from "@/lib/cors"

const CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400"

export async function OPTIONS() {
return new NextResponse(null, {
status: 204,
headers: corsHeaders,
})
}

export async function GET() {
try {
const result =
await cloudinary.api.sub_folders("albums")


const albums = result.folders.map(
  (folder: any) => ({
    id: folder.path,
    name: folder.name,
    folder: folder.path,
    photos: 0,
  }),
)

return NextResponse.json(
  { albums },
  { headers: { ...corsHeaders, "Cache-Control": CACHE_CONTROL } },
)


} catch (error) {
console.error(
"Failed to load albums:",
error,
)


return NextResponse.json(
  { error: "Failed to load albums" },
  {
    status: 500,
    headers: corsHeaders,
  },
)


}
}
