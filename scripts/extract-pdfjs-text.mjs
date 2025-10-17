import fs from 'fs'
import path from 'path'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.js'

const pdfPath = path.resolve('..', 'docs', 'projeto.pdf')

async function extractText() {
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const loadingTask = getDocument({ data, isEvalSupported: false, disableWorker: true })
  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  let fullText = ''

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const strings = content.items.map((item) => item.str)
    const pageText = strings.join(' ')
    fullText += `\n\n--- Page ${pageNum}/${numPages} ---\n` + pageText
  }

  return fullText
}

async function main() {
  try {
    const text = await extractText()
    const outPath = path.resolve('.', 'pdf_text_output.txt')
    fs.writeFileSync(outPath, text, 'utf-8')
    console.log('Saved full text to:', outPath)
    console.log('\n--- Preview (first 3000 chars) ---')
    console.log(text.slice(0, 3000))
    console.log('\nLength:', text.length)
  } catch (err) {
    console.error('Failed to extract PDF text:', err)
    process.exit(1)
  }
}

main()