/* Generadores locales de documentos. Sin servicios externos. JSZip se incluye en vendor/. */
(() => {
 'use strict';
 const escXML = v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
 const wP=(text,style='BodyText')=>`<w:p><w:pPr><w:pStyle w:val="${style}"/><w:spacing w:after="125"/></w:pPr><w:r><w:t xml:space="preserve">${escXML(text)}</w:t></w:r></w:p>`;
 const wParagraphs=(text,style='BodyText')=>String(text??'').split(/\r?\n/).map(x=>wP(x||' ',style)).join('');
 const pageBreak='<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
 async function createDocx(sections,{lab,student}){
  if(typeof JSZip==='undefined')throw Error('No está disponible el generador ZIP local.');
  const zip=new JSZip();
  zip.file('[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`);
  zip.file('_rels/.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`);
  zip.file('word/_rels/document.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/></Relationships>`);
  const css=(id,size,color,bold=false,space=120)=>`<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${id}"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="${space}"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="${size}"/><w:color w:val="${color}"/>${bold?'<w:b/>':''}</w:rPr></w:style>`;
  const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/><w:lang w:val="es-CO"/></w:rPr></w:rPrDefault></w:docDefaults>${css('Normal',22,'202F40')}${css('CoverTitle',36,'112A46',true,280)}${css('CoverSubtitle',28,'176B80',true,230)}${css('Heading1',27,'112A46',true,220)}${css('BodyText',21,'233247',false,140)}${css('CoverInfo',23,'233247',false,170)}${css('SmallText',18,'506273',false,130)}</w:styles>`;
  zip.file('word/styles.xml',styles);
  const now=new Date();
  zip.file('docProps/core.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Laboratorio ${escXML(lab)} - Derivados financieros</dc:title><dc:creator>Escuela de Finanzas desde Cero</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now.toISOString()}</dcterms:created></cp:coreProperties>`);
  const headerText=`Laboratorio N.º ${lab} — Derivados financieros | Estudiante: ${student}`;
  zip.file('word/header1.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:pStyle w:val="SmallText"/><w:pBdr><w:bottom w:val="single" w:sz="6" w:color="A9BFCA"/></w:pBdr></w:pPr><w:r><w:t>${escXML(headerText)}</w:t></w:r></w:p></w:hdr>`);
  let body='';
  body+=wP(`ESCUELA DE FINANZAS DESDE CERO`,'CoverSubtitle');
  body+=wP(`LABORATORIO N.º ${lab}`,'CoverTitle');
  body+=wP(`Derivados financieros`,'CoverSubtitle');
  body+=wP('Forward · Futuros · Opciones Call y Put · Swaps','CoverInfo');
  body+=wP(`Estudiante: ${student}`,'CoverInfo');
  body+=wP(`Fecha de generación: ${now.toLocaleString('es-CO')}`,'CoverInfo');
  body+=wP('Mg. Vicky Ruiz','CoverInfo');
  body+=pageBreak;
  for(const s of sections){body+=wP(s.title,'Heading1');for(const line of s.lines)body+=wParagraphs(line,'BodyText');}
  body+=`<w:sectPr><w:headerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1280" w:right="1180" w:bottom="1180" w:left="1180" w:header="600" w:footer="700"/></w:sectPr>`;
  zip.file('word/document.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}</w:body></w:document>`);
  return zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6},mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
 }
 // The PDF generator emits a valid PDF 1.4 with standard WinAnsi Helvetica fonts.
 // It is deliberately local and avoids a CDN dependency on mobile devices.
 const toCp1252=s=>{const mapping={'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159};const out=[];for(const ch of String(s)){const code=ch.codePointAt(0);if(code===10||code===13||code===9||(code>=32&&code<=126)||(code>=160&&code<=255))out.push(code);else if(mapping[ch]!==undefined)out.push(mapping[ch]);else if(code===0x20AC)out.push(128);else if(code===0x2192||code===0x2190)out.push(45);else if(code===0x2264)out.push(60);else if(code===0x2265)out.push(62);else out.push(63);}return new Uint8Array(out);};
 const pdfEscape=s=>String(s).replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');
 function textCmd(text,x,y,size=10,font='F1',color='0.15 0.21 0.29'){
  return `BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm (${pdfEscape(text)}) Tj ET\n`;
 }
 function wrap(text,max=96){const str=String(text??'');if(!str.trim())return [''];const chunks=str.split(/\r?\n/);const result=[];for(const chunk of chunks){let row='';for(const word of chunk.split(/\s+/)){if(!word)continue;if((row+' '+word).trim().length>max&&row){result.push(row);row=word;}else row=row?row+' '+word:word;}result.push(row);}return result;}
 function createPDF(sections,{lab,student}){
  const W=595.28,H=841.89,top=83,bottom=68,left=52;
  const pages=[];let p=null,cy=0;
  const header=()=>`0.07 0.17 0.27 rg 0 ${H-37} ${W} 37 re f\n`+textCmd(`LABORATORIO N.º ${lab}  |  DERIVADOS FINANCIEROS`,left,H-24,9,'F2','1 1 1')+textCmd(`Estudiante: ${student}`,left,H-57,9,'F1','0.29 0.38 0.46');
  function newPage(){p={parts:[header()]};pages.push(p);cy=H-top;}
  function paragraph(txt,style='body'){
   const title=style==='title',size=title?13.2:9.9,leading=title?21:14.4,max=title?64:100;
   const lines=wrap(txt,max);
   if(title&&cy<bottom+55)newPage();
   for(const ln of lines){if(cy<bottom+18)newPage();if(ln){p.parts.push(textCmd(ln,left,cy,size,title?'F2':'F1',title?'0.08 0.24 0.37':'0.17 0.23 0.29'));}cy-=leading;}
   cy-=title?8:6;
  }
  newPage();
  p.parts.push(`0.07 0.17 0.27 rg 0 0 ${W} ${H} re f\n`);
  p.parts.push(`0.76 0.59 0.27 rg ${left} ${H-151} 55 5 re f\n`);
  p.parts.push(textCmd('ESCUELA DE FINANZAS DESDE CERO',left,H-124,12,'F2','0.9 0.94 0.95'));
  p.parts.push(textCmd(`LABORATORIO N.º ${lab}`,left,H-208,24,'F2','1 1 1'));
  p.parts.push(textCmd('Derivados financieros',left,H-255,24,'F2','1 1 1'));
  p.parts.push(textCmd('Forward · Futuros · Opciones Call y Put · Swaps',left,H-295,12,'F1','0.81 0.88 0.92'));
  p.parts.push(textCmd(`Estudiante: ${student}`,left,H-386,13,'F2','1 1 1'));
  p.parts.push(textCmd(`Fecha: ${new Date().toLocaleString('es-CO')}`,left,H-413,11,'F1','0.85 0.9 0.94'));
  p.parts.push(textCmd('Mg. Vicky Ruiz',left,95,11,'F1','0.85 0.9 0.94'));
  newPage();
  for(const sec of sections){paragraph(sec.title,'title');for(const ln of sec.lines)paragraph(ln,'body');}
  const n=pages.length;
  for(let i=0;i<n;i++){const footer=`0.78 0.82 0.86 RG 0.6 w ${left} 51 m ${W-left} 51 l S\n`+textCmd(`Laboratorio ${lab} | ${student}`,left,37,8,'F1','0.38 0.44 0.50')+textCmd(`Página ${i+1} / ${n}`,W-108,37,8,'F1','0.38 0.44 0.50');pages[i].parts.push(footer);}
  const objects=new Map();const addObj=(id,txt)=>objects.set(id,toCp1252(txt));
  addObj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  addObj(3,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  addObj(4,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  let kids=[];
  pages.forEach((page,i)=>{const pageId=5+2*i,contentId=pageId+1,k=`${pageId} 0 R`;kids.push(k);addObj(pageId,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);const stream=page.parts.join('');const streamBytes=toCp1252(stream);const headerBytes=toCp1252(`<< /Length ${streamBytes.length} >>\nstream\n`),footerBytes=toCp1252('\nendstream');const full=new Uint8Array(headerBytes.length+streamBytes.length+footerBytes.length);full.set(headerBytes);full.set(streamBytes,headerBytes.length);full.set(footerBytes,headerBytes.length+streamBytes.length);objects.set(contentId,full);});
  addObj(2,`<< /Type /Pages /Kids [ ${kids.join(' ')} ] /Count ${pages.length} >>`);
  const out=[];let pos=0;function append(bytes){out.push(bytes);pos+=bytes.length;}append(toCp1252('%PDF-1.4\n%âãÏÓ\n'));
  const offsets=[0];const maxId=4+2*pages.length;for(let id=1;id<=maxId;id++){offsets[id]=pos;append(toCp1252(`${id} 0 obj\n`));append(objects.get(id)||toCp1252('<<>>'));append(toCp1252('\nendobj\n'));}
  const xref=pos;append(toCp1252(`xref\n0 ${maxId+1}\n0000000000 65535 f \n`));for(let id=1;id<=maxId;id++)append(toCp1252(`${String(offsets[id]).padStart(10,'0')} 00000 n \n`));append(toCp1252(`trailer\n<< /Size ${maxId+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`));
  return new Blob(out,{type:'application/pdf'});
 }
 function saveBlob(blob,filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 window.EFDCExports={createDocx,createPDF,saveBlob};
})();
