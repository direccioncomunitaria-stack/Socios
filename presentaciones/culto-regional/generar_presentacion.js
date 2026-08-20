const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.defineLayout({ name: "W", width: 13.333, height: 7.5 });
p.layout = "W";

// ---- Palette ----
const NAVY = "12315B";     // deep blue (primary)
const NAVY_D = "0C2444";   // darker navy
const TEAL = "2C7A7B";     // secondary
const GOLD = "C6A15B";     // accent
const GOLD_L = "E4CF9B";
const INK = "1E2A38";      // body text on light
const MUTE = "5C6B7A";     // muted
const LIGHT = "FFFFFF";    // content bg
const ICE = "EAF1F6";      // panel tint
const CREAMLINE = "E7DFCB";

const HEAD = "Cambria";
const BODY = "Calibri";

const W = 13.333, H = 7.5;
const notes = [];

function bg(s, color){ s.background = { color }; }

// gold eyebrow + title block on light slides
function lightHeader(s, eyebrow, title, opts={}){
  const y = opts.y ?? 0.55;
  s.addText(eyebrow.toUpperCase(), { x:0.7, y:y, w:11.9, h:0.3, fontFace:BODY, fontSize:12, bold:true, color:GOLD, charSpacing:2 });
  s.addText(title, { x:0.7, y:y+0.32, w:11.9, h:0.9, fontFace:HEAD, fontSize:opts.size??32, bold:true, color:NAVY, lineSpacing:opts.ls??34 });
}

// small navy circle with a numeral/glyph
function badge(s, x, y, d, txt, fill=NAVY, col=LIGHT){
  s.addShape(p.ShapeType.ellipse, { x, y, w:d, h:d, fill:{color:fill} });
  s.addText(txt, { x, y, w:d, h:d, align:"center", valign:"middle", fontFace:HEAD, fontSize:d>0.7?20:15, bold:true, color:col });
}

/* ============================================================
   SLIDE 1 — PORTADA
============================================================ */
let s = p.addSlide(); bg(s, NAVY);
s.addShape(p.ShapeType.rect, { x:0, y:0, w:W, h:H, fill:{color:NAVY} });
// subtle deco: large faint ring
s.addShape(p.ShapeType.ellipse, { x:9.2, y:-1.6, w:6.5, h:6.5, fill:{color:NAVY_D} });
s.addShape(p.ShapeType.ellipse, { x:10.4, y:4.2, w:4.6, h:4.6, fill:{color:NAVY_D} });

s.addText("MOVIMIENTO MASORTÍ · LITORAL ARGENTINO", { x:0.8, y:0.9, w:9, h:0.35, fontFace:BODY, fontSize:13, bold:true, color:GOLD, charSpacing:2 });
s.addText("Una vida judía regional,\nsostenida entre todos", { x:0.75, y:2.05, w:9.6, h:2.1, fontFace:HEAD, fontSize:46, bold:true, color:LIGHT, lineSpacing:50 });
s.addShape(p.ShapeType.line, { x:0.85, y:4.35, w:2.2, h:0, line:{color:GOLD, width:2.5} });
s.addText("Modelo Regional de Rabinato y Desarrollo Cultural del Litoral", { x:0.8, y:4.55, w:9.4, h:0.6, fontFace:BODY, fontSize:19, color:GOLD_L, italic:true });
s.addText("Una propuesta de la Comunidad Israelita de Santa Fe\na las comunidades judías del Litoral", { x:0.8, y:5.55, w:9.4, h:0.9, fontFace:BODY, fontSize:15, color:"C9D4E0", lineSpacing:22 });
notes.push("Portada. Presentamos la invitación de Santa Fe a las comunidades del Litoral a construir juntas un modelo regional de rabinato y cultura judía, en el marco del Movimiento Masortí.");

/* ============================================================
   SLIDE 2 — EL DESAFÍO COMPARTIDO
============================================================ */
s = p.addSlide(); bg(s, LIGHT);
lightHeader(s, "El punto de partida", "Un desafío que compartimos todas las comunidades");
const challenges = [
  ["Escasez de rabinos", "Cada vez menos rabinos y jazanim para más comunidades. Muchas quedan sin presencia rabínica estable."],
  ["Comunidades dispersas", "Kehilot pequeñas y distantes entre sí, con enorme patrimonio judío y pocos recursos para sostenerlo solas."],
  ["Aislamiento", "El trabajo en soledad debilita: sin agenda común ni red, cada comunidad reinventa todo desde cero."],
  ["Relevo generacional", "Envejecimiento de los socios y jóvenes por convocar. La continuidad judía necesita nuevas manos."],
];
let cy = 1.95;
challenges.forEach((c, i) => {
  const y = cy + i*1.18;
  badge(s, 0.75, y, 0.62, String(i+1), NAVY);
  s.addText(c[0], { x:1.6, y:y-0.05, w:10.9, h:0.4, fontFace:HEAD, fontSize:18, bold:true, color:NAVY });
  s.addText(c[1], { x:1.6, y:y+0.35, w:11.0, h:0.7, fontFace:BODY, fontSize:14, color:MUTE, lineSpacing:18 });
});
notes.push("El desafío no es solo de Santa Fe: es de toda la región. Nombramos los cuatro problemas que compartimos para que cada comunidad se reconozca. La solución también debe ser compartida.");

/* ============================================================
   SLIDE 3 — LA IDEA (section, dark)
============================================================ */
s = p.addSlide(); bg(s, NAVY);
s.addShape(p.ShapeType.ellipse, { x:-1.8, y:3.8, w:6, h:6, fill:{color:NAVY_D} });
s.addText("LA PROPUESTA", { x:0.9, y:1.35, w:11, h:0.4, fontFace:BODY, fontSize:14, bold:true, color:GOLD, charSpacing:3 });
s.addText("Convertir una necesidad\nen una oportunidad", { x:0.85, y:1.85, w:11.5, h:1.7, fontFace:HEAD, fontSize:40, bold:true, color:LIGHT, lineSpacing:46 });
s.addText("Que la presencia rabínica y la vida judía no se agoten en una sola ciudad, sino que irradien a toda la región: Santa Fe se constituye en el nodo de un modelo regional que llega a cada comunidad del Litoral.", { x:0.9, y:4.15, w:10.7, h:1.4, fontFace:BODY, fontSize:19, color:"C9D4E0", lineSpacing:28 });
s.addText("Santa Fe aporta estructura, coordinación y experiencia · las comunidades aportan su historia, su gente y parte del sostén.", { x:0.9, y:5.9, w:10.9, h:0.7, fontFace:BODY, fontSize:14, italic:true, color:GOLD_L, lineSpacing:20 });
notes.push("El corazón del pitch: transformar la escasez y la dispersión en una red. Santa Fe no absorbe a nadie: coordina. Cada comunidad conserva su identidad y aporta lo suyo.");

/* ============================================================
   SLIDE 4 — CÓMO FUNCIONA (hub & spoke)
============================================================ */
s = p.addSlide(); bg(s, LIGHT);
lightHeader(s, "El modelo en una imagen", "Santa Fe, nodo de una red que llega a cada comunidad");
// hub on the left
const hubX=1.15, hubY=2.55, hubD=2.05;
const hcx=hubX+hubD/2, hcy=hubY+hubD/2;
// community pills on the right, 2 cols x 3 rows
const pills = ["Paraná","Basavilbaso","Rafaela","Ceres","Moisés Ville","C. del Uruguay"];
const pW=3.35, pH=0.92;
const colX=[5.15,8.85], rowY=[2.15,3.55,4.95];
const pillPos=[];
pills.forEach((name,i)=>{
  const col=i<3?0:1, row=i%3;
  pillPos.push([colX[col],rowY[row],name]);
});
// draw connecting lines first (behind)
pillPos.forEach(pp=>{
  s.addShape(p.ShapeType.line, { x:hcx, y:hcy, w:(pp[0]-hcx), h:(pp[1]+pH/2-hcy), line:{color:GOLD, width:1.5, dashType:"dash"} });
});
// hub
s.addShape(p.ShapeType.ellipse, { x:hubX, y:hubY, w:hubD, h:hubD, fill:{color:NAVY} });
s.addText("SANTA FE\nNodo regional", { x:hubX, y:hubY, w:hubD, h:hubD, align:"center", valign:"middle", fontFace:HEAD, fontSize:15, bold:true, color:LIGHT, lineSpacing:18 });
// pills on top of lines
pillPos.forEach(pp=>{
  s.addShape(p.ShapeType.roundRect, { x:pp[0], y:pp[1], w:pW, h:pH, rectRadius:0.1, fill:{color:ICE}, line:{color:TEAL, width:1.25} });
  s.addShape(p.ShapeType.ellipse, { x:pp[0]+0.22, y:pp[1]+pH/2-0.11, w:0.22, h:0.22, fill:{color:TEAL} });
  s.addText(pp[2], { x:pp[0]+0.6, y:pp[1], w:pW-0.75, h:pH, valign:"middle", fontFace:BODY, fontSize:14.5, bold:true, color:INK });
});
// bottom explainer caption, clear of the diagram
s.addText([
  {text:"El rabino regional es el motor del modelo.  ", options:{bold:true, color:NAVY}},
  {text:"Sostiene el vínculo con cada comunidad, oficia periódicamente (al menos una vez por mes), promueve una agenda cultural compartida y acompaña a quienes de otro modo quedarían sin presencia rabínica.", options:{color:MUTE}},
], { x:0.7, y:6.3, w:11.95, h:0.95, fontFace:BODY, fontSize:14, lineSpacing:19, valign:"top" });
notes.push("Mostramos gráficamente la lógica hub-and-spoke: Santa Fe en el centro, cada comunidad conectada. La línea punteada = las visitas y el vínculo del rabino regional.");

/* ============================================================
   SLIDE 5 — QUIÉNES SOMOS (stats)
============================================================ */
s = p.addSlide(); bg(s, LIGHT);
lightHeader(s, "El respaldo de Santa Fe", "Una comunidad con estructura para sostener la red");
s.addText("Presente en Santa Fe desde fines del siglo XIX y formalizada en 1915, la Comunidad Israelita de Santa Fe centraliza la vida judía local: religiosa, educativa, social y cultural.", { x:0.7, y:1.9, w:12, h:0.7, fontFace:BODY, fontSize:15, color:INK, lineSpacing:21 });
const stats = [
  ["527","socios activos"],
  ["257","alumnos en la escuela"],
  ["1915","año de formalización"],
  ["30","familias en acción social"],
];
stats.forEach((st,i)=>{
  const x = 0.7 + i*3.02;
  s.addShape(p.ShapeType.roundRect, { x, y:2.95, w:2.8, h:1.7, rectRadius:0.08, fill:{color:ICE} });
  s.addText(st[0], { x, y:3.1, w:2.8, h:0.9, align:"center", fontFace:HEAD, fontSize:40, bold:true, color:NAVY });
  s.addText(st[1], { x:x+0.15, y:4.02, w:2.5, h:0.5, align:"center", fontFace:BODY, fontSize:13, color:MUTE, lineSpacing:16 });
});
s.addText("Escuela en tres niveles · Templo · Museo de la Memoria · 2 cementerios · Departamento de Acción Social · Área de adultos mayores · trabajo conjunto con Macabi · presencia en la Mesa de Diálogo Interreligioso.", { x:0.7, y:5.1, w:12, h:0.9, fontFace:BODY, fontSize:14, color:MUTE, lineSpacing:20 });
s.addText("Ya colaboramos con kehilot hermanas como Paraná y Rafaela. Ahora queremos tejer una red regional.", { x:0.7, y:6.15, w:12, h:0.5, fontFace:BODY, fontSize:14.5, bold:true, italic:true, color:TEAL });
notes.push("Damos credibilidad: Santa Fe tiene la estructura, la trayectoria y los recursos para coordinar. No es una promesa vacía; ya hay colaboración con Paraná y Rafaela.");

/* ============================================================
   SLIDE 6 — QUÉ RECIBEN LAS COMUNIDADES (benefit grid)
============================================================ */
s = p.addSlide(); bg(s, LIGHT);
lightHeader(s, "Qué gana tu comunidad", "Lo que el modelo regional trae a cada kehilá");
const benes = [
  ["Presencia rabínica periódica","Oficios al menos una vez por mes y acompañamiento en las festividades, sin depender de contar con rabino propio."],
  ["Ceremonias y ciclo de vida","Acompañamiento rabínico en simjot, duelos, Bnei Mitzvá y momentos de necesidad de las familias."],
  ["Agenda cultural compartida","Charlas, ciclos de cine, música y jazanut que circulan entre las comunidades de la región."],
  ["Formación de jóvenes","Extender a la región la formación de líderes y vocaciones, conectando a los jóvenes en una red común."],
  ["Cuidado del patrimonio","Acompañamiento para preservar sinagogas, cementerios y archivos históricos de cada comunidad."],
  ["No trabajar en soledad","Pertenecer a una red viva, respaldada institucionalmente e integrada al Movimiento Masortí."],
];
benes.forEach((b,i)=>{
  const col=i%3, row=Math.floor(i/3);
  const x=0.7+col*4.03, y=2.05+row*2.15;
  s.addShape(p.ShapeType.roundRect, { x, y, w:3.85, h:1.95, rectRadius:0.08, fill:{color:ICE} });
  s.addShape(p.ShapeType.ellipse, { x:x+0.28, y:y+0.28, w:0.5, h:0.5, fill:{color:GOLD} });
  s.addText(String(i+1), { x:x+0.28, y:y+0.28, w:0.5, h:0.5, align:"center", valign:"middle", fontFace:HEAD, fontSize:15, bold:true, color:LIGHT });
  s.addText(b[0], { x:x+0.95, y:y+0.26, w:2.7, h:0.6, fontFace:HEAD, fontSize:15, bold:true, color:NAVY, valign:"middle", lineSpacing:17 });
  s.addText(b[1], { x:x+0.28, y:y+0.95, w:3.35, h:0.9, fontFace:BODY, fontSize:12.5, color:MUTE, lineSpacing:16 });
});
notes.push("Slide clave de venta: seis beneficios concretos y tangibles para cada comunidad. Todo está redactado desde el punto de vista de lo que ELLAS reciben.");

/* ============================================================
   SLIDE 7 — DESARROLLO CULTURAL DEL LITORAL
============================================================ */
s = p.addSlide(); bg(s, NAVY);
s.addShape(p.ShapeType.ellipse, { x:9.6, y:-2.2, w:7, h:7, fill:{color:NAVY_D} });
s.addText("MÁS QUE RABINATO", { x:0.85, y:0.75, w:11, h:0.35, fontFace:BODY, fontSize:13, bold:true, color:GOLD, charSpacing:2 });
s.addText("Desarrollo cultural del Litoral", { x:0.8, y:1.15, w:11.5, h:0.8, fontFace:HEAD, fontSize:34, bold:true, color:LIGHT });
s.addText("El Litoral es cuna de la colonización judía agrícola. Las colonias de la JCA dejaron un legado único de sinagogas históricas, cementerios, escuelas y museos. Esa memoria viva merece ser cuidada y puesta en valor.", { x:0.85, y:2.05, w:11.4, h:0.85, fontFace:BODY, fontSize:15, color:"C9D4E0", lineSpacing:21 });
const cult = [
  ["Circuito cultural judío","Un recorrido de memoria y turismo cultural con museos, sinagogas patrimoniales y municipios."],
  ["Agenda compartida","Calendario común de charlas, cine, música y festividades que circula entre las comunidades."],
  ["Preservación del patrimonio","Cuidar sinagogas, cementerios y archivos, en diálogo con el Museo de la Memoria."],
  ["Encuentros regionales","Shabatonim, jaguim y jornadas culturales que reúnen al Litoral y combaten el aislamiento."],
];
cult.forEach((c,i)=>{
  const col=i%2,row=Math.floor(i/2);
  const x=0.85+col*5.75, y=3.15+row*1.75;
  s.addShape(p.ShapeType.roundRect, { x, y, w:5.5, h:1.55, rectRadius:0.07, fill:{color:NAVY_D} });
  s.addText(c[0], { x:x+0.3, y:y+0.2, w:5, h:0.4, fontFace:HEAD, fontSize:16, bold:true, color:GOLD_L });
  s.addText(c[1], { x:x+0.3, y:y+0.62, w:5, h:0.8, fontFace:BODY, fontSize:13, color:"C9D4E0", lineSpacing:17 });
});
notes.push("El modelo no es solo religioso: es cultural y patrimonial. Esto amplía el atractivo para comunidades pequeñas con gran historia (Moisés Ville, Basavilbaso) y abre puertas hacia municipios y turismo.");

/* ============================================================
   SLIDE 8 — EL MAPA REGIONAL (table)
============================================================ */
s = p.addSlide(); bg(s, LIGHT);
lightHeader(s, "El mapa regional", "Las comunidades que integran la red del Litoral");
const rows = [
  [{text:"Comunidad",options:{bold:true,color:LIGHT}},{text:"Ubicación",options:{bold:true,color:LIGHT}},{text:"Desde Santa Fe",options:{bold:true,color:LIGHT}}],
  ["Asoc. Israelita de Paraná","Paraná, Entre Ríos","≈ 30 km · 35–45 min"],
  ["Comunidad Judía de Rafaela","Rafaela, Santa Fe","≈ 100 km · 1 h 20 min"],
  ["Comunidad de Moisés Ville","Moisés Ville, Santa Fe","≈ 170 km · 2 h 20 min"],
  ["Centro Israelita de Basavilbaso","Basavilbaso, Entre Ríos","≈ 225 km · 2 h 45 min"],
  ["Comunidad Judía de Ceres","Ceres, Santa Fe","≈ 270 km · 3 h 20 min"],
  ["Centro Social Israelita Argentino","Concepción del Uruguay, E.R.","≈ 290 km · 3 h 35 min"],
];
const tRows = rows.map((r,ri)=> r.map(c=>{
  const isH = ri===0;
  const cell = (typeof c==="string")?{text:c}:c;
  return { text:cell.text, options:{ fontFace:BODY, fontSize:14, bold:isH?true:(cell.options&&cell.options.bold), color:isH?LIGHT:INK, align:"left", valign:"middle", fill:{color: isH?NAVY:(ri%2===0?ICE:LIGHT)}, margin:[4,8,4,8] } };
}));
s.addTable(tRows, { x:0.7, y:2.0, w:11.95, colW:[4.6,4.05,3.3], rowH:[0.55,0.62,0.62,0.62,0.62,0.62,0.62], border:{type:"solid",color:CREAMLINE,pt:1}, align:"left", valign:"middle" });
s.addText("Seis comunidades del interior de Santa Fe y Entre Ríos, hoy dispersas — mañana, una red.", { x:0.7, y:6.55, w:12, h:0.5, fontFace:BODY, fontSize:14, italic:true, color:TEAL, bold:true });
notes.push("Concretamos el mapa: seis comunidades reales, con distancias razonables. Muestra que la logística es viable y que hay una masa crítica para una red.");

/* ============================================================
   SLIDE 9 — JUVENTUD SIN FRONTERAS
============================================================ */
s = p.addSlide(); bg(s, LIGHT);
lightHeader(s, "Futuro", "Formación y juventud sin fronteras");
s.addText("La continuidad judía depende de que cada generación tenga nuevas manos dispuestas a sostenerla. Conectamos a los pocos jóvenes de cada comunidad en una red común y acompañamos las vocaciones.", { x:0.7, y:1.95, w:12, h:0.8, fontFace:BODY, fontSize:15.5, color:INK, lineSpacing:22 });
// ladder
const steps = ["Janij\n(participante)","Madrij\n(guía)","Moré/Morá\nde Talmud Torá","Voluntario\nreferente","Camino del\nSeminario"];
steps.forEach((st,i)=>{
  const x=0.7+i*2.45;
  s.addShape(p.ShapeType.roundRect, { x, y:3.1, w:2.15, h:1.5, rectRadius:0.08, fill:{color: i===steps.length-1?NAVY:ICE} });
  s.addText(st, { x, y:3.1, w:2.15, h:1.5, align:"center", valign:"middle", fontFace:HEAD, fontSize:14, bold:true, color: i===steps.length-1?LIGHT:NAVY, lineSpacing:17 });
  if(i<steps.length-1){ s.addShape(p.ShapeType.chevron, { x:x+2.16, y:3.68, w:0.3, h:0.34, fill:{color:GOLD} }); }
});
s.addText("Una escalera de crecimiento — del participante al conductor de la vida judía — tendiendo puentes con el Seminario Rabínico Latinoamericano Marshall T. Meyer, casa de formación de nuestros futuros rabinos y jazanim.", { x:0.7, y:5.15, w:12, h:1.0, fontFace:BODY, fontSize:14.5, color:MUTE, lineSpacing:21 });
notes.push("La red no es solo para hoy: forma a la próxima generación de líderes y rabinos regionales, asegurando continuidad. La escalera muestra un camino claro para los jóvenes.");

/* ============================================================
   SLIDE 10 — CÓMO SE SOSTIENE
============================================================ */
s = p.addSlide(); bg(s, LIGHT);
lightHeader(s, "Cómo se sostiene", "Un proyecto compartido, también en el sostén");
s.addText("El modelo se financia entre todos, de manera proporcional al beneficio que cada comunidad recibe. Santa Fe asume el peso central; las comunidades de la región co-financian al rabino regional, que es quien las acompaña.", { x:0.7, y:1.9, w:12, h:0.85, fontFace:BODY, fontSize:15, color:INK, lineSpacing:21 });
const cols = [
  ["Santa Fe", "Asume el rabino central, la secretaría, la estructura y la coordinación de toda la red.", NAVY, LIGHT],
  ["Las comunidades de la región", "Aportan al rabino regional un monto acordado y sus viáticos de traslado, según su realidad.", TEAL, LIGHT],
  ["El Movimiento Masortí", "Marco institucional, formación y respaldo: la red no se sostiene en soledad.", GOLD, INK],
];
cols.forEach((c,i)=>{
  const x=0.7+i*4.03;
  s.addShape(p.ShapeType.roundRect, { x, y:2.95, w:3.85, h:2.9, rectRadius:0.08, fill:{color:c[2]} });
  s.addText(c[0], { x:x+0.3, y:3.2, w:3.25, h:0.75, fontFace:HEAD, fontSize:18, bold:true, color:c[3], lineSpacing:20 });
  s.addShape(p.ShapeType.line, { x:x+0.3, y:4.02, w:1.0, h:0, line:{color:c[3], width:1.5, transparency:40} });
  s.addText(c[1], { x:x+0.3, y:4.2, w:3.3, h:1.5, fontFace:BODY, fontSize:14, color:c[3], lineSpacing:19 });
});
s.addText("El aporte de las comunidades reduce el costo neto de cada una y hace posible lo que ninguna podría sola.", { x:0.7, y:6.15, w:12, h:0.5, fontFace:BODY, fontSize:14.5, italic:true, bold:true, color:TEAL });
notes.push("Transparencia sobre el dinero, sin cifras que asusten. El mensaje: el aporte es proporcional y compartido; juntos accedemos a lo que en soledad es imposible. Los montos exactos se acuerdan con cada comunidad.");

/* ============================================================
   SLIDE 11 — RESPALDO DEL MOVIMIENTO
============================================================ */
s = p.addSlide(); bg(s, LIGHT);
lightHeader(s, "No estamos solos", "Respaldados por el Movimiento Masortí");
s.addText("La Kehilá de Santa Fe se reconoce como una comunidad masortí activa y comprometida del interior. Este vínculo es una garantía para toda la red: un marco con sentido, sostenido institucionalmente.", { x:0.7, y:1.95, w:12, h:0.8, fontFace:BODY, fontSize:15, color:INK, lineSpacing:21 });
const orgs = [
  ["Seminario Rabínico Latinoamericano","Marshall T. Meyer — casa de formación de rabinos y jazanim."],
  ["Asamblea Rabínica","El marco rabínico del Movimiento Masortí en la región."],
  ["Marom","El movimiento juvenil masortí, para la formación de los jóvenes."],
  ["Masortí AmLat / Olami","La red del judaísmo masortí en América Latina y el mundo."],
];
orgs.forEach((o,i)=>{
  const col=i%2,row=Math.floor(i/2);
  const x=0.7+col*6.05, y=3.0+row*1.55;
  s.addShape(p.ShapeType.roundRect, { x, y, w:5.8, h:1.35, rectRadius:0.07, fill:{color:ICE} });
  s.addShape(p.ShapeType.ellipse, { x:x+0.3, y:y+0.38, w:0.6, h:0.6, fill:{color:NAVY} });
  s.addText("✡", { x:x+0.3, y:y+0.38, w:0.6, h:0.6, align:"center", valign:"middle", fontSize:18, color:GOLD });
  s.addText(o[0], { x:x+1.1, y:y+0.24, w:4.5, h:0.45, fontFace:HEAD, fontSize:16, bold:true, color:NAVY, valign:"middle" });
  s.addText(o[1], { x:x+1.1, y:y+0.68, w:4.5, h:0.55, fontFace:BODY, fontSize:12.5, color:MUTE, lineSpacing:16 });
});
notes.push("Reducimos el riesgo percibido: la propuesta no depende solo de Santa Fe, está integrada al Movimiento Masortí y sus instituciones. Eso da continuidad y seriedad.");

/* ============================================================
   SLIDE 12 — PRÓXIMOS PASOS
============================================================ */
s = p.addSlide(); bg(s, LIGHT);
lightHeader(s, "Cómo empezamos", "Próximos pasos, juntos");
const steps2 = [
  ["Sumarse a la conversación","Que cada comunidad interesada se incorpore al diálogo y comparta sus necesidades y su realidad."],
  ["Definir aporte y agenda","Acordar el aporte de cada comunidad y armar un primer calendario de visitas y actividades compartidas."],
  ["Primeras visitas y Shabatonim","Comenzar con oficios, charlas y encuentros regionales que pongan el modelo en marcha."],
  ["Lanzar el circuito cultural","Poner en valor el patrimonio del Litoral y proyectarlo hacia la sociedad y las nuevas generaciones."],
];
steps2.forEach((st,i)=>{
  const y=2.0+i*1.15;
  badge(s, 0.75, y, 0.7, String(i+1), i%2?TEAL:NAVY);
  s.addText(st[0], { x:1.7, y:y-0.02, w:10.9, h:0.45, fontFace:HEAD, fontSize:18, bold:true, color:NAVY });
  s.addText(st[1], { x:1.7, y:y+0.42, w:10.9, h:0.6, fontFace:BODY, fontSize:14, color:MUTE, lineSpacing:18 });
});
notes.push("Damos un camino de acción concreto y de baja barrera de entrada. El primer paso solo pide sumarse a conversar: fácil decir que sí.");

/* ============================================================
   SLIDE 13 — CIERRE
============================================================ */
s = p.addSlide(); bg(s, NAVY);
s.addShape(p.ShapeType.ellipse, { x:-2, y:-2.2, w:6.5, h:6.5, fill:{color:NAVY_D} });
s.addShape(p.ShapeType.ellipse, { x:9.5, y:3.8, w:6, h:6, fill:{color:NAVY_D} });
s.addText("✡", { x:0, y:1.2, w:W, h:0.6, align:"center", fontSize:26, color:GOLD });
s.addText("Hagamos del Litoral la capital\nde una vida judía regional viva", { x:1, y:2.15, w:11.3, h:1.8, align:"center", fontFace:HEAD, fontSize:36, bold:true, color:LIGHT, lineSpacing:44 });
s.addText("Sostenida entre todos, con proyección cultural y en sintonía con el Movimiento Masortí.\nEs, en definitiva, una apuesta por el futuro judío del Litoral.", { x:1.4, y:4.25, w:10.5, h:1.0, align:"center", fontFace:BODY, fontSize:16, color:"C9D4E0", lineSpacing:24 });
s.addShape(p.ShapeType.line, { x:5.4, y:5.55, w:2.5, h:0, line:{color:GOLD, width:2} });
s.addText("Comunidad Israelita de Santa Fe · Área de Culto", { x:1, y:5.8, w:11.3, h:0.4, align:"center", fontFace:BODY, fontSize:15, bold:true, color:GOLD_L });
s.addText("Los invitamos a construir esta red juntos.", { x:1, y:6.25, w:11.3, h:0.4, align:"center", fontFace:BODY, fontSize:14, italic:true, color:"C9D4E0" });
notes.push("Cierre emotivo y llamado a la acción. La frase central es la visión compartida; la última línea es la invitación explícita a sumarse.");

// attach notes
p.slides.forEach((sl, i)=> notes[i] && sl.addNotes(notes[i]));

p.writeFile({ fileName: "Modelo_Regional_Culto_Litoral.pptx" }).then(f=>console.log("WROTE", f));
