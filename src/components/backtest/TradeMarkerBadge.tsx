import React from 'react';

export type TradeMarkerKind='buy'|'sell'|'exit';
export const tradeMarkerText=(kind:TradeMarkerKind,source:string)=>`${kind.toUpperCase()} · ${source}`;
export const tradeBadgeWidth=(source:string)=>Math.min(174,Math.max(82,35+Math.min(source.length,20)*6));

export function tradeBadgePosition(x:number,y:number,kind:TradeMarkerKind,source:string,left:number,right:number,top:number,bottom:number,lane=0){
 const width=tradeBadgeWidth(source);
 const above=kind!=='buy';
 return {x:Math.max(left,Math.min(right-width,x-width/2)),y:Math.max(top,Math.min(bottom-24,y+(above?-36-lane*28:12+lane*28))),width,height:24};
}

export function tradeBadgeLanes(points:{x:number;y:number;kind:TradeMarkerKind;source:string}[],bounds:{left:number;right:number;top:number;bottom:number}):(number|null)[]{
 const boxes:ReturnType<typeof tradeBadgePosition>[]=[];
 return points.map(point=>{
  for(let lane=0;lane<3;lane++){
   const box=tradeBadgePosition(point.x,point.y,point.kind,point.source,bounds.left,bounds.right,bounds.top,bounds.bottom,lane);
   if(!boxes.some(other=>box.x<other.x+other.width+4&&box.x+box.width+4>other.x&&box.y<other.y+other.height+4&&box.y+box.height+4>other.y)){boxes.push(box);return lane;}
  }
  return null;
 });
}

export function TradeMarkerBadge({x,y,kind,source,color,left,right,top,bottom,lane=0}:{x:number;y:number;kind:TradeMarkerKind;source:string;color:string;left:number;right:number;top:number;bottom:number;lane?:number}){
 const box=tradeBadgePosition(x,y,kind,source,left,right,top,bottom,lane);
 const below=box.y>y,edge=below?box.y:box.y+box.height;
 const tipX=Math.max(box.x+8,Math.min(box.x+box.width-8,x));
 const text=source.length>20?source.slice(0,19)+'…':source;
 return <g aria-hidden="true">
  <line x1={x} x2={tipX} y1={y} y2={edge} stroke={color} strokeWidth="1"/>
  <path d={`M${tipX-5},${edge} L${tipX},${edge+(below?-6:6)} L${tipX+5},${edge} Z`} fill={color}/>
  <rect x={box.x} y={box.y} width={box.width} height={box.height} rx="8" fill={color} stroke="white" strokeWidth="1"/>
  <text x={box.x+box.width/2} y={box.y+16} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">{tradeMarkerText(kind,text)}</text>
 </g>;
}
