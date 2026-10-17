import React from 'react';
import { renderToString } from 'react-dom/server';
import { Popover as P } from 'radix-ui';
const h = React.createElement;
const out = renderToString(
  h(P.Root, { open: false },
    h(P.Trigger, { asChild: true }, h('input', { value: 'x', readOnly: true, placeholder: 'ph' })),
  ),
);
console.log(out);
