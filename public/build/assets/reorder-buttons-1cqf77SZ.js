import{j as e,S as d}from"./app-Ht9uGhtP.js";import{c as l}from"./brand-logo-l_3bexWb.js";import{A as i}from"./arrow-down-BePFFTvy.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],p=l("ArrowUp",m);function h({ids:r,index:o,url:a}){const s=c=>{const t=[...r],[n]=t.splice(o,1);t.splice(o+c,0,n),d.post(a,{ids:t},{preserveScroll:!0})};return e.jsxs("div",{className:"flex flex-col",children:[e.jsx("button",{type:"button",onClick:()=>s(-1),disabled:o===0,"aria-label":"Subir",className:"text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-1 disabled:opacity-25",children:e.jsx(p,{className:"size-4"})}),e.jsx("button",{type:"button",onClick:()=>s(1),disabled:o===r.length-1,"aria-label":"Bajar",className:"text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-1 disabled:opacity-25",children:e.jsx(i,{className:"size-4"})})]})}export{h as R};
