// Question Detector - Intelligent question analysis
class QuestionDetector {
  constructor(selectedText, selectedHTML) {
    this.text = selectedText
    this.html = selectedHTML
    this.parser = new DOMParser()
    this.doc = this.parser.parseFromString(selectedHTML, 'text/html')
  }

  // Detect if selection is a multiple choice question
  isMultipleChoice() {
    const patterns = [
      /[A-E]\)\s*.+/gi,
      /\([A-E]\)\s*.+/gi,
      /[A-E]\.\s*.+/gi,
      /[A-E]\s+-\s*.+/gi
    ]
    return patterns.some(pattern => pattern.test(this.text))
  }

  // Extract alternatives from question
  extractAlternatives() {
    const alternatives = []
    const lines = this.text.split('\n')
    const altPattern = /^([A-E])[.)]\s*(.+)/

    lines.forEach(line => {
      const match = line.trim().match(altPattern)
      if (match) {
        alternatives.push({
          letter: match[1],
          text: match[2].trim()
        })
      }
    })

    return alternatives
  }

  // Detect correct answer (gabarito) if visible
  detectAnswer() {
    const answerPatterns = [
      /gabarito:\s*([A-E])/i,
      /resposta:\s*([A-E])/i,
      /correta:\s*([A-E])/i,
      /alternativa\s+correta:\s*([A-E])/i,
      /resposta\s+correta:\s*([A-E])/i,
      /letra\s+([A-E])/i
    ]

    // Search in selected text
    for (let pattern of answerPatterns) {
      const match = this.text.match(pattern)
      if (match) return match[1]
    }

    // Search in nearby DOM elements
    const nearbyText = this.getNearbyText()
    for (let pattern of answerPatterns) {
      const match = nearbyText.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  // Extract images from selection
  extractImages() {
    const images = []
    const imgElements = this.doc.querySelectorAll('img')

    imgElements.forEach(img => {
      if (img.src && !img.src.includes('data:image')) {
        images.push({
          src: img.src,
          alt: img.alt || '',
          width: img.width,
          height: img.height
        })
      }
    })

    return images
  }

  // Detect subject/topic based on keywords
  detectSubject() {
    const subjects = {
      'Direito Constitucional': [
        'constituição', 'stf', 'supremo', 'constitucional',
        'direitos fundamentais', 'poder constituinte', 'emenda constitucional',
        'princípios constitucionais', 'adin', 'controle de constitucionalidade'
      ],
      'Direito Administrativo': [
        'administração pública', 'servidor público', 'licitação',
        'contrato administrativo', 'ato administrativo', 'processo administrativo',
        'improbidade', 'agente público', 'poder de polícia'
      ],
      'Direito Penal': [
        'crime', 'pena', 'código penal', 'homicídio', 'furto', 'roubo',
        'dolo', 'culpa', 'imputabilidade', 'prescrição penal'
      ],
      'Direito Civil': [
        'código civil', 'obrigação', 'contrato', 'posse', 'propriedade',
        'sucessão', 'família', 'casamento', 'responsabilidade civil'
      ],
      'Português': [
        'sintaxe', 'semântica', 'concordância', 'regência',
        'ortografia', 'gramática', 'crase', 'pontuação', 'verbo',
        'sujeito', 'predicado', 'complemento'
      ],
      'Matemática': [
        'equação', 'função', 'geometria', 'trigonometria',
        'probabilidade', 'estatística', 'porcentagem', 'razão',
        'proporção', 'fração'
      ],
      'Raciocínio Lógico': [
        'proposição', 'silogismo', 'tabela verdade', 'lógica',
        'premissa', 'conclusão lógica', 'argumento', 'inferência',
        'negação', 'condicional'
      ],
      'Informática': [
        'windows', 'linux', 'excel', 'word', 'sistema operacional',
        'hardware', 'software', 'internet', 'rede', 'segurança da informação'
      ],
      'Direito Processual Civil': [
        'processo', 'ação', 'recurso', 'sentença', 'petição',
        'juiz', 'competência', 'audiência', 'prova', 'cpc'
      ],
      'Legislação': [
        'lei', 'decreto', 'portaria', 'resolução', 'artigo',
        'parágrafo', 'inciso', 'alínea'
      ]
    }

    const textLower = this.text.toLowerCase()

    // Find best match based on keyword count
    let bestMatch = { subject: 'Não identificado', count: 0 }

    for (let [subject, keywords] of Object.entries(subjects)) {
      const count = keywords.filter(keyword => textLower.includes(keyword)).length
      if (count > bestMatch.count) {
        bestMatch = { subject, count }
      }
    }

    return bestMatch.count > 0 ? bestMatch.subject : 'Não identificado'
  }

  // Detect difficulty level
  detectDifficulty() {
    const difficultyPatterns = [
      /dificuldade:\s*(fácil|média|difícil)/i,
      /nível:\s*(fácil|médio|difícil)/i,
      /questão\s+(fácil|média|difícil)/i
    ]

    for (let pattern of difficultyPatterns) {
      const match = this.text.match(pattern)
      if (match) {
        const level = match[1].toLowerCase()
        if (level.includes('fácil')) return 'easy'
        if (level.includes('méd')) return 'medium'
        if (level.includes('difícil')) return 'hard'
      }
    }

    // Heuristic: longer questions tend to be harder
    const wordCount = this.text.split(/\s+/).length
    if (wordCount > 300) return 'hard'
    if (wordCount > 150) return 'medium'
    return 'easy'
  }

  // Extract just the question text (without alternatives)
  extractQuestionText() {
    const alternatives = this.extractAlternatives()
    let questionText = this.text

    // Remove alternatives from text
    alternatives.forEach(alt => {
      const pattern = new RegExp(`[A-E][.)\\s-]+${this.escapeRegex(alt.text)}`, 'gi')
      questionText = questionText.replace(pattern, '')
    })

    // Clean up extra whitespace
    questionText = questionText
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    return questionText
  }

  // Get nearby text (for finding answers)
  getNearbyText() {
    try {
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const container = range.commonAncestorContainer.parentElement

      let nearbyText = container.textContent || ''

      // Check sibling elements
      if (container.nextElementSibling) {
        nearbyText += ' ' + container.nextElementSibling.textContent
      }
      if (container.previousElementSibling) {
        nearbyText += ' ' + container.previousElementSibling.textContent
      }

      // Check parent's siblings
      const parent = container.parentElement
      if (parent) {
        if (parent.nextElementSibling) {
          nearbyText += ' ' + parent.nextElementSibling.textContent
        }
        if (parent.previousElementSibling) {
          nearbyText += ' ' + parent.previousElementSibling.textContent
        }
      }

      return nearbyText
    } catch (e) {
      return ''
    }
  }

  // Detect institution/banca
  detectInstitution() {
    const institutions = [
      'cespe', 'cebraspe', 'fcc', 'fundação carlos chagas',
      'vunesp', 'fgv', 'cesgranrio', 'consulplan', 'quadrix',
      'aocp', 'ibfc', 'iades', 'fundep', 'instituto aocp'
    ]

    const textLower = this.text.toLowerCase()

    for (let institution of institutions) {
      if (textLower.includes(institution)) {
        return institution.toUpperCase()
      }
    }

    return null
  }

  // Detect year of exam
  detectYear() {
    const yearPattern = /\b(20\d{2})\b/g
    const matches = this.text.match(yearPattern)

    if (matches && matches.length > 0) {
      // Return most recent year
      const years = matches.map(y => parseInt(y)).sort((a, b) => b - a)
      return years[0]
    }

    return null
  }

  // Utility: escape regex special characters
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Main analysis function
  analyze() {
    const isQuestion = this.isMultipleChoice()
    const alternatives = this.extractAlternatives()

    return {
      isQuestion,
      questionText: isQuestion ? this.extractQuestionText() : this.text,
      alternatives: alternatives,
      correctAnswer: this.detectAnswer(),
      images: this.extractImages(),
      subject: this.detectSubject(),
      difficulty: this.detectDifficulty(),
      institution: this.detectInstitution(),
      year: this.detectYear(),
      rawText: this.text,
      rawHTML: this.html,
      metadata: {
        hasImages: this.extractImages().length > 0,
        alternativeCount: alternatives.length,
        wordCount: this.text.split(/\s+/).length,
        charCount: this.text.length
      }
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.QuestionDetector = QuestionDetector
}
