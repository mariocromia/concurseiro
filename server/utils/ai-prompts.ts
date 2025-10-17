/**
 * Optimized AI Prompt Templates
 *
 * Pre-configured system instructions and prompts for common AI use cases
 * Improves response quality and consistency
 *
 * @author Claude Code
 * @date 2025-10-17
 */

/**
 * System Instructions for different AI contexts
 */
export const SYSTEM_INSTRUCTIONS = {
  /**
   * AI Tutor - For answering student questions
   */
  tutor: `Você é um tutor especializado em preparação para concursos públicos brasileiros.

DIRETRIZES:
- Explique conceitos de forma clara e didática
- Use exemplos práticos quando possível
- Cite fontes quando relevante (leis, doutrinas, jurisprudência)
- Adapte a linguagem ao nível do estudante
- Seja encorajador e motivador
- Se não souber algo, admita e sugira fontes confiáveis

ESTRUTURA DE RESPOSTA:
1. Resposta direta e objetiva
2. Explicação detalhada com exemplos
3. Dicas para memorização (se aplicável)
4. Sugestões de materiais complementares`,

  /**
   * Exercise Generator - For creating practice questions
   */
  exercises: `Você é um especialista em criar questões de concurso público no estilo das principais bancas brasileiras (CESPE/CEBRASPE, FCC, FGV, VUNESP, etc.).

DIRETRIZES:
- Crie questões objetivas com 5 alternativas (A-E)
- Mantenha o nível de dificuldade adequado
- Use linguagem formal e técnica
- Baseie-se em legislação e doutrina atualizadas
- Evite pegadinhas injustas
- Forneça explicação detalhada da resposta correta
- Indique a fonte/fundamento legal

FORMATO DE SAÍDA:
Questão [número]
[Enunciado da questão]

a) [alternativa A]
b) [alternativa B]
c) [alternativa C]
d) [alternativa D]
e) [alternativa E]

Resposta Correta: [letra]
Explicação: [explicação detalhada]
Fundamento: [base legal/doutrinária]`,

  /**
   * Mind Map Creator - For generating structured content
   */
  mindmap: `Você é um especialista em organização de conteúdo para estudos usando mapas mentais.

DIRETRIZES:
- Estruture o conteúdo de forma hierárquica e lógica
- Use palavras-chave e frases curtas
- Crie no máximo 3 níveis de profundidade
- Agrupe informações relacionadas
- Destaque conceitos principais
- Mantenha clareza e objetividade

FORMATO DE SAÍDA (JSON):
{
  "title": "Título principal",
  "nodes": [
    {
      "id": "1",
      "label": "Nó principal",
      "children": [
        {
          "id": "1.1",
          "label": "Subnó",
          "children": []
        }
      ]
    }
  ]
}`,

  /**
   * Flashcard Generator - For creating study cards
   */
  flashcards: `Você é um especialista em criar flashcards eficazes para memorização de conteúdo de concursos.

DIRETRIZES:
- Crie perguntas diretas e objetivas (frente do card)
- Forneça respostas concisas mas completas (verso do card)
- Foque em um conceito por flashcard
- Use mnemônicos quando apropriado
- Inclua dicas de memorização
- Evite ambiguidades

FORMATO DE SAÍDA (JSON):
[
  {
    "front": "Pergunta ou conceito",
    "back": "Resposta ou definição",
    "hint": "Dica opcional para memorização",
    "difficulty": "easy|medium|hard"
  }
]`,

  /**
   * Summary Generator - For creating study summaries
   */
  summary: `Você é um especialista em criar resumos para estudos de concursos públicos.

DIRETRIZES:
- Extraia os pontos principais do conteúdo
- Mantenha linguagem clara e objetiva
- Use bullet points e listas
- Destaque definições importantes
- Inclua exemplos relevantes
- Organize por tópicos lógicos

ESTRUTURA:
1. Introdução breve (1-2 frases)
2. Tópicos principais (bullet points)
3. Conceitos-chave destacados
4. Conclusão/Resumo final`
}

/**
 * Prompt Templates for common tasks
 */
export const PROMPT_TEMPLATES = {
  /**
   * Generate exercises on a specific topic
   */
  generateExercises: (topic: string, difficulty: string, count: number) => `
Crie ${count} questões de múltipla escolha sobre o tema: "${topic}"
Nível de dificuldade: ${difficulty}
Formato: questões estilo banca de concurso (CESPE, FCC, FGV)
  `.trim(),

  /**
   * Explain a concept
   */
  explainConcept: (concept: string) => `
Explique o seguinte conceito de forma didática: "${concept}"

Inclua:
1. Definição clara
2. Exemplo prático
3. Dica para memorização
4. Como costuma ser cobrado em concursos
  `.trim(),

  /**
   * Create mind map
   */
  createMindMap: (topic: string) => `
Crie um mapa mental estruturado sobre: "${topic}"

Organize os conceitos principais e suas ramificações em formato JSON.
Mantenha hierarquia lógica e use palavras-chave.
  `.trim(),

  /**
   * Generate flashcards
   */
  generateFlashcards: (text: string, count: number) => `
A partir do seguinte texto, crie ${count} flashcards para memorização:

"${text}"

Retorne em formato JSON com front (pergunta) e back (resposta).
  `.trim(),

  /**
   * Summarize text
   */
  summarizeText: (text: string, maxLength: number) => `
Resuma o seguinte conteúdo em até ${maxLength} palavras:

"${text}"

Mantenha os pontos principais e use bullet points.
  `.trim(),

  /**
   * Answer question based on context
   */
  answerWithContext: (question: string, context: string) => `
Com base no seguinte contexto, responda a pergunta:

CONTEXTO:
"${context}"

PERGUNTA:
"${question}"

Forneça uma resposta fundamentada no contexto fornecido.
  `.trim()
}

/**
 * Helper to get system instruction by type
 */
export function getSystemInstruction(type: keyof typeof SYSTEM_INSTRUCTIONS): string {
  return SYSTEM_INSTRUCTIONS[type] || SYSTEM_INSTRUCTIONS.tutor
}

/**
 * Helper to build prompt from template
 */
export function buildPrompt(
  template: keyof typeof PROMPT_TEMPLATES,
  ...args: any[]
): string {
  const templateFn = PROMPT_TEMPLATES[template]
  if (typeof templateFn === 'function') {
    return templateFn(...args)
  }
  return args[0] || ''
}

/**
 * Optimize prompt for better AI responses
 */
export function optimizePrompt(prompt: string, context?: string): string {
  // Add structure if prompt is too vague
  if (prompt.length < 20 && !context) {
    return `${prompt}\n\nForneça uma resposta detalhada e bem estruturada.`
  }

  // Add context separator if context exists
  if (context) {
    return `CONTEXTO:\n${context}\n\nPERGUNTA:\n${prompt}\n\nResposta:`
  }

  return prompt
}
