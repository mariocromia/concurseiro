// Teste de criação de mapa mental sem IA (mock)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubeivchkuoptmhkcglny.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTU4NDksImV4cCI6MjA3NDk5MTg0OX0.Q8hPuJsdeRKz-edKqVRTTCZo-mMtVNq1eoafJiF1St4'

const supabase = createClient(supabaseUrl, supabaseKey)

// Simular estrutura que a IA retorna
const mockData = {
  title: "Teste de Mapa Mental",
  nodes: [
    {
      id: "1",
      text: "VPS (Virtual Private Server)",
      parent_id: null,
      level: 0,
      position_x: 0,
      position_y: 200,
      color: "#3b82f6"
    },
    {
      id: "2",
      text: "Lojas Virtuais",
      parent_id: "1",
      level: 1,
      position_x: 300,
      position_y: 50,
      color: "#8b5cf6"
    },
    {
      id: "3",
      text: "Desenvolvedores",
      parent_id: "1",
      level: 1,
      position_x: 300,
      position_y: 200,
      color: "#8b5cf6"
    },
    {
      id: "4",
      text: "Aplicações Web",
      parent_id: "1",
      level: 1,
      position_x: 300,
      position_y: 350,
      color: "#8b5cf6"
    }
  ]
}

async function testCreateMindmap() {
  console.log('🧪 Testando criação de mapa mental...\n')

  try {
    // 1. Fazer login (ou use um token de acesso)
    console.log('📝 Verificando usuário...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('❌ Usuário não autenticado. Faça login primeiro.')
      console.log('   Execute no console do navegador (logado):')
      console.log('   localStorage.getItem("sb-ubeivchkuoptmhkcglny-auth-token")')
      return
    }

    console.log('✅ Usuário:', user.id)

    // 2. Criar mapa mental
    console.log('\n📝 Criando mapa mental...')
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .insert({
        user_id: user.id,
        title: mockData.title,
        description: 'Teste criado via script'
      })
      .select()
      .single()

    if (mindmapError) {
      console.error('❌ Erro ao criar mindmap:', mindmapError)
      return
    }

    console.log('✅ Mindmap criado:', mindmap.id)

    // 3. Criar nós com mapeamento de IDs
    console.log('\n📝 Criando nós...')
    const idMap = new Map()
    const nodesToInsert = []

    // Primeira passada: nós raiz
    for (const node of mockData.nodes) {
      if (!node.parent_id) {
        nodesToInsert.push({
          mindmap_id: mindmap.id,
          parent_id: null,
          text: node.text,
          position_x: node.position_x,
          position_y: node.position_y,
          color: node.color
        })
      }
    }

    console.log('   Inserindo', nodesToInsert.length, 'nós raiz...')
    const { data: rootNodes, error: rootError } = await supabase
      .from('mindmap_nodes')
      .insert(nodesToInsert)
      .select()

    if (rootError) {
      console.error('❌ Erro ao criar nós raiz:', rootError)
      return
    }

    // Mapear IDs
    let rootIndex = 0
    for (const node of mockData.nodes) {
      if (!node.parent_id) {
        idMap.set(node.id, rootNodes[rootIndex].id)
        console.log('   Mapeado:', node.id, '->', rootNodes[rootIndex].id)
        rootIndex++
      }
    }

    // Segunda passada: nós filhos
    const childNodesToInsert = []
    for (const node of mockData.nodes) {
      if (node.parent_id) {
        const realParentId = idMap.get(node.parent_id)
        if (!realParentId) {
          console.error('❌ Parent ID não encontrado:', node.parent_id)
          continue
        }

        childNodesToInsert.push({
          mindmap_id: mindmap.id,
          parent_id: realParentId,
          text: node.text,
          position_x: node.position_x,
          position_y: node.position_y,
          color: node.color
        })
      }
    }

    if (childNodesToInsert.length > 0) {
      console.log('   Inserindo', childNodesToInsert.length, 'nós filhos...')
      const { data: childNodes, error: childError } = await supabase
        .from('mindmap_nodes')
        .insert(childNodesToInsert)
        .select()

      if (childError) {
        console.error('❌ Erro ao criar nós filhos:', childError)
        return
      }

      console.log('✅ Nós filhos criados:', childNodes.length)
    }

    console.log('\n✅ Mapa mental criado com sucesso!')
    console.log('   ID:', mindmap.id)
    console.log('   URL:', `http://localhost:3000/mapas-mentais/editor/${mindmap.id}`)
  } catch (error) {
    console.error('\n❌ Erro:', error.message)
  }
}

testCreateMindmap()
