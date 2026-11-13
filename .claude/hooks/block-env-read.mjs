#!/usr/bin/env node
// PreToolUse hook: block tools from reading .env files (they hold secrets).
// Allowed: .env.example, .env.sample, .env.template, .env.dist.
// Exit code 2 blocks the tool call and feeds stderr back to Claude.

const SAFE_SUFFIX = /\.(example|sample|template|dist)$/i;
const ENV_FILE = /^\.env(\..+)?$/i;

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0); // Malformed payload: do not block
  }

  const { tool_name: tool, tool_input: args = {} } = input;

  const isEnvFile = (name) => {
    const base = name.split("/").pop();
    return ENV_FILE.test(base) && !SAFE_SUFFIX.test(base);
  };

  // Path-like arguments (Read, Grep, Glob)
  const paths = [args.file_path, args.path, args.glob, args.notebook_path];
  if (tool === "Glob") paths.push(args.pattern);

  let blocked = paths.filter((p) => typeof p === "string").some((p) =>
    // A glob such as ".env*" or "**/.env.local" targets env files too
    isEnvFile(p) || /(^|\/)\.env(\*|\.\*)/.test(p),
  );

  // Bash: look at every token of the command line. Heredoc bodies and
  // commit messages are plain text, not file arguments, so drop them first.
  if (!blocked && tool === "Bash" && typeof args.command === "string") {
    const command = args.command
      .replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2(?=\s|$)/g, " ")
      .replace(/(?:-m|--message)(?:\s+|=)(?:"[^"]*"|'[^']*')/g, " ");
    blocked = command
      .split(/[\s;|&<>()"'`=]+/)
      .filter(Boolean)
      .some((token) => isEnvFile(token) || /(^|\/)\.env(\*|\.\*)/.test(token));
  }

  if (blocked) {
    console.error(
      "Blocked: reading .env files is not allowed because they contain secrets. " +
        "Use .env.example for variable names, or ask the user for the value.",
    );
    process.exit(2);
  }
  process.exit(0);
});
