import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Artefactos de Remotion. `video/` es un subproyecto aparte (su propio
    // package.json y su propio tsconfig, ya excluido del tsconfig raíz) y al
    // renderizar deja bundles compilados aquí dentro. Sin esta línea ESLint los
    // analiza como si fueran fuente y el lint pasa de 2 errores a 54.
    "video/build/**",
    "video/out/**",
  ]),
]);

export default eslintConfig;
