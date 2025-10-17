const fs = require('fs')
const path = require('path')
const PDFParser = require('pdf2json')

const pdfPath = path.resolve('..', 'docs', 'projeto.pdf')

function extractText(pdfPath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser()

    pdfParser.on('pdfParser_dataError', err => reject(err?.parserError || err))
    pdfParser.on('pdfParser_dataReady', pdfData => {
      try {
        const pages = pdfData?.Pages || []
        let fullText = ''
        pages.forEach((page, idx) => {
          const texts = []
          ;(page.Texts || []).forEach(t => {
            (t.R || []).forEach(r => {
              // decode URI component used by pdf2json
              const str = decodeURIComponent(r.T || '')
              texts.push(str)
            })
          })
          fullText += `\n\n--- Page ${idx + 1}/${pages.length} ---\n` + texts.join(' ')
        })
        resolve(fullText)
      } catch (e) {
        reject(e)
      }
    })

    pdfParser.loadPDF(pdfPath)
  })
}

async function main() {
  try {
    const text = await extractText(pdfPath)
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