import pako from 'pako'
import { useStudentStore } from '@/store/student'
import { useGiftStore } from '@/store/gift'
import { useGiftPlannerStore } from '@/store/giftPlanner'
import { useSettingStore } from '@/store/setting'

export function getLocalStatePayload() {
  return {
    student: localStorage.getItem('student') || '{}',
    gift: localStorage.getItem('gift') || '{}',
    giftPlanner: localStorage.getItem('giftPlanner') || '{}',
    setting: localStorage.getItem('setting') || '{}',
  }
}

export function compressSaveData(payloadObj) {
  const jsonString = JSON.stringify(payloadObj)
  const compressedBytes = pako.deflate(jsonString)
  return btoa(
    Array.from(compressedBytes)
      .map((byte) => String.fromCharCode(byte))
      .join('')
  )
}

export function decompressSaveData(base64Payload) {
  const binaryString = atob(base64Payload)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return pako.inflate(bytes, { to: 'string' })
}

export function applySaveDataToStores(jsonString) {
  const parsed = JSON.parse(jsonString)
  const stores = {
    student: useStudentStore(),
    gift: useGiftStore(),
    giftPlanner: useGiftPlannerStore(),
    setting: useSettingStore(),
  }

  if (parsed.student) stores.student.$patch(JSON.parse(parsed.student))
  if (parsed.gift) stores.gift.$patch(JSON.parse(parsed.gift))
  if (parsed.giftPlanner) stores.giftPlanner.$patch(JSON.parse(parsed.giftPlanner))
  if (parsed.setting) stores.setting.$patch(JSON.parse(parsed.setting))
}

export function generateExportFile() {
  const payloadObj = getLocalStatePayload()
  const base64Payload = compressSaveData(payloadObj)

  const exportData = {
    payload: base64Payload,
    version: 1,
    date: new Date().toISOString(),
  }

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', `ba-gift-planner-backup-${new Date().toISOString().split('T')[0]}.json`)
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

export function importFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        if (!importedData.payload) {
          throw new Error('Invalid backup file format. Missing payload.')
        }

        const decompressed = decompressSaveData(importedData.payload)
        applySaveDataToStores(decompressed)

        resolve()
      } catch (error) {
        console.error('Import failed:', error)
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsText(file)
  })
}
