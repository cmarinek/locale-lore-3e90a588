import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const commonTSRules = {
  "@typescript-eslint/no-unused-vars": "warn",
  "prefer-const": "error",
  "no-var": "error",
  "object-shorthand": "error",
  "prefer-template": "error",
  // Temporarily disabled to deal with massive existing tech debt.
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unsafe-call": "off",
  "@typescript-eslint/no-unsafe-member-access": "off",
  "@typescript-eslint/no-unsafe-assignment": "off",
  "@typescript-eslint/no-unsafe-argument": "off",
  "@typescript-eslint/no-unsafe-return": "off",
  "@typescript-eslint/no-misused-promises": "off",
  "@typescript-eslint/no-floating-promises": "off",
  "@typescript-eslint/no-unnecessary-type-assertion": "off",
  "@typescript-eslint/no-unsafe-enum-comparison": "off",
  "@typescript-eslint/unbound-method": "off",
};

export default tseslint.config(
  { ignores: ["dist", "node_modules", ".env*", "src/integrations/supabase/types.ts"] },

  // Configuration for the React application source code
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...commonTSRules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // Configuration for TS-based tooling, tests, and backend functions
  {
    files: [
      "tailwind.config.ts",
      "playwright.config.ts",
      "vite.config.ts",
      "e2e/**/*.ts",
      "supabase/functions/**/*.ts",
    ],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        Deno: "readonly",
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: commonTSRules,
  },

  // Configuration for JS-based config files
  {
    files: ["eslint.config.js", "jest.config.js", "postcss.config.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "prefer-const": "error",
      "no-var": "error",
    }
  }
);
