import workerUrl from 'modern-screenshot/worker?url'
import { createContext, destroyContext, domToDataUrl } from 'modern-screenshot'

/**
 * Converts an HTML element to a JPG image and triggers a download.
 *
 * @param {HTMLElement} element The HTML element to convert.
 * @param {object} options The options for the conversion.
 * @param {string} [options.fileName='download.jpg'] The desired file name for the downloaded image.
 * @param {string} [options.backgroundColor='#ffffff'] The background color for the image.
 * @param {boolean} [options.useWebWorker=true] Whether to use a web worker for performance.
 */
export async function convertElementToJpg(element, options = {}) {
  if (!element) {
    console.error('Element not provided.')
    return
  }

  const {
    fileName = 'download.jpg',
    backgroundColor = '#ffffff',
    useWebWorker = true
  } = options

  let context = null
  try {
    const rect = element.getBoundingClientRect()
    const screenshotOptions = {
      quality: 1.0,
      backgroundColor: backgroundColor,
      width: rect.width,
      height: rect.height,
      type: 'image/jpeg',
      scale: window.devicePixelRatio,
    }

    let dataUrl = ''
    if (useWebWorker) {
      context = await createContext(element, {
        ...screenshotOptions,
        workerUrl,
        workerNumber: 1,
      })
      dataUrl = await domToDataUrl(context)
    } else {
      dataUrl = await domToDataUrl(element, screenshotOptions)
    }

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = fileName
    link.click()
  } catch (error) {
    console.error('Error during JPG conversion:', error)
    throw error
  } finally {
    if (context) {
      destroyContext(context)
    }
  }
}
