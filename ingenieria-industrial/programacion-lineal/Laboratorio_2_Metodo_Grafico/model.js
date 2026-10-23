/* Núcleo matemático independiente. Sin dependencias y utilizable en Node.js. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PL = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const EPS = 1e-8;
  const relEq = (a, b, tolerance = 1e-7) => Math.abs(a-b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));
  const normalizeOp = op => op === '=' ? '=' : (op === '>=' || op === '≥') ? '>=' : '<=';
  function validModel(model) {
    if (!model || !model.objective || !['max','min'].includes(model.objective.sense)) return false;
    if (![model.objective.a, model.objective.b].every(Number.isFinite)) return false;
    if (!Array.isArray(model.constraints)) return false;
    return model.constraints.every(r => [r.a,r.b,r.c].every(Number.isFinite) && ['<=','>=','='].includes(normalizeOp(r.op)) && (Math.abs(r.a)>EPS || Math.abs(r.b)>EPS));
  }
  const fullConstraints = m => [...m.constraints.map(r=>({...r,op:normalizeOp(r.op)})), {a:1,b:0,c:0,op:'>=',label:'No negatividad de x'}, {a:0,b:1,c:0,op:'>=',label:'No negatividad de y'}];
  function meets(c,x,y,homogeneous=false) {
    const lhs=c.a*x+c.b*y, rhs=homogeneous?0:c.c;
    const tol=EPS*Math.max(1,Math.abs(lhs),Math.abs(rhs));
    return c.op==='=' ? Math.abs(lhs-rhs)<=tol : c.op==='>=' ? lhs>=rhs-tol : lhs<=rhs+tol;
  }
  function intersection(c,d) {
    const det=c.a*d.b-d.a*c.b;
    if(Math.abs(det)<=EPS*Math.max(1,Math.abs(c.a*d.b),Math.abs(d.a*c.b))) return null;
    const x=(c.c*d.b-d.c*c.b)/det;
    const y=(c.a*d.c-d.a*c.c)/det;
    return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
  }
  function candidates(m) {
    const cs=fullConstraints(m), out=[];
    for(let i=0;i<cs.length;i++) for(let j=i+1;j<cs.length;j++) {
      const p=intersection(cs[i],cs[j]);
      if (p && !out.some(q=>relEq(q.x,p.x) && relEq(q.y,p.y))) out.push(p);
    }
    return out;
  }
  function feasible(m, p) { return fullConstraints(m).every(r=>meets(r,p.x,p.y)); }
  function rayCandidates(m) {
    const cs=fullConstraints(m), rays=[{x:1,y:0},{x:0,y:1}];
    for (const c of cs) {
      for (const d of [{x:c.b,y:-c.a},{x:-c.b,y:c.a}]) {
        const norm=Math.hypot(d.x,d.y);
        if(norm>EPS && d.x>=-EPS && d.y>=-EPS) rays.push({x:Math.max(0,d.x)/norm,y:Math.max(0,d.y)/norm});
      }
    }
    return rays.filter((d,i,arr)=>!arr.slice(0,i).some(q=>relEq(q.x,d.x)&&relEq(q.y,d.y))).filter(d=>cs.every(c=>meets(c,d.x,d.y,true)));
  }
  function solve(m) {
    if(!validModel(m)) return {status:'invalid',reason:'Revisa coeficientes, comparadores y función objetivo.'};
    const points=candidates(m).filter(p=>feasible(m,p)).map(p=>({x:Math.abs(p.x)<EPS?0:p.x,y:Math.abs(p.y)<EPS?0:p.y})).sort((p,q)=>p.x-q.x||p.y-q.y);
    if(!points.length) return {status:'infeasible',vertices:[],rays:[],reason:'No existen puntos que satisfagan todas las restricciones.'};
    const rays=rayCandidates(m), {a,b,sense}=m.objective, sign=sense==='max'?1:-1;
    const improving=rays.find(d=>sign*(a*d.x+b*d.y)>1e-7*Math.max(1,Math.hypot(a,b)));
    const vertices=points.map(p=>({...p,z:a*p.x+b*p.y}));
    if (improving) return {status:'unbounded',vertices,rays,improving,reason:'La función objetivo puede mejorar indefinidamente dentro de la región factible.'};
    const zOpt=sense==='max'?Math.max(...vertices.map(p=>p.z)):Math.min(...vertices.map(p=>p.z));
    const winners=vertices.filter(p=>relEq(p.z,zOpt));
    const flatRay=rays.some(d=>Math.abs(a*d.x+b*d.y)<=1e-7*Math.max(1,Math.hypot(a,b)));
    return {status:(winners.length>1||flatRay)?'multiple':'optimal',vertices,rays,optimalVertices:winners,point:winners[0],value:zOpt,flatRay,reason:(winners.length>1||flatRay)?'Existen varias soluciones que alcanzan el mismo valor óptimo.':'Se encontró una solución óptima finita.'};
  }
  function polygon(m, maxX, maxY) {
    if(!validModel(m)||!Number.isFinite(maxX)||!Number.isFinite(maxY)||maxX<=0||maxY<=0) return [];
    let poly=[{x:0,y:0},{x:maxX,y:0},{x:maxX,y:maxY},{x:0,y:maxY}];
    const clip=(input,r)=>{
      const output=[];if(!input.length)return output;
      // En igualdades usamos las dos desigualdades correspondientes.
      const inside=p=>meets(r,p.x,p.y);
      const onBoundary=(p,q)=>{
        const v1=r.a*p.x+r.b*p.y-r.c,v2=r.a*q.x+r.b*q.y-r.c;
        const denom=v1-v2;
        if(Math.abs(denom)<EPS)return {...p};
        const t=Math.max(0,Math.min(1,v1/denom));
        return {x:p.x+t*(q.x-p.x),y:p.y+t*(q.y-p.y)};
      };
      for(let i=0;i<input.length;i++){
        const curr=input[i], prev=input[(i+input.length-1)%input.length], ci=inside(curr), pi=inside(prev);
        if(ci){if(!pi)output.push(onBoundary(prev,curr));output.push(curr);}
        else if(pi)output.push(onBoundary(prev,curr));
      }
      return output;
    };
    for(const r of fullConstraints(m)) {
      if(r.op==='='){
        poly=clip(poly,{...r,op:'<='});poly=clip(poly,{...r,op:'>='});
      } else poly=clip(poly,r);
      if(!poly.length)break;
    }
    return poly;
  }
  function format(n, digits=3) {
    if(!Number.isFinite(n))return '—';
    const rounded=Math.abs(n)<1e-8?0:Number(n.toFixed(digits));
    return rounded.toLocaleString('es-CO',{maximumFractionDigits:digits});
  }
  const baseline={objective:{a:40000,b:30000,sense:'max'},constraints:[{a:2,b:1,op:'<=',c:100,label:'Horas de trabajo'},{a:1,b:2,op:'<=',c:80,label:'Tableros'}]};
  return {EPS,normalizeOp,intersection,candidates,feasible,rayCandidates,solve,polygon,format,baseline,validModel};
});
