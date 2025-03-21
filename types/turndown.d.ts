// turndown.d.ts
declare module 'turndown' {
  export interface TurndownOptions {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: '-' | '+' | '*';
    codeBlockStyle?: 'indented' | 'fenced';
    emDelimiter?: '_' | '*';
    strongDelimiter?: '__' | '**';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
    fence?: '```' | '~~~';
  }

  export interface TurndownRule {
    filter: string | string[] | ((node: HTMLElement, options?: TurndownOptions) => boolean);
    replacement: (content: string, node: HTMLElement, options?: TurndownOptions) => string;
  }

  export default class TurndownService {
    constructor(options?: TurndownOptions);
    turndown(html: string | HTMLElement): string;
    use(plugin: TurndownPlugin): this;
    addRule(key: string, rule: TurndownRule): this;
    keep(filter: string | string[] | ((node: HTMLElement) => boolean)): this;
    remove(filter: string | string[] | ((node: HTMLElement) => boolean)): this;
    escape(str: string): string;
  }

  export interface TurndownPlugin {
    (service: TurndownService): void;
  }
}