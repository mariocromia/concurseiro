const fs = require('fs');
const path = './app/pages/mapa-mental.vue';
let content = fs.readFileSync(path, 'utf8');

// Fix loadMindmaps
content = content.replace(
  /const { data } = await \$fetch\('\/api\/mindmaps'\)\s+mindmaps\.value = data/,
  "const response = await \$fetch('/api/mindmaps')\n    mindmaps.value = response.data"
);

// Fix createNewMindmap
content = content.replace(
  /const { data } = await \$fetch\('\/api\/mindmaps',[\s\S]*?\}\)\s+if \(data\) {\s+await openMindmap\(data\.id\)/,
  (match) => match
    .replace('const { data } = await $fetch', 'const response = await $fetch')
    .replace('if (data) {', 'if (response.data) {')
    .replace('await openMindmap(data.id)', 'await openMindmap(response.data.id)')
);

// Fix openMindmap
content = content.replace(
  /const { data } = await \$fetch\(`\/api\/mindmaps\/\$\{id\}`\)\s+selectedMindmap\.value = id\s+currentMindmapData\.value = data\s+nodes\.value = data\.nodes/,
  "const response = await \$fetch(`/api/mindmaps/\${id}`)\n\n    selectedMindmap.value = id\n    currentMindmapData.value = response.data\n    nodes.value = response.data.nodes"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed!');
