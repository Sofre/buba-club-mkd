const apiBaseUrl = (
  process.env.API_BASE_URL ||
  process.env.VITE_API_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "")

const expectedOrigin =
  process.env.CORS_ALLOWED_ORIGIN || "http://localhost:5173"
const requestedFolder = process.env.API_TEST_FOLDER
const failures = []
let passed = 0

const report = (name, ok, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`)
  if (ok) {
    passed += 1
  } else {
    failures.push(name)
  }
}

const request = async (path, options = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    signal: AbortSignal.timeout(15_000),
  })

  return response
}

const isObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value)

console.log(`Testing API at ${apiBaseUrl}`)

try {
  const preflight = await request("/cloudinary", {
    method: "OPTIONS",
    headers: {
      Origin: expectedOrigin,
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "content-type",
    },
  })
  const allowMethods =
    preflight.headers.get("access-control-allow-methods") || ""
  const preflightOk =
    preflight.status === 204 &&
    preflight.headers.get("access-control-allow-origin") === expectedOrigin &&
    allowMethods.split(",").map((method) => method.trim()).includes("GET")
  report(
    "CORS preflight for GET /cloudinary",
    preflightOk,
    `HTTP ${preflight.status}`,
  )

  const albumsResponse = await request("/cloudinary")
  let albumsPayload
  try {
    albumsPayload = await albumsResponse.json()
  } catch {
    albumsPayload = null
  }

  const albumsValid =
    albumsResponse.ok &&
    isObject(albumsPayload) &&
    Array.isArray(albumsPayload.albums) &&
    albumsPayload.albums.every(
      (album) =>
        isObject(album) &&
        typeof album.folder === "string" &&
        typeof album.name === "string",
    )
  report(
    "GET /cloudinary returns albums",
    albumsValid,
    `HTTP ${albumsResponse.status}; ${
      Array.isArray(albumsPayload?.albums)
        ? `${albumsPayload.albums.length} album(s)`
        : "invalid response"
    }`,
  )

  const missingFolderResponse = await request("/cloudinary/photos")
  let missingFolderPayload
  try {
    missingFolderPayload = await missingFolderResponse.json()
  } catch {
    missingFolderPayload = null
  }
  report(
    "GET /cloudinary/photos requires folder",
    missingFolderResponse.status === 400 &&
      missingFolderPayload?.error === "folder is required",
    `HTTP ${missingFolderResponse.status}`,
  )

  if (albumsValid) {
    const folder =
      requestedFolder || albumsPayload.albums[0]?.folder

    if (!folder) {
      report(
        "GET /cloudinary/photos?folder=…",
        false,
        "No album folder found; set API_TEST_FOLDER to test this endpoint",
      )
    } else {
      const photosPath = `/cloudinary/photos?${new URLSearchParams({ folder })}`
      const photosResponse = await request(photosPath)
      let photosPayload
      try {
        photosPayload = await photosResponse.json()
      } catch {
        photosPayload = null
      }

      const photosValid =
        photosResponse.ok &&
        isObject(photosPayload) &&
        Array.isArray(photosPayload.photos) &&
        photosPayload.photos.every(
          (photo) =>
            isObject(photo) &&
            typeof photo.id === "string" &&
            typeof photo.thumbnailUrl === "string" &&
            typeof photo.mediumUrl === "string" &&
            typeof photo.originalUrl === "string",
        ) &&
        (photosPayload.nextCursor === null ||
          typeof photosPayload.nextCursor === "string")

      report(
        "GET /cloudinary/photos?folder=… returns photos",
        photosValid,
        `HTTP ${photosResponse.status}; ${
          Array.isArray(photosPayload?.photos)
            ? `${photosPayload.photos.length} photo(s)`
            : "invalid response"
        }`,
      )
    }
  }
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Unknown request error"
  report("API requests", false, message)
}

console.log(`\n${passed} passed, ${failures.length} failed`)
if (failures.length) {
  process.exitCode = 1
}
