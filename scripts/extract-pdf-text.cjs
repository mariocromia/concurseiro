const fs = require('fs')
const path = require('path')
const pdf = require('pdf-parse')

const pdfPath = path.resolve('..', 'docs', 'projeto.pdf')

async function main() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath)
    const data = await pdf(dataBuffer)

    console.log('--- PDF Metadata ---')
    console.log(JSON.stringify(data.info || {}, null, 2))
    console.log('\n--- PDF Text (first 5000 chars) ---')
    console.log(data.text.slice(0, 5000))
    console.log('\n--- Full Text Length ---')
    console.log(data.text.length)

    const outPath = path.resolve('.', 'pdf_text_output.txt')
    fs.writeFileSync(outPath, data.text, 'utf-8')
    console.log(`\nSaved full text to: ${outPath}`)
  } catch (err) {
    console.error('Failed to extract PDF text:', err)
    process.exit(1)
  }
}

main()