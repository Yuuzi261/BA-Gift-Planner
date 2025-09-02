import { snapdom } from '@zumer/snapdom'

/**
 * Converts an HTML element to a JPG image and triggers a download.
 *
 * @param {HTMLElement} element The HTML element to convert.
 * @param {object} options The options for the conversion.
 * @param {string} [options.fileName='download.png'] The desired file name for the downloaded image.
 * @param {string} [options.backgroundColor='#ffffff'] The background color for the image.
 */
export async function convertElementToJpg(element, options = {}) {
  if (!element) {
    console.error('Element not provided.')
    return
  }

  const { fileName = 'download', backgroundColor = '#ffffff' } = options

  try {
    const rect = element.getBoundingClientRect()
    const screenshotOptions = {
      quality: 1.0,
      backgroundColor: backgroundColor,
      width: rect.width,
      height: rect.height,
      embedFonts: true,
    }

    const result = await snapdom(element, screenshotOptions)
    const img = await result.toPng()
    document.body.appendChild(img)
    await result.download({ format: 'png', filename: fileName })
  } catch (error) {
    console.error('Error during image conversion:', error)
    throw error
  }
}
