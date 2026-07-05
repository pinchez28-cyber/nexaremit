# NexaRemit exact file-by-file patch bundle

This bundle contains the full current contents of every changed file discussed in the update pass, including `package-lock.json`.

## package.json

```json
{
  "name": "nexaremit",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test:unit": "node --test",
    "test:ui": "vitest run",
    "test": "npm run test:unit && npm run test:ui"
  },
  "dependencies": {
    "@stripe/react-stripe-js": "^6.3.0",
    "@stripe/stripe-js": "^9.5.0",
    "@supabase/supabase-js": "^2.105.4",
    "@tanstack/react-query": "^5.66.0",
    "@vitejs/plugin-react": "^4.3.4",
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.5",
    "stripe": "^22.1.1",
    "vite": "^6.1.0",
    "xrpl": "^5.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.2",
    "jsdom": "^29.1.1",
    "tsx": "^4.22.4",
    "vitest": "^4.1.8"
  }
}

```

## package-lock.json

```json
{
  "name": "nexaremit",
  "version": "0.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "nexaremit",
      "version": "0.0.0",
      "dependencies": {
        "@stripe/react-stripe-js": "^6.3.0",
        "@stripe/stripe-js": "^9.5.0",
        "@supabase/supabase-js": "^2.105.4",
        "@tanstack/react-query": "^5.66.0",
        "@vitejs/plugin-react": "^4.3.4",
        "lucide-react": "^0.475.0",
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "react-router-dom": "^7.1.5",
        "stripe": "^22.1.1",
        "vite": "^6.1.0",
        "xrpl": "^5.0.0"
      },
      "devDependencies": {
        "@testing-library/react": "^16.3.2",
        "jsdom": "^29.1.1",
        "tsx": "^4.22.4",
        "vitest": "^4.1.8"
      }
    },
    "node_modules/@asamuzakjp/css-color": {
      "version": "5.1.11",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-5.1.11.tgz",
      "integrity": "sha512-KVw6qIiCTUQhByfTd78h2yD1/00waTmm9uy/R7Ck/ctUyAPj+AEDLkQIdJW0T8+qGgj3j5bpNKK7Q3G+LedJWg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@asamuzakjp/generational-cache": "^1.0.1",
        "@csstools/css-calc": "^3.2.0",
        "@csstools/css-color-parser": "^4.1.0",
        "@csstools/css-parser-algorithms": "^4.0.0",
        "@csstools/css-tokenizer": "^4.0.0"
      },
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/@asamuzakjp/dom-selector": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-7.1.1.tgz",
      "integrity": "sha512-67RZDnYRc8H/8MLDgQCDE//zoqVFwajkepHZgmXrbwybzXOEwOWGPYGmALYl9J2DOLfFPPs6kKCqmbzV895hTQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@asamuzakjp/generational-cache": "^1.0.1",
        "@asamuzakjp/nwsapi": "^2.3.9",
        "bidi-js": "^1.0.3",
        "css-tree": "^3.2.1",
        "is-potential-custom-element-name": "^1.0.1"
      },
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/@asamuzakjp/generational-cache": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/generational-cache/-/generational-cache-1.0.1.tgz",
      "integrity": "sha512-wajfB8KqzMCN2KGNFdLkReeHncd0AslUSrvHVvvYWuU8ghncRJoA50kT3zP9MVL0+9g4/67H+cdvBskj9THPzg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/@asamuzakjp/nwsapi": {
      "version": "2.3.9",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/nwsapi/-/nwsapi-2.3.9.tgz",
      "integrity": "sha512-n8GuYSrI9bF7FFZ/SjhwevlHc8xaVlb/7HmHelnc/PZXBD2ZR49NnN9sMMuDdEGPeeRQ5d0hqlSlEpgCX3Wl0Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.0",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.0.tgz",
      "integrity": "sha512-9NhCeYjq9+3uxgdtp20LSiJXJvN0FeCtNGpJxuMFZ1Kv3cWUNb6DOhJwUvcVCzKGR66cw4njwM6hrJLqgOwbcw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.28.5",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.29.3",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.3.tgz",
      "integrity": "sha512-LIVqM46zQWZhj17qA8wb4nW/ixr2y1Nw+r1etiAWgRM6U1IqP+LNhL1yg440jYZR72jCWcWbLWzIosH+uP1fqg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.29.0",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.29.0.tgz",
      "integrity": "sha512-CGOfOJqWjg2qW/Mb6zNsDm+u5vFQ8DxXfbM09z69p5Z6+mE1ikP2jUXw+j42Pf1XTYED2Rni5f95npYeuwMDQA==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.0",
        "@babel/generator": "^7.29.0",
        "@babel/helper-compilation-targets": "^7.28.6",
        "@babel/helper-module-transforms": "^7.28.6",
        "@babel/helpers": "^7.28.6",
        "@babel/parser": "^7.29.0",
        "@babel/template": "^7.28.6",
        "@babel/traverse": "^7.29.0",
        "@babel/types": "^7.29.0",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.29.1",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.29.1.tgz",
      "integrity": "sha512-qsaF+9Qcm2Qv8SRIMMscAvG4O3lJ0F1GuMo5HR/Bp02LopNgnZBC/EkbevHFeGs4ls/oPz9v+Bsmzbkbe+0dUw==",
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.29.0",
        "@babel/types": "^7.29.0",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.28.6.tgz",
      "integrity": "sha512-JYtls3hqi15fcx5GaSNL7SCTJ2MNmjrkHXg4FSpOA/grxK8KwyZ5bubHsCq8FXCkua6xhuaaBit+3b7+VZRfcA==",
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.28.6",
        "@babel/helper-validator-option": "^7.27.1",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.28.0.tgz",
      "integrity": "sha512-+W6cISkXFa1jXsDEdYA8HeevQT/FULhxzR99pxphltZcVaugps53THCeiWA8SguxxpSp3gKPiuYfSWopkLQ4hw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.28.6.tgz",
      "integrity": "sha512-l5XkZK7r7wa9LucGw9LwZyyCUscb4x37JWTPz7swwFE/0FMQAGpiWUZn8u9DzkSBWEcK25jmvubfpw2dnAMdbw==",
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.28.6",
        "@babel/types": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.28.6.tgz",
      "integrity": "sha512-67oXFAYr2cDLDVGLXTEABjdBJZ6drElUSI7WKp70NrpyISso3plG9SAGEF6y7zbha/wOzUByWWTJvEDVNIUGcA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.28.6",
        "@babel/helper-validator-identifier": "^7.28.5",
        "@babel/traverse": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-plugin-utils": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.28.6.tgz",
      "integrity": "sha512-S9gzZ/bz83GRysI7gAD4wPT/AI3uCnY+9xn+Mx/KPs2JwHJIz1W8PZkg2cqyt3RNOBM8ejcXhV6y8Og7ly/Dug==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.27.1.tgz",
      "integrity": "sha512-qMlSxKbpRlAridDExk92nSobyDdpPijUq2DW6oDnUqd0iOGxmQjyqhMIihI9+zv4LPyZdRje2cavWPbCbWm3eA==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.28.5",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.28.5.tgz",
      "integrity": "sha512-qSs4ifwzKJSV39ucNjsvc6WVHs6b7S03sOh2OcHF9UHfVPqWWALUsNUVzhSBiItjRZoLHx7nIarVjqKVusUZ1Q==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.27.1.tgz",
      "integrity": "sha512-YvjJow9FxbhFFKDSuFnVCe2WxXk1zWc22fFePVNEaWJEu8IrZVlda6N0uHwzZrUM1il7NC9Mlp4MaJYbYd9JSg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.29.2",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.2.tgz",
      "integrity": "sha512-HoGuUs4sCZNezVEKdVcwqmZN8GoHirLUcLaYVNBK2J0DadGtdcqgr3BCbvH8+XUo4NGjNl3VOtSjEKNzqfFgKw==",
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.28.6",
        "@babel/types": "^7.29.0"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.29.3",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.29.3.tgz",
      "integrity": "sha512-b3ctpQwp+PROvU/cttc4OYl4MzfJUWy6FZg+PMXfzmt/+39iHVF0sDfqay8TQM3JA2EUOyKcFZt75jWriQijsA==",
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.0"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-self": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-self/-/plugin-transform-react-jsx-self-7.27.1.tgz",
      "integrity": "sha512-6UzkCs+ejGdZ5mFFC/OCUrv028ab2fp1znZmCZjAOBKiBK2jXD1O+BPSfX8X2qjJ75fZBMSnQn3Rq2mrBJK2mw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-source": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-source/-/plugin-transform-react-jsx-source-7.27.1.tgz",
      "integrity": "sha512-zbwoTsBruTeKB9hSq73ha66iFeJHuaFkUbwvqElnygoNbj/jHRsSeokowZFN3CZ64IvEqcmmkVe89OPXc7ldAw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/runtime": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.29.7.tgz",
      "integrity": "sha512-Nq8OhGWiZIZGV6hLHoyAKLLcJihP/xFeBMGJoUrxTX2psI8dCifzLhZISFb+VWS3wFMRDmCGw5R+dOySCqPLhw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.28.6.tgz",
      "integrity": "sha512-YA6Ma2KsCdGb+WC6UpBVFJGXL58MDA6oyONbjyF/+5sBgxY/dwkhLogbMT2GXXyU84/IhRw/2D1Os1B/giz+BQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.28.6",
        "@babel/parser": "^7.28.6",
        "@babel/types": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.29.0",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.0.tgz",
      "integrity": "sha512-4HPiQr0X7+waHfyXPZpWPfWL/J7dcN1mx9gL6WdQVMbPnF3+ZhSMs8tCxN7oHddJE9fhNE7+lxdnlyemKfJRuA==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.0",
        "@babel/generator": "^7.29.0",
        "@babel/helper-globals": "^7.28.0",
        "@babel/parser": "^7.29.0",
        "@babel/template": "^7.28.6",
        "@babel/types": "^7.29.0",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.29.0",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.29.0.tgz",
      "integrity": "sha512-LwdZHpScM4Qz8Xw2iKSzS+cfglZzJGvofQICy7W7v4caru4EaAmyUuO6BGrbyQ2mYV11W0U8j5mBhd14dd3B0A==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-string-parser": "^7.27.1",
        "@babel/helper-validator-identifier": "^7.28.5"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@bramus/specificity": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.2.tgz",
      "integrity": "sha512-ctxtJ/eA+t+6q2++vj5j7FYX3nRu311q1wfYH3xjlLOsczhlhxAg2FWNUXhpGvAw3BWo1xBcvOV6/YLc2r5FJw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "css-tree": "^3.0.0"
      },
      "bin": {
        "specificity": "bin/cli.js"
      }
    },
    "node_modules/@csstools/color-helpers": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.0.2.tgz",
      "integrity": "sha512-LMGQLS9EuADloEFkcTBR3BwV/CGHV7zyDxVRtVDTwdI2Ca4it0CCVTT9wCkxSgokjE5Ho41hEPgb8OEUwoXr6Q==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT-0",
      "engines": {
        "node": ">=20.19.0"
      }
    },
    "node_modules/@csstools/css-calc": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.2.1.tgz",
      "integrity": "sha512-DtdHlgXh5ZkA43cwBcAm+huzgJiwx3ZTWVjBs94kwz2xKqSimDA3lBgCjphYgwgVUMWatSM0pDd8TILB1yrVVg==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=20.19.0"
      },
      "peerDependencies": {
        "@csstools/css-parser-algorithms": "^4.0.0",
        "@csstools/css-tokenizer": "^4.0.0"
      }
    },
    "node_modules/@csstools/css-color-parser": {
      "version": "4.1.7",
      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.7.tgz",
      "integrity": "sha512-CmjJFQTFQx/U/xNJhSjCQ0ilpesPmNQ8+eOUeM/+kDOVW33qsIjeOXc27vrQDdWVkf83ZSWwtg7kXSUvKDJ8cQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@csstools/color-helpers": "^6.0.2",
        "@csstools/css-calc": "^3.2.1"
      },
      "engines": {
        "node": ">=20.19.0"
      },
      "peerDependencies": {
        "@csstools/css-parser-algorithms": "^4.0.0",
        "@csstools/css-tokenizer": "^4.0.0"
      }
    },
    "node_modules/@csstools/css-parser-algorithms": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.0.tgz",
      "integrity": "sha512-+B87qS7fIG3L5h3qwJ/IFbjoVoOe/bpOdh9hAjXbvx0o8ImEmUsGXN0inFOnk2ChCFgqkkGFQ+TpM5rbhkKe4w==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=20.19.0"
      },
      "peerDependencies": {
        "@csstools/css-tokenizer": "^4.0.0"
      }
    },
    "node_modules/@csstools/css-syntax-patches-for-csstree": {
      "version": "1.1.5",
      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.5.tgz",
      "integrity": "sha512-oNjBvzLq2GPZtJphCjLqXow/cHySHSgtxvKZb7OqSZ/xHgw6NWNhfad+6AB9cLeVm6eA9d/qMll3JdEHjy6M+A==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT-0",
      "peerDependencies": {
        "css-tree": "^3.2.1"
      },
      "peerDependenciesMeta": {
        "css-tree": {
          "optional": true
        }
      }
    },
    "node_modules/@csstools/css-tokenizer": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.0.tgz",
      "integrity": "sha512-QxULHAm7cNu72w97JUNCBFODFaXpbDg+dP8b/oWFAZ2MTRppA3U00Y2L1HqaS4J6yBqxwa/Y3nMBaxVKbB/NsA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=20.19.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.25.12.tgz",
      "integrity": "sha512-Hhmwd6CInZ3dwpuGTF8fJG6yoWmsToE+vYgD4nytZVxcu1ulHpUQRAB1UJ8+N1Am3Mz4+xOByoQoSZf4D+CpkA==",
      "cpu": [
        "ppc64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.25.12.tgz",
      "integrity": "sha512-VJ+sKvNA/GE7Ccacc9Cha7bpS8nyzVv0jdVgwNDaR4gDMC/2TTRc33Ip8qrNYUcpkOHUT5OZ0bUcNNVZQ9RLlg==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.25.12.tgz",
      "integrity": "sha512-6AAmLG7zwD1Z159jCKPvAxZd4y/VTO0VkprYy+3N2FtJ8+BQWFXU+OxARIwA46c5tdD9SsKGZ/1ocqBS/gAKHg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.25.12.tgz",
      "integrity": "sha512-5jbb+2hhDHx5phYR2By8GTWEzn6I9UqR11Kwf22iKbNpYrsmRB18aX/9ivc5cabcUiAT/wM+YIZ6SG9QO6a8kg==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.25.12.tgz",
      "integrity": "sha512-N3zl+lxHCifgIlcMUP5016ESkeQjLj/959RxxNYIthIg+CQHInujFuXeWbWMgnTo4cp5XVHqFPmpyu9J65C1Yg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.25.12.tgz",
      "integrity": "sha512-HQ9ka4Kx21qHXwtlTUVbKJOAnmG1ipXhdWTmNXiPzPfWKpXqASVcWdnf2bnL73wgjNrFXAa3yYvBSd9pzfEIpA==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.25.12.tgz",
      "integrity": "sha512-gA0Bx759+7Jve03K1S0vkOu5Lg/85dou3EseOGUes8flVOGxbhDDh/iZaoek11Y8mtyKPGF3vP8XhnkDEAmzeg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.25.12.tgz",
      "integrity": "sha512-TGbO26Yw2xsHzxtbVFGEXBFH0FRAP7gtcPE7P5yP7wGy7cXK2oO7RyOhL5NLiqTlBh47XhmIUXuGciXEqYFfBQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.25.12.tgz",
      "integrity": "sha512-lPDGyC1JPDou8kGcywY0YILzWlhhnRjdof3UlcoqYmS9El818LLfJJc3PXXgZHrHCAKs/Z2SeZtDJr5MrkxtOw==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.25.12.tgz",
      "integrity": "sha512-8bwX7a8FghIgrupcxb4aUmYDLp8pX06rGh5HqDT7bB+8Rdells6mHvrFHHW2JAOPZUbnjUpKTLg6ECyzvas2AQ==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.25.12.tgz",
      "integrity": "sha512-0y9KrdVnbMM2/vG8KfU0byhUN+EFCny9+8g202gYqSSVMonbsCfLjUO+rCci7pM0WBEtz+oK/PIwHkzxkyharA==",
      "cpu": [
        "ia32"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.25.12.tgz",
      "integrity": "sha512-h///Lr5a9rib/v1GGqXVGzjL4TMvVTv+s1DPoxQdz7l/AYv6LDSxdIwzxkrPW438oUXiDtwM10o9PmwS/6Z0Ng==",
      "cpu": [
        "loong64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.25.12.tgz",
      "integrity": "sha512-iyRrM1Pzy9GFMDLsXn1iHUm18nhKnNMWscjmp4+hpafcZjrr2WbT//d20xaGljXDBYHqRcl8HnxbX6uaA/eGVw==",
      "cpu": [
        "mips64el"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.25.12.tgz",
      "integrity": "sha512-9meM/lRXxMi5PSUqEXRCtVjEZBGwB7P/D4yT8UG/mwIdze2aV4Vo6U5gD3+RsoHXKkHCfSxZKzmDssVlRj1QQA==",
      "cpu": [
        "ppc64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.25.12.tgz",
      "integrity": "sha512-Zr7KR4hgKUpWAwb1f3o5ygT04MzqVrGEGXGLnj15YQDJErYu/BGg+wmFlIDOdJp0PmB0lLvxFIOXZgFRrdjR0w==",
      "cpu": [
        "riscv64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.25.12.tgz",
      "integrity": "sha512-MsKncOcgTNvdtiISc/jZs/Zf8d0cl/t3gYWX8J9ubBnVOwlk65UIEEvgBORTiljloIWnBzLs4qhzPkJcitIzIg==",
      "cpu": [
        "s390x"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.25.12.tgz",
      "integrity": "sha512-uqZMTLr/zR/ed4jIGnwSLkaHmPjOjJvnm6TVVitAa08SLS9Z0VM8wIRx7gWbJB5/J54YuIMInDquWyYvQLZkgw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.25.12.tgz",
      "integrity": "sha512-xXwcTq4GhRM7J9A8Gv5boanHhRa/Q9KLVmcyXHCTaM4wKfIpWkdXiMog/KsnxzJ0A1+nD+zoecuzqPmCRyBGjg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.25.12.tgz",
      "integrity": "sha512-Ld5pTlzPy3YwGec4OuHh1aCVCRvOXdH8DgRjfDy/oumVovmuSzWfnSJg+VtakB9Cm0gxNO9BzWkj6mtO1FMXkQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.25.12.tgz",
      "integrity": "sha512-fF96T6KsBo/pkQI950FARU9apGNTSlZGsv1jZBAlcLL1MLjLNIWPBkj5NlSz8aAzYKg+eNqknrUJ24QBybeR5A==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.25.12.tgz",
      "integrity": "sha512-MZyXUkZHjQxUvzK7rN8DJ3SRmrVrke8ZyRusHlP+kuwqTcfWLyqMOE3sScPPyeIXN/mDJIfGXvcMqCgYKekoQw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.25.12.tgz",
      "integrity": "sha512-rm0YWsqUSRrjncSXGA7Zv78Nbnw4XL6/dzr20cyrQf7ZmRcsovpcRBdhD43Nuk3y7XIoW2OxMVvwuRvk9XdASg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.25.12.tgz",
      "integrity": "sha512-3wGSCDyuTHQUzt0nV7bocDy72r2lI33QL3gkDNGkod22EsYl04sMf0qLb8luNKTOmgF/eDEDP5BFNwoBKH441w==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.25.12.tgz",
      "integrity": "sha512-rMmLrur64A7+DKlnSuwqUdRKyd3UE7oPJZmnljqEptesKM8wx9J8gx5u0+9Pq0fQQW8vqeKebwNXdfOyP+8Bsg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.25.12.tgz",
      "integrity": "sha512-HkqnmmBoCbCwxUKKNPBixiWDGCpQGVsrQfJoVGYLPT41XWF8lHuE5N6WhVia2n4o5QK5M4tYr21827fNhi4byQ==",
      "cpu": [
        "ia32"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.25.12.tgz",
      "integrity": "sha512-alJC0uCZpTFrSL0CCDjcgleBXPnCrEAhTBILpeAp7M/OFgoqtAetfBzX0xM00MUsVVPpVjlPuMbREqnZCXaTnA==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@exodus/bytes": {
      "version": "1.15.1",
      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.15.1.tgz",
      "integrity": "sha512-S6mL0yNB/Abt9Ei4tq8gDhcczc4S3+vQ4ra7vxnAf+YHC02srtqxKKZghx2Dq6p0e66THKwR6r8N6P95wEty7Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      },
      "peerDependencies": {
        "@noble/hashes": "^1.8.0 || ^2.0.0"
      },
      "peerDependenciesMeta": {
        "@noble/hashes": {
          "optional": true
        }
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@noble/curves": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@noble/curves/-/curves-2.2.0.tgz",
      "integrity": "sha512-T/BoHgFXirb0ENSPBquzX0rcjXeM6Lo892a2jlYJkqk83LqZx0l1Of7DzlKJ6jkpvMrkHSnAcgb5JegL8SeIkQ==",
      "license": "MIT",
      "dependencies": {
        "@noble/hashes": "2.2.0"
      },
      "engines": {
        "node": ">= 20.19.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@noble/hashes": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@noble/hashes/-/hashes-2.2.0.tgz",
      "integrity": "sha512-IYqDGiTXab6FniAgnSdZwgWbomxpy9FtYvLKs7wCUs2a8RkITG+DFGO1DM9cr+E3/RgADRpFjrKVaJ1z6sjtEg==",
      "license": "MIT",
      "engines": {
        "node": ">= 20.19.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.0-beta.27",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.0-beta.27.tgz",
      "integrity": "sha512-+d0F4MKMCbeVUJwG96uQ4SgAznZNSq93I3V+9NHA4OpvqG8mRCpGdKmK8l/dl02h2CCDHwW2FqilnTyDcAnqjA==",
      "license": "MIT"
    },
    "node_modules/@rollup/rollup-android-arm-eabi": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.60.4.tgz",
      "integrity": "sha512-F5QXMSiFebS9hKZj02XhWLLnRpJ3B3AROP0tWbFBSj+6kCbg5m9j5JoHKd4mmSVy5mS/IMQloYgYxCuJC0fxEQ==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-android-arm64": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.60.4.tgz",
      "integrity": "sha512-GxxTKApUpzRhof7poWvCJHRF51C67u1R7D6DiluBE8wKU1u5GWE8t+v81JvJYtbawoBFX1hLv5Ei4eVjkWokaw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-darwin-arm64": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.60.4.tgz",
      "integrity": "sha512-tua0TaJxMOB1R0V0RS1jFZ/RpURFDJIOR2A6jWwQeawuFyS4gBW+rntLRaQd0EQ4bd6Vp44Z2rXW+YYDBsj6IA==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-darwin-x64": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.60.4.tgz",
      "integrity": "sha512-CSKq7MsP+5PFIcydhAiR1K0UhEI1A2jWXVKHPCBZ151yOutENwvnPocgVHkivu2kviURtCEB6zUQw0vs8RrhMg==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-arm64": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.60.4.tgz",
      "integrity": "sha512-+O8OkVdyvXMtJEciu2wS/pzm1IxntEEQx3z5TAVy4l32G0etZn+RsA48ARRrFm6Ri8fvqPQfgrvNxSjKAbnd3g==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-x64": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.60.4.tgz",
      "integrity": "sha512-Iw3oMskH3AfNuhU0MSN7vNbdi4me/NiYo2azqPz/Le16zHSa+3RRmliCMWWQmh4lcndccU40xcJuTYJZxNo/lw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.60.4.tgz",
      "integrity": "sha512-EIPRXTVQpHyF8WOo219AD2yEltPehLTcTMz2fn6JsatLYSzQf00hj3rulF+yauOlF9/FtM2WpkT/hJh/KJFGhA==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.60.4.tgz",
      "integrity": "sha512-J3Yh9PzzF1Ovah2At+lHiGQdsYgArxBbXv/zHfSyaiFQEqvNv7DcW98pCrmdjCZBrqBiKrKKe2V+aaSGWuBe/w==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-gnu": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.60.4.tgz",
      "integrity": "sha512-BFDEZMYfUvLn37ONE1yMBojPxnMlTFsdyNoqncT0qFq1mAfllL+ATMMJd8TeuVMiX84s1KbcxcZbXInmcO2mRg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-musl": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.60.4.tgz",
      "integrity": "sha512-pc9EYOSlOgdQ2uPl1o9PF6/kLSgaUosia7gOuS8mB69IxJvlclko1MECXysjs5ryez1/5zjYqx3+xYU0TU6R1A==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-gnu": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.60.4.tgz",
      "integrity": "sha512-NxnomyxYerDh5n4iLrNa+sH+Z+U4BMEE46V2PgQ/hoB909i8gV1M5wPojWg9fk1jWpO3IQnOs20K4wyZuFLEFQ==",
      "cpu": [
        "loong64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-musl": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.60.4.tgz",
      "integrity": "sha512-nbJnQ8a3z1mtmrwImCYhc6BGpThAyYVRQxw9uKSKG4wR6aAYno9sVjJ0zaZcW9BPJX1GbrDPf+SvdWjgTuDmnw==",
      "cpu": [
        "loong64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.60.4.tgz",
      "integrity": "sha512-2EU6acNrQLd8tYvo/LXW535wupT3m6fo7HKo6lr7ktQoItxTyOL1ZCR/GfGCuXl2vR+zmfI6eRXkSemafv+iVg==",
      "cpu": [
        "ppc64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-musl": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.60.4.tgz",
      "integrity": "sha512-WeBtoMuaMxiiIrO2IYP3xs6GMWkJP2C0EoT8beTLkUPmzV1i/UcOSVw1d5r9KBODtHKilG5yFxsGRnBbK3wJ4A==",
      "cpu": [
        "ppc64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.60.4.tgz",
      "integrity": "sha512-FJHFfqpKUI3A10WrWKiFbBZ7yVbGT4q4B5o1qKFFojqpaYoh9LrQgqWCmmcxQzVSXYtyB5bzkXrYzlHTs21MYA==",
      "cpu": [
        "riscv64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-musl": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.60.4.tgz",
      "integrity": "sha512-mcEl6CUT5IAUmQf1m9FYSmVqCJlpQ8r8eyftFUHG8i9OhY7BkBXSUdnLH5DOf0wCOjcP9v/QO93zpmF1SptCCw==",
      "cpu": [
        "riscv64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-s390x-gnu": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.60.4.tgz",
      "integrity": "sha512-ynt3JxVd2w2buzoKDWIyiV1pJW93xlQic1THVLXilz429oijRpSHivZAgp65KBu+cMcgf1eVVjdnTLvPxgCuoQ==",
      "cpu": [
        "s390x"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-gnu": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.60.4.tgz",
      "integrity": "sha512-Boiz5+MsaROEWDf+GGEwF8VMHGhlUoQMtIPjOgA5fv4osupqTVnJteQNKJwUcnUog2G55jYXH7KZFFiJe0TEzQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-musl": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.60.4.tgz",
      "integrity": "sha512-+qfSY27qIrFfI/Hom04KYFw3GKZSGU4lXus51wsb5EuySfFlWRwjkKWoE9emgRw/ukoT4Udsj4W/+xxG8VbPKg==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-openbsd-x64": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.60.4.tgz",
      "integrity": "sha512-VpTfOPHgVXEBeeR8hZ2O0F3aSso+JDWqTWmTmzcQKted54IAdUVbxE+j/MVxUsKa8L20HJhv3vUezVPoquqWjA==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ]
    },
    "node_modules/@rollup/rollup-openharmony-arm64": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.60.4.tgz",
      "integrity": "sha512-IPOsh5aRYuLv/nkU51X10Bf75Bsf6+gZdx1X+QP5QM6lIJFHHqbHLG0uJn/hWthzo13UAc2umiUorqZy3axoZg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ]
    },
    "node_modules/@rollup/rollup-win32-arm64-msvc": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.60.4.tgz",
      "integrity": "sha512-4QzE9E81OohJ/HKzHhsqU+zcYYojVOXlFMs1DdyMT6qXl/niOH7AVElmmEdUNHHS/oRkc++d5k6Vy85zFs0DEw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-ia32-msvc": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.60.4.tgz",
      "integrity": "sha512-zTPgT1YuHHcd+Tmx7h8aml0FWFVelV5N54oHow9SLj+GfoDy/huQ+UV396N/C7KpMDMiPspRktzM1/0r1usYEA==",
      "cpu": [
        "ia32"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-gnu": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.60.4.tgz",
      "integrity": "sha512-DRS4G7mi9lJxqEDezIkKCaUIKCrLUUDCUaCsTPCi/rtqaC6D/jjwslMQyiDU50Ka0JKpeXeRBFBAXwArY52vBw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-msvc": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.60.4.tgz",
      "integrity": "sha512-QVTUovf40zgTqlFVrKA1uXMVvU2QWEFWfAH8Wdc48IxLvrJMQVMBRjuQyUpzZCDkakImib9eVazbWlC6ksWtJw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@scure/base": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@scure/base/-/base-2.2.0.tgz",
      "integrity": "sha512-b8XEupJibegiXV+tDUseI8oLQc8ei3d/4Jkb2RpbHh3MfE054ov3uIz2dhFkB3FI8iwYkEh0gGCApkrYggkPNg==",
      "license": "MIT",
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@scure/bip32": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@scure/bip32/-/bip32-2.2.0.tgz",
      "integrity": "sha512-zFr7t2F+a9+5tB7QbarF2HQNYrgjCNaoLAupZdKkrFMYMozJf5zqH2WJCQibMzm1qQ0QogrxVGO3qXfQDYMaQg==",
      "license": "MIT",
      "dependencies": {
        "@noble/curves": "2.2.0",
        "@noble/hashes": "2.2.0",
        "@scure/base": "2.2.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@scure/bip39": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@scure/bip39/-/bip39-2.2.0.tgz",
      "integrity": "sha512-T/Bj/YvYMNkIPq6EENO6/rcs2e7qTNuyoUXf0KBFDmp0ZDu0H2X4Lq6yC3i0c8PcWkov5EbW+yQZZbdMmk154A==",
      "license": "MIT",
      "dependencies": {
        "@noble/hashes": "2.2.0",
        "@scure/base": "2.2.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@standard-schema/spec": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.1.0.tgz",
      "integrity": "sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@stripe/react-stripe-js": {
      "version": "6.3.0",
      "resolved": "https://registry.npmjs.org/@stripe/react-stripe-js/-/react-stripe-js-6.3.0.tgz",
      "integrity": "sha512-N1FTRNCMKySElDz1lAsf/m6Oy5vcl6LRVXcW29t0Y3U3HYOAqCBlk6nuDsR2x7SAuaXkVCjnpCqrNbA/7l74jg==",
      "license": "MIT",
      "dependencies": {
        "prop-types": "^15.7.2"
      },
      "peerDependencies": {
        "@stripe/stripe-js": ">=9.3.1 <10.0.0",
        "react": ">=16.8.0 <20.0.0",
        "react-dom": ">=16.8.0 <20.0.0"
      }
    },
    "node_modules/@stripe/stripe-js": {
      "version": "9.5.0",
      "resolved": "https://registry.npmjs.org/@stripe/stripe-js/-/stripe-js-9.5.0.tgz",
      "integrity": "sha512-dTQWkJRw5lhcQipPuw6qZRBK2zY5eWWZ1Srw9mSjhIXSLdsNYO3uaIV+YRMkI0/tB/D7yQdHYStrcZrbeHI5Jg==",
      "license": "MIT",
      "engines": {
        "node": ">=12.16"
      }
    },
    "node_modules/@supabase/auth-js": {
      "version": "2.105.4",
      "resolved": "https://registry.npmjs.org/@supabase/auth-js/-/auth-js-2.105.4.tgz",
      "integrity": "sha512-Ejfa37M5xoIwoxVebxRahnwubPo8g22qkXQ4p50+N9MIvU9UZoN+A8dwVPtczzGf8oV/YXN80ZPxK4aWXuSN/A==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/functions-js": {
      "version": "2.105.4",
      "resolved": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.105.4.tgz",
      "integrity": "sha512-JVNKbBft3Qkja+WlGaE026AJ2AH9K0UTsxsfvEIHgd4zFrBor4BYRCrYFrv9IDsvVqkF72wKDsODJl5GY/C4tA==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/phoenix": {
      "version": "0.4.2",
      "resolved": "https://registry.npmjs.org/@supabase/phoenix/-/phoenix-0.4.2.tgz",
      "integrity": "sha512-YSAGnmDAfuleFCVt3CeurQZAhxRfXWeZIIkwp7NhYzQ1UwW6ePSnzsFAiUm/mbCkfoCf70QQHKW/K6RKh52a4A==",
      "license": "MIT"
    },
    "node_modules/@supabase/postgrest-js": {
      "version": "2.105.4",
      "resolved": "https://registry.npmjs.org/@supabase/postgrest-js/-/postgrest-js-2.105.4.tgz",
      "integrity": "sha512-SppIyLo/kTwIlz1qpv2HN1EQqBg0GVktrDDFsXygYROha3MgVn4rT7p5EjFHFqXQm2rdRGb/BI7bc+jr10m91w==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/realtime-js": {
      "version": "2.105.4",
      "resolved": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.105.4.tgz",
      "integrity": "sha512-6ov6c59+8D9h7q4M4Gy/uDJlC0Akxl9/714Y+6vJ+Sijuc16TS/p5DwhfRCLNcIhNiej1gEt+CQUwsjiPt4PxQ==",
      "license": "MIT",
      "dependencies": {
        "@supabase/phoenix": "^0.4.2",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/storage-js": {
      "version": "2.105.4",
      "resolved": "https://registry.npmjs.org/@supabase/storage-js/-/storage-js-2.105.4.tgz",
      "integrity": "sha512-Jx+pzMP1Whjof2PWHoVBUA75/p7PQE9CqKBzn1oXVyJDOggMLSH2OzVWwsXYaxEpdC1K/KltwmOX44nL3LHl9g==",
      "license": "MIT",
      "dependencies": {
        "iceberg-js": "^0.8.1",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/supabase-js": {
      "version": "2.105.4",
      "resolved": "https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.105.4.tgz",
      "integrity": "sha512-cEnx+k49knU+qdIP7rXwR6fqEXPHZs+74xFK1R0S8MgQ7v9tbePVdGxvO03n3bPympMdJWVLadARBfU4TgNHCQ==",
      "license": "MIT",
      "dependencies": {
        "@supabase/auth-js": "2.105.4",
        "@supabase/functions-js": "2.105.4",
        "@supabase/postgrest-js": "2.105.4",
        "@supabase/realtime-js": "2.105.4",
        "@supabase/storage-js": "2.105.4"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@tanstack/query-core": {
      "version": "5.100.10",
      "resolved": "https://registry.npmjs.org/@tanstack/query-core/-/query-core-5.100.10.tgz",
      "integrity": "sha512-8UR0yJR+GiQ40m3lPhUr0xbfAupe6GSQiksSBSa9SM2NjezFyxXCIA69/lz8cSoNKZLrw1/PktIyQBJcVeMi3w==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      }
    },
    "node_modules/@tanstack/react-query": {
      "version": "5.100.10",
      "resolved": "https://registry.npmjs.org/@tanstack/react-query/-/react-query-5.100.10.tgz",
      "integrity": "sha512-FLaZf2RCrA/Zgp4aiu5tG3TyasTRO7aZ99skxQpr3Hg/zXOhu6yq5FZCYQ/tRaJtM9ylnoK8tFK7PolXQadv6Q==",
      "license": "MIT",
      "dependencies": {
        "@tanstack/query-core": "5.100.10"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      },
      "peerDependencies": {
        "react": "^18 || ^19"
      }
    },
    "node_modules/@testing-library/dom": {
      "version": "10.4.1",
      "resolved": "https://registry.npmjs.org/@testing-library/dom/-/dom-10.4.1.tgz",
      "integrity": "sha512-o4PXJQidqJl82ckFaXUeoAW+XysPLauYI43Abki5hABd853iMhitooc6znOnczgbTYmEP6U6/y1ZyKAIsvMKGg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/code-frame": "^7.10.4",
        "@babel/runtime": "^7.12.5",
        "@types/aria-query": "^5.0.1",
        "aria-query": "5.3.0",
        "dom-accessibility-api": "^0.5.9",
        "lz-string": "^1.5.0",
        "picocolors": "1.1.1",
        "pretty-format": "^27.0.2"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@testing-library/react": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@testing-library/react/-/react-16.3.2.tgz",
      "integrity": "sha512-XU5/SytQM+ykqMnAnvB2umaJNIOsLF3PVv//1Ew4CTcpz0/BRyy/af40qqrt7SjKpDdT1saBMc42CUok5gaw+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.12.5"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@testing-library/dom": "^10.0.0",
        "@types/react": "^18.0.0 || ^19.0.0",
        "@types/react-dom": "^18.0.0 || ^19.0.0",
        "react": "^18.0.0 || ^19.0.0",
        "react-dom": "^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@types/aria-query": {
      "version": "5.0.4",
      "resolved": "https://registry.npmjs.org/@types/aria-query/-/aria-query-5.0.4.tgz",
      "integrity": "sha512-rfT93uj5s0PRL7EzccGMs3brplhcrghnDoV26NqKhCAS1hVo+WdNsPvE/yb6ilfr5hi2MEk6d5EWJTKdxg8jVw==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/@types/babel__core": {
      "version": "7.20.5",
      "resolved": "https://registry.npmjs.org/@types/babel__core/-/babel__core-7.20.5.tgz",
      "integrity": "sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==",
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.20.7",
        "@babel/types": "^7.20.7",
        "@types/babel__generator": "*",
        "@types/babel__template": "*",
        "@types/babel__traverse": "*"
      }
    },
    "node_modules/@types/babel__generator": {
      "version": "7.27.0",
      "resolved": "https://registry.npmjs.org/@types/babel__generator/-/babel__generator-7.27.0.tgz",
      "integrity": "sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==",
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__template": {
      "version": "7.4.4",
      "resolved": "https://registry.npmjs.org/@types/babel__template/-/babel__template-7.4.4.tgz",
      "integrity": "sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==",
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.1.0",
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__traverse": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@types/babel__traverse/-/babel__traverse-7.28.0.tgz",
      "integrity": "sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==",
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.28.2"
      }
    },
    "node_modules/@types/chai": {
      "version": "5.2.3",
      "resolved": "https://registry.npmjs.org/@types/chai/-/chai-5.2.3.tgz",
      "integrity": "sha512-Mw558oeA9fFbv65/y4mHtXDs9bPnFMZAL/jxdPFUpOHHIXX91mcgEHbS5Lahr+pwZFR8A7GQleRWeI6cGFC2UA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/deep-eql": "*",
        "assertion-error": "^2.0.1"
      }
    },
    "node_modules/@types/deep-eql": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/@types/deep-eql/-/deep-eql-4.0.2.tgz",
      "integrity": "sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZwQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/estree": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.8.tgz",
      "integrity": "sha512-dWHzHa2WqEXI/O1E9OjrocMTKJl2mSrEolh1Iomrv6U+JuNwaHXsXx9bLu5gG7BUWFIN0skIQJQ/L1rIex4X6w==",
      "license": "MIT"
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "4.7.0",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-4.7.0.tgz",
      "integrity": "sha512-gUu9hwfWvvEDBBmgtAowQCojwZmJ5mcLn3aufeCsitijs3+f2NsrPtlAWIR6OPiqljl96GVCUbLe0HyqIpVaoA==",
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.28.0",
        "@babel/plugin-transform-react-jsx-self": "^7.27.1",
        "@babel/plugin-transform-react-jsx-source": "^7.27.1",
        "@rolldown/pluginutils": "1.0.0-beta.27",
        "@types/babel__core": "^7.20.5",
        "react-refresh": "^0.17.0"
      },
      "engines": {
        "node": "^14.18.0 || >=16.0.0"
      },
      "peerDependencies": {
        "vite": "^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"
      }
    },
    "node_modules/@vitest/expect": {
      "version": "4.1.8",
      "resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-4.1.8.tgz",
      "integrity": "sha512-h3nDO677RDLEGlBxyQ5CW8RlMThSKSRLUePLOx09gNIWRL40edgA1GCZSZgf1W55MFAG6/Sw14KeaAnqv0NKdQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@standard-schema/spec": "^1.1.0",
        "@types/chai": "^5.2.2",
        "@vitest/spy": "4.1.8",
        "@vitest/utils": "4.1.8",
        "chai": "^6.2.2",
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/mocker": {
      "version": "4.1.8",
      "resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-4.1.8.tgz",
      "integrity": "sha512-LEiN/xe4OSIbKe9HQIp5OC24agGD9J5CnmMgsLohVVoOPWL9a2sBoR6VBx43jQZb7Kr1l4RCuyCJzcAa0+dojw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/spy": "4.1.8",
        "estree-walker": "^3.0.3",
        "magic-string": "^0.30.21"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "msw": "^2.4.9",
        "vite": "^6.0.0 || ^7.0.0 || ^8.0.0"
      },
      "peerDependenciesMeta": {
        "msw": {
          "optional": true
        },
        "vite": {
          "optional": true
        }
      }
    },
    "node_modules/@vitest/pretty-format": {
      "version": "4.1.8",
      "resolved": "https://registry.npmjs.org/@vitest/pretty-format/-/pretty-format-4.1.8.tgz",
      "integrity": "sha512-9GasEBxpZ1VYIpqHf/0+YGg121uSNwCKOJqIrTwWP/TB7DmFCiaBpNl3aPZzoLWfWkuqhbH8vJIVobZkvdo2cA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/runner": {
      "version": "4.1.8",
      "resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-4.1.8.tgz",
      "integrity": "sha512-EmVxeBAfMJvycdjd6Hm+RbFBbA9fKvo0Kx37hNpBYoYeavH3RNsBXWDooR1mgD52dCrxIIuP7UotpfiwOikvcg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/utils": "4.1.8",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/snapshot": {
      "version": "4.1.8",
      "resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-4.1.8.tgz",
      "integrity": "sha512-acfZboRmAIf05DEKcBQy33VXojFJjtUdLyo7oOmV9kebb2xdU01UknNiPuPZoJZQyO7DF0gZdTGTpeAzET9QPQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "4.1.8",
        "@vitest/utils": "4.1.8",
        "magic-string": "^0.30.21",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/spy": {
      "version": "4.1.8",
      "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-4.1.8.tgz",
      "integrity": "sha512-6EevtBp6OZOPF7bmz36HrGMeP3txgVSrgebWxHOafDXGkhIzfXK14f8KF6MuFfgXXUeHxmpD3BQxkV00/3s5mA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/utils": {
      "version": "4.1.8",
      "resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-4.1.8.tgz",
      "integrity": "sha512-uOJamYALNhfJ6iolExyQM40yIQwDqYnkKtQ5VCiSe17E33H0aQ/u+1GlRuz4LZBk6Mm3sg90G9hEbmEt37C1Zg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "4.1.8",
        "convert-source-map": "^2.0.0",
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@xrplf/isomorphic": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/@xrplf/isomorphic/-/isomorphic-1.0.2.tgz",
      "integrity": "sha512-ncZUdMXr6VlSXtdoiDi0jTH+gBrgGxwVeEidhoegII3PmyErbQsyj6e+j7acmR4LW/lvBkPkzb9QzRfJH0n3rA==",
      "license": "ISC",
      "dependencies": {
        "@noble/hashes": "^2.0.1",
        "eventemitter3": "5.0.1",
        "ws": "^8.20.0"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@xrplf/isomorphic/node_modules/eventemitter3": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/eventemitter3/-/eventemitter3-5.0.1.tgz",
      "integrity": "sha512-GWkBvjiSZK87ELrYOSESUYeVIc9mvLLf/nXalMOS5dYrgZq9o5OVkbZAVM06CVxYsCwH9BDZFPlQTlPA1j4ahA==",
      "license": "MIT"
    },
    "node_modules/@xrplf/secret-numbers": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/@xrplf/secret-numbers/-/secret-numbers-3.0.0.tgz",
      "integrity": "sha512-qpGhAZXv5noMDjCtfzq5NK0y5rrdwTVjKhhPcAYSE+a/gogBOgqdpCKyieprVVPCnmVmJnGeRoZKBAqpCGegsA==",
      "license": "ISC",
      "dependencies": {
        "@xrplf/isomorphic": "^1.0.2",
        "ripple-keypairs": "^3.0.0"
      }
    },
    "node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/ansi-styles": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-5.2.0.tgz",
      "integrity": "sha512-Cxwpt2SfTzTtXcfOlzGEee8O+c+MmUgGrNiBcXnuWxuFJHe6a5Hz7qwhwe5OgaSYI0IJvkLqWX1ASG+cJOkEiA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/aria-query": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/aria-query/-/aria-query-5.3.0.tgz",
      "integrity": "sha512-b0P0sZPKtyu8HkeRAfCq0IfURZK+SuwMjY1UXGBU27wpAiTwQAIlq56IbIO+ytk/JjS1fMR14ee5WBBfKi5J6A==",
      "dev": true,
      "license": "Apache-2.0",
      "peer": true,
      "dependencies": {
        "dequal": "^2.0.3"
      }
    },
    "node_modules/assertion-error": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/assertion-error/-/assertion-error-2.0.1.tgz",
      "integrity": "sha512-Izi8RQcffqCeNVgFigKli1ssklIbpHnCYc6AknXGYoB6grJqyeby7jv12JUQgmTAnIDnbck1uxksT4dzN3PWBA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.10.29",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.10.29.tgz",
      "integrity": "sha512-Asa2krT+XTPZINCS+2QcyS8WTkObE77RwkydwF7h6DmnKqbvlalz93m/dnphUyCa6SWSP51VgtEUf2FN+gelFQ==",
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/bidi-js": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.0.3.tgz",
      "integrity": "sha512-RKshQI1R3YQ+n9YJz2QQ147P66ELpa1FQEg20Dk8oW9t2KgLbpDLLp9aGZ7y8WHSshDknG0bknqGw5/tyCs5tw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "require-from-string": "^2.0.2"
      }
    },
    "node_modules/bignumber.js": {
      "version": "10.0.2",
      "resolved": "https://registry.npmjs.org/bignumber.js/-/bignumber.js-10.0.2.tgz",
      "integrity": "sha512-E8Wp9O06QA6lneJ4aRUXKYf/1GIomqUEmUMwtIOMtDxf1U52ffJY+y7JBk/8wRafA8qOIqLnXQGqonYXZdBnFQ==",
      "license": "MIT"
    },
    "node_modules/browserslist": {
      "version": "4.28.2",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.28.2.tgz",
      "integrity": "sha512-48xSriZYYg+8qXna9kwqjIVzuQxi+KYWp2+5nCYnYKPTr0LvD89Jqk2Or5ogxz0NUMfIjhh2lIUX/LyX9B4oIg==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.10.12",
        "caniuse-lite": "^1.0.30001782",
        "electron-to-chromium": "^1.5.328",
        "node-releases": "^2.0.36",
        "update-browserslist-db": "^1.2.3"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001792",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001792.tgz",
      "integrity": "sha512-hVLMUZFgR4JJ6ACt1uEESvQN1/dBVqPAKY0hgrV70eN3391K6juAfTjKZLKvOMsx8PxA7gsY1/tLMMTcfFLLpw==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chai": {
      "version": "6.2.2",
      "resolved": "https://registry.npmjs.org/chai/-/chai-6.2.2.tgz",
      "integrity": "sha512-NUPRluOfOiTKBKvWPtSD4PhFvWCqOi0BGStNWs57X9js7XGTprSmFoz5F0tWhR4WPjNeR9jXqdC7/UpSJTnlRg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "license": "MIT"
    },
    "node_modules/cookie": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/css-tree": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "mdn-data": "2.27.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
      }
    },
    "node_modules/data-urls": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-7.0.0.tgz",
      "integrity": "sha512-23XHcCF+coGYevirZceTVD7NdJOqVn+49IHyxgszm+JIiHLoB2TkmPtsYkNWT1pvRSGkc35L6NHs0yHkN2SumA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "whatwg-mimetype": "^5.0.0",
        "whatwg-url": "^16.0.0"
      },
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/decimal.js": {
      "version": "10.6.0",
      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/dequal": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/dequal/-/dequal-2.0.3.tgz",
      "integrity": "sha512-0je+qPKHEMohvfRTCEo3CrPG6cAzAYgmzKyxRiYSSDkS6eGJdyVJm7WaYA5ECaAD9wLB2T4EEeymA5aFVcYXCA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/dom-accessibility-api": {
      "version": "0.5.16",
      "resolved": "https://registry.npmjs.org/dom-accessibility-api/-/dom-accessibility-api-0.5.16.tgz",
      "integrity": "sha512-X7BJ2yElsnOJ30pZF4uIIDfBEVgF4XEBxL9Bxhy6dnrm5hkzqmsWHGTiHqRiITNhMyFLyAiWndIJP7Z1NTteDg==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.356",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.356.tgz",
      "integrity": "sha512-9NgFd7m5t5MCJ5rUSjJITUXAH9mEGlrlofnMf4YEr+pz6JlP7cWmTAH+JFmbPnaSW8koVTkuW7pacORWAnA5Yw==",
      "license": "ISC"
    },
    "node_modules/entities": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/entities/-/entities-8.0.0.tgz",
      "integrity": "sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=20.19.0"
      },
      "funding": {
        "url": "https://github.com/fb55/entities?sponsor=1"
      }
    },
    "node_modules/es-module-lexer": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-2.1.0.tgz",
      "integrity": "sha512-n27zTYMjYu1aj4MjCWzSP7G9r75utsaoc8m61weK+W8JMBGGQybd43GstCXZ3WNmSFtGT9wi59qQTW6mhTR5LQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/esbuild": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.25.12.tgz",
      "integrity": "sha512-bbPBYYrtZbkt6Os6FiTLCTFxvq4tt3JKall1vRwshA3fdVztsLAatFaZobhkBC8/BrPetoa0oksYoKXoG4ryJg==",
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.25.12",
        "@esbuild/android-arm": "0.25.12",
        "@esbuild/android-arm64": "0.25.12",
        "@esbuild/android-x64": "0.25.12",
        "@esbuild/darwin-arm64": "0.25.12",
        "@esbuild/darwin-x64": "0.25.12",
        "@esbuild/freebsd-arm64": "0.25.12",
        "@esbuild/freebsd-x64": "0.25.12",
        "@esbuild/linux-arm": "0.25.12",
        "@esbuild/linux-arm64": "0.25.12",
        "@esbuild/linux-ia32": "0.25.12",
        "@esbuild/linux-loong64": "0.25.12",
        "@esbuild/linux-mips64el": "0.25.12",
        "@esbuild/linux-ppc64": "0.25.12",
        "@esbuild/linux-riscv64": "0.25.12",
        "@esbuild/linux-s390x": "0.25.12",
        "@esbuild/linux-x64": "0.25.12",
        "@esbuild/netbsd-arm64": "0.25.12",
        "@esbuild/netbsd-x64": "0.25.12",
        "@esbuild/openbsd-arm64": "0.25.12",
        "@esbuild/openbsd-x64": "0.25.12",
        "@esbuild/openharmony-arm64": "0.25.12",
        "@esbuild/sunos-x64": "0.25.12",
        "@esbuild/win32-arm64": "0.25.12",
        "@esbuild/win32-ia32": "0.25.12",
        "@esbuild/win32-x64": "0.25.12"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/estree-walker": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-3.0.3.tgz",
      "integrity": "sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "^1.0.0"
      }
    },
    "node_modules/eventemitter3": {
      "version": "5.0.4",
      "resolved": "https://registry.npmjs.org/eventemitter3/-/eventemitter3-5.0.4.tgz",
      "integrity": "sha512-mlsTRyGaPBjPedk6Bvw+aqbsXDtoAyAzm5MO7JgU+yVRyMQ5O8bD4Kcci7BS85f93veegeCPkL8R4GLClnjLFw==",
      "license": "MIT"
    },
    "node_modules/expect-type": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/expect-type/-/expect-type-1.3.0.tgz",
      "integrity": "sha512-knvyeauYhqjOYvQ66MznSMs83wmHrCycNEN6Ao+2AeYEfxUIkuiVxdEa1qlGEPK+We3n0THiDciYSsCcgW/DoA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.0.0"
      }
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "license": "MIT"
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/html-encoding-sniffer": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-6.0.0.tgz",
      "integrity": "sha512-CV9TW3Y3f8/wT0BRFc1/KAVQ3TUHiXmaAb6VW9vtiMFf7SLoMd1PdAc4W3KFOFETBJUb90KatHqlsZMWV+R9Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@exodus/bytes": "^1.6.0"
      },
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/iceberg-js": {
      "version": "0.8.1",
      "resolved": "https://registry.npmjs.org/iceberg-js/-/iceberg-js-0.8.1.tgz",
      "integrity": "sha512-1dhVQZXhcHje7798IVM+xoo/1ZdVfzOMIc8/rgVSijRK38EDqOJoGula9N/8ZI5RD8QTxNQtK/Gozpr+qUqRRA==",
      "license": "MIT",
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/is-potential-custom-element-name": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "license": "MIT"
    },
    "node_modules/jsdom": {
      "version": "29.1.1",
      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz",
      "integrity": "sha512-ECi4Fi2f7BdJtUKTflYRTiaMxIB0O6zfR1fX0GXpUrf6flp8QIYn1UT20YQqdSOfk2dfkCwS8LAFoJDEppNK5Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@asamuzakjp/css-color": "^5.1.11",
        "@asamuzakjp/dom-selector": "^7.1.1",
        "@bramus/specificity": "^2.4.2",
        "@csstools/css-syntax-patches-for-csstree": "^1.1.3",
        "@exodus/bytes": "^1.15.0",
        "css-tree": "^3.2.1",
        "data-urls": "^7.0.0",
        "decimal.js": "^10.6.0",
        "html-encoding-sniffer": "^6.0.0",
        "is-potential-custom-element-name": "^1.0.1",
        "lru-cache": "^11.3.5",
        "parse5": "^8.0.1",
        "saxes": "^6.0.0",
        "symbol-tree": "^3.2.4",
        "tough-cookie": "^6.0.1",
        "undici": "^7.25.0",
        "w3c-xmlserializer": "^5.0.0",
        "webidl-conversions": "^8.0.1",
        "whatwg-mimetype": "^5.0.0",
        "whatwg-url": "^16.0.1",
        "xml-name-validator": "^5.0.0"
      },
      "engines": {
        "node": "^20.19.0 || ^22.13.0 || >=24.0.0"
      },
      "peerDependencies": {
        "canvas": "^3.0.0"
      },
      "peerDependenciesMeta": {
        "canvas": {
          "optional": true
        }
      }
    },
    "node_modules/jsdom/node_modules/lru-cache": {
      "version": "11.5.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.1.tgz",
      "integrity": "sha512-RPimw/7aMdv2oqRrxKwvZXcPfwBrn/JZ2xYcY9Hus/6LaS3VOAKVWKWgNLCFSiOm1ESXinjsDlidVU7JlnCN2A==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": "20 || >=22"
      }
    },
    "node_modules/jsesc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
      "license": "MIT",
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "license": "MIT",
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "license": "ISC",
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/lucide-react": {
      "version": "0.475.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-0.475.0.tgz",
      "integrity": "sha512-NJzvVu1HwFVeZ+Gwq2q00KygM1aBhy/ZrhY9FsAgJtpB+E4R7uxRk9M2iKvHa6/vNxZydIB59htha4c2vvwvVg==",
      "license": "ISC",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/lz-string": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/lz-string/-/lz-string-1.5.0.tgz",
      "integrity": "sha512-h5bgJWpxJNswbU7qCrV0tIKQCaS3blPDrqKWx+QxzuzL1zGUzij9XCWLrSLsJPu5t+eWA/ycetzYAO5IOMcWAQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "bin": {
        "lz-string": "bin/bin.js"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/mdn-data": {
      "version": "2.27.1",
      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
      "dev": true,
      "license": "CC0-1.0"
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/nanoid": {
      "version": "3.3.12",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.12.tgz",
      "integrity": "sha512-ZB9RH/39qpq5Vu6Y+NmUaFhQR6pp+M2Xt76XBnEwDaGcVAqhlvxrl3B2bKS5D3NH3QR76v3aSrKaF/Kiy7lEtQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.44",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.44.tgz",
      "integrity": "sha512-5WUyunoPMsvvEhS8AxHtRzP+oA8UCkJ7YRxatWKjngndhDGLiqEVAQKWjFAiAiuL8zMRGzGSJxFnLetoa43qGQ==",
      "license": "MIT"
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/obug": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/obug/-/obug-2.1.3.tgz",
      "integrity": "sha512-9miFgM2OFba7hB+pRgvtV84pYTBaoTHohvmIgiRt6dRIzbwEOIaNaP+dIlGs2fNFoB0SeISs0Jz5WFVRid6Xyg==",
      "dev": true,
      "funding": [
        "https://github.com/sponsors/sxzz",
        "https://opencollective.com/debug"
      ],
      "license": "MIT",
      "engines": {
        "node": ">=12.20.0"
      }
    },
    "node_modules/parse5": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "entities": "^8.0.0"
      },
      "funding": {
        "url": "https://github.com/inikulin/parse5?sponsor=1"
      }
    },
    "node_modules/pathe": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
      "integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.4.tgz",
      "integrity": "sha512-QP88BAKvMam/3NxH6vj2o21R6MjxZUAd6nlwAS/pnGvN9IVLocLHxGYIzFhg6fUQ+5th6P4dv4eW9jX3DSIj7A==",
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.14",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.14.tgz",
      "integrity": "sha512-SoSL4+OSEtR99LHFZQiJLkT59C5B1amGO1NzTwj7TT1qCUgUO6hxOvzkOYxD+vMrXBM3XJIKzokoERdqQq/Zmg==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.11",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/pretty-format": {
      "version": "27.5.1",
      "resolved": "https://registry.npmjs.org/pretty-format/-/pretty-format-27.5.1.tgz",
      "integrity": "sha512-Qb1gy5OrP5+zDf2Bvnzdl3jsTf1qXVMazbvCoKhtKqVs4/YK4ozX4gKQJJVyNe+cajNPn0KoC0MC3FUmaHWEmQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "ansi-regex": "^5.0.1",
        "ansi-styles": "^5.0.0",
        "react-is": "^17.0.1"
      },
      "engines": {
        "node": "^10.13.0 || ^12.13.0 || ^14.15.0 || >=15.0.0"
      }
    },
    "node_modules/pretty-format/node_modules/react-is": {
      "version": "17.0.2",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-17.0.2.tgz",
      "integrity": "sha512-w2GsyukL62IJnlaff/nRegPQR94C/XXamvMWmSHRJ4y7Ts/4ocGRmTHvOs8PSE6pB3dWOrD/nueuU5sduBsQ4w==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/prop-types": {
      "version": "15.8.1",
      "resolved": "https://registry.npmjs.org/prop-types/-/prop-types-15.8.1.tgz",
      "integrity": "sha512-oj87CgZICdulUohogVAR7AjlC0327U4el4L6eAvOqCeudMDVU0NThNaV+b9Df4dXgSP1gXMTnPdhfe/2qDH5cg==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.4.0",
        "object-assign": "^4.1.1",
        "react-is": "^16.13.1"
      }
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/react": {
      "version": "19.2.6",
      "resolved": "https://registry.npmjs.org/react/-/react-19.2.6.tgz",
      "integrity": "sha512-sfWGGfavi0xr8Pg0sVsyHMAOziVYKgPLNrS7ig+ivMNb3wbCBw3KxtflsGBAwD3gYQlE/AEZsTLgToRrSCjb0Q==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.2.6",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.2.6.tgz",
      "integrity": "sha512-0prMI+hvBbPjsWnxDLxlCGyM8PN6UuWjEUCYmZhO67xIV9Xasa/r/vDnq+Xyq4Lo27g8QSbO5YzARu0D1Sps3g==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.27.0"
      },
      "peerDependencies": {
        "react": "^19.2.6"
      }
    },
    "node_modules/react-is": {
      "version": "16.13.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-16.13.1.tgz",
      "integrity": "sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==",
      "license": "MIT"
    },
    "node_modules/react-refresh": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/react-refresh/-/react-refresh-0.17.0.tgz",
      "integrity": "sha512-z6F7K9bV85EfseRCp2bzrpyQ0Gkw1uLoCel9XBVWPg/TjRj94SkJzUTGfOa4bs7iJvBWtQG0Wq7wnI0syw3EBQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-router": {
      "version": "7.15.1",
      "resolved": "https://registry.npmjs.org/react-router/-/react-router-7.15.1.tgz",
      "integrity": "sha512-R8rl9HhgikFYoPJymnUtPXWbnDb3oget6lQnfIoupbt61aT9aOhRkDsY2XRhZRyX1Z/8a5sL74fXmFNm3NRK5A==",
      "license": "MIT",
      "dependencies": {
        "cookie": "^1.0.1",
        "set-cookie-parser": "^2.6.0"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      },
      "peerDependenciesMeta": {
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/react-router-dom": {
      "version": "7.15.1",
      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-7.15.1.tgz",
      "integrity": "sha512-AzF62gjY6U9rkMq4RfP/r2EVtQ7DMfNMjyOp/flLTCrtRylLiK4wT4pSq6O8rOXZ2eXdZYJPEYe+ifomiv+Igg==",
      "license": "MIT",
      "dependencies": {
        "react-router": "7.15.1"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      }
    },
    "node_modules/require-from-string": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/ripple-address-codec": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ripple-address-codec/-/ripple-address-codec-5.0.1.tgz",
      "integrity": "sha512-JQHLKuVJV8lv9Qobmn4aUM2Dpv9WRRLKnNWfM8tN02fAbUtG8mUPsu9q9UYX8P76G4qzytEc5ZKMp/3JggNYmw==",
      "license": "ISC",
      "dependencies": {
        "@scure/base": "^2.0.0",
        "@xrplf/isomorphic": "^1.0.2"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/ripple-binary-codec": {
      "version": "2.8.0",
      "resolved": "https://registry.npmjs.org/ripple-binary-codec/-/ripple-binary-codec-2.8.0.tgz",
      "integrity": "sha512-+NKnOi3hdzjm5dDpoZLUEaYon1jahPlSGnp3YrDoNMSR09ICEqgupN5wpEkPuqJvV75PF/g+W1QUwIXVzbEe7w==",
      "license": "ISC",
      "dependencies": {
        "@xrplf/isomorphic": "^1.0.2",
        "bignumber.js": "^10.0.2",
        "ripple-address-codec": "^5.0.1"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/ripple-keypairs": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/ripple-keypairs/-/ripple-keypairs-3.0.0.tgz",
      "integrity": "sha512-lE69pD0E8hFNCqZoVXRyY45Yi8Ku+Qw7Rf1qRwPj4nOi34vp9NAuwzfiJH1IwXGWNCfEkwVfctG99CPTEoUf+g==",
      "license": "ISC",
      "dependencies": {
        "@noble/curves": "^2.0.1",
        "@xrplf/isomorphic": "^1.0.2",
        "ripple-address-codec": "^5.0.1"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/rollup": {
      "version": "4.60.4",
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.60.4.tgz",
      "integrity": "sha512-WHeFSbZYsPu3+bLoNRUuAO+wavNlocOPf3wSHTP7hcFKVnJeWsYlCDbr3mTS14FCizf9ccIxXA8sGL8zKeQN3g==",
      "license": "MIT",
      "dependencies": {
        "@types/estree": "1.0.8"
      },
      "bin": {
        "rollup": "dist/bin/rollup"
      },
      "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      },
      "optionalDependencies": {
        "@rollup/rollup-android-arm-eabi": "4.60.4",
        "@rollup/rollup-android-arm64": "4.60.4",
        "@rollup/rollup-darwin-arm64": "4.60.4",
        "@rollup/rollup-darwin-x64": "4.60.4",
        "@rollup/rollup-freebsd-arm64": "4.60.4",
        "@rollup/rollup-freebsd-x64": "4.60.4",
        "@rollup/rollup-linux-arm-gnueabihf": "4.60.4",
        "@rollup/rollup-linux-arm-musleabihf": "4.60.4",
        "@rollup/rollup-linux-arm64-gnu": "4.60.4",
        "@rollup/rollup-linux-arm64-musl": "4.60.4",
        "@rollup/rollup-linux-loong64-gnu": "4.60.4",
        "@rollup/rollup-linux-loong64-musl": "4.60.4",
        "@rollup/rollup-linux-ppc64-gnu": "4.60.4",
        "@rollup/rollup-linux-ppc64-musl": "4.60.4",
        "@rollup/rollup-linux-riscv64-gnu": "4.60.4",
        "@rollup/rollup-linux-riscv64-musl": "4.60.4",
        "@rollup/rollup-linux-s390x-gnu": "4.60.4",
        "@rollup/rollup-linux-x64-gnu": "4.60.4",
        "@rollup/rollup-linux-x64-musl": "4.60.4",
        "@rollup/rollup-openbsd-x64": "4.60.4",
        "@rollup/rollup-openharmony-arm64": "4.60.4",
        "@rollup/rollup-win32-arm64-msvc": "4.60.4",
        "@rollup/rollup-win32-ia32-msvc": "4.60.4",
        "@rollup/rollup-win32-x64-gnu": "4.60.4",
        "@rollup/rollup-win32-x64-msvc": "4.60.4",
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/saxes": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "xmlchars": "^2.2.0"
      },
      "engines": {
        "node": ">=v12.22.7"
      }
    },
    "node_modules/scheduler": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.27.0.tgz",
      "integrity": "sha512-eNv+WrVbKu1f3vbYJT/xtiF5syA5HPIMtf9IgY/nKg0sWqzAUEvqY/xm7OcZc/qafLx/iO9FgOmeSAp4v5ti/Q==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/set-cookie-parser": {
      "version": "2.7.2",
      "resolved": "https://registry.npmjs.org/set-cookie-parser/-/set-cookie-parser-2.7.2.tgz",
      "integrity": "sha512-oeM1lpU/UvhTxw+g3cIfxXHyJRc/uidd3yK1P242gzHds0udQBYzs3y8j4gCCW+ZJ7ad0yctld8RYO+bdurlvw==",
      "license": "MIT"
    },
    "node_modules/siginfo": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/siginfo/-/siginfo-2.0.0.tgz",
      "integrity": "sha512-ybx0WO1/8bSBLEWXZvEd7gMW3Sn3JFlW3TvX1nREbDLRNQNaeNN8WK0meBwPdAaOI7TtRRRJn/Es1zhrrCHu7g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/stackback": {
      "version": "0.0.2",
      "resolved": "https://registry.npmjs.org/stackback/-/stackback-0.0.2.tgz",
      "integrity": "sha512-1XMJE5fQo1jGH6Y/7ebnwPOBEkIEnT4QF32d5R1+VXdXveM0IBMJt8zfaxX1P3QhVwrYe+576+jkANtSS2mBbw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/std-env": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/std-env/-/std-env-4.1.0.tgz",
      "integrity": "sha512-Rq7ybcX2RuC55r9oaPVEW7/xu3tj8u4GeBYHBWCychFtzMIr86A7e3PPEBPT37sHStKX3+TiX/Fr/ACmJLVlLQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/stripe": {
      "version": "22.1.1",
      "resolved": "https://registry.npmjs.org/stripe/-/stripe-22.1.1.tgz",
      "integrity": "sha512-cmodIYP27tBkJ8G7DuGgWw0PFuemlFZbuF3Wwr1TrjFjUa3T7NIgCe6TVwX8BO2ynu+xtTuDGfHafNDCPt9lXA==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@types/node": ">=18"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        }
      }
    },
    "node_modules/symbol-tree": {
      "version": "3.2.4",
      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinybench": {
      "version": "2.9.0",
      "resolved": "https://registry.npmjs.org/tinybench/-/tinybench-2.9.0.tgz",
      "integrity": "sha512-0+DUvqWMValLmha6lr4kD8iAMK1HzV0/aKnCtWb9v9641TnP/MFb7Pc2bxoxQjTXAErryXVgUOfv2YqNllqGeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinyexec": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/tinyexec/-/tinyexec-1.2.4.tgz",
      "integrity": "sha512-SHf/r48b7vOrjve9PxJo3MN5v5yuyjHvdUcrQffT3WXMUfnGmHDVbC4k3sHJaJTgZCwpUplIaAo5ANtMyp3YHg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.16",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.16.tgz",
      "integrity": "sha512-pn99VhoACYR8nFHhxqix+uvsbXineAasWm5ojXoN8xEwK5Kd3/TrhNn1wByuD52UxWRLy8pu+kRMniEi6Eq9Zg==",
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinyrainbow": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/tinyrainbow/-/tinyrainbow-3.1.0.tgz",
      "integrity": "sha512-Bf+ILmBgretUrdJxzXM0SgXLZ3XfiaUuOj/IKQHuTXip+05Xn+uyEYdVg0kYDipTBcLrCVyUzAPz7QmArb0mmw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/tldts": {
      "version": "7.4.2",
      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.2.tgz",
      "integrity": "sha512-kCwffuaH8ntKtygnWe1b4BJKWiCUH30n5KfoTr6IchcXOwR7chAOFJxFrH3vjANafUYrIA4a7SDL+nn7SiR4Sw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tldts-core": "^7.4.2"
      },
      "bin": {
        "tldts": "bin/cli.js"
      }
    },
    "node_modules/tldts-core": {
      "version": "7.4.2",
      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.2.tgz",
      "integrity": "sha512-nwEyF4vl4RSJjwSjBUmOSxc3BFPoIFdlRthJ6e+5v9P3bHNsoD06UjuqMUspqp7vsEZ1beaHi1km+optiE17yA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tough-cookie": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.1.tgz",
      "integrity": "sha512-LktZQb3IeoUWB9lqR5EWTHgW/VTITCXg4D21M+lvybRVdylLrRMnqaIONLVb5mav8vM19m44HIcGq4qASeu2Qw==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "tldts": "^7.0.5"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/tr46": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-6.0.0.tgz",
      "integrity": "sha512-bLVMLPtstlZ4iMQHpFHTR7GAGj2jxi8Dg0s2h2MafAE4uSWF98FC/3MomU51iQAMf8/qDUbKWf5GxuvvVcXEhw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "punycode": "^2.3.1"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/tsx": {
      "version": "4.22.4",
      "resolved": "https://registry.npmjs.org/tsx/-/tsx-4.22.4.tgz",
      "integrity": "sha512-X8EX+XV4QR5xCsrgxaED954zTDfY8KqlDtskKEL0cHhyS/P8b4IFOvGDQpsC9Q1XnLq915wEfwwY/zzskCtmhg==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "~0.28.0"
      },
      "bin": {
        "tsx": "dist/cli.mjs"
      },
      "engines": {
        "node": ">=18.0.0"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/aix-ppc64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.1.tgz",
      "integrity": "sha512-Svl7tq8k/08+p6CXPpRjQ1fKX+1odH/BQbb48fV6fj3CWHhsoIOoY87w1oHXm0qEpkIK3ZfVgp0hed3XBXzXMQ==",
      "cpu": [
        "ppc64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/android-arm": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.1.tgz",
      "integrity": "sha512-0k2F129Xdio1TdJfzJ8sy1Q47vUD2NnwdhiAf7drUN1EBTfPf4hsFCtmMgu/6m8JSzsBrlmVjudMBQqOfG8usQ==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/android-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.1.tgz",
      "integrity": "sha512-34EGEbCIAgosYz6goLcopX6Mo7NyGv9tfwEM2/7Ce2VcVRk568iSvniGWcUXIy7wEDR1wzolcxcriFVrWYcwBg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/android-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.1.tgz",
      "integrity": "sha512-dbwY7ltSMDWsRatcRpCnES4F+im88OCUgGZjy52shC7GqHRE/cYlxNbB4Z4UpJswpcc4Qxd2oE/ufM0p61IKng==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/darwin-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.1.tgz",
      "integrity": "sha512-TZbWkQY7kvTAXbXUT7uVACR5cMHsDiSz9z7ZKAX/RTq/WJEk3QyRr0wZpNhBDX+/0CtdqUIJlOiodQcta6tY3Q==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/darwin-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.1.tgz",
      "integrity": "sha512-zfdzgK9ACBNZLI/CyHTOx81SyNbM6YXn7rxSgX97VjyiPl9W1i4Ka4fgKECEoFCKGpvBj5qArWIGgQjOwkgskQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/freebsd-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.1.tgz",
      "integrity": "sha512-wG2EA8ENdEI0qhkSZMjfqrdY+ziCYCPMmtZjjIwOmXFjmyzEHn+UUxk5of+SYsjtfs3VpnlC7QLzSI5hY/rOAw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/freebsd-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.1.tgz",
      "integrity": "sha512-i7dZ9vQgnvSCzi/rYCXNgtF/U+eKZNJBzu3eTQbRgHnM7tNSizLOkRFAl3qzVc/Op/u5YkHHa4pf/3DOYHthLQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-arm": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.1.tgz",
      "integrity": "sha512-qVXBOHQS+d5Y722GwJzJUtOLlX7km3CraOaGormF1pDtPd2C/l1SHRPgjLunLGe51Sh5YYWKMFDyV4SxgMQYTQ==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.1.tgz",
      "integrity": "sha512-yHs+0uc8+nvEAfAfxrWQKK5peSNzBc4PegcMO0EJ2hT71uA7vB8Ihg2e77R2P7SG5uYjPbHlLLmve4LLLRCf0g==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-ia32": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.1.tgz",
      "integrity": "sha512-d1z4ZuP0ajrfz/FhGT4vv278rX8KnPPJx8i5+AtK7TYbx9Le9F1hyzurZpkEyjkGa9dUGhQow4C1NmeGvqxN2w==",
      "cpu": [
        "ia32"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-loong64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.1.tgz",
      "integrity": "sha512-M5sRjUVZrkm1OAPR3dlOYzNmN+loZKGVi1VUQGrwuqLcbR6qeAz+famMhjASeH3YVKvZz+zT1jlh/keC3Rj/lg==",
      "cpu": [
        "loong64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-mips64el": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.1.tgz",
      "integrity": "sha512-mRObBZeHh2OxcBFPWE/FjylkRgZdYuiTR3vaTozquCGOH14iP9oN4x4Ge81CoIDYQrXmIxpFumJBu5MtZpnQJQ==",
      "cpu": [
        "mips64el"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-ppc64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.1.tgz",
      "integrity": "sha512-slScBsMAb3GFDcdrCgLwZtPYRoH2H/youv10QiZyRjmsP48fznoveWytSgCI/R0ZcUgpc0ZhIUEx6LHts8yrfQ==",
      "cpu": [
        "ppc64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-riscv64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.1.tgz",
      "integrity": "sha512-kw0owk1o0GFETUJyW0jc0G4Yzs0BHZn0JDZ8JRT088vjJYX777BAs1fDGxAC+q831qOs2DTC96mNsG2opdfyyQ==",
      "cpu": [
        "riscv64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-s390x": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.1.tgz",
      "integrity": "sha512-/lAIjX8aYFRByhh6L5rYtPEDRqa9de/4V/juOXcta5frjvzXO4/sqEtyytse0g3zZFuWu5cDN0MkLz2qRDD2Ag==",
      "cpu": [
        "s390x"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.1.tgz",
      "integrity": "sha512-u/anNYF2mmVOEDwLtnQ1wOr3EZ9sTNGLWrsYGYwHWzGA3Si84IOkHXlbWTD1NB+9/1lcnweYKO54uhxZydNzfA==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/netbsd-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.1.tgz",
      "integrity": "sha512-oks0DYbLwWMmaakTsCb+zL4E+aHRVLom9IJZOAthMQEPiQmydXHkziYEsGYRx0uNV/IjEKGAV941JzH02pflqw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/netbsd-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.1.tgz",
      "integrity": "sha512-aeL6lAnN89Hz43Mlh1G8ARasbuoYvSITDEx0tHh5b7jJnHcssqgjy9Yx430GDpmCa6OyrKoS0aNRjKundRizGg==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/openbsd-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.1.tgz",
      "integrity": "sha512-MEFJe5C3R8pwXdZ5Y21oo6m7ePiS0d9pWucn99O/wvyJZChoIQKrQDxKrGeW8F5+T0okTHesAmDeiHDTIq0V/Q==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/openbsd-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.1.tgz",
      "integrity": "sha512-i/ZLIOafE0Z8cI/XANJAixoJL/uRAoS2xOA3rb0xN+KK0K177cMAsQYkzHtBrtMXAKuAc7HGgcWiZ/sRC1Nxgw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/openharmony-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.1.tgz",
      "integrity": "sha512-ge+Z7EXFNt2BO1oAMsVpiQ8EwndV9i1xXerAeTIK7AtPs3bKFXQM7nlRxDSIUIMeueR1CNXxqztLzdNeReKBJg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/sunos-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.1.tgz",
      "integrity": "sha512-BEjgtECkL3vY+SaSQ6nzVfiALUeFxpawyp8Jmf5PtYhf1Ug40N1h/hxlhts+f1FvSvarEigdxS3BlSMI2PJLcQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/win32-arm64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.1.tgz",
      "integrity": "sha512-lCv9eK/H6ZJWbE7bh2nw54CZ9M2nupBxJcTsdk/QQnWkdSjKGuxmmH8/GWrlT1eMmZfn4dGcCjRte397WqfQXA==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/win32-ia32": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.1.tgz",
      "integrity": "sha512-zvb/mB2bSCoJOpoCBgYKKpX6YM6mJBlBUVUtVj41DlZJVEB6/0CKlRYxP5wWl1C1ILiCoAU5wZZ4q1P3qeS6Eg==",
      "cpu": [
        "ia32"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/win32-x64": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.1.tgz",
      "integrity": "sha512-bm4Mowrv+GXMlpWX++EcXw/iLyd1o3+bJkC2DkWXYVvgZCqD/bSj9ctZeAMC3cIxgjRVR2Dufaiu4YPxr5gW1A==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/esbuild": {
      "version": "0.28.1",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.28.1.tgz",
      "integrity": "sha512-HrJrvZv5ayxBzPfwphOoNzkzOIIlifzk0KJrGK2c8R4+LKpMtpYLQeUdjnwjWv/LZlkH2laZk+4w78pi99D4Vw==",
      "devOptional": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.28.1",
        "@esbuild/android-arm": "0.28.1",
        "@esbuild/android-arm64": "0.28.1",
        "@esbuild/android-x64": "0.28.1",
        "@esbuild/darwin-arm64": "0.28.1",
        "@esbuild/darwin-x64": "0.28.1",
        "@esbuild/freebsd-arm64": "0.28.1",
        "@esbuild/freebsd-x64": "0.28.1",
        "@esbuild/linux-arm": "0.28.1",
        "@esbuild/linux-arm64": "0.28.1",
        "@esbuild/linux-ia32": "0.28.1",
        "@esbuild/linux-loong64": "0.28.1",
        "@esbuild/linux-mips64el": "0.28.1",
        "@esbuild/linux-ppc64": "0.28.1",
        "@esbuild/linux-riscv64": "0.28.1",
        "@esbuild/linux-s390x": "0.28.1",
        "@esbuild/linux-x64": "0.28.1",
        "@esbuild/netbsd-arm64": "0.28.1",
        "@esbuild/netbsd-x64": "0.28.1",
        "@esbuild/openbsd-arm64": "0.28.1",
        "@esbuild/openbsd-x64": "0.28.1",
        "@esbuild/openharmony-arm64": "0.28.1",
        "@esbuild/sunos-x64": "0.28.1",
        "@esbuild/win32-arm64": "0.28.1",
        "@esbuild/win32-ia32": "0.28.1",
        "@esbuild/win32-x64": "0.28.1"
      }
    },
    "node_modules/undici": {
      "version": "7.27.2",
      "resolved": "https://registry.npmjs.org/undici/-/undici-7.27.2.tgz",
      "integrity": "sha512-uZsKNuzQxDMUY6M3pIMvy5tvlGmtq8XJ2oLAkfRKGNu+1VQAIvLy2xIVG5ATZl5wDXl/tddByAWCizRbOme+TA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=20.18.1"
      }
    },
    "node_modules/update-browserslist-db": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.2.3.tgz",
      "integrity": "sha512-Js0m9cx+qOgDxo0eMiFGEueWztz+d4+M3rGlmKPT+T4IS/jP4ylw3Nwpu6cpTTP8R1MAC1kF4VbdLt3ARf209w==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/vite": {
      "version": "6.4.2",
      "resolved": "https://registry.npmjs.org/vite/-/vite-6.4.2.tgz",
      "integrity": "sha512-2N/55r4JDJ4gdrCvGgINMy+HH3iRpNIz8K6SFwVsA+JbQScLiC+clmAxBgwiSPgcG9U15QmvqCGWzMbqda5zGQ==",
      "license": "MIT",
      "dependencies": {
        "esbuild": "^0.25.0",
        "fdir": "^6.4.4",
        "picomatch": "^4.0.2",
        "postcss": "^8.5.3",
        "rollup": "^4.34.9",
        "tinyglobby": "^0.2.13"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^18.0.0 || ^20.0.0 || >=22.0.0",
        "jiti": ">=1.21.0",
        "less": "*",
        "lightningcss": "^1.21.0",
        "sass": "*",
        "sass-embedded": "*",
        "stylus": "*",
        "sugarss": "*",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "lightningcss": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/vitest": {
      "version": "4.1.8",
      "resolved": "https://registry.npmjs.org/vitest/-/vitest-4.1.8.tgz",
      "integrity": "sha512-flY6ScbCIt9HThs+C5HS7jvGOB560DJtk/Z15IQROTA6zEy49Nh8T/dofWTQL+n3vswqn87sbJNiuqw1SDp5Ig==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/expect": "4.1.8",
        "@vitest/mocker": "4.1.8",
        "@vitest/pretty-format": "4.1.8",
        "@vitest/runner": "4.1.8",
        "@vitest/snapshot": "4.1.8",
        "@vitest/spy": "4.1.8",
        "@vitest/utils": "4.1.8",
        "es-module-lexer": "^2.0.0",
        "expect-type": "^1.3.0",
        "magic-string": "^0.30.21",
        "obug": "^2.1.1",
        "pathe": "^2.0.3",
        "picomatch": "^4.0.3",
        "std-env": "^4.0.0-rc.1",
        "tinybench": "^2.9.0",
        "tinyexec": "^1.0.2",
        "tinyglobby": "^0.2.15",
        "tinyrainbow": "^3.1.0",
        "vite": "^6.0.0 || ^7.0.0 || ^8.0.0",
        "why-is-node-running": "^2.3.0"
      },
      "bin": {
        "vitest": "vitest.mjs"
      },
      "engines": {
        "node": "^20.0.0 || ^22.0.0 || >=24.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "@edge-runtime/vm": "*",
        "@opentelemetry/api": "^1.9.0",
        "@types/node": "^20.0.0 || ^22.0.0 || >=24.0.0",
        "@vitest/browser-playwright": "4.1.8",
        "@vitest/browser-preview": "4.1.8",
        "@vitest/browser-webdriverio": "4.1.8",
        "@vitest/coverage-istanbul": "4.1.8",
        "@vitest/coverage-v8": "4.1.8",
        "@vitest/ui": "4.1.8",
        "happy-dom": "*",
        "jsdom": "*",
        "vite": "^6.0.0 || ^7.0.0 || ^8.0.0"
      },
      "peerDependenciesMeta": {
        "@edge-runtime/vm": {
          "optional": true
        },
        "@opentelemetry/api": {
          "optional": true
        },
        "@types/node": {
          "optional": true
        },
        "@vitest/browser-playwright": {
          "optional": true
        },
        "@vitest/browser-preview": {
          "optional": true
        },
        "@vitest/browser-webdriverio": {
          "optional": true
        },
        "@vitest/coverage-istanbul": {
          "optional": true
        },
        "@vitest/coverage-v8": {
          "optional": true
        },
        "@vitest/ui": {
          "optional": true
        },
        "happy-dom": {
          "optional": true
        },
        "jsdom": {
          "optional": true
        },
        "vite": {
          "optional": false
        }
      }
    },
    "node_modules/w3c-xmlserializer": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "xml-name-validator": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/webidl-conversions": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/whatwg-mimetype": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/whatwg-url": {
      "version": "16.0.1",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-16.0.1.tgz",
      "integrity": "sha512-1to4zXBxmXHV3IiSSEInrreIlu02vUOvrhxJJH5vcxYTBDAx51cqZiKdyTxlecdKNSjj8EcxGBxNf6Vg+945gw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@exodus/bytes": "^1.11.0",
        "tr46": "^6.0.0",
        "webidl-conversions": "^8.0.1"
      },
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      }
    },
    "node_modules/why-is-node-running": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/why-is-node-running/-/why-is-node-running-2.3.0.tgz",
      "integrity": "sha512-hUrmaWBdVDcxvYqnyh09zunKzROWjbZTiNy8dBEjkS7ehEDQibXJ7XvlmtbwuTclUiIyN+CyXQD4Vmko8fNm8w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "siginfo": "^2.0.0",
        "stackback": "0.0.2"
      },
      "bin": {
        "why-is-node-running": "cli.js"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/ws": {
      "version": "8.21.0",
      "resolved": "https://registry.npmjs.org/ws/-/ws-8.21.0.tgz",
      "integrity": "sha512-Vsp28b7DRcimFQvrqu2Wek3z1iYxDCWqHYB8Qsnk/S4RfaCQzPGPyBNuVjJV3cd6UiKtUtp6sNM77gWvzcCH+g==",
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": ">=5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/xml-name-validator": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/xmlchars": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/xrpl": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/xrpl/-/xrpl-5.0.0.tgz",
      "integrity": "sha512-YqaTFJUnhOu0mI4bsuHbKGj6w9ATcH8EIgw+gOLnh1rrlLTo5oImLQzhKJixCAPqqWOKnsY7J3jsN+l+zeEWgA==",
      "license": "ISC",
      "dependencies": {
        "@scure/bip32": "^2.0.1",
        "@scure/bip39": "^2.0.1",
        "@xrplf/isomorphic": "^1.0.2",
        "@xrplf/secret-numbers": "^3.0.0",
        "bignumber.js": "^10.0.2",
        "eventemitter3": "^5.0.1",
        "fast-json-stable-stringify": "^2.1.0",
        "ripple-address-codec": "^5.0.1",
        "ripple-binary-codec": "^2.8.0",
        "ripple-keypairs": "^3.0.0"
      },
      "engines": {
        "node": ">=20.19.0"
      }
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "license": "ISC"
    }
  }
}

```

## .env.example

```dotenv
TRANSFER_MODE=testnet

# Server-only provider credentials. Never expose these as VITE_* variables.
KYC_PROVIDER=persona-test
KYC_PROVIDER_API_KEY=
PERSONA_API_KEY=
PERSONA_TEMPLATE_ID=
PERSONA_ENVIRONMENT=test
PERSONA_WEBHOOK_SECRET=
SANCTIONS_PROVIDER=screening-rules
SANCTIONS_PROVIDER_API_KEY=
SANCTIONS_WEBHOOK_SECRET=
RISK_PROVIDER=risk-rules
RISK_PROVIDER_API_KEY=
FUNDING_PROVIDER=stripe-card
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
PLAID_SECRET=
EXCHANGE_PROVIDER=quote-engine
EXCHANGE_PROVIDER_API_KEY=
SETTLEMENT_PROVIDER=xrpl
PAYOUT_PROVIDER=payout-queue
PAYOUT_PROVIDER_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# XRPL settlement configuration
XRPL_NETWORK=testnet
XRPL_RPC_URL=
XRPL_WS_URL=
XRPL_WEBSOCKET_URL=
XRPL_NETWORK_CHECK=false
XRPL_SUBMIT_ENABLED=false
XRPL_TREASURY_ADDRESS=
XRPL_TREASURY_SEED=
XRPL_WALLET_ADDRESS=
XRPL_WALLET_SECRET=
XRPL_DESTINATION_ADDRESS=
XRPL_DESTINATION_TAG=
XRPL_ISSUER_ADDRESS=
XRPL_ISSUED_CURRENCY=USD

# Browser-visible integration labels
VITE_TRANSFER_MODE=testnet
VITE_KYC_PROVIDER=persona-test
VITE_SANCTIONS_PROVIDER=screening-rules
VITE_FUNDING_PROVIDER=stripe-card
VITE_EXCHANGE_PROVIDER=quote-engine
VITE_SETTLEMENT_PROVIDER=xrpl
VITE_XRPL_NETWORK=testnet
VITE_XRPL_ASSET=USD issued currency
VITE_PAYOUT_PROVIDER=payout-queue

```

## api/_lib/xrplSettlement.js

```js
import { Client, Wallet, xrpToDrops } from "xrpl";

const XRPL_NETWORKS = {
  testnet: {
    label: "XRPL Testnet",
    rpcUrl: "https://s.altnet.rippletest.net:51234/",
    websocketUrl: "wss://s.altnet.rippletest.net:51233/",
    explorerUrl: "https://testnet.xrpl.org"
  },
  devnet: {
    label: "XRPL Devnet",
    rpcUrl: "https://s.devnet.rippletest.net:51234/",
    websocketUrl: "wss://s.devnet.rippletest.net:51233/",
    explorerUrl: "https://devnet.xrpl.org"
  },
  mainnet: {
    label: "XRPL Mainnet",
    rpcUrl: "https://xrplcluster.com/",
    websocketUrl: "wss://xrplcluster.com/",
    explorerUrl: "https://livenet.xrpl.org"
  }
};

function getNetworkKey() {
  const requested = String(process.env.XRPL_NETWORK || "testnet").toLowerCase();
  return XRPL_NETWORKS[requested] ? requested : "testnet";
}

function getXrplConfig() {
  const networkKey = getNetworkKey();
  const baseConfig = XRPL_NETWORKS[networkKey];
  return {
    networkKey,
    label: baseConfig.label,
    rpcUrl: process.env.XRPL_RPC_URL || baseConfig.rpcUrl,
    websocketUrl: process.env.XRPL_WS_URL || process.env.XRPL_WEBSOCKET_URL || baseConfig.websocketUrl,
    explorerUrl: baseConfig.explorerUrl,
    treasuryAddress: process.env.XRPL_TREASURY_ADDRESS || process.env.XRPL_WALLET_ADDRESS || "",
    treasurySecret: process.env.XRPL_TREASURY_SEED || process.env.XRPL_WALLET_SECRET || "",
    destinationAddress: process.env.XRPL_DESTINATION_ADDRESS || "",
    issuerAddress: process.env.XRPL_ISSUER_ADDRESS || "",
    issuedCurrency: process.env.XRPL_ISSUED_CURRENCY || "USD",
    networkCheckEnabled: process.env.XRPL_NETWORK_CHECK === "true",
    submitEnabled: process.env.XRPL_SUBMIT_ENABLED === "true"
  };
}

function createTimeoutSignal(timeoutMs = 1800) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

async function checkXrplRpc(config) {
  const timeout = createTimeoutSignal();
  try {
    const response = await fetch(config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "server_info", params: [{}] }),
      signal: timeout.signal
    });
    const payload = await response.json();
    return {
      checked: true,
      ok: response.ok && !payload.error,
      ledgerVersion: payload.result?.info?.validated_ledger?.seq || payload.result?.info?.validated_ledger?.ledger_index || null,
      message: payload.error_message || payload.error || "XRPL RPC reachable"
    };
  } catch (error) {
    return {
      checked: true,
      ok: false,
      ledgerVersion: null,
      message: error.name === "AbortError" ? "XRPL RPC check timed out" : error.message
    };
  } finally {
    timeout.clear();
  }
}

function createMemoHex(value) {
  return Buffer.from(String(value), "utf8").toString("hex").toUpperCase();
}

function normalizeIssuedValue(amount) {
  const numeric = Number(amount || 0);
  return numeric.toFixed(6).replace(/0+$/, "").replace(/\.$/, "") || "0";
}

function createAssetDescriptor({ currency, receiveCurrency, config }) {
  if (currency === "XRP" || receiveCurrency === "XRP") {
    return {
      code: "XRP",
      type: "native",
      label: "Native XRP bridge asset"
    };
  }

  return {
    code: config.issuedCurrency,
    type: "issued_currency",
    issuer: config.issuerAddress || "",
    label: `${config.issuedCurrency} issued-currency bridge`
  };
}

function createPaymentDraft({ amount, currency, receiveCurrency, recipient, config, asset }) {
  const destination = recipient?.xrplAddress || config.destinationAddress || "";
  const account = config.treasuryAddress || "";
  if (!account || !destination) return null;

  const destinationTag = Number(recipient?.destinationTag ?? process.env.XRPL_DESTINATION_TAG);
  const baseDraft = {
    TransactionType: "Payment",
    Account: account,
    Destination: destination,
    Memos: [
      {
        Memo: {
          MemoData: createMemoHex("NexaRemit XRPL settlement")
        }
      }
    ]
  };

  if (Number.isInteger(destinationTag) && destinationTag >= 0) {
    baseDraft.DestinationTag = destinationTag;
  }

  if (asset.type === "native") {
    return {
      ...baseDraft,
      Amount: xrpToDrops(String(Number(amount || 0)))
    };
  }

  return {
    ...baseDraft,
    Amount: {
      currency: asset.code,
      issuer: asset.issuer,
      value: normalizeIssuedValue(amount)
    },
    SendCurrency: currency,
    ReceiveCurrency: receiveCurrency
  };
}

function createExplorerTransactionUrl(explorerUrl, transactionHash) {
  if (!explorerUrl || !transactionHash) return "";
  return `${explorerUrl}/transactions/${transactionHash}`;
}

function createSettlementStatus({ hasTreasuryAddress, hasDestinationAddress, hasIssuerForIssuedCurrency }) {
  if (hasTreasuryAddress && hasDestinationAddress && hasIssuerForIssuedCurrency) return "prepared";
  return "configuration_required";
}

async function submitSignedPayment({ config, draft }) {
  const client = new Client(config.websocketUrl);
  await client.connect();

  try {
    const wallet = Wallet.fromSeed(config.treasurySecret);
    if (config.treasuryAddress && wallet.classicAddress !== config.treasuryAddress) {
      throw new Error("XRPL treasury secret does not match XRPL_TREASURY_ADDRESS.");
    }

    const prepared = await client.autofill({
      ...draft,
      Account: wallet.classicAddress
    });
    const signed = wallet.sign(prepared);
    const submitted = await client.submitAndWait(signed.tx_blob);
    const result = submitted?.result || {};
    const meta = result.meta || {};
    const transactionResult = meta.TransactionResult || result.engine_result || "unknown";
    const ledgerIndex = meta.TransactionIndex ?? result.validated_ledger_index ?? result.ledger_index ?? null;

    return {
      transactionHash: signed.hash,
      ledgerStatus: transactionResult,
      ledgerIndex,
      rawResult: result
    };
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
    }
  }
}

export async function prepareXrplSettlement({ amount, currency, receiveCurrency, recipient }) {
  const config = getXrplConfig();
  const asset = createAssetDescriptor({ currency, receiveCurrency, config });
  const draft = createPaymentDraft({ amount, currency, receiveCurrency, recipient, config, asset });
  const health = config.networkCheckEnabled ? await checkXrplRpc(config) : { checked: false, ok: null };
  const hasTreasuryAddress = Boolean(config.treasuryAddress);
  const hasDestinationAddress = Boolean(recipient?.xrplAddress || config.destinationAddress);
  const hasIssuerForIssuedCurrency = asset.type === "native" || Boolean(config.issuerAddress);
  const status = createSettlementStatus({ hasTreasuryAddress, hasDestinationAddress, hasIssuerForIssuedCurrency });

  return {
    provider: process.env.SETTLEMENT_PROVIDER || "xrpl",
    rail: `${config.label} settlement adapter`,
    network: config.networkKey,
    endpoint: config.networkCheckEnabled ? config.rpcUrl : "network check disabled",
    websocketUrl: config.websocketUrl,
    explorerUrl: config.explorerUrl,
    asset: asset.label,
    assetCode: asset.code,
    assetType: asset.type,
    issuerConfigured: hasIssuerForIssuedCurrency,
    treasuryConfigured: hasTreasuryAddress,
    status,
    signingMode: config.submitEnabled && config.treasurySecret ? "server_managed_wallet" : "manual_or_custody_required",
    submitEnabled: config.submitEnabled,
    transactionDraft: draft,
    health,
    sourceAddress: draft?.Account || "",
    destinationAddress: draft?.Destination || "",
    warnings: [
      "Do not store XRPL wallet seeds in browser code.",
      "Use server-side secrets or a custody signer for signed ledger submission.",
      "Use issued currencies only after issuer, trustline, liquidity, and redemption procedures are verified."
    ]
  };
}

export async function submitXrplSettlement({ preparedSettlement }) {
  if (!preparedSettlement) return null;

  const config = getXrplConfig();
  const submittedAt = new Date().toISOString();

  if (preparedSettlement.status === "configuration_required") {
    return {
      ...preparedSettlement,
      status: "not_submitted",
      ledgerStatus: "configuration_required",
      transactionHash: "",
      explorerTransactionUrl: "",
      ledgerIndex: null,
      submittedAt: null,
      confirmedAt: null,
      ledgerAction: "Settlement configuration required before XRPL submission."
    };
  }

  if (!config.submitEnabled || !config.treasurySecret || !preparedSettlement.transactionDraft) {
    return {
      ...preparedSettlement,
      status: "prepared",
      ledgerStatus: "not_submitted",
      transactionHash: "",
      explorerTransactionUrl: "",
      ledgerIndex: null,
      submittedAt: null,
      confirmedAt: null,
      ledgerAction: "Settlement draft prepared. Enable XRPL_SUBMIT_ENABLED and provide treasury signing credentials to submit."
    };
  }

  const submitted = await submitSignedPayment({
    config,
    draft: preparedSettlement.transactionDraft
  });
  const explorerTransactionUrl = createExplorerTransactionUrl(preparedSettlement.explorerUrl, submitted.transactionHash);
  const confirmed = submitted.ledgerStatus === "tesSUCCESS";

  return {
    ...preparedSettlement,
    status: confirmed ? "confirmed" : "failed",
    ledgerStatus: submitted.ledgerStatus,
    transactionHash: submitted.transactionHash,
    explorerTransactionUrl,
    ledgerIndex: submitted.ledgerIndex,
    submittedAt,
    confirmedAt: confirmed ? new Date().toISOString() : null,
    ledgerAction: confirmed
      ? "Signed XRPL payment submitted and validated on-ledger."
      : "Signed XRPL payment submission returned a non-success ledger result.",
    submissionResult: submitted.rawResult
  };
}

```

## api/_lib/transferService.js

```js
import crypto from "node:crypto";
import { createAuditEvent } from "./audit.js";
import { appError } from "./http.js";
import { validatePaymentAuthorization } from "./paymentAuthorization.js";
import { providerRegistry } from "./providerRegistry.js";
import { consumeQuoteRecord, getQuoteRecordById, saveQuoteRecord } from "./quoteRecords.js";
import { assessTransferRisk } from "./riskRecords.js";
import { runTransferSafetyChecks } from "./safetyEngine.js";
import { saveTransferRecord } from "./transferRecords.js";
import { submitXrplSettlement } from "./xrplSettlement.js";

function createEntityId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function toPositiveNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function validateQuoteInput({ amount, currency, recipient }) {
  const numericAmount = toPositiveNumber(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw appError("validation_error", "Transfer amount must be greater than zero.", 400, { field: "amount" });
  }

  if (!currency || typeof currency !== "string") {
    throw appError("validation_error", "Transfer currency is required.", 400, { field: "currency" });
  }

  if (!recipient || typeof recipient !== "object") {
    throw appError("validation_error", "Recipient is required.", 400, { field: "recipient" });
  }

  if (!String(recipient.name || "").trim()) {
    throw appError("validation_error", "Recipient name is required.", 400, { field: "recipient.name" });
  }
}

function quoteExpired(expiresAt) {
  return Boolean(expiresAt) && new Date(expiresAt).getTime() < Date.now();
}

function normalizeRecipientFingerprint(recipient) {
  return JSON.stringify({
    name: String(recipient?.name || "").trim(),
    country: String(recipient?.country || recipient?.destination || "").trim(),
    method: String(recipient?.method || "").trim(),
    corridor: String(recipient?.corridor || "").trim(),
    receiveCurrency: String(recipient?.receiveCurrency || "").trim().toUpperCase()
  });
}

function assertQuoteMatchesRequest(quote, requestPayload = {}) {
  if (!requestPayload || typeof requestPayload !== "object") return;

  if (requestPayload.amount !== undefined && toPositiveNumber(requestPayload.amount) !== toPositiveNumber(quote.amount)) {
    throw appError("quote_mismatch", "Quote does not match the requested transfer amount.", 409, { field: "amount" });
  }

  if (requestPayload.currency !== undefined && String(requestPayload.currency || "").toUpperCase() !== String(quote.currency || "").toUpperCase()) {
    throw appError("quote_mismatch", "Quote does not match the requested transfer currency.", 409, { field: "currency" });
  }

  if (requestPayload.purpose !== undefined && String(requestPayload.purpose || "") !== String(quote.purpose || "")) {
    throw appError("quote_mismatch", "Quote does not match the requested transfer purpose.", 409, { field: "purpose" });
  }

  if (requestPayload.recipient !== undefined) {
    const requestRecipient = normalizeRecipientFingerprint(requestPayload.recipient);
    const quoteRecipient = normalizeRecipientFingerprint(quote.recipient);
    if (requestRecipient !== quoteRecipient) {
      throw appError("quote_mismatch", "Quote does not match the requested recipient details.", 409, { field: "recipient" });
    }
  }
}

export async function createTransferQuote({ user, amount, currency = "USD", recipient, purpose }) {
  validateQuoteInput({ amount, currency, recipient });

  const numericAmount = toPositiveNumber(amount);
  const normalizedCurrency = String(currency || "USD").toUpperCase();
  const receiveCurrency = String(recipient?.receiveCurrency || "NGN").toUpperCase();
  const [kyc, sanctions, funding, exchangeQuote, settlement, payout] = await Promise.all([
    providerRegistry.verifyKyc({ user }),
    providerRegistry.screenSanctions({ user, recipient }),
    providerRegistry.createFundingIntent({ amount: numericAmount, currency: normalizedCurrency }),
    providerRegistry.createExchangeQuote({ amount: numericAmount, currency: normalizedCurrency, receiveCurrency }),
    providerRegistry.prepareSettlement({ amount: numericAmount, currency: normalizedCurrency, receiveCurrency, recipient }),
    providerRegistry.createPayoutIntent({ recipient, receiveCurrency })
  ]);

  const risk = await assessTransferRisk({
    user,
    amount: numericAmount,
    currency: normalizedCurrency,
    recipient,
    kyc,
    sanctions
  });
  const fee = numericAmount > 0 ? Math.max(2.99, numericAmount * 0.012) : 0;
  const safety = runTransferSafetyChecks({
    user,
    amount: numericAmount,
    currency: normalizedCurrency,
    recipient,
    quote: exchangeQuote,
    kyc,
    sanctions,
    risk: risk.record
  });

  const quote = {
    id: createEntityId("quote"),
    userId: user.id,
    mode: String(process.env.TRANSFER_MODE || "testnet").trim().toLowerCase() || "testnet",
    amount: numericAmount,
    currency: normalizedCurrency,
    purpose,
    fee,
    total: numericAmount + fee,
    rate: exchangeQuote.rate,
    receiveCurrency,
    receivedAmount: exchangeQuote.receivedAmount,
    expiresAt: exchangeQuote.expiresAt,
    recipient,
    safety,
    providers: {
      kyc,
      sanctions,
      risk: risk.record,
      funding,
      exchange: exchangeQuote,
      settlement,
      payout
    },
    audit: createAuditEvent({ action: "quote.created", user, status: safety.passed ? "passed" : "blocked" })
  };

  const savedQuote = await saveQuoteRecord(quote);
  return {
    ...savedQuote.record,
    persisted: savedQuote.configured
  };
}

export async function getValidatedStoredQuote({ user, quoteId, requestPayload }) {
  if (!String(quoteId || "").trim()) {
    throw appError("validation_error", "quoteId is required.", 400, { field: "quoteId" });
  }

  const storedQuote = await getQuoteRecordById(user, quoteId);
  if (!storedQuote.record) {
    throw appError("quote_not_found", "Quote was not found for the authenticated user.", 404);
  }

  if (storedQuote.record.status === "consumed") {
    throw appError("quote_already_used", "Quote has already been used to create a transfer.", 409);
  }

  if (quoteExpired(storedQuote.record.expiresAt)) {
    throw appError("quote_expired", "Quote has expired. Please request a new quote.", 409);
  }

  assertQuoteMatchesRequest(storedQuote.record, requestPayload);
  return storedQuote.record;
}

function resolveTransferStatus({ settlement, authorization }) {
  if (settlement?.status === "confirmed") return "settlement_confirmed";
  if (settlement?.status === "submitted") return "settlement_submitted";
  if (settlement?.status === "prepared") return "settlement_prepared";
  if (settlement?.status === "failed") return "failed";
  if (settlement?.status === "not_submitted" || settlement?.status === "configuration_required") return "settlement_configuration_required";
  if (authorization?.provider === "stripe") return "payment_authorized";
  return "funding_authorized";
}

function buildSettlementEvents({ quote, authorization, settlement, createdAt }) {
  const events = [
    { label: `Quote ${quote.id} created`, at: quote.createdAt || createdAt },
    { label: `Funding authorized via ${authorization.provider}`, at: createdAt }
  ];

  if (settlement?.status === "confirmed") {
    events.push({ label: `XRPL settlement confirmed (${settlement.assetCode || settlement.asset})`, at: settlement.confirmedAt || createdAt });
  } else if (settlement?.status === "submitted") {
    events.push({ label: `XRPL settlement submitted (${settlement.assetCode || settlement.asset})`, at: settlement.submittedAt || createdAt });
  } else if (settlement?.status === "prepared") {
    events.push({ label: `XRPL settlement prepared (${settlement.assetCode || settlement.asset})`, at: createdAt });
  } else if (settlement?.status === "failed") {
    events.push({ label: `XRPL settlement failed (${settlement.assetCode || settlement.asset})`, at: settlement.submittedAt || createdAt });
  } else if (settlement?.status === "not_submitted" || settlement?.status === "configuration_required") {
    events.push({ label: "XRPL settlement requires configuration before submission", at: createdAt });
  }

  return events;
}

export async function createTransfer({ user, quoteId, paymentMethod, requestPayload }) {
  const quote = await getValidatedStoredQuote({ user, quoteId, requestPayload });

  if (!quote.safety?.passed) {
    return {
      status: "blocked",
      quote,
      transfer: null,
      audit: createAuditEvent({
        action: "transfer.blocked",
        user,
        status: "blocked",
        metadata: { failures: quote.safety?.failures || [] }
      })
    };
  }

  const authorization = await validatePaymentAuthorization({
    user,
    quote,
    paymentMethod
  });

  const createdAt = new Date().toISOString();
  const preparedSettlement = quote.providers?.settlement || null;
  const provisionalReference = `NX-${Date.now().toString().slice(-8)}`;
  const settlement = await submitXrplSettlement({
    transferReference: provisionalReference,
    quote,
    preparedSettlement
  });
  const transferId = settlement?.transactionHash ? `NX-${settlement.transactionHash.slice(0, 8)}` : provisionalReference;
  const status = resolveTransferStatus({ settlement, authorization });
  const transfer = {
    id: transferId,
    quoteId: quote.id,
    reference: transferId,
    status,
    paymentMethod: paymentMethod || null,
    fundingAuthorization: authorization,
    settlement,
    nextAction: settlement?.status === "confirmed"
      ? "XRPL settlement confirmed. Ready for payout orchestration."
      : settlement?.status === "submitted"
        ? "XRPL settlement submitted. Wait for ledger confirmation before payout."
        : settlement?.status === "prepared"
          ? "XRPL settlement prepared. A signed ledger submission step is still required before payout release."
          : settlement?.status === "failed"
            ? "XRPL submission failed. Review the ledger result before retrying."
            : settlement?.status === "not_submitted" || settlement?.status === "configuration_required"
              ? "XRPL settlement configuration is required before ledger submission."
              : quote.safety?.warnings?.length
                ? "Hold for compliance review before payout."
                : "Funding authorized. Ready for settlement review.",
    createdAt
  };

  const persistedRecord = await saveTransferRecord(user, {
    id: transfer.id,
    quoteId: quote.id,
    createdAt: transfer.createdAt,
    updatedAt: settlement?.confirmedAt || settlement?.submittedAt || transfer.createdAt,
    recipientName: quote.recipient?.name || "Unknown receiver",
    destination: `${quote.recipient?.country || quote.recipient?.destination || "Unknown"} - ${quote.recipient?.method || "Payout"}`,
    sendAmount: quote.amount,
    sendCurrency: quote.currency,
    receiveAmount: quote.receivedAmount,
    receiveCurrency: quote.receiveCurrency,
    paymentMethod: paymentMethod?.type || authorization.provider || "Not selected",
    paymentIntentId: authorization.provider === "stripe" ? authorization.reference : "",
    fundingAuthorization: authorization,
    settlement,
    status: transfer.status,
    events: [
      ...buildSettlementEvents({ quote, authorization, settlement, createdAt: transfer.createdAt }),
      {
        label: settlement?.status === "not_submitted" || settlement?.status === "configuration_required"
          ? "Settlement blocked pending XRPL configuration"
          : quote.safety?.warnings?.length
            ? "Awaiting compliance review before payout"
            : settlement?.status === "confirmed"
              ? "Ready for payout after confirmed settlement"
              : settlement?.status === "failed"
                ? "Settlement failed and requires operator review"
                : "Ready for settlement review",
        at: transfer.createdAt
      }
    ]
  });

  await consumeQuoteRecord(user, quote.id, transfer.id);

  return {
    status: transfer.status,
    quote: {
      ...quote,
      status: "consumed"
    },
    transfer: {
      ...transfer,
      record: persistedRecord.record
    },
    record: persistedRecord.record,
    persistence: {
      configured: persistedRecord.configured
    },
    audit: createAuditEvent({
      action: "transfer.created",
      user,
      status: transfer.status,
      metadata: {
        quoteId: quote.id,
        authorizationReference: authorization.reference,
        authorizationProvider: authorization.provider,
        settlementTransactionHash: settlement?.transactionHash || "",
        settlementLedgerStatus: settlement?.ledgerStatus || "",
        settlementNetwork: settlement?.network || ""
      }
    })
  };
}

```

## api/create-payment-intent.js

```js
import { appError, getRequestUser, readJson, requireMethod, sendError, sendJson } from "./_lib/http.js";
import { getValidatedStoredQuote } from "./_lib/transferService.js";
import { getStripe, toStripeAmount } from "./_lib/stripeClient.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  try {
    const body = await readJson(request);
    const user = await getRequestUser(request);

    if (!String(body.quoteId || "").trim()) {
      throw appError("validation_error", "quoteId is required before payment authorization.", 400, { field: "quoteId" });
    }

    const quote = await getValidatedStoredQuote({
      user,
      quoteId: body.quoteId,
      requestPayload: {
        amount: body.amount,
        currency: body.currency,
        purpose: body.purpose,
        recipient: body.recipient
      }
    });

    if (!quote.safety?.passed) {
      sendJson(response, 422, {
        error: "transfer_blocked",
        message: quote.safety?.failures?.join(" ") || "Transfer blocked by safety checks.",
        safety: quote.safety,
        quoteId: quote.id
      });
      return;
    }

    const stripe = getStripe();
    if (!stripe) {
      throw appError("server_misconfigured", "Stripe is not configured on the server for card authorization.", 500);
    }

    const transferMode = String(process.env.TRANSFER_MODE || "testnet").trim().toLowerCase() || "testnet";
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(quote.total, quote.currency),
      currency: quote.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        quoteId: quote.id,
        userId: user.id,
        recipientName: quote.recipient?.name || "unknown",
        transferMode
      },
      description: `NexaRemit transfer ${quote.id}`
    });

    sendJson(response, 200, {
      mode: transferMode,
      provider: "stripe",
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      quote
    });
  } catch (error) {
    sendError(response, error, "payment_intent_failed", "Unable to create payment intent.");
  }
}

```

## api/_lib/paymentAuthorization.js

```js
import { appError } from "./http.js";
import { getStripe, toStripeAmount } from "./stripeClient.js";

function getAuthorizationReference(paymentMethod) {
  return String(paymentMethod?.authorizationReference || paymentMethod?.paymentIntentId || "").trim();
}

function assertQuoteBinding(paymentMethod, quote) {
  const authorizedQuoteId = String(paymentMethod?.authorizedQuoteId || "").trim();
  if (!authorizedQuoteId) {
    throw appError(
      "funding_authorization_required",
      "Payment authorization must include the quote it was approved for.",
      422,
      { field: "paymentMethod.authorizedQuoteId" }
    );
  }

  if (authorizedQuoteId !== quote.id) {
    throw appError(
      "payment_authorization_quote_mismatch",
      "Payment authorization is tied to a different quote. Re-authorize funding for the current quote.",
      409,
      { field: "paymentMethod.authorizedQuoteId" }
    );
  }
}

function assertAuthorizationReference(paymentMethod) {
  const authorizationReference = getAuthorizationReference(paymentMethod);
  if (!authorizationReference) {
    throw appError(
      "funding_authorization_required",
      "A successful payment authorization reference is required before creating a transfer.",
      422,
      { field: "paymentMethod.authorizationReference" }
    );
  }

  return authorizationReference;
}

async function validateStripePaymentIntent({ stripe, paymentMethod, quote, user, authorizationReference }) {
  const paymentIntentId = String(paymentMethod?.paymentIntentId || authorizationReference || "").trim();
  if (!paymentIntentId) {
    throw appError(
      "funding_authorization_required",
      "A Stripe payment intent id is required before creating a card-funded transfer.",
      422,
      { field: "paymentMethod.paymentIntentId" }
    );
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!paymentIntent) {
    throw appError("payment_authorization_invalid", "Payment authorization could not be found.", 422);
  }

  const allowedStatuses = new Set(["succeeded", "requires_capture"]);
  if (!allowedStatuses.has(paymentIntent.status)) {
    throw appError(
      "payment_authorization_incomplete",
      `Payment authorization status ${paymentIntent.status} is not ready for transfer creation.`,
      422
    );
  }

  if (String(paymentIntent.metadata?.quoteId || "") !== quote.id) {
    throw appError(
      "payment_authorization_quote_mismatch",
      "Payment authorization is tied to a different quote. Re-authorize funding for the current quote.",
      409
    );
  }

  if (String(paymentIntent.metadata?.userId || "") !== String(user.id || "")) {
    throw appError("payment_authorization_user_mismatch", "Payment authorization does not belong to the authenticated user.", 403);
  }

  if (paymentIntent.amount !== toStripeAmount(quote.total, quote.currency)) {
    throw appError("payment_authorization_amount_mismatch", "Payment authorization amount does not match the locked quote total.", 409);
  }

  if (String(paymentIntent.currency || "").toUpperCase() !== String(quote.currency || "").toUpperCase()) {
    throw appError("payment_authorization_currency_mismatch", "Payment authorization currency does not match the locked quote currency.", 409);
  }

  return {
    provider: "stripe",
    reference: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency
  };
}

export async function validatePaymentAuthorization({ user, quote, paymentMethod }) {
  if (!paymentMethod || typeof paymentMethod !== "object") {
    throw appError("funding_authorization_required", "A funding method with successful payment authorization is required.", 422, {
      field: "paymentMethod"
    });
  }

  if (!String(paymentMethod.type || "").trim()) {
    throw appError("validation_error", "Payment method type is required.", 400, { field: "paymentMethod.type" });
  }

  if (paymentMethod.type !== "card") {
    throw appError(
      "funding_authorization_unavailable",
      `Funding authorization verification for ${paymentMethod.type} is not configured yet.`,
      422
    );
  }

  assertQuoteBinding(paymentMethod, quote);
  const authorizationReference = assertAuthorizationReference(paymentMethod);

  const stripe = getStripe();
  if (!stripe) {
    throw appError("server_misconfigured", "Stripe is not configured on the server for card-funded transfers.", 500);
  }

  return validateStripePaymentIntent({ stripe, paymentMethod, quote, user, authorizationReference });
}

```

## api/_lib/http.js

```js
import { getSupabaseAdminClient } from "./supabaseClient.js";

export class AppError extends Error {
  constructor(code, message, statusCode = 400, details = undefined) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function appError(code, message, statusCode = 400, details = undefined) {
  return new AppError(code, message, statusCode, details);
}

export function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

export function sendError(response, error, fallbackCode = "internal_error", fallbackMessage = "Unexpected server error.") {
  const statusCode = Number(error?.statusCode) || 500;
  const payload = {
    error: error?.code || fallbackCode,
    message: error?.message || fallbackMessage
  };

  if (error?.details !== undefined) payload.details = error.details;
  sendJson(response, statusCode, payload);
}

export function requireMethod(request, response, methods) {
  if (methods.includes(request.method)) return true;
  response.setHeader("Allow", methods.join(", "));
  sendJson(response, 405, { error: "method_not_allowed", allowed: methods });
  return false;
}

export async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    throw appError("invalid_json", "Invalid JSON body", 400);
  }
}

function isTestMode() {
  return (String(process.env.TRANSFER_MODE || "testnet").trim().toLowerCase() || "testnet") !== "live";
}

function getHeader(request, headerName) {
  return request.headers?.[headerName.toLowerCase()];
}

function getBearerToken(request) {
  const authorization = getHeader(request, "authorization");
  if (!authorization) return "";
  const [scheme, token] = authorization.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return "";
  return token.trim();
}

async function getSupabaseUserFromBearerToken(accessToken) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw appError(
      "server_misconfigured",
      "Supabase authentication is not configured on the server.",
      500
    );
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) {
    throw appError("auth_required", "Authentication required.", 401);
  }

  return data.user;
}

function getTestUserFromHeaders(request) {
  const headerUserId = String(getHeader(request, "x-nexaremit-user-id") || "testnet-user").trim();
  const sanitizedUserId = headerUserId || "testnet-user";
  const headerEmail = String(getHeader(request, "x-nexaremit-user-email") || "").trim();

  return {
    id: sanitizedUserId,
    email: headerEmail || `${sanitizedUserId}@testnet.nexaremit.local`,
    authSource: "testnet_header"
  };
}

export async function getRequestUser(request) {
  const accessToken = getBearerToken(request);
  if (accessToken) {
    const user = await getSupabaseUserFromBearerToken(accessToken);
    return {
      id: user.id,
      email: user.email || "",
      authSource: "supabase_jwt"
    };
  }

  if (isTestMode()) {
    return getTestUserFromHeaders(request);
  }

  throw appError("auth_required", "Authentication required.", 401);
}

export function requireIdempotencyKey(request) {
  const idempotencyKey = String(getHeader(request, "idempotency-key") || "").trim();
  if (idempotencyKey.length >= 8) return idempotencyKey;
  throw appError(
    "validation_error",
    "Idempotency-Key header is required and must be at least 8 characters long.",
    400,
    { field: "Idempotency-Key" }
  );
}

```

## api/_lib/transferRecords.js

```js
import { getSupabaseAdminClient } from "./supabaseClient.js";

const MAX_RECORDS = 50;
const inMemoryTransferRecords = new Map();

function nowIso() {
  return new Date().toISOString();
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeEvent(event) {
  return {
    label: String(event?.label || "Transfer event"),
    at: event?.at || nowIso()
  };
}

function normalizeFundingAuthorization(authorization) {
  if (!authorization || typeof authorization !== "object") return null;

  return {
    provider: String(authorization.provider || "").trim(),
    reference: String(authorization.reference || authorization.authorizationReference || "").trim(),
    status: String(authorization.status || "").trim(),
    amount: authorization.amount ?? null,
    currency: authorization.currency ? String(authorization.currency).toUpperCase() : null
  };
}

function normalizeSettlement(settlement) {
  if (!settlement || typeof settlement !== "object") return null;

  return {
    provider: String(settlement.provider || "").trim(),
    rail: String(settlement.rail || "").trim(),
    network: String(settlement.network || "").trim(),
    asset: String(settlement.asset || "").trim(),
    assetCode: String(settlement.assetCode || "").trim(),
    assetType: String(settlement.assetType || "").trim(),
    status: String(settlement.status || "").trim(),
    ledgerStatus: String(settlement.ledgerStatus || "").trim(),
    transactionHash: String(settlement.transactionHash || settlement.txHash || "").trim(),
    explorerTransactionUrl: String(settlement.explorerTransactionUrl || settlement.explorerUrl || "").trim(),
    ledgerIndex: settlement.ledgerIndex ?? null,
    sourceAddress: String(settlement.sourceAddress || "").trim(),
    destinationAddress: String(settlement.destinationAddress || "").trim(),
    submittedAt: settlement.submittedAt || null,
    confirmedAt: settlement.confirmedAt || null,
    ledgerAction: String(settlement.ledgerAction || "").trim(),
    warnings: Array.isArray(settlement.warnings) ? settlement.warnings.map((warning) => String(warning)) : []
  };
}

function deriveTransferStatus({ record, paymentIntentId, settlement }) {
  if (record.status) return String(record.status);
  if (settlement?.status === "confirmed") return "settlement_confirmed";
  if (settlement?.status === "submitted") return "settlement_submitted";
  if (settlement?.status === "prepared") return "settlement_prepared";
  if (settlement?.status === "not_submitted" || settlement?.status === "configuration_required") return "settlement_configuration_required";
  if (paymentIntentId) return "payment_authorized";
  if (record.fundingAuthorization) return "funding_authorized";
  return "transfer_created";
}

export function normalizeTransferRecord(input, user) {
  const record = input?.record || input || {};
  const createdAt = record.createdAt || nowIso();
  const fundingAuthorization = normalizeFundingAuthorization(record.fundingAuthorization);
  const settlement = normalizeSettlement(record.settlement);
  const paymentIntentId = record.paymentIntentId || (fundingAuthorization?.provider === "stripe" ? fundingAuthorization.reference : "");

  return {
    id: String(record.id || `NX-${Date.now().toString().slice(-8)}`),
    userId: String(user?.id || record.userId || "testnet-user"),
    createdAt,
    updatedAt: record.updatedAt || createdAt,
    recipientName: String(record.recipientName || "Unknown receiver"),
    destination: String(record.destination || "Unknown payout destination"),
    sendAmount: toNumber(record.sendAmount),
    sendCurrency: String(record.sendCurrency || "USD").toUpperCase(),
    receiveAmount: toNumber(record.receiveAmount),
    receiveCurrency: String(record.receiveCurrency || "NGN").toUpperCase(),
    paymentMethod: String(record.paymentMethod || "Not selected"),
    paymentIntentId,
    quoteId: String(record.quoteId || ""),
    fundingAuthorization,
    settlement,
    status: deriveTransferStatus({ record, paymentIntentId, settlement }),
    events: Array.isArray(record.events) && record.events.length
      ? record.events.map(normalizeEvent)
      : [{ label: "Transfer record created", at: createdAt }]
  };
}

export function toTransferRow(record) {
  return {
    id: record.id,
    user_id: record.userId,
    recipient_name: record.recipientName,
    destination: record.destination,
    send_amount: record.sendAmount,
    send_currency: record.sendCurrency,
    receive_amount: record.receiveAmount,
    receive_currency: record.receiveCurrency,
    payment_method: record.paymentMethod,
    payment_intent_id: record.paymentIntentId || null,
    settlement_provider: record.settlement?.provider || null,
    settlement_asset_code: record.settlement?.assetCode || null,
    settlement_network: record.settlement?.network || null,
    xrpl_transaction_hash: record.settlement?.transactionHash || null,
    xrpl_ledger_status: record.settlement?.ledgerStatus || null,
    xrpl_ledger_index: record.settlement?.ledgerIndex ?? null,
    xrpl_explorer_url: record.settlement?.explorerTransactionUrl || null,
    settlement_submitted_at: record.settlement?.submittedAt || null,
    settlement_confirmed_at: record.settlement?.confirmedAt || null,
    status: record.status,
    metadata: {
      events: record.events,
      quoteId: record.quoteId || null,
      fundingAuthorization: record.fundingAuthorization || null,
      settlement: record.settlement || null
    },
    created_at: record.createdAt,
    updated_at: record.updatedAt || record.createdAt
  };
}

export function fromTransferRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    recipientName: row.recipient_name,
    destination: row.destination,
    sendAmount: toNumber(row.send_amount),
    sendCurrency: row.send_currency,
    receiveAmount: toNumber(row.receive_amount),
    receiveCurrency: row.receive_currency,
    paymentMethod: row.payment_method,
    paymentIntentId: row.payment_intent_id || "",
    quoteId: String(row.metadata?.quoteId || ""),
    fundingAuthorization: normalizeFundingAuthorization(row.metadata?.fundingAuthorization),
    settlement: normalizeSettlement({
      ...(row.metadata?.settlement || {}),
      provider: row.settlement_provider || row.metadata?.settlement?.provider,
      assetCode: row.settlement_asset_code || row.metadata?.settlement?.assetCode,
      network: row.settlement_network || row.metadata?.settlement?.network,
      transactionHash: row.xrpl_transaction_hash || row.metadata?.settlement?.transactionHash,
      ledgerStatus: row.xrpl_ledger_status || row.metadata?.settlement?.ledgerStatus,
      ledgerIndex: row.xrpl_ledger_index ?? row.metadata?.settlement?.ledgerIndex ?? null,
      explorerTransactionUrl: row.xrpl_explorer_url || row.metadata?.settlement?.explorerTransactionUrl,
      submittedAt: row.settlement_submitted_at || row.metadata?.settlement?.submittedAt,
      confirmedAt: row.settlement_confirmed_at || row.metadata?.settlement?.confirmedAt
    }),
    status: row.status,
    events: Array.isArray(row.metadata?.events) ? row.metadata.events.map(normalizeEvent) : []
  };
}

export async function listTransferRecords(user) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    const records = [...inMemoryTransferRecords.values()]
      .filter((record) => record.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, MAX_RECORDS);
    return { configured: false, records };
  }

  const { data, error } = await supabase
    .from("transfer_records")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(MAX_RECORDS);

  if (error) throw error;
  return { configured: true, records: data.map(fromTransferRow) };
}

export async function getTransferRecordById(user, id) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { configured: false, record: inMemoryTransferRecords.get(`${user.id}:${id}`) || null };

  const { data, error } = await supabase
    .from("transfer_records")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return { configured: true, record: data ? fromTransferRow(data) : null };
}

export async function saveTransferRecord(user, input) {
  const record = normalizeTransferRecord(input, user);
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    inMemoryTransferRecords.set(`${record.userId}:${record.id}`, record);
    return { configured: false, record };
  }

  const { data, error } = await supabase
    .from("transfer_records")
    .upsert(toTransferRow(record), { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return { configured: true, record: fromTransferRow(data) };
}

```

## api/_lib/providerRegistry.js

```js
import { getKycRecord } from "./kycRecords.js";
import { screenSanctionsSubject } from "./sanctionsRecords.js";
import { prepareXrplSettlement } from "./xrplSettlement.js";

const sandboxRates = {
  USD: { NGN: 1650, KES: 129, GHS: 12.1, INR: 83.2, PHP: 57.5, MXN: 17.1, BRL: 5.1, PKR: 278, BDT: 117, ZAR: 18.2, EGP: 48.5, MAD: 10.0 },
  CAD: { NGN: 1210, KES: 94.5, GHS: 8.9, INR: 61.0, PHP: 42.1, MXN: 12.5, BRL: 3.75, PKR: 204, BDT: 86, ZAR: 13.3, EGP: 35.5, MAD: 7.3 },
  GBP: { NGN: 2080, KES: 165, GHS: 15.35, INR: 105.2, PHP: 72.8, MXN: 21.7, BRL: 6.5, PKR: 352, BDT: 148, ZAR: 23.0, EGP: 61.4, MAD: 12.7 },
  EUR: { NGN: 1785, KES: 141, GHS: 13.2, INR: 90.0, PHP: 62.3, MXN: 18.6, BRL: 5.6, PKR: 301, BDT: 127, ZAR: 19.7, EGP: 52.5, MAD: 10.8 },
  AUD: { NGN: 1085, KES: 85.0, GHS: 8.0, INR: 54.8, PHP: 37.9, MXN: 11.3, BRL: 3.4, PKR: 183, BDT: 77, ZAR: 12.0, EGP: 32.0, MAD: 6.6 },
  NZD: { NGN: 1005, KES: 78.6, GHS: 7.4, INR: 50.7, PHP: 35.1, MXN: 10.5, BRL: 3.1, PKR: 169, BDT: 71, ZAR: 11.1, EGP: 29.6, MAD: 6.1 },
  CHF: { NGN: 1840, KES: 144, GHS: 13.6, INR: 92.8, PHP: 64.2, MXN: 19.1, BRL: 5.7, PKR: 310, BDT: 130, ZAR: 20.3, EGP: 54.1, MAD: 11.2 },
  SEK: { NGN: 151, KES: 11.8, GHS: 1.1, INR: 7.6, PHP: 5.3, MXN: 1.57, BRL: 0.47, PKR: 25.5, BDT: 10.7, ZAR: 1.67, EGP: 4.45, MAD: 0.92 },
  NOK: { NGN: 154, KES: 12.0, GHS: 1.13, INR: 7.75, PHP: 5.36, MXN: 1.6, BRL: 0.48, PKR: 26.0, BDT: 10.9, ZAR: 1.7, EGP: 4.53, MAD: 0.94 },
  DKK: { NGN: 239, KES: 18.7, GHS: 1.77, INR: 12.1, PHP: 8.36, MXN: 2.49, BRL: 0.75, PKR: 40.5, BDT: 17.0, ZAR: 2.65, EGP: 7.06, MAD: 1.46 },
  SGD: { NGN: 1225, KES: 95.8, GHS: 9.0, INR: 61.8, PHP: 42.8, MXN: 12.7, BRL: 3.82, PKR: 207, BDT: 87, ZAR: 13.5, EGP: 36.0, MAD: 7.45 },
  AED: { NGN: 449, KES: 35.1, GHS: 3.3, INR: 22.7, PHP: 15.7, MXN: 4.66, BRL: 1.39, PKR: 75.7, BDT: 31.9, ZAR: 4.96, EGP: 13.2, MAD: 2.72 },
  SAR: { NGN: 440, KES: 34.4, GHS: 3.23, INR: 22.2, PHP: 15.3, MXN: 4.56, BRL: 1.36, PKR: 74.1, BDT: 31.2, ZAR: 4.85, EGP: 12.9, MAD: 2.66 },
  JPY: { NGN: 10.6, KES: 0.83, GHS: 0.078, INR: 0.53, PHP: 0.37, MXN: 0.11, BRL: 0.033, PKR: 1.79, BDT: 0.75, ZAR: 0.117, EGP: 0.312, MAD: 0.064 }
};

export const providerRegistry = {
  async verifyKyc({ user }) {
    const storedKyc = await getKycRecord(user);

    return {
      provider: storedKyc.record.provider,
      status: storedKyc.record.status,
      reference: storedKyc.record.providerInquiryId || `kyc_${user?.id || "anonymous"}`,
      source: storedKyc.configured ? "database" : "testnet-header"
    };
  },

  async screenSanctions({ user, recipient }) {
    const screening = await screenSanctionsSubject({ user, recipient });

    return {
      provider: screening.record.provider,
      status: screening.record.status,
      reference: screening.record.id,
      source: screening.configured ? "database" : "testnet"
    };
  },

  async createFundingIntent({ amount, currency }) {
    return {
      provider: process.env.FUNDING_PROVIDER || "stripe-card",
      status: "requires_authorization",
      amount,
      currency
    };
  },

  async createExchangeQuote({ amount, currency, receiveCurrency }) {
    const rate = sandboxRates[currency]?.[receiveCurrency] || 1;
    return {
      provider: process.env.EXCHANGE_PROVIDER || "quote-engine",
      rate,
      receiveCurrency,
      receivedAmount: Number(amount || 0) * rate,
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    };
  },

  async prepareSettlement({ amount, currency, receiveCurrency, recipient }) {
    const settlementProvider = process.env.SETTLEMENT_PROVIDER || "xrpl-testnet";
    if (settlementProvider.toLowerCase().includes("xrpl")) {
      return prepareXrplSettlement({ amount, currency, receiveCurrency, recipient });
    }

    return {
      provider: settlementProvider,
      rail: "Partner treasury settlement",
      asset: currency === "USD" ? "USD treasury balance" : `${currency}/${receiveCurrency} treasury bridge`,
      status: "prepared"
    };
  },

  async createPayoutIntent({ recipient, receiveCurrency }) {
    return {
      provider: process.env.PAYOUT_PROVIDER || "payout-queue",
      status: "queued",
      method: recipient?.method || "Bank transfer",
      receiveCurrency,
      deliveryEstimate: recipient?.deliveryEstimate || "Within 1 business day"
    };
  }
};

```

## api/_lib/quoteRecords.js

```js
import { getSupabaseAdminClient } from "./supabaseClient.js";
import { isMissingTableError } from "./supabaseErrors.js";

const inMemoryQuotes = new Map();

function nowIso() {
  return new Date().toISOString();
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function normalizeQuoteRecord(input) {
  const record = input || {};
  return {
    id: String(record.id),
    userId: String(record.userId),
    amount: toNumber(record.amount),
    currency: String(record.currency || "USD").toUpperCase(),
    receiveCurrency: String(record.receiveCurrency || "NGN").toUpperCase(),
    receivedAmount: toNumber(record.receivedAmount),
    fee: toNumber(record.fee),
    total: toNumber(record.total),
    rate: toNumber(record.rate),
    purpose: String(record.purpose || ""),
    recipient: record.recipient || {},
    safety: record.safety || { passed: false, failures: [], warnings: [] },
    providers: record.providers || {},
    audit: record.audit || null,
    mode: String(record.mode || process.env.TRANSFER_MODE || "testnet"),
    status: String(record.status || "active"),
    expiresAt: record.expiresAt || new Date(Date.now() + 60_000).toISOString(),
    createdAt: record.createdAt || nowIso(),
    consumedAt: record.consumedAt || null,
    metadata: record.metadata || {}
  };
}

function toQuoteRow(record) {
  return {
    id: record.id,
    user_id: record.userId,
    amount: record.amount,
    currency: record.currency,
    receive_currency: record.receiveCurrency,
    received_amount: record.receivedAmount,
    fee: record.fee,
    total: record.total,
    rate: record.rate,
    status: record.status,
    expires_at: record.expiresAt,
    consumed_at: record.consumedAt,
    created_at: record.createdAt,
    metadata: {
      purpose: record.purpose,
      recipient: record.recipient,
      safety: record.safety,
      providers: record.providers,
      audit: record.audit,
      mode: record.mode,
      ...record.metadata
    }
  };
}

function fromQuoteRow(row) {
  return normalizeQuoteRecord({
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    currency: row.currency,
    receiveCurrency: row.receive_currency,
    receivedAmount: row.received_amount,
    fee: row.fee,
    total: row.total,
    rate: row.rate,
    status: row.status,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at,
    createdAt: row.created_at,
    purpose: row.metadata?.purpose,
    recipient: row.metadata?.recipient,
    safety: row.metadata?.safety,
    providers: row.metadata?.providers,
    audit: row.metadata?.audit,
    mode: row.metadata?.mode,
    metadata: row.metadata || {}
  });
}

export async function saveQuoteRecord(input) {
  const record = normalizeQuoteRecord(input);
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    inMemoryQuotes.set(`${record.userId}:${record.id}`, record);
    return { configured: false, record };
  }

  const { data, error } = await supabase
    .from("transfer_quotes")
    .upsert(toQuoteRow(record), { onConflict: "id" })
    .select("*")
    .single();

  if (isMissingTableError(error)) {
    inMemoryQuotes.set(`${record.userId}:${record.id}`, record);
    return { configured: false, schemaReady: false, record };
  }

  if (error) throw error;
  return { configured: true, record: fromQuoteRow(data) };
}

export async function getQuoteRecordById(user, quoteId) {
  const key = `${user.id}:${quoteId}`;
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return { configured: false, record: inMemoryQuotes.get(key) || null };
  }

  const { data, error } = await supabase
    .from("transfer_quotes")
    .select("*")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (isMissingTableError(error)) {
    return { configured: false, schemaReady: false, record: inMemoryQuotes.get(key) || null };
  }

  if (error) throw error;
  return { configured: true, record: data ? fromQuoteRow(data) : null };
}

export async function consumeQuoteRecord(user, quoteId, transferId) {
  const existing = await getQuoteRecordById(user, quoteId);
  if (!existing.record) return existing;

  const updated = normalizeQuoteRecord({
    ...existing.record,
    status: "consumed",
    consumedAt: nowIso(),
    metadata: {
      ...existing.record.metadata,
      consumedByTransferId: transferId || ""
    }
  });

  return saveQuoteRecord(updated);
}

```

## api/_lib/riskRecords.js

```js
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "./supabaseClient.js";
import { isMissingTableError } from "./supabaseErrors.js";

const HIGH_RISK_CORRIDORS = new Set(["US-NG", "GB-NG", "EU-ZA"]);
const REVIEW_THRESHOLD = 45;
const BLOCK_THRESHOLD = 80;

function nowIso() {
  return new Date().toISOString();
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function isTestMode() {
  return (process.env.TRANSFER_MODE || "testnet") !== "live";
}

function createRiskId({ user, amount, currency, recipient }) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify({
      userId: user?.id,
      amount,
      currency,
      recipientName: recipient?.name,
      corridor: recipient?.corridor,
      at: Math.floor(Date.now() / 60_000)
    }))
    .digest("hex")
    .slice(0, 24);

  return `risk_${hash}`;
}

async function getRecentTransferStats(user) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { configured: false, count24h: 0, amount24h: 0 };

  const { data, error } = await supabase
    .from("transfer_records")
    .select("send_amount")
    .eq("user_id", user.id)
    .gte("created_at", hoursAgo(24));

  if (isMissingTableError(error)) return { configured: false, schemaReady: false, count24h: 0, amount24h: 0 };
  if (error) throw error;

  return {
    configured: true,
    count24h: data.length,
    amount24h: data.reduce((sum, row) => sum + Number(row.send_amount || 0), 0)
  };
}

function calculateRisk({ user, amount, currency, recipient, kyc, sanctions, stats }) {
  const numericAmount = Number(amount || 0);
  const reasons = [];
  let score = 0;

  if (!user?.id) {
    score += 60;
    reasons.push("User identity is missing.");
  }

  if (kyc?.status !== "approved") {
    score += 35;
    reasons.push("KYC is not approved.");
  }

  if (sanctions?.status !== "clear") {
    score += 80;
    reasons.push("Sanctions screening is not clear.");
  }

  if (numericAmount >= 1000) {
    score += 18;
    reasons.push("Large transfer requires enhanced review.");
  }

  if (numericAmount >= 2500) {
    score += 28;
    reasons.push("Transfer amount is near or above the standard testnet threshold.");
  }

  if (HIGH_RISK_CORRIDORS.has(recipient?.corridor || "")) {
    score += 12;
    reasons.push("Corridor has higher compliance risk.");
  }

  if (stats.count24h >= 4) {
    score += 25;
    reasons.push("Multiple transfers attempted in the last 24 hours.");
  }

  if (stats.amount24h + numericAmount >= 5000) {
    score += 30;
    reasons.push(`Daily transfer volume exceeds ${currency} 5,000.`);
  }

  let status = score >= BLOCK_THRESHOLD ? "blocked" : score >= REVIEW_THRESHOLD ? "manual_review" : "clear";

  if (isTestMode() && recipient?.risk !== "Review required" && sanctions?.status === "clear" && status === "blocked") {
    status = "manual_review";
    reasons.push("Testnet verified recipient downgraded from blocked to review so integration flows can continue.");
  }

  return {
    score: Math.min(score, 100),
    status,
    reasons
  };
}

function toRiskRow(record) {
  return {
    id: record.id,
    user_id: record.userId,
    status: record.status,
    score: record.score,
    reasons: record.reasons || [],
    metadata: record.metadata || {},
    created_at: record.createdAt || nowIso()
  };
}

function fromRiskRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    score: Number(row.score || 0),
    reasons: row.reasons || [],
    metadata: row.metadata || {},
    createdAt: row.created_at
  };
}

export async function saveRiskAssessment(record) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { configured: false, record };

  const { data, error } = await supabase
    .from("risk_assessments")
    .insert(toRiskRow(record))
    .select("*")
    .single();

  if (isMissingTableError(error)) return { configured: false, schemaReady: false, record };
  if (error) throw error;

  return { configured: true, record: fromRiskRow(data) };
}

export async function assessTransferRisk({ user, amount, currency, recipient, kyc, sanctions }) {
  const stats = await getRecentTransferStats(user);
  const calculated = calculateRisk({ user, amount, currency, recipient, kyc, sanctions, stats });
  const record = {
    id: createRiskId({ user, amount, currency, recipient }),
    userId: user?.id || "testnet-user",
    status: calculated.status,
    score: calculated.score,
    reasons: calculated.reasons,
    metadata: {
      mode: process.env.TRANSFER_MODE || "testnet",
      corridor: recipient?.corridor || "",
      stats
    },
    createdAt: nowIso()
  };

  return saveRiskAssessment(record);
}

```

## api/_lib/sanctionsRecords.js

```js
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "./supabaseClient.js";
import { isMissingTableError } from "./supabaseErrors.js";

const CLEAR_STATUSES = new Set(["clear", "approved", "passed"]);

export function normalizeScreeningStatus(status) {
  const normalized = String(status || "required").toLowerCase();
  if (CLEAR_STATUSES.has(normalized)) return "clear";
  if (["manual_review", "needs_review", "possible_match", "review"].includes(normalized)) return "manual_review";
  if (["blocked", "match", "confirmed_match", "denied"].includes(normalized)) return "blocked";
  return normalized;
}

export function createScreeningSubject({ user, recipient }) {
  const subject = {
    userId: user?.id || "testnet-user",
    senderEmail: user?.email || "",
    recipientName: recipient?.name || "",
    recipientCountry: recipient?.country || recipient?.destination || "",
    corridor: recipient?.corridor || "",
    payoutMethod: recipient?.method || ""
  };

  return subject;
}

export function createScreeningId(subject) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(subject))
    .digest("hex")
    .slice(0, 24);

  return `screen_${hash}`;
}

function isTestMode() {
  return (process.env.TRANSFER_MODE || "testnet") !== "live";
}

function isReviewRecipient(recipient) {
  return recipient?.risk === "Review required";
}

function toScreeningRow(record) {
  return {
    id: record.id,
    user_id: record.userId,
    provider: record.provider,
    status: normalizeScreeningStatus(record.status),
    subject: record.subject || {},
    metadata: record.metadata || {},
    updated_at: new Date().toISOString()
  };
}

function fromScreeningRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    provider: row.provider,
    status: normalizeScreeningStatus(row.status),
    subject: row.subject || {},
    metadata: row.metadata || {},
    updatedAt: row.updated_at,
    createdAt: row.created_at
  };
}

export async function upsertSanctionsRecord(record) {
  const supabase = getSupabaseAdminClient();
  const normalized = {
    id: record.id,
    userId: record.userId,
    provider: record.provider || process.env.SANCTIONS_PROVIDER || "screening-rules",
    status: normalizeScreeningStatus(record.status),
    subject: record.subject || {},
    metadata: record.metadata || {}
  };

  if (!supabase) return { configured: false, record: normalized };

  const { data, error } = await supabase
    .from("sanctions_screenings")
    .upsert(toScreeningRow(normalized), { onConflict: "id" })
    .select("*")
    .single();

  if (isMissingTableError(error)) return { configured: false, schemaReady: false, record: normalized };
  if (error) throw error;
  return { configured: true, record: fromScreeningRow(data) };
}

export async function getSanctionsRecord(screeningId) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { configured: false, record: null };

  const { data, error } = await supabase
    .from("sanctions_screenings")
    .select("*")
    .eq("id", screeningId)
    .maybeSingle();

  if (isMissingTableError(error)) return { configured: false, schemaReady: false, record: null };
  if (error) throw error;
  return { configured: true, record: data ? fromScreeningRow(data) : null };
}

export async function screenSanctionsSubject({ user, recipient }) {
  const subject = createScreeningSubject({ user, recipient });
  const id = createScreeningId(subject);
  const stored = await getSanctionsRecord(id);
  const requiresReview = isReviewRecipient(recipient);
  const testModeClearOverride = isTestMode() && !requiresReview;

  if (stored.record && !testModeClearOverride) return stored;
  if (stored.record && testModeClearOverride && stored.record.status === "clear") return stored;

  const status = requiresReview ? "manual_review" : "clear";

  return upsertSanctionsRecord({
    id,
    userId: subject.userId,
    provider: process.env.SANCTIONS_PROVIDER || "screening-rules",
    status,
    subject,
    metadata: {
      mode: process.env.TRANSFER_MODE || "testnet",
      reason: requiresReview
        ? "Recipient marked for review in testnet data."
        : "Testnet verified recipient returned no sanctions match."
    }
  });
}

```

## api/_lib/persona.js

```js
const PERSONA_INQUIRIES_URL = "https://api.withpersona.com/api/v1/inquiries";

export function isPersonaConfigured() {
  return Boolean(process.env.PERSONA_API_KEY && process.env.PERSONA_TEMPLATE_ID);
}

export async function createPersonaInquiry({ user }) {
  if (!isPersonaConfigured()) {
    return {
      provider: "persona-test",
      mode: "test",
      status: "configuration_required",
      inquiryId: `test_inq_${user.id}`,
      sessionToken: null,
      verificationUrl: null,
      message: "Persona is not configured yet. Add Persona server variables in Vercel to create real test inquiries."
    };
  }

  const response = await fetch(PERSONA_INQUIRIES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERSONA_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `nexaremit-kyc-${user.id}`
    },
    body: JSON.stringify({
      data: {
        attributes: {
          "inquiry-template-id": process.env.PERSONA_TEMPLATE_ID,
          "reference-id": user.id
        }
      }
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      provider: "persona",
      mode: process.env.PERSONA_ENVIRONMENT || "test",
      status: "error",
      error: payload?.errors?.[0]?.title || payload?.errors?.[0]?.detail || "Persona inquiry could not be created."
    };
  }

  return {
    provider: "persona",
    mode: process.env.PERSONA_ENVIRONMENT || "test",
    status: payload?.data?.attributes?.status || "pending",
    inquiryId: payload?.data?.id,
    sessionToken: payload?.meta?.["session-token"] || null,
    verificationUrl: payload?.meta?.["one-time-link"] || payload?.meta?.["one-time-link-short"] || null,
    message: "Persona inquiry created. Keep this in test mode until webhooks and database status updates are verified."
  };
}

export function parsePersonaEvent(payload = {}) {
  const data = payload.data || {};
  const attributes = data.attributes || {};
  const eventName = attributes.name || data.type || payload.type || "unknown";
  const inquiry = attributes.payload?.data || attributes.inquiry || data;
  const inquiryAttributes = inquiry?.attributes || {};
  const referenceId = inquiryAttributes["reference-id"] || inquiryAttributes.referenceId || attributes["reference-id"];
  const status = inquiryAttributes.status || attributes.status || "pending";

  return {
    eventName,
    inquiryId: inquiry?.id || data.id || "",
    referenceId,
    status,
    raw: payload
  };
}

```

## api/_lib/kycRecords.js

```js
import { getSupabaseAdminClient } from "./supabaseClient.js";
import { isMissingTableError } from "./supabaseErrors.js";

const APPROVED_STATUSES = new Set(["approved", "completed", "passed"]);

export function normalizeKycStatus(status) {
  const normalized = String(status || "required").toLowerCase();
  if (APPROVED_STATUSES.has(normalized)) return "approved";
  if (["declined", "failed", "rejected"].includes(normalized)) return "declined";
  if (["needs_review", "requires_review", "manual_review"].includes(normalized)) return "needs_review";
  if (["pending", "created", "initiated"].includes(normalized)) return "pending";
  return normalized;
}

function toKycRow(record) {
  return {
    user_id: record.userId,
    provider: record.provider,
    provider_inquiry_id: record.providerInquiryId || null,
    status: normalizeKycStatus(record.status),
    metadata: record.metadata || {},
    updated_at: new Date().toISOString()
  };
}

function fromKycRow(row) {
  return {
    userId: row.user_id,
    provider: row.provider,
    providerInquiryId: row.provider_inquiry_id || "",
    status: normalizeKycStatus(row.status),
    metadata: row.metadata || {},
    updatedAt: row.updated_at,
    createdAt: row.created_at
  };
}

function isTestMode() {
  return (process.env.TRANSFER_MODE || "testnet") !== "live";
}

function fallbackKycRecord(user, schemaReady = true) {
  return {
    configured: false,
    schemaReady,
    record: {
      userId: user.id,
      provider: process.env.KYC_PROVIDER || "persona-test",
      status: isTestMode() ? "approved" : "required"
    }
  };
}

export async function getKycRecord(user) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return fallbackKycRecord(user);

  const { data, error } = await supabase
    .from("kyc_records")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (isMissingTableError(error)) return fallbackKycRecord(user, false);
  if (error) throw error;

  return {
    configured: true,
    record: data
      ? fromKycRow(data)
      : {
          userId: user.id,
          provider: process.env.KYC_PROVIDER || "persona",
          status: isTestMode() ? "approved" : "required"
        }
  };
}

export async function upsertKycRecord(record) {
  const supabase = getSupabaseAdminClient();
  const normalized = {
    userId: record.userId,
    provider: record.provider || process.env.KYC_PROVIDER || "persona",
    providerInquiryId: record.providerInquiryId || "",
    status: normalizeKycStatus(record.status),
    metadata: record.metadata || {}
  };

  if (!supabase) return { configured: false, record: normalized };

  const { data, error } = await supabase
    .from("kyc_records")
    .upsert(toKycRow(normalized), { onConflict: "user_id" })
    .select("*")
    .single();

  if (isMissingTableError(error)) {
    return { configured: false, schemaReady: false, record: normalized };
  }
  if (error) throw error;
  return { configured: true, record: fromKycRow(data) };
}

```

## api/kyc-start.js

```js
import { getRequestUser, requireMethod, sendError, sendJson } from "./_lib/http.js";
import { upsertKycRecord } from "./_lib/kycRecords.js";
import { createPersonaInquiry } from "./_lib/persona.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  try {
    const user = await getRequestUser(request);
    const inquiry = await createPersonaInquiry({ user }).catch((error) => ({
      provider: process.env.KYC_PROVIDER || "persona",
      mode: process.env.PERSONA_ENVIRONMENT || process.env.TRANSFER_MODE || "testnet",
      status: "error",
      error: error?.message || "KYC provider request failed."
    }));
    const kycRecord = await upsertKycRecord({
      userId: user.id,
      provider: inquiry.provider,
      providerInquiryId: inquiry.inquiryId,
      status: inquiry.status === "configuration_required" ? "required" : inquiry.status,
      metadata: {
        mode: inquiry.mode,
        startedFrom: "kyc-start",
        message: inquiry.message
      }
    }).catch((error) => ({
      configured: false,
      error: error.message
    }));
    const statusCode = inquiry.status === "error" ? 502 : 200;

    sendJson(response, statusCode, {
      userId: user.id,
      kyc: inquiry,
      stored: kycRecord.configured
    });
  } catch (error) {
    sendError(response, error, "kyc_start_failed", "Unable to start KYC.");
  }
}

```

## api/health.js

```js
import { requireMethod, sendJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["GET"])) return;

  sendJson(response, 200, {
    ok: true,
    service: "nexaremit-api",
    mode: process.env.TRANSFER_MODE || "testnet",
    checkedAt: new Date().toISOString()
  });
}

```

## api/recipients.js

```js
import { requireMethod, sendJson } from "./_lib/http.js";

const recipients = [
  { id: "recipient_1", name: "Amara Okafor", country: "Nigeria", method: "Bank transfer", receiveCurrency: "NGN", corridor: "US-NG", limit: 2500, risk: "Verified" },
  { id: "recipient_2", name: "Daniel Mwangi", country: "Kenya", method: "Mobile money", receiveCurrency: "KES", corridor: "US-KE", limit: 1500, risk: "Verified" },
  { id: "recipient_3", name: "Efua Mensah", country: "Ghana", method: "Wallet payout", receiveCurrency: "GHS", corridor: "US-GH", limit: 1800, risk: "Review required" },
  { id: "recipient_4", name: "Priya Sharma", country: "India", method: "Bank transfer", receiveCurrency: "INR", corridor: "GB-IN", limit: 3000, risk: "Verified" },
  { id: "recipient_5", name: "Maria Santos", country: "Philippines", method: "Mobile wallet", receiveCurrency: "PHP", corridor: "US-PH", limit: 2000, risk: "Verified" },
  { id: "recipient_6", name: "Carlos Rivera", country: "Mexico", method: "Bank transfer", receiveCurrency: "MXN", corridor: "US-MX", limit: 2500, risk: "Verified" },
  { id: "recipient_7", name: "Ana Oliveira", country: "Brazil", method: "PIX payout", receiveCurrency: "BRL", corridor: "EU-BR", limit: 2200, risk: "Verified" },
  { id: "recipient_8", name: "Ahmed Khan", country: "Pakistan", method: "Bank transfer", receiveCurrency: "PKR", corridor: "GB-PK", limit: 1800, risk: "Review required" },
  { id: "recipient_9", name: "Nusrat Rahman", country: "Bangladesh", method: "Mobile money", receiveCurrency: "BDT", corridor: "SG-BD", limit: 1600, risk: "Verified" },
  { id: "recipient_10", name: "Thabo Mbeki", country: "South Africa", method: "Bank transfer", receiveCurrency: "ZAR", corridor: "EU-ZA", limit: 2400, risk: "Verified" },
  { id: "recipient_11", name: "Mariam Hassan", country: "Egypt", method: "Cash pickup", receiveCurrency: "EGP", corridor: "AE-EG", limit: 1700, risk: "Review required" },
  { id: "recipient_12", name: "Youssef El Amrani", country: "Morocco", method: "Bank transfer", receiveCurrency: "MAD", corridor: "EU-MA", limit: 1900, risk: "Verified" }
];

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["GET"])) return;

  sendJson(response, 200, {
    mode: process.env.TRANSFER_MODE || "testnet",
    recipients
  });
}

```

## api/webhooks-persona.js

```js
import crypto from "node:crypto";
import { requireMethod, sendJson } from "./_lib/http.js";
import { upsertKycRecord } from "./_lib/kycRecords.js";
import { parsePersonaEvent } from "./_lib/persona.js";

function verifyPersonaSignature(rawBody, signature) {
  if (!process.env.PERSONA_WEBHOOK_SECRET) return false;
  if (!signature) return false;

  try {
    const signatureSets = String(signature).split(" ");
    const timestamp = signatureSets[0]?.split(",")?.[0]?.split("=")?.[1];
    const signatures = signatureSets
      .map((pair) => pair.match(/v1=([^,]+)/)?.[1])
      .filter(Boolean);

    if (!timestamp || !signatures.length) return false;

    const expected = crypto
      .createHmac("sha256", process.env.PERSONA_WEBHOOK_SECRET)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    return signatures.some((provided) => {
      try {
        return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  const signature = request.headers["persona-signature"] || request.headers["x-persona-signature"];

  if (!process.env.PERSONA_WEBHOOK_SECRET) {
    sendJson(response, 202, {
      received: true,
      verified: false,
      mode: "test",
      message: "Webhook received. Add PERSONA_WEBHOOK_SECRET to verify Persona signatures in test or live mode."
    });
    return;
  }

  if (!verifyPersonaSignature(rawBody, signature)) {
    sendJson(response, 400, {
      error: "invalid_webhook_signature",
      message: "Persona webhook signature could not be verified."
    });
    return;
  }

  const event = parsePersonaEvent(JSON.parse(rawBody));
  if (!event.referenceId) {
    sendJson(response, 422, {
      error: "missing_reference_id",
      message: "Persona event did not include a NexaRemit user reference."
    });
    return;
  }

  const saved = await upsertKycRecord({
    userId: event.referenceId,
    provider: "persona",
    providerInquiryId: event.inquiryId,
    status: event.status,
    metadata: {
      eventName: event.eventName,
      receivedAt: new Date().toISOString()
    }
  });

  sendJson(response, 200, {
    received: true,
    verified: true,
    userId: event.referenceId,
    status: saved.record.status
  });
}

```

## api/webhooks-stripe.js

```js
import { requireMethod, sendJson } from "./_lib/http.js";
import { getStripe } from "./_lib/stripeClient.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);
  const signature = request.headers["stripe-signature"];
  const stripe = getStripe();

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    sendJson(response, 202, {
      received: true,
      verified: false,
      mode: "test",
      message: "Webhook received. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to verify signatures in test or live mode."
    });
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    sendJson(response, 200, {
      received: true,
      verified: true,
      type: event.type,
      id: event.id
    });
  } catch (error) {
    sendJson(response, 400, {
      error: "invalid_webhook_signature",
      message: error.message
    });
  }
}

```

## src/pages/Home.jsx

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { ArrowRight, CheckCircle, Clock, HandCoins, Landmark, Phone, ShieldCheck, Smartphone, UserRoundPlus } from "lucide-react";

const promises = [
  "See the full cost first",
  "Add a receiver step by step",
  "Know what happens next"
];

const quickStarts = [
  { icon: UserRoundPlus, title: "Set up family", copy: "Add sender and receiver details in plain steps.", to: createPageUrl("Setup") },
  { icon: HandCoins, title: "Send money", copy: "Choose amount, payment method, and receiver.", to: createPageUrl("SendMoney") },
  { icon: Phone, title: "Track receipt", copy: "See transfer receipts and XRPL settlement updates.", to: createPageUrl("History") }
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="max-w-7xl mx-auto home-hero-inner">
          <div className="home-copy">
            <div className="home-kicker">
              <ShieldCheck className="w-5 h-5" />
              XRPL testnet transfer workspace
            </div>
            <h1>Money transfer made clear for every family.</h1>
            <p>
              NexaRemit uses large steps, familiar words, and clear receipts so first-time users and older family members can understand what is happening before they continue. This deployment follows a testnet workflow for quotes, card authorization, and settlement preparation.
            </p>
            <div className="home-actions">
              <Link to={createPageUrl("Setup")}>
                <Button className="home-primary-action">
                  Start Here
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("SendMoney")}>
                <Button variant="outline" className="home-secondary-action">
                  Send Money
                </Button>
              </Link>
            </div>
            <div className="home-promises">
              {promises.map((promise) => (
                <span key={promise}>
                  <CheckCircle className="w-5 h-5" />
                  {promise}
                </span>
              ))}
            </div>
          </div>
          <div className="home-visual">
            <img src="/assets/nexaremit-world-family-hero.png" alt="World map showing global transfer routes with a sender and receiver family using phones" />
            <div className="home-transfer-card">
              <div className="home-card-label">
                <Smartphone className="w-5 h-5" />
                Sender to receiver
              </div>
              <div className="home-transfer-row">
                <span>Fee shown first</span>
                <strong>$3.00</strong>
              </div>
              <div className="home-transfer-row">
                <span>Receiver gets</span>
                <strong>NGN 412,500</strong>
              </div>
              <div className="home-delivery">
                <Clock className="w-5 h-5" />
                Clear message: estimated delivery window
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-quickstart">
        <div className="max-w-7xl mx-auto home-quickstart-inner">
          {quickStarts.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} to={item.to} className="home-action-card">
                <Icon className="w-7 h-7" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
                <ArrowRight className="w-5 h-5 home-action-arrow" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto home-section">
        <div className="section-heading">
          <h2>Built for people who prefer simple guidance</h2>
          <p>No complicated dashboards required. Start with the sender, add the receiver, then review everything in plain words before the transfer continues.</p>
        </div>
        <div className="friendly-grid">
          <div className="friendly-card">
            <UserRoundPlus className="w-8 h-8 text-blue-700" />
            <h3>1. Set up the sender</h3>
            <p>Add your name, phone number, and how you want to pay. Keep the first setup short.</p>
          </div>
          <div className="friendly-card">
            <HandCoins className="w-8 h-8 text-blue-700" />
            <h3>2. Add the receiver</h3>
            <p>Choose bank, mobile money, or wallet. Show only the fields needed for that option.</p>
          </div>
          <div className="friendly-card">
            <ShieldCheck className="w-8 h-8 text-blue-700" />
            <h3>3. Review in plain words</h3>
            <p>Show the fee, exchange rate, delivery time, and total before the transfer continues.</p>
          </div>
        </div>
      </section>

      <section className="home-trust-band">
        <div className="max-w-7xl mx-auto home-trust-inner">
          <div>
            <p className="home-kicker"><Landmark className="w-5 h-5" /> Built for regulated partners</p>
            <h2>Friendly for users, serious about safety.</h2>
          </div>
          <div className="home-trust-points">
            <span><ShieldCheck className="w-5 h-5" /> KYC and screening before go-live</span>
            <span><CheckCircle className="w-5 h-5" /> Clear fees and rates</span>
            <span><Clock className="w-5 h-5" /> Receipts after each transfer request</span>
          </div>
        </div>
      </section>
    </div>
  );
}

```

## src/pages/Dashboard.jsx

```jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building, Globe, Send, Shield, Users } from "lucide-react";
import StatsOverview from "../components/dashboard/StatsOverview";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import QuickActions from "../components/dashboard/QuickActions";
import TransactionChart from "../components/dashboard/TransactionChart";
import SecurityStatus from "../components/dashboard/SecurityStatus";
import BalancePanel from "../components/dashboard/BalancePanel";
import ComplianceReadiness from "../components/dashboard/ComplianceReadiness";
import { calculateDashboardStats, normalizeDashboardTransactions } from "@/lib/dashboard-transactions";
import { fetchTransferRecords, getTransferRecords } from "@/lib/transfer-records";

const indicativeRates = {
  "USD-NGN": 1650,
  "GBP-KES": 165,
  "EUR-GHS": 13.2
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState(() => normalizeDashboardTransactions(getTransferRecords()));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    const records = await fetchTransferRecords();
    setTransactions(normalizeDashboardTransactions(records));
    setIsLoading(false);
  };

  const stats = calculateDashboardStats(transactions);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="gradient-primary px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="text-white">
              <div className="hero-kicker">
                <Shield className="w-4 h-4" />
                XRPL testnet operations
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">Track transfers end to end</h1>
              <p className="text-blue-100 text-lg lg:text-xl mb-6 max-w-2xl">
                Create quotes, authorize card funding, and review XRPL settlement preparation from one place. This deployment is for testnet operations and integration verification, not live money movement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("SendMoney")}>
                  <Button className="bg-white text-primary-navy hover:bg-neutral-100 font-semibold px-8 py-6 text-lg shadow-lg transition-premium">
                    <Send className="w-5 h-5 mr-2" />
                    Send Money Now
                  </Button>
                </Link>
                <Link to={createPageUrl("Recipients")}>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-navy font-semibold px-8 py-6 text-lg transition-premium">
                    <Users className="w-5 h-5 mr-2" />
                    Manage Recipients
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-72">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-white" />
                <span className="text-white font-semibold">Indicative Corridor Rates</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-blue-100">
                  <span>1 USD to NGN</span>
                  <span className="font-semibold">NGN {indicativeRates["USD-NGN"].toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-100">
                  <span>1 GBP to KES</span>
                  <span className="font-semibold">KSh {indicativeRates["GBP-KES"].toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-100">
                  <span>1 EUR to GHS</span>
                  <span className="font-semibold">GHS {indicativeRates["EUR-GHS"].toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <StatsOverview stats={stats} isLoading={isLoading} />
        <div className="dashboard-strip">
          <BalancePanel />
          <ComplianceReadiness />
        </div>
        <QuickActions />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <TransactionChart transactions={transactions} isLoading={isLoading} />
            <RecentTransactions transactions={transactions} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-2">
            <SecurityStatus />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-premium">
          <h3 className="text-2xl font-bold text-primary mb-8 text-center">Why Choose NexaRemit?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              [Shield, "Clear transfer controls", "Review quote, funding authorization, and settlement status before each transfer is created"],
              [Globe, "XRPL settlement visibility", "Track network, asset, ledger status, and explorer links when settlement data is available"],
              [Building, "Production path in progress", "This testnet deployment keeps one backend flow while live payout orchestration and signed submission are finished"]
            ].map(([Icon, title, description]) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 gradient-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-primary mb-2">{title}</h4>
                <p className="text-neutral-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

```

## src/pages/TransferHistory.jsx

```jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { fetchTransferRecords, formatTransferDate, getTransferRecords, transferStatuses } from "@/lib/transfer-records";
import { ReceiptText, Send } from "lucide-react";

export default function TransferHistory() {
  const [records, setRecords] = useState(() => getTransferRecords());

  useEffect(() => {
    let isMounted = true;
    fetchTransferRecords().then((nextRecords) => {
      if (isMounted) setRecords(nextRecords);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Transfer History</h1>
            <p className="text-neutral-600">Track submitted transfers, receipts, and XRPL settlement status updates.</p>
          </div>
          <Link to={createPageUrl("SendMoney")}>
            <Button><Send className="w-5 h-5 mr-2" />New Transfer</Button>
          </Link>
        </div>

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
          </CardHeader>
          <CardContent className="history-list">
            {records.map((record) => (
              <Link key={record.id} to={`/Receipt/${record.id}`} className="history-row">
                <div className="history-icon"><ReceiptText className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="font-semibold text-primary">{record.recipientName}</p>
                  <p className="text-sm text-neutral-500">{record.destination} - {formatTransferDate(record.createdAt)}</p>
                  {(record.fundingAuthorization?.reference || record.quoteId) && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {record.fundingAuthorization?.reference ? `Auth: ${record.fundingAuthorization.reference}` : ""}
                      {record.fundingAuthorization?.reference && record.quoteId ? " • " : ""}
                      {record.quoteId ? `Quote: ${record.quoteId}` : ""}
                    </p>
                  )}
                  {(record.settlement?.network || record.settlement?.assetCode || record.settlement?.transactionHash) && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {record.settlement?.network ? record.settlement.network.toUpperCase() : "XRPL"}
                      {record.settlement?.assetCode ? ` • ${record.settlement.assetCode}` : ""}
                      {record.settlement?.ledgerStatus ? ` • ${record.settlement.ledgerStatus}` : ""}
                      {record.settlement?.transactionHash ? ` • ${record.settlement.transactionHash.slice(0, 12)}…` : ""}
                    </p>
                  )}
                </div>
                <div className="history-amount">
                  <strong>{record.sendCurrency} {record.sendAmount.toFixed(2)}</strong>
                  <Badge className="bg-blue-50 text-blue-800">{transferStatuses[record.status] || record.status}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

```

## src/pages/Setup.jsx

```jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";
import { ArrowRight, CheckCircle, CreditCard, ExternalLink, FileCheck, Home, Landmark, Loader2, Phone, ShieldCheck, Smartphone, UserRound } from "lucide-react";

const payoutOptions = [
  { id: "bank", label: "Bank account", icon: Landmark, helper: "Best for receivers who use a bank." },
  { id: "mobile", label: "Mobile money", icon: Smartphone, helper: "Good for quick phone-based payouts." },
  { id: "cash", label: "Cash pickup", icon: Home, helper: "Useful when the receiver does not use banking apps." }
];

const setupSteps = [
  "Sender",
  "Receiver",
  "Review"
];

const setupNeeds = [
  "Sender name and phone number",
  "Receiver name and country",
  "How the receiver wants to collect money"
];

export default function Setup() {
  const [payoutMethod, setPayoutMethod] = useState("mobile");
  const [kycState, setKycState] = useState({ status: "idle", message: "" });

  const startKyc = async () => {
    setKycState({ status: "loading", message: "Preparing identity check..." });

    try {
      const response = await fetch("/api/kyc-start", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setKycState({
          status: "error",
          message: data?.kyc?.error || "KYC provider is not ready yet."
        });
        return;
      }

      setKycState({
        status: "ready",
        message: data?.kyc?.message || "Identity check prepared.",
        verificationUrl: data?.kyc?.verificationUrl,
        inquiryId: data?.kyc?.inquiryId
      });
    } catch {
      setKycState({
        status: "error",
        message: "Could not reach the KYC service. Try again after deployment finishes."
      });
    }
  };

  return (
    <div className="setup-page">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="setup-hero">
          <div className="setup-heading">
            <p className="home-kicker"><ShieldCheck className="w-5 h-5" /> Start here</p>
            <h1>Set up the sender and receiver one step at a time.</h1>
            <p>Use this guided form for fewer choices, bigger controls, and simple wording that works for first-time users.</p>
          </div>
          <div className="setup-helper-panel">
            <div className="setup-helper-icon">
              <FileCheck className="w-7 h-7" />
            </div>
            <h2>What you need</h2>
            <div className="setup-needs-list">
              {setupNeeds.map((item) => (
                <span key={item}><CheckCircle className="w-5 h-5" /> {item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="setup-stepper" aria-label="Setup steps">
          {setupSteps.map((step, index) => (
            <div key={step} className="setup-step-pill">
              <strong>{index + 1}</strong>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <Alert className="setup-safety-alert border-yellow-200 bg-yellow-50">
          <ShieldCheck className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Testnet mode: use non-production details only. Live money movement still requires identity verification, account validation, and sanctions checks before release.
          </AlertDescription>
        </Alert>

        <Card className="kyc-start-card shadow-premium border-0">
          <CardContent className="p-6">
            <div className="kyc-start-copy">
              <div className="setup-helper-icon">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h2>Identity check comes before real transfers</h2>
                <p>
                  Start here once Persona test credentials are connected. NexaRemit keeps transfers blocked until KYC is approved by the backend.
                </p>
                {kycState.message && (
                  <div className={`kyc-message ${kycState.status === "error" ? "is-error" : ""}`}>
                    {kycState.message}
                    {kycState.inquiryId && <span>Reference: {kycState.inquiryId}</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="kyc-actions">
              <Button type="button" onClick={startKyc} disabled={kycState.status === "loading"} className="setup-next-button">
                {kycState.status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Start KYC Check
              </Button>
              {kycState.verificationUrl && (
                <a href={kycState.verificationUrl} target="_blank" rel="noreferrer" className="kyc-link">
                  Open Persona
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="setup-grid">
          <Card className="setup-form-card shadow-premium border-0">
            <CardHeader>
              <CardTitle className="setup-title">
                <span className="setup-card-number">1</span>
                <UserRound className="w-6 h-6" />
                Who is sending?
              </CardTitle>
            </CardHeader>
            <CardContent className="easy-form">
              <label>
                <span>Sender full name</span>
                <input placeholder="Example: Maria Johnson" />
              </label>
              <label>
                <span>Sender phone number</span>
                <input placeholder="Example: +1 555 123 4567" />
              </label>
              <label>
                <span>How will the sender pay?</span>
                <select>
                  <option>Debit card</option>
                  <option>Bank transfer</option>
                  <option>Digital wallet</option>
                </select>
              </label>
              <div className="simple-tip">
                <CreditCard className="w-5 h-5" />
                Card or bank details are added later through a secure payment partner.
              </div>
            </CardContent>
          </Card>

          <Card className="setup-form-card shadow-premium border-0">
            <CardHeader>
              <CardTitle className="setup-title">
                <span className="setup-card-number">2</span>
                <Phone className="w-6 h-6" />
                Who receives?
              </CardTitle>
            </CardHeader>
            <CardContent className="easy-form">
              <label>
                <span>Receiver full name</span>
                <input placeholder="Example: Daniel Mwangi" />
              </label>
              <label>
                <span>Receiver country</span>
                <select>
                  <option>Kenya</option>
                  <option>Nigeria</option>
                  <option>Ghana</option>
                  <option>India</option>
                  <option>Philippines</option>
                  <option>Mexico</option>
                  <option>Brazil</option>
                  <option>Pakistan</option>
                  <option>Bangladesh</option>
                  <option>South Africa</option>
                  <option>Egypt</option>
                  <option>Morocco</option>
                  <option>Other supported country</option>
                </select>
              </label>
              <div>
                <span className="field-label">How should they receive the money?</span>
                <p className="field-helper">Choose the option your receiver will understand and can use easily.</p>
                <div className="payout-choice-grid">
                  {payoutOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPayoutMethod(option.id)}
                        className={`payout-choice ${payoutMethod === option.id ? "is-selected" : ""}`}
                      >
                        <Icon className="w-6 h-6" />
                        <strong>{option.label}</strong>
                        <span>{option.helper}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="setup-review-card shadow-premium border-0">
          <CardContent className="p-6">
            <div className="setup-review-copy">
              <span className="setup-card-number">3</span>
              <div>
                <h2>Review before sending</h2>
                <p>Next, choose an amount and see the fee, exchange rate, delivery time, and receiver amount before confirming.</p>
              </div>
            </div>
            <Link to={createPageUrl("SendMoney")}>
              <Button className="setup-next-button">
                Continue to Transfer
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

```

## src/pages/PaymentMethods.jsx

```jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { AlertTriangle, CalendarClock, CheckCircle, CreditCard, Plus, ShieldCheck, Star, Trash2 } from "lucide-react";

const sampleMethods = [
  {
    id: "sandbox_pm_visa_4242",
    brand: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2028,
    funding: "debit",
    isDefault: true
  },
  {
    id: "sandbox_pm_mastercard_4444",
    brand: "Mastercard",
    last4: "4444",
    expMonth: 9,
    expYear: 2027,
    funding: "debit",
    isDefault: false
  },
  {
    id: "sandbox_pm_old_0341",
    brand: "Visa",
    last4: "0341",
    expMonth: 1,
    expYear: 2024,
    funding: "debit",
    isDefault: false
  }
];

function isExpired(method) {
  if (!method.expMonth || !method.expYear) return false;
  return new Date() >= new Date(method.expYear, method.expMonth, 1);
}

function formatExpiry(method) {
  return `${String(method.expMonth).padStart(2, "0")}/${String(method.expYear).slice(-2)}`;
}

function normalizeDefault(methods) {
  if (!methods.length) return methods;
  if (methods.some((method) => method.isDefault && !isExpired(method))) return methods;
  const firstActive = methods.find((method) => !isExpired(method));
  return methods.map((method) => ({ ...method, isDefault: method.id === firstActive?.id }));
}

export default function PaymentMethods() {
  const [methods, setMethods] = useState(sampleMethods);
  const [message, setMessage] = useState("This page shows sample saved cards until Stripe Customer payment-method storage is connected.");
  const expiredCount = useMemo(() => methods.filter(isExpired).length, [methods]);
  const activeCount = methods.length - expiredCount;

  const makeDefault = (id) => {
    setMethods((current) => current.map((method) => ({ ...method, isDefault: method.id === id })));
    setMessage("Default payment method updated for this testnet session.");
  };

  const removeMethod = (method) => {
    const shouldRemove = window.confirm(`Remove ${method.brand} ending in ${method.last4}?`);
    if (!shouldRemove) return;

    setMethods((current) => normalizeDefault(current.filter((item) => item.id !== method.id)));
    setMessage(`${method.brand} ending in ${method.last4} was removed from this testnet page.`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Payment Methods</h1>
            <p className="text-neutral-600">Manage saved cards before sending money.</p>
          </div>
          <Link to={createPageUrl("SendMoney")}>
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Add Card During Payment
            </Button>
          </Link>
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Use non-production cards only while NexaRemit is in testnet mode. Production card storage must use Stripe Customer records and tokenized payment methods only.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-premium border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <span className="recipient-icon"><CreditCard className="w-5 h-5" /></span>
              <div>
                <p className="text-sm text-neutral-600">Saved Cards</p>
                <strong className="text-2xl text-primary">{methods.length}</strong>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-premium border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <span className="recipient-icon"><CheckCircle className="w-5 h-5" /></span>
              <div>
                <p className="text-sm text-neutral-600">Ready To Use</p>
                <strong className="text-2xl text-primary">{activeCount}</strong>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-premium border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <span className="recipient-icon"><CalendarClock className="w-5 h-5" /></span>
              <div>
                <p className="text-sm text-neutral-600">Expired</p>
                <strong className="text-2xl text-primary">{expiredCount}</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        {message && (
          <Alert className="border-blue-200 bg-blue-50">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <AlertDescription className="text-blue-700">{message}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle>Cards On File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {methods.length === 0 && (
              <div className="payment-choice-empty">No saved cards yet. Add one during your next payment authorization.</div>
            )}

            {methods.map((method) => {
              const expired = isExpired(method);
              return (
                <div key={method.id} className="history-row">
                  <span className="history-icon"><CreditCard className="w-5 h-5" /></span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <strong className="text-primary">{method.brand} ending in {method.last4}</strong>
                      {method.isDefault && <Badge className="bg-green-100 text-green-800"><Star className="w-4 h-4 mr-2" />Default</Badge>}
                      {expired && <Badge className="bg-red-100 text-red-800">Expired</Badge>}
                      {!expired && !method.isDefault && <Badge className="bg-blue-50 text-blue-700">Ready</Badge>}
                    </div>
                    <p className="text-sm text-neutral-600">
                      Expires {formatExpiry(method)}. {method.funding ? `${method.funding.charAt(0).toUpperCase() + method.funding.slice(1)} card.` : "Card."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button variant="outline" disabled={expired || method.isDefault} onClick={() => makeDefault(method.id)}>
                      Make Default
                    </Button>
                    <Button variant="outline" onClick={() => removeMethod(method)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-0 shadow-premium">
          <CardContent className="p-6 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-green-700" />
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-primary">Card Safety Rule</h2>
              <p className="text-neutral-700">
                NexaRemit should never store full card numbers, CVC codes, or raw bank details. Only store Stripe IDs, card brand, last four digits, expiry, and default status.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

```

## src/pages/Integrations.jsx

```jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { integrationChecklist, providerConfig } from "@/integrations/provider-config";
import { AlertTriangle, BadgeCheck, CircleDashed, FileCheck, KeyRound, Network, PlugZap, ShieldCheck } from "lucide-react";

const serverEnvVars = [
  "TRANSFER_MODE",
  "KYC_PROVIDER",
  "PERSONA_API_KEY",
  "PERSONA_TEMPLATE_ID",
  "PERSONA_WEBHOOK_SECRET",
  "SANCTIONS_PROVIDER_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SETTLEMENT_PROVIDER=xrpl-testnet",
  "XRPL_NETWORK=testnet",
  "XRPL_RPC_URL",
  "XRPL_WEBSOCKET_URL",
  "XRPL_TREASURY_ADDRESS",
  "XRPL_DESTINATION_ADDRESS",
  "XRPL_ISSUER_ADDRESS",
  "XRPL_ISSUED_CURRENCY=USD",
  "XRPL_NETWORK_CHECK=false",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
];

const browserEnvVars = [
  "VITE_TRANSFER_MODE",
  "VITE_KYC_PROVIDER",
  "VITE_SANCTIONS_PROVIDER",
  "VITE_FUNDING_PROVIDER",
  "VITE_EXCHANGE_PROVIDER",
  "VITE_SETTLEMENT_PROVIDER=xrpl-testnet",
  "VITE_XRPL_NETWORK=testnet",
  "VITE_XRPL_ASSET=USD issued currency",
  "VITE_PAYOUT_PROVIDER",
  "VITE_STRIPE_PUBLISHABLE_KEY"
];

const productionPartners = [
  "KYC provider such as Persona, Veriff, Onfido, Sumsub, or Alloy",
  "Sanctions/AML screening such as ComplyAdvantage, Alloy, Sardine, or Unit21",
  "Funding provider such as Stripe, Adyen, Checkout.com, Plaid/ACH, or local bank rails",
  "FX/exchange or liquidity provider for rate locks and spread management",
  "Settlement rail such as bank treasury, stablecoin rails, Ripple Payments, or XRPL integration",
  "Payout partner such as Thunes, Nium, TerraPay, Flutterwave, MFS Africa, or bank/mobile money aggregators"
];

const kycReadiness = [
  {
    title: "Business account",
    status: "In progress",
    detail: "Finish Persona onboarding with Financial Services, Fintech, Payments, or Money Transfer as the closest industry."
  },
  {
    title: "Sandbox credentials",
    status: "Needed next",
    detail: "Add Persona test credentials, template ID, and webhook secret in Vercel as server-only variables."
  },
  {
    title: "Server KYC gate",
    status: "Foundation exists",
    detail: "The transfer APIs already have a KYC slot. Next step is to replace mock status with Persona inquiry status from the database."
  },
  {
    title: "Webhook review trail",
    status: "Needed before launch",
    detail: "Persona webhook events must update user status and create an audit record before any real transfer is allowed."
  }
];

const xrplReadiness = [
  {
    title: "Network",
    status: "Testnet first",
    detail: "The backend adapter defaults to XRPL Testnet and can prepare settlement metadata without adding another Vercel function."
  },
  {
    title: "Treasury address",
    status: "Needed",
    detail: "Add XRPL_TREASURY_ADDRESS only after deciding custody, signing controls, and who can approve ledger transactions."
  },
  {
    title: "Issued currency",
    status: "Needed for fiat rails",
    detail: "For USD or other fiat-like settlement, configure issuer, trustlines, liquidity, and redemption before using mainnet."
  },
  {
    title: "Signing",
    status: "Not enabled",
    detail: "NexaRemit currently prepares settlement drafts only. It does not submit or sign XRPL transactions."
  }
];

export default function Integrations() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="home-kicker"><PlugZap className="w-5 h-5" /> Integration readiness</p>
          <h1 className="text-3xl font-bold text-primary mb-2">Provider rails for real money movement</h1>
          <p className="text-neutral-600">
            NexaRemit is structured to connect to money-transfer providers, exchanges, and settlement rails. The active implementation is testnet-only until licensed partners and production credentials are added.
          </p>
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Do not process real transactions until legal coverage, provider contracts, KYC, AML, fraud monitoring, and audit logging are active.
          </AlertDescription>
        </Alert>

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5" /> KYC Onboarding Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-600">
              Persona can be the first real identity provider. Keep it in test mode until the webhook, database status, and transfer blocking rules are verified end to end.
            </p>
            <div className="integration-grid">
              {kycReadiness.map((item) => (
                <div key={item.title} className="provider-mode-item">
                  <span>{item.status}</span>
                  <strong>{item.title}</strong>
                  <p className="text-sm text-neutral-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Network className="w-5 h-5" /> XRPL Settlement Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-600">
              XRPL is now represented in the backend settlement provider. It prepares a safe settlement plan for Testnet/Devnet and intentionally does not sign or submit ledger transactions yet.
            </p>
            <div className="integration-grid">
              {xrplReadiness.map((item) => (
                <div key={item.title} className="provider-mode-item">
                  <span>{item.status}</span>
                  <strong>{item.title}</strong>
                  <p className="text-sm text-neutral-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Network className="w-5 h-5" /> Current Provider Mode</CardTitle>
          </CardHeader>
          <CardContent className="provider-mode-grid">
            {Object.entries(providerConfig).map(([key, value]) => (
              <div key={key} className="provider-mode-item">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="integration-grid">
          {integrationChecklist.map((item) => (
            <Card key={item.key} className="shadow-premium border-0">
              <CardHeader>
                <CardTitle className="integration-card-title">
                  <CircleDashed className="w-5 h-5 text-orange-500" />
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className="bg-orange-100 text-orange-800">{item.provider}</Badge>
                <p className="text-neutral-600">{item.required}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="setup-grid">
          <Card className="shadow-premium border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" /> Server Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="env-list">
              {serverEnvVars.map((envVar) => <code key={envVar}>{envVar}</code>)}
            </CardContent>
          </Card>

          <Card className="shadow-premium border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Browser Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="env-list">
              {browserEnvVars.map((envVar) => <code key={envVar}>{envVar}</code>)}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BadgeCheck className="w-5 h-5" /> Production Partner Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productionPartners.map((partner) => (
              <div key={partner} className="partner-row">
                <BadgeCheck className="w-5 h-5 text-green-600" />
                <span>{partner}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

```

## src/components/layout/AppShell.jsx

```jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { AlertTriangle, Bell, LockKeyhole, ShieldCheck } from "lucide-react";
import Logo from "@/components/branding/Logo";
import { createPageUrl } from "@/utils";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Start Here", to: createPageUrl("Setup") },
  { label: "Send Money", to: createPageUrl("SendMoney") },
  { label: "Cards", to: createPageUrl("PaymentMethods") },
  { label: "Dashboard", to: createPageUrl("Dashboard") },
  { label: "History", to: createPageUrl("History") },
  { label: "Recipients", to: createPageUrl("Recipients") },
  { label: "Partners", to: createPageUrl("Integrations") },
  { label: "Safety", to: createPageUrl("SecurityCompliance") }
];

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <div className="prototype-banner">
        <div className="max-w-7xl mx-auto app-banner-inner">
          <span className="banner-icon"><AlertTriangle className="w-4 h-4" /></span>
          Testnet mode: quotes, card authorization, and transfer records are active here, while signed XRPL submission and live payout release are still being completed.
        </div>
      </div>
      <header className="app-header">
        <div className="max-w-7xl mx-auto app-header-inner">
          <Link to="/" aria-label="Go to NexaRemit home">
            <Logo className="app-logo" />
          </Link>
          <nav className="app-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink key={item.label} to={item.to} className={({ isActive }) => `app-nav-link ${isActive ? "is-active" : ""}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <div className="header-trust">
              <ShieldCheck className="w-4 h-4" />
              <span>Testnet</span>
            </div>
            <button type="button" className="icon-button" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="app-footer">
        <div className="max-w-7xl mx-auto app-footer-inner">
          <div className="footer-lockup">
            <LockKeyhole className="w-5 h-5" />
            <span>Designed for regulated money movement. Connect licensed partners before launch.</span>
          </div>
          <span>NexaRemit testnet workspace</span>
        </div>
      </footer>
    </div>
  );
}

```

## src/components/dashboard/ComplianceReadiness.jsx

```jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CircleDashed, ShieldAlert } from "lucide-react";

const readiness = [
  { label: "Single quote-to-transfer backend flow", done: true },
  { label: "Receipt and history persistence", done: true },
  { label: "Signed XRPL ledger submission", done: false },
  { label: "Live payout orchestration", done: false }
];

export default function ComplianceReadiness() {
  const completed = readiness.filter((item) => item.done).length;

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          Operating Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="readiness-meter" aria-label={`${completed} of ${readiness.length} readiness items complete`}>
          <div style={{ width: `${(completed / readiness.length) * 100}%` }} />
        </div>
        <Badge className="bg-blue-100 text-blue-800">Testnet workflow</Badge>
        <div className="space-y-3">
          {readiness.map((item) => {
            const Icon = item.done ? CheckCircle : CircleDashed;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${item.done ? "text-green-600" : "text-orange-500"}`} />
                <span className="text-sm text-neutral-700">{item.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

```

## src/components/dashboard/SecurityStatus.jsx

```jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";

export default function SecurityStatus() {
  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Environment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Testnet workflow enabled</p>
            <p className="text-sm text-green-700">Quotes, transfer creation, and receipt persistence use the same backend path.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-900">Signed XRPL submission still required</p>
            <p className="text-sm text-orange-700">This deployment can prepare and track settlement, but live ledger signing and payout release are not complete yet.</p>
          </div>
        </div>
        <Badge className="bg-blue-100 text-blue-800">Not for live money movement</Badge>
      </CardContent>
    </Card>
  );
}

```

## src/components/dashboard/BalancePanel.jsx

```jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Landmark, WalletCards, Waves } from "lucide-react";

const rails = [
  { label: "Funding", detail: "Stripe card authorization", status: "Active", icon: CreditCard, tone: "bg-green-100 text-green-800" },
  { label: "Settlement", detail: "XRPL testnet preparation", status: "Tracked", icon: Waves, tone: "bg-blue-100 text-blue-800" },
  { label: "Payout", detail: "Manual release planning", status: "Pending", icon: Landmark, tone: "bg-orange-100 text-orange-800" }
];

export default function BalancePanel() {
  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletCards className="w-5 h-5" />
          Settlement Rails
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rails.map((rail) => {
          const Icon = rail.icon;
          return (
            <div key={rail.label} className="wallet-row">
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-blue-700 mt-0.5" />
                <div>
                  <p className="font-semibold text-primary">{rail.label}</p>
                  <p className="text-sm text-neutral-500">{rail.detail}</p>
                </div>
              </div>
              <Badge className={rail.tone}>{rail.status}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

```

## src/components/dashboard/QuickActions.jsx

```jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { History, ListChecks, PlugZap, ReceiptText, Send, ShieldCheck } from "lucide-react";

export default function QuickActions() {
  const actions = [
    { label: "Easy Setup", helper: "Simple sender and receiver setup", icon: ReceiptText, to: "Setup" },
    { label: "Quote Transfer", helper: "Fees, delivery, and received amount", icon: Send, to: "SendMoney" },
    { label: "Transfer History", helper: "Receipts and settlement tracking", icon: History, to: "History" },
    { label: "Provider Rails", helper: "KYC, payment, exchange, settlement, payout", icon: PlugZap, to: "Integrations" },
    { label: "Launch Checklist", helper: "What still blocks live money movement", icon: ListChecks, to: "LaunchChecklist" },
    { label: "Compliance Status", helper: "KYC, AML, privacy, and fraud gaps", icon: ShieldCheck, to: "SecurityCompliance" }
  ];

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="quick-action-grid">
        {actions.map(({ label, helper, icon: Icon, to }) => (
          <Link key={label} to={createPageUrl(to)}>
            <div className="quick-action-tile">
              <Icon className="w-6 h-6 text-blue-700" />
              <div>
                <p className="font-semibold text-primary">{label}</p>
                <p className="text-sm text-neutral-500">{helper}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

```

## src/components/send/ReviewTransfer.jsx

```jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getPaymentIntentLabel, getPaymentMethodLabel } from "@/lib/payment-labels";
import { AlertTriangle, CheckCircle, Landmark, ShieldCheck } from "lucide-react";

const statusLabels = {
  configuration_required: "Configuration required",
  not_submitted: "Not submitted",
  prepared: "Prepared",
  sandbox_ready: "Prepared",
  ready: "Ready",
  submitted: "Submitted",
  confirmed: "Confirmed"
};

function formatStatus(status) {
  if (!status) return "Prepared";
  return statusLabels[status] || status.replace(/_/g, " ");
}

function formatNetwork(network) {
  if (!network) return "XRPL Testnet";
  return `XRPL ${network.charAt(0).toUpperCase()}${network.slice(1)}`;
}

function formatDateTime(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatMode(settlement, quote) {
  if (settlement?.network === "mainnet") return "Mainnet";
  if (settlement?.network) return `${settlement.network.charAt(0).toUpperCase()}${settlement.network.slice(1)}`;
  if (quote?.mode === "testnet") return "Testnet";
  if (quote?.mode) return `${quote.mode.charAt(0).toUpperCase()}${quote.mode.slice(1)}`;
  return "Configured environment";
}

export default function ReviewTransfer({ transferData, transferStatus, transferError, onConfirm, onBack }) {
  const quote = transferData.quote || {};
  const hasStripeAuthorization = Boolean(transferData.paymentMethod?.paymentIntentId);
  const hasPaymentMethod = Boolean(transferData.paymentMethod?.type || transferData.paymentMethod);
  const hasFundingAuthorization = Boolean(transferData.paymentMethod?.authorizationReference || transferData.paymentMethod?.paymentIntentId);
  const paymentLabel = getPaymentMethodLabel(transferData.paymentMethod);
  const paymentIntentId = getPaymentIntentLabel(transferData.paymentMethod);
  const settlement = quote.providers?.settlement || null;
  const isSubmitting = transferStatus === "submitting";

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <div className="flex justify-between items-center gap-3">
          <CardTitle>Review Transfer</CardTitle>
          <Badge className="bg-orange-100 text-orange-800">Quote locked before submit</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Review the quote, recipient, funding authorization, and XRPL settlement details before creating the transfer.
          </AlertDescription>
        </Alert>

        {!transferData.quoteId && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">
              No quote is attached to this transfer yet. Go back and create a fresh quote before submitting.
            </AlertDescription>
          </Alert>
        )}

        {transferError && (
          <Alert className={`border-red-200 bg-red-50 ${transferError?.status === 422 ? "border-yellow-200 bg-yellow-50" : ""}`}>
            <AlertTriangle className={`w-5 h-5 ${transferError?.status === 422 ? "text-yellow-600" : "text-red-600"}`} />
            <AlertDescription className={transferError?.status === 422 ? "text-yellow-800" : "text-red-800"}>
              {transferError.message}
            </AlertDescription>
          </Alert>
        )}

        {!hasFundingAuthorization && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">
              A successful funding authorization tied to this quote is required before the transfer can be created.
            </AlertDescription>
          </Alert>
        )}

        {hasFundingAuthorization && !hasStripeAuthorization && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Funding authorization is attached to this quote and will be validated again before transfer creation.
            </AlertDescription>
          </Alert>
        )}

        {!hasPaymentMethod && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">
              A payment method is required before review. Go back and choose how the transfer will be funded.
            </AlertDescription>
          </Alert>
        )}

        {quote.safety?.warnings?.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">{quote.safety.warnings.join(" ")}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Quote ID</span>
          <span className="font-semibold">{transferData.quoteId || "Not created"}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Quote expires</span>
          <span className="font-semibold">{formatDateTime(quote.expiresAt)}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Recipient</span>
          <span className="font-semibold">{transferData.recipient?.name || "Not provided"}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Destination</span>
          <span className="font-semibold">{transferData.recipient ? `${transferData.recipient.country} - ${transferData.recipient.method}` : "Not provided"}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Payment method</span>
          <span className="font-semibold">{paymentLabel}</span>
        </div>
        {paymentIntentId && (
          <div className="flex justify-between border-b border-neutral-100 pb-3">
            <span className="text-neutral-600">Payment authorization</span>
            <span className="font-semibold">{paymentIntentId}</span>
          </div>
        )}
        {transferData.paymentMethod?.authorizationReference && (
          <div className="flex justify-between border-b border-neutral-100 pb-3">
            <span className="text-neutral-600">Funding authorization</span>
            <span className="font-semibold">{transferData.paymentMethod.authorizationReference}</span>
          </div>
        )}
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Send amount</span>
          <span className="font-semibold">{transferData.currency} {Number(transferData.amount || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Fee</span>
          <span className="font-semibold">{transferData.currency} {Number(quote.fee || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Recipient receives</span>
          <span className="font-semibold">{quote.receiveCurrency || "--"} {Number(quote.receivedAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="font-semibold text-primary">Total</span>
          <span className="font-bold text-primary">{transferData.currency} {Number(quote.total || 0).toFixed(2)}</span>
        </div>
        <div className="review-security">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span>Transfer submission uses the stored quote ID and an idempotency key to avoid duplicate transfer creation.</span>
        </div>

        {quote.providers && (
          <div className="provider-readiness">
            <div>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>KYC: {quote.providers.kyc?.status || "unknown"}</span>
            </div>
            <div>
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span>Screening: {quote.providers.sanctions?.status || "unknown"}</span>
            </div>
            {settlement && (
              <section className="grid gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50">
                <span className="flex items-start gap-3">
                  <Landmark className="w-5 h-5 text-blue-700" />
                  <span className="grid gap-2">
                    <strong className="text-primary">Settlement rail: {formatNetwork(settlement.network)}</strong>
                    <small className="text-neutral-600">{settlement.rail}</small>
                  </span>
                </span>
                <section className="grid sm:grid-cols-2 gap-3">
                  <span className="grid gap-2 p-4 rounded-lg bg-white border border-neutral-200">
                    <small className="text-neutral-500 font-semibold">Status</small>
                    <strong className="text-primary">{formatStatus(settlement.status)}</strong>
                  </span>
                  <span className="grid gap-2 p-4 rounded-lg bg-white border border-neutral-200">
                    <small className="text-neutral-500 font-semibold">Asset</small>
                    <strong className="text-primary">{settlement.assetCode || settlement.asset || `${transferData.currency} bridge`}</strong>
                  </span>
                  <span className="grid gap-2 p-4 rounded-lg bg-white border border-neutral-200">
                    <small className="text-neutral-500 font-semibold">Ledger action</small>
                    <strong className="text-primary">{settlement.ledgerAction || "Awaiting settlement submission"}</strong>
                  </span>
                  <span className="grid gap-2 p-4 rounded-lg bg-white border border-neutral-200">
                    <small className="text-neutral-500 font-semibold">Mode</small>
                    <strong className="text-primary">{formatMode(settlement, quote)}</strong>
                  </span>
                </section>
                {settlement.note && <p className="text-sm text-neutral-600">{settlement.note}</p>}
              </section>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button disabled={!hasPaymentMethod || !hasFundingAuthorization || !transferData.quoteId || isSubmitting} onClick={onConfirm}>
          {isSubmitting ? "Submitting Transfer..." : "Create Transfer"}
        </Button>
      </CardFooter>
    </Card>
  );
}

```

## src/lib/transfer-records.js

```js
import { getPaymentMethodLabel } from "@/lib/payment-labels";

const STORAGE_KEY = "nexaremit_transfers_v2";

export const transferStatuses = {
  transfer_created: "Transfer created",
  payment_authorized: "Payment authorized",
  funding_authorized: "Funding authorized",
  settlement_prepared: "Settlement prepared",
  settlement_submitted: "Settlement submitted",
  settlement_confirmed: "Settlement confirmed",
  settlement_configuration_required: "Settlement configuration required",
  compliance_review: "Compliance review",
  payout_pending: "Payout pending",
  failed: "Failed",
  refunded: "Refunded"
};

const starterTransfers = [];

function canUseStorage() {
  return typeof window !== "undefined" && window.localStorage;
}

function normalizeFundingAuthorization(fundingAuthorization, paymentIntentId = "") {
  if (!fundingAuthorization && !paymentIntentId) return null;
  return {
    provider: fundingAuthorization?.provider || (paymentIntentId ? "stripe" : ""),
    reference: fundingAuthorization?.reference || paymentIntentId || "",
    status: fundingAuthorization?.status || (paymentIntentId ? "succeeded" : ""),
    amount: Number.isFinite(Number(fundingAuthorization?.amount)) ? Number(fundingAuthorization.amount) : null,
    currency: fundingAuthorization?.currency ? String(fundingAuthorization.currency).toUpperCase() : null
  };
}

function normalizeSettlement(settlement) {
  if (!settlement) return null;
  return {
    provider: settlement.provider || "",
    rail: settlement.rail || "",
    network: settlement.network || settlement.networkKey || "",
    asset: settlement.asset || "",
    assetCode: settlement.assetCode || settlement.asset_code || "",
    assetType: settlement.assetType || settlement.asset_type || "",
    status: settlement.status || "",
    ledgerStatus: settlement.ledgerStatus || settlement.ledger_status || "",
    transactionHash: settlement.transactionHash || settlement.xrplTransactionHash || settlement.xrpl_transaction_hash || "",
    explorerTransactionUrl: settlement.explorerTransactionUrl || settlement.xrplExplorerUrl || settlement.xrpl_explorer_url || "",
    ledgerIndex: Number.isFinite(Number(settlement.ledgerIndex)) ? Number(settlement.ledgerIndex) : null,
    sourceAddress: settlement.sourceAddress || "",
    destinationAddress: settlement.destinationAddress || "",
    submittedAt: settlement.submittedAt || settlement.settlementSubmittedAt || settlement.settlement_submitted_at || null,
    confirmedAt: settlement.confirmedAt || settlement.settlementConfirmedAt || settlement.settlement_confirmed_at || null,
    ledgerAction: settlement.ledgerAction || "",
    warnings: Array.isArray(settlement.warnings) ? settlement.warnings : []
  };
}

function deriveTransferStatus(record, fundingAuthorization, settlement) {
  if (record?.status) return record.status;
  if (settlement?.status === "confirmed") return "settlement_confirmed";
  if (settlement?.status === "submitted") return "settlement_submitted";
  if (settlement?.status === "prepared") return "settlement_prepared";
  if (settlement?.status === "failed") return "failed";
  if (settlement?.status === "not_submitted" || settlement?.status === "configuration_required") return "settlement_configuration_required";
  if (fundingAuthorization?.provider === "stripe") return "payment_authorized";
  if (fundingAuthorization) return "funding_authorized";
  return "transfer_created";
}

function normalizeEvent(event) {
  return {
    label: String(event?.label || "Transfer event"),
    at: event?.at || new Date().toISOString()
  };
}

function normalizeTransferRecord(record) {
  if (!record) return null;

  const paymentIntentId = record.paymentIntentId || record.payment_intent_id || record.fundingAuthorization?.reference || "";
  const fundingAuthorization = normalizeFundingAuthorization(record.fundingAuthorization, paymentIntentId);
  const settlement = normalizeSettlement(record.settlement);
  const status = deriveTransferStatus(record, fundingAuthorization, settlement);

  return {
    ...record,
    id: record.id || `NX-${Date.now().toString().slice(-8)}`,
    createdAt: record.createdAt || record.created_at || new Date().toISOString(),
    updatedAt: record.updatedAt || record.updated_at || record.createdAt || record.created_at || new Date().toISOString(),
    recipientName: record.recipientName || record.recipient_name || "Unknown receiver",
    destination: record.destination || "Unknown - Payout",
    sendAmount: Number(record.sendAmount ?? record.send_amount ?? 0),
    sendCurrency: String(record.sendCurrency || record.send_currency || "USD").toUpperCase(),
    receiveAmount: Number(record.receiveAmount ?? record.receive_amount ?? 0),
    receiveCurrency: String(record.receiveCurrency || record.receive_currency || "NGN").toUpperCase(),
    paymentMethod: ["card", "bank", "wallet"].includes(record.paymentMethod)
      ? getPaymentMethodLabel(record.paymentMethod)
      : (record.paymentMethod || record.payment_method || "Not selected"),
    paymentIntentId,
    quoteId: record.quoteId || record.quote_id || "",
    status,
    fundingAuthorization,
    settlement,
    events: Array.isArray(record.events) ? record.events.map(normalizeEvent) : []
  };
}

function storeTransferRecords(records) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 50).map(normalizeTransferRecord).filter(Boolean)));
}

export function getTransferRecords() {
  if (!canUseStorage()) return starterTransfers;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(starterTransfers));
    return starterTransfers;
  }
  try {
    return JSON.parse(stored).map(normalizeTransferRecord).filter(Boolean);
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(starterTransfers));
    return starterTransfers;
  }
}

export function getTransferRecord(id) {
  return getTransferRecords().find((record) => record.id === id);
}

export function buildTransferRecord(transferData) {
  const serverRecord =
    transferData?.transferResult?.record ||
    transferData?.transferResult?.transfer?.record ||
    transferData?.record ||
    null;

  if (serverRecord) return normalizeTransferRecord(serverRecord);

  const transfer = transferData?.transferResult?.transfer || transferData?.transfer || transferData;
  if (!transfer || typeof transfer !== "object") return null;

  const settlement = normalizeSettlement(transfer.settlement);
  const fundingAuthorization = normalizeFundingAuthorization(
    transfer.fundingAuthorization,
    transfer.paymentIntentId || transfer.payment_intent_id || ""
  );

  if (!transfer.id && !transfer.quoteId && !settlement && !fundingAuthorization) {
    return null;
  }

  return normalizeTransferRecord({
    ...transfer,
    fundingAuthorization,
    settlement,
    recipientName: transfer.recipientName || transferData?.recipient?.name,
    destination: transfer.destination || transferData?.recipient?.country,
    sendAmount: transfer.sendAmount ?? transferData?.amount,
    sendCurrency: transfer.sendCurrency || transferData?.currency,
    quoteId: transfer.quoteId || transferData?.quoteId || transferData?.quote?.id || ""
  });
}

export function saveTransferRecord(transferDataOrRecord) {
  const record = transferDataOrRecord?.transferResult || transferDataOrRecord?.recipient
    ? buildTransferRecord(transferDataOrRecord)
    : normalizeTransferRecord(transferDataOrRecord);

  if (!record) return null;
  if (canUseStorage()) {
    const records = getTransferRecords();
    const withoutDuplicate = records.filter((item) => item.id !== record.id);
    storeTransferRecords([record, ...withoutDuplicate]);
  }

  return normalizeTransferRecord(record);
}

export async function fetchTransferRecords() {
  const localRecords = getTransferRecords();
  try {
    const response = await fetch("/api/transfer-records");
    if (!response.ok) throw new Error("Could not load transfer records");
    const result = await response.json();
    const normalizedRecords = Array.isArray(result.records)
      ? result.records.map(normalizeTransferRecord).filter(Boolean)
      : localRecords;
    storeTransferRecords(normalizedRecords);
    return normalizedRecords;
  } catch {
    return localRecords;
  }
}

export async function fetchTransferRecord(id) {
  const localRecord = getTransferRecord(id);
  try {
    const response = await fetch(`/api/transfer-records?id=${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error("Could not load transfer receipt");
    const result = await response.json();
    if (result.record) return saveTransferRecord(result.record);
    return localRecord;
  } catch {
    return localRecord;
  }
}

export async function persistTransferRecord(transferDataOrRecord) {
  const record = transferDataOrRecord?.transferResult || transferDataOrRecord?.recipient
    ? buildTransferRecord(transferDataOrRecord)
    : normalizeTransferRecord(transferDataOrRecord);

  if (!record) return null;
  saveTransferRecord(record);

  try {
    const response = await fetch("/api/transfer-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record })
    });
    if (!response.ok) throw new Error("Could not save transfer record");
    const result = await response.json();
    const savedRecord = result.record || record;
    saveTransferRecord(savedRecord);
    return savedRecord;
  } catch {
    return record;
  }
}

export function formatTransferDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(dateValue));
}

```

## src/integrations/provider-config.js

```js
export const providerConfig = {
  mode: import.meta.env.VITE_TRANSFER_MODE || "testnet",
  kycProvider: import.meta.env.VITE_KYC_PROVIDER || "persona-test",
  sanctionsProvider: import.meta.env.VITE_SANCTIONS_PROVIDER || "screening-rules",
  fundingProvider: import.meta.env.VITE_FUNDING_PROVIDER || "stripe-card",
  exchangeProvider: import.meta.env.VITE_EXCHANGE_PROVIDER || "quote-engine",
  settlementProvider: import.meta.env.VITE_SETTLEMENT_PROVIDER || "xrpl-testnet",
  xrplNetwork: import.meta.env.VITE_XRPL_NETWORK || "testnet",
  xrplAsset: import.meta.env.VITE_XRPL_ASSET || "USD issued currency",
  payoutProvider: import.meta.env.VITE_PAYOUT_PROVIDER || "payout-queue"
};

export const integrationChecklist = [
  { key: "kyc", label: "KYC identity verification", provider: providerConfig.kycProvider, required: "Verify senders and high-risk receivers before transfer creation." },
  { key: "sanctions", label: "Sanctions and watchlist screening", provider: providerConfig.sanctionsProvider, required: "Screen sender, receiver, countries, and wallet addresses." },
  { key: "funding", label: "Sender funding", provider: providerConfig.fundingProvider, required: "Charge card, debit bank account, or collect local payment." },
  { key: "exchange", label: "FX and exchange quote", provider: providerConfig.exchangeProvider, required: "Lock rates, fees, spread, and quote expiration." },
  { key: "settlement", label: "XRPL settlement rail", provider: `${providerConfig.settlementProvider} (${providerConfig.xrplNetwork})`, required: "Prepare XRPL Testnet/Devnet settlement drafts before any mainnet value movement." },
  { key: "payout", label: "Receiver payout", provider: providerConfig.payoutProvider, required: "Deliver to bank account, mobile money, wallet, or cash pickup." }
];

```

## src/integrations/reference-providers.js

```js
import { corridorRates } from "@/lib/transfer-pricing";

export const mockKycProvider = {
  async verifySender() {
    return {
      status: "test_pass",
      level: "basic",
      message: "Reference identity check passed. Replace with a licensed KYC provider."
    };
  }
};

export const mockSanctionsProvider = {
  async screenTransfer({ recipient }) {
    const needsReview = recipient?.risk === "Review required";
    return {
      status: needsReview ? "manual_review" : "clear",
      message: needsReview ? "Receiver requires manual compliance review." : "No sanctions match found in the reference ruleset."
    };
  }
};

export const mockFundingProvider = {
  async estimateFunding({ amount = 0, currency = "USD" }) {
    const numericAmount = Number(amount || 0);
    return {
      method: "Card or bank transfer",
      fee: numericAmount > 0 ? Math.max(2.99, numericAmount * 0.012) : 0,
      status: "ready",
      currency
    };
  }
};

export const mockExchangeProvider = {
  async quote({ amount = 0, currency = "USD", recipient }) {
    const numericAmount = Number(amount || 0);
    const receiveCurrency = recipient?.receiveCurrency || "NGN";
    const rate = corridorRates[currency]?.[receiveCurrency] || recipient?.exchangeRate || 1;
    return {
      rate,
      receiveCurrency,
      receivedAmount: numericAmount * rate,
      expiresInSeconds: 60,
      provider: "Reference FX table"
    };
  }
};

export const mockSettlementProvider = {
  async prepareSettlement({ currency, recipient }) {
    return {
      rail: "XRPL Testnet settlement adapter",
      asset: currency === "XRP" ? "Native XRP bridge asset" : "USD issued-currency bridge",
      status: "configuration_required",
      network: "testnet",
      ledgerAction: "No blockchain transaction sent yet",
      note: `Prepared XRPL testnet settlement plan for ${recipient?.country || "receiver country"}. Add treasury and issuer addresses before any ledger transaction.`
    };
  }
};

export const mockPayoutProvider = {
  async estimatePayout({ recipient }) {
    return {
      method: recipient?.method || "Bank transfer",
      deliveryEstimate: recipient?.deliveryEstimate || "Within 1 business day",
      status: "prepared"
    };
  }
};

```

## src/integrations/transfer-orchestrator.js

```js
import {
  mockExchangeProvider,
  mockFundingProvider,
  mockKycProvider,
  mockPayoutProvider,
  mockSanctionsProvider,
  mockSettlementProvider
} from "./reference-providers";
import { providerConfig } from "./provider-config";

export function createTransferOrchestrator() {
  return {
    async createQuote({ amount = 0, currency = "USD", recipient, purpose }) {
      const funding = await mockFundingProvider.estimateFunding({ amount, currency });
      const fx = await mockExchangeProvider.quote({ amount, currency, recipient });
      const payout = await mockPayoutProvider.estimatePayout({ recipient });
      const settlement = await mockSettlementProvider.prepareSettlement({ amount, currency, recipient });
      const sanctions = await mockSanctionsProvider.screenTransfer({ recipient, amount, currency, purpose });
      const kyc = await mockKycProvider.verifySender();
      const numericAmount = Number(amount || 0);
      const transferLimit = recipient?.limit || 2500;

      return {
        mode: providerConfig.mode,
        amount: numericAmount,
        currency,
        purpose,
        recipient,
        fee: funding.fee,
        total: numericAmount + funding.fee,
        rate: fx.rate,
        receiveCurrency: fx.receiveCurrency,
        receivedAmount: fx.receivedAmount,
        transferLimit,
        isOverLimit: numericAmount > transferLimit,
        expiresInSeconds: fx.expiresInSeconds,
        deliveryEstimate: payout.deliveryEstimate,
        providers: {
          kyc,
          sanctions,
          funding,
          exchange: fx,
          settlement,
          payout
        }
      };
    },

    async prepareTransfer(transferData) {
      const quote = await this.createQuote(transferData);
      return {
        ...quote,
        transferReference: `NX-${Date.now().toString().slice(-8)}`,
        nextRequiredAction: quote.providers.sanctions.status === "manual_review" ? "Compliance review" : "Payment authorization"
      };
    }
  };
}

export const transferOrchestrator = createTransferOrchestrator();

```

