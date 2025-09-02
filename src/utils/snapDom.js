import { snapdom } from '@zumer/snapdom'

/**
 * Converts an HTML element to a JPG image and triggers a download.
 *
 * @param {HTMLElement} element The HTML element to convert.
 * @param {object} options The options for the conversion.
 * @param {string} [options.fileName='download.png'] The desired file name for the downloaded image.
 * @param {string} [options.backgroundColor='#ffffff'] The background color for the image.
 * @param {number} [options.scale=1] The scale factor for the image.
 */
export async function convertElementToJpg(element, options = {}) {
  if (!element) {
    console.error('Element not provided.')
    return
  }

  const { fileName = 'download', backgroundColor = '#ffffff', scale = 1 } = options

  try {
    const rect = element.getBoundingClientRect()
    const screenshotOptions = {
      backgroundColor: backgroundColor,
      width: rect.width,
      height: rect.height,
      embedFonts: true,
      scale: scale,
    }

    const result = await snapdom(element, screenshotOptions)
    await result.toPng()
    await result.download({ format: 'png', filename: fileName })
  } catch (error) {
    console.error('Error during image conversion:', error)
    throw error
  }
}
