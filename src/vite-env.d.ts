/// <reference types="vite/client" />

// WebMCP attributes on HTML elements (declarative tools from <form>).
// Lets them be used in JSX without TypeScript errors.
import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
    toolautosubmit?: string;
  }
  interface InputHTMLAttributes<T> {
    toolparamdescription?: string;
  }
  interface TextareaHTMLAttributes<T> {
    toolparamdescription?: string;
  }
}
