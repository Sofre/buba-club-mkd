let resolveHomeReady: () => void = () => {}

// Resolves once the home page has its key content (gallery preview + first image).
export const homeReady = new Promise<void>((resolve) => {
  resolveHomeReady = resolve
})

export const markHomeReady = () => resolveHomeReady()
