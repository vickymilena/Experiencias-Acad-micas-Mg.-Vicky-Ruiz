const assert=require('node:assert/strict');
const L=require('./model.js');
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-6,`${actual} no coincide con ${expected}`);
const test=(name,model,status,x,y,z)=>{
 const r=L.solve(model);assert.equal(r.status,status,`${name}: ${r.reason}`);
 if(x!==undefined){near(r.point.x,x);near(r.point.y,y);near(r.value,z);}
 console.log('✓',name,':',status, r.point?`(${L.format(r.point.x)}, ${L.format(r.point.y)}) Z=${L.format(r.value)}`:'');
};
test('Carpintería original',L.baseline,'optimal',40,20,2200000);
test('Carpintería +30 tableros',{...L.baseline,constraints:[L.baseline.constraints[0],{...L.baseline.constraints[1],c:110}]},'optimal',30,40,2400000);
test('Maximización del reto',{objective:{a:45,b:35,sense:'max'},constraints:[{a:3,b:2,c:120,op:'<='},{a:1,b:2,c:80,op:'<='}]},'optimal',20,30,1950);
test('Minimización del reto',{objective:{a:30,b:20,sense:'min'},constraints:[{a:3,b:1,c:30,op:'>='},{a:1,b:2,c:24,op:'>='}]},'optimal',7.2,8.4,384);
test('Infactibilidad',{objective:{a:1,b:1,sense:'max'},constraints:[{a:1,b:1,c:2,op:'<='},{a:1,b:1,c:5,op:'>='}]},'infeasible');
test('No acotado',{objective:{a:2,b:1,sense:'max'},constraints:[{a:1,b:1,c:4,op:'>='}]},'unbounded');
test('Múltiples óptimos en arista',{objective:{a:1,b:1,sense:'max'},constraints:[{a:1,b:1,c:10,op:'<='}]},'multiple');
test('Múltiples óptimos en rayo',{objective:{a:1,b:0,sense:'max'},constraints:[{a:1,b:0,c:5,op:'<='}]},'multiple');
test('Región no acotada con mínimo finito',{objective:{a:1,b:1,sense:'min'},constraints:[{a:1,b:1,c:5,op:'>='}]},'multiple');
test('Máximo acotado en región no acotada',{objective:{a:-1,b:-2,sense:'max'},constraints:[{a:1,b:1,c:3,op:'>='}]},'optimal',3,0,-3);
test('Restricción de igualdad',{objective:{a:1,b:0,sense:'max'},constraints:[{a:1,b:1,c:10,op:'='}]},'optimal',10,0,10);
test('Solo no negatividad y minimización',{objective:{a:1,b:2,sense:'min'},constraints:[]},'optimal',0,0,0);
assert.equal(L.solve({objective:{a:1,b:1,sense:'max'},constraints:[{a:0,b:0,c:3,op:'<='}]}).status,'invalid');
assert.equal(L.feasible(L.baseline,{x:50,y:50}),false);
assert.equal(L.feasible(L.baseline,{x:40,y:20}),true);
console.log('Todas las pruebas pasaron.');
