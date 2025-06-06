import { defineConfig, globalIgnores } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import parser from "@angular-eslint/template-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/out-tsc",
    "**/*.svg",
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.gif",
    "**/*.webp",
    "**/*.env",
    "**/.env",
    "**/.env.*",
]), {
    files: ["**/*.ts"],

    plugins: {
        "prettier": prettierPlugin,
    },

    extends: compat.extends(
        "plugin:@angular-eslint/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ),

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
    },

    rules: {
        "prettier/prettier": "error",
    },
}, {
    files: ["**/*.html"],
    plugins: {
        "prettier": prettierPlugin,
    },
    extends: compat.extends("plugin:@angular-eslint/template/recommended"),

    languageOptions: {
        parser: parser,
    },

    rules: {
        "prettier/prettier": ["error", {
            parser: "angular",
        }],
    },
}]);