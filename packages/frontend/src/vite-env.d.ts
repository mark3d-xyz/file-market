/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare namespace CSS {
  function registerProperty(definition: {
    name: string
    syntax?: string
    inherits: boolean
    initialValue?: string
  }): void
}
