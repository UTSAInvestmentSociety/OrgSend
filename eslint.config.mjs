import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      // Build and generated files
      ".next/**/*",
      "out/**/*",
      "build/**/*",
      "dist/**/*",

      // Generated Prisma files
      "src/generated/**/*",
      "prisma/migrations/**/*",

      // Dependencies
      "node_modules/**/*",

      // Development and test files that may have relaxed rules
      "*.test.ts",
      "*.test.tsx",
      "*.spec.ts",
      "*.spec.tsx",
      "test-*.js",
      "test-*.ts",
      "jest.*.js",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",

      // Debug and development scripts
      "debug-*.js",
      "check-*.js",
      "audit-*.js",
      "setup-*.js",
      "fix-*.js",
      "integration-*.js",
    ],
    rules: {
      // Security and code quality rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      "no-var": "error",
    },
  },
];

export default eslintConfig;
