import fs from 'fs';

const files = [
  'src/components/AdminExperiments.tsx',
  'src/components/AdminFeatureFlags.tsx',
  'src/components/AdminFeedback.tsx',
  'src/components/AdminRemoteConfig.tsx',
  'src/components/FeedbackModal.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // They are using const api = useApi(); which assumes useApi() returns an object with .fetch.
  // We need to fix this to use regular fetch, because useApi is a custom hook in this project that returns something else.
  // Actually, wait, the codebase usually just uses fetch directly for APIs or maybe a custom utility.
  // Let's replace api.fetch with regular fetch and handle auth by sending token if available.
  // For simplicity, let's just use global fetch.
  
  // Let's replace \`const api = useApi();\` with nothing, and \`api.fetch(\` with \`fetch('/api'\`
  
  code = code.replace(/const api = useApi\(\);/g, '');
  code = code.replace(/import \{ useApi \} from '\.\.\/lib\/useApi';/g, '');
  
  code = code.replace(/api\.fetch\('\/feedbacks/g, "fetch('/api/feedbacks");
  code = code.replace(/api\.fetch\(\`\/feedbacks/g, "fetch(`/api/feedbacks");
  
  code = code.replace(/api\.fetch\('\/featureFlags/g, "fetch('/api/featureFlags");
  code = code.replace(/api\.fetch\(\`\/featureFlags/g, "fetch(`/api/featureFlags");
  
  code = code.replace(/api\.fetch\('\/remoteConfigs/g, "fetch('/api/remoteConfigs");
  code = code.replace(/api\.fetch\(\`\/remoteConfigs/g, "fetch(`/api/remoteConfigs");
  
  code = code.replace(/api\.fetch\('\/experiments/g, "fetch('/api/experiments");
  code = code.replace(/api\.fetch\(\`\/experiments/g, "fetch(`/api/experiments");
  
  // also add auth token to headers for fetch requests in admin
  code = code.replace(/headers: \{/g, "headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`,");
  
  // For GET requests that don't have a second argument yet
  code = code.replace(/fetch\('(\/api\/[a-zA-Z]+)'\)/g, "fetch('$1', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })");
  code = code.replace(/fetch\('(\/api\/[a-zA-Z]+\/all)'\)/g, "fetch('$1', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })");

  // Also parse response as JSON
  code = code.replace(/const data = await fetch\((.*?)\);/g, "const res = await fetch($1);\n      const data = await res.json();");

  fs.writeFileSync(file, code);
}
console.log('Fixed fetch calls');
