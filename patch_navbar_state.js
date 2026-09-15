import fs from 'fs';

let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  "const [activeModal, setActiveModal] = useState<'login' | 'signup' | null>(null);",
  "const [activeModal, setActiveModal] = useState<'login' | 'signup' | null>(null);\n  const [betaCode, setBetaCode] = useState('');"
);

code = code.replace(
  "const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {\n    e.preventDefault();\n    const target = e.target as HTMLFormElement;\n    const username = (target[0] as HTMLInputElement).value;\n    const efootballId = (target[1] as HTMLInputElement).value;\n    const email = (target[2] as HTMLInputElement).value;\n    const password = (target[3] as HTMLInputElement).value;",
  "const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {\n    e.preventDefault();\n    const target = e.target as HTMLFormElement;\n    const username = (target[0] as HTMLInputElement).value;\n    const efootballId = (target[1] as HTMLInputElement).value;\n    const email = (target[2] as HTMLInputElement).value;\n    const password = (target[3] as HTMLInputElement).value;\n    // betaCode is accessible via state"
);

code = code.replace(
  "body: JSON.stringify({ email, password, username, inGameName: efootballId })",
  "body: JSON.stringify({ email, password, username, inGameName: efootballId, betaCode })"
);

fs.writeFileSync('src/components/Navbar.tsx', code);
