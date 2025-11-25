// src/custom.d.ts
declare module "*.svg" {
  import * as React from "react";

  // This is for CRA-style `import { ReactComponent as … }`
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  // This is for default import (string URL)
  const src: string;
  export default src;
}

// Support Vite `?react` and other query import styles like `?component`
declare module "*.svg?react" {
  import * as React from "react";
  const ReactComponent: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  export default ReactComponent;
}

declare module "*.svg?*" {
  import * as React from "react";
  const ReactComponent: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  export default ReactComponent;
}
