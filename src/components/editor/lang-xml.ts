import { xml } from '@codemirror/lang-xml'
import { EditorPlugin } from '@/index'
import xmlFormat from 'xml-formatter'

export function formatter (val: string, indent = 2, options = {}): string {
  try {
    return xmlFormat(val.trim(), {
      collapseContent: true,
      indentation: ' '.repeat(indent),
      lineSeparator: '\n',
      ...options
    })
  } catch (e) {
    return val
  }
}

// 压缩xml
export function compactor (val: string): string {
  try {
    return xmlFormat(val.trim(), {
      collapseContent: true,
      indentation: '',
      lineSeparator: ''
    })
  } catch (e) {
    return val
  }
}

export function isValid (val: string): boolean {
  try {
    xmlFormat(val.trim())
    return true
  } catch (e) {
    return false
  }
}

const plugin: EditorPlugin = {
  formatter,
  compactor,
  extensions: [
    xml()
  ]
}

export default plugin
